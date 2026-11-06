package com.example.network

import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaCodecList
import android.media.MediaFormat
import android.os.Build
import android.util.Log
import androidx.camera.core.ImageProxy
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicBoolean

data class H264StreamFormat(
    val width: Int,
    val height: Int,
    val rotationDegrees: Int,
    val csd0: ByteArray,
    val csd1: ByteArray
)

/**
 * Hardware AVC encoder fed directly from CameraX YUV_420_888 frames.
 * The encoder never writes media to the TELECAMERA device.
 */
class H264StreamEncoder(
    private val onFormat: (H264StreamFormat) -> Unit,
    private val onAccessUnit: (bytes: ByteArray, presentationTimeUs: Long, keyFrame: Boolean) -> Unit
) {
    private val tag = "H264StreamEncoder"
    private var codec: MediaCodec? = null
    private var width = 0
    private var height = 0
    private var rotationDegrees = 0
    private var colorFormat = MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible
    private val running = AtomicBoolean(false)
    private val bufferInfo = MediaCodec.BufferInfo()
    private var formatSent = false

    fun start(frameWidth: Int, frameHeight: Int, rotation: Int): Boolean {
        if (running.get()) return true
        width = frameWidth
        height = frameHeight
        rotationDegrees = rotation
        return try {
            val info = selectHardwareEncoder(frameWidth, frameHeight) ?: return false
            val caps = info.getCapabilitiesForType(MediaFormat.MIMETYPE_VIDEO_AVC)
            colorFormat = when {
                caps.colorFormats.contains(MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar) ->
                    MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar
                caps.colorFormats.contains(MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Planar) ->
                    MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Planar
                else -> return false
            }

            val format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height).apply {
                setInteger(MediaFormat.KEY_COLOR_FORMAT, colorFormat)
                setInteger(MediaFormat.KEY_BIT_RATE, 6_000_000)
                setInteger(MediaFormat.KEY_FRAME_RATE, 30)
                setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    setInteger(MediaFormat.KEY_BITRATE_MODE, MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_VBR)
                }
            }

            codec = MediaCodec.createByCodecName(info.name).also {
                it.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
                it.start()
            }
            running.set(true)
            Log.i(tag, "Hardware encoder started: ${info.name} ${width}x$height")
            true
        } catch (e: Exception) {
            Log.e(tag, "Unable to start hardware H.264 encoder", e)
            stop()
            false
        }
    }

    fun encode(image: ImageProxy) {
        val encoder = codec ?: return
        if (!running.get() || image.width != width || image.height != height) return
        try {
            val inputIndex = encoder.dequeueInputBuffer(0)
            if (inputIndex >= 0) {
                val input = encoder.getInputBuffer(inputIndex)
                if (input != null) {
                    input.clear()
                    packI420(image, input)
                    val ptsUs = image.imageInfo.timestamp / 1000L
                    encoder.queueInputBuffer(inputIndex, 0, input.position(), ptsUs, 0)
                } else {
                    encoder.queueInputBuffer(inputIndex, 0, 0, image.imageInfo.timestamp / 1000L, 0)
                }
            }
            drainEncoder(encoder)
        } catch (e: Exception) {
            Log.w(tag, "H.264 frame encode failed; switching to MJPEG fallback", e)
            stop()
        }
    }

    private fun packI420(image: ImageProxy, output: ByteBuffer) {
        val ySize = width * height
        val chromaWidth = width / 2
        val chromaHeight = height / 2
        val required = ySize + 2 * chromaWidth * chromaHeight
        require(output.remaining() >= required) { "Encoder input buffer too small" }

        val y = image.planes[0]
        val u = image.planes[1]
        val v = image.planes[2]
        copyPlane(y.buffer, y.rowStride, y.pixelStride, width, height, output)
        if (colorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar) {
            val uBuffer = u.buffer.duplicate()
            val vBuffer = v.buffer.duplicate()
            for (row in 0 until chromaHeight) {
                for (col in 0 until chromaWidth) {
                    output.put(uBuffer.get(row * u.rowStride + col * u.pixelStride))
                    output.put(vBuffer.get(row * v.rowStride + col * v.pixelStride))
                }
            }
        } else {
            copyPlane(u.buffer, u.rowStride, u.pixelStride, chromaWidth, chromaHeight, output)
            copyPlane(v.buffer, v.rowStride, v.pixelStride, chromaWidth, chromaHeight, output)
        }
    }

    private fun copyPlane(
        source: ByteBuffer,
        rowStride: Int,
        pixelStride: Int,
        planeWidth: Int,
        planeHeight: Int,
        output: ByteBuffer
    ) {
        val buffer = source.duplicate()
        for (row in 0 until planeHeight) {
            val rowStart = row * rowStride
            for (col in 0 until planeWidth) {
                output.put(buffer.get(rowStart + col * pixelStride))
            }
        }
    }

    private fun drainEncoder(encoder: MediaCodec) {
        while (true) {
            val index = encoder.dequeueOutputBuffer(bufferInfo, 0)
            when {
                index == MediaCodec.INFO_TRY_AGAIN_LATER -> return
                index == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> publishFormat(encoder.outputFormat)
                index >= 0 -> {
                    val buffer = encoder.getOutputBuffer(index)
                    if (buffer != null && bufferInfo.size > 0 &&
                        (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG) == 0
                    ) {
                        val data = ByteArray(bufferInfo.size)
                        buffer.position(bufferInfo.offset)
                        buffer.limit(bufferInfo.offset + bufferInfo.size)
                        buffer.get(data)
                        val key = (bufferInfo.flags and MediaCodec.BUFFER_FLAG_KEY_FRAME) != 0
                        onAccessUnit(data, bufferInfo.presentationTimeUs, key)
                    }
                    encoder.releaseOutputBuffer(index, false)
                }
                else -> return
            }
        }
    }

    private fun publishFormat(format: MediaFormat) {
        if (formatSent) return
        val csd0 = format.getByteBuffer("csd-0")?.let { copyBuffer(it) } ?: ByteArray(0)
        val csd1 = format.getByteBuffer("csd-1")?.let { copyBuffer(it) } ?: ByteArray(0)
        if (csd0.isEmpty() && csd1.isEmpty()) return
        formatSent = true
        onFormat(H264StreamFormat(width, height, rotationDegrees, csd0, csd1))
    }

    private fun copyBuffer(source: ByteBuffer): ByteArray {
        val buffer = source.duplicate()
        val data = ByteArray(buffer.remaining())
        buffer.get(data)
        return data
    }

    private fun selectHardwareEncoder(w: Int, h: Int): MediaCodecInfo? {
        return MediaCodecList(MediaCodecList.REGULAR_CODECS).codecInfos
            .asSequence()
            .filter { it.isEncoder && it.supportedTypes.any { type -> type.equals(MediaFormat.MIMETYPE_VIDEO_AVC, true) } }
            .filter {
                val hardware = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) it.isHardwareAccelerated
                else !it.name.startsWith("OMX.google.", true) && !it.name.startsWith("c2.android.", true)
                hardware
            }
            .filter {
                try {
                    val caps = it.getCapabilitiesForType(MediaFormat.MIMETYPE_VIDEO_AVC)
                    val video = caps.videoCapabilities
                    video != null && video.areSizeAndRateSupported(w, h, 30.0) &&
                        caps.colorFormats.any { c ->
                            c == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Planar ||
                                c == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar
                        }
                } catch (_: Exception) { false }
            }
            .firstOrNull()
    }

    fun stop() {
        running.set(false)
        val current = codec
        codec = null
        try { current?.stop() } catch (_: Exception) {}
        try { current?.release() } catch (_: Exception) {}
        formatSent = false
    }
}
