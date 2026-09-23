# Piggy — Czech Securities and Crypto Tax Reporting

A privacy-first, zero-dependency web application that turns securities and supported crypto transaction exports into reviewable Czech § 10 tax calculations. Piggy performs FIFO reconciliation, exemption tests, GFŘ currency conversion, validation, and supporting exports for **Finanční správa ČR**, entirely in the browser.

[![License: Personal Use](https://img.shields.io/badge/License-Personal%20Use-f59e0b.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)](#)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-blue.svg)](#)
[![Platform: Web & PWA](https://img.shields.io/badge/Platform-Web%20%26%20PWA-047857)](#)

> **🚀 Live Web App**: [https://artemmoloshtan.github.io/piggy](https://artemmoloshtan.github.io/piggy)  
> **📱 Mobile Experience**: Open in mobile Safari or Chrome and tap **"Add to Home Screen"** for full offline PWA installation.

---

## 🌟 Overview & Highlights

Retail investors in the Czech Republic face rigorous tax calculation rules when trading securities across multiple currencies (CZK, USD, EUR). Calculating the proper tax base requires matching lots using the **FIFO** (First-In, First-Out) method, tracking individual holding periods for statutory exemptions, converting foreign currencies using official annual uniform exchange rates published by the General Financial Directorate (GFŘ), and separating exempt income from taxable profits.

**Piggy** is a **100% client-side, single-file application**. Imported financial data stays in the browser and is not uploaded by the app.

### Key Capabilities

- **Combined Open Positions with Live Price Editing**: Real-time valuation, allocation donut charts, and instant unrealized P/L calculation without losing focus while typing. Unrealized P/L defaults cleanly to `0.00` until you input custom market prices.
- **Disclosed FIFO Pairing**: Matches buy and sell lots chronologically, supporting partial lots and split orders. The selected method is stated in every report prepared for Finanční správa ČR.
- **Holding-Period Tests (*Časový test*)**: Separates qualifying securities and explicitly eligible crypto disposals from taxable income.
- **GFŘ Uniform Exchange Rates (*Jednotné kurzy*)**: Translates supported multi-currency trades (USD, EUR, CZK) using the published annual rates from 2011 to 2025 and discloses the method in the report.
- **Annual Proceeds Tests**: Applies the 100,000 CZK amount test separately to securities and explicitly eligible crypto transactions.
- **Multilingual Broker CSV Ingestion**: Drag & drop or copy-paste directly with both Czech (`Datum obchodu;Směr;...`) and English (`Date;Direction;...`) headers.
- **Finanční správa ČR Support Package**: Generates an Annex 2 summary, taxable-disposal ledger, exempt-income ledger, FIFO reconciliation, validation report, and a printable Czech PDF summary.

---

## 🇨🇿 Czech Securities Tax Framework & Use Case (§ 10 ZDP)

Piggy is specifically built to fulfill reporting requirements under the Czech Income Tax Act (*Zákon o daních z příjmů č. 586/1992 Sb. – ZDP*):

### 1. § 10 ZDP – Other Income (Capital Gains)
Sales of securities (shares, ETFs, investment fund certificates, bonds) and digital assets by natural persons not holding them in business assets (*obchodní majetek*) fall under **§ 10 ZDP**.
$$\text{Tax Base} = \text{Gross Taxable Sales Revenues} - (\text{Acquisition Costs} + \text{Transaction Fees})$$
- Fees incurred at purchase increase the acquisition cost.
- Fees incurred at sale reduce the net sales proceeds.

### 2. FIFO Lot Matching
Piggy uses chronological **FIFO (First-In, First-Out)** matching and discloses that choice in the report. The taxpayer remains responsible for ensuring that the method is consistent with the identification and evidence in the source records. Piggy does not present FIFO as a universally mandatory statutory method.

### 3. 3-Year Time Test Exemption (*Časový test* § 4(1)(w) ZDP)
- Income from the sale of securities held for **more than 36 months (3 years)** is entirely exempt from income tax.
- *(For securities acquired before January 1, 2014, the previous 6-month test applies).*
- Piggy isolates exempt sales and flags individual exempt-income candidates above CZK 5,000,000 for a separate § 38v review. It does not incorrectly apply this test only to the annual aggregate.

### 4. 100 000 Kč Annual Gross Revenue Exemption (§ 4(1)(w) ZDP)
- The amount test is assessed using gross annual proceeds from all relevant securities transfers, before applying the holding-period test.
- Piggy applies the exemption to the calculated tax base and highlights eligible years.

### 5. Crypto and Stablecoin Transactions
- Merely acquiring or holding a cryptoasset does not create taxable income in Piggy. Tax treatment is evaluated when the asset is disposed of by sale, spending, or exchange.
- Piggy evaluates the applicable crypto holding-period and proceeds tests automatically. Use the optional `Vyloučení z osvobození` / `Exemption restriction` field only when a specific legal restriction prevents an exemption.
- `EMT` (electronic-money token) is a separate classification. EMT disposals are excluded from the crypto CZK 100,000 proceeds test, but the separate holding-period analysis is retained. A stablecoin must not be classified from its ticker alone.
- Represent a DEX swap as two rows at the same timestamp: a `Sell` of the token given and a `Buy` of the token received, using consistent market values. Piggy does not import blockchain transactions or determine token eligibility automatically.

### 6. GFŘ Official Uniform Annual Exchange Rates (*Jednotné kurzy*)
Non-business investors converting foreign currency transactions typically use the official uniform annual exchange rates published annually in January by the Czech General Financial Directorate (*Generální finanční ředitelství – GFŘ*):
- Acquisition costs are translated using the uniform rate of the **acquisition year**.
- Sales revenues and sales fees are translated using the uniform rate of the **disposition year**.
- Piggy includes built-in official rates from 2011 through 2025.

### 7. Loss Offset Restrictions
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

### Required columns

The downloadable template places these fields first. They may still appear in any order in an imported file.

| Czech Column Header | English Alternative | Description | Example |
| :--- | :--- | :--- | :--- |
| `Datum obchodu` | `Date`, `Trade Date`, `Timestamp` | Transaction execution timestamp | `15.03.2023 14:30` |
| `Směr` | `Direction`, `Type` | Trade direction (`Nákup` / `Buy` / `B` or `Prodej` / `Sell` / `S`) | `Nákup` or `Buy` |
| `Symbol` | `Ticker`, `Asset` | Security ticker or crypto identifier | `HOLDING-3Y`, `AAPL` |
| `Cena` | `Price` | Execution price per share / unit | `135,00` or `135.00 $` |
| `Počet` | `Quantity`, `Qty`, `Shares` | Number of shares / units executed | `20` |
| `Měna` | `Currency` | Transaction currency (`CZK`, `USD`, `EUR`) | `USD` |
| `Typ aktiva` | `Asset Type`, `Category` | `Akcie`/security, ETF, or `Kryptoaktivum`/crypto | `Kryptoaktivum` |

### Optional columns

Optional does not mean unimportant. Fill these fields whenever the source statement provides them:

| Czech Column Header | English Alternative | When to fill it | Example |
| :--- | :--- | :--- | :--- |
| `Objem` | `Volume`, `Total`, `Amount` | Recommended for exact reconciliation to the statement | `-2 700,00` |
| `Poplatky` | `Fees`, `Fee`, `Commission` | Recommended whenever fees were charged | `12,00` |
| `Vyloučení z osvobození` | `Exemption restriction` | Only when a known legal restriction prevents an exemption; otherwise leave blank | `Ano` / `Yes` |
| `Obchodní majetek` | `Business asset` | Whether the asset is or was business property | `Ne` / `No` |
| `ID transakce` | `Transaction ID`, `Tx hash` | Strongly recommended for every disposal and crypto swap | `0xdex-swap` |
| `Zdroj` | `Source`, `Broker`, `Exchange` | Strongly recommended for traceability | `Uniswap` |
| `Peněženka` | `Wallet` | Strongly recommended for on-chain activity | `0xwallet` |
| `Protihodnota` | `Counter asset` | Strongly recommended for swaps and non-fiat disposals | `ETH` |
| `Zdroj ocenění` | `Valuation source` | Strongly recommended when CZK value is derived from a market price | `Uniswap execution` |
| `Poznámka` | `Note` | Human-readable supporting explanation | `DEX swap: outgoing leg` |

For submissions or follow-up questions from Finanční správa ČR, the strongest evidence package normally includes the transaction ID, platform or wallet, counter-asset, valuation source, original statement, and an explanation of unusual operations.

### Compatible Broker Exports
- **Fio banka e-Broker**: Direct CSV export (zero modification required).
- **Degiro**: Transactions CSV export.
- **Interactive Brokers (IBKR)**: Trades activity statement or custom flex query CSV.
- **Revolut / XTB / Trading 212 / Saxo Bank**: Exported transaction sheets.
- **Spreadsheets**: Copy-pasting directly from Google Sheets or Microsoft Excel.

### Template Examples

The downloadable template includes:

- stock and ETF purchases;
- a partial stock sale;
- an ordinary crypto purchase and disposal;
- a stablecoin purchase;
- a DEX swap represented by matching stablecoin-sale and crypto-purchase rows.

Broker-specific exports may still require column mapping or cleanup. Unsupported operations such as staking rewards, mining, airdrops, gifts, lending, liquidity-pool transactions, derivatives, and transfers are not silently treated as ordinary buys or sells; they require separate classification. Always resolve every blocking validation item before using the PDF.

---

## Repository structure

```
assets/icons/       PWA and browser icons
docs/sample-report/ Example output for Finanční správa ČR
examples/           Import template and demo portfolio
tests/              Tax-engine regression tests
index.html          Complete zero-dependency application
manifest.webmanifest
sw.js               Offline cache
```

- **Zero Build Step**: No `npm install`, no Node.js runtime, no bundling tools.
- **Portable**: Double-click `index.html` on macOS, Windows, Linux, or mobile browsers to run immediately.
- **Fully Offline**: All styles, icons (pure vector SVGs), and calculation logic are self-contained.

---

## 📱 Mobile Access & PWA

Piggy is built and optimized as a responsive, zero-dependency Progressive Web Application (PWA).

To use Piggy on your mobile device (iOS Safari or Android Chrome):
1. Navigate to [**https://artemmoloshtan.github.io/piggy**](https://artemmoloshtan.github.io/piggy) in your mobile browser.
2. Tap the browser share/menu button and select **"Add to Home Screen"** (or "Install App").
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

Piggy is a calculation helper, not tax-filing software or certified legal advice. It cannot determine whether a token is an electronic-money token, whether an asset belongs to business property, or whether an on-chain transaction has additional legs or fees. Review the imported ledger and final figures with a Czech tax adviser before filing with Finanční správa ČR.

## License

Piggy is source-available for personal, non-commercial use. Resale, paid hosting, commercial distribution, and inclusion in a paid product or service are prohibited without a separate written license. See [LICENSE](LICENSE).
