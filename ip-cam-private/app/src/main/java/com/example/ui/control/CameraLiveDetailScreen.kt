package com.example.ui.control

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.rememberTransformableState
import androidx.compose.foundation.gestures.transformable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Cameraswitch
import androidx.compose.material.icons.filled.FiberManualRecord
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.FlashlightOff
import androidx.compose.material.icons.filled.FlashlightOn
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.Slider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.LiveStreamView
import com.example.ui.components.RecIndicator
import com.example.ui.components.StatusBadge
import com.example.ui.theme.AntraciteBackground
import com.example.ui.theme.CardBorder
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.StatusRecording
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.viewmodel.MainViewModel

@Composable
fun CameraLiveDetailScreen(
    cameraId: String,
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    BackHandler {
        viewModel.navigateBack()
    }

    val pairedCameras by viewModel.pairedCameras.collectAsState()
    val camera = pairedCameras.find { it.id == cameraId }
    val detailBitmap by viewModel.detailFrameBitmap.collectAsState()
    val detailFps by viewModel.detailFps.collectAsState()
    val detailBitrate by viewModel.detailBitrate.collectAsState()

    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    var nightMode by remember { mutableStateOf(false) }
    var exposure by remember { mutableFloatStateOf(0f) }

    val transformState = rememberTransformableState { zoomChange, panChange, _ ->
        scale = (scale * zoomChange).coerceIn(1f, 4f)
        val limit = 420f * (scale - 1f)
        offset = Offset((offset.x + panChange.x).coerceIn(-limit, limit), (offset.y + panChange.y).coerceIn(-limit, limit))
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(AntraciteBackground)
    ) {
        // Edge-to-edge Live Video Stream with digital zoom
        Box(
            modifier = Modifier
                .fillMaxSize()
                .transformable(state = transformState)
                .graphicsLayer(
                    scaleX = scale,
                    scaleY = scale,
                    translationX = offset.x,
                    translationY = offset.y
                )
        ) {
            LiveStreamView(
                bitmap = detailBitmap,
                isOnline = camera?.isOnline ?: false,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Fit
            )
        }

        // Top Navigation Bar Overlay
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.TopCenter)
                .statusBarsPadding()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(
                    onClick = { viewModel.navigateBack() },
                    modifier = Modifier
                        .size(42.dp)
                        .background(Color.Black.copy(alpha = 0.65f), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Indietro",
                        tint = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column(
                    modifier = Modifier
                        .background(Color.Black.copy(alpha = 0.65f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = camera?.name ?: "Telecamera",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Text(
                        text = String.format("%.1f FPS • %.0f kbps", detailFps, detailBitrate),
                        color = OrangePrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Top Right: REC badge or status
            if (camera?.isRecording == true) {
                RecIndicator(durationSeconds = camera.recordingDurationSeconds)
            } else {
                StatusBadge(isOnline = camera?.isOnline ?: false)
            }
        }

        Row(
            modifier = Modifier.align(Alignment.CenterEnd).padding(end = 10.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(Color.Black.copy(alpha = 0.72f))
                .border(1.dp, CardBorder, RoundedCornerShape(24.dp))
                .padding(horizontal = 5.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text("ZOOM", color = OrangePrimary, fontSize = 8.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 4.dp))
            IconButton(onClick = { scale = (scale - 0.25f).coerceIn(1f, 4f); if (scale <= 1f) offset = Offset.Zero }, modifier = Modifier.size(34.dp)) {
                Text("−", color = Color.White, fontSize = 20.sp)
            }
            Text(String.format("%.1fx", scale), color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            IconButton(onClick = { scale = (scale + 0.25f).coerceIn(1f, 4f) }, modifier = Modifier.size(34.dp)) {
                Text("+", color = Color.White, fontSize = 20.sp)
            }
            if (scale > 1.05f) {
                IconButton(onClick = { offset = Offset.Zero; scale = 1f }, modifier = Modifier.size(34.dp)) {
                    Text("↺", color = OrangePrimary, fontSize = 18.sp)
                }
            }
        }

        // Reset Zoom button (if zoomed in)
        if (scale > 1.05f) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 90.dp, end = 16.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color.Black.copy(alpha = 0.7f))
                    .border(1.dp, CardBorder, RoundedCornerShape(10.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = String.format("Zoom %.1fx (Tocca per resettare)", scale),
                    color = Color.White,
                    fontSize = 11.sp,
                    modifier = Modifier.clip(RoundedCornerShape(10.dp))
                )
            }
        }

        Column(
            modifier = Modifier.align(Alignment.BottomStart).navigationBarsPadding()
                .padding(start = 10.dp, bottom = 108.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(Color.Black.copy(alpha = 0.82f))
                .border(1.dp, CardBorder, RoundedCornerShape(14.dp))
                .padding(horizontal = 9.dp, vertical = 7.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                IconButton(
                    onClick = { nightMode = !nightMode; viewModel.setRemoteNightMode(cameraId, nightMode) },
                    modifier = Modifier.size(34.dp).background(if (nightMode) OrangePrimary else Color(0xFF2C3240), CircleShape)
                ) { Text("☾", color = Color.White, fontSize = 18.sp) }
                Text(if (nightMode) "NOTTE ON" else "NOTTE", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
            }
            Text("ESPOSIZIONE " + exposure.toInt(), color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
            Slider(
                value = exposure,
                onValueChange = { exposure = it },
                onValueChangeFinished = { viewModel.setRemoteExposure(cameraId, exposure.toInt()) },
                valueRange = -6f..6f,
                steps = 11,
                modifier = Modifier.width(116.dp)
            )
        }

        // Floating Bottom Controls Bar
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 24.dp)
                .clip(RoundedCornerShape(28.dp))
                .background(Color.Black.copy(alpha = 0.75f))
                .border(1.dp, CardBorder, RoundedCornerShape(28.dp))
                .padding(horizontal = 20.dp, vertical = 12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(22.dp)
            ) {
                // Remote Flashlight Toggle
                IconButton(
                    onClick = { viewModel.toggleRemoteTorch(cameraId) },
                    modifier = Modifier
                        .size(46.dp)
                        .background(
                            if (camera?.isTorchOn == true) OrangePrimary else Color(0xFF2C3240),
                            CircleShape
                        )
                ) {
                    Icon(
                        imageVector = if (camera?.isTorchOn == true) Icons.Default.FlashlightOn else Icons.Default.FlashlightOff,
                        contentDescription = "Torcia Telecamera",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // REC Button (Centerpiece - start/stop recording on CONTROLLO)
                val isRec = camera?.isRecording == true
                IconButton(
                    onClick = { viewModel.toggleRecording(cameraId) },
                    modifier = Modifier
                        .size(62.dp)
                        .background(if (isRec) StatusRecording else OrangePrimary, CircleShape)
                        .border(3.dp, Color.White, CircleShape)
                ) {
                    Icon(
                        imageVector = if (isRec) Icons.Default.Stop else Icons.Default.FiberManualRecord,
                        contentDescription = if (isRec) "Arresta Registrazione" else "Avvia Registrazione",
                        tint = Color.White,
                        modifier = Modifier.size(28.dp)
                    )
                }

                // Snapshot Button (takes picture and saves on CONTROLLO)
                IconButton(
                    onClick = { viewModel.takeSnapshot(cameraId) },
                    modifier = Modifier
                        .size(46.dp)
                        .background(Color(0xFF2C3240), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.PhotoCamera,
                        contentDescription = "Scatta Foto",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Switch Camera Facing (front/back)
                IconButton(
                    onClick = { viewModel.switchRemoteCameraFacing(cameraId) },
                    modifier = Modifier
                        .size(46.dp)
                        .background(Color(0xFF2C3240), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Cameraswitch,
                        contentDescription = "Inverti Fotocamera",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        }
    }
}
