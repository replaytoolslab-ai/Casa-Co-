package com.example.model

enum class AppMode {
    CONTROL,    // Telefono CONTROLLO (Ricevitore, visualizzatore, archivio centralizzato)
    CAMERA      // Telefono TELECAMERA (Trasmettitore sensore video)
}

sealed class AppScreen {
    object Dashboard : AppScreen()
    data class LiveDetail(val cameraId: String) : AppScreen()
    object Gallery : AppScreen()
    data class MediaViewer(val mediaUri: String) : AppScreen()
    object Settings : AppScreen()
    object QrScanner : AppScreen()
}
