package com.example.network

import android.graphics.Bitmap
import android.graphics.Matrix
import android.media.Image
import android.media.ImageReader
import android.media.MediaCodec
import android.media.MediaFormat
import android.media.MediaCodecInfo
import android.media.MediaCodecList
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.graphics.ImageFormat
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Hardware AVC decoder. Its YUV output is copied into the existing bitmap-based UI/recorder
 * pipeline, while the LAN transport itself remains H.264 (not MJPEG).
 */
class H264StreamDecoder(
    private val format: H264StreamFormat,
    private val onFrame: (Bitmap, ByteArray) -> Unit
) {
    private val tag = "H264StreamDecoder"
    private val running = AtomicBoolean(false)
    private val handlerThread = HandlerThread("H264ImageOutput").apply { start() }
    private val handler = Handler(handlerThread.looper)
    private val imageReader = ImageReader.newInstance(
        format.width,
        format.height,
        ImageFormat.YUV_420_888,
        3
    )
    private var decoder: MediaCodec? = null
    private var lastJpegAt = 0L
    @Volatile private var latestJpeg: ByteArray? = null

    init {
        imageReader.setOnImageAvailableListener({ reader ->
            val image = reader.acquireLatestImage() ?: return@setOnImageAvailableListener
            try {
                val bitmap = imageToBitmap(image, format.rotationDegrees)
                val now = System.currentTimeMillis()
                var jpeg = latestJpeg
                if (jpeg == null || now - lastJpegAt >= 500L) {
                    val output = ByteArrayOutputStream()
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 88, output)
                    jpeg = output.toByteArray()
                    latestJpeg = jpeg
                    lastJpegAt = now
                }
                if (jpeg != null) onFrame(bitmap, jpeg!!)
            } catch (e: Exception) {
                Log.w(tag, "Unable to convert decoded H.264 frame", e)
            } finally {
                image.close()
            }
        }, handler)

        val mediaFormat = MediaFormat.createVideoFormat(
            MediaFormat.MIMETYPE_VIDEO_AVC,
            format.width,
            format.height
        )
        if (format.csd0.isNotEmpty()) mediaFormat.setByteBuffer("csd-0", ByteBuffer.wrap(format.csd0))
        if (format.csd1.isNotEmpty()) mediaFormat.setByteBuffer("csd-1", ByteBuffer.wrap(format.csd1))
        mediaFormat.setInteger(MediaFormat.KEY_FRAME_RATE, 30)

        val decoderInfo = MediaCodecList(MediaCodecList.REGULAR_CODECS).codecInfos
            .asSequence()
            .filter { !it.isEncoder && it.supportedTypes.any { type -> type.equals(MediaFormat.MIMETYPE_VIDEO_AVC, true) } }
            .filter {
                val hardware = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) it.isHardwareAccelerated
                else !it.name.startsWith("OMX.google.", true) && !it.name.startsWith("c2.android.", true)
                hardware
            }
            .firstOrNull {
                try {
                    val video = it.getCapabilitiesForType(MediaFormat.MIMETYPE_VIDEO_AVC).videoCapabilities
                    video != null && (video.areSizeAndRateSupported(format.width, format.height, 30.0) ||
                        video.areSizeAndRateSupported(format.height, format.width, 30.0))
                } catch (_: Exception) { false }
            } ?: throw IllegalStateException("No compatible hardware H.264 decoder")

        decoder = MediaCodec.createByCodecName(decoderInfo.name).also {
            it.configure(mediaFormat, imageReader.surface, null, 0)
            it.start()
        }
        running.set(true)
    }

    fun queueAccessUnit(bytes: ByteArray, presentationTimeUs: Long, keyFrame: Boolean) {
        val codec = decoder ?: return
        if (!running.get()) return
        try {
            val inputIndex = codec.dequeueInputBuffer(10_000)
            if (inputIndex < 0) return
            val input = codec.getInputBuffer(inputIndex) ?: return
            input.clear()
            if (bytes.size > input.remaining()) {
                codec.queueInputBuffer(inputIndex, 0, 0, presentationTimeUs, 0)
                return
            }
            input.put(bytes)
            codec.queueInputBuffer(inputIndex, 0, bytes.size, presentationTimeUs, 0)
            drainDecoder(codec)
        } catch (e: Exception) {
            Log.w(tag, "H.264 decode input failed", e)
        }
    }

    private fun drainDecoder(codec: MediaCodec) {
        val info = MediaCodec.BufferInfo()
        while (true) {
            val index = codec.dequeueOutputBuffer(info, 0)
            if (index >= 0) {
                codec.releaseOutputBuffer(index, true)
            } else if (index == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED ||
                index == MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED
            ) {
                continue
            } else {
                return
            }
        }
    }

    private fun imageToBitmap(image: Image, rotation: Int): Bitmap {
        val crop = image.cropRect
        val width = crop.width()
        val height = crop.height()
        val planes = image.planes
        val yPlane = planes[0]
        val uPlane = planes[1]
        val vPlane = planes[2]
        val yBuffer = yPlane.buffer.duplicate()
        val uBuffer = uPlane.buffer.duplicate()
        val vBuffer = vPlane.buffer.duplicate()
        val pixels = IntArray(width * height)
        for (row in 0 until height) {
            val sourceY = row + crop.top
            for (col in 0 until width) {
                val sourceX = col + crop.left
                val yValue = (yBuffer.get(sourceY * yPlane.rowStride + sourceX * yPlane.pixelStride).toInt() and 0xff)
                val chromaX = sourceX / 2
                val chromaY = sourceY / 2
                val uValue = (uBuffer.get(chromaY * uPlane.rowStride + chromaX * uPlane.pixelStride).toInt() and 0xff) - 128
                val vValue = (vBuffer.get(chromaY * vPlane.rowStride + chromaX * vPlane.pixelStride).toInt() and 0xff) - 128
                val c = (yValue - 16).coerceAtLeast(0)
                val r = ((298 * c + 409 * vValue + 128) shr 8).coerceIn(0, 255)
                val g = ((298 * c - 100 * uValue - 208 * vValue + 128) shr 8).coerceIn(0, 255)
                val b = ((298 * c + 516 * uValue + 128) shr 8).coerceIn(0, 255)
                pixels[row * width + col] = (0xff shl 24) or (r shl 16) or (g shl 8) or b
            }
        }
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        bitmap.setPixels(pixels, 0, width, 0, 0, width, height)
        if (rotation == 0) return bitmap
        val matrix = Matrix().apply { postRotate(rotation.toFloat()) }
        return Bitmap.createBitmap(bitmap, 0, 0, width, height, matrix, true)
    }

    fun release() {
        running.set(false)
        try { decoder?.stop() } catch (_: Exception) {}
        try { decoder?.release() } catch (_: Exception) {}
        decoder = null
        try { imageReader.close() } catch (_: Exception) {}
        handlerThread.quitSafely()
    }
}
