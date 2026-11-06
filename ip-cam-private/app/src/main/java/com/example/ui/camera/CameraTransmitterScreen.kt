package com.example.ui.camera

import android.view.ViewGroup
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.BrightnessLow
import androidx.compose.material.icons.filled.Cameraswitch
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FlashlightOff
import androidx.compose.material.icons.filled.FlashlightOn
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.example.model.AppMode
import com.example.ui.components.ModeSwitchBar
import com.example.ui.theme.AntraciteBackground
import com.example.ui.theme.CardBorder
import com.example.ui.theme.CardSurface
import com.example.ui.theme.CardSurfaceElevated
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.StatusOnline
import com.example.ui.theme.StatusRecording
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.viewmodel.MainViewModel

@Composable
fun CameraTransmitterScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val cameraName by viewModel.cameraName.collectAsState()
    val securityPin by viewModel.securityPin.collectAsState()
    val localIp by viewModel.localIpAddress.collectAsState()
    val isServerRunning by viewModel.isServerRunning.collectAsState()
    val connectedClients by viewModel.connectedClientsCount.collectAsState()
    val qrBitmap by viewModel.qrBitmap.collectAsState()
    val isStealthMode by viewModel.isStealthMode.collectAsState()
    val isTorchOn by viewModel.isCameraTorchOn.collectAsState()
    val currentMode by viewModel.currentMode.collectAsState()
    val remoteSwitchRequest by viewModel.remoteSwitchRequest.collectAsState()

    val lifecycleOwner = LocalLifecycleOwner.current
    var previewViewRef by remember { mutableStateOf<PreviewView?>(null) }
    var showQrDialog by remember { mutableStateOf(false) }
    var showRenameDialog by remember { mutableStateOf(false) }
    var renameInput by remember { mutableStateOf("") }
    var isNightModeEnabled by remember { mutableStateOf(viewModel.cameraManager.isNightModeEnabled) }
    var handledSwitchRequest by remember { mutableStateOf(0) }

    LaunchedEffect(remoteSwitchRequest, previewViewRef) {
        if (remoteSwitchRequest > handledSwitchRequest && previewViewRef != null) {
            viewModel.cameraManager.switchCamera(lifecycleOwner, previewViewRef)
            handledSwitchRequest = remoteSwitchRequest
        }
    }

    // Acquisizione e analisi si attivano solo quando CONTROLLO apre il Live.
    LaunchedEffect(isServerRunning, connectedClients, previewViewRef) {
        val preview = previewViewRef
        if (isServerRunning && connectedClients > 0 && preview != null) {
            viewModel.cameraManager.startCameraForStreaming(
                lifecycleOwner = lifecycleOwner,
                previewView = preview,
                onFrame = { jpegBytes, bitmap ->
                    viewModel.onNewCameraFrame(jpegBytes, bitmap)
                },
                onH264Format = viewModel::onH264Format,
                onH264Frame = { bytes, pts, keyFrame ->
                    viewModel.onH264Frame(bytes, pts, keyFrame)
                },
                shouldEncodeJpeg = { viewModel.shouldEncodeJpeg() },
                onH264Unavailable = viewModel::onH264Unavailable,
                shouldEncodeH264 = { viewModel.shouldEncodeH264() }
            )
        } else {
            viewModel.cameraManager.stop()
        }
    }

    DisposableEffect(Unit) {
        onDispose { viewModel.cameraManager.stop() }
    }

    if (isStealthMode) {
        // Stealth / Screen Dimming Mode (Battery Saver during continuous transmission)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black)
                .clickable { viewModel.toggleStealthMode() },
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(24.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .background(StatusRecording, CircleShape)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "MODALITÀ RISPARMIO SCHERMO",
                    color = Color.White.copy(alpha = 0.5f),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Streaming in corso verso CONTROLLO\nTocca lo schermo per riattivare la visualizzazione",
                    color = Color.White.copy(alpha = 0.35f),
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center
                )
            }
        }
        return
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(AntraciteBackground)
    ) {
        // CameraX live viewfinder
        AndroidView(
            factory = { ctx ->
                PreviewView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    previewViewRef = this
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Top Overlay: Privacy and Streaming Banner
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.TopCenter)
                .statusBarsPadding()
                .padding(16.dp)
        ) {
            // Mode Switcher
            ModeSwitchBar(
                currentMode = currentMode,
                onModeSelected = { viewModel.setAppMode(it) }
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Prominent Privacy & Streaming Status Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Black.copy(alpha = 0.82f)),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(
                        if (isServerRunning) StatusOnline else CardBorder
                    )
                )
            ) {
                Column(
                    modifier = Modifier.padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .background(if (isServerRunning) StatusOnline else Color.Gray, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isServerRunning) "STREAMING ATTIVO" else "STREAMING IN PAUSA",
                                color = if (isServerRunning) StatusOnline else TextSecondary,
                                fontWeight = FontWeight.Black,
                                fontSize = 13.sp,
                                letterSpacing = 0.5.sp
                            )
                        }

                        // Viewer counter
                        if (isServerRunning) {
                            Row(
                                modifier = Modifier
                                    .background(OrangePrimary.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 3.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Visibility,
                                    contentDescription = null,
                                    tint = OrangePrimary,
                                    modifier = Modifier.size(12.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "$connectedClients Ricevitori",
                                    color = OrangePrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "ARCHIVIAZIONE CENTRALIZZATA: nessun video o fotografia viene salvato su questa telecamera. L'intero archivio è archiviato sul telefono CONTROLLO.",
                        color = TextSecondary,
                        fontSize = 11.sp,
                        lineHeight = 15.sp
                    )
                }
            }
        }

        // Bottom Info & Controls Panel
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(16.dp)
        ) {
            // Quick Connection Details Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Black.copy(alpha = 0.82f)),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = cameraName,
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                            IconButton(
                                onClick = {
                                    renameInput = cameraName
                                    showRenameDialog = true
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    Icons.Default.Edit,
                                    contentDescription = "Rinomina",
                                    tint = OrangePrimary,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                        Text(
                            text = "IP: http://$localIp:8888",
                            color = OrangePrimary,
                            fontWeight = FontWeight.Medium,
                            fontSize = 12.sp
                        )
                        Text(
                            text = "PIN di Sicurezza: $securityPin",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    }

                    // QR Code Modal Trigger
                    Button(
                        onClick = { showQrDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = CardSurfaceElevated),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.border(1.dp, CardBorder, RoundedCornerShape(12.dp))
                    ) {
                        Icon(Icons.Default.QrCode, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("QR CODE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action Buttons Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Torch toggle
                IconButton(
                    onClick = { viewModel.toggleLocalTorch() },
                    modifier = Modifier
                        .size(48.dp)
                        .background(if (isTorchOn) OrangePrimary else Color.Black.copy(alpha = 0.7f), CircleShape)
                        .border(1.dp, CardBorder, CircleShape)
                ) {
                    Icon(
                        imageVector = if (isTorchOn) Icons.Default.FlashlightOn else Icons.Default.FlashlightOff,
                        contentDescription = "Torcia",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Night mode: increase exposure using the camera sensor
                IconButton(
                    onClick = {
                        isNightModeEnabled = !isNightModeEnabled
                        viewModel.cameraManager.setNightMode(isNightModeEnabled)
                    },
                    modifier = Modifier
                        .size(48.dp)
                        .background(if (isNightModeEnabled) OrangePrimary else Color.Black.copy(alpha = 0.7f), CircleShape)
                        .border(1.dp, CardBorder, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.BrightnessLow,
                        contentDescription = if (isNightModeEnabled) "Disattiva modalità notturna" else "Attiva modalità notturna",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Switch front/back camera
                IconButton(
                    onClick = {
                        viewModel.cameraManager.switchCamera(lifecycleOwner, previewViewRef)
                    },
                    modifier = Modifier
                        .size(48.dp)
                        .background(Color.Black.copy(alpha = 0.7f), CircleShape)
                        .border(1.dp, CardBorder, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Cameraswitch,
                        contentDescription = "Inverti Fotocamera",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Stealth Screen Saver Mode
                IconButton(
                    onClick = { viewModel.toggleStealthMode() },
                    modifier = Modifier
                        .size(48.dp)
                        .background(Color.Black.copy(alpha = 0.7f), CircleShape)
                        .border(1.dp, CardBorder, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Visibility,
                        contentDescription = "Risparmio Schermo",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                // Main Start / Stop Streaming Button
                Button(
                    onClick = {
                        if (isServerRunning) {
                            viewModel.stopCameraTransmitter()
                        } else {
                            viewModel.startCameraTransmitter()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isServerRunning) StatusRecording else OrangePrimary
                    ),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.height(48.dp)
                ) {
                    Icon(
                        imageVector = if (isServerRunning) Icons.Default.Stop else Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isServerRunning) "ARRESTA" else "AVVIA TRASMISSIONE",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }

    // QR Code Modal Dialog
    if (showQrDialog) {
        AlertDialog(
            onDismissRequest = { showQrDialog = false },
            title = {
                Text(
                    text = "Associazione Telecamera",
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Scansiona con il telefono CONTROLLO per collegare la telecamera istantaneamente.",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    qrBitmap?.let { bmp ->
                        Box(
                            modifier = Modifier
                                .size(230.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color.White)
                                .padding(12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                bitmap = bmp.asImageBitmap(),
                                contentDescription = "QR Code di associazione",
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Indirizzo: http://$localIp:8888",
                        fontWeight = FontWeight.Bold,
                        color = OrangePrimary,
                        fontSize = 13.sp
                    )
                    Text(
                        text = "PIN di Sicurezza: $securityPin",
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontSize = 15.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    TextButton(
                        onClick = { viewModel.regenerateSecurityPin() }
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp), tint = TextSecondary)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Rigenera PIN", color = TextSecondary, fontSize = 12.sp)
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { showQrDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
                ) {
                    Text("CHIUDI", color = Color.White)
                }
            },
            containerColor = CardSurface
        )
    }

    // Rename Dialog
    if (showRenameDialog) {
        AlertDialog(
            onDismissRequest = { showRenameDialog = false },
            title = { Text("Nome Telecamera", color = TextPrimary) },
            text = {
                OutlinedTextField(
                    value = renameInput,
                    onValueChange = { renameInput = it },
                    label = { Text("Nome (es. Salone, Ingresso)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = OrangePrimary,
                        unfocusedBorderColor = CardBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (renameInput.isNotBlank()) {
                            viewModel.updateCameraDeviceName(renameInput)
                        }
                        showRenameDialog = false
                    }
                ) {
                    Text("SALVA", color = OrangePrimary, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showRenameDialog = false }) {
                    Text("ANNULLA", color = TextSecondary)
                }
            },
            containerColor = CardSurface
        )
    }

    DisposableEffect(Unit) {
        onDispose {
            viewModel.cameraManager.stop()
        }
    }
}
