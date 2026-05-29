import yahooFinance from "yahoo-finance2";
import type { StockAnalysis, PricePoint, NewsItem, RiskScore } from "@/types";
import { computeRiskScore } from "./risk-engine";


export async function fetchStockAnalysis(ticker: string): Promise<StockAnalysis> {
  const upper = ticker.toUpperCase();

  const [quote, summary, history, newsResult] = await Promise.allSettled([
    yahooFinance.quote(upper),
    yahooFinance.quoteSummary(upper, {
      modules: [
        "summaryDetail",
        "defaultKeyStatistics",
        "assetProfile",
        "insiderTransactions",
        "calendarEvents",
      ],
    }),
    yahooFinance.chart(upper, {
      period1: (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d; })(),
      interval: "1d",
    }),
    yahooFinance.search(upper, { newsCount: 6, quotesCount: 0 }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q: any = quote.status === "fulfilled" ? quote.value : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s: any = summary.status === "fulfilled" ? summary.value : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const h: any = history.status === "fulfilled" ? history.value : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const n: any = newsResult.status === "fulfilled" ? newsResult.value : null;

  if (!q) throw new Error(`No quote data found for ${upper}`);

  // Price history
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const priceHistory: PricePoint[] = ((h?.quotes ?? []) as any[])
    .filter((p: any) => p.close != null)
    .map((p: any) => ({
      date: new Date(p.date).toISOString().split("T")[0],
      open: p.open ?? p.close!,
      high: p.high ?? p.close!,
      low: p.low ?? p.close!,
      close: p.close!,
      volume: p.volume ?? 0,
    }));

  // News
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const news: NewsItem[] = ((n?.news ?? []) as any[]).slice(0, 6).map((item: any) => ({
    headline: item.title,
    source: item.publisher,
    publishedAt: new Date((item.providerPublishTime ?? Date.now() / 1000) * 1000).toISOString(),
    sentiment: "neutral" as const,
    url: item.link ?? "#",
  }));

  // Market cap / float
  const marketCap = q.marketCap ?? s?.summaryDetail?.marketCap ?? 0;
  const floatShares = s?.defaultKeyStatistics?.floatShares ?? 0;
  const sharesOutstanding = s?.defaultKeyStatistics?.sharesOutstanding ?? q.sharesOutstanding ?? 0;
  const avgVolume = q.averageDailyVolume3Month ?? q.averageDailyVolume10Day ?? 1;
  const volume = q.regularMarketVolume ?? 0;
  const price = q.regularMarketPrice ?? 0;
  const prevClose = q.regularMarketPreviousClose ?? price;
  const changePercent = q.regularMarketChangePercent ?? 0;
  const shortPercentOfFloat = (s?.defaultKeyStatistics?.shortPercentOfFloat ?? 0) * 100;
  const shortRatio = s?.defaultKeyStatistics?.shortRatio ?? 0;

  // Compute risk
  const riskInput = {
    changePercent,
    volumeRatio: avgVolume > 0 ? volume / avgVolume : 1,
    price,
    marketCap,
    floatShares,
    shortPercentOfFloat,
    priceHistory,
    ticker: upper,
  };
  const riskScore: RiskScore = computeRiskScore(riskInput);

  // Technical indicators from price history
  const closes = priceHistory.map((p) => p.close);
  const sma20 = closes.length >= 20
    ? closes.slice(-20).reduce((a, b) => a + b, 0) / 20
    : price;
  const sma50 = closes.length >= 50
    ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50
    : price;
  const recentCloses = closes.slice(-14);
  const rsi = recentCloses.length >= 2 ? calcRSI(recentCloses) : 50;
  const bb = calcBollinger(closes.slice(-20), price);
  const atr = calcATR(priceHistory.slice(-14));

  // Short squeeze score
  const shortSqueezeScore = Math.min(
    100,
    Math.round(shortPercentOfFloat * 1.5 + (shortRatio > 5 ? 20 : 0))
  );

  // AI summary
  const aiSummary = generateSummary(upper, riskScore, {
    changePercent,
    volumeRatio: riskInput.volumeRatio,
    shortPercentOfFloat,
    marketCap,
    floatShares,
  });

  // Emotional warnings
  const emotionalWarnings = generateWarnings(upper, riskScore, {
    changePercent,
    volumeRatio: riskInput.volumeRatio,
    rsi,
    shortPercentOfFloat,
  });

  return {
    quote: {
      ticker: upper,
      name: q.longName ?? q.shortName ?? upper,
      price,
      change: q.regularMarketChange ?? 0,
      changePercent,
      volume,
      avgVolume,
      marketCap,
      float: floatShares || sharesOutstanding,
      sector: s?.assetProfile?.sector ?? "Unknown",
    },
    riskScore,
    aiSummary,
    volatilityAnalysis: {
      atr: parseFloat(atr.toFixed(2)),
      atrPercent: price > 0 ? parseFloat(((atr / price) * 100).toFixed(2)) : 0,
      historicalVol: calcHistoricalVol(closes),
      impliedVol: null,
      dumpProbability: calcDumpProbability(riskScore.overall, changePercent, riskInput.volumeRatio),
      typicalRetrace: getTypicalRetrace(changePercent, floatShares, marketCap),
    },
    reverseSplits: [],
    dilutionEvents: [],
    news,
    socialSignals: [],
    insiderTransactions: [],
    technicals: {
      rsi: parseFloat(rsi.toFixed(1)),
      macd: 0,
      macdSignal: 0,
      bollingerUpper: parseFloat(bb.upper.toFixed(2)),
      bollingerLower: parseFloat(bb.lower.toFixed(2)),
      sma20: parseFloat(sma20.toFixed(2)),
      sma50: parseFloat(sma50.toFixed(2)),
      support: parseFloat((price * 0.92).toFixed(2)),
      resistance: parseFloat((price * 1.08).toFixed(2)),
    },
    priceHistory,
    shortInterest: {
      shortFloat: parseFloat(shortPercentOfFloat.toFixed(1)),
      daysToCover: parseFloat(shortRatio.toFixed(1)),
      shortSqueezeScore,
    },
    emotionalWarnings,
    catalysts: [],
    analysisTimestamp: new Date().toISOString(),
  };
}

// ── Technical helpers ───────────────────────────────────────────

function calcRSI(closes: number[]): number {
  let gains = 0, losses = 0;
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gains += d; else losses -= d;
  }
  const n = closes.length - 1;
  if (losses === 0) return 100;
  const rs = gains / n / (losses / n);
  return 100 - 100 / (1 + rs);
}

function calcBollinger(closes: number[], price: number) {
  if (closes.length < 2) return { upper: price * 1.05, lower: price * 0.95 };
  const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
  const variance = closes.reduce((a, b) => a + (b - mean) ** 2, 0) / closes.length;
  const std = Math.sqrt(variance);
  return { upper: mean + 2 * std, lower: mean - 2 * std };
}

function calcATR(history: PricePoint[]): number {
  if (history.length < 2) return 0;
  const trs = history.slice(1).map((p, i) => {
    const prev = history[i].close;
    return Math.max(p.high - p.low, Math.abs(p.high - prev), Math.abs(p.low - prev));
  });
  return trs.reduce((a, b) => a + b, 0) / trs.length;
}

function calcHistoricalVol(closes: number[]): number {
  if (closes.length < 10) return 0;
  const returns = closes.slice(1).map((c, i) => Math.log(c / closes[i]));
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  return Math.round(Math.sqrt(variance * 252) * 100);
}

function calcDumpProbability(riskScore: number, changePercent: number, volumeRatio: number): number {
  let prob = riskScore * 0.6;
  if (changePercent > 50) prob += 20;
  else if (changePercent > 20) prob += 10;
  if (volumeRatio > 10) prob += 15;
  else if (volumeRatio > 5) prob += 8;
  return Math.min(95, Math.round(prob));
}

function getTypicalRetrace(changePercent: number, floatShares: number, marketCap: number): string {
  const isLowFloat = floatShares > 0 && floatShares < 10_000_000;
  const isMicro = marketCap > 0 && marketCap < 50_000_000;
  if (changePercent > 100 && (isLowFloat || isMicro)) {
    return "60–80% retracement within 5 days based on comparable low-float spikes";
  }
  if (changePercent > 50) return "30–60% retracement typical after 50%+ moves without fundamental catalyst";
  if (changePercent > 20) return "10–30% pullback common after strong momentum without follow-through";
  return "Normal volatility range — no extreme pattern detected";
}

// ── Risk narrative helpers ──────────────────────────────────────

function generateSummary(
  ticker: string,
  risk: RiskScore,
  data: { changePercent: number; volumeRatio: number; shortPercentOfFloat: number; marketCap: number; floatShares: number }
): string {
  const { overall, level } = risk;
  const { changePercent, volumeRatio, shortPercentOfFloat, marketCap, floatShares } = data;
  const isLowFloat = floatShares > 0 && floatShares < 10_000_000;
  const isMicro = marketCap > 0 && marketCap < 100_000_000;

  if (level === "EXTREME") {
    return `${ticker} is showing extreme risk signals. The ${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}% move on ${volumeRatio.toFixed(1)}x average volume${isLowFloat ? ", combined with a very low float" : ""}, fits a classic momentum pump profile. Stocks with this signature historically retrace sharply. ${shortPercentOfFloat > 15 ? `Short interest at ${shortPercentOfFloat.toFixed(1)}% of float adds squeeze risk but also increases dump velocity on reversal. ` : ""}Risk score: ${overall}/100. Exercise extreme caution.`;
  }
  if (level === "HIGH") {
    return `${ticker} has elevated risk characteristics. ${changePercent > 0 ? `The +${changePercent.toFixed(1)}% move` : `The ${changePercent.toFixed(1)}% move`} with ${volumeRatio.toFixed(1)}x average volume warrants careful position sizing. ${isMicro ? "Micro-cap stocks are especially susceptible to sharp reversals. " : ""}Verify any catalysts before entering. Risk score: ${overall}/100.`;
  }
  if (level === "MEDIUM") {
    return `${ticker} shows moderate risk. Some elevated signals are present but no extreme flags detected. The move is within a range that can be either fundamentally driven or momentum-based. Confirm your thesis before entering. Risk score: ${overall}/100.`;
  }
  return `${ticker} shows relatively low risk signals at this time. The move appears measured with normal volume characteristics. Standard risk management applies. Risk score: ${overall}/100.`;
}

function generateWarnings(
  ticker: string,
  risk: RiskScore,
  data: { changePercent: number; volumeRatio: number; rsi: number; shortPercentOfFloat: number }
): string[] {
  const warnings: string[] = [];
  const { changePercent, volumeRatio, rsi, shortPercentOfFloat } = data;

  if (changePercent > 100) warnings.push(`${ticker} is up ${changePercent.toFixed(0)}% — historically, stocks with 100%+ intraday moves retrace 50–80% within a week.`);
  else if (changePercent > 50) warnings.push(`${ticker} is up ${changePercent.toFixed(0)}% — chasing after this move puts you at the top of the range. Wait for a base to form.`);
  else if (changePercent > 20) warnings.push(`Momentum is elevated. Entering after a ${changePercent.toFixed(0)}% move without a defined exit plan is a common retail mistake.`);

  if (volumeRatio > 10) warnings.push(`Volume is ${volumeRatio.toFixed(0)}x average — extreme volume spikes often mark exhaustion, not continuation.`);
  else if (volumeRatio > 5) warnings.push(`Volume is ${volumeRatio.toFixed(1)}x average. Elevated but watch for a volume fade which often precedes price reversal.`);

  if (rsi > 80) warnings.push(`RSI at ${rsi.toFixed(0)} — severely overbought. Historically mean-reverts sharply from these levels.`);
  else if (rsi > 70) warnings.push(`RSI at ${rsi.toFixed(0)} — overbought territory. Risk/reward for new longs is unfavorable here.`);

  if (shortPercentOfFloat > 30) warnings.push(`Short float at ${shortPercentOfFloat.toFixed(1)}% — heavily shorted. Squeeze potential exists but so does accelerated selling if it fails.`);

  if (risk.level === "EXTREME" || risk.level === "HIGH") {
    warnings.push("Never risk more than 1–2% of your portfolio on high-risk momentum trades. Define your stop loss BEFORE entering.");
  }

  return warnings;
}
