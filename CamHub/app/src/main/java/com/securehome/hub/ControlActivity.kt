package com.securehome.hub

import android.content.ContentValues
import android.graphics.*
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import java.io.*
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class ControlActivity : AppCompatActivity() {
    private lateinit var img: ImageView
    private lateinit var status: TextView
    private lateinit var ipBox: EditText
    private lateinit var found: LinearLayout
    private lateinit var zoomBar: SeekBar
    private lateinit var flashButton: Button
    private var flashSupported = true
    private var flashOn = false
    private var host: String? = null
    @Volatile private var session = 0
    @Volatile private var lastBmp: Bitmap? = null
    @Volatile private var lastBaseBmp: Bitmap? = null
    @Volatile private var audioOn = false
    private var res = 720
    private var detail = 1
    private var night = false
    private var rec = false
    private var zoom = 1f
    private var displayRotation = 0
    private var lastZoomSend = 0L
    private val quals = intArrayOf(40, 70, 92)
    private val names = arrayOf("Basso", "Medio", "Alto")
    private val seen = HashSet<String>()
    private var nsd: NsdManager? = null
    private var disc: NsdManager.DiscoveryListener? = null

    private fun btn(t: String, f: (Button) -> Unit) = Button(this).apply {
        text = t; textSize = 12f; setOnClickListener { f(this) }
    }.also { it.layoutParams = LinearLayout.LayoutParams(0, -2, 1f) }

    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(16, 16, 16, 16) }
        ipBox = EditText(this).apply { hint = "IP telecamera (es. 192.168.1.20)"; setSingleLine() }
        val connect = Button(this).apply { text = "Collega"; setOnClickListener { connect(ipBox.text.toString().trim()) } }
        val top = LinearLayout(this)
        top.addView(ipBox, LinearLayout.LayoutParams(0, -2, 1f)); top.addView(connect)
        found = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        img = ImageView(this).apply { setBackgroundColor(Color.BLACK); scaleType = ImageView.ScaleType.FIT_CENTER }
        status = TextView(this).apply { text = "Non collegato" }
        zoomBar = SeekBar(this).apply {
            max = 70
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(s: SeekBar, p: Int, u: Boolean) {
                    zoom = 1f + p / 10f
                    if (u && System.currentTimeMillis() - lastZoomSend > 150) { lastZoomSend = System.currentTimeMillis(); send("zoom=$zoom") }
                }
                override fun onStartTrackingTouch(s: SeekBar) {}
                override fun onStopTrackingTouch(s: SeekBar) { send("zoom=$zoom") }
            })
        }
        val r1 = LinearLayout(this); val r2 = LinearLayout(this); val r3 = LinearLayout(this)
        r1.addView(btn("720p") { res = if (res == 720) 1080 else 720; it.text = "${res}p"; send("res=$res") })
        r1.addView(btn("Dettaglio: Medio") { detail = (detail + 1) % 3; it.text = "Dettaglio: ${names[detail]}"; send("detail=${quals[detail]}") })
        r1.addView(btn("Notte: OFF") {
            night = !night; it.text = "Notte: ${if (night) "ON" else "OFF"}"
            if (night) img.setColorFilter(ColorMatrixColorFilter(ColorMatrix(floatArrayOf(
                1.5f, 0f, 0f, 0f, 25f, 0f, 1.5f, 0f, 0f, 25f, 0f, 0f, 1.5f, 0f, 25f, 0f, 0f, 0f, 1f, 0f)))) else img.clearColorFilter()
            send("night=${if (night) 1 else 0}")
        })
        flashButton = btn("⚡ Flash OFF") {
            if (!flashSupported) { say("Flash non disponibile su questa fotocamera"); return@btn }
            flashOn = !flashOn
            it.text = "⚡ Flash ${if (flashOn) "ON" else "OFF"}"
            send("flash=${if (flashOn) 1 else 0}")
        }
        r2.addView(btn("🔇 Audio") { audioOn = !audioOn; it.text = if (audioOn) "🔊 Audio" else "🔇 Audio"; if (audioOn) startAudio() })
        r2.addView(btn("📸 Foto") { photo() })
        r2.addView(btn("⏺ Rec") { b -> toggleRec(b) })
        r2.addView(flashButton)
        r3.addView(btn("↻ Ruota: 0°") {
            displayRotation = (displayRotation + 90) % 360
            it.text = "↻ Ruota: ${displayRotation}°"
            lastBaseBmp?.let { base ->
                val rotated = rotateBitmap(base, displayRotation)
                lastBmp = rotated
                runOnUiThread { img.setImageBitmap(rotated) }
            }
        })
        root.addView(top); root.addView(found)
        root.addView(img, LinearLayout.LayoutParams(-1, 0, 1f))
        root.addView(status); root.addView(zoomBar); root.addView(r1); root.addView(r2); root.addView(r3)
        setContentView(root)
        discover()
    }

    private fun http(path: String): String {
        val c = URL("http://$host:$PORT$path").openConnection() as HttpURLConnection
        c.connectTimeout = 4000; c.readTimeout = 8000
        return try { c.inputStream.bufferedReader().readText() } finally { c.disconnect() }
    }

    private fun send(q: String) { if (host != null) thread { try { http("/cmd?$q") } catch (_: Exception) {} } }
    private fun say(t: String) = runOnUiThread { status.text = t }

    private fun connect(h: String) {
        if (h.isEmpty()) return
        host = h; val my = ++session
        say("Connessione a $h...")
        thread {
            while (my == session) {
                try {
                    val st = http("/status")
                    Regex("flash=([01])").find(st)?.let { m ->
                        flashSupported = m.groupValues[1] == "1"
                        runOnUiThread { flashButton.isEnabled = flashSupported; if (!flashSupported) flashButton.text = "⚡ Flash non disponibile" }
                    }
                    Regex("maxzoom=([0-9.]+)").find(st)?.let { m ->
                        val mx = m.groupValues[1].toFloat()
                        runOnUiThread { zoomBar.max = ((mx - 1f) * 10).toInt().coerceAtLeast(1) }
                    }
                    http("/cmd?res=$res&detail=${quals[detail]}&night=${if (night) 1 else 0}&zoom=$zoom")
                    val c = URL("http://$h:$PORT/stream").openConnection() as HttpURLConnection
                    c.connectTimeout = 4000; c.readTimeout = 8000
                    val ins = BufferedInputStream(c.inputStream, 1 shl 16)
                    say("Connesso a $h")
                    while (my == session) {
                        val p = readLine(ins).split(" ")
                        if (p[0] != "F") continue
                        val n = p[1].toInt(); val rot = p[2].toInt()
                        val buf = ByteArray(n); DataInputStream(ins).readFully(buf)
                        var baseBmp = BitmapFactory.decodeByteArray(buf, 0, n) ?: continue
                        if (rot != 0) baseBmp = Bitmap.createBitmap(baseBmp, 0, 0, baseBmp.width, baseBmp.height, Matrix().apply { postRotate(rot.toFloat()) }, true)
                        lastBaseBmp = baseBmp
                        val bmp = rotateBitmap(baseBmp, displayRotation)
                        lastBmp = bmp; val bm = bmp
                        runOnUiThread { img.setImageBitmap(bm) }
                    }
                    c.disconnect()
                } catch (e: Exception) {
                    if (my == session) { say("Connessione persa, riprovo..."); Thread.sleep(2000) }
                }
            }
        }
    }

    private fun rotateBitmap(bitmap: Bitmap, degrees: Int): Bitmap {
        if (degrees == 0) return bitmap
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height,
            Matrix().apply { postRotate(degrees.toFloat()) }, true)
    }

    private fun readLine(i: InputStream): String {
        val sb = StringBuilder()
        while (true) { val c = i.read(); if (c < 0) throw IOException("eof"); if (c == 10) break; sb.append(c.toChar()) }
        return sb.toString()
    }

    private fun save(name: String, mime: String, video: Boolean, write: (OutputStream) -> Unit): Boolean = try {
        val dirType = if (video) Environment.DIRECTORY_MOVIES else Environment.DIRECTORY_PICTURES
        if (Build.VERSION.SDK_INT >= 29) {
            val v = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, name); put(MediaStore.MediaColumns.MIME_TYPE, mime)
                put(MediaStore.MediaColumns.RELATIVE_PATH, "$dirType/CamHub")
            }
            val col = if (video) MediaStore.Video.Media.EXTERNAL_CONTENT_URI else MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            contentResolver.openOutputStream(contentResolver.insert(col, v)!!)!!.use(write)
        } else {
            val d = File(getExternalFilesDir(dirType), "CamHub"); d.mkdirs()
            FileOutputStream(File(d, name)).use(write)
        }
        true
    } catch (_: Exception) { false }

    private fun ts() = java.text.SimpleDateFormat("yyyyMMdd_HHmmss", java.util.Locale.US).format(java.util.Date())

    private fun photo() {
        val b = lastBmp ?: return say("Nessuna immagine da salvare")
        thread { say(if (save("FOTO_${ts()}.jpg", "image/jpeg", false) { b.compress(Bitmap.CompressFormat.JPEG, 95, it) }) "Foto salvata ✔" else "Errore salvataggio foto") }
    }

    private fun toggleRec(b: Button) {
        if (host == null) return
        rec = !rec; b.text = if (rec) "⏹ Stop" else "⏺ Rec"
        send("rec=${if (rec) 1 else 0}")
        if (rec) { say("Registrazione in corso..."); return }
        say("Scarico il video...")
        thread {
            Thread.sleep(800)
            repeat(40) {
                val ok = try { http("/status").contains("recready=1") } catch (_: Exception) { false }
                if (ok) {
                    val c = URL("http://$host:$PORT/video").openConnection() as HttpURLConnection
                    c.connectTimeout = 4000; c.readTimeout = 20000
                    val done = try { save("REC_${ts()}.mp4", "video/mp4", true) { o -> c.inputStream.copyTo(o) } } finally { c.disconnect() }
                    say(if (done) "Video salvato ✔" else "Errore salvataggio video"); return@thread
                }
                Thread.sleep(500)
            }
            say("Registrazione non disponibile")
        }
    }

    private fun startAudio() {
        val h = host ?: return; val my = session
        thread {
            var t: AudioTrack? = null; var c: HttpURLConnection? = null
            try {
                c = URL("http://$h:$PORT/audio").openConnection() as HttpURLConnection
                c.connectTimeout = 4000; c.readTimeout = 10000
                val min = AudioTrack.getMinBufferSize(16000, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_16BIT)
                t = AudioTrack(AudioManager.STREAM_MUSIC, 16000, AudioFormat.CHANNEL_OUT_MONO,
                    AudioFormat.ENCODING_PCM_16BIT, maxOf(min, 8192) * 2, AudioTrack.MODE_STREAM)
                t.play()
                val ins = c.inputStream; val buf = ByteArray(4096)
                while (audioOn && my == session) { val n = ins.read(buf); if (n < 0) break; t.write(buf, 0, n) }
            } catch (_: Exception) {
            } finally { try { t?.stop(); t?.release() } catch (_: Exception) {}; c?.disconnect() }
        }
    }

    private fun discover() {
        try {
            val m = getSystemService(NSD_SERVICE) as NsdManager; nsd = m
            disc = object : NsdManager.DiscoveryListener {
                override fun onDiscoveryStarted(t: String) {}
                override fun onDiscoveryStopped(t: String) {}
                override fun onStartDiscoveryFailed(t: String, e: Int) {}
                override fun onStopDiscoveryFailed(t: String, e: Int) {}
                override fun onServiceLost(s: NsdServiceInfo) {}
                override fun onServiceFound(s: NsdServiceInfo) {
                    m.resolveService(s, object : NsdManager.ResolveListener {
                        override fun onResolveFailed(s: NsdServiceInfo, e: Int) {}
                        override fun onServiceResolved(r: NsdServiceInfo) {
                            val ip = r.host?.hostAddress ?: return
                            if (ip.contains(":") || !seen.add(ip)) return
                            runOnUiThread {
                                found.addView(Button(this@ControlActivity).apply {
                                    text = r.serviceName; textSize = 11f
                                    setOnClickListener { ipBox.setText(ip); connect(ip) }
                                })
                            }
                        }
                    })
                }
            }
            m.discoverServices(SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, disc)
        } catch (_: Exception) {}
    }

    override fun onDestroy() {
        super.onDestroy(); session++; audioOn = false
        try { disc?.let { nsd?.stopServiceDiscovery(it) } } catch (_: Exception) {}
    }
}
