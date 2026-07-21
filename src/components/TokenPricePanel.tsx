import { useLanguage } from '../contexts/LanguageContext'
import type { TokenPrice } from '../data/rates'

interface Props {
  prices: TokenPrice[]
  loading: boolean
}

function formatPrice(price: number): string {
  if (price === 0) return '--'
  if (price < 0.0001) return price.toExponential(4)
  if (price < 1) return price.toFixed(6)
  if (price < 100) return price.toFixed(4)
  return price.toFixed(2)
}

function formatMarketCap(mc: number | null): string {
  if (mc === null || mc === 0) return '--'
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`
  if (mc >= 1e3) return `$${(mc / 1e3).toFixed(2)}K`
  return `$${mc.toFixed(2)}`
}

const TOKEN_ICONS: Record<string, { bg: string; text: string; label: string }> = {
  SOL: { bg: 'from-purple-600 to-purple-800', text: 'SOL', label: 'S' },
  USDT: { bg: 'from-green-500 to-green-700', text: 'USDT', label: 'T' },
  USDC: { bg: 'from-blue-500 to-blue-700', text: 'USDC', label: 'C' },
  eCNH: { bg: 'from-red-500 to-red-700', text: 'eCNH', label: 'C' },
  EACO: { bg: 'from-purple-600 to-green-400', text: 'EACO', label: 'E' },
}

export default function TokenPricePanel({ prices, loading }: Props) {
  const { t } = useLanguage()

  return (
    <section className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-600 to-green-400" />
        <h2 className="text-lg font-bold">{t.coreTokens}</h2>
        <span className="text-xs text-gray-500">- {t.coreTokensDesc}</span>
        {loading && (
          <span className="ml-auto text-xs text-purple-400 animate-pulse">{t.oracleSyncing}...</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {prices.map(token => {
          const icon = TOKEN_ICONS[token.symbol] || TOKEN_ICONS.EACO
          return (
            <div
              key={token.symbol}
              className="card-hover rounded-2xl bg-[#12121c] border border-white/5 p-4"
            >
              {/* Token Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${icon.bg} flex items-center justify-center font-black text-xs text-white`}>
                  {icon.label}
                </div>
                <div>
                  <div className="font-bold text-sm">{token.symbol}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[80px]">{token.name}</div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="text-xs text-gray-500">{t.tokenPrice}</div>
                <div className="font-mono font-bold text-lg text-white">
                  ${formatPrice(token.priceUsd)}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{token.source}</span>
                  {token.change24h !== null && (
                    <span className={token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Data Sources */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span>{t.source}:</span>
        <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">CoinGecko</a>
        <a href="https://www.helius.dev/" target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">Helius RPC</a>
        <a href="https://orbmarkets.io/token/DqfoyZH96RnvZusSp3Cdncjpyp3C74ZmJzGhjmHnDHRH" target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">Orbmarkets</a>
      </div>
    </section>
  )
}
