import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getRecentPriorityFee, getPriorityFeeEstimate } from '../lib/helius'

export default function PriorityFeePanel() {
  const { t } = useLanguage()
  const [fee, setFee] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customSignature, setCustomSignature] = useState('')
  const [customFee, setCustomFee] = useState<number | null>(null)
  const [customLoading, setCustomLoading] = useState(false)

  const fetchFee = useCallback(async () => {
    setLoading(true)
    setError('')
    const result = await getRecentPriorityFee()
    if (result) {
      setFee(result.priorityFeeEstimate)
    } else {
      setError(t.noData)
    }
    setLoading(false)
  }, [t])

  useEffect(() => {
    fetchFee()
    const interval = setInterval(fetchFee, 30_000)
    return () => clearInterval(interval)
  }, [fetchFee])

  const queryCustom = async () => {
    if (!customSignature.trim()) return
    setCustomLoading(true)
    setCustomFee(null)
    const result = await getPriorityFeeEstimate(customSignature.trim())
    if (result) {
      setCustomFee(result.priorityFeeEstimate)
    } else {
      setCustomFee(null)
    }
    setCustomLoading(false)
  }

  const feeLevel = (val: number | null): { label: string; color: string } => {
    if (val === null) return { label: '--', color: 'text-gray-500' }
    if (val < 0.001) return { label: t.low || 'Low', color: 'text-green-400' }
    if (val < 0.01) return { label: t.medium || 'Medium', color: 'text-yellow-400' }
    if (val < 0.05) return { label: t.high || 'High', color: 'text-orange-400' }
    return { label: t.critical || 'Critical', color: 'text-red-400' }
  }

  const currentLevel = feeLevel(fee)
  const customLevel = feeLevel(customFee)

  return (
    <section className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-600 to-green-400" />
        <h2 className="text-lg font-bold">{t.feeEstimate}</h2>
        <span className="text-xs text-gray-500">- Helius Priority Fee API</span>
      </div>

      <div className="rounded-2xl bg-[#12121c] border border-white/5 p-4 sm:p-6">
        {/* Current Network Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
            <div className="text-xs text-gray-500">{t.networkFee}</div>
            <div className={`font-mono font-bold text-lg mt-1 ${currentLevel.color}`}>
              {loading ? '...' : fee !== null ? `${fee.toFixed(6)} SOL` : '--'}
            </div>
          </div>
          <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
            <div className="text-xs text-gray-500">{t.feeLevel || 'Fee Level'}</div>
            <div className={`font-mono font-bold text-lg mt-1 ${currentLevel.color}`}>
              {currentLevel.label}
            </div>
          </div>
          <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
            <div className="text-xs text-gray-500">USD</div>
            <div className="font-mono font-bold text-lg text-white mt-1">
              {fee !== null ? `$${(fee * 180).toFixed(4)}` : '--'}
            </div>
          </div>
        </div>

        {error && <div className="text-xs text-red-400 mb-3">{error}</div>}

        <button
          onClick={fetchFee}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-green-500/20 border border-purple-500/20 text-xs font-medium text-purple-300 hover:from-purple-600/30 hover:to-green-500/30 transition-all disabled:opacity-50"
        >
          {loading ? t.querying : t.refresh}
        </button>

        {/* Custom Transaction Fee Estimator */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-xs text-gray-500 mb-2">{t.customFeeEstimate || 'Custom Transaction Fee Estimate'}</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSignature}
              onChange={e => setCustomSignature(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && queryCustom()}
              placeholder={t.enterSignature || 'Enter transaction signature...'}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/30 font-mono"
            />
            <button
              onClick={queryCustom}
              disabled={customLoading || !customSignature.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-green-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {customLoading ? t.querying : t.query}
            </button>
          </div>
          {customFee !== null && (
            <div className="mt-2 flex items-center gap-4">
              <span className="text-xs text-gray-500">{t.feeEstimate}:</span>
              <span className={`font-mono font-bold ${customLevel.color}`}>
                {customFee.toFixed(6)} SOL
              </span>
              <span className={`text-xs ${customLevel.color}`}>({customLevel.label})</span>
            </div>
          )}
          {customFee === null && !customLoading && customSignature && (
            <div className="mt-2 text-xs text-gray-600">{t.noResults}</div>
          )}
        </div>
      </div>
    </section>
  )
}
