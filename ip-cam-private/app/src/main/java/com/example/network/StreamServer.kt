package com.example.network

import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.DataOutputStream
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.NetworkInterface
import java.net.ServerSocket
import java.net.Socket
import java.util.Collections
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong
import java.util.concurrent.atomic.AtomicReference

private data class H264Packet(
    val bytes: ByteArray,
    val presentationTimeUs: Long,
    val keyFrame: Boolean
)

class StreamServer(
    val port: Int = 8888,
    var cameraName: String = "Telecamera IP",
    var securityToken: String = "",
    var securityPin: String = "",
    private val onControlAction: (action: String, value: String?) -> Unit = { _, _ -> },
    private val onViewerCountChanged: (count: Int) -> Unit = {}
) {
    private val tag = "StreamServer"
    private var serverSocket: ServerSocket? = null
    private var serverJob: Job? = null
    private val isRunning = AtomicBoolean(false)

    private val latestFrame = AtomicReference<ByteArray?>(null)
    private val frameSequence = AtomicLong(0L)
    private val latestH264Format = AtomicReference<H264StreamFormat?>(null)
    private val latestH264Packet = AtomicReference<H264Packet?>(null)
    private val h264Sequence = AtomicLong(0L)
    private val h264Unavailable = AtomicBoolean(false)
    private val activeClients = CopyOnWriteArrayList<OutputStream>()
    private val mjpegClients = AtomicInteger(0)
    val connectedClientsCount = AtomicInteger(0)

    var currentFacing: String = "BACK"
    var isTorchEnabled: Boolean = false
    var batteryLevel: Int = 100

    fun start(): Boolean {
        if (isRunning.get()) return true
        return try {
            serverSocket = ServerSocket(port)
            h264Unavailable.set(false)
            isRunning.set(true)
            Log.i(tag, "StreamServer started on port $port")
            serverJob = CoroutineScope(Dispatchers.IO).launch {
                while (isActive && isRunning.get()) {
                    try {
                        val socket = serverSocket?.accept() ?: break
                        handleClientConnection(socket)
                    } catch (e: kotlinx.coroutines.CancellationException) {
                        break
                    } catch (e: Exception) {
                        if (isRunning.get()) Log.w(tag, "Socket accept error", e)
                    }
                }
            }
            true
        } catch (e: Exception) {
            Log.e(tag, "Failed to start StreamServer", e)
            false
        }
    }

    private fun handleClientConnection(socket: Socket) {
        try { socket.tcpNoDelay = true } catch (_: Exception) {}
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
                val query = if (fullPath.contains("?")) fullPath.substringAfter("?") else ""
                val params = parseQueryParams(query)
                var line: String?
                while (reader.readLine().also { line = it } != null) {
                    if (line.isNullOrBlank()) break
                }

                val token = params["token"]
                val valid = securityToken.isEmpty() || token == securityToken || token == securityPin
                if (!valid) {
                    out.write("HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\n\r\nAccess Denied".toByteArray())
                    out.flush()
                    socket.close()
                    return@launch
                }

                when {
                    path == "/h264" -> serveH264(socket, out)
                    path == "/stream" -> serveMjpeg(socket, out)
                    path == "/snapshot" -> {
                        val frame = latestFrame.get()
                        if (frame != null) {
                            out.write(("HTTP/1.1 200 OK\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.size}\r\nConnection: close\r\n\r\n").toByteArray())
                            out.write(frame)
                        } else {
                            out.write("HTTP/1.1 503 Service Unavailable\r\n\r\nNo frame ready".toByteArray())
                        }
                        out.flush()
                        socket.close()
                    }
                    path == "/status" -> {
                        val json = """{"status":"ONLINE","name":"$cameraName","battery":$batteryLevel,"facing":"$currentFacing","torch":$isTorchEnabled,"viewers":${connectedClientsCount.get()},"video":"H264"}"""
                        out.write(("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: ${json.toByteArray().size}\r\nConnection: close\r\n\r\n$json").toByteArray())
                        out.flush()
                        socket.close()
                    }
                    path.startsWith("/api/control") -> {
                        onControlAction(params["action"] ?: "", params["value"])
                        out.write("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nConnection: close\r\n\r\n{\"success\":true}".toByteArray())
                        out.flush()
                        socket.close()
                    }
                    else -> {
                        out.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n".toByteArray())
                        out.flush()
                        socket.close()
                    }
                }
            } catch (_: Exception) {
                try { socket.close() } catch (_: Exception) {}
            }
        }
    }

    private fun serveMjpeg(socket: Socket, out: OutputStream) {
        out.write((
            "HTTP/1.1 200 OK\r\nServer: IP_CAM_PRIVATE/1.0\r\nConnection: close\r\n" +
                "Cache-Control: no-store, no-cache, must-revalidate\r\n" +
                "Content-Type: multipart/x-mixed-replace; boundary=--boundaryframe\r\n\r\n"
            ).toByteArray())
        out.flush()
        activeClients.add(out)
        mjpegClients.incrementAndGet()
        onViewerCountChanged(connectedClientsCount.incrementAndGet())
        try {
            var lastSent = -1L
            while (isRunning.get() && !socket.isClosed) {
                val seq = frameSequence.get()
                if (seq != lastSent) {
                    val frame = latestFrame.get()
                    if (frame != null) {
                        out.write(("--boundaryframe\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.size}\r\n\r\n").toByteArray())
                        out.write(frame)
                        out.write("\r\n".toByteArray())
                        out.flush()
                        lastSent = seq
                    }
                } else Thread.sleep(5)
            }
        } catch (_: Exception) {
            // Client disconnected.
        } finally {
            activeClients.remove(out)
            mjpegClients.updateAndGet { (it - 1).coerceAtLeast(0) }
            val remaining = connectedClientsCount.updateAndGet { (it - 1).coerceAtLeast(0) }
            onViewerCountChanged(remaining)
            try { socket.close() } catch (_: Exception) {}
        }
    }

    /**
     * Binary H.264 stream:
     * type 0 = format (int width, int height, int rotation, int csd0 length/data, int csd1 length/data)
     * type 1 = access unit (int length, long PTS us, int keyframe flag, bytes)
     */
    private fun serveH264(socket: Socket, out: OutputStream) {
        out.write("HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n".toByteArray())
        out.flush()
        onViewerCountChanged(connectedClientsCount.incrementAndGet())
        try {
            val data = DataOutputStream(out)
            var formatSent = false
            var lastSent = -1L
            while (isRunning.get() && !socket.isClosed) {
                if (h264Unavailable.get()) {
                    // Protocol type 2 tells the receiver to reconnect using MJPEG.
                    data.writeByte(2)
                    data.writeInt(0)
                    data.flush()
                    break
                }
                val format = latestH264Format.get()
                if (!formatSent && format != null) {
                    val bytes = java.io.ByteArrayOutputStream().use { buffer ->
                        val payload = DataOutputStream(buffer)
                        payload.writeInt(format.width)
                        payload.writeInt(format.height)
                        payload.writeInt(format.rotationDegrees)
                        payload.writeInt(format.csd0.size)
                        payload.write(format.csd0)
                        payload.writeInt(format.csd1.size)
                        payload.write(format.csd1)
                        payload.flush()
                        buffer.toByteArray()
                    }
                    data.writeByte(0)
                    data.writeInt(bytes.size)
                    data.write(bytes)
                    data.flush()
                    formatSent = true
                }
                if (formatSent) {
                    val seq = h264Sequence.get()
                    if (seq != lastSent) {
                        val packet = latestH264Packet.get()
                        if (packet != null) {
                            data.writeByte(1)
                            data.writeInt(packet.bytes.size)
                            data.writeLong(packet.presentationTimeUs)
                            data.writeInt(if (packet.keyFrame) 1 else 0)
                            data.write(packet.bytes)
                            data.flush()
                            lastSent = seq
                        }
                    } else Thread.sleep(3)
                } else Thread.sleep(15)
            }
        } catch (_: Exception) {
            // Client disconnected.
        } finally {
            val remaining = connectedClientsCount.updateAndGet { (it - 1).coerceAtLeast(0) }
            onViewerCountChanged(remaining)
            try { socket.close() } catch (_: Exception) {}
        }
    }

    private fun parseQueryParams(query: String): Map<String, String> {
        if (query.isBlank()) return emptyMap()
        return query.split("&").associate { item ->
            val parts = item.split("=", limit = 2)
            parts[0] to parts.getOrElse(1) { "" }
        }
    }

    fun onNewFrame(jpegBytes: ByteArray) {
        latestFrame.set(jpegBytes)
        frameSequence.incrementAndGet()
    }

    fun onH264Unavailable() {
        h264Unavailable.set(true)
        latestH264Format.set(null)
        latestH264Packet.set(null)
    }

    fun onH264Format(format: H264StreamFormat) {
        h264Unavailable.set(false)
        latestH264Format.set(format)
        latestH264Packet.set(null)
        h264Sequence.set(0L)
        Log.i(tag, "H.264 stream format ready: ${format.width}x${format.height}")
    }

    fun onH264Frame(bytes: ByteArray, presentationTimeUs: Long, keyFrame: Boolean) {
        latestH264Packet.set(H264Packet(bytes, presentationTimeUs, keyFrame))
        h264Sequence.incrementAndGet()
    }

    fun shouldEncodeJpeg(): Boolean = mjpegClients.get() > 0

    fun stop() {
        isRunning.set(false)
        try { serverSocket?.close() } catch (_: Exception) {}
        serverSocket = null
        serverJob?.cancel()
        activeClients.clear()
        connectedClientsCount.set(0)
        mjpegClients.set(0)
        latestH264Format.set(null)
        latestH264Packet.set(null)
        h264Unavailable.set(false)
        onViewerCountChanged(0)
        Log.i(tag, "StreamServer stopped")
    }

    fun isServerRunning(): Boolean = isRunning.get()

    companion object {
        fun getLocalIpAddress(): String {
            try {
                val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
                for (intf in interfaces) {
                    for (addr in Collections.list(intf.inetAddresses)) {
                        if (!addr.isLoopbackAddress && addr is java.net.Inet4Address) {
                            val ip = addr.hostAddress ?: ""
                            if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) return ip
                        }
                    }
                }
            } catch (_: Exception) {}
            return "127.0.0.1"
        }
    }
}
