package cz.piggy.calculator

import android.app.Activity
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class WebAppInterface(private val activity: Activity) {

    @JavascriptInterface
    fun saveCsv(filename: String, content: String) {
        activity.runOnUiThread {
            try {
                val cleanName = filename.ifBlank { "piggy-export.csv" }
                val savedUri = saveFileToDownloads(activity, cleanName, content)
                if (savedUri != null) {
                    Toast.makeText(
                        activity,
                        activity.getString(R.string.save_report_success, cleanName),
                        Toast.LENGTH_LONG
                    ).show()
                } else {
                    // Fallback to sharing if saving directly failed
                    shareCsv(cleanName, content)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(
                    activity,
                    activity.getString(R.string.save_report_error) + ": " + e.localizedMessage,
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    @JavascriptInterface
    fun shareCsv(filename: String, content: String) {
        activity.runOnUiThread {
            try {
                val cleanName = filename.ifBlank { "piggy-export.csv" }
                val reportsDir = File(activity.cacheDir, "reports").apply { mkdirs() }
                val file = File(reportsDir, cleanName)
                FileOutputStream(file).use { out ->
                    // Prepend UTF-8 BOM so Excel opens Czech characters properly
                    val bytes = content.toByteArray(Charsets.UTF_8)
                    out.write(byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte()))
                    out.write(bytes)
                }

                val uri: Uri = FileProvider.getUriForFile(
                    activity,
                    "${activity.packageName}.fileprovider",
                    file
                )

                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/csv"
                    putExtra(Intent.EXTRA_STREAM, uri)
                    putExtra(Intent.EXTRA_SUBJECT, cleanName)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                activity.startActivity(
                    Intent.createChooser(
                        intent,
                        activity.getString(R.string.share_report_title)
                    )
                )
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(activity, "Share failed: " + e.localizedMessage, Toast.LENGTH_SHORT).show()
            }
        }
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "2.5.0"
    }

    private fun saveFileToDownloads(context: Context, filename: String, content: String): Uri? {
        val bytes = content.toByteArray(Charsets.UTF_8)
        val bom = byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte())

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(MediaStore.MediaColumns.MIME_TYPE, "text/csv")
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }
            val resolver = context.contentResolver
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                ?: return null

            resolver.openOutputStream(uri)?.use { out ->
                out.write(bom)
                out.write(bytes)
                out.flush()
            }
            return uri
        } else {
            @Suppress("DEPRECATION")
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!downloadsDir.exists()) downloadsDir.mkdirs()
            val destFile = File(downloadsDir, filename)
            FileOutputStream(destFile).use { out ->
                out.write(bom)
                out.write(bytes)
                out.flush()
            }
            return Uri.fromFile(destFile)
        }
    }
}
