package com.example

import com.example.model.CameraDevice
import org.junit.Assert.assertEquals
import org.junit.Test

class ExampleUnitTest {

    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)
    }

    @Test
    fun cameraDeviceEndpoints_areCorrect() {
        val device = CameraDevice(
            id = "cam-101",
            name = "Telecamera Ingresso",
            host = "192.168.1.120",
            port = 8888,
            securityToken = "token_xyz"
        )
        assertEquals("http://192.168.1.120:8888/stream?token=token_xyz", device.streamUrl)
        assertEquals("http://192.168.1.120:8888/snapshot?token=token_xyz", device.snapshotUrl)
        assertEquals("http://192.168.1.120:8888/status?token=token_xyz", device.statusUrl)
        assertEquals("http://192.168.1.120:8888/api/control?token=token_xyz", device.controlUrl)
    }

    @Test
    fun cameraDevice_defaultValues() {
        val device = CameraDevice(
            id = "cam-default",
            name = "Salone",
            host = "192.168.1.200"
        )
        assertEquals(8888, device.port)
        assertEquals("BACK", device.facing)
        assertEquals(false, device.isOnline)
        assertEquals(false, device.isRecording)
    }
}
