package com.example.network

import android.media.MediaCodecInfo
import android.media.MediaCodecList
import android.media.MediaFormat
import android.os.Build

/**
 * Selects Android platform AVC codecs without bundling third-party codec binaries.
 * The LAN H.264 transport uses this capability gate before starting a stream.
 */
object H264CodecSupport {
    const val MIME_TYPE = MediaFormat.MIMETYPE_VIDEO_AVC

    data class CodecCapability(
        val name: String,
        val isHardwareAccelerated: Boolean,
        val supportsFullHd30: Boolean,
        val maxWidth: Int,
        val maxHeight: Int,
        val maxFrameRate: Double
    )

    data class DeviceSupport(
        val encoder: CodecCapability?,
        val decoder: CodecCapability?
    ) {
        val canStreamFullHdWithHardware: Boolean
            get() = encoder?.let { it.isHardwareAccelerated && it.supportsFullHd30 } == true &&
                decoder?.let { it.isHardwareAccelerated && it.supportsFullHd30 } == true
    }

    fun inspectDevice(): DeviceSupport {
        val codecs = MediaCodecList(MediaCodecList.REGULAR_CODECS).codecInfos
        return DeviceSupport(
            encoder = selectCodec(codecs, encoder = true),
            decoder = selectCodec(codecs, encoder = false)
        )
    }

    private fun selectCodec(
        codecs: Array<MediaCodecInfo>,
        encoder: Boolean
    ): CodecCapability? {
        return codecs.asSequence()
            .filter { it.isEncoder == encoder }
            .filter { info -> info.supportedTypes.any { it.equals(MIME_TYPE, ignoreCase = true) } }
            .mapNotNull { capabilityFor(it) }
            .sortedWith(
                compareByDescending<CodecCapability> { it.isHardwareAccelerated }
                    .thenByDescending { it.supportsFullHd30 }
            )
            .firstOrNull()
    }

    private fun capabilityFor(info: MediaCodecInfo): CodecCapability? {
        return try {
            val caps = info.getCapabilitiesForType(MIME_TYPE)
            val video = caps.videoCapabilities ?: return null
            val supportsFullHd30 =
                video.areSizeAndRateSupported(1920, 1080, 30.0) ||
                    video.areSizeAndRateSupported(1080, 1920, 30.0)

            val hardware = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                info.isHardwareAccelerated
            } else {
                val name = info.name.lowercase()
                !name.startsWith("omx.google.") &&
                    !name.startsWith("c2.android.") &&
                    !name.contains("ffmpeg") &&
                    !name.contains("software")
            }

            CodecCapability(
                name = info.name,
                isHardwareAccelerated = hardware,
                supportsFullHd30 = supportsFullHd30,
                maxWidth = video.supportedWidths.upper,
                maxHeight = video.supportedHeights.upper,
                maxFrameRate = video.supportedFrameRates.upper.toDouble()
            )
        } catch (_: Exception) {
            null
        }
    }

    fun createEncoderFormat(
        width: Int = 1920,
        height: Int = 1080,
        bitRate: Int = 6_000_000,
        frameRate: Int = 30,
        keyFrameIntervalSeconds: Int = 2
    ): MediaFormat {
        return MediaFormat.createVideoFormat(MIME_TYPE, width, height).apply {
            setInteger(
                MediaFormat.KEY_COLOR_FORMAT,
                MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface
            )
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
            setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
            setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, keyFrameIntervalSeconds)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                setInteger(
                    MediaFormat.KEY_BITRATE_MODE,
                    MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_VBR
                )
            }
        }
    }
}
