/**
 * i18n - 6 UN languages: en, zh, es, fr, ar, ru
 *
 * Translation keys for EACO 50 Country Oracle Rate
 */

export type Lang = 'en' | 'zh' | 'es' | 'fr' | 'ar' | 'ru'

export interface LangInfo {
  code: Lang
  native: string
  label: string
  dir: 'ltr' | 'rtl'
}

export const LANGUAGES: LangInfo[] = [
  { code: 'zh', native: '中文', label: 'Chinese', dir: 'ltr' },
  { code: 'en', native: 'English', label: 'English', dir: 'ltr' },
  { code: 'es', native: 'Espanol', label: 'Spanish', dir: 'ltr' },
  { code: 'fr', native: 'Francais', label: 'French', dir: 'ltr' },
  { code: 'ar', native: 'عربي', label: 'Arabic', dir: 'rtl' },
  { code: 'ru', native: 'Русский', label: 'Russian', dir: 'ltr' },
]

export interface Translation {
  title: string
  subtitle: string
  badge: string
  oracleSyncing: string
  nextUpdate: string
  lastUpdate: string
  refresh: string
  coreTokens: string
  coreTokensDesc: string
  updated: string
  countryPanel: string
  live: string
  country: string
  tier: string
  currency: string
  perUsd: string
  perSol: string
  priorityCountries: string
  standardCountries: string
  allCountries: string
  baseCurrency: string
  tokenPrice: string
  source: string
  marketCap: string
  change24h: string
  heliusApi: string
  heliusDesc: string
  rpc: string
  das: string
  wallet: string
  webSocket: string
  priorityFee: string
  enhancedTx: string
  status: string
  online: string
  offline: string
  contract: string
  contractAddr: string
  tokenInfo: string
  supply: string
  decimals: string
  holders: string
  poolMonitor: string
  poolName: string
  dex: string
  liquidity: string
  active: string
  inactive: string
  impliedPrice: string
  reserve: string
  walletLookup: string
  walletLookupDesc: string
  enterAddress: string
  query: string
  querying: string
  solBalance: string
  tokenBalances: string
  totalValue: string
  txHistory: string
  transfers: string
  noData: string
  noResults: string
  invalidAddress: string
  poweredBy: string
  disclaimer: string
  dataRefOnly: string
  installApp: string
  installDesc: string
  refreshInterval: string
  seconds: string
  minutes: string
  search: string
  searchCountry: string
  showing: string
  results: string
  noPools: string
  connectWallet: string
  disconnect: string
  connecting: string
  balance: string
  copy: string
  copied: string
  viewOn: string
  solscan: string
  explorer: string
  oklink: string
  coingecko: string
  orbmarkets: string
  heliusDocs: string
  apiReference: string
  websocketConnected: string
  websocketDisconnected: string
  feeEstimate: string
  networkFee: string
  parsedTx: string
  signature: string
  timestamp: string
  type: string
  fee: string
  description: string
}

const en: Translation = {
  title: 'EACO 50 Country Oracle Rate',
  subtitle: 'Solana Chain FX Oracle - Real-time Reference Exchange Rates',
  badge: 'E50',
  oracleSyncing: 'ORACLE SYNCING',
  nextUpdate: 'Next Update',
  lastUpdate: 'Last Update',
  refresh: 'Refresh Now',
  coreTokens: 'Core Token Real-time Price',
  coreTokensDesc: 'ORACLE FEED',
  updated: 'Updated',
  countryPanel: '50 Countries Trade Rate Panel',
  live: 'LIVE',
  country: 'Country / Region',
  tier: 'Tier',
  currency: 'Currency',
  perUsd: '1 USD =',
  perSol: '1 SOL =',
  priorityCountries: 'EACO Priority 20 Core Countries',
  standardCountries: 'Standard Countries',
  allCountries: 'All Countries',
  baseCurrency: 'Base Currency',
  tokenPrice: 'Token Price',
  source: 'Source',
  marketCap: 'Market Cap',
  change24h: '24h Change',
  heliusApi: 'Helius API Integration',
  heliusDesc: 'Powered by Helius - Solana Infrastructure',
  rpc: 'RPC',
  das: 'DAS API',
  wallet: 'Wallet API',
  webSocket: 'WebSocket',
  priorityFee: 'Priority Fee',
  enhancedTx: 'Enhanced Tx',
  status: 'Status',
  online: 'Online',
  offline: 'Offline',
  contract: 'Contract',
  contractAddr: 'Contract Address',
  tokenInfo: 'Token Info',
  supply: 'Supply',
  decimals: 'Decimals',
  holders: 'Holders',
  poolMonitor: 'EACO Liquidity Pool Monitor',
  poolName: 'Pool Name',
  dex: 'DEX',
  liquidity: 'Liquidity (USD)',
  active: 'Active',
  inactive: 'Inactive',
  impliedPrice: 'Implied Price',
  reserve: 'Reserve',
  walletLookup: 'Wallet Lookup',
  walletLookupDesc: 'Query any Solana wallet via Helius API',
  enterAddress: 'Enter Solana wallet address...',
  query: 'Query',
  querying: 'Querying...',
  solBalance: 'SOL Balance',
  tokenBalances: 'Token Balances',
  totalValue: 'Total Value (USD)',
  txHistory: 'Transaction History',
  transfers: 'Token Transfers',
  noData: 'No data available',
  noResults: 'No results found',
  invalidAddress: 'Invalid Solana address',
  poweredBy: 'Powered by',
  disclaimer: 'All data is for reference only',
  dataRefOnly: 'All data reference only',
  installApp: 'Install App',
  installDesc: 'Add to home screen for quick access',
  refreshInterval: 'Refresh Interval',
  seconds: 's',
  minutes: 'min',
  search: 'Search',
  searchCountry: 'Search country...',
  showing: 'Showing',
  results: 'results',
  noPools: 'No active pools found',
  connectWallet: 'Connect Wallet',
  disconnect: 'Disconnect',
  connecting: 'Connecting...',
  balance: 'Balance',
  copy: 'Copy',
  copied: 'Copied!',
  viewOn: 'View on',
  solscan: 'Solscan',
  explorer: 'Solana Explorer',
  oklink: 'OKLink',
  coingecko: 'CoinGecko',
  orbmarkets: 'Orbmarkets',
  heliusDocs: 'Helius Docs',
  apiReference: 'API Reference',
  websocketConnected: 'WebSocket Connected',
  websocketDisconnected: 'WebSocket Disconnected',
  feeEstimate: 'Priority Fee Estimate',
  networkFee: 'Network Fee',
  parsedTx: 'Parsed Transaction',
  signature: 'Signature',
  timestamp: 'Timestamp',
  type: 'Type',
  fee: 'Fee',
  description: 'Description',
}

const zh: Translation = {
  title: 'EACO 50国预言机汇率',
  subtitle: 'Solana 链上外汇预言机 - 实时参考汇率',
  badge: 'E50',
  oracleSyncing: '预言机同步中',
  nextUpdate: '下次更新',
  lastUpdate: '上次更新',
  refresh: '立即刷新',
  coreTokens: '核心代币实时价格',
  coreTokensDesc: '预言机数据源',
  updated: '更新于',
  countryPanel: '50国外贸汇率面板',
  live: '实时',
  country: '国家/地区',
  tier: '层级',
  currency: '货币',
  perUsd: '1 USD =',
  perSol: '1 SOL =',
  priorityCountries: 'EACO 必选20大核心国家',
  standardCountries: '标准国家',
  allCountries: '全部国家',
  baseCurrency: '基准货币',
  tokenPrice: '代币价格',
  source: '数据源',
  marketCap: '市值',
  change24h: '24h涨跌',
  heliusApi: 'Helius API 集成',
  heliusDesc: '由 Helius 提供动力 - Solana 基础设施',
  rpc: 'RPC',
  das: 'DAS API',
  wallet: '钱包 API',
  webSocket: 'WebSocket',
  priorityFee: '优先费用',
  enhancedTx: '增强交易',
  status: '状态',
  online: '在线',
  offline: '离线',
  contract: '合约',
  contractAddr: '合约地址',
  tokenInfo: '代币信息',
  supply: '供应量',
  decimals: '精度',
  holders: '持有者',
  poolMonitor: 'EACO 流动性池监控',
  poolName: '池名称',
  dex: 'DEX',
  liquidity: '流动性 (USD)',
  active: '活跃',
  inactive: '不活跃',
  impliedPrice: '隐含价格',
  reserve: '储备量',
  walletLookup: '钱包查询',
  walletLookupDesc: '通过 Helius API 查询任意 Solana 钱包',
  enterAddress: '输入 Solana 钱包地址...',
  query: '查询',
  querying: '查询中...',
  solBalance: 'SOL 余额',
  tokenBalances: '代币余额',
  totalValue: '总价值 (USD)',
  txHistory: '交易历史',
  transfers: '代币转账',
  noData: '暂无数据',
  noResults: '未找到结果',
  invalidAddress: '无效的 Solana 地址',
  poweredBy: '由',
  disclaimer: '所有数据仅供参考',
  dataRefOnly: '所有数据仅供参考',
  installApp: '安装应用',
  installDesc: '添加到主屏幕以便快速访问',
  refreshInterval: '刷新间隔',
  seconds: '秒',
  minutes: '分钟',
  search: '搜索',
  searchCountry: '搜索国家...',
  showing: '显示',
  results: '条结果',
  noPools: '未找到活跃池',
  connectWallet: '连接钱包',
  disconnect: '断开连接',
  connecting: '连接中...',
  balance: '余额',
  copy: '复制',
  copied: '已复制!',
  viewOn: '在',
  solscan: 'Solscan 查看',
  explorer: 'Solana 浏览器',
  oklink: 'OKLink',
  coingecko: 'CoinGecko',
  orbmarkets: 'Orbmarkets',
  heliusDocs: 'Helius 文档',
  apiReference: 'API 参考',
  websocketConnected: 'WebSocket 已连接',
  websocketDisconnected: 'WebSocket 已断开',
  feeEstimate: '优先费用估算',
  networkFee: '网络费用',
  parsedTx: '解析交易',
  signature: '签名',
  timestamp: '时间戳',
  type: '类型',
  fee: '费用',
  description: '描述',
}

const es: Translation = {
  ...en,
  title: 'EACO Oracle de Tasa de 50 Paises',
  subtitle: 'Oracle FX en Solana - Tasas de cambio en tiempo real',
  oracleSyncing: 'SINCRONIZANDO ORACLE',
  nextUpdate: 'Proxima actualizacion',
  lastUpdate: 'Ultima actualizacion',
  refresh: 'Actualizar ahora',
  coreTokens: 'Precio en tiempo real de tokens principales',
  coreTokensDesc: 'FEED ORACLE',
  updated: 'Actualizado',
  countryPanel: 'Panel de 50 paises',
  live: 'EN VIVO',
  country: 'Pais / Region',
  tier: 'Nivel',
  currency: 'Moneda',
  priorityCountries: 'EACO 20 paises principales prioritarios',
  standardCountries: 'Paises estandar',
  allCountries: 'Todos los paises',
  baseCurrency: 'Moneda base',
  tokenPrice: 'Precio del token',
  source: 'Fuente',
  heliusApi: 'Integracion API Helius',
  heliusDesc: 'Impulsado por Helius - Infraestructura Solana',
  status: 'Estado',
  online: 'En linea',
  offline: 'Desconectado',
  contract: 'Contrato',
  contractAddr: 'Direccion del contrato',
  tokenInfo: 'Info del token',
  supply: 'Suministro',
  decimals: 'Decimales',
  holders: 'Titulares',
  poolMonitor: 'Monitor de pool de liquidez EACO',
  poolName: 'Nombre del pool',
  liquidity: 'Liquidez (USD)',
  active: 'Activo',
  inactive: 'Inactivo',
  impliedPrice: 'Precio implicito',
  reserve: 'Reserva',
  walletLookup: 'Consulta de billetera',
  walletLookupDesc: 'Consultar cualquier billetera Solana via Helius API',
  enterAddress: 'Ingrese direccion de billetera Solana...',
  query: 'Consultar',
  querying: 'Consultando...',
  solBalance: 'Saldo SOL',
  tokenBalances: 'Saldos de tokens',
  totalValue: 'Valor total (USD)',
  txHistory: 'Historial de transacciones',
  transfers: 'Transferencias de tokens',
  noData: 'Sin datos disponibles',
  noResults: 'No se encontraron resultados',
  invalidAddress: 'Direccion Solana invalida',
  disclaimer: 'Todos los datos son solo de referencia',
  dataRefOnly: 'Todos los datos son solo de referencia',
  installApp: 'Instalar app',
  installDesc: 'Agregar a pantalla de inicio',
  searchCountry: 'Buscar pais...',
  connectWallet: 'Conectar billetera',
  disconnect: 'Desconectar',
  connecting: 'Conectando...',
  copy: 'Copiar',
  copied: 'Copiado!',
}

const fr: Translation = {
  ...en,
  title: 'EACO Oracle de Taux de 50 Pays',
  subtitle: 'Oracle FX sur Solana - Taux de change en temps reel',
  oracleSyncing: 'SYNCHRONISATION ORACLE',
  nextUpdate: 'Prochaine mise a jour',
  lastUpdate: 'Derniere mise a jour',
  refresh: 'Actualiser maintenant',
  coreTokens: 'Prix en temps reel des tokens principaux',
  coreTokensDesc: 'FLUX ORACLE',
  updated: 'Mis a jour',
  countryPanel: 'Panel de 50 pays',
  live: 'EN DIRECT',
  country: 'Pays / Region',
  tier: 'Niveau',
  currency: 'Monnaie',
  priorityCountries: 'EACO 20 pays prioritaires principaux',
  standardCountries: 'Pays standards',
  allCountries: 'Tous les pays',
  baseCurrency: 'Monnaie de base',
  tokenPrice: 'Prix du token',
  source: 'Source',
  heliusApi: 'Integration API Helius',
  heliusDesc: 'Propulse par Helius - Infrastructure Solana',
  status: 'Statut',
  online: 'En ligne',
  offline: 'Hors ligne',
  contract: 'Contrat',
  contractAddr: 'Adresse du contrat',
  tokenInfo: 'Info du token',
  supply: 'Offre',
  decimals: 'Decimales',
  holders: 'Detenteurs',
  poolMonitor: 'Moniteur de pool de liquidite EACO',
  poolName: 'Nom du pool',
  liquidity: 'Liquidite (USD)',
  active: 'Actif',
  inactive: 'Inactif',
  impliedPrice: 'Prix implicite',
  reserve: 'Reserve',
  walletLookup: 'Recherche de portefeuille',
  walletLookupDesc: 'Rechercher n importe quel portefeuille Solana via Helius API',
  enterAddress: 'Entrez l adresse du portefeuille Solana...',
  query: 'Rechercher',
  querying: 'Recherche en cours...',
  solBalance: 'Solde SOL',
  tokenBalances: 'Soldes de tokens',
  totalValue: 'Valeur totale (USD)',
  txHistory: 'Historique des transactions',
  transfers: 'Transferts de tokens',
  noData: 'Aucune donnee disponible',
  noResults: 'Aucun resultat trouve',
  invalidAddress: 'Adresse Solana invalide',
  disclaimer: 'Toutes les donnees sont de reference uniquement',
  dataRefOnly: 'Toutes les donnees sont de reference uniquement',
  installApp: 'Installer l app',
  installDesc: 'Ajouter a l ecran d accueil',
  searchCountry: 'Rechercher un pays...',
  connectWallet: 'Connecter le portefeuille',
  disconnect: 'Deconnecter',
  connecting: 'Connexion...',
  copy: 'Copier',
  copied: 'Copie!',
}

const ar: Translation = {
  ...en,
  title: 'EACO预言机汇率 لـ 50 دولة',
  subtitle: '预言机 FX على Solana - أسعار صرف في الوقت الحقيقي',
  oracleSyncing: 'مزامنة预言机',
  nextUpdate: 'التحديث التالي',
  lastUpdate: 'آخر تحديث',
  refresh: 'تحديث الآن',
  coreTokens: 'أسعار الرموز الرئيسية في الوقت الحقيقي',
  coreTokensDesc: 'تغذية预言机',
  updated: 'تم التحديث',
  countryPanel: 'لوحة 50 دولة',
  live: 'مباشر',
  country: 'الدولة / المنطقة',
  tier: 'المستوى',
  currency: 'العملة',
  priorityCountries: 'EACO 20 دولة رئيسية ذات أولوية',
  standardCountries: 'دول قياسية',
  allCountries: 'جميع الدول',
  baseCurrency: 'العملة الأساسية',
  tokenPrice: 'سعر الرمز',
  source: 'المصدر',
  heliusApi: 'تكامل Helius API',
  heliusDesc: 'مدعوم من Helius - بنية Solana',
  status: 'الحالة',
  online: 'متصل',
  offline: 'غير متصل',
  contract: 'العقد',
  contractAddr: 'عنوان العقد',
  tokenInfo: 'معلومات الرمز',
  supply: 'العرض',
  decimals: 'الكسور العشرية',
  holders: 'الحاملون',
  poolMonitor: 'مراقب تجمع سيولة EACO',
  poolName: 'اسم التجمع',
  liquidity: 'السيولة (USD)',
  active: 'نشط',
  inactive: 'غير نشط',
  impliedPrice: 'السعر الضمني',
  reserve: 'الاحتياطي',
  walletLookup: 'البحث عن المحفظة',
  walletLookupDesc: 'البحث عن أي محفظة Solana عبر Helius API',
  enterAddress: 'أدخل عنوان محفظة Solana...',
  query: 'بحث',
  querying: 'جاري البحث...',
  solBalance: 'رصيد SOL',
  tokenBalances: 'أرصدة الرموز',
  totalValue: 'القيمة الإجمالية (USD)',
  txHistory: 'سجل المعاملات',
  transfers: 'تحويلات الرموز',
  noData: 'لا توجد بيانات متاحة',
  noResults: 'لم يتم العثور على نتائج',
  invalidAddress: 'عنوان Solana غير صالح',
  disclaimer: 'جميع البيانات للمرجع فقط',
  dataRefOnly: 'جميع البيانات للمرجع فقط',
  installApp: 'تثبيت التطبيق',
  installDesc: 'أضف إلى الشاشة الرئيسية',
  searchCountry: 'البحث عن دولة...',
  connectWallet: 'ربط المحفظة',
  disconnect: 'قطع الاتصال',
  connecting: 'جاري الاتصال...',
  copy: 'نسخ',
  copied: 'تم النسخ!',
}

const ru: Translation = {
  ...en,
  title: 'EACO Oracle Kypca 50 CTpaH',
  subtitle: 'Oracle FX Ha Solana - KypcI BaJIIoT B peaJIbHoM BpeMeHn',
  oracleSyncing: 'CNHXPOHN3AlHN9I ORACLE',
  nextUpdate: 'CJIeDyiown o6HoBJIeHne',
  lastUpdate: 'IlocJIeDHee o6HoBJIeHne',
  refresh: 'O6HoBnTb CeiI4ac',
  coreTokens: 'Kypc ocHoBHbIX ToKeHoB B peaJIbHoM BpeMeHn',
  coreTokensDesc: 'ORACLE FEED',
  updated: 'O6HoBJIeHo',
  countryPanel: 'IIaHeJIb 50 CTpaH',
  live: 'BNCTPE',
  country: 'CTpaHa / PefnOH',
  tier: 'YpoBeHb',
  currency: 'BaJIIOTa',
  priorityCountries: 'EACO 20 ocHoBHbIX IIpnOpnTeTHbIX CTpaH',
  standardCountries: 'CTaHDapTHbIe CTpaHbI',
  allCountries: 'Bce CTpaHbI',
  baseCurrency: 'Ba3oBa9I BaJIIOTa',
  tokenPrice: 'LeHa ToKeHa',
  source: 'NCTo4HnK',
  heliusApi: 'NHTerpaLHN9I Helius API',
  heliusDesc: 'Ha ocHoBe Helius - NHdpaCTpyKTypa Solana',
  status: 'CocTo9IHne',
  online: 'OHJIaiiH',
  offline: 'OdnaiiH',
  contract: 'KoHTpaKT',
  contractAddr: 'ADpec KoHTpaKTa',
  tokenInfo: 'NHdopMaLHN9I o ToKeHe',
  supply: 'IIpeDJIo}KeHNe',
  decimals: 'Dec9ITn4HbIe',
  holders: 'BJiaDeJIbLlbI',
  poolMonitor: 'MoHnTop JINKBHocTH EACO',
  poolName: 'HM9I IIyJIa',
  liquidity: 'JINKBHocTb (USD)',
  active: 'aKTNBHbIi',
  inactive: 'HeaKTNBHbIi',
  impliedPrice: 'IIoDpa3yMeBaeMa9I LeHa',
  reserve: 'Pe3epB',
  walletLookup: 'IIoncK KOWIeJIbKa',
  walletLookupDesc: '3aIIpoc JIIo6oro KOWIeJIbKa Solana 4epe3 Helius API',
  enterAddress: 'BBeDNte aDpec KOWIeJIbKa Solana...',
  query: '3aIIpoc',
  querying: '3aIIpoc...',
  solBalance: 'BAJIaHC SOL',
  tokenBalances: 'BAJIaHCbI ToKeHoB',
  totalValue: 'O6IIa9I cTonMocTb (USD)',
  txHistory: 'NcTopn9I TpaH3aKL{NN',
  transfers: 'IIepeBoDbI ToKeHoB',
  noData: 'HeT DaHHbIX',
  noResults: 'Pe3yJIbTaTbI He HaiiDeHbI',
  invalidAddress: 'HeBepHbIi aDpec Solana',
  disclaimer: 'Bce DaHHbIe ToJIbKo DJI9I ccblJIKN',
  dataRefOnly: 'Bce DaHHbIe ToJIbKo DJI9I ccblJIKN',
  installApp: 'YcTaHoBNTb IIpnJIo}KeHNe',
  installDesc: 'Do6aBNTb Ha rJIaBHbIi }KpaH',
  searchCountry: 'IIoncK CTpaHbI...',
  connectWallet: 'IIoDKJIIo4NTb KOWIeJIeK',
  disconnect: 'OTKJIIo4NTb',
  connecting: 'IIoDKJIIO4eHNe...',
  copy: 'KOnNpoBaTb',
  copied: 'CKOnNpoBaHo!',
}

export const translations: Record<Lang, Translation> = { en, zh, es, fr, ar, ru }
