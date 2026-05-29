// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require("yahoo-finance2").default;
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
import { computeRiskScore } from "./risk-engine";
import type { TrendingStock } from "@/types";

const SCAN_TICKERS = [
  "GME", "AMC", "MULN", "MMAT", "SNDL",
  "NVDA", "TSLA", "AAPL", "META", "AMZN",
  "PLTR", "SOFI", "NIO", "MARA", "RIOT",
  "COIN", "HOOD", "LCID", "RIVN", "SPY",
];

let cache: { data: TrendingStock[]; expiresAt: number } | null = null;

export async function getTrendingStocks(): Promise<TrendingStock[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;

  const results = await Promise.allSettled(
    SCAN_TICKERS.map((t) => yf.quote(t))
  );

  const stocks: TrendingStock[] = results
    .map((r, i) => {
      if (r.status !== "fulfilled" || !r.value) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q: any = r.value;
      if (!q.regularMarketPrice) return null;
      const changePercent = q.regularMarketChangePercent ?? 0;
      const volume = q.regularMarketVolume ?? 0;
      const avgVolume = q.averageDailyVolume3Month ?? 1;
      const marketCap = q.marketCap ?? 0;
      const floatShares = q.sharesOutstanding ?? 0;
      const price = q.regularMarketPrice ?? 0;

      const riskScore = computeRiskScore({
        ticker: SCAN_TICKERS[i],
        changePercent,
        volumeRatio: volume / avgVolume,
        price,
        marketCap,
        floatShares,
        shortPercentOfFloat: 0,
        priceHistory: [],
      });

      return {
        ticker: SCAN_TICKERS[i],
        name: q.longName ?? q.shortName ?? SCAN_TICKERS[i],
        price,
        changePercent,
        riskScore: riskScore.overall,
        riskLevel: riskScore.level,
        reason: getReason(changePercent, volume / avgVolume, marketCap, riskScore.level),
        volume,
      } satisfies TrendingStock;
    })
    .filter((s): s is TrendingStock => s !== null)
    .sort((a, b) => b.riskScore - a.riskScore);

  cache = { data: stocks, expiresAt: Date.now() + 10 * 60 * 1000 };
  return stocks;
}

function getReason(changePercent: number, volRatio: number, _marketCap: number, level: string): string {
  if (level === "EXTREME") {
    if (changePercent > 50) return `+${changePercent.toFixed(0)}% spike — low float pump pattern`;
    if (volRatio > 10) return `${volRatio.toFixed(0)}x volume surge — abnormal activity`;
    return "Multiple extreme risk signals active";
  }
  if (level === "HIGH") {
    if (changePercent > 20) return `+${changePercent.toFixed(0)}% momentum move — elevated risk`;
    if (volRatio > 5) return `${volRatio.toFixed(1)}x avg volume — watch for reversal`;
    return "Elevated volatility — trade with caution";
  }
  if (changePercent > 5) return `+${changePercent.toFixed(1)}% — fundamentally driven move`;
  if (changePercent < -5) return `${changePercent.toFixed(1)}% — watch support levels`;
  return "Normal trading activity";
}
