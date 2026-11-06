package com.example.media

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.media.MediaMuxer
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.util.Log
import android.view.Surface
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Real-time hardware-accelerated video recording engine on the CONTROLLO device.
 * Encodes live incoming stream frames using Android MediaCodec (H.264/AVC) and MediaMuxer into MP4.
 */
class VideoRecordingEngine(
    private val storageManager: CentralStorageManager,
    private val cameraName: String,
    private val width: Int = 1280,
    private val height: Int = 720,
    private val bitRate: Int = 2_500_000,
    private val frameRate: Int = 25
) {
    private val tag = "VideoRecordingEngine"

    private val isRecording = AtomicBoolean(false)
    private var encoder: MediaCodec? = null
    private var muxer: MediaMuxer? = null
    private var inputSurface: Surface? = null
    private var videoTrackIndex = -1
    private var isMuxerStarted = false

    private var targetUri: Uri? = null
    private var targetPfd: ParcelFileDescriptor? = null

    private val frameQueue = LinkedBlockingQueue<Bitmap>(30)
    private var processingJob: Job? = null
    private var startTimeNs = 0L
    private var recordedFramesCount = 0L

    private val timeFormat = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault())
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textSize = 28f
        setShadowLayer(4f, 2f, 2f, Color.BLACK)
    }

    suspend fun start(): Boolean {
        if (isRecording.get()) return false

        try {
            val fileResult = storageManager.createVideoFileDescriptor(cameraName)
            if (fileResult == null) {
                Log.e(tag, "Failed to create video file in Movies/IP CAM PRIVATE")
                return false
            }

            targetUri = fileResult.first
            targetPfd = fileResult.second

            // Configure MediaFormat for H.264
            val format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, width, height).apply {
                setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
                setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
                setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
                setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1) // Keyframe every 1 second
            }

            encoder = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC).apply {
                configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
                inputSurface = createInputSurface()
                start()
            }

            muxer = MediaMuxer(targetPfd!!.fileDescriptor, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            isMuxerStarted = false
            videoTrackIndex = -1

            isRecording.set(true)
            startTimeNs = System.nanoTime()
            recordedFramesCount = 0L

            processingJob = CoroutineScope(Dispatchers.Default).launch {
                runEncoderLoop()
            }

            Log.i(tag, "Recording started for camera: $cameraName to ${targetUri}")
            return true
        } catch (e: Exception) {
            Log.e(tag, "Failed to initialize recorder", e)
            cleanup()
            return false
        }
    }

    /**
     * Submit a received frame to be recorded into the MP4 file.
     */
    fun enqueueFrame(bitmap: Bitmap) {
        if (!isRecording.get()) return
        // Keep queue from overflowing if network bursts
        if (frameQueue.size >= 25) {
            val dropped = frameQueue.poll()
            // let GC collect
        }
        try {
            // Copy or pass bitmap
            frameQueue.offer(bitmap.copy(bitmap.config ?: Bitmap.Config.ARGB_8888, false))
        } catch (_: Exception) {
        }
    }

    private fun runEncoderLoop() {
        val bufferInfo = MediaCodec.BufferInfo()
        val destRect = Rect(0, 0, width, height)

        while (isRecording.get() || frameQueue.isNotEmpty()) {
            val bitmap = frameQueue.poll(50, TimeUnit.MILLISECONDS)
            if (bitmap != null && inputSurface != null) {
                try {
                    val canvas: Canvas? = inputSurface?.lockCanvas(null)
                    if (canvas != null) {
                        canvas.drawColor(Color.BLACK)
                        val srcRect = Rect(0, 0, bitmap.width, bitmap.height)
                        canvas.drawBitmap(bitmap, srcRect, destRect, null)

                        // Watermark with camera name and timestamp
                        val timestampStr = "$cameraName • ${timeFormat.format(Date())}"
                        canvas.drawText(timestampStr, 24f, height - 24f, textPaint)

                        inputSurface?.unlockCanvasAndPost(canvas)
                        recordedFramesCount++
                    }
                } catch (e: Exception) {
                    Log.w(tag, "Canvas draw error", e)
                }
            }

            drainEncoder(bufferInfo, endOfStream = false)
        }

        // Finalize end of stream
        try {
            encoder?.signalEndOfInputStream()
            drainEncoder(bufferInfo, endOfStream = true)
        } catch (e: Exception) {
            Log.w(tag, "Drain EOS error", e)
        }

        cleanup()
    }

    private fun drainEncoder(bufferInfo: MediaCodec.BufferInfo, endOfStream: Boolean) {
        val enc = encoder ?: return
        val mux = muxer ?: return

        while (true) {
            val outputBufferIndex = enc.dequeueOutputBuffer(bufferInfo, 10000L)
            if (outputBufferIndex == MediaCodec.INFO_TRY_AGAIN_LATER) {
                if (!endOfStream) break else continue
            } else if (outputBufferIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                if (isMuxerStarted) {
                    throw RuntimeException("Format changed twice")
                }
                val newFormat = enc.outputFormat
                videoTrackIndex = mux.addTrack(newFormat)
                mux.start()
                isMuxerStarted = true
                Log.d(tag, "Muxer started with track: $videoTrackIndex")
            } else if (outputBufferIndex >= 0) {
                val encodedData = enc.getOutputBuffer(outputBufferIndex)
                if (encodedData != null) {
                    if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0) {
                        bufferInfo.size = 0
                    }

                    if (bufferInfo.size != 0 && isMuxerStarted) {
                        encodedData.position(bufferInfo.offset)
                        encodedData.limit(bufferInfo.offset + bufferInfo.size)
                        mux.writeSampleData(videoTrackIndex, encodedData, bufferInfo)
                    }

                    enc.releaseOutputBuffer(outputBufferIndex, false)

                    if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) {
                        break
                    }
                }
            }
        }
    }

    suspend fun stop(): Uri? {
        if (!isRecording.getAndSet(false)) return targetUri

        processingJob?.join()
        targetUri?.let { uri ->
            storageManager.finalizeVideo(uri)
        }
        val saved = targetUri
        targetUri = null
        return saved
    }

    private fun cleanup() {
        try {
            encoder?.stop()
            encoder?.release()
        } catch (_: Exception) {}
        encoder = null

        try {
            if (isMuxerStarted) {
                muxer?.stop()
            }
            muxer?.release()
        } catch (_: Exception) {}
        muxer = null

        inputSurface?.release()
        inputSurface = null

        try {
            targetPfd?.close()
        } catch (_: Exception) {}
        targetPfd = null

        frameQueue.clear()
        isRecording.set(false)
        Log.i(tag, "Recorder cleaned up. Frames recorded: $recordedFramesCount")
    }

    fun isCurrentlyRecording(): Boolean = isRecording.get()
}
