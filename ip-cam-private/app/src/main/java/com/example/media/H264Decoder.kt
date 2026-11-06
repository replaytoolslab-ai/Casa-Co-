package com.example.media

import android.media.MediaCodec
import android.media.MediaFormat
import android.util.Log
import android.view.Surface
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Real-time Hardware H.264 (AVC) Video Decoder on the CONTROLLO phone.
 * Renders decoded NAL units directly to an output Surface at zero CPU cost.
 */
class H264Decoder(
    private val surface: Surface?,
    private val onFrameDecoded: () -> Unit = {}
) {
    private val tag = "H264Decoder"

    private var decoder: MediaCodec? = null
    private val isRunning = AtomicBoolean(false)
    private var isConfigured = false

    var isHardwareSupported: Boolean = true
        private set

    fun init(width: Int = 1920, height: Int = 1080): Boolean {
        return try {
            val format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height)
            val codec = MediaCodec.createDecoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
            codec.configure(format, surface, null, 0)
            codec.start()

            decoder = codec
            isRunning.set(true)
            isConfigured = true
            isHardwareSupported = true
            Log.i(tag, "H.264 Hardware Decoder started (${width}x${height})")
            true
        } catch (e: Exception) {
            Log.e(tag, "H.264 Hardware Decoder failed to initialize", e)
            isHardwareSupported = false
            cleanup()
            false
        }
    }

    fun decodePacket(data: ByteArray, timestampUs: Long) {
        val codec = decoder ?: return
        if (!isRunning.get()) return

        try {
            val inputIndex = codec.dequeueInputBuffer(4000L)
            if (inputIndex >= 0) {
                val inputBuffer = codec.getInputBuffer(inputIndex)
                if (inputBuffer != null) {
                    inputBuffer.clear()
                    inputBuffer.put(data)
                    codec.queueInputBuffer(inputIndex, 0, data.size, timestampUs, 0)
                }
            }

            val bufferInfo = MediaCodec.BufferInfo()
            var outputIndex = codec.dequeueOutputBuffer(bufferInfo, 0L)
            while (outputIndex >= 0) {
                // Render to surface in real-time
                codec.releaseOutputBuffer(outputIndex, true)
                onFrameDecoded()
                outputIndex = codec.dequeueOutputBuffer(bufferInfo, 0L)
            }
        } catch (e: Exception) {
            Log.w(tag, "H.264 decode error", e)
        }
    }

    fun stop() {
        isRunning.set(false)
        cleanup()
    }

    private fun cleanup() {
        try {
            decoder?.stop()
            decoder?.release()
        } catch (_: Exception) {}
        decoder = null
        isConfigured = false
    }
}
