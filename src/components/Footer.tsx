import { useLanguage } from '../contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="relative z-10 border-t border-white/5 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-green-400 flex items-center justify-center font-black text-xs text-white">
              E50
            </div>
            <div className="text-sm text-gray-500">
              EACO Oracle Panel (c) 2026 - Solana
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <a href="https://solscan.io/token/DqfoyZH96RnvZusSp3Cdncjpyp3C74ZmJzGhjmHnDHRH" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">EACO Token</a>
            <span className="text-gray-700">|</span>
            <a href="https://www.helius.dev/docs/zh" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Helius API</a>
            <span className="text-gray-700">|</span>
            <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">CoinGecko</a>
            <span className="text-gray-700">|</span>
            <a href="https://orbmarkets.io" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Orbmarkets</a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 text-center text-xs text-gray-600">
          {t.dataRefOnly}
        </div>
      </div>
    </footer>
  )
}
