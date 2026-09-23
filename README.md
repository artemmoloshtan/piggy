# 🐷 Piggy – Czech Securities Tax & FIFO Engine

A fast, zero-dependency, single-file financial web application that computes capital gains tax and tax bases for stock, ETF, bond, and crypto/stablecoin trading under Czech income tax law (*Zákon o daních z příjmů č. 586/1992 Sb.*).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)](#)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-blue.svg)](#)
[![Platform: Web & PWA](https://img.shields.io/badge/Platform-Web%20%26%20PWA-047857)](#)

> **🚀 Live Web App**: [https://artemmoloshtan.github.io/piggy](https://artemmoloshtan.github.io/piggy)  
> **📱 Mobile Experience**: Open in mobile Safari or Chrome and tap **"Add to Home Screen"** for full offline PWA installation. *(Note: The standalone Android APK is deprecated in favor of the Progressive Web App).*

---

## 🌟 Overview & Highlights

Retail investors in the Czech Republic face rigorous tax calculation rules when trading securities across multiple currencies (CZK, USD, EUR). Calculating the proper tax base requires matching lots using the **FIFO** (First-In, First-Out) method, tracking individual holding periods for statutory exemptions, converting foreign currencies using official annual uniform exchange rates published by the General Financial Directorate (GFŘ), and separating exempt income from taxable profits.

**Piggy** is engineered as a **100% client-side, single-file application** that handles all of this automatically in your browser—without sending a single byte of financial data over the internet.

### Key Capabilities

- **Combined Open Positions with Live Price Editing**: Real-time valuation, allocation donut charts, and instant unrealized P/L calculation without losing focus while typing. Unrealized P/L defaults cleanly to `0.00` until you input custom market prices.
- **Strict FIFO Pairing**: Matches buy and sell lots chronologically, supporting partial lot executions, split orders, and short sales.
- **3-Year Holding Period Exemption (*Časový test*)**: Automatically detects shares held for > 3 years (or 6 months for acquisitions prior to 2014) and isolates exempt income under § 4(1)(w) ZDP.
- **Official GFŘ Uniform Exchange Rates (*Jednotné kurzy*)**: Accurately translates multi-currency trades (USD, EUR, CZK) from 2011 to 2025 in line with the Czech Supreme Administrative Court (NSS) ruling of 2019.
- **100 000 Kč Exemption Threshold Alert**: Alerts you when yearly gross revenues do not exceed the 100k CZK statutory exemption threshold under § 4(1)(w) ZDP.
- **Multilingual Broker CSV Ingestion**: Drag & drop or copy-paste directly with both Czech (`Datum obchodu;Směr;...`) and English (`Date;Direction;...`) headers.
- **Formal Tax Export & Print**: Generates audit-ready CSV reports (`piggy-report.csv`) for submission as tax annex documentation (Příloha č. 2).

---

## 🇨🇿 Czech Securities Tax Framework & Use Case (§ 10 ZDP)

Piggy is specifically built to fulfill reporting requirements under the Czech Income Tax Act (*Zákon o daních z příjmů č. 586/1992 Sb. – ZDP*):

### 1. § 10 ZDP – Other Income (Capital Gains)
Sales of securities (shares, ETFs, investment fund certificates, bonds) and digital assets by natural persons not holding them in business assets (*obchodní majetek*) fall under **§ 10 ZDP**.
$$\text{Tax Base} = \text{Gross Taxable Sales Revenues} - (\text{Acquisition Costs} + \text{Transaction Fees})$$
- Fees incurred at purchase increase the acquisition cost.
- Fees incurred at sale reduce the net sales proceeds.

### 2. Mandatory FIFO Lot Matching
Under Czech Supreme Administrative Court (*Nejvyšší správní soud – NSS*) case law (ruling 2 Afs 376/2018), taxpayers trading the same issue of securities must calculate capital gains using the chronological **FIFO (First-In, First-Out)** method. Piggy matches sell transactions against the oldest available buy lots, accurately managing split executions and partial lots.

### 3. 3-Year Time Test Exemption (*Časový test* § 4(1)(w) ZDP)
- Income from the sale of securities held for **more than 36 months (3 years)** is entirely exempt from income tax.
- *(For securities acquired before January 1, 2014, the previous 6-month test applies).*
- Piggy isolates exempt sales from the tax base and reports exempt income (*osvobozené příjmy*) in a dedicated column so you can verify if you exceed the 5 000 000 CZK exempt income notification threshold (*oznámení o osvobozených příjmech*).

### 4. 100 000 Kč Annual Gross Revenue Exemption (§ 4(1)(w) ZDP)
- If your total annual gross proceeds (revenues) from all non-exempt security sales in a calendar year do **not exceed 100 000 Kč**, the income is completely tax-free and does not need to be declared on your tax return.
- Piggy highlights eligible tax years with an informational alert banner.

### 5. GFŘ Official Uniform Annual Exchange Rates (*Jednotné kurzy*)
Non-business investors converting foreign currency transactions typically use the official uniform annual exchange rates published annually in January by the Czech General Financial Directorate (*Generální finanční ředitelství – GFŘ*):
- Acquisition costs are translated using the uniform rate of the **acquisition year**.
- Sales revenues and sales fees are translated using the uniform rate of the **disposition year**.
- Piggy includes built-in official rates from 2011 through 2025.

### 6. Loss Offset Restrictions
Under Czech tax law, net security trading losses incurred in a calendar year cannot be offset against ordinary employment income (§ 6) or business income (§ 7), nor can losses be carried forward to offset future tax years.

---

## 📥 Supported File Formats, Delimiters & Brokers

Piggy is designed to ingest trade data effortlessly without manual formatting:

### Supported Formats & Delimiters
- **Files**: `.csv`, `.tsv`, `.txt`
- **Clipboard**: Direct paste (`Ctrl+V` / `Cmd+V`) from Google Sheets, Microsoft Excel, or broker portals
- **Delimiters**: Semicolon (`;`), Comma (`,`), and Tab (`\t`) are automatically detected
- **Number Formats**: Handles European decimal comma (`120,50`) and standard decimal point (`120.50`), space-separated thousands (`1 250,00`), and automatically cleans currency signs (`100$`, `25 €`, `850 Kč`)
- **Date Formats**: Supports `DD.MM.YYYY HH:MM`, `DD.MM.YYYY`, `YYYY-MM-DD HH:MM`, `YYYY-MM-DD`, and `DD/MM/YYYY`

### Accepted Table Column Headers

Piggy supports both standard Czech broker headers (matching Fio e-Broker) and English equivalents:

| Czech Column Header | English Alternative | Description | Example |
| :--- | :--- | :--- | :--- |
| `Datum obchodu` | `Date`, `Trade Date`, `Timestamp` | Transaction execution timestamp | `15.03.2023 14:30` |
| `Směr` | `Direction`, `Type` | Trade direction (`Nákup` / `Buy` / `B` or `Prodej` / `Sell` / `S`) | `Nákup` or `Buy` |
| `Symbol` | `Ticker`, `Asset` | Security ticker or crypto identifier | `HOLDING-3Y`, `AAPL` |
| `Cena` | `Price` | Execution price per share / unit | `135,00` or `135.00 $` |
| `Počet` | `Quantity`, `Qty`, `Shares` | Number of shares / units executed | `20` |
| `Měna` | `Currency` | Transaction currency (`CZK`, `USD`, `EUR`) | `USD` |
| `Objem` | `Volume`, `Total`, `Amount` | Total transaction value before fees | `-2 700,00` |
| `Poplatky` | `Fees`, `Fee`, `Commission` | Broker commission / transaction fees | `12,00` |

### Compatible Broker Exports
- **Fio banka e-Broker**: Direct CSV export (zero modification required).
- **Degiro**: Transactions CSV export.
- **Interactive Brokers (IBKR)**: Trades activity statement or custom flex query CSV.
- **Revolut / XTB / Trading 212 / Saxo Bank**: Exported transaction sheets.
- **Spreadsheets**: Copy-pasting directly from Google Sheets or Microsoft Excel.

---

## 📁 Single-File Architecture

```
index.html   <-- Complete, zero-dependency, self-contained application
```

- **Zero Build Step**: No `npm install`, no Node.js runtime, no bundling tools.
- **Portable**: Double-click `index.html` on macOS, Windows, Linux, Android, or iOS to run immediately.
- **Fully Offline**: All styles, icons (pure vector SVGs), and calculation logic are self-contained.

---

## 📱 Mobile Access & PWA (Android Deprecation Notice)

> ⚠️ **Android Version Deprecation**: The native Android APK wrapper is deprecated and no longer actively distributed. Piggy is built and optimized as a responsive, zero-dependency Progressive Web Application (PWA).

To use Piggy on your mobile device (Android or iOS):
1. Navigate to [**https://artemmoloshtan.github.io/piggy**](https://artemmoloshtan.github.io/piggy) in your mobile browser (Chrome, Safari, Firefox).
2. Tap the browser menu and select **"Add to Home Screen"** (or "Install App").
3. Piggy will launch as a fullscreen, standalone app with complete offline caching, file ingestion, and local data persistence.

---

## 🛠️ How to Run Locally

Simply clone the repository and open `index.html` in any web browser:

```bash
git clone https://github.com/artemmoloshtan/piggy.git
cd piggy
open index.html # On macOS (or double-click the file on Windows/Linux)
```

---

## ⚖️ Legal Disclaimer

Piggy is an open-source calculation helper. It does not provide certified legal or tax advice. Final figures should always be reviewed with a licensed Czech tax advisor (*daňový poradce*) before submitting your tax return.
