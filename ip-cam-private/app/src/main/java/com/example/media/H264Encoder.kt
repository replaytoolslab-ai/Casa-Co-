package com.example.media

import android.graphics.Bitmap
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaCodecList
import android.media.MediaFormat
import android.util.Log
import androidx.camera.core.ImageProxy
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Real-time Hardware-Accelerated H.264 (AVC) Video Encoder for TELECAMERA.
 * Uses Android MediaCodec with YUV420 / NV12 buffers for 100% universal compatibility across all Android devices.
 */
class H264Encoder(
    var width: Int = 1920,
    var height: Int = 1080,
    private val bitRate: Int = 3_500_000,
    private val frameRate: Int = 30,
    private val onPacket: (data: ByteArray, isKeyFrame: Boolean, timestampUs: Long) -> Unit
) {
    private val tag = "H264Encoder"

    private var encoder: MediaCodec? = null
    private val isRunning = AtomicBoolean(false)
    private var processingJob: Job? = null

    private val yuvQueue = LinkedBlockingQueue<Pair<ByteArray, Long>>(10)
    var isHardwareSupported: Boolean = true
        private set

    // Cached SPS and PPS parameter sets for new connecting clients
    var spsPpsHeader: ByteArray? = null
        private set

    var colorFormat: Int = MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible
        private set

    fun start(): Boolean {
        if (isRunning.get()) return true

        return try {
            val codec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
            val selectedColor = selectSupportedColorFormat(codec)
            colorFormat = selectedColor

            val format = createFormat(width, height, selectedColor)

            try {
                codec.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
            } catch (e: Exception) {
                Log.w(tag, "1080p configuration failed, falling back to 720p", e)
                width = 1280
                height = 720
                val fallbackFormat = createFormat(width, height, selectedColor)
                codec.configure(fallbackFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
            }

            codec.start()
            encoder = codec

            isRunning.set(true)
            isHardwareSupported = true

            processingJob = CoroutineScope(Dispatchers.Default).launch {
                runEncodingLoop()
            }
            Log.i(tag, "H.264 Hardware Encoder started: ${width}x${height} @ ${frameRate}fps (colorFormat: $selectedColor)")
            true
        } catch (e: Exception) {
            Log.e(tag, "Failed to start H.264 hardware encoder; will fall back to MJPEG", e)
            isHardwareSupported = false
            cleanup()
            false
        }
    }

    private fun selectSupportedColorFormat(codec: MediaCodec): Int {
        val caps = codec.codecInfo.getCapabilitiesForType(MediaFormat.MIMETYPE_VIDEO_AVC)
        val preferred = intArrayOf(
            MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar,
            MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Planar,
            MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible
        )
        for (format in preferred) {
            if (caps.colorFormats.contains(format)) {
                return format
            }
        }
        return MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible
    }

    private fun createFormat(w: Int, h: Int, color: Int): MediaFormat {
        return MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, w, h).apply {
            setInteger(MediaFormat.KEY_COLOR_FORMAT, color)
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
            setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
            setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1) // Keyframe every 1s
        }
    }

    fun encodeImageProxy(image: ImageProxy) {
        if (!isRunning.get() || encoder == null) return
        if (yuvQueue.size >= 8) {
            yuvQueue.poll() // Drop older frame to prevent delay
        }

        try {
            val nv12 = imageProxyToNV12(image)
            yuvQueue.offer(Pair(nv12, image.imageInfo.timestamp / 1000L))
        } catch (_: Exception) {}
    }

    fun encodeFrame(bitmap: Bitmap) {
        encodeBitmap(bitmap)
    }

    fun encodeBitmap(bitmap: Bitmap, timestampUs: Long = System.nanoTime() / 1000L) {
        if (!isRunning.get() || encoder == null) return
        if (yuvQueue.size >= 8) {
            yuvQueue.poll()
        }

        try {
            val nv12 = bitmapToNV12(bitmap, width, height)
            yuvQueue.offer(Pair(nv12, timestampUs))
        } catch (_: Exception) {}
    }

    private fun runEncodingLoop() {
        val bufferInfo = MediaCodec.BufferInfo()

        while (isRunning.get()) {
            val item = yuvQueue.poll(40, TimeUnit.MILLISECONDS)
            val codec = encoder ?: break

            if (item != null) {
                val (yuvData, timestampUs) = item
                try {
                    val inputIndex = codec.dequeueInputBuffer(4000L)
                    if (inputIndex >= 0) {
                        val inputBuffer = codec.getInputBuffer(inputIndex)
                        if (inputBuffer != null) {
                            inputBuffer.clear()
                            val toCopy = minOf(inputBuffer.remaining(), yuvData.size)
                            inputBuffer.put(yuvData, 0, toCopy)
                            codec.queueInputBuffer(inputIndex, 0, toCopy, timestampUs, 0)
                        }
                    }
                } catch (e: Exception) {
                    Log.w(tag, "Queue input buffer error", e)
                }
            }

            drainEncoder(bufferInfo)
        }

        cleanup()
    }

    private fun drainEncoder(bufferInfo: MediaCodec.BufferInfo) {
        val codec = encoder ?: return

        while (isRunning.get()) {
            val outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, 3000L)
            if (outputBufferIndex == MediaCodec.INFO_TRY_AGAIN_LATER) {
                break
            } else if (outputBufferIndex >= 0) {
                val encodedData = codec.getOutputBuffer(outputBufferIndex)
                if (encodedData != null && bufferInfo.size > 0) {
                    encodedData.position(bufferInfo.offset)
                    encodedData.limit(bufferInfo.offset + bufferInfo.size)

                    val packet = ByteArray(bufferInfo.size)
                    encodedData.get(packet)

                    val isConfig = (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG) != 0
                    val isKeyFrame = (bufferInfo.flags and MediaCodec.BUFFER_FLAG_KEY_FRAME) != 0

                    if (isConfig) {
                        spsPpsHeader = packet
                    } else {
                        val fullPacket = if (isKeyFrame && spsPpsHeader != null) {
                            val baos = ByteArrayOutputStream()
                            baos.write(spsPpsHeader!!)
                            baos.write(packet)
                            baos.toByteArray()
                        } else {
                            packet
                        }
                        onPacket(fullPacket, isKeyFrame, bufferInfo.presentationTimeUs)
                    }

                    codec.releaseOutputBuffer(outputBufferIndex, false)
                }
            }
        }
    }

    fun stop() {
        isRunning.set(false)
        processingJob?.cancel()
        processingJob = null
        cleanup()
    }

    private fun cleanup() {
        try {
            encoder?.stop()
            encoder?.release()
        } catch (_: Exception) {}
        encoder = null
        yuvQueue.clear()
        isRunning.set(false)
    }

    companion object {
        fun imageProxyToNV12(image: ImageProxy): ByteArray {
            val width = image.width
            val height = image.height
            val nv12 = ByteArray(width * height * 3 / 2)

            val yBuffer = image.planes[0].buffer
            val uBuffer = image.planes[1].buffer
            val vBuffer = image.planes[2].buffer

            val yRowStride = image.planes[0].rowStride
            val uvRowStride = image.planes[1].rowStride
            val uvPixelStride = image.planes[1].pixelStride

            // Copy Y
            var destOffset = 0
            val yBytes = ByteArray(width)
            for (row in 0 until height) {
                yBuffer.position(row * yRowStride)
                val remaining = minOf(width, yBuffer.remaining())
                yBuffer.get(yBytes, 0, remaining)
                System.arraycopy(yBytes, 0, nv12, destOffset, remaining)
                destOffset += width
            }

            // Copy UV (NV12: interleaved U then V)
            val uvHeight = height / 2
            val uvWidth = width / 2
            for (row in 0 until uvHeight) {
                for (col in 0 until uvWidth) {
                    val uPos = row * uvRowStride + col * uvPixelStride
                    val vPos = row * uvRowStride + col * uvPixelStride
                    if (uPos < uBuffer.limit()) {
                        nv12[destOffset++] = uBuffer.get(uPos)
                    }
                    if (vPos < vBuffer.limit()) {
                        nv12[destOffset++] = vBuffer.get(vPos)
                    }
                }
            }
            return nv12
        }

        fun bitmapToNV12(bitmap: Bitmap, width: Int, height: Int): ByteArray {
            val scaled = if (bitmap.width != width || bitmap.height != height) {
                Bitmap.createScaledBitmap(bitmap, width, height, true)
            } else bitmap

            val argb = IntArray(width * height)
            scaled.getPixels(argb, 0, width, 0, 0, width, height)

            val nv12 = ByteArray(width * height * 3 / 2)
            var yIndex = 0
            var uvIndex = width * height

            for (j in 0 until height) {
                for (i in 0 until width) {
                    val pixel = argb[j * width + i]
                    val r = (pixel shr 16) and 0xFF
                    val g = (pixel shr 8) and 0xFF
                    val b = pixel and 0xFF

                    // Standard Rec. 601 RGB to YUV formula
                    val y = (66 * r + 129 * g + 25 * b + 128 shr 8) + 16
                    nv12[yIndex++] = y.coerceIn(0, 255).toByte()

                    if (j % 2 == 0 && i % 2 == 0) {
                        val u = (-38 * r - 74 * g + 112 * b + 128 shr 8) + 128
                        val v = (112 * r - 94 * g - 18 * b + 128 shr 8) + 128
                        nv12[uvIndex++] = u.coerceIn(0, 255).toByte()
                        nv12[uvIndex++] = v.coerceIn(0, 255).toByte()
                    }
                }
            }
            return nv12
        }
    }
}
