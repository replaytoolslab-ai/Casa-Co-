package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val IpCamColorScheme = darkColorScheme(
    primary = OrangePrimary,
    onPrimary = Color.White,
    primaryContainer = OrangeContainer,
    onPrimaryContainer = OnOrangeContainer,
    secondary = OrangeLight,
    onSecondary = Color.Black,
    secondaryContainer = CardSurfaceElevated,
    onSecondaryContainer = TextPrimary,
    tertiary = StatusOnline,
    onTertiary = Color.Black,
    background = AntraciteBackground,
    onBackground = TextPrimary,
    surface = SurfaceDark,
    onSurface = TextPrimary,
    surfaceVariant = CardSurface,
    onSurfaceVariant = TextSecondary,
    outline = CardBorder,
    outlineVariant = Color(0xFF222834),
    error = StatusRecording,
    onError = Color.White
)

@Composable
fun IpCamTheme(
    darkTheme: Boolean = true, // Default to Dark Premium interface as requested
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = IpCamColorScheme,
        typography = Typography,
        content = content
    )
}
