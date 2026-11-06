package com.example.camera

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.util.Log
import android.util.Size
import androidx.camera.core.Camera
import androidx.camera.core.CameraControl
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.example.network.H264StreamEncoder
import com.example.network.H264StreamFormat
import java.io.ByteArrayOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class CameraManager(private val context: Context) {
    private val tag = "CameraManager"
    private var cameraProvider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var cameraControl: CameraControl? = null
    private var cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()

    var isFrontCamera: Boolean = false
        private set
    var isTorchEnabled: Boolean = false
        private set
    var isNightModeEnabled: Boolean = false
        private set
    private var previousExposureIndex: Int? = null

    private val isStreamingActive = AtomicBoolean(false)
    private var frameListener: ((jpegBytes: ByteArray, bitmap: Bitmap) -> Unit)? = null
    private var h264FormatListener: ((H264StreamFormat) -> Unit)? = null
    private var h264FrameListener: ((bytes: ByteArray, presentationTimeUs: Long, keyFrame: Boolean) -> Unit)? = null
    private var shouldEncodeJpeg: () -> Boolean = { true }
    private var h264Encoder: H264StreamEncoder? = null
    private var h264EncoderAttempted = false
    private var qrListener: ((code: String) -> Unit)? = null

    fun initialize(onReady: () -> Unit) {
        val future = ProcessCameraProvider.getInstance(context)
        future.addListener({
            try {
                cameraProvider = future.get()
                onReady()
            } catch (e: Exception) {
                Log.e(tag, "CameraProvider init failed", e)
            }
        }, ContextCompat.getMainExecutor(context))
    }

    fun startCameraForStreaming(
        lifecycleOwner: LifecycleOwner,
        previewView: PreviewView?,
        onFrame: (jpegBytes: ByteArray, bitmap: Bitmap) -> Unit,
        onH264Format: (H264StreamFormat) -> Unit = {},
        onH264Frame: (bytes: ByteArray, presentationTimeUs: Long, keyFrame: Boolean) -> Unit = { _, _, _ -> },
        shouldEncodeJpeg: () -> Boolean = { true }
    ) {
        val provider = cameraProvider ?: return
        this.frameListener = onFrame
        this.h264FormatListener = onH264Format
        this.h264FrameListener = onH264Frame
        this.shouldEncodeJpeg = shouldEncodeJpeg
        isStreamingActive.set(true)
        h264Encoder?.stop()
        h264Encoder = null
        h264EncoderAttempted = false

        try {
            provider.unbindAll()
            val selector = if (isFrontCamera) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
            val preview = Preview.Builder().build()
            previewView?.let { preview.surfaceProvider = it.surfaceProvider }

            val imageAnalysis = ImageAnalysis.Builder()
                .setTargetResolution(Size(1920, 1080))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy -> processStreamFrame(imageProxy) }
            camera = provider.bindToLifecycle(lifecycleOwner, selector, preview, imageAnalysis)
            cameraControl = camera?.cameraControl
            applyNightModeIfEnabled()
            Log.i(tag, "Camera bound for streaming (facing: ${if (isFrontCamera) "FRONT" else "BACK"}; requested: 1920x1080)")
        } catch (e: Exception) {
            Log.e(tag, "Failed to bind camera for streaming", e)
        }
    }

    fun startCameraForQrScanning(
        lifecycleOwner: LifecycleOwner,
        previewView: PreviewView?,
        onQrFound: (code: String) -> Unit
    ) {
        val provider = cameraProvider ?: return
        this.qrListener = onQrFound
        try {
            provider.unbindAll()
            val preview = Preview.Builder().build()
            previewView?.let { preview.surfaceProvider = it.surfaceProvider }
            val imageAnalysis = ImageAnalysis.Builder()
                .setTargetResolution(Size(1280, 720))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
            var scanned = false
            imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                if (!scanned) {
                    val yBuffer = imageProxy.planes[0].buffer
                    val yBytes = ByteArray(yBuffer.remaining())
                    yBuffer.get(yBytes)
                    val qrText = QrCodeUtil.decodeQrFromLuminance(yBytes, imageProxy.width, imageProxy.height)
                    if (!qrText.isNullOrBlank()) {
                        scanned = true
                        ContextCompat.getMainExecutor(context).execute { onQrFound(qrText) }
                    }
                }
                imageProxy.close()
            }
            camera = provider.bindToLifecycle(lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageAnalysis)
            cameraControl = camera?.cameraControl
        } catch (e: Exception) {
            Log.e(tag, "Failed to bind QR scanner", e)
        }
    }

    private fun processStreamFrame(imageProxy: ImageProxy) {
        if (!isStreamingActive.get()) {
            imageProxy.close()
            return
        }
        try {
            // Encode from CameraX YUV planes directly; no JPEG is sent on the H.264 path.
            if (h264Encoder == null && !h264EncoderAttempted) {
                h264EncoderAttempted = true
                val encoder = H264StreamEncoder(
                    onFormat = { format -> h264FormatListener?.invoke(format) },
                    onAccessUnit = { bytes, pts, key -> h264FrameListener?.invoke(bytes, pts, key) }
                )
                if (encoder.start(imageProxy.width, imageProxy.height, imageProxy.imageInfo.rotationDegrees)) {
                    h264Encoder = encoder
                } else {
                    encoder.stop()
                    Log.w(tag, "Hardware H.264 encoder unavailable; MJPEG fallback remains available")
                }
            }
            h264Encoder?.encode(imageProxy)

            // MJPEG is produced only for clients that explicitly fell back to it.
            if (!shouldEncodeJpeg()) return

            var bitmap = imageProxy.toBitmap()
            val rotation = imageProxy.imageInfo.rotationDegrees
            if (rotation != 0) {
                val matrix = Matrix().apply {
                    postRotate(rotation.toFloat())
                    if (isFrontCamera) postScale(-1f, 1f)
                }
                bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
            }
            val stream = ByteArrayOutputStream(256 * 1024)
            bitmap.compress(Bitmap.CompressFormat.JPEG, 85, stream)
            frameListener?.invoke(stream.toByteArray(), bitmap)
        } catch (e: Exception) {
            Log.w(tag, "Frame processing error", e)
        } finally {
            imageProxy.close()
        }
    }

    fun setNightMode(enabled: Boolean) {
        isNightModeEnabled = enabled
        applyNightModeIfEnabled()
    }

    private fun applyNightModeIfEnabled() {
        val control = cameraControl ?: return
        val exposureState = camera?.cameraInfo?.exposureState ?: return
        val range = exposureState.exposureCompensationRange
        if (range.lower == 0 && range.upper == 0) return
        if (isNightModeEnabled) {
            if (previousExposureIndex == null) previousExposureIndex = exposureState.exposureCompensationIndex
            control.setExposureCompensationIndex(minOf(range.upper, maxOf(2, range.lower)))
        } else {
            control.setExposureCompensationIndex((previousExposureIndex ?: 0).coerceIn(range.lower, range.upper))
            previousExposureIndex = null
        }
    }

    fun setExposureCompensation(value: Int) {
        val exposureState = camera?.cameraInfo?.exposureState ?: return
        val range = exposureState.exposureCompensationRange
        cameraControl?.setExposureCompensationIndex(value.coerceIn(range.lower, range.upper))
    }

    fun switchCamera(lifecycleOwner: LifecycleOwner, previewView: PreviewView?) {
        isFrontCamera = !isFrontCamera
        isTorchEnabled = false
        val listener = frameListener ?: return
        if (isStreamingActive.get()) {
            startCameraForStreaming(
                lifecycleOwner,
                previewView,
                listener,
                h264FormatListener ?: {},
                h264FrameListener ?: { _, _, _ -> },
                shouldEncodeJpeg
            )
        }
    }

    fun toggleTorch(enable: Boolean? = null) {
        if (isFrontCamera) return
        val newState = enable ?: !isTorchEnabled
        cameraControl?.enableTorch(newState)
        isTorchEnabled = newState
    }

    fun stop() {
        isStreamingActive.set(false)
        frameListener = null
        h264FormatListener = null
        h264FrameListener = null
        h264Encoder?.stop()
        h264Encoder = null
        h264EncoderAttempted = false
        qrListener = null
        try { cameraProvider?.unbindAll() } catch (_: Exception) {}
        camera = null
        cameraControl = null
    }

    fun release() {
        stop()
        cameraExecutor.shutdown()
    }
}
