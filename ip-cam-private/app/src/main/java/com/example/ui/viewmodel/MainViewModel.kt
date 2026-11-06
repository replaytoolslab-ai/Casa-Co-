package com.example.ui.viewmodel

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.net.Uri
import android.os.BatteryManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.camera.CameraManager
import com.example.camera.QrCodeUtil
import com.example.media.CentralStorageManager
import com.example.media.VideoRecordingEngine
import com.example.model.AppMode
import com.example.model.AppScreen
import com.example.model.CameraDevice
import com.example.model.MediaItem
import com.example.network.CameraControlApi
import com.example.network.LanDiscovery
import com.example.network.StreamClient
import com.example.network.StreamServer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs: SharedPreferences = application.getSharedPreferences("ip_cam_private_prefs", Context.MODE_PRIVATE)
    val storageManager = CentralStorageManager(application)
    val lanDiscovery = LanDiscovery(application)
    val cameraManager = CameraManager(application)

    // Current Mode & Navigation
    private val _currentMode = MutableStateFlow(AppMode.CONTROL)
    val currentMode: StateFlow<AppMode> = _currentMode.asStateFlow()

    private val _currentScreen = MutableStateFlow<AppScreen>(AppScreen.Dashboard)
    val currentScreen: StateFlow<AppScreen> = _currentScreen.asStateFlow()

    private val screenBackstack = mutableListOf<AppScreen>()

    // === CONTROLLO STATE ===
    private val _pairedCameras = MutableStateFlow<List<CameraDevice>>(emptyList())
    val pairedCameras: StateFlow<List<CameraDevice>> = _pairedCameras.asStateFlow()

    private val _discoveredCameras = MutableStateFlow<List<CameraDevice>>(emptyList())
    val discoveredCameras: StateFlow<List<CameraDevice>> = _discoveredCameras.asStateFlow()

    private val _galleryMedia = MutableStateFlow<List<MediaItem>>(emptyList())
    val galleryMedia: StateFlow<List<MediaItem>> = _galleryMedia.asStateFlow()

    private val _storageStats = MutableStateFlow<CentralStorageManager.StorageStats?>(null)
    val storageStats: StateFlow<CentralStorageManager.StorageStats?> = _storageStats.asStateFlow()

    private val _activeDetailCameraId = MutableStateFlow<String?>(null)
    val activeDetailCameraId: StateFlow<String?> = _activeDetailCameraId.asStateFlow()

    private val _userFeedbackMessage = MutableStateFlow<String?>(null)
    val userFeedbackMessage: StateFlow<String?> = _userFeedbackMessage.asStateFlow()

    // Active streams & recorders (Key: Camera ID)
    private val streamClients = ConcurrentHashMap<String, StreamClient>()
    private val activeRecorders = ConcurrentHashMap<String, VideoRecordingEngine>()
    private val latestBitmaps = ConcurrentHashMap<String, Bitmap>()
    private val latestJpegBytes = ConcurrentHashMap<String, ByteArray>()

    // Live frame state for active detail view
    private val _detailFrameBitmap = MutableStateFlow<Bitmap?>(null)
    val detailFrameBitmap: StateFlow<Bitmap?> = _detailFrameBitmap.asStateFlow()

    private val _detailFps = MutableStateFlow(0f)
    val detailFps: StateFlow<Float> = _detailFps.asStateFlow()

    private val _detailBitrate = MutableStateFlow(0f)
    val detailBitrate: StateFlow<Float> = _detailBitrate.asStateFlow()

    // === TELECAMERA STATE ===
    private val _cameraName = MutableStateFlow(prefs.getString("cam_name", "Telecamera 1") ?: "Telecamera 1")
    val cameraName: StateFlow<String> = _cameraName.asStateFlow()

    private val _securityPin = MutableStateFlow(prefs.getString("cam_pin", generateRandomPin()) ?: "123-456")
    val securityPin: StateFlow<String> = _securityPin.asStateFlow()

    private val _securityToken = MutableStateFlow(prefs.getString("cam_token", UUID.randomUUID().toString()) ?: UUID.randomUUID().toString())
    val securityToken: StateFlow<String> = _securityToken.asStateFlow()

    private val _isServerRunning = MutableStateFlow(false)
    val isServerRunning: StateFlow<Boolean> = _isServerRunning.asStateFlow()

    private val _connectedClientsCount = MutableStateFlow(0)
    val connectedClientsCount: StateFlow<Int> = _connectedClientsCount.asStateFlow()

    private val _localIpAddress = MutableStateFlow("127.0.0.1")
    val localIpAddress: StateFlow<String> = _localIpAddress.asStateFlow()

    private val _qrBitmap = MutableStateFlow<Bitmap?>(null)
    val qrBitmap: StateFlow<Bitmap?> = _qrBitmap.asStateFlow()

    private val _isStealthMode = MutableStateFlow(false)
    val isStealthMode: StateFlow<Boolean> = _isStealthMode.asStateFlow()

    private val _isCameraTorchOn = MutableStateFlow(false)
    val isCameraTorchOn: StateFlow<Boolean> = _isCameraTorchOn.asStateFlow()

    private val _isCameraFacingFront = MutableStateFlow(false)
    private val _remoteSwitchRequest = MutableStateFlow(0)
    val remoteSwitchRequest: StateFlow<Int> = _remoteSwitchRequest.asStateFlow()
    val isCameraFacingFront: StateFlow<Boolean> = _isCameraFacingFront.asStateFlow()

    private var streamServer: StreamServer? = null
    private var healthCheckJob: Job? = null
    private var recordingTimerJob: Job? = null

    init {
        // Restore saved mode
        val savedMode = prefs.getString("saved_app_mode", AppMode.CONTROL.name)
        _currentMode.value = if (savedMode == AppMode.CAMERA.name) AppMode.CAMERA else AppMode.CONTROL

        loadPairedCameras()
        refreshGallery()
        refreshStorageStats()
        startLanDiscoveryListener()
        startHealthChecker()
        startRecordingTimer()

        // Init local IP & QR for camera mode
        _localIpAddress.value = StreamServer.getLocalIpAddress()
        generateQrCode()

        cameraManager.initialize {
            // ready
        }
    }

    fun setAppMode(mode: AppMode) {
        _currentMode.value = mode
        prefs.edit().putString("saved_app_mode", mode.name).apply()
        if (mode == AppMode.CONTROL) {
            stopCameraTransmitter()
            _currentScreen.value = AppScreen.Dashboard
            startLanDiscoveryListener()
            reconnectAllStreams()
        } else {
            // Camera mode
            disconnectAllStreams()
            lanDiscovery.stopListening()
            _currentScreen.value = AppScreen.Dashboard
            startCameraTransmitter()
        }
    }

    fun navigateTo(screen: AppScreen) {
        screenBackstack.add(_currentScreen.value)
        _currentScreen.value = screen
        if (screen is AppScreen.LiveDetail) {
            _activeDetailCameraId.value = screen.cameraId
            connectStreamForCamera(screen.cameraId)
        }
    }

    fun navigateBack(): Boolean {
        if (screenBackstack.isNotEmpty()) {
            val previous = screenBackstack.removeAt(screenBackstack.size - 1)
            _currentScreen.value = previous
            if (previous !is AppScreen.LiveDetail) {
                _activeDetailCameraId.value = null
            }
            return true
        }
        return false
    }

    fun showFeedback(msg: String) {
        _userFeedbackMessage.value = msg
        viewModelScope.launch {
            delay(3500)
            if (_userFeedbackMessage.value == msg) {
                _userFeedbackMessage.value = null
            }
        }
    }

    // =========================================================================
    // CONTROLLO: CAMERA MANAGEMENT & STREAMING
    // =========================================================================

    private fun loadPairedCameras() {
        val jsonStr = prefs.getString("paired_cameras_json", null)
        if (!jsonStr.isNullOrBlank()) {
            try {
                val array = JSONArray(jsonStr)
                val list = mutableListOf<CameraDevice>()
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    list.add(
                        CameraDevice(
                            id = obj.getString("id"),
                            name = obj.getString("name"),
                            host = obj.getString("host"),
                            port = obj.optInt("port", 8888),
                            securityToken = obj.optString("securityToken", ""),
                            securityPin = obj.optString("securityPin", "")
                        )
                    )
                }
                _pairedCameras.value = list
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun savePairedCameras() {
        try {
            val array = JSONArray()
            for (cam in _pairedCameras.value) {
                val obj = JSONObject().apply {
                    put("id", cam.id)
                    put("name", cam.name)
                    put("host", cam.host)
                    put("port", cam.port)
                    put("securityToken", cam.securityToken)
                    put("securityPin", cam.securityPin)
                }
                array.put(obj)
            }
            prefs.edit().putString("paired_cameras_json", array.toString()).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun addCamera(name: String, host: String, port: Int = 8888, pin: String = "", token: String = "") {
        val existing = _pairedCameras.value.find { it.host == host && it.port == port }
        if (existing != null) {
            showFeedback("Telecamera già presente: ${existing.name}")
            return
        }

        val newCam = CameraDevice(
            id = UUID.randomUUID().toString(),
            name = if (name.isNotBlank()) name else "Telecamera ${_pairedCameras.value.size + 1}",
            host = host.trim(),
            port = port,
            securityPin = pin.trim(),
            securityToken = if (token.isNotBlank()) token.trim() else pin.trim(),
            isOnline = false
        )

        _pairedCameras.update { it + newCam }
        savePairedCameras()
        connectStreamForCamera(newCam.id)
        showFeedback("Telecamera aggiunta con successo!")
    }

    fun removeCamera(cameraId: String) {
        stopRecording(cameraId)
        streamClients[cameraId]?.stop()
        streamClients.remove(cameraId)
        latestBitmaps.remove(cameraId)
        latestJpegBytes.remove(cameraId)

        _pairedCameras.update { list -> list.filterNot { it.id == cameraId } }
        savePairedCameras()
        showFeedback("Telecamera rimossa.")
    }

    fun updateCameraName(cameraId: String, newName: String) {
        _pairedCameras.update { list ->
            list.map { if (it.id == cameraId) it.copy(name = newName) else it }
        }
        savePairedCameras()
    }

    private fun startLanDiscoveryListener() {
        lanDiscovery.startListening { found ->
            viewModelScope.launch {
                // If not already paired, put in discovered list
                val alreadyPaired = _pairedCameras.value.any { it.host == found.host && it.port == found.port }
                if (!alreadyPaired) {
                    _discoveredCameras.update { current ->
                        val filtered = current.filterNot { it.host == found.host && it.port == found.port }
                        filtered + found
                    }
                } else {
                    // Update online status of paired camera
                    _pairedCameras.update { current ->
                        current.map { cam ->
                            if (cam.host == found.host && cam.port == found.port) {
                                cam.copy(isOnline = true, lastSeenTimestamp = System.currentTimeMillis())
                            } else cam
                        }
                    }
                }
            }
        }
    }

    fun pairDiscoveredCamera(discovered: CameraDevice) {
        addCamera(
            name = discovered.name,
            host = discovered.host,
            port = discovered.port,
            pin = discovered.securityPin,
            token = discovered.securityToken
        )
        _discoveredCameras.update { list -> list.filterNot { it.id == discovered.id } }
    }

    fun parseAndAddFromQr(qrContent: String): Boolean {
        return try {
            // Format: ipcam://host:port?token=xyz&pin=123&name=Ingresso
            if (qrContent.startsWith("ipcam://")) {
                val clean = qrContent.removePrefix("ipcam://")
                val hostPort = clean.substringBefore("?")
                val query = clean.substringAfter("?", "")

                val host = hostPort.substringBefore(":")
                val port = hostPort.substringAfter(":", "8888").toIntOrNull() ?: 8888

                val params = query.split("&").associate {
                    val kv = it.split("=")
                    if (kv.size == 2) kv[0] to kv[1] else kv[0] to ""
                }

                val name = params["name"]?.replace("+", " ") ?: "Telecamera QR"
                val token = params["token"] ?: ""
                val pin = params["pin"] ?: ""

                addCamera(name, host, port, pin, token)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun connectStreamForCamera(cameraId: String) {
        val cam = _pairedCameras.value.find { it.id == cameraId } ?: return

        // If client doesn't exist, create and start
        if (!streamClients.containsKey(cameraId)) {
            val client = StreamClient(
                host = cam.host,
                port = cam.port,
                securityToken = cam.securityToken.ifEmpty { cam.securityPin }
            ) { bitmap, jpegBytes ->
                latestBitmaps[cameraId] = bitmap
                latestJpegBytes[cameraId] = jpegBytes

                // Forward to active recorder if recording
                activeRecorders[cameraId]?.enqueueFrame(bitmap)

                // If currently viewing in detail, update detail state
                if (_activeDetailCameraId.value == cameraId) {
                    _detailFrameBitmap.value = bitmap
                    streamClients[cameraId]?.let { sc ->
                        _detailFps.value = sc.currentFps.value
                        _detailBitrate.value = sc.bitrateKbps.value
                    }
                }
            }
            streamClients[cameraId] = client
            client.start()
        }
    }

    private fun reconnectAllStreams() {
        _pairedCameras.value.forEach { cam ->
            connectStreamForCamera(cam.id)
        }
    }

    private fun disconnectAllStreams() {
        streamClients.values.forEach { it.stop() }
        streamClients.clear()
        latestBitmaps.clear()
        latestJpegBytes.clear()
        _detailFrameBitmap.value = null
    }

    fun getLatestBitmap(cameraId: String): Bitmap? = latestBitmaps[cameraId]

    // =========================================================================
    // CONTROLLO: CENTRALIZED RECORDING & SNAPSHOTS (ARCHIVIO CENTRALIZZATO)
    // =========================================================================

    /**
     * Toggles recording for a specific camera.
     * Saved exclusively on CONTROLLO in Movies/IP CAM PRIVATE/<camera_name>_<date>.mp4
     */
    fun toggleRecording(cameraId: String) {
        val cam = _pairedCameras.value.find { it.id == cameraId } ?: return
        if (cam.isRecording) {
            stopRecording(cameraId)
        } else {
            startRecording(cameraId)
        }
    }

    fun startRecording(cameraId: String) {
        val cam = _pairedCameras.value.find { it.id == cameraId } ?: return
        if (activeRecorders.containsKey(cameraId)) return

        viewModelScope.launch {
            val engine = VideoRecordingEngine(
                storageManager = storageManager,
                cameraName = cam.name
            )
            val success = engine.start()
            if (success) {
                activeRecorders[cameraId] = engine
                _pairedCameras.update { list ->
                    list.map { if (it.id == cameraId) it.copy(isRecording = true, recordingDurationSeconds = 0L) else it }
                }
                showFeedback("Registrazione avviata per ${cam.name} (Salvataggio su CONTROLLO)")
            } else {
                showFeedback("Errore avvio registrazione per ${cam.name}")
            }
        }
    }

    fun stopRecording(cameraId: String) {
        val engine = activeRecorders.remove(cameraId) ?: return
        viewModelScope.launch {
            val savedUri = engine.stop()
            _pairedCameras.update { list ->
                list.map { if (it.id == cameraId) it.copy(isRecording = false, recordingDurationSeconds = 0L) else it }
            }
            refreshGallery()
            refreshStorageStats()
            if (savedUri != null) {
                showFeedback("Video salvato in Movies/IP CAM PRIVATE/")
            }
        }
    }

    /**
     * Takes snapshot from camera feed on CONTROLLO and saves to Pictures/IP CAM PRIVATE/
     */
    fun takeSnapshot(cameraId: String) {
        val cam = _pairedCameras.value.find { it.id == cameraId } ?: return

        viewModelScope.launch {
            val jpeg = latestJpegBytes[cameraId]
            val bitmap = latestBitmaps[cameraId]

            val uri: Uri? = if (jpeg != null) {
                storageManager.savePhoto(cam.name, jpeg)
            } else if (bitmap != null) {
                storageManager.savePhotoBitmap(cam.name, bitmap)
            } else {
                // Try fetching directly via HTTP API
                val remoteJpeg = CameraControlApi.fetchSnapshot(cam)
                if (remoteJpeg != null) {
                    storageManager.savePhoto(cam.name, remoteJpeg)
                } else null
            }

            if (uri != null) {
                refreshGallery()
                refreshStorageStats()
                showFeedback("Foto salvata in Pictures/IP CAM PRIVATE/")
            } else {
                showFeedback("Impossibile acquisire foto: nessun fotogramma disponibile.")
            }
        }
    }

    // Remote Camera Controls
    fun toggleRemoteTorch(cameraId: String) {
        val cam = _pairedCameras.value.find { it.id == cameraId } ?: return
        viewModelScope.launch {
            val newState = !cam.isTorchOn
            val ok = CameraControlApi.toggleTorch(cam, newState)
            if (ok) {
                _pairedCameras.update { list ->
                    list.map { if (it.id == cameraId) it.copy(isTorchOn = newState) else it }
                }
            }
        }
    }

    fun setRemoteNightMode(cameraId: String, enabled: Boolean) {
        val cam = _pairedCameras.value.find { it.id == cameraId } ?: return
        viewModelScope.launch {
            if (CameraControlApi.setNightMode(cam, enabled)) {
                showFeedback(if (enabled) "Modalità notte attivata." else "Modalità notte disattivata.")
            } else showFeedback("Comando modalità notte non riuscito.")
        }
    }

    fun setRemoteExposure(cameraId: String, value: Int) {
        val cam = _pairedCameras.value.find { it.id == cameraId } ?: return
        viewModelScope.launch {
            if (!CameraControlApi.setExposure(cam, value)) {
                showFeedback("Regolazione esposizione non riuscita.")
            }
        }
    }

    fun switchRemoteCameraFacing(cameraId: String) {
        val cam = _pairedCameras.value.find { it.id == cameraId } ?: return
        viewModelScope.launch {
            val ok = CameraControlApi.switchCamera(cam)
            if (ok) {
                val newFacing = if (cam.facing == "BACK") "FRONT" else "BACK"
                _pairedCameras.update { list ->
                    list.map { if (it.id == cameraId) it.copy(facing = newFacing) else it }
                }
                showFeedback("Inversione telecamera inviata.")
            }
        }
    }

    // Central Gallery
    fun refreshGallery() {
        viewModelScope.launch {
            val items = storageManager.loadAllMedia()
            _galleryMedia.value = items
        }
    }

    fun refreshStorageStats() {
        viewModelScope.launch {
            val stats = storageManager.getStorageStats()
            _storageStats.value = stats
        }
    }

    fun deleteMedia(item: MediaItem) {
        viewModelScope.launch {
            val ok = storageManager.deleteMedia(item.uri)
            if (ok) {
                refreshGallery()
                refreshStorageStats()
                showFeedback("File eliminato dall'archivio.")
            }
        }
    }

    // =========================================================================
    // TELECAMERA (TRANSMITTER): SERVER & CAMERAX CONTROL
    // =========================================================================

    fun startCameraTransmitter() {
        if (_isServerRunning.value) return

        val port = 8888
        _localIpAddress.value = StreamServer.getLocalIpAddress()
        generateQrCode()

        streamServer = StreamServer(
            port = port,
            cameraName = _cameraName.value,
            securityToken = _securityToken.value,
            securityPin = _securityPin.value,
            onControlAction = { action, value ->
                when (action) {
                    "torch" -> {
                        val turnOn = value == "on"
                        cameraManager.toggleTorch(turnOn)
                        _isCameraTorchOn.value = turnOn
                    }
                    "switch_camera" -> {
                        // Switch camera triggered remotely
                        // Handled when preview restarts
                    }
                }
            }
        )

        val started = streamServer?.start() ?: false
        _isServerRunning.value = started

        if (started) {
            // Start LAN Discovery broadcast beacon
            lanDiscovery.startBeacon(
                id = UUID.randomUUID().toString(),
                name = _cameraName.value,
                port = port,
                token = _securityToken.value,
                pin = _securityPin.value
            )
        }
    }

    fun stopCameraTransmitter() {
        streamServer?.stop()
        streamServer = null
        lanDiscovery.stopBeacon()
        cameraManager.stop()
        _isServerRunning.value = false
        _connectedClientsCount.value = 0
    }

    fun onNewCameraFrame(jpegBytes: ByteArray, bitmap: Bitmap) {
        streamServer?.onNewFrame(jpegBytes)
        // Also update connected clients count
        streamServer?.let {
            _connectedClientsCount.value = it.connectedClientsCount.get()
        }
    }

    fun updateCameraDeviceName(name: String) {
        _cameraName.value = name
        prefs.edit().putString("cam_name", name).apply()
        streamServer?.cameraName = name
        generateQrCode()
    }

    fun regenerateSecurityPin() {
        val newPin = generateRandomPin()
        val newToken = UUID.randomUUID().toString()
        _securityPin.value = newPin
        _securityToken.value = newToken
        prefs.edit().putString("cam_pin", newPin).putString("cam_token", newToken).apply()
        streamServer?.securityPin = newPin
        streamServer?.securityToken = newToken
        generateQrCode()
    }

    fun toggleStealthMode() {
        _isStealthMode.value = !_isStealthMode.value
    }

    fun toggleLocalTorch() {
        cameraManager.toggleTorch()
        _isCameraTorchOn.value = cameraManager.isTorchEnabled
        streamServer?.isTorchEnabled = cameraManager.isTorchEnabled
    }

    private fun generateQrCode() {
        val ip = _localIpAddress.value
        val nameEnc = _cameraName.value.replace(" ", "+")
        val content = "ipcam://$ip:8888?token=${_securityToken.value}&pin=${_securityPin.value}&name=$nameEnc"
        val bmp = QrCodeUtil.generateQrBitmap(content, 450)
        _qrBitmap.value = bmp
    }

    // Periodic Background Checkers
    private fun startHealthChecker() {
        healthCheckJob = viewModelScope.launch(Dispatchers.IO) {
            while (isActive) {
                delay(4000)
                if (_currentMode.value == AppMode.CONTROL) {
                    val currentList = _pairedCameras.value
                    for (cam in currentList) {
                        val probed = lanDiscovery.probeCamera(cam)
                        if (probed != null) {
                            _pairedCameras.update { list ->
                                list.map { if (it.id == cam.id) probed else it }
                            }
                        }
                    }
                } else if (_currentMode.value == AppMode.CAMERA) {
                    // Update battery level in server status
                    val bm = getApplication<Application>().getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
                    val batLevel = bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: 100
                    streamServer?.batteryLevel = batLevel
                }
            }
        }
    }

    private fun startRecordingTimer() {
        recordingTimerJob = viewModelScope.launch(Dispatchers.Default) {
            while (isActive) {
                delay(1000)
                if (activeRecorders.isNotEmpty()) {
                    _pairedCameras.update { list ->
                        list.map { cam ->
                            if (cam.isRecording) {
                                cam.copy(recordingDurationSeconds = cam.recordingDurationSeconds + 1)
                            } else cam
                        }
                    }
                }
            }
        }
    }

    private fun generateRandomPin(): String {
        val n1 = (100..999).random()
        val n2 = (100..999).random()
        return "$n1-$n2"
    }

    override fun onCleared() {
        super.onCleared()
        healthCheckJob?.cancel()
        recordingTimerJob?.cancel()
        stopCameraTransmitter()
        disconnectAllStreams()
        lanDiscovery.stopListening()
        cameraManager.release()
    }
}
