package com.securehome.hub

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.net.Uri
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.net.wifi.WifiManager
import android.util.Size
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleService
import java.io.ByteArrayOutputStream
import java.io.File
import java.net.NetworkInterface
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors
import kotlin.concurrent.thread

class Frame(val data: ByteArray, val rot: Int, val n: Long)

class CameraForegroundService : LifecycleService() {
    companion object {
        const val ACTION_STOP = "com.securehome.hub.STOP_CAMERA"
        private const val CHANNEL = "camhub_camera"
        private const val NOTIFICATION_ID = 8101
    }

    private var provider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var analysis: ImageAnalysis? = null
    private var videoCapture: VideoCapture<Recorder>? = null
    private var recording: Recording? = null
    private val exec = Executors.newSingleThreadExecutor()
    private var server: ServerSocket? = null
    private var nsd: NsdManager? = null
    private var regListener: NsdManager.RegistrationListener? = null
    private var cpuLock: PowerManager.WakeLock? = null
    private var wifiLock: WifiManager.WifiLock? = null
    private val recFile by lazy { File(cacheDir, "rec.mp4") }

    @Volatile private var frame: Frame? = null
    @Volatile private var viewers = 0
    @Volatile private var recReady = false
    @Volatile private var isRec = false
    @Volatile private var lastTs = 0L
    private var seq = 0L
    private var res = 720
    @Volatile private var quality = 70
    private var zoom = 1f
    private var night = false
    private var front = false
    @Volatile private var torchOn = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
        acquireKeepAliveLocks()
        startCameraAndServer()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }
        return START_STICKY
    }

    private fun acquireKeepAliveLocks() {
        try {
            val power = getSystemService(POWER_SERVICE) as PowerManager
            cpuLock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "CamHub::CameraCpu").apply {
                setReferenceCounted(false)
                acquire()
            }
        } catch (_: Exception) {}
        try {
            val wifi = applicationContext.getSystemService(WIFI_SERVICE) as WifiManager
            @Suppress("DEPRECATION")
            wifiLock = wifi.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "CamHub::CameraWifi").apply {
                setReferenceCounted(false)
                acquire()
            }
        } catch (_: Exception) {}
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(NotificationChannel(CHANNEL, "CamHub - Telecamera attiva", NotificationManager.IMPORTANCE_LOW))
        }
    }

    private fun buildNotification(): Notification {
        val stop = Intent(this, CameraForegroundService::class.java).setAction(ACTION_STOP)
        val pi = PendingIntent.getService(this, 8102, stop, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(android.R.drawable.presence_video_online)
            .setContentTitle("CamHub: telecamera attiva")
            .setContentText("Streaming pronto. Tocca per tornare all'app.")
            .setContentIntent(PendingIntent.getActivity(this, 8103, Intent(this, CameraActivity::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
            .addAction(android.R.drawable.ic_media_pause, "Arresta", pi)
            .setOngoing(true)
            .build()
    }

    private fun startCameraAndServer() {
        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            stopSelf(); return
        }
        val future = ProcessCameraProvider.getInstance(this)
        future.addListener({
            try {
                provider = future.get()
                bindCamera()
                startServer()
                registerNsd()
            } catch (_: Exception) { stopSelf() }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun bindCamera() {
        val p = provider ?: return
        p.unbindAll()
        val size = if (res == 1080) Size(1920, 1080) else Size(1280, 720)
        val selector = ResolutionSelector.Builder()
            .setResolutionStrategy(ResolutionStrategy(size, ResolutionStrategy.FALLBACK_RULE_CLOSEST_LOWER_THEN_HIGHER)).build()
        val an = ImageAnalysis.Builder().setResolutionSelector(selector)
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build()
        an.setAnalyzer(exec) { onFrame(it) }
        analysis = an
        val q = if (res == 1080) Quality.FHD else Quality.HD
        val vc = VideoCapture.withOutput(Recorder.Builder()
            .setQualitySelector(QualitySelector.from(q)).build())
        val sel = if (front) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
        try {
            videoCapture = vc
            camera = p.bindToLifecycle(this, sel, an, vc)
        } catch (_: Exception) {
            videoCapture = null
            try { p.unbindAll(); camera = p.bindToLifecycle(this, sel, an) } catch (_: Exception) { camera = null }
        }
        applyZoomNight()
        applyFlash()
    }

    private fun applyZoomNight() {
        val c = camera ?: return
        val mx = c.cameraInfo.zoomState.value?.maxZoomRatio ?: 1f
        c.cameraControl.setZoomRatio(zoom.coerceIn(1f, mx))
        val st = c.cameraInfo.exposureState
        if (st.isExposureCompensationSupported)
            c.cameraControl.setExposureCompensationIndex(if (night) (st.exposureCompensationRange.upper * 0.8).toInt() else 0)
    }

    private fun applyFlash() {
        val c = camera ?: return
        if (c.cameraInfo.hasFlashUnit()) c.cameraControl.enableTorch(torchOn) else torchOn = false
    }

    private fun onFrame(img: ImageProxy) {
        try {
            val now = System.currentTimeMillis()
            if (viewers > 0 && now - lastTs >= 60) {
                lastTs = now
                val w = img.width; val h = img.height
                val y = img.planes[0]; val u = img.planes[1]; val v = img.planes[2]
                val nv = ByteArray(w * h * 3 / 2); var pos = 0
                for (row in 0 until h) { y.buffer.position(row * y.rowStride); y.buffer.get(nv, pos, w); pos += w }
                for (row in 0 until h / 2) for (col in 0 until w / 2) {
                    nv[pos++] = v.buffer.get(row * v.rowStride + col * v.pixelStride)
                    nv[pos++] = u.buffer.get(row * u.rowStride + col * u.pixelStride)
                }
                val out = ByteArrayOutputStream()
                YuvImage(nv, ImageFormat.NV21, w, h, null).compressToJpeg(Rect(0, 0, w, h), quality, out)
                frame = Frame(out.toByteArray(), img.imageInfo.rotationDegrees, ++seq)
            }
        } catch (_: Exception) {
        } finally { img.close() }
    }

    private fun applyCmd(uri: Uri) {
        uri.getQueryParameter("detail")?.toIntOrNull()?.let { quality = it.coerceIn(20, 95) }
        uri.getQueryParameter("zoom")?.toFloatOrNull()?.let { zoom = it }
        uri.getQueryParameter("night")?.let { night = it == "1" }
        uri.getQueryParameter("flash")?.let { torchOn = it == "1"; applyFlash() }
        applyZoomNight()
        uri.getQueryParameter("res")?.toIntOrNull()?.let { if (it != res && !isRec) { res = it; bindCamera() } }
        uri.getQueryParameter("rec")?.let { setRec(it == "1") }
    }

    private fun setRec(on: Boolean) {
        val vc = videoCapture ?: return
        if (on && recording == null) {
            recReady = false; recFile.delete()
            var pending = vc.output.prepareRecording(this, FileOutputOptions.Builder(recFile).build())
            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED)
                pending = pending.withAudioEnabled()
            isRec = true
            recording = pending.start(ContextCompat.getMainExecutor(this)) { event ->
                if (event is androidx.camera.video.VideoRecordEvent.Finalize) {
                    recording = null; isRec = false
                    recReady = !event.hasError() && recFile.exists()
                }
            }
        } else if (!on && recording != null) { recReady = false; recording?.stop() }
    }

    private fun startServer() {
        thread(name = "CamHub-server") {
            try {
                val ss = ServerSocket(PORT); server = ss
                while (!ss.isClosed) {
                    val socket = ss.accept()
                    thread { handle(socket) }
                }
            } catch (_: Exception) { }
        }
    }

    private fun handle(socket: Socket) {
        try {
            val reader = socket.getInputStream().bufferedReader()
            val line = reader.readLine() ?: return
            while (true) { val l = reader.readLine(); if (l.isNullOrEmpty()) break }
            val uri = Uri.parse(line.split(" ")[1])
            val out = socket.getOutputStream()
            fun reply(body: String) {
                val bytes = body.toByteArray()
                out.write("HTTP/1.1 200 OK\r\nContent-Length: ${bytes.size}\r\nConnection: close\r\n\r\n".toByteArray())
                out.write(bytes); out.flush()
            }
            when (uri.path) {
                "/status" -> {
                    val max = camera?.cameraInfo?.zoomState?.value?.maxZoomRatio ?: 1f
                    reply("ok maxzoom=$max rec=${if (isRec) 1 else 0} recready=${if (recReady) 1 else 0} vid=${if (videoCapture != null) 1 else 0} flash=${if (camera?.cameraInfo?.hasFlashUnit() == true) 1 else 0}")
                }
                "/cmd" -> { ContextCompat.getMainExecutor(this).execute { applyCmd(uri) }; reply("ok") }
                "/video" -> {
                    out.write("HTTP/1.1 200 OK\r\nContent-Length: ${recFile.length()}\r\nConnection: close\r\n\r\n".toByteArray())
                    recFile.inputStream().use { it.copyTo(out) }; out.flush()
                }
                "/stream" -> {
                    out.write("HTTP/1.1 200 OK\r\nConnection: close\r\n\r\n".toByteArray())
                    viewers++
                    try {
                        var last = -1L
                        while (!socket.isClosed) {
                            val f = frame
                            if (f == null || f.n == last) { Thread.sleep(15); continue }
                            last = f.n
                            out.write("F ${f.data.size} ${f.rot}\n".toByteArray()); out.write(f.data); out.flush()
                        }
                    } finally { viewers-- }
                }
                "/audio" -> {
                    out.write("HTTP/1.1 200 OK\r\nConnection: close\r\n\r\n".toByteArray())
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) return
                    val min = AudioRecord.getMinBufferSize(16000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
                    val audio = AudioRecord(MediaRecorder.AudioSource.MIC, 16000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, maxOf(min, 4096) * 2)
                    try {
                        audio.startRecording(); val buf = ByteArray(4096)
                        while (true) { val n = audio.read(buf, 0, buf.size); if (n <= 0) break; out.write(buf, 0, n); out.flush() }
                    } finally { try { audio.stop() } catch (_: Exception) {}; audio.release() }
                }
            }
        } catch (_: Exception) {
        } finally { try { socket.close() } catch (_: Exception) {} }
    }

    private fun registerNsd() {
        try {
            val manager = getSystemService(NSD_SERVICE) as NsdManager; nsd = manager
            val service = NsdServiceInfo().apply { serviceName = "Cam-${Build.MODEL}"; serviceType = SERVICE_TYPE; port = PORT }
            regListener = object : NsdManager.RegistrationListener {
                override fun onRegistrationFailed(s: NsdServiceInfo, e: Int) {}
                override fun onUnregistrationFailed(s: NsdServiceInfo, e: Int) {}
                override fun onServiceRegistered(s: NsdServiceInfo) {}
                override fun onServiceUnregistered(s: NsdServiceInfo) {}
            }
            manager.registerService(service, NsdManager.PROTOCOL_DNS_SD, regListener)
        } catch (_: Exception) {}
    }

    override fun onDestroy() {
        try { recording?.stop() } catch (_: Exception) {}
        try { server?.close() } catch (_: Exception) {}
        try { regListener?.let { nsd?.unregisterService(it) } } catch (_: Exception) {}
        try { provider?.unbindAll() } catch (_: Exception) {}
        exec.shutdown()
        try { if (cpuLock?.isHeld == true) cpuLock?.release() } catch (_: Exception) {}
        try { if (wifiLock?.isHeld == true) wifiLock?.release() } catch (_: Exception) {}
        super.onDestroy()
    }
}
