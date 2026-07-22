import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import type { EacoTokenInfo } from '../lib/helius'
import { EACO_MINT } from '../lib/helius'

interface Props {
  tokenInfo: EacoTokenInfo | null
}

export default function EacoContractPanel({ tokenInfo }: Props) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(EACO_MINT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const links = [
    { label: 'Solscan', url: `https://solscan.io/token/${EACO_MINT}`, color: 'text-purple-400' },
    { label: 'OKLink', url: `https://www.oklink.com/solana/token/${EACO_MINT}`, color: 'text-blue-400' },
    { label: 'Solana Explorer', url: `https://explorer.solana.com/address/${EACO_MINT}`, color: 'text-green-400' },
    { label: 'Orbmarkets', url: `https://orbmarkets.io/token/${EACO_MINT}`, color: 'text-amber-400' },
    { label: 'CoinGecko', url: 'https://www.coingecko.com/', color: 'text-blue-300' },
  ]

  // Extract DAS metadata fields
  const metadata = tokenInfo?.assetMetadata
  const tokenName = metadata?.token_info?.symbol || metadata?.content?.metadata?.name || 'EACO'
  const tokenFullName = metadata?.content?.metadata?.name || 'EACO Token'
  const tokenImage = metadata?.content?.links?.image
  const tokenDescription = metadata?.content?.metadata?.description
  const tokenSupplyFromDAS = metadata?.token_info?.supply
  const tokenDecimalsFromDAS = metadata?.token_info?.decimals
  const isMutable = metadata?.mutable
  const primarySaleHappened = metadata?.primary_sale_happened

  return (
    <section className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-600 to-green-400" />
        <h2 className="text-lg font-bold">{t.tokenInfo}</h2>
        <span className="text-xs text-gray-500">- EACO (Helius DAS)</span>
      </div>

      <div className="rounded-2xl bg-[#12121c] border border-white/5 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Contract Address */}
          <div>
            <div className="text-xs text-gray-500 mb-2">{t.contractAddr}</div>
            <div className="flex items-center gap-2 bg-[#0a0a0f] rounded-xl p-3 border border-white/5">
              <code className="flex-1 text-xs text-green-400 font-mono break-all">{EACO_MINT}</code>
              <button
                onClick={copyAddress}
                className="shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors"
                title={t.copy}
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            {copied && <div className="text-xs text-green-400 mt-1">{t.copied}</div>}

            {/* Verification Links */}
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-2">{t.viewOn}</div>
              <div className="flex flex-wrap gap-2">
                {links.map(link => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors ${link.color}`}
                  >
                    {link.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Token Stats */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.supply}</div>
                <div className="font-mono font-bold text-sm text-white mt-1">
                  {tokenInfo ? tokenInfo.supply.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '--'}
                </div>
              </div>
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.decimals}</div>
                <div className="font-mono font-bold text-sm text-white mt-1">
                  {tokenInfo ? tokenInfo.decimals : '--'}
                </div>
              </div>
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.contract}</div>
                <div className="font-mono font-bold text-sm text-purple-400 mt-1">Solana</div>
              </div>
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500">{t.holders}</div>
                <div className="font-mono font-bold text-sm text-white mt-1">
                  {tokenInfo?.holderCount !== null && tokenInfo?.holderCount !== undefined
                    ? tokenInfo.holderCount.toLocaleString()
                    : '--'}
                </div>
              </div>
            </div>

            {/* DAS Metadata */}
            {metadata && (
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500 mb-2">DAS Metadata</div>
                <div className="space-y-1 text-xs">
                  {tokenFullName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="text-gray-300">{tokenFullName}</span>
                    </div>
                  )}
                  {tokenSupplyFromDAS && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">DAS Supply</span>
                      <span className="text-gray-300 font-mono">{tokenSupplyFromDAS}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mutable</span>
                    <span className={isMutable ? 'text-yellow-400' : 'text-green-400'}>
                      {isMutable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primary Sale</span>
                    <span className={primarySaleHappened ? 'text-green-400' : 'text-gray-400'}>
                      {primarySaleHappened ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DAS Description */}
            {tokenDescription && (
              <div className="rounded-xl bg-[#0a0a0f] border border-white/5 p-3">
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <div className="text-xs text-gray-400 leading-relaxed">{tokenDescription}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
