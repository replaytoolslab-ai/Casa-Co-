package com.securehome.hub

import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

const val PORT = 8080
const val SERVICE_TYPE = "_shcam._tcp."

class MainActivity : AppCompatActivity() {
    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        val l = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER; setPadding(48, 48, 48, 48)
        }
        l.addView(TextView(this).apply { text = "CamHub"; textSize = 32f; gravity = Gravity.CENTER })
        l.addView(TextView(this).apply { text = "Scegli il ruolo di questo telefono"; gravity = Gravity.CENTER; setPadding(0, 16, 0, 48) })
        l.addView(Button(this).apply {
            text = "📷  Telecamera"
            setOnClickListener { startActivity(Intent(this@MainActivity, CameraActivity::class.java)) }
        })
        l.addView(Button(this).apply {
            text = "🖥  Centro di controllo"
            setOnClickListener { startActivity(Intent(this@MainActivity, ControlActivity::class.java)) }
        })
        setContentView(l)
    }
}
