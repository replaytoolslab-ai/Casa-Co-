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
