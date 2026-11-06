package com.example.ui.control

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.BatteryChargingFull
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FiberManualRecord
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AppMode
import com.example.model.AppScreen
import com.example.model.CameraDevice
import com.example.ui.components.LiveStreamView
import com.example.ui.components.ModeSwitchBar
import com.example.ui.components.RecIndicator
import com.example.ui.components.StatusBadge
import com.example.ui.theme.AntraciteBackground
import com.example.ui.theme.CardBorder
import com.example.ui.theme.CardSurface
import com.example.ui.theme.CardSurfaceElevated
import com.example.ui.theme.OrangeLight
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.StatusRecording
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.TextTertiary
import com.example.ui.viewmodel.MainViewModel

@Composable
fun ControlDashboardScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val pairedCameras by viewModel.pairedCameras.collectAsState()
    val discoveredCameras by viewModel.discoveredCameras.collectAsState()
    val storageStats by viewModel.storageStats.collectAsState()
    val currentMode by viewModel.currentMode.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }
    var cameraToRename by remember { mutableStateOf<CameraDevice?>(null) }
    var renameText by remember { mutableStateOf("") }
    var cameraToDelete by remember { mutableStateOf<CameraDevice?>(null) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(AntraciteBackground)
            .statusBarsPadding()
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Header
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .background(OrangePrimary, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "IP CAM PRIVATE",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp,
                                color = TextPrimary
                            )
                        }
                        Text(
                            text = "Dashboard di Controllo & Archivio Centrale",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }

                    // Archive Storage Quick Pill
                    storageStats?.let { stats ->
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(CardSurfaceElevated)
                                .border(1.dp, CardBorder, RoundedCornerShape(12.dp))
                                .clickable { viewModel.navigateTo(AppScreen.Gallery) }
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Folder,
                                contentDescription = "Galleria",
                                tint = OrangeLight,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Column {
                                Text(
                                    text = "Archivio: ${stats.videoCount + stats.photoCount}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = stats.appUsedMb,
                                    fontSize = 10.sp,
                                    color = TextSecondary
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Mode switch selector
                ModeSwitchBar(
                    currentMode = currentMode,
                    onModeSelected = { viewModel.setAppMode(it) }
                )
            }

            // Discovered Cameras on Wi-Fi (if any detected)
            if (discoveredCameras.isNotEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "DISPOSITIVI RILEVATI SU WI-FI LOCAL",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = OrangePrimary,
                        letterSpacing = 0.5.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    discoveredCameras.forEach { discovered ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = CardSurfaceElevated),
                            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(OrangePrimary.copy(alpha = 0.4f)))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Wifi,
                                        contentDescription = null,
                                        tint = OrangePrimary,
                                        modifier = Modifier.size(22.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(
                                            text = discovered.name,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = TextPrimary
                                        )
                                        Text(
                                            text = "${discovered.host}:${discovered.port}",
                                            fontSize = 11.sp,
                                            color = TextSecondary
                                        )
                                    }
                                }

                                Button(
                                    onClick = { viewModel.pairDiscoveredCamera(discovered) },
                                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text("COLLEGA", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // Main Camera List
            if (pairedCameras.isEmpty()) {
                // Empty state
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .background(CardSurface, CircleShape)
                                .border(1.dp, CardBorder, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CameraAlt,
                                contentDescription = null,
                                tint = OrangePrimary,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Nessuna Telecamera Collegata",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Avvia l'app su un altro smartphone Android in modalità TELECAMERA, quindi scansiona il suo codice QR per vedere il flusso in diretta.",
                            fontSize = 13.sp,
                            color = TextSecondary,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            lineHeight = 18.sp,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                        Spacer(modifier = Modifier.height(20.dp))
                        Button(
                            onClick = { showAddDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.height(46.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("AGGIUNGI TELECAMERA", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 90.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    items(pairedCameras, key = { it.id }) { cam ->
                        CameraCard(
                            camera = cam,
                            bitmap = viewModel.getLatestBitmap(cam.id),
                            onCardClick = { viewModel.navigateTo(AppScreen.LiveDetail(cam.id)) },
                            onToggleRec = { viewModel.toggleRecording(cam.id) },
                            onTakeSnapshot = { viewModel.takeSnapshot(cam.id) },
                            onRename = {
                                cameraToRename = cam
                                renameText = cam.name
                            },
                            onDelete = { cameraToDelete = cam }
                        )
                    }
                }
            }
        }

        // Floating Action Buttons (Galleria + Aggiungi)
        Row(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .navigationBarsPadding()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            FloatingActionButton(
                onClick = { viewModel.navigateTo(AppScreen.Gallery) },
                containerColor = CardSurfaceElevated,
                contentColor = OrangeLight,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .size(54.dp)
                    .border(1.dp, CardBorder, RoundedCornerShape(16.dp))
            ) {
                Icon(Icons.Default.Folder, contentDescription = "Galleria Archivio")
            }

            Spacer(modifier = Modifier.width(12.dp))

            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = OrangePrimary,
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.size(54.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Aggiungi Telecamera")
            }
        }
    }

    // Add Camera Dialog
    if (showAddDialog) {
        AddCameraDialog(
            cameraManager = viewModel.cameraManager,
            onDismiss = { showAddDialog = false },
            onAddManual = { name, host, port, pin ->
                viewModel.addCamera(name, host, port, pin)
                showAddDialog = false
            },
            onQrScanned = { qr ->
                val ok = viewModel.parseAndAddFromQr(qr)
                if (ok) {
                    showAddDialog = false
                    viewModel.showFeedback("Telecamera associata con successo!")
                }
            }
        )
    }

    // Rename Dialog
    cameraToRename?.let { cam ->
        AlertDialog(
            onDismissRequest = { cameraToRename = null },
            title = { Text("Rinomina Telecamera", color = TextPrimary) },
            text = {
                OutlinedTextField(
                    value = renameText,
                    onValueChange = { renameText = it },
                    label = { Text("Nome") },
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
                        if (renameText.isNotBlank()) {
                            viewModel.updateCameraName(cam.id, renameText)
                        }
                        cameraToRename = null
                    }
                ) {
                    Text("SALVA", color = OrangePrimary, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { cameraToRename = null }) {
                    Text("ANNULLA", color = TextSecondary)
                }
            },
            containerColor = CardSurface
        )
    }

    // Delete Confirmation Dialog
    cameraToDelete?.let { cam ->
        AlertDialog(
            onDismissRequest = { cameraToDelete = null },
            title = { Text("Rimuovere Telecamera?", color = TextPrimary) },
            text = {
                Text(
                    "Vuoi rimuovere '${cam.name}' dalla lista dei dispositivi controllati? I file registrati resteranno conservati nell'archivio.",
                    color = TextSecondary
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.removeCamera(cam.id)
                        cameraToDelete = null
                    }
                ) {
                    Text("RIMUOVI", color = Color(0xFFFF5252), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { cameraToDelete = null }) {
                    Text("ANNULLA", color = TextSecondary)
                }
            },
            containerColor = CardSurface
        )
    }
}

@Composable
private fun CameraCard(
    camera: CameraDevice,
    bitmap: android.graphics.Bitmap?,
    onCardClick: () -> Unit,
    onToggleRec: () -> Unit,
    onTakeSnapshot: () -> Unit,
    onRename: () -> Unit,
    onDelete: () -> Unit
) {
    var showMenu by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .border(1.dp, CardBorder, RoundedCornerShape(20.dp)),
        colors = CardDefaults.cardColors(containerColor = CardSurface)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            // Live Video Preview Container
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .background(AntraciteBackground)
                    .clickable { onCardClick() }
            ) {
                LiveStreamView(
                    bitmap = bitmap,
                    isOnline = camera.isOnline,
                    modifier = Modifier.fillMaxSize()
                )

                // Top Left Overlay: Camera Name & IP
                Row(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(10.dp)
                        .background(Color.Black.copy(alpha = 0.65f), RoundedCornerShape(10.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Videocam,
                        contentDescription = null,
                        tint = OrangeLight,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = camera.name,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                // Top Right: REC indicator (if recording) or StatusBadge
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(10.dp)
                ) {
                    if (camera.isRecording) {
                        RecIndicator(durationSeconds = camera.recordingDurationSeconds)
                    } else {
                        StatusBadge(isOnline = camera.isOnline)
                    }
                }

                // Bottom Right: Fullscreen Live Icon
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(10.dp)
                        .size(32.dp)
                        .background(Color.Black.copy(alpha = 0.6f), CircleShape)
                        .clickable { onCardClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Fullscreen,
                        contentDescription = "Schermo Intero",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            // Controls & Details Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "${camera.host}:${camera.port}",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        fontWeight = FontWeight.Medium
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.BatteryChargingFull,
                            contentDescription = "Batteria",
                            tint = TextTertiary,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${camera.batteryPercent}% • ${camera.facing}",
                            fontSize = 11.sp,
                            color = TextTertiary
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Snapshot Button
                    IconButton(
                        onClick = onTakeSnapshot,
                        modifier = Modifier
                            .size(36.dp)
                            .background(CardSurfaceElevated, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.PhotoCamera,
                            contentDescription = "Scatta Foto",
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // Quick REC Button
                    IconButton(
                        onClick = onToggleRec,
                        modifier = Modifier
                            .size(36.dp)
                            .background(if (camera.isRecording) StatusRecording else CardSurfaceElevated, CircleShape)
                    ) {
                        Icon(
                            imageVector = if (camera.isRecording) Icons.Default.Stop else Icons.Default.FiberManualRecord,
                            contentDescription = if (camera.isRecording) "Arresta REC" else "Avvia REC",
                            tint = if (camera.isRecording) Color.White else StatusRecording,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    // 3-dots Menu
                    Box {
                        IconButton(onClick = { showMenu = true }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = "Opzioni",
                                tint = TextSecondary
                            )
                        }

                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false },
                            modifier = Modifier.background(CardSurface)
                        ) {
                            DropdownMenuItem(
                                text = { Text("Rinomina", color = TextPrimary) },
                                onClick = {
                                    showMenu = false
                                    onRename()
                                },
                                leadingIcon = {
                                    Icon(Icons.Default.Edit, contentDescription = null, tint = OrangePrimary)
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("Rimuovi", color = Color(0xFFFF5252)) },
                                onClick = {
                                    showMenu = false
                                    onDelete()
                                },
                                leadingIcon = {
                                    Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFFFF5252))
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
