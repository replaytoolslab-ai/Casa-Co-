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

    private val isStreamingActive = AtomicBoolean(false)
    private var frameListener: ((jpegBytes: ByteArray, bitmap: Bitmap) -> Unit)? = null
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

    /**
     * Start camera in TELECAMERA transmitter mode with preview and frame analysis for streaming.
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

            val preview = Preview.Builder()
                .build()

            previewView?.let {
                preview.surfaceProvider = it.surfaceProvider
            }

            val imageAnalysis = ImageAnalysis.Builder()
                .setTargetResolution(Size(960, 540)) // Good balance between quality and smooth LAN bandwidth
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                processStreamFrame(imageProxy)
            }

            camera = provider.bindToLifecycle(
                lifecycleOwner,
                selector,
                preview,
                imageAnalysis
            )
            cameraControl = camera?.cameraControl
            Log.i(tag, "Camera bound for streaming (facing: ${if (isFrontCamera) "FRONT" else "BACK"})")
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
            if (rotationDegrees != 0) {
                val matrix = Matrix().apply {
                    postRotate(rotationDegrees.toFloat())
                    if (isFrontCamera) {
                        postScale(-1f, 1f) // Mirror front camera preview
                    }
                }
                val rotated = Bitmap.createBitmap(rawBitmap, 0, 0, rawBitmap.width, rawBitmap.height, matrix, true)
                rawBitmap = rotated
            }

            val stream = ByteArrayOutputStream()
            rawBitmap.compress(Bitmap.CompressFormat.JPEG, 75, stream)
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

    fun stop() {
        isStreamingActive.set(false)
        frameListener = null
        qrListener = null
        try {
            cameraProvider?.unbindAll()
        } catch (_: Exception) {}
        camera = null
        cameraControl = null
    }

    fun release() {
        stop()
        cameraExecutor.shutdown()
    }
}
