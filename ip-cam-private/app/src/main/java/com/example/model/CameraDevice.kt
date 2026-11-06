package com.example.model

data class CameraDevice(
    val id: String,
    val name: String,
    val host: String,
    val port: Int = 8888,
    val securityToken: String = "",
    val securityPin: String = "",
    val isOnline: Boolean = false,
    val batteryPercent: Int = 100,
    val facing: String = "BACK", // "BACK" or "FRONT"
    val isTorchOn: Boolean = false,
    val lastSeenTimestamp: Long = 0L,
    val fps: Float = 0f,
    val isRecording: Boolean = false,
    val recordingDurationSeconds: Long = 0L
) {
    val streamUrl: String
        get() = "http://$host:$port/stream?token=$securityToken"

    val snapshotUrl: String
        get() = "http://$host:$port/snapshot?token=$securityToken"

    val statusUrl: String
        get() = "http://$host:$port/status?token=$securityToken"

    val controlUrl: String
        get() = "http://$host:$port/api/control?token=$securityToken"
}
