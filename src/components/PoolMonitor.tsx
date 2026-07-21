import { useLanguage } from '../contexts/LanguageContext'
import type { EacoPoolStatus } from '../lib/helius'

interface Props {
  pools: EacoPoolStatus[]
}

function formatUsd(value: number): string {
  if (value === 0) return '$0.00'
  if (value < 0.01) return `$${value.toFixed(6)}`
  if (value < 1) return `$${value.toFixed(4)}`
  return `$${value.toFixed(2)}`
}

function formatPrice(price: number | null): string {
  if (price === null || price === 0) return '--'
  if (price < 0.0000001) return price.toExponential(4)
  if (price < 0.0001) return price.toFixed(10)
  if (price < 1) return price.toFixed(6)
  return price.toFixed(4)
}

export default function PoolMonitor({ pools }: Props) {
  const { t } = useLanguage()

  return (
    <section className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-600 to-green-400" />
        <h2 className="text-lg font-bold">{t.poolMonitor}</h2>
        <span className="text-xs text-gray-500">- Helius RPC</span>
      </div>

      {pools.length === 0 ? (
        <div className="rounded-2xl bg-[#12121c] border border-white/5 p-8 text-center text-gray-500 text-sm">
          {t.noPools}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pools.map(pool => (
            <div
              key={pool.address}
              className="rounded-2xl bg-[#12121c] border border-white/5 p-4 card-hover"
            >
              {/* Pool Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-sm text-gray-200">{pool.name}</div>
                  <div className="text-xs text-gray-600 font-mono mt-0.5">{pool.address.slice(0, 8)}...{pool.address.slice(-6)}</div>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  pool.isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {pool.isActive ? t.active : t.inactive}
                </span>
              </div>

              {/* Pool Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">{t.liquidity}</div>
                  <div className="font-mono font-bold text-sm text-white mt-0.5">
                    {formatUsd(pool.liquidityUsd)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t.impliedPrice}</div>
                  <div className="font-mono font-bold text-sm text-green-400 mt-0.5">
                    ${formatPrice(pool.impliedPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t.reserve} X</div>
                  <div className="font-mono text-xs text-gray-300 mt-0.5">
                    {pool.reserveX.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t.reserve} Y</div>
                  <div className="font-mono text-xs text-gray-300 mt-0.5">
                    {pool.reserveY.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* DEX Badge */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-600">{t.dex}: <span className="text-gray-400 font-medium uppercase">{pool.dex}</span></span>
                <a
                  href={`https://solscan.io/account/${pool.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  {t.solscan}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
