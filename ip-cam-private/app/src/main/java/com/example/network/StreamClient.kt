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

    private val _currentBitmap = MutableStateFlow<Bitmap?>(null)
    val currentBitmap: StateFlow<Bitmap?> = _currentBitmap.asStateFlow()

    private val _currentFps = MutableStateFlow(0f)
    val currentFps: StateFlow<Float> = _currentFps.asStateFlow()

    private val _bitrateKbps = MutableStateFlow(0f)
    val bitrateKbps: StateFlow<Float> = _bitrateKbps.asStateFlow()

    private var streamJob: Job? = null
    private val isRunning = AtomicBoolean(false)

    fun start() {
        if (isRunning.get()) return
        isRunning.set(true)

        streamJob = CoroutineScope(Dispatchers.IO).launch {
            var consecutiveFailures = 0

            while (isActive && isRunning.get()) {
                _connectionState.value = if (consecutiveFailures == 0) StreamConnectionState.CONNECTING else StreamConnectionState.RETRYING

                try {
                    val streamUrl = "http://$host:$port/stream?token=$securityToken"
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

                        val inputStream = BufferedInputStream(connection.inputStream)
                        readMjpegStream(inputStream)
                    } else {
                        Log.w(tag, "Connection failed with HTTP code: ${connection.responseCode}")
                        consecutiveFailures++
                    }
                } catch (e: kotlinx.coroutines.CancellationException) {
                    break
                } catch (e: Exception) {
                    if (isRunning.get()) {
                        Log.w(tag, "Stream connection error for $host:$port: ${e.message}")
                        consecutiveFailures++
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

    private fun readMjpegStream(input: BufferedInputStream) {
        val buffer = ByteArray(16384)
        val frameBuffer = ByteArrayOutputStream(262144)
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
                    // Look for JPEG SOI: 0xFF, 0xD8
                    if (prevByte == 0xFF && current == 0xD8) {
                        inFrame = true
                        frameBuffer.reset()
                        frameBuffer.write(0xFF)
                        frameBuffer.write(0xD8)
                    }
                } else {
                    frameBuffer.write(current)
                    // Look for JPEG EOI: 0xFF, 0xD9
                    if (prevByte == 0xFF && current == 0xD9) {
                        inFrame = false
                        val jpegBytes = frameBuffer.toByteArray()

                        if (jpegBytes.size > 100) {
                            try {
                                val opts = BitmapFactory.Options().apply {
                                    inPreferredConfig = Bitmap.Config.ARGB_8888 // Preserve full color depth for the live view
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

            // Calculate FPS & Bitrate every second
            val now = System.currentTimeMillis()
            val elapsed = now - lastStatTime
            if (elapsed >= 1000) {
                _currentFps.value = (frameCount * 1000f) / elapsed
                _bitrateKbps.value = (byteCount * 8f) / (elapsed * 1.024f) // kbps
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
        _connectionState.value = StreamConnectionState.IDLE
        _currentBitmap.value = null
        _currentFps.value = 0f
        _bitrateKbps.value = 0f
    }
}
