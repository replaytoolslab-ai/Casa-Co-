package com.example.network

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.io.BufferedInputStream
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.DataInputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.atomic.AtomicBoolean

enum class StreamConnectionState {
    IDLE, CONNECTING, CONNECTED, RETRYING, ERROR
}

class StreamClient(
    val host: String,
    val port: Int = 8888,
    val securityToken: String = "",
    private val onFrame: (bitmap: Bitmap, jpegBytes: ByteArray) -> Unit = { _, _ -> }
) {
    private val tag = "StreamClient"
    private val _connectionState = MutableStateFlow(StreamConnectionState.IDLE)
    val connectionState: StateFlow<StreamConnectionState> = _connectionState.asStateFlow()
    private val _currentBitmap = MutableStateFlow<Bitmap?>(null)
    val currentBitmap: StateFlow<Bitmap?> = _currentBitmap.asStateFlow()
    private val _currentFps = MutableStateFlow(0f)
    val currentFps: StateFlow<Float> = _currentFps.asStateFlow()
    private val _bitrateKbps = MutableStateFlow(0f)
    val bitrateKbps: StateFlow<Float> = _bitrateKbps.asStateFlow()

    private var streamJob: Job? = null
    @Volatile private var activeConnection: HttpURLConnection? = null
    private val isRunning = AtomicBoolean(false)

    fun start() {
        if (!isRunning.compareAndSet(false, true)) return
        streamJob = CoroutineScope(Dispatchers.IO).launch {
            var failures = 0
            while (isActive && isRunning.get()) {
                _connectionState.value = if (failures == 0) StreamConnectionState.CONNECTING else StreamConnectionState.RETRYING
                var h264Connected = false
                try {
                    h264Connected = readH264Connection()
                } catch (e: kotlinx.coroutines.CancellationException) {
                    break
                } catch (e: Exception) {
                    if (isRunning.get()) Log.w(tag, "H.264 stream unavailable; trying MJPEG fallback: ${e.message}")
                }

                if (!h264Connected && isRunning.get()) {
                    try {
                        readMjpegConnection()
                    } catch (e: kotlinx.coroutines.CancellationException) {
                        break
                    } catch (e: Exception) {
                        if (isRunning.get()) Log.w(tag, "MJPEG fallback connection error: ${e.message}")
                    }
                }

                if (isRunning.get()) {
                    failures++
                    delay(if (failures < 3) 1200L else 2500L)
                }
            }
        }
    }

    private fun readH264Connection(): Boolean {
        val url = URL("http://$host:$port/h264?token=$securityToken")
        val connection = (url.openConnection() as HttpURLConnection).apply {
            connectTimeout = 4000
            readTimeout = 3000
            requestMethod = "GET"
            useCaches = false
        }
        var decoder: H264StreamDecoder? = null
        activeConnection = connection
        try {
            connection.connect()
            if (connection.responseCode != 200) return false
            _connectionState.value = StreamConnectionState.CONNECTED
            val input = DataInputStream(BufferedInputStream(connection.inputStream))
            var frameCount = 0
            var byteCount = 0L
            var lastStat = System.currentTimeMillis()

            while (isRunning.get()) {
                val type = input.readUnsignedByte()
                val length = input.readInt()
                if (type == 2) {
                    require(length == 0) { "Invalid H.264 fallback marker" }
                    throw IllegalStateException("Hardware H.264 encoder unavailable; switching to MJPEG")
                }
                require(length in 1..4_194_304) { "Invalid H.264 packet length: $length" }
                when (type) {
                    0 -> {
                        val payload = ByteArray(length)
                        input.readFully(payload)
                        val data = DataInputStream(ByteArrayInputStream(payload))
                        val width = data.readInt()
                        val height = data.readInt()
                        val rotation = data.readInt()
                        val csd0Length = data.readInt()
                        require(csd0Length in 0..1_048_576)
                        val csd0 = ByteArray(csd0Length).also { data.readFully(it) }
                        val csd1Length = data.readInt()
                        require(csd1Length in 0..1_048_576)
                        val csd1 = ByteArray(csd1Length).also { data.readFully(it) }
                        require(width in 1..4096 && height in 1..4096)
                        decoder?.release()
                        decoder = H264StreamDecoder(
                            H264StreamFormat(width, height, rotation, csd0, csd1)
                        ) { bitmap, jpeg ->
                            _currentBitmap.value = bitmap
                            onFrame(bitmap, jpeg)
                        }
                        byteCount += length
                    }
                    1 -> {
                        val pts = input.readLong()
                        val keyFrame = input.readInt() != 0
                        val bytes = ByteArray(length)
                        input.readFully(bytes)
                        decoder?.queueAccessUnit(bytes, pts, keyFrame)
                        frameCount++
                        byteCount += length.toLong() + 13L
                    }
                    else -> throw IllegalStateException("Unknown H.264 packet type: $type")
                }

                val now = System.currentTimeMillis()
                val elapsed = now - lastStat
                if (elapsed >= 1000) {
                    _currentFps.value = frameCount * 1000f / elapsed
                    _bitrateKbps.value = byteCount * 8f / (elapsed * 1.024f)
                    frameCount = 0
                    byteCount = 0
                    lastStat = now
                }
            }
            return true
        } finally {
            decoder?.release()
            if (activeConnection === connection) activeConnection = null
            connection.disconnect()
        }
    }

    private fun readMjpegConnection() {
        val connection = (URL("http://$host:$port/stream?token=$securityToken").openConnection() as HttpURLConnection).apply {
            connectTimeout = 4000
            readTimeout = 8000
            requestMethod = "GET"
            useCaches = false
        }
        activeConnection = connection
        try {
            connection.connect()
            if (connection.responseCode != 200) throw IllegalStateException("HTTP ${connection.responseCode}")
            _connectionState.value = StreamConnectionState.CONNECTED
            readMjpegStream(BufferedInputStream(connection.inputStream))
        } finally {
            if (activeConnection === connection) activeConnection = null
            connection.disconnect()
        }
    }

    private fun readMjpegStream(input: BufferedInputStream) {
        val buffer = ByteArray(16384)
        val frameBuffer = ByteArrayOutputStream(262144)
        var previousByte = -1
        var inFrame = false
        var frameCount = 0
        var byteCount = 0L
        var lastStatTime = System.currentTimeMillis()

        while (isRunning.get()) {
            val bytesRead = input.read(buffer)
            if (bytesRead == -1) break
            byteCount += bytesRead
            for (i in 0 until bytesRead) {
                val current = buffer[i].toInt() and 0xFF
                if (!inFrame) {
                    if (previousByte == 0xFF && current == 0xD8) {
                        inFrame = true
                        frameBuffer.reset()
                        frameBuffer.write(0xFF)
                        frameBuffer.write(0xD8)
                    }
                } else {
                    frameBuffer.write(current)
                    if (previousByte == 0xFF && current == 0xD9) {
                        inFrame = false
                        val jpeg = frameBuffer.toByteArray()
                        if (jpeg.size > 100) {
                            val bitmap = BitmapFactory.decodeByteArray(jpeg, 0, jpeg.size)
                            if (bitmap != null) {
                                _currentBitmap.value = bitmap
                                onFrame(bitmap, jpeg)
                                frameCount++
                            }
                        }
                    }
                }
                previousByte = current
            }
            val now = System.currentTimeMillis()
            val elapsed = now - lastStatTime
            if (elapsed >= 1000) {
                _currentFps.value = frameCount * 1000f / elapsed
                _bitrateKbps.value = byteCount * 8f / (elapsed * 1.024f)
                frameCount = 0
                byteCount = 0
                lastStatTime = now
            }
        }
    }

    fun stop() {
        isRunning.set(false)
        activeConnection?.disconnect()
        activeConnection = null
        streamJob?.cancel()
        streamJob = null
        _connectionState.value = StreamConnectionState.IDLE
        _currentBitmap.value = null
        _currentFps.value = 0f
        _bitrateKbps.value = 0f
    }
}
