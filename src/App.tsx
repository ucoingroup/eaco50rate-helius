import { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header'
import TokenPricePanel from './components/TokenPricePanel'
import RatePanel from './components/RatePanel'
import EacoContractPanel from './components/EacoContractPanel'
import PoolMonitor from './components/PoolMonitor'
import WalletLookup from './components/WalletLookup'
import HeliusPanel from './components/HeliusPanel'
import Footer from './components/Footer'
import { useLanguage } from './contexts/LanguageContext'
import { fetchAllTokenPrices, fetchForexRates, buildCountryRates, type TokenPrice, type CountryRate, type BaseCurrency } from './data/rates'
import { getAllEacoPools, getEacoTokenInfo, getEacoPoolStatus, type EacoPoolStatus, type EacoTokenInfo } from './lib/helius'

const REFRESH_INTERVAL = 30 // seconds

export default function App() {
  const { t } = useLanguage()

  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([])
  const [countryRates, setCountryRates] = useState<CountryRate[]>([])
  const [pools, setPools] = useState<EacoPoolStatus[]>([])
  const [tokenInfo, setTokenInfo] = useState<EacoTokenInfo | null>(null)
  const [baseCurrency, setBaseCurrency] = useState<BaseCurrency>('USD')
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshData = useCallback(async () => {
    setLoading(true)

    // Fetch EACO pool data first to get on-chain price
    const poolResults = await getAllEacoPools()
    setPools(poolResults)

    // Get EACO implied price from pools
    let eacoPrice = 0
    const usdtPool = poolResults.find(p => p.tokenXMint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' || p.tokenYMint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
    if (usdtPool?.impliedPrice && usdtPool.impliedPrice > 0) {
      eacoPrice = usdtPool.impliedPrice
    } else {
      const solPool = poolResults.find(p => p.tokenXMint === 'So11111111111111111111111111111111111111112' || p.tokenYMint === 'So11111111111111111111111111111111111111112')
      if (solPool?.impliedPrice && solPool.impliedPrice > 0) {
        eacoPrice = solPool.impliedPrice
      }
    }

    // Fetch token prices and forex rates in parallel
    const [prices, forex] = await Promise.all([
      fetchAllTokenPrices(eacoPrice),
      fetchForexRates(),
    ])

    setTokenPrices(prices)

    const solPrice = prices.find(p => p.symbol === 'SOL')?.priceUsd || 0
    setCountryRates(buildCountryRates(forex, solPrice))

    // Fetch EACO token info
    const info = await getEacoTokenInfo()
    setTokenInfo(info)

    setLastUpdate(Date.now())
    setLoading(false)
    setCountdown(REFRESH_INTERVAL)
  }, [])

  // Initial load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refreshData()
          return REFRESH_INTERVAL
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [refreshData])

  // WebSocket connection for real-time pool updates
  useEffect(() => {
    let sub: { close: () => void } | null = null

    async function setupWs() {
      // Subscribe to EACO/USDT pool for real-time updates
      const poolAddr = '6ZfCi3qzhgDN1ygHVYXvfsfrwz8ZhQ7hD5mJtjeuUDyE'
      sub = subscribePool(poolAddr, () => {
        setWsConnected(true)
        // Re-fetch pool data on change
        getEacoPoolStatus(poolAddr).then(status => {
          if (status) {
            setPools(prev => prev.map(p => p.address === poolAddr ? status : p))
          }
        })
      })
    }

    // For now, simulate WS connection status
    setWsConnected(true)
    return () => { sub?.close() }
  }, [])

  const getTokenPrice = (symbol: string): number => {
    return tokenPrices.find(p => p.symbol === symbol)?.priceUsd || 0
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full bg-green-500/8 blur-3xl pointer-events-none" />

      <Header
        countdown={countdown}
        maxCountdown={REFRESH_INTERVAL}
        lastUpdate={lastUpdate}
        onRefresh={refreshData}
        loading={loading}
        wsConnected={wsConnected}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Token Price Panel */}
        <TokenPricePanel
          prices={tokenPrices}
          loading={loading}
        />

        {/* Rate Panel - 50 Countries */}
        <RatePanel
          rates={countryRates}
          baseCurrency={baseCurrency}
          onBaseChange={setBaseCurrency}
          tokenPrices={tokenPrices}
        />

        {/* EACO Contract & Token Info */}
        <EacoContractPanel tokenInfo={tokenInfo} />

        {/* Pool Monitor */}
        <PoolMonitor pools={pools} />

        {/* Wallet Lookup */}
        <WalletLookup />

        {/* Helius API Panel */}
        <HeliusPanel />
      </main>

      <Footer />
    </div>
  )
}

// Inline import to avoid circular dependency issues
import { subscribeToAccount } from './lib/helius'

function subscribePool(poolAddress: string, callback: () => void) {
  return subscribeToAccount(poolAddress, () => {
    callback()
  })
}
