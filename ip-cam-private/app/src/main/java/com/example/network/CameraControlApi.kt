package com.example.network

import com.example.model.CameraDevice
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

object CameraControlApi {

    suspend fun toggleTorch(device: CameraDevice, enable: Boolean): Boolean = withContext(Dispatchers.IO) {
        sendCommand(device, "action=torch&value=${if (enable) "on" else "off"}")
    }

    suspend fun switchCamera(device: CameraDevice): Boolean = withContext(Dispatchers.IO) {
        sendCommand(device, "action=switch_camera")
    }

    suspend fun toggleNightMode(device: CameraDevice, enable: Boolean): Boolean = withContext(Dispatchers.IO) {
        sendCommand(device, "action=night_mode&value=${if (enable) "on" else "off"}")
    }

    suspend fun setZoom(device: CameraDevice, ratio: Float): Boolean = withContext(Dispatchers.IO) {
        sendCommand(device, "action=zoom&value=$ratio")
    }

    suspend fun zoomIn(device: CameraDevice): Boolean = withContext(Dispatchers.IO) {
        sendCommand(device, "action=zoom_in")
    }

    suspend fun zoomOut(device: CameraDevice): Boolean = withContext(Dispatchers.IO) {
        sendCommand(device, "action=zoom_out")
    }

    suspend fun resetZoom(device: CameraDevice): Boolean = withContext(Dispatchers.IO) {
        sendCommand(device, "action=zoom_reset")
    }

    private fun sendCommand(device: CameraDevice, query: String): Boolean {
        return try {
            val endpoint = "${device.controlUrl}&$query"
            val conn = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                connectTimeout = 2000
                readTimeout = 2000
                requestMethod = "POST"
            }
            conn.responseCode == 200
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    suspend fun fetchSnapshot(device: CameraDevice): ByteArray? = withContext(Dispatchers.IO) {
        try {
            val conn = (URL(device.snapshotUrl).openConnection() as HttpURLConnection).apply {
                connectTimeout = 3000
                readTimeout = 5000
                requestMethod = "GET"
            }
            if (conn.responseCode == 200) {
                conn.inputStream.use { it.readBytes() }
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
