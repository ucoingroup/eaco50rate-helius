import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getRpcInfo, checkAllApiHealth, type ApiHealthStatus } from '../lib/helius'

export default function HeliusPanel() {
  const { t } = useLanguage()
  const rpcInfo = getRpcInfo()
  const [healthStatuses, setHealthStatuses] = useState<ApiHealthStatus[]>([])
  const [checking, setChecking] = useState(false)

  const checkHealth = async () => {
    setChecking(true)
    setHealthStatuses([
      { name: t.rpc, status: 'checking', latencyMs: null },
      { name: t.das, status: 'checking', latencyMs: null },
      { name: t.wallet, status: 'checking', latencyMs: null },
      { name: t.webSocket, status: 'checking', latencyMs: null },
      { name: t.priorityFee, status: 'checking', latencyMs: null },
      { name: t.enhancedTx, status: 'checking', latencyMs: null },
    ])

    const results = await checkAllApiHealth()
    const nameMap: Record<string, string> = {
      'RPC': t.rpc,
      'DAS': t.das,
      'Wallet API': t.wallet,
      'WebSocket': t.webSocket,
      'Priority Fee': t.priorityFee,
      'Enhanced Tx': t.enhancedTx,
    }
    setHealthStatuses(results.map(r => ({ ...r, name: nameMap[r.name] || r.name })))
    setChecking(false)
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 60_000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apiConfigs = [
    {
      name: t.rpc,
      desc: 'JSON-RPC methods: getBalance, getAccountInfo, getProgramAccounts, getTokenSupply',
      icon: 'M5 12h14M12 5l7 7-7 7',
      color: 'text-green-400',
      url: 'https://www.helius.dev/docs/zh/api-reference/rpc/http-methods',
    },
    {
      name: t.das,
      desc: 'Digital Asset Standard: getAsset, searchAssets, getTokenAccounts',
      icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h6a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z',
      color: 'text-purple-400',
      url: 'https://www.helius.dev/docs/zh/api-reference/das',
    },
    {
      name: t.wallet,
      desc: 'Wallet API: balances (USD valuation), history, transfers',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      color: 'text-blue-400',
      url: 'https://www.helius.dev/docs/zh/wallet-api/overview',
    },
    {
      name: t.webSocket,
      desc: 'Real-time account subscription, accountSubscribe notifications',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'text-amber-400',
      url: 'https://www.helius.dev/docs/zh/api-reference/rpc/websocket-methods',
    },
    {
      name: t.priorityFee,
      desc: 'getPriorityFeeEstimate: smart fee estimation for transactions',
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      color: 'text-yellow-400',
      url: 'https://www.helius.dev/docs/zh/priority-fee-api',
    },
    {
      name: t.enhancedTx,
      desc: 'parseTransaction: decoded instructions, token transfers, human-readable',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-cyan-400',
      url: 'https://www.helius.dev/docs/zh/enhanced-transactions',
    },
  ]

  const getHealthStatus = (apiName: string): ApiHealthStatus | undefined => {
    return healthStatuses.find(h => h.name === apiName)
  }

  const statusBadge = (status: 'online' | 'offline' | 'checking') => {
    if (status === 'checking') {
      return (
        <span className="flex items-center gap-1 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
          <span className="text-gray-400">...</span>
        </span>
      )
    }
    if (status === 'online') {
      return (
        <span className="flex items-center gap-1 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400">{t.online}</span>
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1 text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <span className="text-red-400">{t.offline}</span>
      </span>
    )
  }

  return (
    <section className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-600 to-green-400" />
        <h2 className="text-lg font-bold">{t.heliusApi}</h2>
        <span className="text-xs text-gray-500">- {t.heliusDesc}</span>
        <button
          onClick={checkHealth}
          disabled={checking}
          className="ml-auto px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 transition-colors disabled:opacity-50"
        >
          {checking ? '...' : t.refresh}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {apiConfigs.map(api => {
          const health = getHealthStatus(api.name)
          return (
            <a
              key={api.name}
              href={api.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover rounded-2xl bg-[#12121c] border border-white/5 p-4 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 ${api.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={api.icon} />
                  </svg>
                  <span className="font-bold text-sm">{api.name}</span>
                </div>
                {health ? statusBadge(health.status) : statusBadge('checking')}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{api.desc}</p>
              {health?.latencyMs !== null && health?.latencyMs !== undefined && (
                <p className="text-xs text-gray-600 mt-1 font-mono">{health.latencyMs}ms</p>
              )}
            </a>
          )
        })}
      </div>

      {/* Helius Links */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href="https://www.helius.dev/docs/zh"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-green-500/20 border border-purple-500/20 text-xs font-medium text-purple-300 hover:from-purple-600/30 hover:to-green-500/30 transition-all"
        >
          {t.heliusDocs} -&gt;&gt;
        </a>
        <span className="text-xs text-gray-600">{t.poweredBy} Helius RPC ({rpcInfo.url})</span>
      </div>
    </section>
  )
}
