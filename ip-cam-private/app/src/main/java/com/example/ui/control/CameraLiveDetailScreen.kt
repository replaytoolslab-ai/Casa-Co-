package com.example.ui.control

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.CenterFocusStrong
import androidx.compose.material.icons.filled.ControlCamera
import androidx.compose.material.icons.filled.FiberManualRecord
import androidx.compose.material.icons.filled.FlashlightOff
import androidx.compose.material.icons.filled.FlashlightOn
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.NightsStay
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
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
import com.example.ui.theme.CardSurfaceElevated
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.StatusOnline
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
    val detailCodec by viewModel.detailCodec.collectAsState()

    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    var showPtzPanel by remember { mutableStateOf(false) }

    val transformState = rememberTransformableState { zoomChange, panChange, _ ->
        scale = (scale * zoomChange).coerceIn(1f, 5f)
        offset = Offset(offset.x + panChange.x, offset.y + panChange.y)
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(AntraciteBackground)
    ) {
        // Edge-to-edge Live Video Stream with digital PTZ & zoom
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
                contentScale = ContentScale.Fit,
                onSurfaceAvailable = { surface ->
                    viewModel.setStreamSurface(cameraId, surface)
                },
                onSurfaceDestroyed = {
                    viewModel.setStreamSurface(cameraId, null)
                }
            )
        }

        // Top Navigation & Telemetry Bar
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = camera?.name ?: "Telecamera",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        if (camera?.isNightMode == true) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "🌙 NOTTE",
                                color = Color(0xFF64B5F6),
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp
                            )
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = String.format("%.1f FPS • %.0f kbps", detailFps, detailBitrate),
                            color = OrangePrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "[$detailCodec]",
                            color = if (detailCodec.contains("H.264")) StatusOnline else Color(0xFFFFB74D),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Top Right: REC badge or status
            if (camera?.isRecording == true) {
                RecIndicator(durationSeconds = camera.recordingDurationSeconds)
            } else {
                StatusBadge(isOnline = camera?.isOnline ?: false)
            }
        }

        // PTZ Pan-Tilt & Zoom Controller Overlay (D-pad & Zoom bar)
        AnimatedVisibility(
            visible = showPtzPanel,
            enter = fadeIn() + slideInVertically(initialOffsetY = { it / 2 }),
            exit = fadeOut() + slideOutVertically(targetOffsetY = { it / 2 }),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 100.dp, start = 16.dp, end = 16.dp)
        ) {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = androidx.compose.material3.CardDefaults.cardColors(containerColor = Color.Black.copy(alpha = 0.85f)),
                border = androidx.compose.material3.CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Zoom Controls (Hardware Remote Zoom + Digital)
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "ZOOM TELECAMERA",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = {
                                    viewModel.remoteZoomOut(cameraId)
                                    scale = (scale - 0.25f).coerceAtLeast(1f)
                                },
                                modifier = Modifier
                                    .size(42.dp)
                                    .background(CardSurfaceElevated, CircleShape)
                            ) {
                                Icon(Icons.Default.ZoomOut, contentDescription = "Zoom Meno", tint = Color.White)
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF232A38))
                                    .clickable {
                                        viewModel.remoteResetZoom(cameraId)
                                        scale = 1f
                                        offset = Offset.Zero
                                    }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = String.format("%.1fx", camera?.zoomRatio ?: scale),
                                    color = OrangePrimary,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 13.sp
                                )
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            IconButton(
                                onClick = {
                                    viewModel.remoteZoomIn(cameraId)
                                    scale = (scale + 0.25f).coerceAtMost(5f)
                                },
                                modifier = Modifier
                                    .size(42.dp)
                                    .background(CardSurfaceElevated, CircleShape)
                            ) {
                                Icon(Icons.Default.ZoomIn, contentDescription = "Zoom Piu", tint = Color.White)
                            }
                        }
                    }

                    // D-Pad Directional Movement (Pan/Tilt)
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "MOVIMENTO PTZ",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))

                        // Up
                        IconButton(
                            onClick = { offset = Offset(offset.x, offset.y + 70f) },
                            modifier = Modifier
                                .size(36.dp)
                                .background(CardSurfaceElevated, CircleShape)
                        ) {
                            Icon(Icons.Default.KeyboardArrowUp, contentDescription = "Su", tint = Color.White)
                        }

                        // Left - Center - Right
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = { offset = Offset(offset.x + 70f, offset.y) },
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(CardSurfaceElevated, CircleShape)
                            ) {
                                Icon(Icons.Default.KeyboardArrowLeft, contentDescription = "Sinistra", tint = Color.White)
                            }

                            Spacer(modifier = Modifier.width(6.dp))

                            // Reset Pan/Tilt Centering
                            IconButton(
                                onClick = { offset = Offset.Zero },
                                modifier = Modifier
                                    .size(32.dp)
                                    .background(OrangePrimary.copy(alpha = 0.3f), CircleShape)
                            ) {
                                Icon(Icons.Default.CenterFocusStrong, contentDescription = "Centra", tint = OrangePrimary, modifier = Modifier.size(16.dp))
                            }

                            Spacer(modifier = Modifier.width(6.dp))

                            IconButton(
                                onClick = { offset = Offset(offset.x - 70f, offset.y) },
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(CardSurfaceElevated, CircleShape)
                            ) {
                                Icon(Icons.Default.KeyboardArrowRight, contentDescription = "Destra", tint = Color.White)
                            }
                        }

                        // Down
                        IconButton(
                            onClick = { offset = Offset(offset.x, offset.y - 70f) },
                            modifier = Modifier
                                .size(36.dp)
                                .background(CardSurfaceElevated, CircleShape)
                        ) {
                            Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Giu", tint = Color.White)
                        }
                    }
                }
            }
        }

        // Floating Bottom Controls Bar
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 20.dp, start = 12.dp, end = 12.dp)
                .clip(RoundedCornerShape(30.dp))
                .background(Color.Black.copy(alpha = 0.82f))
                .border(1.dp, CardBorder, RoundedCornerShape(30.dp))
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Night Mode Toggle (🌙)
                val isNight = camera?.isNightMode == true
                IconButton(
                    onClick = { viewModel.toggleRemoteNightMode(cameraId) },
                    modifier = Modifier
                        .size(46.dp)
                        .background(
                            if (isNight) Color(0xFF1E3A8A) else Color(0xFF2C3240),
                            CircleShape
                        )
                        .border(1.dp, if (isNight) Color(0xFF60A5FA) else Color.Transparent, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.NightsStay,
                        contentDescription = "Modalità Notturna",
                        tint = if (isNight) Color(0xFF93C5FD) else Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // PTZ / Zoom Panel Toggle
                IconButton(
                    onClick = { showPtzPanel = !showPtzPanel },
                    modifier = Modifier
                        .size(46.dp)
                        .background(
                            if (showPtzPanel) OrangePrimary else Color(0xFF2C3240),
                            CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.ControlCamera,
                        contentDescription = "Controlli PTZ e Zoom",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // REC Button (Central - start/stop recording on CONTROLLO)
                val isRec = camera?.isRecording == true
                IconButton(
                    onClick = { viewModel.toggleRecording(cameraId) },
                    modifier = Modifier
                        .size(60.dp)
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

                // Remote Torch Toggle
                val isTorch = camera?.isTorchOn == true
                IconButton(
                    onClick = { viewModel.toggleRemoteTorch(cameraId) },
                    modifier = Modifier
                        .size(46.dp)
                        .background(
                            if (isTorch) OrangePrimary else Color(0xFF2C3240),
                            CircleShape
                        )
                ) {
                    Icon(
                        imageVector = if (isTorch) Icons.Default.FlashlightOn else Icons.Default.FlashlightOff,
                        contentDescription = "Torcia Telecamera",
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
