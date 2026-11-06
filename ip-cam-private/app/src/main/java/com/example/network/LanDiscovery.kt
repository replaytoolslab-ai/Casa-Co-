package com.example.network

import android.content.Context
import android.net.wifi.WifiManager
import android.util.Log
import com.example.model.CameraDevice
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.URL
import java.util.concurrent.atomic.AtomicBoolean

class LanDiscovery(private val context: Context) {
    private val tag = "LanDiscovery"
    private val broadcastPort = 8889

    private var beaconJob: Job? = null
    private var listenerJob: Job? = null
    private val isListening = AtomicBoolean(false)
    private val isBroadcasting = AtomicBoolean(false)

    @Volatile
    private var activeBeaconSocket: DatagramSocket? = null

    @Volatile
    private var activeListenerSocket: DatagramSocket? = null

    private var multicastLock: WifiManager.MulticastLock? = null

    init {
        try {
            val wifi = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            multicastLock = wifi?.createMulticastLock("IpCamMulticastLock")?.apply {
                setReferenceCounted(true)
            }
        } catch (_: Exception) {}
    }

    /**
     * Camera transmits UDP beacon to let CONTROLLO automatically discover it.
     */
    fun startBeacon(
        id: String,
        name: String,
        port: Int,
        token: String,
        pin: String
    ) {
        if (isBroadcasting.get()) return
        isBroadcasting.set(true)

        beaconJob = CoroutineScope(Dispatchers.IO).launch {
            var socket: DatagramSocket? = null
            try {
                socket = DatagramSocket().apply {
                    broadcast = true
                }
                activeBeaconSocket = socket

                val message = "IPCAM_BEACON:id=$id;name=$name;port=$port;token=$token;pin=$pin"
                val data = message.toByteArray()
                val broadcastAddress = InetAddress.getByName("255.255.255.255")
                val packet = DatagramPacket(data, data.size, broadcastAddress, broadcastPort)

                while (isActive && isBroadcasting.get()) {
                    try {
                        socket.send(packet)
                    } catch (e: CancellationException) {
                        throw e
                    } catch (e: Exception) {
                        if (isBroadcasting.get()) {
                            Log.w(tag, "Beacon send error", e)
                        }
                    }
                    delay(1500)
                }
            } catch (_: CancellationException) {
                // Normal cooperative coroutine cancellation when beacon is stopped
            } catch (e: Exception) {
                if (isBroadcasting.get()) {
                    Log.e(tag, "Beacon socket setup error", e)
                }
            } finally {
                try { socket?.close() } catch (_: Exception) {}
                activeBeaconSocket = null
                isBroadcasting.set(false)
            }
        }
    }

    fun stopBeacon() {
        isBroadcasting.set(false)
        try {
            activeBeaconSocket?.close()
        } catch (_: Exception) {}
        activeBeaconSocket = null
        beaconJob?.cancel()
        beaconJob = null
    }

    /**
     * CONTROLLO listens on UDP for any broadcasting cameras on Wi-Fi.
     */
    fun startListening(onCameraFound: (device: CameraDevice) -> Unit) {
        if (isListening.get()) return
        isListening.set(true)

        try {
            multicastLock?.acquire()
        } catch (_: Exception) {}

        listenerJob = CoroutineScope(Dispatchers.IO).launch {
            var socket: DatagramSocket? = null
            try {
                socket = DatagramSocket(broadcastPort).apply {
                    broadcast = true
                    reuseAddress = true
                }
                activeListenerSocket = socket
                val buffer = ByteArray(1024)

                while (isActive && isListening.get()) {
                    try {
                        val packet = DatagramPacket(buffer, buffer.size)
                        socket.receive(packet)

                        val hostAddress = packet.address.hostAddress ?: continue
                        val text = String(packet.data, 0, packet.length)

                        if (text.startsWith("IPCAM_BEACON:")) {
                            val payload = text.removePrefix("IPCAM_BEACON:")
                            val map = payload.split(";").associate { part ->
                                val kv = part.split("=")
                                if (kv.size == 2) kv[0] to kv[1] else kv[0] to ""
                            }

                            val id = map["id"] ?: hostAddress
                            val name = map["name"] ?: "Telecamera IP"
                            val port = map["port"]?.toIntOrNull() ?: 8888
                            val token = map["token"] ?: ""
                            val pin = map["pin"] ?: ""

                            val device = CameraDevice(
                                id = id,
                                name = name,
                                host = hostAddress,
                                port = port,
                                securityToken = token,
                                securityPin = pin,
                                isOnline = true,
                                lastSeenTimestamp = System.currentTimeMillis()
                            )
                            withContext(Dispatchers.Main) {
                                onCameraFound(device)
                            }
                        }
                    } catch (e: CancellationException) {
                        throw e
                    } catch (e: Exception) {
                        if (isListening.get()) {
                            Log.w(tag, "Error in packet receive", e)
                        }
                    }
                }
            } catch (_: CancellationException) {
                // Normal cooperative coroutine cancellation
            } catch (e: Exception) {
                if (isListening.get()) {
                    Log.e(tag, "Listener socket failed", e)
                }
            } finally {
                try { socket?.close() } catch (_: Exception) {}
                activeListenerSocket = null
                isListening.set(false)
                try {
                    if (multicastLock?.isHeld == true) {
                        multicastLock?.release()
                    }
                } catch (_: Exception) {}
            }
        }
    }

    fun stopListening() {
        isListening.set(false)
        try {
            activeListenerSocket?.close()
        } catch (_: Exception) {}
        activeListenerSocket = null
        listenerJob?.cancel()
        listenerJob = null
        try {
            if (multicastLock?.isHeld == true) {
                multicastLock?.release()
            }
        } catch (_: Exception) {}
    }

    /**
     * Probe a single camera over HTTP status API to check if online and get live info.
     */
    suspend fun probeCamera(device: CameraDevice): CameraDevice? = withContext(Dispatchers.IO) {
        try {
            val url = URL(device.statusUrl)
            val conn = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 2000
                readTimeout = 2000
                requestMethod = "GET"
            }
            if (conn.responseCode == 200) {
                val responseText = conn.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(responseText)
                val status = json.optString("status", "ONLINE")
                val name = json.optString("name", device.name)
                val battery = json.optInt("battery", 100)
                val facing = json.optString("facing", device.facing)
                val torch = json.optBoolean("torch", false)
                val nightMode = json.optBoolean("nightMode", device.isNightMode)
                val zoom = json.optDouble("zoom", device.zoomRatio.toDouble()).toFloat()
                val maxZoom = json.optDouble("maxZoom", device.maxZoomRatio.toDouble()).toFloat()
                val codec = json.optString("codec", device.codec)

                device.copy(
                    name = name,
                    isOnline = status == "ONLINE",
                    batteryPercent = battery,
                    facing = facing,
                    isTorchOn = torch,
                    isNightMode = nightMode,
                    zoomRatio = zoom,
                    maxZoomRatio = maxZoom,
                    codec = codec,
                    lastSeenTimestamp = System.currentTimeMillis()
                )
            } else {
                device.copy(isOnline = false)
            }
        } catch (_: CancellationException) {
            throw CancellationException()
        } catch (_: Exception) {
            device.copy(isOnline = false)
        }
    }
}
