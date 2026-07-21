/**
 * Helius API Integration Layer
 *
 * Comprehensive integration with Helius APIs:
 * - RPC: JSON-RPC methods (getBalance, getAccountInfo, getProgramAccounts)
 * - DAS: Digital Asset Standard (getAsset, searchAssets, getTokenAccounts)
 * - Wallet API: Balances, history, transfers with USD valuation
 * - WebSocket: Real-time account subscription
 * - Priority Fee API: Transaction fee estimation
 * - Enhanced Transactions: Parsed transaction data
 *
 * Docs: https://www.helius.dev/docs/zh
 */

import { Connection, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'

// ============================================================================
// Configuration
// ============================================================================

const HELIUS_API_KEY = 'd473bbab-94d8-4a59-b0be-961940d152a7'
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
const HELIUS_API_BASE = 'https://api.helius.xyz'
const HELIUS_WS_URL = `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

// EACO contract address
export const EACO_MINT = 'DqfoyZH96RnvZusSp3Cdncjpyp3C74ZmJzGhjmHnDHRH'

// Known token mints
export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  eCNH: '7GQnqthWKa5v2GqXYWhmgWZY5mCRrniwK3Xuinm9GKw5',
  EACO: EACO_MINT,
} as const

export const TOKEN_DECIMALS: Record<string, number> = {
  [TOKEN_MINTS.SOL]: 9,
  [TOKEN_MINTS.USDT]: 6,
  [TOKEN_MINTS.USDC]: 6,
  [TOKEN_MINTS.eCNH]: 6,
  [TOKEN_MINTS.EACO]: 9,
}

// Known EACO liquidity pools (verified on-chain)
const EACO_POOLS = [
  {
    name: 'EACO/USDT (Meteora DLMM)',
    address: '6ZfCi3qzhgDN1ygHVYXvfsfrwz8ZhQ7hD5mJtjeuUDyE',
    dex: 'meteora' as const,
  },
  {
    name: 'EACO/SOL (Meteora DLMM)',
    address: 'GsDB4iKELP7KDVjn5ZcHsJhWRY8J3HqTxvE86zyDhV34',
    dex: 'meteora' as const,
  },
]

// ============================================================================
// RPC Connection
// ============================================================================

let _connection: Connection | null = null

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(HELIUS_RPC_URL, 'confirmed')
  }
  return _connection
}

export function getRpcInfo(): { url: string; isHelius: boolean } {
  return { url: 'Helius', isHelius: true }
}

// ============================================================================
// 1. RPC Methods
// ============================================================================

/** Get SOL balance for a wallet address */
export async function getSOLBalance(walletAddress: string): Promise<number> {
  const conn = getConnection()
  const pub = new PublicKey(walletAddress)
  const lamports = await conn.getBalance(pub)
  return lamports / 1e9
}

/** Get SPL token balance for a specific mint */
export async function getSPLBalance(walletAddress: string, mintAddress: string): Promise<number> {
  const conn = getConnection()
  const walletPub = new PublicKey(walletAddress)
  const mintPub = new PublicKey(mintAddress)

  try {
    const ata = getAssociatedTokenAddressSync(
      mintPub, walletPub, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
    )
    const account = await conn.getParsedAccountInfo(ata)
    if (!account.value) return 0
    const data = account.value.data
    if (typeof data === 'object' && 'parsed' in data) {
      const amount = (data as any).parsed.info.tokenAmount.uiAmount
      return amount || 0
    }
    return 0
  } catch {
    return 0
  }
}

/** Get all token balances for a wallet (SOL + SPL tokens) */
export async function getWalletTokenBalances(
  walletAddress: string,
  mints: string[] = Object.values(TOKEN_MINTS),
): Promise<Record<string, number>> {
  const results: Record<string, number> = {}
  results[TOKEN_MINTS.SOL] = await getSOLBalance(walletAddress)

  const splPromises = mints
    .filter(m => m !== TOKEN_MINTS.SOL)
    .map(async m => {
      const bal = await getSPLBalance(walletAddress, m)
      return [m, bal] as [string, number]
    })

  const splResults = await Promise.all(splPromises)
  for (const [mint, bal] of splResults) {
    results[mint] = bal
  }
  return results
}

/** Get account info (raw) */
export async function getAccountInfo(address: string) {
  const conn = getConnection()
  const pub = new PublicKey(address)
  return conn.getAccountInfo(pub, 'processed')
}

/** Get token supply for a mint */
export async function getTokenSupply(mintAddress: string): Promise<{ amount: number; decimals: number }> {
  const conn = getConnection()
  const pub = new PublicKey(mintAddress)
  const supply = await conn.getTokenSupply(pub)
  return {
    amount: supply.value.uiAmount || 0,
    decimals: supply.value.decimals,
  }
}

// ============================================================================
// 2. DAS API (Digital Asset Standard)
// ============================================================================

/** DAS: Get asset metadata by mint address */
export async function dasGetAsset(mintAddress: string): Promise<any | null> {
  try {
    const resp = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'eaco50rate',
        method: 'getAsset',
        params: { id: mintAddress },
      }),
    })
    const data = await resp.json()
    return data.result || null
  } catch {
    return null
  }
}

/** DAS: Get token accounts by owner */
export async function dasGetTokenAccounts(ownerAddress: string, mintAddress?: string): Promise<any[]> {
  try {
    const params: any = { ownerAddress }
    if (mintAddress) params.mint = mintAddress
    const resp = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'eaco50rate',
        method: 'getTokenAccounts',
        params,
      }),
    })
    const data = await resp.json()
    return data.result?.token_accounts || []
  } catch {
    return []
  }
}

/** DAS: Search assets (e.g., search by creator, owner, group) */
export async function dasSearchAssets(params: {
  ownerAddress?: string
  creatorAddress?: string
  groupKey?: string
  groupValue?: string
  sortBy?: string
  limit?: number
  page?: number
}): Promise<any[]> {
  try {
    const searchParams: any = {}
    if (params.ownerAddress) searchParams.ownerAddress = params.ownerAddress
    if (params.creatorAddress) searchParams.creatorAddress = params.creatorAddress
    if (params.groupKey) {
      searchParams.groups = [{ key: params.groupKey, value: params.groupValue }]
    }
    searchParams.displayOptions = { showFungible: true }
    searchParams.limit = params.limit || 50
    searchParams.page = params.page || 1

    const resp = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'eaco50rate',
        method: 'searchAssets',
        params: searchParams,
      }),
    })
    const data = await resp.json()
    return data.result?.items || []
  } catch {
    return []
  }
}

// ============================================================================
// 3. Wallet API (REST)
// ============================================================================

export interface WalletBalance {
  token_address: string
  amount: number
  decimals: number
  symbol: string
  name: string
  usd_value: number | null
  icon?: string
}

export interface WalletBalancesResponse {
  tokens: WalletBalance[]
  total_usd_value: number | null
}

/** Wallet API: Get wallet balances with USD valuation */
export async function walletGetBalances(walletAddress: string): Promise<WalletBalancesResponse> {
  try {
    const resp = await fetch(
      `${HELIUS_API_BASE}/v1/wallet/${walletAddress}/balances?api-key=${HELIUS_API_KEY}`,
    )
    if (!resp.ok) throw new Error(`Wallet API error: ${resp.status}`)
    return await resp.json()
  } catch {
    return { tokens: [], total_usd_value: null }
  }
}

export interface WalletHistoryItem {
  timestamp: number
  signature: string
  description: string
  type: string
  source: string
  fee: number
  fee_payer: string
}

/** Wallet API: Get wallet transaction history */
export async function walletGetHistory(
  walletAddress: string,
  limit: number = 20,
): Promise<WalletHistoryItem[]> {
  try {
    const resp = await fetch(
      `${HELIUS_API_BASE}/v1/wallet/${walletAddress}/history?api-key=${HELIUS_API_KEY}&limit=${limit}`,
    )
    if (!resp.ok) throw new Error(`Wallet API error: ${resp.status}`)
    const data = await resp.json()
    return data || []
  } catch {
    return []
  }
}

export interface WalletTransfer {
  timestamp: number
  signature: string
  amount: number
  decimals: number
  token_address: string
  from_address: string
  to_address: string
  direction: 'in' | 'out'
}

/** Wallet API: Get token transfers */
export async function walletGetTransfers(
  walletAddress: string,
  limit: number = 20,
): Promise<WalletTransfer[]> {
  try {
    const resp = await fetch(
      `${HELIUS_API_BASE}/v1/wallet/${walletAddress}/transfers?api-key=${HELIUS_API_KEY}&limit=${limit}`,
    )
    if (!resp.ok) throw new Error(`Wallet API error: ${resp.status}`)
    const data = await resp.json()
    return data || []
  } catch {
    return []
  }
}

// ============================================================================
// 4. WebSocket - Real-time subscription
// ============================================================================

export interface WsSubscription {
  close: () => void
}

/**
 * Subscribe to account changes via Helius WebSocket.
 * Calls callback when the subscribed account's data changes on-chain.
 */
export function subscribeToAccount(
  accountAddress: string,
  callback: (data: any) => void,
): WsSubscription {
  let ws: WebSocket | null = null
  let subscriptionId: string | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let closed = false

  function connect() {
    if (closed) return
    ws = new WebSocket(HELIUS_WS_URL)

    ws.onopen = () => {
      ws?.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'accountSubscribe',
        params: [
          accountAddress,
          { encoding: 'jsonParsed', commitment: 'confirmed' },
        ],
      }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.id === 1 && msg.result) {
          subscriptionId = msg.result
        }
        if (msg.method === 'accountNotification' && msg.params?.result) {
          callback(msg.params.result)
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      if (!closed) {
        reconnectTimer = setTimeout(connect, 5000)
      }
    }

    ws.onerror = () => {
      ws?.close()
    }
  }

  connect()

  return {
    close: () => {
      closed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (subscriptionId && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'accountUnsubscribe',
          params: [subscriptionId],
        }))
      }
      ws?.close()
    },
  }
}

// ============================================================================
// 5. Priority Fee API
// ============================================================================

export interface PriorityFeeEstimate {
  priorityFeeEstimate: number
}

/** Get priority fee estimate for a transaction */
export async function getPriorityFeeEstimate(
  transactionSignature?: string,
  accountKeys?: string[],
): Promise<PriorityFeeEstimate | null> {
  try {
    const params: any = {}
    if (transactionSignature) params.transaction = transactionSignature
    if (accountKeys) params.accountKeys = accountKeys
    params.options = { recommended: true }

    const resp = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'eaco50rate',
        method: 'getPriorityFeeEstimate',
        params: [params],
      }),
    })
    const data = await resp.json()
    return data.result || null
  } catch {
    return null
  }
}

// ============================================================================
// 6. Enhanced Transactions API
// ============================================================================

export interface EnhancedTransaction {
  description: string
  type: string
  source: string
  fee: number
  feePayer: string
  signature: string
  timestamp: number
  tokenTransfers: any[]
  nativeTransfers: any[]
  events: any
}

/** Parse a transaction by signature using Helius Enhanced Transactions API */
export async function parseTransaction(signature: string): Promise<EnhancedTransaction | null> {
  try {
    const resp = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'eaco50rate',
        method: 'parseTransaction',
        params: { signature },
      }),
    })
    const data = await resp.json()
    return data.result || null
  } catch {
    return null
  }
}

/** Get parsed transaction history for an address */
export async function getSignaturesForAddress(
  address: string,
  limit: number = 10,
): Promise<any[]> {
  const conn = getConnection()
  const pub = new PublicKey(address)
  const sigs = await conn.getSignaturesForAddress(pub, { limit })
  return sigs
}

// ============================================================================
// 7. EACO Pool Monitoring (on-chain)
// ============================================================================

const METEORA_TOKEN_X_OFFSET = 88
const METEORA_TOKEN_Y_OFFSET = 120
const METEORA_RESERVE_X_OFFSET = 152
const METEORA_RESERVE_Y_OFFSET = 184

export interface EacoPoolStatus {
  name: string
  address: string
  dex: string
  isActive: boolean
  reserveX: number
  reserveY: number
  liquidityUsd: number
  impliedPrice: number | null
  tokenXMint: string
  tokenYMint: string
}

/** Check EACO pool reserves on-chain via Helius RPC */
export async function getEacoPoolStatus(poolAddress: string): Promise<EacoPoolStatus | null> {
  const conn = getConnection()

  try {
    const poolKey = new PublicKey(poolAddress)
    const acctInfo = await conn.getAccountInfo(poolKey, 'processed')

    if (!acctInfo || acctInfo.data.length < 220) {
      return {
        name: 'Unknown',
        address: poolAddress,
        dex: 'unknown',
        isActive: false,
        reserveX: 0,
        reserveY: 0,
        liquidityUsd: 0,
        impliedPrice: null,
        tokenXMint: '',
        tokenYMint: '',
      }
    }

    const tokenXMint = new PublicKey(acctInfo.data.slice(METEORA_TOKEN_X_OFFSET, METEORA_TOKEN_X_OFFSET + 32))
    const tokenYMint = new PublicKey(acctInfo.data.slice(METEORA_TOKEN_Y_OFFSET, METEORA_TOKEN_Y_OFFSET + 32))
    const reserveXAddr = new PublicKey(acctInfo.data.slice(METEORA_RESERVE_X_OFFSET, METEORA_RESERVE_X_OFFSET + 32))
    const reserveYAddr = new PublicKey(acctInfo.data.slice(METEORA_RESERVE_Y_OFFSET, METEORA_RESERVE_Y_OFFSET + 32))

    const [rxInfo, ryInfo] = await Promise.all([
      conn.getAccountInfo(reserveXAddr),
      conn.getAccountInfo(reserveYAddr),
    ])

    const rxRaw = rxInfo && rxInfo.data.length === 165 ? rxInfo.data.readBigUInt64LE(64) : 0n
    const ryRaw = ryInfo && ryInfo.data.length === 165 ? ryInfo.data.readBigUInt64LE(64) : 0n

    const xMint = tokenXMint.toBase58()
    const yMint = tokenYMint.toBase58()

    const xDecimals = TOKEN_DECIMALS[xMint] ?? 9
    const yDecimals = TOKEN_DECIMALS[yMint] ?? 6

    const reserveX = Number(rxRaw) / Math.pow(10, xDecimals)
    const reserveY = Number(ryRaw) / Math.pow(10, yDecimals)

    const xIsEaco = xMint === EACO_MINT
    const eacoReserve = xIsEaco ? reserveX : reserveY
    const otherReserve = xIsEaco ? reserveY : reserveX
    const otherMint = xIsEaco ? yMint : xMint

    let impliedPrice: number | null = null
    let liquidityUsd = 0

    if (otherMint === TOKEN_MINTS.USDT || otherMint === TOKEN_MINTS.USDC) {
      if (eacoReserve > 0) impliedPrice = otherReserve / eacoReserve
      liquidityUsd = otherReserve * 2
    } else if (otherMint === TOKEN_MINTS.SOL) {
      const solPrice = 180
      if (eacoReserve > 0) impliedPrice = (otherReserve * solPrice) / eacoReserve
      liquidityUsd = otherReserve * solPrice * 2
    }

    const known = EACO_POOLS.find(p => p.address === poolAddress)

    return {
      name: known?.name || `${xMint.slice(0, 8)}/${yMint.slice(0, 8)}`,
      address: poolAddress,
      dex: known?.dex || 'unknown',
      isActive: rxRaw > 0n || ryRaw > 0n,
      reserveX,
      reserveY,
      liquidityUsd,
      impliedPrice,
      tokenXMint: xMint,
      tokenYMint: yMint,
    }
  } catch {
    return null
  }
}

/** Get all known EACO pool statuses */
export async function getAllEacoPools(): Promise<EacoPoolStatus[]> {
  const results = await Promise.all(EACO_POOLS.map(p => getEacoPoolStatus(p.address)))
  return results.filter((r): r is EacoPoolStatus => r !== null)
}

// ============================================================================
// 8. EACO Token Info
// ============================================================================

export interface EacoTokenInfo {
  mint: string
  supply: number
  decimals: number
  holderCount: number | null
  assetMetadata: any | null
}

/** Get comprehensive EACO token info */
export async function getEacoTokenInfo(): Promise<EacoTokenInfo> {
  const [supply, assetMeta] = await Promise.all([
    getTokenSupply(EACO_MINT),
    dasGetAsset(EACO_MINT),
  ])

  return {
    mint: EACO_MINT,
    supply: supply.amount,
    decimals: supply.decimals,
    holderCount: null,
    assetMetadata: assetMeta,
  }
}

// ============================================================================
// Export config for UI
// ============================================================================

export const HeliusConfig = {
  apiKey: HELIUS_API_KEY,
  rpcUrl: HELIUS_RPC_URL,
  apiBase: HELIUS_API_BASE,
  wsUrl: HELIUS_WS_URL,
}
