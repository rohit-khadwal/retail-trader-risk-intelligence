import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
import { computeRiskScore } from "@/lib/risk-engine";
import type { TrendingStock } from "@/types";


// Cache trending for 10 minutes
let trendingCache: { data: TrendingStock[]; expiresAt: number } | null = null;

// Watchlist of small/mid-cap volatile tickers common on retail platforms
const SCAN_TICKERS = [
  "GME", "AMC", "BBBY", "MULN", "MMAT", "SNDL", "BBIG", "CLOV", "WISH",
  "NVDA", "TSLA", "AAPL", "SPY", "QQQ", "META", "AMZN", "PLTR", "SOFI",
  "NIO", "LCID", "RIVN", "HOOD", "COIN", "MARA", "RIOT",
];

export async function GET() {
  if (trendingCache && trendingCache.expiresAt > Date.now()) {
    return NextResponse.json(trendingCache.data);
  }

  try {
    const results = await Promise.allSettled(
      SCAN_TICKERS.map((t) => yahooFinance.quote(t))
    );

    const stocks: TrendingStock[] = results
      .map((r, i) => {
        if (r.status !== "fulfilled") return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const q = r.value as any;
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

        const reason = getReason(changePercent, volume / avgVolume, marketCap, riskScore.level);

        return {
          ticker: SCAN_TICKERS[i],
          name: q.longName ?? q.shortName ?? SCAN_TICKERS[i],
          price,
          changePercent,
          riskScore: riskScore.overall,
          riskLevel: riskScore.level,
          reason,
          volume,
        } satisfies TrendingStock;
      })
      .filter((s): s is TrendingStock => s !== null)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    trendingCache = { data: stocks, expiresAt: Date.now() + 10 * 60 * 1000 };
    return NextResponse.json(stocks);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

function getReason(changePercent: number, volRatio: number, marketCap: number, level: string): string {
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
