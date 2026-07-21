import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface HeaderProps {
  countdown: number
  maxCountdown: number
  lastUpdate: number | null
  onRefresh: () => void
  loading: boolean
  wsConnected: boolean
}

export default function Header({ countdown, maxCountdown, lastUpdate, onRefresh, loading, wsConnected }: HeaderProps) {
  const { t, lang, setLang, languages } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentLang = languages.find(l => l.code === lang) || languages[0]
  const progress = ((maxCountdown - countdown) / maxCountdown) * 100
  const lastUpdateStr = lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '--'

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-green-400 flex items-center justify-center font-black text-xs tracking-tight text-white">
            E50
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-base tracking-tight">eaco</span>
            <span className="font-black text-base text-green-400 tracking-tight">50rate</span>
          </div>
          <div className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs text-purple-300 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="hidden sm:inline">Solana</span>
          </div>
        </div>

        {/* Center: Sync Status */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
            <span className="text-gray-500">{t.oracleSyncing}</span>
            <div className="relative w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-green-400 min-w-[2.5rem] text-right">{countdown}s</span>
          </div>
        </div>

        {/* Right: Refresh + Language */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
            title={t.refresh}
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden lg:inline text-xs">{t.refresh}</span>
          </button>

          {/* Language Selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <span className="text-xs font-medium uppercase">{currentLang.code}</span>
              <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#1a1a28] border border-white/10 shadow-2xl py-2 z-50">
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                      lang === l.code ? 'text-purple-400' : 'text-gray-300'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase">{l.code}</span>
                    <div className="text-left">
                      <div className="font-medium text-xs">{l.native}</div>
                      <div className="text-gray-500 text-xs">{l.label}</div>
                    </div>
                    {lang === l.code && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sync Bar */}
      <div className="md:hidden px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{t.lastUpdate}: <span className="text-gray-300 font-mono">{lastUpdateStr}</span></span>
          <span className="font-mono text-green-400">{countdown}s</span>
        </div>
      </div>
    </header>
  )
}
