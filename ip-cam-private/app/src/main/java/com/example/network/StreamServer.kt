package com.example.network

import android.graphics.Bitmap
import android.util.Log
import com.example.media.H264Encoder
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.NetworkInterface
import java.net.ServerSocket
import java.net.Socket
import java.util.Collections
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicReference

class StreamServer(
    val port: Int = 8888,
    var cameraName: String = "Telecamera IP",
    var securityToken: String = "",
    var securityPin: String = "",
    private val onControlAction: (action: String, value: String?) -> Unit = { _, _ -> }
) {
    private val tag = "StreamServer"
    private var serverSocket: ServerSocket? = null
    private var serverJob: Job? = null
    private val isRunning = AtomicBoolean(false)

    // Current latest JPEG frame for MJPEG & Snapshots
    private val latestFrame = AtomicReference<ByteArray?>(null)
    private val latestBitmap = AtomicReference<Bitmap?>(null)

    // H.264 Hardware Encoder
    private var h264Encoder: H264Encoder? = null
    private val activeMjpegClients = CopyOnWriteArrayList<OutputStream>()
    private val activeH264Clients = CopyOnWriteArrayList<OutputStream>()
    val connectedClientsCount = AtomicInteger(0)

    var currentFacing: String = "BACK"
    var isTorchEnabled: Boolean = false
    var isNightMode: Boolean = false
    var currentZoom: Float = 1.0f
    var maxZoom: Float = 5.0f
    var batteryLevel: Int = 100

    fun start(): Boolean {
        if (isRunning.get()) return true

        return try {
            serverSocket = ServerSocket(port)
            isRunning.set(true)
            Log.i(tag, "StreamServer started on port $port")

            // Initialize Hardware H.264 Encoder
            h264Encoder = H264Encoder(
                width = 1920,
                height = 1080
            ) { packet, isKeyFrame, _ ->
                broadcastH264Packet(packet)
            }
            h264Encoder?.start()

            serverJob = CoroutineScope(Dispatchers.IO).launch {
                while (isActive && isRunning.get()) {
                    try {
                        val socket = serverSocket?.accept() ?: break
                        handleClientConnection(socket)
                    } catch (e: CancellationException) {
                        break
                    } catch (e: Exception) {
                        if (isRunning.get()) {
                            Log.w(tag, "Socket accept error", e)
                        }
                    }
                }
            }
            true
        } catch (e: Exception) {
            Log.e(tag, "Failed to start StreamServer", e)
            false
        }
    }

    private fun broadcastH264Packet(packet: ByteArray) {
        if (activeH264Clients.isEmpty()) return

        // 4-byte big-endian packet size followed by raw NAL payload
        val size = packet.size
        val header = byteArrayOf(
            ((size shr 24) and 0xFF).toByte(),
            ((size shr 16) and 0xFF).toByte(),
            ((size shr 8) and 0xFF).toByte(),
            (size and 0xFF).toByte()
        )

        for (out in activeH264Clients) {
            try {
                out.write(header)
                out.write(packet)
                out.flush()
            } catch (_: Exception) {
                activeH264Clients.remove(out)
                connectedClientsCount.decrementAndGet()
            }
        }
    }

    private fun handleClientConnection(socket: Socket) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
                val out = socket.getOutputStream()

                val requestLine = reader.readLine() ?: return@launch
                val parts = requestLine.split(" ")
                if (parts.size < 2) {
                    socket.close()
                    return@launch
                }

                val fullPath = parts[1]
                val path = fullPath.substringBefore("?")
                val queryString = if (fullPath.contains("?")) fullPath.substringAfter("?") else ""
                val queryParams = parseQueryParams(queryString)

                // Read headers
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    if (line.isNullOrBlank()) break
                }

                // Verify Token (if configured)
                val tokenParam = queryParams["token"]
                val isTokenValid = securityToken.isEmpty() || tokenParam == securityToken || tokenParam == securityPin

                if (!isTokenValid) {
                    val resp = "HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\n\r\nAccess Denied"
                    out.write(resp.toByteArray())
                    out.flush()
                    socket.close()
                    return@launch
                }

                val requestedCodec = queryParams["codec"]?.lowercase() ?: "h264"

                when {
                    path == "/stream" && requestedCodec == "h264" && h264Encoder?.isHardwareSupported == true -> {
                        // Stream H.264
                        val headers = (
                            "HTTP/1.1 200 OK\r\n" +
                            "Server: IP_CAM_PRIVATE/2.0\r\n" +
                            "Content-Type: video/avc\r\n" +
                            "Connection: close\r\n" +
                            "Access-Control-Allow-Origin: *\r\n\r\n"
                        ).toByteArray()
                        out.write(headers)
                        out.flush()

                        // Send cached SPS/PPS header first so decoder starts immediately
                        h264Encoder?.spsPpsHeader?.let { spsPps ->
                            val sz = spsPps.size
                            val h = byteArrayOf(
                                ((sz shr 24) and 0xFF).toByte(),
                                ((sz shr 16) and 0xFF).toByte(),
                                ((sz shr 8) and 0xFF).toByte(),
                                (sz and 0xFF).toByte()
                            )
                            out.write(h)
                            out.write(spsPps)
                            out.flush()
                        }

                        activeH264Clients.add(out)
                        connectedClientsCount.incrementAndGet()

                        while (isActive && isRunning.get() && !socket.isClosed) {
                            Thread.sleep(100)
                        }
                    }

                    path == "/stream" -> {
                        // Stream MJPEG (Default or fallback)
                        val headers = (
                            "HTTP/1.1 200 OK\r\n" +
                            "Server: IP_CAM_PRIVATE/2.0\r\n" +
                            "Connection: close\r\n" +
                            "Cache-Control: no-store, no-cache, must-revalidate\r\n" +
                            "Content-Type: multipart/x-mixed-replace; boundary=--boundaryframe\r\n\r\n"
                        ).toByteArray()
                        out.write(headers)
                        out.flush()

                        activeMjpegClients.add(out)
                        connectedClientsCount.incrementAndGet()

                        try {
                            while (isActive && isRunning.get() && !socket.isClosed) {
                                val frame = latestFrame.get()
                                if (frame != null) {
                                    val frameHeader = (
                                        "--boundaryframe\r\n" +
                                        "Content-Type: image/jpeg\r\n" +
                                        "Content-Length: ${frame.size}\r\n" +
                                        "X-Timestamp: ${System.currentTimeMillis()}\r\n\r\n"
                                    ).toByteArray()

                                    out.write(frameHeader)
                                    out.write(frame)
                                    out.write("\r\n".toByteArray())
                                    out.flush()
                                }
                                Thread.sleep(33) // ~30 fps
                            }
                        } finally {
                            activeMjpegClients.remove(out)
                            connectedClientsCount.decrementAndGet()
                            try { socket.close() } catch (_: Exception) {}
                        }
                    }

                    path == "/snapshot" -> {
                        val frame = latestFrame.get()
                        if (frame != null) {
                            val respHeader = (
                                "HTTP/1.1 200 OK\r\n" +
                                "Content-Type: image/jpeg\r\n" +
                                "Content-Length: ${frame.size}\r\n" +
                                "Access-Control-Allow-Origin: *\r\n\r\n"
                            ).toByteArray()
                            out.write(respHeader)
                            out.write(frame)
                            out.flush()
                        } else {
                            val notFound = "HTTP/1.1 503 Service Unavailable\r\n\r\nNo frame"
                            out.write(notFound.toByteArray())
                            out.flush()
                        }
                        socket.close()
                    }

                    path == "/status" -> {
                        val hwCodec = if (h264Encoder?.isHardwareSupported == true) "H264" else "MJPEG"
                        val json = """
                            {
                                "status": "ONLINE",
                                "name": "$cameraName",
                                "battery": $batteryLevel,
                                "facing": "$currentFacing",
                                "torch": $isTorchEnabled,
                                "nightMode": $isNightMode,
                                "zoom": $currentZoom,
                                "maxZoom": $maxZoom,
                                "codec": "$hwCodec",
                                "viewers": ${connectedClientsCount.get()}
                            }
                        """.trimIndent()
                        val resp = (
                            "HTTP/1.1 200 OK\r\n" +
                            "Content-Type: application/json\r\n" +
                            "Access-Control-Allow-Origin: *\r\n" +
                            "Content-Length: ${json.toByteArray().size}\r\n\r\n$json"
                        ).toByteArray()
                        out.write(resp)
                        out.flush()
                        socket.close()
                    }

                    path.startsWith("/api/control") -> {
                        val action = queryParams["action"] ?: ""
                        val value = queryParams["value"]
                        onControlAction(action, value)
                        val ok = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"success\":true}"
                        out.write(ok.toByteArray())
                        out.flush()
                        socket.close()
                    }

                    else -> {
                        val notFound = "HTTP/1.1 404 Not Found\r\n\r\n"
                        out.write(notFound.toByteArray())
                        out.flush()
                        socket.close()
                    }
                }
            } catch (_: Exception) {
                try { socket.close() } catch (_: Exception) {}
            }
        }
    }

    private fun parseQueryParams(query: String): Map<String, String> {
        if (query.isBlank()) return emptyMap()
        return query.split("&").associate { param ->
            val kv = param.split("=")
            if (kv.size == 2) kv[0] to kv[1] else kv[0] to ""
        }
    }

    fun onNewFrame(jpegBytes: ByteArray, bitmap: Bitmap) {
        latestFrame.set(jpegBytes)
        latestBitmap.set(bitmap)
        // Feed into H.264 Hardware Encoder
        h264Encoder?.encodeFrame(bitmap)
    }

    fun stop() {
        isRunning.set(false)
        try {
            serverSocket?.close()
        } catch (_: Exception) {}
        serverSocket = null
        serverJob?.cancel()
        serverJob = null

        h264Encoder?.stop()
        h264Encoder = null

        activeMjpegClients.clear()
        activeH264Clients.clear()
        connectedClientsCount.set(0)
        Log.i(tag, "StreamServer stopped")
    }

    fun isServerRunning(): Boolean = isRunning.get()

    companion object {
        fun getLocalIpAddress(): String {
            try {
                val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
                for (intf in interfaces) {
                    val addrs = Collections.list(intf.inetAddresses)
                    for (addr in addrs) {
                        if (!addr.isLoopbackAddress && addr is java.net.Inet4Address) {
                            val ip = addr.hostAddress ?: ""
                            if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
                                return ip
                            }
                        }
                    }
                }
            } catch (_: Exception) {}
            return "127.0.0.1"
        }
    }
}
