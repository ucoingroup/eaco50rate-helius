import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { parseTransaction, type EnhancedTransaction } from '../lib/helius'

export default function TransactionParserPanel() {
  const { t } = useLanguage()
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EnhancedTransaction | null>(null)
  const [error, setError] = useState('')

  const query = async () => {
    if (!signature.trim()) {
      setError(t.invalidAddress)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    const tx = await parseTransaction(signature.trim())
    if (tx) {
      setResult(tx)
    } else {
      setError(t.noResults)
    }
    setLoading(false)
  }

  return (
    <section className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-600 to-green-400" />
        <h2 className="text-lg font-bold">{t.parsedTx}</h2>
        <span className="text-xs text-gray-500">- Helius Enhanced Transactions API</span>
      </div>

      <div className="rounded-2xl bg-[#12121c] border border-white/5 p-4 sm:p-6">
        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={signature}
            onChange={e => setSignature(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query()}
            placeholder={t.enterSignature || 'Enter transaction signature...'}
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
          <div className="mt-4 space-y-3">
            {/* Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.type}</div>
                <div className="font-mono font-bold text-sm text-purple-400 mt-1">{result.type || '--'}</div>
              </div>
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.source || 'Source'}</div>
                <div className="font-mono font-bold text-sm text-blue-400 mt-1">{result.source || '--'}</div>
              </div>
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.fee}</div>
                <div className="font-mono font-bold text-sm text-yellow-400 mt-1">
                  {result.fee ? `${(result.fee / 1e9).toFixed(6)} SOL` : '--'}
                </div>
              </div>
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.timestamp}</div>
                <div className="font-mono font-bold text-sm text-white mt-1">
                  {result.timestamp ? new Date(result.timestamp * 1000).toLocaleString() : '--'}
                </div>
              </div>
            </div>

            {/* Description */}
            {result.description && (
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500 mb-1">{t.description}</div>
                <div className="text-sm text-gray-200">{result.description}</div>
              </div>
            )}

            {/* Fee Payer */}
            {result.feePayer && (
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500 mb-1">Fee Payer</div>
                <div className="text-xs text-green-400 font-mono break-all">{result.feePayer}</div>
              </div>
            )}

            {/* Token Transfers */}
            {result.tokenTransfers && result.tokenTransfers.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Token Transfers ({result.tokenTransfers.length})</div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {result.tokenTransfers.map((transfer: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-[#0a0a0f] border border-white/5 p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-mono">
                          {transfer.from_user_account?.slice(0, 8) || '?'}...{'->'}
                          {transfer.to_user_account?.slice(0, 8) || '?'}...
                        </span>
                        <span className="text-green-400 font-mono">
                          {transfer.amount ? Number(transfer.amount).toLocaleString() : '--'}
                        </span>
                      </div>
                      {transfer.mint && (
                        <div className="text-gray-600 mt-0.5 font-mono">Mint: {transfer.mint.slice(0, 12)}...</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Native Transfers */}
            {result.nativeTransfers && result.nativeTransfers.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Native Transfers ({result.nativeTransfers.length})</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {result.nativeTransfers.slice(0, 20).map((transfer: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-[#0a0a0f] border border-white/5 p-2 text-xs">
                      <span className="text-gray-400 font-mono">
                        {transfer.from_user_account?.slice(0, 8) || '?'}...{'->'}
                        {transfer.to_user_account?.slice(0, 8) || '?'}...
                      </span>
                      <span className="text-yellow-400 font-mono">
                        {transfer.amount ? `${(Number(transfer.amount) / 1e9).toFixed(6)} SOL` : '--'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature Link */}
            <div className="pt-2">
              <a
                href={`https://solscan.io/tx/${signature.trim()}`}
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
        )}
      </div>
    </section>
  )
}
