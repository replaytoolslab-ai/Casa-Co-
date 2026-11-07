package com.securehome.hub

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class CameraActivity : AppCompatActivity() {
    private lateinit var info: TextView

    private val permissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
        val cameraOk = result[Manifest.permission.CAMERA] == true ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        val micOk = result[Manifest.permission.RECORD_AUDIO] == true ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        if (cameraOk && micOk) startCameraService()
        else info.text = "Per continuare in background servono i permessi Fotocamera e Microfono. Concedili nelle impostazioni dell'app."
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(36, 36, 36, 36)
        }
        info = TextView(this).apply {
            text = "CamHub Telecamera\n\nAvvia la modalità continua per mantenere video e connessione anche quando blocchi lo schermo o passi a un'altra app."
            textSize = 17f
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 28)
        }
        val start = Button(this).apply {
            text = "▶ Avvia telecamera continua"
            setOnClickListener { requestCameraPermissions() }
        }
        val stop = Button(this).apply {
            text = "■ Arresta telecamera"
            setOnClickListener {
                stopService(Intent(this@CameraActivity, CameraForegroundService::class.java))
                info.text = "Telecamera arrestata."
            }
        }
        root.addView(info)
        root.addView(start)
        root.addView(stop)
        setContentView(root)
    }

    private fun requestCameraPermissions() {
        val needed = arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO)
            .filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
        if (needed.isEmpty()) startCameraService() else permissions.launch(needed.toTypedArray())
    }

    private fun startCameraService() {
        try {
            val intent = Intent(this, CameraForegroundService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ContextCompat.startForegroundService(this, intent)
            else startService(intent)
            info.text = "Telecamera attiva in modalità continua. Puoi tornare alla Home o bloccare lo schermo. La notifica CamHub conferma che il servizio è in esecuzione."
        } catch (e: Exception) {
            info.text = "Impossibile avviare la telecamera: ${e.localizedMessage ?: "controlla i permessi"}"
        }
    }
}
