package com.example.model

import android.net.Uri

data class MediaItem(
    val id: Long,
    val uri: Uri,
    val name: String,
    val cameraName: String,
    val dateModifiedMs: Long,
    val sizeBytes: Long,
    val isVideo: Boolean,
    val durationMs: Long = 0L,
    val relativePath: String
) {
    val formattedSize: String
        get() {
            val mb = sizeBytes / (1024.0 * 1024.0)
            return if (mb >= 1.0) {
                String.format("%.1f MB", mb)
            } else {
                val kb = sizeBytes / 1024.0
                String.format("%.1f KB", kb)
            }
        }
}
