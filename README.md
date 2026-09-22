# 🐷 Piggy – Czech Securities Tax & FIFO Engine

A fast, zero-dependency, single-file financial web application that computes capital gains tax and tax bases for stock and security trading profits under Czech income tax law (*Zákon o daních z příjmů č. 586/1992 Sb.*).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)](#)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-blue.svg)](#)
[![Download APK](https://img.shields.io/badge/Download-Android%20APK%20(v2.5)-047857?logo=android&logoColor=white)](Piggy.apk)

> **🚀 Live Demo**: [https://artemmoloshtan.github.io/piggy](https://artemmoloshtan.github.io/piggy)  
> **📱 Android Build**: [**Download Piggy.apk (v2.5.0)**](Piggy.apk) (5.4 MB)

---

## 🌟 Overview & Highlights

Retail investors in the Czech Republic face strict reporting requirements when trading securities across multiple currencies (CZK, USD, EUR). Calculating the proper tax base requires matching lots with the **FIFO** (First-In, First-Out) method, tracking individual holding periods for tax exemptions, and converting foreign currencies using the official annual uniform exchange rates published by the General Financial Directorate (GFŘ).

**Piggy** is engineered as a **100% client-side, single-file application** that handles all of this automatically in your browser—without sending a single byte of financial data over the internet.

### Key Capabilities

- **Strict FIFO Pairing**: Matches buy and sell lots chronologically, supporting partial lot executions, split orders, and short sales.
- **3-Year Holding Period Exemption (*Časový test*)**: Automatically detects shares held for > 3 years (or 6 months for acquisitions prior to 2014) and separates exempt income from taxable income under § 4(1)(w) ZDP.
- **Official GFŘ Uniform Exchange Rates**: Accurately translates multi-currency trades (USD, EUR, CZK) in line with the Czech Supreme Administrative Court (NSS) ruling of 2019.
- **100,000 CZK Exemption Threshold Alert**: Alerts you when yearly gross revenues do not exceed 100k CZK.
- **Direct Broker CSV Ingestion**: Drag & drop or copy-paste directly from Czech broker exports (e.g., **Fio e-Broker**) or Google Sheets/Excel.
- **Formal Tax Export & Print**: Generates audit-ready CSV reports (`piggy-report.csv`) and prints clean, formatted tax filing documentation (`Cmd+P` / `Ctrl+P`).

---

## 📁 Single-File Architecture

```
index.html   <-- Complete, zero-dependency, self-contained application
```

- **Zero Build Step**: No `npm install`, no webpack, no node_modules.
- **Portable**: Double-click `index.html` on macOS, Windows, Linux, Android, or iOS to run immediately.
- **Fully Offline**: All styles, icons (vector SVGs), and calculations are self-contained.

---

## 📱 Android App & PWA

In addition to the standalone HTML web file, Piggy includes:
- **Direct APK Download**: You can download and install [**`Piggy.apk`**](Piggy.apk) (5.4 MB) directly onto any Android device.
- **Native Android Project** (`android/`): Modern Kotlin + Android WebView wrapper utilizing `WebViewAssetLoader`, Android system file picker (`onShowFileChooser`), and public storage export via `MediaStore.Downloads`.
- **Installable PWA**: Includes `manifest.webmanifest` and Service Worker (`sw.js`) for adding directly to mobile home screens.

---

## 🛠️ How to Run Locally

Simply clone the repository and open `index.html` in any modern web browser:

```bash
git clone https://github.com/artemmoloshtan/piggy.git
cd piggy
open index.html # On macOS (or double-click the file)
```

To build the Android app:
```bash
cd android
./gradlew assembleDebug
```

---

## ⚖️ Legal Disclaimer

Piggy is an open-source calculation helper. It does not provide legal or tax advice. Always verify final figures with a licensed Czech tax advisor before submitting your tax return.
