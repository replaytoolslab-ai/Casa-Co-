package com.example.ui.components

import android.graphics.Bitmap
import android.graphics.SurfaceTexture
import android.view.Surface
import android.view.TextureView
import android.view.ViewGroup
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.VideocamOff
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.AntraciteBackground
import com.example.ui.theme.OrangePrimary
import com.example.ui.theme.TextSecondary

@Composable
fun LiveStreamView(
    bitmap: Bitmap?,
    isOnline: Boolean,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop,
    onSurfaceAvailable: ((Surface) -> Unit)? = null,
    onSurfaceDestroyed: (() -> Unit)? = null
) {
    var hasSurfaceRendered by remember { mutableStateOf(false) }

    Box(
        modifier = modifier.background(AntraciteBackground),
        contentAlignment = Alignment.Center
    ) {
        if (onSurfaceAvailable != null) {
            // Hardware H.264 Direct Surface Rendering
            AndroidView(
                factory = { ctx ->
                    TextureView(ctx).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        surfaceTextureListener = object : TextureView.SurfaceTextureListener {
                            override fun onSurfaceTextureAvailable(st: SurfaceTexture, w: Int, h: Int) {
                                val surface = Surface(st)
                                hasSurfaceRendered = true
                                onSurfaceAvailable(surface)
                            }

                            override fun onSurfaceTextureSizeChanged(st: SurfaceTexture, w: Int, h: Int) {}

                            override fun onSurfaceTextureDestroyed(st: SurfaceTexture): Boolean {
                                hasSurfaceRendered = false
                                onSurfaceDestroyed?.invoke()
                                return true
                            }

                            override fun onSurfaceTextureUpdated(st: SurfaceTexture) {
                                hasSurfaceRendered = true
                            }
                        }
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
        }

        // MJPEG fallback or initial snapshot preview
        if (bitmap != null && (!hasSurfaceRendered || onSurfaceAvailable == null)) {
            Image(
                bitmap = bitmap.asImageBitmap(),
                contentDescription = "Flusso Live Camera",
                modifier = Modifier.fillMaxSize(),
                contentScale = contentScale
            )
        } else if (isOnline && !hasSurfaceRendered && bitmap == null) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(36.dp),
                    color = OrangePrimary,
                    strokeWidth = 3.dp
                )
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "Aggancio flusso Full HD H.264...",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        } else if (!isOnline && !hasSurfaceRendered) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.VideocamOff,
                    contentDescription = "Telecamera Offline",
                    tint = Color(0xFF556072),
                    modifier = Modifier.size(42.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Telecamera non raggiungibile",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
