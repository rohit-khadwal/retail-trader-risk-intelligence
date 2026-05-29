import type {
  StockAnalysis,
  TrendingStock,
  WatchlistItem,
  JournalTrade,
  TradingStats,
  MarketSentiment,
} from "@/types";

export const mockMarketSentiment: MarketSentiment = {
  fearGreedIndex: 28,
  label: "Fear",
  trend: "decreasing",
  sectorRotation: "Defensive sectors outperforming. Utilities, Healthcare gaining.",
};

export const mockTrendingStocks: TrendingStock[] = [
  {
    ticker: "MULN",
    name: "Mullen Automotive",
    price: 0.42,
    changePercent: 187.3,
    riskScore: 94,
    riskLevel: "EXTREME",
    reason: "Low float spike — high dilution history",
    volume: 284000000,
  },
  {
    ticker: "BBIG",
    name: "Vinco Ventures",
    price: 1.14,
    changePercent: 112.5,
    riskScore: 89,
    riskLevel: "EXTREME",
    reason: "Social hype surge — 8 reverse splits on record",
    volume: 98000000,
  },
  {
    ticker: "MMAT",
    name: "Meta Materials",
    price: 0.78,
    changePercent: 67.1,
    riskScore: 82,
    riskLevel: "HIGH",
    reason: "Momentum chase — no catalyst confirmed",
    volume: 51000000,
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 487.21,
    changePercent: 4.2,
    riskScore: 31,
    riskLevel: "LOW",
    reason: "Earnings beat — institutional accumulation",
    volume: 42000000,
  },
  {
    ticker: "AMC",
    name: "AMC Entertainment",
    price: 5.18,
    changePercent: 38.6,
    riskScore: 77,
    riskLevel: "HIGH",
    reason: "Meme revival — short interest elevated",
    volume: 312000000,
  },
  {
    ticker: "SNDL",
    name: "SNDL Inc.",
    price: 1.93,
    changePercent: 24.7,
    riskScore: 71,
    riskLevel: "HIGH",
    reason: "Cannabis sector hype — heavy dilution history",
    volume: 29000000,
  },
];

export const mockWatchlist: WatchlistItem[] = [
  {
    id: "w1",
    ticker: "AAPL",
    name: "Apple Inc.",
    addedAt: "2025-05-01",
    alertPrice: 190,
    notes: "Watching for breakout above 185",
    riskScore: 22,
    currentPrice: 183.42,
    changePercent: -0.8,
  },
  {
    id: "w2",
    ticker: "TSLA",
    name: "Tesla Inc.",
    addedAt: "2025-05-10",
    alertPrice: null,
    notes: "Monitoring volatility before earnings",
    riskScore: 58,
    currentPrice: 241.17,
    changePercent: 3.1,
  },
  {
    id: "w3",
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    addedAt: "2025-05-15",
    alertPrice: 185,
    notes: "AWS growth story intact",
    riskScore: 28,
    currentPrice: 179.63,
    changePercent: 1.4,
  },
  {
    id: "w4",
    ticker: "MULN",
    name: "Mullen Automotive",
    addedAt: "2025-05-20",
    alertPrice: null,
    notes: "High risk — tracking for educational purposes",
    riskScore: 94,
    currentPrice: 0.42,
    changePercent: 187.3,
  },
];

export const mockJournalTrades: JournalTrade[] = [
  {
    id: "t1",
    ticker: "AMC",
    direction: "long",
    entryPrice: 4.85,
    exitPrice: 3.92,
    shares: 500,
    entryDate: "2025-05-08T09:45:00",
    exitDate: "2025-05-08T14:22:00",
    emotion: "fomo",
    setup: "Momentum breakout",
    notes: "Saw Twitter hype and jumped in without checking risk score. Classic FOMO.",
    screenshotUrl: null,
    pnl: -465,
    riskRewardRatio: 0.4,
    mistakes: ["No stop loss", "Entered at high of day", "FOMO driven"],
    status: "closed",
  },
  {
    id: "t2",
    ticker: "NVDA",
    direction: "long",
    entryPrice: 462.3,
    exitPrice: 487.1,
    shares: 20,
    entryDate: "2025-05-12T10:15:00",
    exitDate: "2025-05-14T11:00:00",
    emotion: "confident",
    setup: "Earnings run-up with strong technicals",
    notes: "Had a plan. Stuck to it. Set stop at 455, target at 490.",
    screenshotUrl: null,
    pnl: 496,
    riskRewardRatio: 2.8,
    mistakes: [],
    status: "closed",
  },
  {
    id: "t3",
    ticker: "MULN",
    direction: "long",
    entryPrice: 0.38,
    exitPrice: null,
    shares: 2000,
    entryDate: "2025-05-20T09:31:00",
    exitDate: null,
    emotion: "greedy",
    setup: "Low float spike",
    notes: "Trying to catch the spike after 150% move. Still holding.",
    screenshotUrl: null,
    pnl: null,
    riskRewardRatio: null,
    mistakes: ["Chasing after 150% move", "No defined exit", "Position too large"],
    status: "open",
  },
  {
    id: "t4",
    ticker: "TSLA",
    direction: "long",
    entryPrice: 225.5,
    exitPrice: 218.3,
    shares: 30,
    entryDate: "2025-05-15T13:20:00",
    exitDate: "2025-05-15T15:45:00",
    emotion: "revenge",
    setup: "Revenge trade after morning loss",
    notes: "Lost on AMC in the morning and immediately traded TSLA to recover. Bad idea.",
    screenshotUrl: null,
    pnl: -216,
    riskRewardRatio: 0.3,
    mistakes: ["Revenge trading", "No setup — emotional entry"],
    status: "closed",
  },
];

export const mockTradingStats: TradingStats = {
  totalTrades: 47,
  winRate: 42,
  avgWin: 387,
  avgLoss: 284,
  profitFactor: 1.21,
  totalPnl: -1840,
  fomoCost: -2340,
  revengeTradeLoss: -890,
  bestSetup: "Earnings run-up with technical confirmation",
  worstEmotion: "fomo",
};

export const generatePriceHistory = (
  basePrice: number,
  days = 90,
  volatility = 0.03
) => {
  const points = [];
  let price = basePrice * 0.6;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * volatility;
    const open = price;
    price = Math.max(price * (1 + change), 0.01);
    const high = Math.max(open, price) * (1 + Math.random() * 0.02);
    const low = Math.min(open, price) * (1 - Math.random() * 0.02);
    points.push({
      date: date.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000 + 5000000),
    });
  }
  return points;
};

export const mockAnalyses: Record<string, StockAnalysis> = {
  MULN: {
    quote: {
      ticker: "MULN",
      name: "Mullen Automotive Inc.",
      price: 0.42,
      change: 0.27,
      changePercent: 187.3,
      volume: 284000000,
      avgVolume: 18000000,
      marketCap: 68000000,
      float: 142000000,
      sector: "Electric Vehicles",
    },
    riskScore: {
      overall: 94,
      level: "EXTREME",
      components: {
        volatility: 97,
        dilution: 98,
        socialHype: 92,
        momentum: 88,
        insiderActivity: 85,
        shortInterest: 61,
      },
    },
    aiSummary:
      "MULN is exhibiting a classic low-float pump pattern. The +187% intraday move on volume 15x the average, combined with a history of 5 dilutive offerings and 3 reverse splits, creates an extremely high retracement risk. This move lacks confirmed fundamental catalysts. Historically, stocks with this exact pattern see 60–80% retracements within 5 trading days. Exercise extreme caution.",
    volatilityAnalysis: {
      atr: 0.18,
      atrPercent: 42.8,
      historicalVol: 312,
      impliedVol: null,
      dumpProbability: 87,
      typicalRetrace: "60–80% within 5 days based on 23 comparable events",
    },
    reverseSplits: [
      { date: "2023-08-14", ratio: "1:9", priceBefore: 0.11, priceAfter: 0.99 },
      { date: "2022-12-01", ratio: "1:10", priceBefore: 0.09, priceAfter: 0.9 },
      { date: "2022-05-20", ratio: "1:25", priceBefore: 0.04, priceAfter: 1.0 },
    ],
    dilutionEvents: [
      {
        date: "2024-03-15",
        type: "ATM",
        sharesAdded: 85000000,
        priceAtTime: 0.38,
        description: "ATM offering — $32M raise at market",
      },
      {
        date: "2023-11-08",
        type: "Secondary",
        sharesAdded: 120000000,
        priceAtTime: 0.52,
        description: "Secondary offering — $62M",
      },
      {
        date: "2023-06-01",
        type: "Warrant",
        sharesAdded: 200000000,
        priceAtTime: 1.2,
        description: "Warrant exercises unlocked",
      },
    ],
    news: [
      {
        headline: "Mullen Automotive surges 180% on social media buzz",
        source: "MarketWatch",
        publishedAt: "2025-05-29T09:15:00",
        sentiment: "neutral",
        url: "#",
      },
      {
        headline: "MULN faces Nasdaq compliance notice for minimum bid price",
        source: "SEC Filing",
        publishedAt: "2025-05-22T16:30:00",
        sentiment: "negative",
        url: "#",
      },
      {
        headline: "Mullen files for additional shelf offering of $100M",
        source: "SEC EDGAR",
        publishedAt: "2025-05-10T10:00:00",
        sentiment: "negative",
        url: "#",
      },
    ],
    socialSignals: [
      {
        platform: "Reddit",
        mentions: 12400,
        change24h: 890,
        sentiment: 0.31,
        topKeywords: ["moon", "squeeze", "short interest", "10x"],
      },
      {
        platform: "Twitter",
        mentions: 28700,
        change24h: 1240,
        sentiment: 0.28,
        topKeywords: ["MULN", "EV play", "breakout"],
      },
      {
        platform: "StockTwits",
        mentions: 5800,
        change24h: 420,
        sentiment: 0.22,
        topKeywords: ["pump", "run", "dilution risk"],
      },
    ],
    insiderTransactions: [
      {
        name: "David Michery",
        title: "CEO",
        type: "sell",
        shares: 500000,
        price: 1.84,
        date: "2024-01-12",
        value: 920000,
      },
      {
        name: "Jonathan New",
        title: "CFO",
        type: "sell",
        shares: 200000,
        price: 1.21,
        date: "2023-09-08",
        value: 242000,
      },
    ],
    technicals: {
      rsi: 89.4,
      macd: 0.12,
      macdSignal: 0.04,
      bollingerUpper: 0.48,
      bollingerLower: 0.21,
      sma20: 0.31,
      sma50: 0.29,
      support: 0.28,
      resistance: 0.51,
    },
    priceHistory: generatePriceHistory(0.42, 90, 0.08),
    shortInterest: {
      shortFloat: 18.4,
      daysToCover: 1.2,
      shortSqueezeScore: 38,
    },
    emotionalWarnings: [
      "Historically, stocks with +150% intraday moves and this float profile retrace 60–80% within 5 days.",
      "High dilution risk detected — 3 ATM/secondary offerings in the past 18 months.",
      "Social hype is at extreme levels. Retail sentiment often peaks near local tops.",
      "3 reverse splits on record — this pattern is associated with long-term value destruction.",
      "Insider selling detected. Insiders have sold $1.16M in the past 18 months.",
      "RSI at 89 — severely overbought. Historically mean-reverts sharply from these levels.",
    ],
    catalysts: [
      "No confirmed fundamental catalyst identified",
      "Nasdaq compliance notice may trigger forced selling pressure",
    ],
    analysisTimestamp: new Date().toISOString(),
  },
  NVDA: {
    quote: {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      price: 487.21,
      change: 19.72,
      changePercent: 4.2,
      volume: 42000000,
      avgVolume: 38000000,
      marketCap: 1210000000000,
      float: 2460000000,
      sector: "Semiconductors",
    },
    riskScore: {
      overall: 31,
      level: "LOW",
      components: {
        volatility: 38,
        dilution: 5,
        socialHype: 42,
        momentum: 55,
        insiderActivity: 18,
        shortInterest: 12,
      },
    },
    aiSummary:
      "NVIDIA continues to execute on AI infrastructure demand with strong earnings beats and expanding margins. The +4.2% move is supported by volume near average and institutional accumulation signals. Short interest is minimal. No dilution history. Risk is primarily macro sensitivity and valuation. This is a fundamentally driven move rather than speculative.",
    volatilityAnalysis: {
      atr: 18.4,
      atrPercent: 3.8,
      historicalVol: 48,
      impliedVol: 52,
      dumpProbability: 14,
      typicalRetrace: "8–15% corrections are normal in bull trends",
    },
    reverseSplits: [],
    dilutionEvents: [],
    news: [
      {
        headline: "NVIDIA beats Q1 estimates, raises full-year guidance",
        source: "Bloomberg",
        publishedAt: "2025-05-28T16:05:00",
        sentiment: "positive",
        url: "#",
      },
      {
        headline: "Data center revenue surges 142% year-over-year",
        source: "Reuters",
        publishedAt: "2025-05-28T17:00:00",
        sentiment: "positive",
        url: "#",
      },
    ],
    socialSignals: [
      {
        platform: "Twitter",
        mentions: 44200,
        change24h: 280,
        sentiment: 0.71,
        topKeywords: ["earnings", "AI", "data center", "guidance"],
      },
      {
        platform: "Reddit",
        mentions: 8900,
        change24h: 120,
        sentiment: 0.68,
        topKeywords: ["hold", "long term", "AI infrastructure"],
      },
      {
        platform: "StockTwits",
        mentions: 9100,
        change24h: 310,
        sentiment: 0.74,
        topKeywords: ["bull", "target", "breakout"],
      },
    ],
    insiderTransactions: [
      {
        name: "Jensen Huang",
        title: "CEO",
        type: "sell",
        shares: 120000,
        price: 461.2,
        date: "2025-04-15",
        value: 55344000,
      },
    ],
    technicals: {
      rsi: 62.1,
      macd: 8.4,
      macdSignal: 6.1,
      bollingerUpper: 498,
      bollingerLower: 431,
      sma20: 461,
      sma50: 438,
      support: 455,
      resistance: 502,
    },
    priceHistory: generatePriceHistory(487.21, 90, 0.025),
    shortInterest: {
      shortFloat: 1.8,
      daysToCover: 2.1,
      shortSqueezeScore: 11,
    },
    emotionalWarnings: [
      "Post-earnings euphoria can lead to chasing. Wait for a pullback to key support.",
    ],
    catalysts: [
      "Q1 FY26 earnings beat — EPS $6.12 vs $5.58 expected",
      "Data center revenue $22.6B vs $21.1B expected",
      "Raised full-year guidance by 18%",
      "Blackwell GPU demand ahead of schedule",
    ],
    analysisTimestamp: new Date().toISOString(),
  },
};

export function getMockAnalysis(ticker: string): StockAnalysis {
  const upper = ticker.toUpperCase();
  if (mockAnalyses[upper]) return mockAnalyses[upper];

  const price = Math.random() * 50 + 1;
  const changePercent = (Math.random() - 0.3) * 40;
  const riskScore = Math.floor(Math.random() * 60 + 20);

  return {
    quote: {
      ticker: upper,
      name: `${upper} Inc.`,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat((price * changePercent / 100).toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 20000000 + 1000000),
      avgVolume: Math.floor(Math.random() * 15000000 + 1000000),
      marketCap: Math.floor(Math.random() * 500000000 + 10000000),
      float: Math.floor(Math.random() * 100000000 + 5000000),
      sector: "Unknown",
    },
    riskScore: {
      overall: riskScore,
      level: riskScore >= 75 ? "HIGH" : riskScore >= 50 ? "MEDIUM" : "LOW",
      components: {
        volatility: Math.floor(Math.random() * 80 + 10),
        dilution: Math.floor(Math.random() * 60),
        socialHype: Math.floor(Math.random() * 70 + 10),
        momentum: Math.floor(Math.random() * 80 + 10),
        insiderActivity: Math.floor(Math.random() * 50),
        shortInterest: Math.floor(Math.random() * 60),
      },
    },
    aiSummary: `Analysis for ${upper} is based on available market data. No extreme risk flags detected at this time. Please verify with your own research before trading.`,
    volatilityAnalysis: {
      atr: parseFloat((price * 0.03).toFixed(2)),
      atrPercent: 3.2,
      historicalVol: Math.floor(Math.random() * 80 + 20),
      impliedVol: Math.floor(Math.random() * 60 + 20),
      dumpProbability: Math.floor(Math.random() * 50 + 10),
      typicalRetrace: "10–25% corrections typical at current momentum",
    },
    reverseSplits: [],
    dilutionEvents: [],
    news: [],
    socialSignals: [],
    insiderTransactions: [],
    technicals: {
      rsi: parseFloat((Math.random() * 60 + 30).toFixed(1)),
      macd: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      macdSignal: parseFloat((Math.random() * 1.5 - 0.75).toFixed(2)),
      bollingerUpper: parseFloat((price * 1.08).toFixed(2)),
      bollingerLower: parseFloat((price * 0.92).toFixed(2)),
      sma20: parseFloat((price * 0.97).toFixed(2)),
      sma50: parseFloat((price * 0.94).toFixed(2)),
      support: parseFloat((price * 0.9).toFixed(2)),
      resistance: parseFloat((price * 1.1).toFixed(2)),
    },
    priceHistory: generatePriceHistory(price, 90, 0.03),
    shortInterest: {
      shortFloat: parseFloat((Math.random() * 20).toFixed(1)),
      daysToCover: parseFloat((Math.random() * 5 + 0.5).toFixed(1)),
      shortSqueezeScore: Math.floor(Math.random() * 60),
    },
    emotionalWarnings: [],
    catalysts: [],
    analysisTimestamp: new Date().toISOString(),
  };
}
