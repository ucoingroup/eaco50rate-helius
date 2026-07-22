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
 * - API Health Check: Real endpoint availability verification
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
// Simple Cache Layer (TTL-based, prevents excessive API calls)
// ============================================================================

interface CacheEntry<T> {
  data: T
  expiry: number
}

const _cache = new Map<string, CacheEntry<any>>()
const DEFAULT_TTL = 30_000 // 30 seconds

function cacheGet<T>(key: string): T | null {
  const entry = _cache.get(key)
  if (entry && entry.expiry > Date.now()) {
    return entry.data as T
  }
  _cache.delete(key)
  return null
}

function cacheSet<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  _cache.set(key, { data, expiry: Date.now() + ttl })
}

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
  const cacheKey = `supply:${mintAddress}`
  const cached = cacheGet<{ amount: number; decimals: number }>(cacheKey)
  if (cached) return cached

  const conn = getConnection()
  const pub = new PublicKey(mintAddress)
  const supply = await conn.getTokenSupply(pub)
  const result = {
    amount: supply.value.uiAmount || 0,
    decimals: supply.value.decimals,
  }
  cacheSet(cacheKey, result, 60_000) // cache supply for 60s
  return result
}

// ============================================================================
// 2. DAS API (Digital Asset Standard)
// ============================================================================

/** DAS: Get asset metadata by mint address */
export async function dasGetAsset(mintAddress: string): Promise<any | null> {
  const cacheKey = `das:asset:${mintAddress}`
  const cached = cacheGet<any>(cacheKey)
  if (cached !== null) return cached

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
    const result = data.result || null
    if (result) cacheSet(cacheKey, result, 120_000) // cache DAS metadata for 2 min
    return result
  } catch (err) {
    console.warn('[Helius DAS] getAsset failed:', err)
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
  } catch (err) {
    console.warn('[Helius DAS] getTokenAccounts failed:', err)
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
  } catch (err) {
    console.warn('[Helius DAS] searchAssets failed:', err)
    return []
  }
}

/**
 * Get token holder count using getProgramAccounts with filter on the mint.
 * This counts all Token Account entries for a given mint address.
 */
export async function getTokenHolderCount(mintAddress: string): Promise<number | null> {
  const cacheKey = `holders:${mintAddress}`
  const cached = cacheGet<number | null>(cacheKey)
  if (cached !== null) return cached

  try {
    const conn = getConnection()
    const mintPub = new PublicKey(mintAddress)

    // Use getProgramAccounts with a filter for the mint address in the token account
    // Token account layout: mint at offset 0, 32 bytes
    const accounts = await conn.getProgramAccounts(TOKEN_PROGRAM_ID, {
      commitment: 'confirmed',
      filters: [
        { dataSize: 165 }, // SPL token account size
        { memcmp: { offset: 0, bytes: mintPub.toBase58() } },
      ],
      encoding: 'base64',
    })

    // Filter out accounts with zero balance
    let count = 0
    for (const acc of accounts) {
      if (acc.account.data.length >= 72) {
        const amount = acc.account.data.readBigUInt64LE(64)
        if (amount > 0n) count++
      }
    }

    cacheSet(cacheKey, count, 120_000) // cache for 2 min
    return count
  } catch (err) {
    console.warn('[Helius] getTokenHolderCount failed:', err)
    return null
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
  } catch (err) {
    console.warn('[Helius Wallet API] getBalances failed:', err)
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
  } catch (err) {
    console.warn('[Helius Wallet API] getHistory failed:', err)
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
  } catch (err) {
    console.warn('[Helius Wallet API] getTransfers failed:', err)
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
 * Returns a subscription object with onStatus callback for connection state.
 */
export function subscribeToAccount(
  accountAddress: string,
  callback: (data: any) => void,
  onStatus?: (connected: boolean) => void,
): WsSubscription {
  let ws: WebSocket | null = null
  let subscriptionId: string | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let closed = false
  let reconnectAttempts = 0

  function connect() {
    if (closed) return
    try {
      ws = new WebSocket(HELIUS_WS_URL)
    } catch (err) {
      console.warn('[Helius WS] Connection failed:', err)
      onStatus?.(false)
      if (!closed) {
        reconnectTimer = setTimeout(connect, Math.min(5000 * (reconnectAttempts + 1), 30000))
      }
      return
    }

    ws.onopen = () => {
      reconnectAttempts = 0
      onStatus?.(true)
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
      onStatus?.(false)
      if (!closed) {
        reconnectAttempts++
        const delay = Math.min(5000 * reconnectAttempts, 30000)
        reconnectTimer = setTimeout(connect, delay)
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
      onStatus?.(false)
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
  } catch (err) {
    console.warn('[Helius] getPriorityFeeEstimate failed:', err)
    return null
  }
}

/**
 * Get recent priority fee level for common account keys.
 * Uses the EACO mint + known pool addresses as reference accounts.
 */
export async function getRecentPriorityFee(): Promise<PriorityFeeEstimate | null> {
  const cacheKey = 'priorityFee:recent'
  const cached = cacheGet<PriorityFeeEstimate | null>(cacheKey)
  if (cached !== null) return cached

  // Use EACO-related accounts as reference for fee estimation
  const accountKeys = [
    EACO_MINT,
    ...EACO_POOLS.map(p => p.address),
  ]

  const result = await getPriorityFeeEstimate(undefined, accountKeys)
  if (result) cacheSet(cacheKey, result, 15_000) // cache for 15s
  return result
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
    if (data.error) {
      console.warn('[Helius] parseTransaction error:', data.error)
      return null
    }
    return data.result || null
  } catch (err) {
    console.warn('[Helius] parseTransaction failed:', err)
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

/**
 * Check EACO pool reserves on-chain via Helius RPC.
 * @param poolAddress The pool address to query
 * @param solPriceUsd Optional SOL price for USD valuation. If not provided,
 *                    liquidity for SOL pools will show as 0 USD.
 */
export async function getEacoPoolStatus(
  poolAddress: string,
  solPriceUsd?: number,
): Promise<EacoPoolStatus | null> {
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
      // Use dynamically provided SOL price; fall back to 0 if not available
      const solPrice = solPriceUsd || 0
      if (eacoReserve > 0 && solPrice > 0) {
        impliedPrice = (otherReserve * solPrice) / eacoReserve
      }
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
  } catch (err) {
    console.warn('[Helius] getEacoPoolStatus failed for', poolAddress, err)
    return null
  }
}

/**
 * Get all known EACO pool statuses.
 * @param solPriceUsd Optional SOL price for USD valuation of SOL pools.
 */
export async function getAllEacoPools(solPriceUsd?: number): Promise<EacoPoolStatus[]> {
  const results = await Promise.all(EACO_POOLS.map(p => getEacoPoolStatus(p.address, solPriceUsd)))
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
  const [supply, assetMeta, holders] = await Promise.all([
    getTokenSupply(EACO_MINT),
    dasGetAsset(EACO_MINT),
    getTokenHolderCount(EACO_MINT),
  ])

  return {
    mint: EACO_MINT,
    supply: supply.amount,
    decimals: supply.decimals,
    holderCount: holders,
    assetMetadata: assetMeta,
  }
}

// ============================================================================
// 9. API Health Check
// ============================================================================

export interface ApiHealthStatus {
  name: string
  status: 'online' | 'offline' | 'checking'
  latencyMs: number | null
  detail?: string
}

/** Check RPC endpoint health via getHealth */
export async function checkRpcHealth(): Promise<ApiHealthStatus> {
  const start = Date.now()
  try {
    const resp = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'health-check',
        method: 'getHealth',
        params: [],
      }),
    })
    const data = await resp.json()
    const latency = Date.now() - start
    if (data.result === 'ok') {
      return { name: 'RPC', status: 'online', latencyMs: latency }
    }
    return { name: 'RPC', status: 'offline', latencyMs: latency, detail: data.result || 'Unknown' }
  } catch (err) {
    return { name: 'RPC', status: 'offline', latencyMs: null, detail: String(err) }
  }
}

/** Check DAS endpoint health via getAsset on a well-known token (SOL) */
export async function checkDasHealth(): Promise<ApiHealthStatus> {
  const start = Date.now()
  try {
    const resp = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'das-health',
        method: 'getAsset',
        params: { id: TOKEN_MINTS.USDC },
      }),
    })
    const data = await resp.json()
    const latency = Date.now() - start
    if (data.result) {
      return { name: 'DAS', status: 'online', latencyMs: latency }
    }
    return { name: 'DAS', status: 'offline', latencyMs: latency, detail: 'No result' }
  } catch (err) {
    return { name: 'DAS', status: 'offline', latencyMs: null, detail: String(err) }
  }
}

/** Check Wallet API health via a known wallet */
export async function checkWalletApiHealth(): Promise<ApiHealthStatus> {
  const start = Date.now()
  try {
    // Use the EACO mint authority or a known wallet; use token mint itself as fallback
    const resp = await fetch(
      `${HELIUS_API_BASE}/v1/wallet/${EACO_MINT}/balances?api-key=${HELIUS_API_KEY}`,
    )
    const latency = Date.now() - start
    if (resp.ok || resp.status === 200) {
      return { name: 'Wallet API', status: 'online', latencyMs: latency }
    }
    return { name: 'Wallet API', status: 'offline', latencyMs: latency, detail: `HTTP ${resp.status}` }
  } catch (err) {
    return { name: 'Wallet API', status: 'offline', latencyMs: null, detail: String(err) }
  }
}

/** Check all Helius API endpoints */
export async function checkAllApiHealth(): Promise<ApiHealthStatus[]> {
  const [rpc, das, wallet] = await Promise.all([
    checkRpcHealth(),
    checkDasHealth(),
    checkWalletApiHealth(),
  ])

  return [
    rpc,
    das,
    wallet,
    // WebSocket and Priority Fee are checked indirectly - mark based on RPC
    { name: 'WebSocket', status: rpc.status === 'online' ? 'online' : 'offline', latencyMs: null },
    { name: 'Priority Fee', status: rpc.status === 'online' ? 'online' : 'offline', latencyMs: null },
    { name: 'Enhanced Tx', status: rpc.status === 'online' ? 'online' : 'offline', latencyMs: null },
  ]
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
