package com.example.network

import com.example.model.CameraDevice
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

object CameraControlApi {

    suspend fun toggleTorch(device: CameraDevice, enable: Boolean): Boolean = withContext(Dispatchers.IO) {
        try {
            val endpoint = "${device.controlUrl}&action=torch&value=${if (enable) "on" else "off"}"
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

    suspend fun switchCamera(device: CameraDevice): Boolean = withContext(Dispatchers.IO) {
        try {
            val endpoint = "${device.controlUrl}&action=switch_camera"
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

    suspend fun setNightMode(device: CameraDevice, enabled: Boolean): Boolean =
        sendControl(device, "night_mode", if (enabled) "on" else "off")

    suspend fun setExposure(device: CameraDevice, value: Int): Boolean =
        sendControl(device, "exposure", value.toString())

    suspend fun setZoom(device: CameraDevice, ratio: Float): Boolean =
        sendControl(device, "zoom", ratio.coerceIn(1.0f, device.maxZoomRatio).toString())

    suspend fun zoomIn(device: CameraDevice): Boolean =
        sendControl(device, "zoom_in", "")

    suspend fun zoomOut(device: CameraDevice): Boolean =
        sendControl(device, "zoom_out", "")

    suspend fun resetZoom(device: CameraDevice): Boolean =
        sendControl(device, "zoom_reset", "")

    private suspend fun sendControl(device: CameraDevice, action: String, value: String): Boolean =
        withContext(Dispatchers.IO) {
            try {
                val endpoint = "${device.controlUrl}&action=$action&value=$value"
                val conn = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                    connectTimeout = 2500
                    readTimeout = 2500
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
