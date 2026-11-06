package com.example.network

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import android.view.Surface
import com.example.media.H264Decoder
import kotlinx.coroutines.CancellationException
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
import java.io.ByteArrayOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.atomic.AtomicBoolean

enum class StreamConnectionState {
    IDLE,
    CONNECTING,
    CONNECTED,
    RETRYING,
    ERROR
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

    private val _activeCodec = MutableStateFlow("H.264 HW")
    val activeCodec: StateFlow<String> = _activeCodec.asStateFlow()

    private val _currentBitmap = MutableStateFlow<Bitmap?>(null)
    val currentBitmap: StateFlow<Bitmap?> = _currentBitmap.asStateFlow()

    private val _currentFps = MutableStateFlow(0f)
    val currentFps: StateFlow<Float> = _currentFps.asStateFlow()

    private val _bitrateKbps = MutableStateFlow(0f)
    val bitrateKbps: StateFlow<Float> = _bitrateKbps.asStateFlow()

    private var streamJob: Job? = null
    private val isRunning = AtomicBoolean(false)
    private var preferH264 = true

    // Surface for hardware direct rendering (if provided by view)
    var targetSurface: Surface? = null
        set(value) {
            field = value
            if (value != null && h264Decoder == null) {
                h264Decoder = H264Decoder(value) {
                    // Frame rendered on surface
                }
                h264Decoder?.init()
            }
        }

    private var h264Decoder: H264Decoder? = null

    fun start() {
        if (isRunning.get()) return
        isRunning.set(true)

        streamJob = CoroutineScope(Dispatchers.IO).launch {
            var consecutiveFailures = 0

            while (isActive && isRunning.get()) {
                _connectionState.value = if (consecutiveFailures == 0) StreamConnectionState.CONNECTING else StreamConnectionState.RETRYING

                try {
                    val codecParam = if (preferH264) "h264" else "mjpeg"
                    val streamUrl = "http://$host:$port/stream?token=$securityToken&codec=$codecParam"
                    val url = URL(streamUrl)
                    val connection = (url.openConnection() as HttpURLConnection).apply {
                        connectTimeout = 4000
                        readTimeout = 8000
                        requestMethod = "GET"
                        useCaches = false
                    }

                    connection.connect()

                    if (connection.responseCode == 200) {
                        _connectionState.value = StreamConnectionState.CONNECTED
                        consecutiveFailures = 0

                        val contentType = connection.contentType ?: ""
                        val inputStream = BufferedInputStream(connection.inputStream)

                        if (contentType.contains("video/avc") && preferH264) {
                            _activeCodec.value = "H.264 Full HD (HW)"
                            readH264Stream(inputStream)
                        } else {
                            _activeCodec.value = "MJPEG (Compat)"
                            readMjpegStream(inputStream)
                        }
                    } else {
                        Log.w(tag, "Connection failed with HTTP code: ${connection.responseCode}")
                        consecutiveFailures++
                        if (preferH264 && consecutiveFailures >= 2) {
                            Log.i(tag, "Switching to MJPEG fallback mode")
                            preferH264 = false
                        }
                    }
                } catch (e: CancellationException) {
                    break
                } catch (e: Exception) {
                    if (isRunning.get()) {
                        Log.w(tag, "Stream connection error for $host:$port: ${e.message}")
                        consecutiveFailures++
                        if (preferH264 && consecutiveFailures >= 2) {
                            Log.i(tag, "Switching to MJPEG fallback mode")
                            preferH264 = false
                        }
                        _connectionState.value = StreamConnectionState.RETRYING
                    }
                }

                if (isRunning.get()) {
                    val backoffMs = if (consecutiveFailures < 3) 1500L else 3000L
                    delay(backoffMs)
                }
            }
        }
    }

    private fun readH264Stream(input: BufferedInputStream) {
        val header = ByteArray(4)
        var frameCount = 0
        var byteCount = 0L
        var lastStatTime = System.currentTimeMillis()

        while (isRunning.get()) {
            // Read 4-byte size header
            var read = 0
            while (read < 4) {
                val r = input.read(header, read, 4 - read)
                if (r == -1) return
                read += r
            }

            val packetSize = (
                ((header[0].toInt() and 0xFF) shl 24) or
                ((header[1].toInt() and 0xFF) shl 16) or
                ((header[2].toInt() and 0xFF) shl 8) or
                (header[3].toInt() and 0xFF)
            )

            if (packetSize <= 0 || packetSize > 5_000_000) {
                // Invalid stream header, fallback to MJPEG
                preferH264 = false
                return
            }

            val packet = ByteArray(packetSize)
            var packetRead = 0
            while (packetRead < packetSize) {
                val r = input.read(packet, packetRead, packetSize - packetRead)
                if (r == -1) return
                packetRead += r
            }

            byteCount += (4 + packetSize)
            frameCount++

            // Decode to surface if available
            h264Decoder?.decodePacket(packet, System.nanoTime() / 1000L)

            // Update stats
            val now = System.currentTimeMillis()
            val elapsed = now - lastStatTime
            if (elapsed >= 1000) {
                _currentFps.value = (frameCount * 1000f) / elapsed
                _bitrateKbps.value = (byteCount * 8f) / (elapsed * 1.024f)
                frameCount = 0
                byteCount = 0
                lastStatTime = now
            }
        }
    }

    private fun readMjpegStream(input: BufferedInputStream) {
        val buffer = ByteArray(16384)
        val frameBuffer = ByteArrayOutputStream(65536)
        var prevByte = -1
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
                    if (prevByte == 0xFF && current == 0xD8) {
                        inFrame = true
                        frameBuffer.reset()
                        frameBuffer.write(0xFF)
                        frameBuffer.write(0xD8)
                    }
                } else {
                    frameBuffer.write(current)
                    if (prevByte == 0xFF && current == 0xD9) {
                        inFrame = false
                        val jpegBytes = frameBuffer.toByteArray()

                        if (jpegBytes.size > 100) {
                            try {
                                val opts = BitmapFactory.Options().apply {
                                    inPreferredConfig = Bitmap.Config.RGB_565
                                }
                                val bitmap = BitmapFactory.decodeByteArray(jpegBytes, 0, jpegBytes.size, opts)
                                if (bitmap != null) {
                                    _currentBitmap.value = bitmap
                                    onFrame(bitmap, jpegBytes)
                                    frameCount++
                                }
                            } catch (_: Exception) {}
                        }
                    }
                }
                prevByte = current
            }

            val now = System.currentTimeMillis()
            val elapsed = now - lastStatTime
            if (elapsed >= 1000) {
                _currentFps.value = (frameCount * 1000f) / elapsed
                _bitrateKbps.value = (byteCount * 8f) / (elapsed * 1.024f)
                frameCount = 0
                byteCount = 0
                lastStatTime = now
            }
        }
    }

    fun stop() {
        isRunning.set(false)
        streamJob?.cancel()
        streamJob = null
        h264Decoder?.stop()
        h264Decoder = null
        _connectionState.value = StreamConnectionState.IDLE
        _currentBitmap.value = null
        _currentFps.value = 0f
        _bitrateKbps.value = 0f
    }
}
