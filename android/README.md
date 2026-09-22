# Piggy Android App

Android clone and mobile package for **Piggy** – the Czech tax calculator for stock and security trading profits.

---

## Architecture Overview

- **Language & Framework**: Kotlin 1.9, Android API 26–34 (Android 8.0 through Android 14+), Material Components.
- **Offline Asset Delivery**: Powered by `androidx.webkit.WebViewAssetLoader` serving bundled assets under `https://appassets.androidplatform.net/assets/www/` with full offline capability and secure origins (no CORS or `file://` scheme issues).
- **System File Picker**: Implements `WebChromeClient.onShowFileChooser` bridged to Android's `ActivityResultContracts.OpenMultipleDocuments()`. Tapping the file selector allows users to choose `.csv`, `.tsv`, or `.txt` files directly from device storage, Google Drive, Downloads, or SD cards.
- **Native CSV Export & Sharing**: Integrated `@JavascriptInterface WebAppInterface` in Kotlin:
  - Tapping **"Download report (.csv)"** automatically saves the report to Android's public `Downloads` folder using `MediaStore.Downloads` (API 29+) or public external storage.
  - Automatically handles UTF-8 BOM so exported reports open properly in Microsoft Excel and other spreadsheet viewers.
  - Native share intent option (`Android.shareCsv()`) for sharing directly via WhatsApp, Telegram, Gmail, Google Drive, or Slack.
- **Back Navigation**: Modern Android 14+ `OnBackPressedDispatcher` integration.
- **App Icons**: Custom Piggy adaptive vector launcher icons (`ic_launcher` and `ic_launcher_round`).

---

## How to Build & Run

### Option 1: Open in Android Studio (Recommended)

1. Open **Android Studio**.
2. Select **File > Open...** (or "Open an Existing Project").
3. Choose the directory:  
   `/Users/artem/My projects/Piggy/android`
4. Android Studio will automatically sync the Gradle project dependencies.
5. Connect your Android phone via USB (with USB Debugging enabled) or start an Android Emulator.
6. Click **Run > Run 'app'** (or press `Shift + F10`).
7. To generate a standalone debug `.apk`:
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Android Studio will output the APK to:
     `app/build/outputs/apk/debug/app-debug.apk`.

---

### Option 2: Build from Command Line (Terminal)

If you have a Java 17+ JDK and the Android SDK command-line tools installed:

```bash
cd "/Users/artem/My projects/Piggy/android"
./gradlew assembleDebug
```

The compiled APK will be created at:
```bash
app/build/outputs/apk/debug/app-debug.apk
```

To install directly to a connected Android phone:
```bash
./gradlew installDebug
```

---

## Project Structure

```
Piggy/android/
├── build.gradle.kts           # Top-level Gradle build file
├── settings.gradle.kts        # Repository & module setup
├── gradle.properties          # JVM & AndroidX settings
├── gradlew                    # Unix Gradle wrapper executable
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
└── app/
    ├── build.gradle.kts       # App dependencies & SDK version config
    ├── proguard-rules.pro     # ProGuard / R8 rules
    └── src/
        └── main/
            ├── AndroidManifest.xml
            ├── java/cz/piggy/calculator/
            │   ├── MainActivity.kt        # WebView setup, file picker, back handler
            │   └── WebAppInterface.kt     # MediaStore CSV saving & sharing bridge
            ├── res/
            │   ├── drawable/              # Launcher icon vectors
            │   ├── mipmap-anydpi-v26/     # Adaptive launcher icon definitions
            │   ├── values/                # Strings, colors (#ffd95e), theme styles
            │   └── xml/file_paths.xml     # FileProvider paths for report sharing
            └── assets/www/                # Bundled offline Piggy web app & demo files
                ├── index.html
                ├── icon.svg
                ├── manifest.webmanifest
                ├── sw.js
                └── demo and template/
                    ├── piggy-demo.csv
                    └── piggy-template.csv
```
