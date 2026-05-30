export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  float: number;
  sector: string;
}

export interface RiskScore {
  overall: number; // 0–100
  level: RiskLevel;
  components: {
    volatility: number;
    dilution: number;
    socialHype: number;
    momentum: number;
    insiderActivity: number;
    shortInterest: number;
  };
}

export interface ReverseSplitEvent {
  date: string;
  ratio: string; // e.g. "1:10"
  priceBefore: number;
  priceAfter: number;
}

export interface DilutionEvent {
  date: string;
  type: "ATM" | "Secondary" | "Warrant" | "Convertible";
  sharesAdded: number;
  priceAtTime: number;
  description: string;
}

export interface NewsItem {
  headline: string;
  source: string;
  publishedAt: string;
  sentiment: "positive" | "neutral" | "negative";
  url: string;
}

export interface SocialSignal {
  platform: "Reddit" | "Twitter" | "StockTwits";
  mentions: number;
  change24h: number;
  sentiment: number; // -1 to 1
  topKeywords: string[];
}

export interface InsiderTransaction {
  name: string;
  title: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
  date: string;
  value: number;
}

export interface TechnicalIndicator {
  rsi: number;
  macd: number;
  macdSignal: number;
  bollingerUpper: number;
  bollingerLower: number;
  sma20: number;
  sma50: number;
  support: number;
  resistance: number;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockAnalysis {
  quote: StockQuote;
  riskScore: RiskScore;
  aiSummary: string;
  volatilityAnalysis: {
    atr: number;
    atrPercent: number;
    historicalVol: number;
    impliedVol: number | null;
    dumpProbability: number; // 0–100
    typicalRetrace: string;
  };
  reverseSplits: ReverseSplitEvent[];
  dilutionEvents: DilutionEvent[];
  news: NewsItem[];
  socialSignals: SocialSignal[];
  insiderTransactions: InsiderTransaction[];
  technicals: TechnicalIndicator;
  priceHistory: PricePoint[];
  shortInterest: {
    shortFloat: number;
    daysToCover: number;
    shortSqueezeScore: number;
  };
  emotionalWarnings: string[];
  catalysts: string[];
  analysisTimestamp: string;
  fundamentals?: FundamentalsData;
  analyst?: AnalystData;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  addedAt: string;
  alertPrice: number | null;
  notes: string;
  riskScore: number;
  currentPrice: number;
  changePercent: number;
}

export interface JournalTrade {
  id: string;
  ticker: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice: number | null;
  shares: number;
  entryDate: string;
  exitDate: string | null;
  emotion: "confident" | "fomo" | "revenge" | "greedy" | "fearful" | "neutral";
  setup: string;
  notes: string;
  screenshotUrl: string | null;
  pnl: number | null;
  riskRewardRatio: number | null;
  mistakes: string[];
  status: "open" | "closed" | "cancelled";
}

export interface TradingStats {
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  totalPnl: number;
  fomoCost: number;
  revengeTradeLoss: number;
  bestSetup: string;
  worstEmotion: string;
}

export interface MarketSentiment {
  fearGreedIndex: number;
  label: string;
  trend: "increasing" | "decreasing" | "stable";
  sectorRotation: string;
}

export interface TrendingStock {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  riskScore: number;
  riskLevel: RiskLevel;
  reason: string;
  volume: number;
}

export interface FundamentalsData {
  peRatio: number | null;
  forwardPE: number | null;
  enterpriseValue: number | null;
  priceToBook: number | null;
  eps: number | null;
  forwardEps: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
  netIncome: number | null;
  isProfit: boolean;
  profitMargin: number | null;
  operatingMargin: number | null;
  grossMargin: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  debtToEquity: number | null;
  freeCashFlow: number | null;
  currentRatio: number | null;
  beta: number | null;
  dividendYield: number | null;
  week52High: number | null;
  week52Low: number | null;
  institutionalOwnership: number | null;
  insiderOwnership: number | null;
  quarterlyEarnings: { date: string; actual: number | null; estimate: number | null }[];
}

export interface AnalystData {
  recommendationKey: string | null;
  recommendationMean: number | null;
  numberOfAnalysts: number;
  targetMeanPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  plan: "free" | "pro" | "elite";
  preferences: {
    riskTolerance: "conservative" | "moderate" | "aggressive";
    defaultTimeframe: string;
    emailAlerts: boolean;
    pushNotifications: boolean;
  };
}
