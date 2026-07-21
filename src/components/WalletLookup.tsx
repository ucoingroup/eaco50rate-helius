import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { walletGetBalances, walletGetHistory, getSOLBalance, getWalletTokenBalances, TOKEN_MINTS, TOKEN_DECIMALS, HeliusConfig } from '../lib/helius'
import type { WalletBalance, WalletHistoryItem } from '../lib/helius'

interface WalletResult {
  solBalance: number
  tokenBalances: Record<string, number>
  walletApiBalances: WalletBalance[]
  totalUsd: number | null
  history: WalletHistoryItem[]
}

export default function WalletLookup() {
  const { t } = useLanguage()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WalletResult | null>(null)
  const [error, setError] = useState('')

  const query = async () => {
    if (!address.trim()) {
      setError(t.invalidAddress)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Use Helius Wallet API + RPC in parallel
      const [solBal, tokenBals, walletApi, history] = await Promise.all([
        getSOLBalance(address.trim()),
        getWalletTokenBalances(address.trim()),
        walletGetBalances(address.trim()),
        walletGetHistory(address.trim(), 10),
      ])

      setResult({
        solBalance: solBal,
        tokenBalances: tokenBals,
        walletApiBalances: walletApi.tokens || [],
        totalUsd: walletApi.total_usd_value,
        history: history || [],
      })
    } catch (err) {
      setError(t.noResults)
    } finally {
      setLoading(false)
    }
  }

  const tokenSymbols: Record<string, string> = {
    [TOKEN_MINTS.SOL]: 'SOL',
    [TOKEN_MINTS.USDT]: 'USDT',
    [TOKEN_MINTS.USDC]: 'USDC',
    [TOKEN_MINTS.eCNH]: 'eCNH',
    [TOKEN_MINTS.EACO]: 'EACO',
  }

  return (
    <section className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-600 to-green-400" />
        <h2 className="text-lg font-bold">{t.walletLookup}</h2>
        <span className="text-xs text-gray-500">- {t.heliusDesc}</span>
      </div>

      <div className="rounded-2xl bg-[#12121c] border border-white/5 p-4 sm:p-6">
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query()}
            placeholder={t.enterAddress}
            className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/30 font-mono"
          />
          <button
            onClick={query}
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-green-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? t.querying : t.query}
          </button>
        </div>

        {error && <div className="mt-2 text-xs text-red-400">{error}</div>}

        {/* Results */}
        {result && (
          <div className="mt-4 space-y-4">
            {/* SOL Balance + Total */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.solBalance}</div>
                <div className="font-mono font-bold text-lg text-green-400 mt-1">
                  {result.solBalance.toFixed(6)} SOL
                </div>
              </div>
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.totalValue}</div>
                <div className="font-mono font-bold text-lg text-white mt-1">
                  {result.totalUsd !== null ? `$${result.totalUsd.toFixed(2)}` : '--'}
                </div>
              </div>
            </div>

            {/* Token Balances */}
            <div>
              <div className="text-xs text-gray-500 mb-2">{t.tokenBalances}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(result.tokenBalances).map(([mint, bal]) => {
                  const symbol = tokenSymbols[mint] || mint.slice(0, 8)
                  return (
                    <div key={mint} className="rounded-lg bg-[#0a0a0f] border border-white/5 p-2.5">
                      <div className="text-xs text-gray-500">{symbol}</div>
                      <div className="font-mono text-sm text-gray-200 mt-0.5">
                        {bal > 0 ? bal.toFixed(bal < 1 ? 6 : 2) : '0'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Transaction History */}
            {result.history.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">{t.txHistory}</div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {result.history.map((tx, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg bg-[#0a0a0f] border border-white/5 p-2 text-xs">
                      <span className="text-gray-600 font-mono shrink-0">
                        {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleDateString() : '--'}
                      </span>
                      <span className="text-gray-400 truncate flex-1">{tx.description || tx.type}</span>
                      <a
                        href={`https://solscan.io/tx/${tx.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 shrink-0"
                      >
                        {tx.signature.slice(0, 6)}...
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Helius Wallet API data */}
            {result.walletApiBalances.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">{t.tokenBalances} (Helius Wallet API)</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {result.walletApiBalances.slice(0, 10).map((tok, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-[#0a0a0f] border border-white/5 p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-300">{tok.symbol}</span>
                        <span className="text-gray-600">{tok.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-gray-300">{tok.amount.toFixed(4)}</span>
                        {tok.usd_value !== null && (
                          <span className="font-mono text-green-400">${tok.usd_value.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
