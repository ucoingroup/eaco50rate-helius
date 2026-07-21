# EACO 50 Country Oracle Rate - Helius API

> Solana Chain FX Oracle - 50+ Country Exchange Rates powered by Helius API

[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF)](https://solana.com/)
[![Helius](https://img.shields.io/badge/Helius-API-00FF88)](https://www.helius.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

## Overview

EACO 50 Country Oracle Rate is a decentralized exchange rate oracle built on Solana, providing real-time fiat currency exchange rates for 50+ countries alongside cryptocurrency token prices. It integrates Helius API for on-chain data verification and wallet queries.

## Features

### Exchange Rate Oracle
- **50+ Countries**: Priority 20 core countries + 30 standard countries
- **6 Base Currencies**: USD, SOL, USDT, USDC, eCNH, EACO
- **Real-time Data**: CoinGecko API + Forex API + Helius on-chain data
- **Auto Refresh**: 30-second countdown with manual refresh

### Core Token Prices
- SOL, USDT, USDC, eCNH, EACO real-time prices
- On-chain price discovery via Helius RPC

### Helius API Integration
- **RPC**: JSON-RPC methods (getBalance, getAccountInfo, getTokenSupply)
- **DAS API**: getAsset, searchAssets, getTokenAccounts
- **Wallet API**: Balances with USD valuation, transaction history, transfers
- **WebSocket**: Real-time account subscription with auto-reconnect
- **Priority Fee API**: Smart fee estimation for transactions
- **Enhanced Transactions**: Parsed transaction data

### EACO Token
- Contract: `DqfoyZH96RnvZusSp3Cdncjpyp3C74ZmJzGhjmHnDHRH` (Solana Mainnet)
- Decimals: 9
- Liquidity pool monitoring (Meteora DLMM)

### Wallet Lookup
- Query any Solana wallet address
- SOL balance + SPL token balances
- Transaction history with parsed data
- USD portfolio valuation

### PWA Support
- Installable as a mobile app
- Offline support via service worker
- Cross-platform responsive design

### Internationalization
- 6 UN languages: Chinese, English, Spanish, French, Arabic, Russian
- RTL support for Arabic
- Auto language detection

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS 3
- **Blockchain**: @solana/web3.js + @solana/spl-token
- **API**: Helius RPC + DAS + Wallet API + WebSocket
- **Price Data**: CoinGecko API + open.er-api.com

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
eaco50rate/
├── src/
│   ├── lib/helius.ts           # Helius API integration (RPC/DAS/Wallet/WS/Fee/Tx)
│   ├── data/rates.ts           # 50 country rate model + CoinGecko/Forex API
│   ├── locales/i18n.ts         # 6-language translations
│   ├── contexts/
│   │   └── LanguageContext.tsx  # i18n context provider
│   ├── components/
│   │   ├── Header.tsx          # Navigation + sync status + language selector
│   │   ├── TokenPricePanel.tsx # 5 token price cards
│   │   ├── RatePanel.tsx       # 50 country rate table (desktop) + cards (mobile)
│   │   ├── EacoContractPanel.tsx # Contract address + verification links
│   │   ├── PoolMonitor.tsx     # EACO liquidity pool monitor
│   │   ├── WalletLookup.tsx    # Wallet query panel
│   │   ├── HeliusPanel.tsx     # Helius API capabilities showcase
│   │   └── Footer.tsx
│   ├── App.tsx                 # Main app (data orchestration + WS + auto-refresh)
│   ├── main.tsx
│   └── index.css
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   └── *.svg                   # App icons
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Data Sources

| Source | Data | URL |
|--------|------|-----|
| CoinGecko | SOL/USDT/USDC prices | https://www.coingecko.com/api |
| Forex API | 50+ country fiat rates | https://open.er-api.com |
| Helius RPC | On-chain EACO pool data | https://www.helius.dev |
| Orbmarkets | EACO reference price | https://orbmarkets.io |

## Links

- **EACO on Solscan**: https://solscan.io/token/DqfoyZH96RnvZusSp3Cdncjpyp3C74ZmJzGhjmHnDHRH
- **Helius Docs**: https://www.helius.dev/docs/zh
- **EACO Community**: https://linktr.ee/eacocc

## License

MIT License - All data is for reference only.
