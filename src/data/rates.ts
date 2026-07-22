/**
 * 50 Country Exchange Rate Data Model & API Layer
 *
 * Sources:
 * - CoinGecko API: SOL/USDT/USDC prices
 * - Forex API (open.er-api.com): 50+ country fiat exchange rates
 * - Helius on-chain: EACO/eCNH prices from liquidity pools
 * - Orbmarkets: EACO reference price
 *
 * All rates are relative to USD as the base, then cross-converted.
 */

// ============================================================================
// 50 Countries / Regions - Priority + Extended
// ============================================================================

export interface CountryRate {
  code: string       // ISO 3166-1 alpha-2
  name: { en: string; zh: string; es: string; fr: string; ar: string; ru: string }
  currency: string   // ISO 4217
  currencySymbol: string
  flag: string       // emoji flag
  tier: 'priority' | 'standard'   // EACO priority 20 or standard
  usdRate: number    // 1 USD = X currency
  lastUpdate: number // timestamp
}

// EACO Priority 20 Countries
const PRIORITY_COUNTRIES = [
  { code: 'US', currency: 'USD', symbol: '$', flag: 'US', name: { en: 'United States', zh: '美国', es: 'Estados Unidos', fr: 'Etats-Unis', ar: 'الولايات المتحدة', ru: 'США' } },
  { code: 'PH', currency: 'PHP', symbol: 'P', flag: 'PH', name: { en: 'Philippines', zh: '菲律宾', es: 'Filipinas', fr: 'Philippines', ar: 'الفلبين', ru: 'Филиппины' } },
  { code: 'JP', currency: 'JPY', symbol: 'Y', flag: 'JP', name: { en: 'Japan', zh: '日本', es: 'Japon', fr: 'Japon', ar: 'اليابان', ru: 'Япония' } },
  { code: 'GB', currency: 'GBP', symbol: 'L', flag: 'GB', name: { en: 'United Kingdom', zh: '英国', es: 'Reino Unido', fr: 'Royaume-Uni', ar: 'المملكة المتحدة', ru: 'Великобритания' } },
  { code: 'AU', currency: 'AUD', symbol: 'A$', flag: 'AU', name: { en: 'Australia', zh: '澳大利亚', es: 'Australia', fr: 'Australie', ar: 'أستراليا', ru: 'Австралия' } },
  { code: 'CA', currency: 'CAD', symbol: 'C$', flag: 'CA', name: { en: 'Canada', zh: '加拿大', es: 'Canada', fr: 'Canada', ar: 'كندا', ru: 'Канада' } },
  { code: 'NZ', currency: 'NZD', symbol: 'N$', flag: 'NZ', name: { en: 'New Zealand', zh: '新西兰', es: 'Nueva Zelanda', fr: 'Nouvelle-Zelande', ar: 'نيوزيلندا', ru: 'Новая Зеландия' } },
  { code: 'DE', currency: 'EUR', symbol: 'E', flag: 'DE', name: { en: 'Germany', zh: '德国', es: 'Alemania', fr: 'Allemagne', ar: 'ألمانيا', ru: 'Германия' } },
  { code: 'IT', currency: 'EUR', symbol: 'E', flag: 'IT', name: { en: 'Italy', zh: '意大利', es: 'Italia', fr: 'Italie', ar: 'إيطاليا', ru: 'Италия' } },
  { code: 'VN', currency: 'VND', symbol: 'D', flag: 'VN', name: { en: 'Vietnam', zh: '越南', es: 'Vietnam', fr: 'Vietnam', ar: 'فيتنام', ru: 'Вьетнам' } },
  { code: 'IR', currency: 'IRR', symbol: 'R', flag: 'IR', name: { en: 'Iran', zh: '伊朗', es: 'Iran', fr: 'Iran', ar: 'إيران', ru: 'Иран' } },
  { code: 'SG', currency: 'SGD', symbol: 'S$', flag: 'SG', name: { en: 'Singapore', zh: '新加坡', es: 'Singapur', fr: 'Singapour', ar: 'سنغافورة', ru: 'Сингапур' } },
  { code: 'MY', currency: 'MYR', symbol: 'R', flag: 'MY', name: { en: 'Malaysia', zh: '马来西亚', es: 'Malasia', fr: 'Malaisie', ar: 'ماليزيا', ru: 'Малайзия' } },
  { code: 'ID', currency: 'IDR', symbol: 'R', flag: 'ID', name: { en: 'Indonesia', zh: '印度尼西亚', es: 'Indonesia', fr: 'Indonesie', ar: 'إندونيسيا', ru: 'Индонезия' } },
  { code: 'AE', currency: 'AED', symbol: 'A', flag: 'AE', name: { en: 'UAE', zh: '阿联酋', es: 'EAU', fr: 'EAU', ar: 'الإمارات', ru: 'ОАЭ' } },
  { code: 'KR', currency: 'KRW', symbol: 'W', flag: 'KR', name: { en: 'South Korea', zh: '韩国', es: 'Corea del Sur', fr: 'Coree du Sud', ar: 'كوريا الجنوبية', ru: 'Южная Корея' } },
  { code: 'TH', currency: 'THB', symbol: 'B', flag: 'TH', name: { en: 'Thailand', zh: '泰国', es: 'Tailandia', fr: 'Thailande', ar: 'تايلاند', ru: 'Таиланд' } },
  { code: 'TR', currency: 'TRY', symbol: 'L', flag: 'TR', name: { en: 'Turkey', zh: '土耳其', es: 'Turquia', fr: 'Turquie', ar: 'تركيا', ru: 'Турция' } },
  { code: 'IN', currency: 'INR', symbol: 'R', flag: 'IN', name: { en: 'India', zh: '印度', es: 'India', fr: 'Inde', ar: 'الهند', ru: 'Индия' } },
  { code: 'BR', currency: 'BRL', symbol: 'R$', flag: 'BR', name: { en: 'Brazil', zh: '巴西', es: 'Brasil', fr: 'Bresil', ar: 'البرازيل', ru: 'Бразилия' } },
]

// Standard 30 Countries
const STANDARD_COUNTRIES = [
  { code: 'FR', currency: 'EUR', symbol: 'E', flag: 'FR', name: { en: 'France', zh: '法国', es: 'Francia', fr: 'France', ar: 'فرنسا', ru: 'Франция' } },
  { code: 'ES', currency: 'EUR', symbol: 'E', flag: 'ES', name: { en: 'Spain', zh: '西班牙', es: 'Espana', fr: 'Espagne', ar: 'إسبانيا', ru: 'Испания' } },
  { code: 'NL', currency: 'EUR', symbol: 'E', flag: 'NL', name: { en: 'Netherlands', zh: '荷兰', es: 'Paises Bajos', fr: 'Pays-Bas', ar: 'هولندا', ru: 'Нидерланды' } },
  { code: 'MX', currency: 'MXN', symbol: '$', flag: 'MX', name: { en: 'Mexico', zh: '墨西哥', es: 'Mexico', fr: 'Mexique', ar: 'المكسيك', ru: 'Мексика' } },
  { code: 'AR', currency: 'ARS', symbol: '$', flag: 'AR', name: { en: 'Argentina', zh: '阿根廷', es: 'Argentina', fr: 'Argentine', ar: 'الأرجنتين', ru: 'Аргентина' } },
  { code: 'CL', currency: 'CLP', symbol: '$', flag: 'CL', name: { en: 'Chile', zh: '智利', es: 'Chile', fr: 'Chili', ar: 'تشيلي', ru: 'Чили' } },
  { code: 'CO', currency: 'COP', symbol: '$', flag: 'CO', name: { en: 'Colombia', zh: '哥伦比亚', es: 'Colombia', fr: 'Colombie', ar: 'كولومبيا', ru: 'Колумбия' } },
  { code: 'PE', currency: 'PEN', symbol: 'S/', flag: 'PE', name: { en: 'Peru', zh: '秘鲁', es: 'Peru', fr: 'Perou', ar: 'بيرو', ru: 'Перу' } },
  { code: 'ZA', currency: 'ZAR', symbol: 'R', flag: 'ZA', name: { en: 'South Africa', zh: '南非', es: 'Sudafrica', fr: 'Afrique du Sud', ar: 'جنوب أفريقيا', ru: 'ЮАР' } },
  { code: 'NG', currency: 'NGN', symbol: 'N', flag: 'NG', name: { en: 'Nigeria', zh: '尼日利亚', es: 'Nigeria', fr: 'Nigeria', ar: 'نيجيريا', ru: 'Нигерия' } },
  { code: 'EG', currency: 'EGP', symbol: 'E', flag: 'EG', name: { en: 'Egypt', zh: '埃及', es: 'Egipto', fr: 'Egypte', ar: 'مصر', ru: 'Египет' } },
  { code: 'SA', currency: 'SAR', symbol: 'S', flag: 'SA', name: { en: 'Saudi Arabia', zh: '沙特阿拉伯', es: 'Arabia Saudita', fr: 'Arabie Saoudite', ar: 'السعودية', ru: 'Саудовская Аравия' } },
  { code: 'RU', currency: 'RUB', symbol: 'R', flag: 'RU', name: { en: 'Russia', zh: '俄罗斯', es: 'Rusia', fr: 'Russie', ar: 'روسيا', ru: 'Россия' } },
  { code: 'UA', currency: 'UAH', symbol: 'H', flag: 'UA', name: { en: 'Ukraine', zh: '乌克兰', es: 'Ucrania', fr: 'Ukraine', ar: 'أوكرانيا', ru: 'Украина' } },
  { code: 'PL', currency: 'PLN', symbol: 'Z', flag: 'PL', name: { en: 'Poland', zh: '波兰', es: 'Polonia', fr: 'Pologne', ar: 'بولندا', ru: 'Польша' } },
  { code: 'SE', currency: 'SEK', symbol: 'K', flag: 'SE', name: { en: 'Sweden', zh: '瑞典', es: 'Suecia', fr: 'Suede', ar: 'السويد', ru: 'Швеция' } },
  { code: 'CH', currency: 'CHF', symbol: 'F', flag: 'CH', name: { en: 'Switzerland', zh: '瑞士', es: 'Suiza', fr: 'Suisse', ar: 'سويسرا', ru: 'Швейцария' } },
  { code: 'PK', currency: 'PKR', symbol: 'R', flag: 'PK', name: { en: 'Pakistan', zh: '巴基斯坦', es: 'Pakistan', fr: 'Pakistan', ar: 'باكستان', ru: 'Пакистан' } },
  { code: 'BD', currency: 'BDT', symbol: 'T', flag: 'BD', name: { en: 'Bangladesh', zh: '孟加拉国', es: 'Bangladesh', fr: 'Bangladesh', ar: 'بنغلاديش', ru: 'Бангладеш' } },
  { code: 'CN', currency: 'CNY', symbol: 'Y', flag: 'CN', name: { en: 'China', zh: '中国', es: 'China', fr: 'Chine', ar: 'الصين', ru: 'Китай' } },
  { code: 'HK', currency: 'HKD', symbol: 'H$', flag: 'HK', name: { en: 'Hong Kong', zh: '香港', es: 'Hong Kong', fr: 'Hong Kong', ar: 'هونغ كونغ', ru: 'Гонконг' } },
  { code: 'TW', currency: 'TWD', symbol: 'T$', flag: 'TW', name: { en: 'Taiwan', zh: '台湾', es: 'Taiwan', fr: 'Taiwan', ar: 'تايوان', ru: 'Тайвань' } },
  { code: 'KE', currency: 'KES', symbol: 'K', flag: 'KE', name: { en: 'Kenya', zh: '肯尼亚', es: 'Kenia', fr: 'Kenya', ar: 'كينيا', ru: 'Кения' } },
  { code: 'GH', currency: 'GHS', symbol: 'C', flag: 'GH', name: { en: 'Ghana', zh: '加纳', es: 'Ghana', fr: 'Ghana', ar: 'غانا', ru: 'Гана' } },
  { code: 'KZ', currency: 'KZT', symbol: 'T', flag: 'KZ', name: { en: 'Kazakhstan', zh: '哈萨克斯坦', es: 'Kazajstan', fr: 'Kazakhstan', ar: 'كازاخستان', ru: 'Казахстан' } },
  { code: 'UZ', currency: 'UZS', symbol: 'S', flag: 'UZ', name: { en: 'Uzbekistan', zh: '乌兹别克斯坦', es: 'Uzbekistan', fr: 'Ouzbekistan', ar: 'أوزبكستان', ru: 'Узбекистан' } },
  { code: 'IL', currency: 'ILS', symbol: 'N', flag: 'IL', name: { en: 'Israel', zh: '以色列', es: 'Israel', fr: 'Israel', ar: 'إسرائيل', ru: 'Израиль' } },
  { code: 'PT', currency: 'EUR', symbol: 'E', flag: 'PT', name: { en: 'Portugal', zh: '葡萄牙', es: 'Portugal', fr: 'Portugal', ar: 'البرتغال', ru: 'Португалия' } },
  { code: 'GR', currency: 'EUR', symbol: 'E', flag: 'GR', name: { en: 'Greece', zh: '希腊', es: 'Grecia', fr: 'Grece', ar: 'اليونان', ru: 'Греция' } },
  { code: 'CZ', currency: 'CZK', symbol: 'K', flag: 'CZ', name: { en: 'Czech Republic', zh: '捷克', es: 'Republica Checa', fr: 'Republique Tcheque', ar: 'التشيك', ru: 'Чехия' } },
]

export const ALL_COUNTRIES = [
  ...PRIORITY_COUNTRIES.map(c => ({ ...c, tier: 'priority' as const })),
  ...STANDARD_COUNTRIES.map(c => ({ ...c, tier: 'standard' as const })),
]

export const COUNTRY_COUNT = ALL_COUNTRIES.length

// Flag emoji helper
export function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1f1a5 + c.charCodeAt(0)))
    .join('')
}

// ============================================================================
// Token Prices
// ============================================================================

export interface TokenPrice {
  symbol: string
  name: string
  mint: string
  priceUsd: number
  change24h: number | null
  marketCap: number | null
  source: string
  lastUpdate: number
}

// ============================================================================
// API Functions
// ============================================================================

const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const FOREX_API = 'https://open.er-api.com/v6/latest/USD'

/** Fetch SOL price from CoinGecko */
export async function fetchSolPrice(): Promise<number> {
  try {
    const resp = await fetch(`${COINGECKO_API}/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`)
    const data = await resp.json()
    return data?.solana?.usd || 0
  } catch {
    return 0
  }
}

/** Fetch USDT price from CoinGecko */
export async function fetchUsdtPrice(): Promise<number> {
  try {
    const resp = await fetch(`${COINGECKO_API}/simple/price?ids=tether&vs_currencies=usd`)
    const data = await resp.json()
    return data?.tether?.usd || 1.0
  } catch {
    return 1.0
  }
}

/** Fetch USDC price from CoinGecko */
export async function fetchUsdcPrice(): Promise<number> {
  try {
    const resp = await fetch(`${COINGECKO_API}/simple/price?ids=usd-coin&vs_currencies=usd`)
    const data = await resp.json()
    return data?.['usd-coin']?.usd || 1.0
  } catch {
    return 1.0
  }
}

/** Fetch 50+ country fiat exchange rates from Forex API */
export async function fetchForexRates(): Promise<Record<string, number>> {
  try {
    const resp = await fetch(FOREX_API)
    const data = await resp.json()
    if (data?.rates) {
      return data.rates
    }
    return {}
  } catch {
    return {}
  }
}

/** Fetch all token prices in parallel */
export async function fetchAllTokenPrices(
  eacoPrice?: number,
  solPriceOverride?: number,
): Promise<TokenPrice[]> {
  const [solPriceFetched, usdtPrice, usdcPrice, forex] = await Promise.all([
    fetchSolPrice(),
    fetchUsdtPrice(),
    fetchUsdcPrice(),
    fetchForexRates(),
  ])

  // Use override if provided (from App.tsx which already fetched it), otherwise use fetched
  const solPrice = solPriceOverride || solPriceFetched

  // Calculate eCNH price from CNY forex rate (1 eCNH ~ 1 CNY)
  const cnyRate = forex['CNY'] || 7.1 // fallback if forex API fails
  const ecnhPriceUsd = cnyRate > 0 ? 1 / cnyRate : 0.139

  const now = Date.now()
  const tokens: TokenPrice[] = [
    {
      symbol: 'SOL',
      name: 'Solana',
      mint: 'So11111111111111111111111111111111111111112',
      priceUsd: solPrice,
      change24h: null,
      marketCap: null,
      source: 'CoinGecko',
      lastUpdate: now,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      priceUsd: usdtPrice,
      change24h: null,
      marketCap: null,
      source: 'CoinGecko',
      lastUpdate: now,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      priceUsd: usdcPrice,
      change24h: null,
      marketCap: null,
      source: 'CoinGecko',
      lastUpdate: now,
    },
    {
      symbol: 'eCNH',
      name: 'e-CNHC',
      mint: '7GQnqthWKa5v2GqXYWhmgWZY5mCRrniwK3Xuinm9GKw5',
      priceUsd: ecnhPriceUsd,
      change24h: null,
      marketCap: null,
      source: 'Forex CNY Rate',
      lastUpdate: now,
    },
    {
      symbol: 'EACO',
      name: 'EACO',
      mint: 'DqfoyZH96RnvZusSp3Cdncjpyp3C74ZmJzGhjmHnDHRH',
      priceUsd: eacoPrice || 0,
      change24h: null,
      marketCap: null,
      source: 'Helius On-chain',
      lastUpdate: now,
    },
  ]

  return tokens
}

/**
 * Get exchange rate for a specific currency relative to a base.
 * baseRate = how many base units per USD
 * targetRate = how many target units per USD
 * Result: 1 base = X target
 */
export function convertRate(basePerUsd: number, targetPerUsd: number): number {
  if (basePerUsd <= 0) return 0
  return targetPerUsd / basePerUsd
}

/**
 * Build complete country rate list with crypto cross-rates.
 * Given token prices and forex rates, compute:
 * - 1 USD = X currency (from forex)
 * - 1 SOL = X currency (solPrice * forexRate)
 */
export function buildCountryRates(
  forexRates: Record<string, number>,
  solPriceUsd: number,
): CountryRate[] {
  const now = Date.now()

  return ALL_COUNTRIES.map(country => {
    const usdRate = forexRates[country.currency] || 0

    return {
      code: country.code,
      name: country.name,
      currency: country.currency,
      currencySymbol: country.symbol,
      flag: flagEmoji(country.flag),
      tier: country.tier,
      usdRate,
      lastUpdate: now,
    }
  })
}

// Base currency options
export type BaseCurrency = 'USD' | 'SOL' | 'USDT' | 'USDC' | 'eCNH' | 'EACO'

export interface BaseCurrencyInfo {
  key: BaseCurrency
  symbol: string
  name: string
  priceUsd: number
}

/**
 * Calculate 1 base = X for each country currency.
 */
export function getRateForBase(
  base: BaseCurrency,
  basePriceUsd: number,
  countryUsdRate: number,
): number {
  if (base === 'USD') return countryUsdRate
  // 1 base = basePriceUsd USD = basePriceUsd * countryUsdRate target
  return basePriceUsd * countryUsdRate
}
