package com.example.media

import android.content.ContentResolver
import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.ParcelFileDescriptor
import android.os.StatFs
import android.provider.MediaStore
import com.example.model.MediaItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CentralStorageManager(private val context: Context) {

    private val contentResolver: ContentResolver = context.contentResolver
    private val dateFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())

    companion object {
        const val VIDEO_FOLDER = "Movies/IP CAM PRIVATE"
        const val PHOTO_FOLDER = "Pictures/IP CAM PRIVATE"
    }

    data class StorageStats(
        val totalSpaceBytes: Long,
        val availableSpaceBytes: Long,
        val appUsedSpaceBytes: Long,
        val videoCount: Int,
        val photoCount: Int
    ) {
        val availableGb: String
            get() = String.format(Locale.getDefault(), "%.1f GB", availableSpaceBytes / (1024.0 * 1024.0 * 1024.0))

        val appUsedMb: String
            get() {
                val mb = appUsedSpaceBytes / (1024.0 * 1024.0)
                return if (mb >= 1000) {
                    String.format(Locale.getDefault(), "%.2f GB", mb / 1024.0)
                } else {
                    String.format(Locale.getDefault(), "%.1f MB", mb)
                }
            }
    }

    /**
     * Prepares a new MP4 video file in Movies/IP CAM PRIVATE/ on CONTROLLO phone.
     * Returns a pair of the created Content Uri and a ParcelFileDescriptor for MediaMuxer.
     */
    suspend fun createVideoFileDescriptor(cameraName: String): Pair<Uri, ParcelFileDescriptor>? = withContext(Dispatchers.IO) {
        val sanitizedName = cameraName.replace(Regex("[^a-zA-Z0-9_-]"), "_")
        val timestamp = dateFormat.format(Date())
        val fileName = "${sanitizedName}_${timestamp}.mp4"

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Video.Media.DISPLAY_NAME, fileName)
                    put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
                    put(MediaStore.Video.Media.RELATIVE_PATH, "$VIDEO_FOLDER/")
                    put(MediaStore.Video.Media.IS_PENDING, 1)
                }
                val uri = contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values)
                    ?: return@withContext null
                val pfd = contentResolver.openFileDescriptor(uri, "rw")
                    ?: return@withContext null
                Pair(uri, pfd)
            } else {
                @Suppress("DEPRECATION")
                val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "IP CAM PRIVATE")
                if (!dir.exists()) dir.mkdirs()
                val file = File(dir, fileName)
                val pfd = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_WRITE or ParcelFileDescriptor.MODE_CREATE)
                val uri = Uri.fromFile(file)
                Pair(uri, pfd)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Finalizes the MP4 file once recording stops (clears IS_PENDING flag).
     */
    suspend fun finalizeVideo(uri: Uri) = withContext(Dispatchers.IO) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Video.Media.IS_PENDING, 0)
                }
                contentResolver.update(uri, values, null, null)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Saves a snapshot photo into Pictures/IP CAM PRIVATE/ on CONTROLLO phone.
     */
    suspend fun savePhoto(cameraName: String, jpegBytes: ByteArray): Uri? = withContext(Dispatchers.IO) {
        val sanitizedName = cameraName.replace(Regex("[^a-zA-Z0-9_-]"), "_")
        val timestamp = dateFormat.format(Date())
        val fileName = "${sanitizedName}_${timestamp}.jpg"

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Images.Media.DISPLAY_NAME, fileName)
                    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
                    put(MediaStore.Images.Media.RELATIVE_PATH, "$PHOTO_FOLDER/")
                    put(MediaStore.Images.Media.IS_PENDING, 1)
                }
                val uri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
                    ?: return@withContext null

                contentResolver.openOutputStream(uri)?.use { out ->
                    out.write(jpegBytes)
                    out.flush()
                }

                values.clear()
                values.put(MediaStore.Images.Media.IS_PENDING, 0)
                contentResolver.update(uri, values, null, null)
                uri
            } else {
                @Suppress("DEPRECATION")
                val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "IP CAM PRIVATE")
                if (!dir.exists()) dir.mkdirs()
                val file = File(dir, fileName)
                FileOutputStream(file).use { out ->
                    out.write(jpegBytes)
                    out.flush()
                }
                Uri.fromFile(file)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Saves a bitmap snapshot photo into Pictures/IP CAM PRIVATE/.
     */
    suspend fun savePhotoBitmap(cameraName: String, bitmap: Bitmap): Uri? = withContext(Dispatchers.IO) {
        val sanitizedName = cameraName.replace(Regex("[^a-zA-Z0-9_-]"), "_")
        val timestamp = dateFormat.format(Date())
        val fileName = "${sanitizedName}_${timestamp}.jpg"

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Images.Media.DISPLAY_NAME, fileName)
                    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
                    put(MediaStore.Images.Media.RELATIVE_PATH, "$PHOTO_FOLDER/")
                    put(MediaStore.Images.Media.IS_PENDING, 1)
                }
                val uri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
                    ?: return@withContext null

                contentResolver.openOutputStream(uri)?.use { out ->
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 92, out)
                    out.flush()
                }

                values.clear()
                values.put(MediaStore.Images.Media.IS_PENDING, 0)
                contentResolver.update(uri, values, null, null)
                uri
            } else {
                @Suppress("DEPRECATION")
                val dir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "IP CAM PRIVATE")
                if (!dir.exists()) dir.mkdirs()
                val file = File(dir, fileName)
                FileOutputStream(file).use { out ->
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 92, out)
                    out.flush()
                }
                Uri.fromFile(file)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Scans and returns all recordings and photos belonging to IP CAM PRIVATE.
     */
    suspend fun loadAllMedia(): List<MediaItem> = withContext(Dispatchers.IO) {
        val list = mutableListOf<MediaItem>()

        // 1. Query Videos from MediaStore
        try {
            val projection = arrayOf(
                MediaStore.Video.Media._ID,
                MediaStore.Video.Media.DISPLAY_NAME,
                MediaStore.Video.Media.DATE_MODIFIED,
                MediaStore.Video.Media.SIZE,
                MediaStore.Video.Media.DURATION,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) MediaStore.Video.Media.RELATIVE_PATH else MediaStore.Video.Media.DATA
            )
            val selection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                "${MediaStore.Video.Media.RELATIVE_PATH} LIKE ?"
            } else {
                "${MediaStore.Video.Media.DATA} LIKE ?"
            }
            val selectionArgs = arrayOf("%IP CAM PRIVATE%")

            contentResolver.query(
                MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                "${MediaStore.Video.Media.DATE_MODIFIED} DESC"
            )?.use { cursor ->
                val idCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media._ID)
                val nameCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DISPLAY_NAME)
                val dateCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATE_MODIFIED)
                val sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.SIZE)
                val durCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DURATION)

                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idCol)
                    val name = cursor.getString(nameCol) ?: "Video"
                    val date = cursor.getLong(dateCol) * 1000L
                    val size = cursor.getLong(sizeCol)
                    val duration = cursor.getLong(durCol)
                    val uri = ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id)
                    val camName = extractCameraName(name)

                    list.add(
                        MediaItem(
                            id = id,
                            uri = uri,
                            name = name,
                            cameraName = camName,
                            dateModifiedMs = date,
                            sizeBytes = size,
                            isVideo = true,
                            durationMs = duration,
                            relativePath = "$VIDEO_FOLDER/$name"
                        )
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 2. Query Images from MediaStore
        try {
            val projection = arrayOf(
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DISPLAY_NAME,
                MediaStore.Images.Media.DATE_MODIFIED,
                MediaStore.Images.Media.SIZE,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) MediaStore.Images.Media.RELATIVE_PATH else MediaStore.Images.Media.DATA
            )
            val selection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                "${MediaStore.Images.Media.RELATIVE_PATH} LIKE ?"
            } else {
                "${MediaStore.Images.Media.DATA} LIKE ?"
            }
            val selectionArgs = arrayOf("%IP CAM PRIVATE%")

            contentResolver.query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                "${MediaStore.Images.Media.DATE_MODIFIED} DESC"
            )?.use { cursor ->
                val idCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
                val nameCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME)
                val dateCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_MODIFIED)
                val sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.SIZE)

                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idCol)
                    val name = cursor.getString(nameCol) ?: "Foto"
                    val date = cursor.getLong(dateCol) * 1000L
                    val size = cursor.getLong(sizeCol)
                    val uri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id)
                    val camName = extractCameraName(name)

                    list.add(
                        MediaItem(
                            id = id,
                            uri = uri,
                            name = name,
                            cameraName = camName,
                            dateModifiedMs = date,
                            sizeBytes = size,
                            isVideo = false,
                            durationMs = 0L,
                            relativePath = "$PHOTO_FOLDER/$name"
                        )
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        list.sortedByDescending { it.dateModifiedMs }
    }

    /**
     * Delete item from central storage.
     */
    suspend fun deleteMedia(uri: Uri): Boolean = withContext(Dispatchers.IO) {
        try {
            val deleted = contentResolver.delete(uri, null, null)
            deleted > 0
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * Calculates storage stats for the CONTROLLO phone.
     */
    suspend fun getStorageStats(): StorageStats = withContext(Dispatchers.IO) {
        val path = Environment.getDataDirectory()
        val stat = StatFs(path.path)
        val blockSize = stat.blockSizeLong
        val totalBlocks = stat.blockCountLong
        val availableBlocks = stat.availableBlocksLong

        val totalSpace = totalBlocks * blockSize
        val availableSpace = availableBlocks * blockSize

        val items = loadAllMedia()
        var appBytes = 0L
        var videos = 0
        var photos = 0
        for (item in items) {
            appBytes += item.sizeBytes
            if (item.isVideo) videos++ else photos++
        }

        StorageStats(
            totalSpaceBytes = totalSpace,
            availableSpaceBytes = availableSpace,
            appUsedSpaceBytes = appBytes,
            videoCount = videos,
            photoCount = photos
        )
    }

    private fun extractCameraName(filename: String): String {
        val lastUnderscore = filename.lastIndexOf('_')
        return if (lastUnderscore > 0) {
            filename.substring(0, lastUnderscore).replace('_', ' ')
        } else {
            filename
        }
    }
}
