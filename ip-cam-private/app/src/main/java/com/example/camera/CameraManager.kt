package com.example.camera

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Matrix
import android.graphics.Paint
import android.util.Log
import android.util.Size
import androidx.camera.core.Camera
import androidx.camera.core.CameraControl
import androidx.camera.core.CameraInfo
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import java.io.ByteArrayOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class CameraManager(private val context: Context) {
    private val tag = "CameraManager"

    private var cameraProvider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var cameraControl: CameraControl? = null
    private var cameraInfo: CameraInfo? = null
    private var cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()

    var isFrontCamera: Boolean = false
        private set
    var isTorchEnabled: Boolean = false
        private set
    var isNightModeEnabled: Boolean = false
        private set
    var currentZoomRatio: Float = 1.0f
        private set
    var maxZoomRatio: Float = 5.0f
        private set

    private val isStreamingActive = AtomicBoolean(false)
    private var frameListener: ((jpegBytes: ByteArray, bitmap: Bitmap) -> Unit)? = null
    private var qrListener: ((code: String) -> Unit)? = null

    // Night mode video enhancement paint filter
    private val nightModePaint = Paint().apply {
        val cm = ColorMatrix().apply {
            // Boost brightness by +40 and contrast by 1.35x
            set(floatArrayOf(
                1.35f, 0f, 0f, 0f, 40f,
                0f, 1.35f, 0f, 0f, 40f,
                0f, 0f, 1.35f, 0f, 40f,
                0f, 0f, 0f, 1f, 0f
            ))
        }
        colorFilter = ColorMatrixColorFilter(cm)
    }

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

    /**
     * Start camera in TELECAMERA transmitter mode with Full HD acquisition.
     */
    fun startCameraForStreaming(
        lifecycleOwner: LifecycleOwner,
        previewView: PreviewView?,
        onFrame: (jpegBytes: ByteArray, bitmap: Bitmap) -> Unit
    ) {
        val provider = cameraProvider ?: return
        this.frameListener = onFrame
        isStreamingActive.set(true)

        try {
            provider.unbindAll()

            val selector = if (isFrontCamera) {
                CameraSelector.DEFAULT_FRONT_CAMERA
            } else {
                CameraSelector.DEFAULT_BACK_CAMERA
            }

            val preview = Preview.Builder().build()
            previewView?.let {
                preview.surfaceProvider = it.surfaceProvider
            }

            // Full HD 1080p target resolution (falls back automatically to 720p if sensor does not support 1080p)
            val imageAnalysis = ImageAnalysis.Builder()
                .setTargetResolution(Size(1920, 1080))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                processStreamFrame(imageProxy)
            }

            val boundCamera = provider.bindToLifecycle(
                lifecycleOwner,
                selector,
                preview,
                imageAnalysis
            )
            camera = boundCamera
            cameraControl = boundCamera.cameraControl
            cameraInfo = boundCamera.cameraInfo

            // Observe zoom bounds
            boundCamera.cameraInfo.zoomState.observe(lifecycleOwner) { zoomState ->
                if (zoomState != null) {
                    currentZoomRatio = zoomState.zoomRatio
                    maxZoomRatio = zoomState.maxZoomRatio.coerceAtMost(8.0f)
                }
            }

            // Re-apply night mode if previously enabled
            applyNightModeExposure(isNightModeEnabled)

            Log.i(tag, "Camera bound for Full HD streaming (facing: ${if (isFrontCamera) "FRONT" else "BACK"})")
        } catch (e: Exception) {
            Log.e(tag, "Failed to bind camera for streaming", e)
        }
    }

    /**
     * Start camera in QR Code scanner mode (for pairing on CONTROLLO).
     */
    fun startCameraForQrScanning(
        lifecycleOwner: LifecycleOwner,
        previewView: PreviewView?,
        onQrFound: (code: String) -> Unit
    ) {
        val provider = cameraProvider ?: return
        this.qrListener = onQrFound

        try {
            provider.unbindAll()

            val selector = CameraSelector.DEFAULT_BACK_CAMERA
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
                        ContextCompat.getMainExecutor(context).execute {
                            onQrFound(qrText)
                        }
                    }
                }
                imageProxy.close()
            }

            camera = provider.bindToLifecycle(lifecycleOwner, selector, preview, imageAnalysis)
            cameraControl = camera?.cameraControl
            cameraInfo = camera?.cameraInfo
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
            var rawBitmap = imageProxy.toBitmap()
            val rotationDegrees = imageProxy.imageInfo.rotationDegrees

            // Rotate bitmap if needed to match upright orientation
            if (rotationDegrees != 0 || isFrontCamera) {
                val matrix = Matrix().apply {
                    if (rotationDegrees != 0) {
                        postRotate(rotationDegrees.toFloat())
                    }
                    if (isFrontCamera) {
                        postScale(-1f, 1f) // Mirror front camera preview
                    }
                }
                val rotated = Bitmap.createBitmap(rawBitmap, 0, 0, rawBitmap.width, rawBitmap.height, matrix, true)
                rawBitmap = rotated
            }

            // Apply Night Mode enhancement filter if enabled
            if (isNightModeEnabled) {
                val enhancedBitmap = Bitmap.createBitmap(rawBitmap.width, rawBitmap.height, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(enhancedBitmap)
                canvas.drawBitmap(rawBitmap, 0f, 0f, nightModePaint)
                rawBitmap = enhancedBitmap
            }

            val stream = ByteArrayOutputStream()
            rawBitmap.compress(Bitmap.CompressFormat.JPEG, 80, stream)
            val jpegBytes = stream.toByteArray()

            frameListener?.invoke(jpegBytes, rawBitmap)
        } catch (e: Exception) {
            Log.w(tag, "Frame processing error", e)
        } finally {
            imageProxy.close()
        }
    }

    fun switchCamera(lifecycleOwner: LifecycleOwner, previewView: PreviewView?) {
        isFrontCamera = !isFrontCamera
        isTorchEnabled = false
        if (isStreamingActive.get() && frameListener != null) {
            startCameraForStreaming(lifecycleOwner, previewView, frameListener!!)
        }
    }

    fun toggleTorch(enable: Boolean? = null) {
        if (isFrontCamera) return
        val newState = enable ?: !isTorchEnabled
        cameraControl?.enableTorch(newState)
        isTorchEnabled = newState
    }

    /**
     * Toggles Night Mode with video quality enhancement and maximum exposure compensation.
     */
    fun toggleNightMode(enable: Boolean? = null) {
        val newState = enable ?: !isNightModeEnabled
        isNightModeEnabled = newState
        applyNightModeExposure(newState)
        Log.i(tag, "Night mode set to: $newState")
    }

    private fun applyNightModeExposure(enabled: Boolean) {
        val info = cameraInfo ?: return
        val control = cameraControl ?: return

        try {
            val range = info.exposureState.exposureCompensationRange
            if (range.contains(0)) {
                val targetIndex = if (enabled) {
                    range.upper.coerceAtMost(6) // Maximum light boost
                } else {
                    0 // Normal balanced exposure
                }
                control.setExposureCompensationIndex(targetIndex)
            }
        } catch (e: Exception) {
            Log.w(tag, "Error applying exposure compensation", e)
        }
    }

    /**
     * Controls Zoom Ratio on the remote camera.
     */
    fun setZoom(ratio: Float) {
        val target = ratio.coerceIn(1.0f, maxZoomRatio)
        cameraControl?.setZoomRatio(target)
        currentZoomRatio = target
    }

    fun zoomIn(step: Float = 0.35f) {
        setZoom(currentZoomRatio + step)
    }

    fun zoomOut(step: Float = 0.35f) {
        setZoom(currentZoomRatio - step)
    }

    fun resetZoom() {
        setZoom(1.0f)
    }

    fun stop() {
        isStreamingActive.set(false)
        frameListener = null
        qrListener = null
        try {
            cameraProvider?.unbindAll()
        } catch (_: Exception) {}
        camera = null
        cameraControl = null
        cameraInfo = null
    }

    fun release() {
        stop()
        cameraExecutor.shutdown()
    }
}
