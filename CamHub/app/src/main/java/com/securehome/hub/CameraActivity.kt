package com.securehome.hub

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.net.Uri
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.os.Build
import android.os.Bundle
import android.util.Size
import android.view.Gravity
import android.view.OrientationEventListener
import android.view.Surface
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.*
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import java.io.ByteArrayOutputStream
import java.io.File
import java.net.NetworkInterface
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors
import kotlin.concurrent.thread

class Frame(val data: ByteArray, val rot: Int, val n: Long)

class CameraActivity : AppCompatActivity() {
    private lateinit var previewView: PreviewView
    private lateinit var info: TextView
    private var provider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var analysis: ImageAnalysis? = null
    private var videoCapture: VideoCapture<Recorder>? = null
    private var recording: Recording? = null
    private val exec = Executors.newSingleThreadExecutor()
    private var server: ServerSocket? = null
    private var nsd: NsdManager? = null
    private var regListener: NsdManager.RegistrationListener? = null
    private var orient: OrientationEventListener? = null
    private val recFile by lazy { File(cacheDir, "rec.mp4") }

    @Volatile private var frame: Frame? = null
    @Volatile private var viewers = 0
    @Volatile private var recReady = false
    @Volatile private var isRec = false
    @Volatile private var lastTs = 0L
    private var seq = 0L
    private var res = 720
    @Volatile private var quality = 70
    private var zoom = 1f
    private var night = false
    private var front = false
    private var torchOn = false

    private val perms = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { r ->
        if (r[Manifest.permission.CAMERA] == true) startAll() else { info.text = "Permesso fotocamera negato"; }
    }

    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        previewView = PreviewView(this)
        info = TextView(this).apply { setBackgroundColor(0xAA000000.toInt()); setTextColor(0xFFFFFFFF.toInt()); setPadding(24, 24, 24, 24) }
        val sw = Button(this).apply { text = "Cambia camera"; setOnClickListener { front = !front; bind() } }
        val root = FrameLayout(this)
        root.addView(previewView)
        root.addView(info, FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM))
        root.addView(sw, FrameLayout.LayoutParams(-2, -2, Gravity.TOP or Gravity.END))
        setContentView(root)
        perms.launch(arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO))
    }

    private fun startAll() {
        val f = ProcessCameraProvider.getInstance(this)
        f.addListener({ provider = f.get(); bind(); startServer(); registerNsd() }, ContextCompat.getMainExecutor(this))
        orient = object : OrientationEventListener(this) {
            override fun onOrientationChanged(o: Int) {
                if (o == ORIENTATION_UNKNOWN) return
                val r = when { o >= 315 || o < 45 -> Surface.ROTATION_0; o < 135 -> Surface.ROTATION_270; o < 225 -> Surface.ROTATION_180; else -> Surface.ROTATION_90 }
                analysis?.targetRotation = r; videoCapture?.targetRotation = r
            }
        }.also { it.enable() }
    }

    private fun bind() {
        val p = provider ?: return
        if (isRec) return
        p.unbindAll()
        val size = if (res == 1080) Size(1920, 1080) else Size(1280, 720)
        val rs = ResolutionSelector.Builder()
            .setResolutionStrategy(ResolutionStrategy(size, ResolutionStrategy.FALLBACK_RULE_CLOSEST_LOWER_THEN_HIGHER)).build()
        val preview = Preview.Builder().build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
        val an = ImageAnalysis.Builder().setResolutionSelector(rs)
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build()
        an.setAnalyzer(exec) { onFrame(it) }
        analysis = an
        val q = if (res == 1080) Quality.FHD else Quality.HD
        val vc = VideoCapture.withOutput(Recorder.Builder()
            .setQualitySelector(QualitySelector.from(q, FallbackStrategy.lowerQualityOrHigherThan(q))).build())
        val sel = if (front) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
        camera = try { videoCapture = vc; p.bindToLifecycle(this, sel, preview, an, vc) }
        catch (e: Exception) {
            videoCapture = null
            try { p.unbindAll(); p.bindToLifecycle(this, sel, preview, an) } catch (e2: Exception) { null }
        }
        applyZoomNight()
        applyFlash()
        showInfo()
    }

    private fun showInfo() {
        info.text = "Telecamera attiva\nIP: ${localIp()}  porta $PORT\n${res}p" +
            (if (videoCapture == null) "\n(registrazione non supportata da questo telefono)" else "")
    }

    private fun applyZoomNight() {
        val c = camera ?: return
        val mx = c.cameraInfo.zoomState.value?.maxZoomRatio ?: 1f
        c.cameraControl.setZoomRatio(zoom.coerceIn(1f, mx))
        val st = c.cameraInfo.exposureState
        if (st.isExposureCompensationSupported)
            c.cameraControl.setExposureCompensationIndex(if (night) (st.exposureCompensationRange.upper * 0.8).toInt() else 0)
    }

    private fun applyFlash() {
        val c = camera ?: return
        if (c.cameraInfo.hasFlashUnit()) c.cameraControl.enableTorch(torchOn)
        else torchOn = false
    }

    private fun onFrame(img: ImageProxy) {
        try {
            val now = System.currentTimeMillis()
            if (viewers > 0 && now - lastTs >= 60) {
                lastTs = now
                val w = img.width; val h = img.height
                val y = img.planes[0]; val u = img.planes[1]; val v = img.planes[2]
                val nv = ByteArray(w * h * 3 / 2); var pos = 0
                for (row in 0 until h) { y.buffer.position(row * y.rowStride); y.buffer.get(nv, pos, w); pos += w }
                for (row in 0 until h / 2) for (col in 0 until w / 2) {
                    nv[pos++] = v.buffer.get(row * v.rowStride + col * v.pixelStride)
                    nv[pos++] = u.buffer.get(row * u.rowStride + col * u.pixelStride)
                }
                val o = ByteArrayOutputStream()
                YuvImage(nv, ImageFormat.NV21, w, h, null).compressToJpeg(Rect(0, 0, w, h), quality, o)
                frame = Frame(o.toByteArray(), img.imageInfo.rotationDegrees, ++seq)
            }
        } finally { img.close() }
    }

    private fun applyCmd(u: Uri) {
        u.getQueryParameter("detail")?.toIntOrNull()?.let { quality = it.coerceIn(20, 95) }
        u.getQueryParameter("zoom")?.toFloatOrNull()?.let { zoom = it }
        u.getQueryParameter("night")?.let { night = it == "1" }
        u.getQueryParameter("flash")?.let { torchOn = it == "1"; applyFlash() }
        applyZoomNight()
        u.getQueryParameter("res")?.toIntOrNull()?.let { if (it != res && !isRec) { res = it; bind() } }
        u.getQueryParameter("rec")?.let { setRec(it == "1") }
    }

    private fun setRec(on: Boolean) {
        val vc = videoCapture ?: return
        if (on && recording == null) {
            recReady = false; recFile.delete()
            var p = vc.output.prepareRecording(this, FileOutputOptions.Builder(recFile).build())
            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) p = p.withAudioEnabled()
            isRec = true
            recording = p.start(ContextCompat.getMainExecutor(this)) { ev ->
                if (ev is VideoRecordEvent.Finalize) {
                    recording = null; isRec = false
                    recReady = !ev.hasError() && recFile.exists()
                }
            }
        } else if (!on && recording != null) { recReady = false; recording?.stop() }
    }

    private fun startServer() {
        thread {
            try {
                val ss = ServerSocket(PORT); server = ss
                while (true) { val s = ss.accept(); thread { handle(s) } }
            } catch (_: Exception) {}
        }
    }

    private fun handle(s: Socket) {
        try {
            val rd = s.getInputStream().bufferedReader()
            val line = rd.readLine() ?: return
            while (true) { val l = rd.readLine(); if (l.isNullOrEmpty()) break }
            val u = Uri.parse(line.split(" ")[1])
            val o = s.getOutputStream()
            fun text(t: String) {
                val b = t.toByteArray()
                o.write("HTTP/1.1 200 OK\r\nContent-Length: ${b.size}\r\nConnection: close\r\n\r\n".toByteArray()); o.write(b); o.flush()
            }
            when (u.path) {
                "/status" -> {
                    val mx = camera?.cameraInfo?.zoomState?.value?.maxZoomRatio ?: 1f
                    text("ok maxzoom=$mx rec=${if (isRec) 1 else 0} recready=${if (recReady) 1 else 0} vid=${if (videoCapture != null) 1 else 0} flash=${if (camera?.cameraInfo?.hasFlashUnit() == true) 1 else 0}")
                }
                "/cmd" -> { runOnUiThread { applyCmd(u) }; text("ok") }
                "/video" -> {
                    o.write("HTTP/1.1 200 OK\r\nContent-Length: ${recFile.length()}\r\nConnection: close\r\n\r\n".toByteArray())
                    recFile.inputStream().use { it.copyTo(o) }; o.flush()
                }
                "/stream" -> {
                    o.write("HTTP/1.1 200 OK\r\nConnection: close\r\n\r\n".toByteArray())
                    viewers++
                    try {
                        var last = -1L
                        while (true) {
                            val f = frame
                            if (f == null || f.n == last) { Thread.sleep(15); continue }
                            last = f.n
                            o.write("F ${f.data.size} ${f.rot}\n".toByteArray()); o.write(f.data); o.flush()
                        }
                    } finally { viewers-- }
                }
                "/audio" -> {
                    o.write("HTTP/1.1 200 OK\r\nConnection: close\r\n\r\n".toByteArray())
                    val min = AudioRecord.getMinBufferSize(16000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
                    val ar = AudioRecord(MediaRecorder.AudioSource.MIC, 16000, AudioFormat.CHANNEL_IN_MONO,
                        AudioFormat.ENCODING_PCM_16BIT, maxOf(min, 4096) * 2)
                    try {
                        ar.startRecording(); val buf = ByteArray(4096)
                        while (true) { val n = ar.read(buf, 0, buf.size); if (n <= 0) break; o.write(buf, 0, n); o.flush() }
                    } finally { try { ar.stop() } catch (_: Exception) {}; ar.release() }
                }
            }
        } catch (_: Exception) {
        } finally { try { s.close() } catch (_: Exception) {} }
    }

    private fun registerNsd() {
        try {
            val m = getSystemService(NSD_SERVICE) as NsdManager; nsd = m
            val si = NsdServiceInfo().apply { serviceName = "Cam-${Build.MODEL}"; serviceType = SERVICE_TYPE; port = PORT }
            regListener = object : NsdManager.RegistrationListener {
                override fun onRegistrationFailed(s: NsdServiceInfo, e: Int) {}
                override fun onUnregistrationFailed(s: NsdServiceInfo, e: Int) {}
                override fun onServiceRegistered(s: NsdServiceInfo) {}
                override fun onServiceUnregistered(s: NsdServiceInfo) {}
            }
            m.registerService(si, NsdManager.PROTOCOL_DNS_SD, regListener)
        } catch (_: Exception) {}
    }

    private fun localIp(): String = try {
        NetworkInterface.getNetworkInterfaces().toList().flatMap { it.inetAddresses.toList() }
            .firstOrNull { !it.isLoopbackAddress && it.isSiteLocalAddress && !(it.hostAddress ?: ":").contains(":") }?.hostAddress ?: "?"
    } catch (_: Exception) { "?" }

    override fun onDestroy() {
        super.onDestroy()
        orient?.disable(); recording?.stop()
        try { server?.close() } catch (_: Exception) {}
        try { regListener?.let { nsd?.unregisterService(it) } } catch (_: Exception) {}
    }
}
