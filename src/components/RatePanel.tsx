import { useState, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import type { CountryRate, BaseCurrency } from '../data/rates'
import { getRateForBase, flagEmoji, ALL_COUNTRIES } from '../data/rates'
import type { Lang } from '../locales/i18n'

interface Props {
  rates: CountryRate[]
  baseCurrency: BaseCurrency
  onBaseChange: (b: BaseCurrency) => void
  tokenPrices: { symbol: string; priceUsd: number }[]
}

const BASE_OPTIONS: { key: BaseCurrency; symbol: string; color: string }[] = [
  { key: 'USD', symbol: 'USD', color: 'text-green-400' },
  { key: 'SOL', symbol: 'SOL', color: 'text-purple-400' },
  { key: 'USDT', symbol: 'USDT', color: 'text-green-500' },
  { key: 'USDC', symbol: 'USDC', color: 'text-blue-400' },
  { key: 'eCNH', symbol: 'eCNH', color: 'text-red-400' },
  { key: 'EACO', symbol: 'EACO', color: 'text-purple-300' },
]

function formatRate(rate: number): string {
  if (rate === 0) return '--'
  if (rate < 0.01) return rate.toFixed(6)
  if (rate < 1) return rate.toFixed(4)
  if (rate < 100) return rate.toFixed(2)
  if (rate < 10000) return rate.toFixed(0)
  return rate.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export default function RatePanel({ rates, baseCurrency, onBaseChange, tokenPrices }: Props) {
  const { t, lang } = useLanguage()
  const [filter, setFilter] = useState<'all' | 'priority' | 'standard'>('all')
  const [search, setSearch] = useState('')

  const basePriceUsd = tokenPrices.find(p => p.symbol === baseCurrency)?.priceUsd || (baseCurrency === 'USD' ? 1 : 0)

  const filteredRates = useMemo(() => {
    let result = rates

    if (filter !== 'all') {
      result = result.filter(r => r.tier === filter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r => {
        const name = r.name[lang as keyof typeof r.name] || r.name.en
        return name.toLowerCase().includes(q) ||
               r.currency.toLowerCase().includes(q) ||
               r.code.toLowerCase().includes(q)
      })
    }

    return result
  }, [rates, filter, search, lang])

  const priorityCount = ALL_COUNTRIES.filter(c => c.tier === 'priority').length

  return (
    <section className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-600 to-green-400" />
        <h2 className="text-lg font-bold">{t.countryPanel}</h2>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-xs text-red-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          {t.live}
        </div>
        <span className="text-xs text-gray-500 ml-auto">{t.showing} {filteredRates.length} {t.results}</span>
      </div>

      {/* Base Currency Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">{t.baseCurrency}:</span>
        {BASE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => onBaseChange(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              baseCurrency === opt.key
                ? `bg-white/10 ${opt.color} border border-white/20`
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            {opt.symbol}
          </button>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex gap-1 bg-[#12121c] rounded-lg p-1">
          {([
            { key: 'all', label: t.allCountries },
            { key: 'priority', label: `${t.priorityCountries} (${priorityCount})` },
            { key: 'standard', label: t.standardCountries },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-purple-600/30 text-purple-300'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[160px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchCountry}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#12121c] border border-white/5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/30"
          />
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block rounded-2xl bg-[#12121c] border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-xs text-gray-500">
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">{t.country}</th>
              <th className="text-left px-4 py-3 font-medium">{t.tier}</th>
              <th className="text-left px-4 py-3 font-medium">{t.currency}</th>
              <th className="text-right px-4 py-3 font-medium">1 {baseCurrency} =</th>
              <th className="text-right px-4 py-3 font-medium">1 USD =</th>
              <th className="text-right px-4 py-3 font-medium">1 SOL =</th>
            </tr>
          </thead>
          <tbody>
            {filteredRates.map((rate, idx) => {
              const name = rate.name[lang as keyof typeof rate.name] || rate.name.en
              const solPriceUsd = tokenPrices.find(p => p.symbol === 'SOL')?.priceUsd || 0
              const baseToCountry = getRateForBase(baseCurrency, basePriceUsd, rate.usdRate)
              const solToCountry = solPriceUsd * rate.usdRate

              return (
                <tr key={rate.code} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 text-xs text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{rate.flag}</span>
                      <span className="text-sm font-medium text-gray-200">{name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {rate.tier === 'priority' ? (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-medium">Priority</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-gray-500/20 text-gray-400 text-xs">Standard</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-400 font-mono">{rate.currency}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-green-400">
                    {formatRate(baseToCountry)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-gray-300">
                    {formatRate(rate.usdRate)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-gray-300">
                    {formatRate(solToCountry)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Card List - Mobile */}
      <div className="md:hidden space-y-2">
        {filteredRates.map(rate => {
          const name = rate.name[lang as keyof typeof rate.name] || rate.name.en
          const baseToCountry = getRateForBase(baseCurrency, basePriceUsd, rate.usdRate)

          return (
            <div key={rate.code} className="rounded-xl bg-[#12121c] border border-white/5 p-3 flex items-center gap-3">
              <span className="text-2xl">{rate.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{name}</span>
                  {rate.tier === 'priority' && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-medium">P</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{rate.currency}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-green-400">{formatRate(baseToCountry)}</div>
                <div className="text-xs text-gray-600">1 {baseCurrency}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
