import type { RiskScore, PricePoint } from "@/types";

interface RiskInput {
  ticker: string;
  changePercent: number;
  volumeRatio: number;
  price: number;
  marketCap: number;
  floatShares: number;
  shortPercentOfFloat: number;
  priceHistory: PricePoint[];
}

export function computeRiskScore(input: RiskInput): RiskScore {
  const { changePercent, volumeRatio, price, marketCap, floatShares, shortPercentOfFloat, priceHistory } = input;

  // ── Volatility score (0–100) ──────────────────────────────────
  let volatility = 0;
  const absChange = Math.abs(changePercent);
  if (absChange > 100) volatility = 95;
  else if (absChange > 50) volatility = 80;
  else if (absChange > 30) volatility = 65;
  else if (absChange > 20) volatility = 50;
  else if (absChange > 10) volatility = 35;
  else if (absChange > 5) volatility = 20;
  else volatility = 10;

  // Volume spike adds to volatility
  if (volumeRatio > 15) volatility = Math.min(100, volatility + 20);
  else if (volumeRatio > 10) volatility = Math.min(100, volatility + 12);
  else if (volumeRatio > 5) volatility = Math.min(100, volatility + 6);

  // ── Dilution score (proxy via market cap + float) ─────────────
  let dilution = 0;
  if (marketCap > 0 && marketCap < 10_000_000) dilution = 90;
  else if (marketCap > 0 && marketCap < 50_000_000) dilution = 70;
  else if (marketCap > 0 && marketCap < 200_000_000) dilution = 45;
  else if (marketCap > 0 && marketCap < 1_000_000_000) dilution = 20;
  else dilution = 5;

  if (price < 1) dilution = Math.min(100, dilution + 20);
  else if (price < 5) dilution = Math.min(100, dilution + 10);

  // ── Social hype score (proxy via vol ratio + change) ──────────
  let socialHype = 0;
  const hypeSignal = (absChange * 0.4) + (Math.min(volumeRatio, 20) * 2);
  socialHype = Math.min(100, Math.round(hypeSignal));

  // ── Momentum score ────────────────────────────────────────────
  let momentum = 0;
  if (changePercent > 100) momentum = 95;
  else if (changePercent > 50) momentum = 80;
  else if (changePercent > 30) momentum = 65;
  else if (changePercent > 10) momentum = 45;
  else if (changePercent > 0) momentum = 25;
  else momentum = 10;

  if (volumeRatio > 5) momentum = Math.min(100, momentum + 10);

  // ── Insider activity score (proxy via float + micro-cap) ──────
  let insiderActivity = 0;
  if (floatShares > 0 && floatShares < 5_000_000) insiderActivity = 80;
  else if (floatShares > 0 && floatShares < 20_000_000) insiderActivity = 50;
  else if (marketCap < 100_000_000) insiderActivity = 35;
  else insiderActivity = 15;

  // ── Short interest score ──────────────────────────────────────
  let shortInterest = 0;
  if (shortPercentOfFloat > 40) shortInterest = 80;
  else if (shortPercentOfFloat > 20) shortInterest = 60;
  else if (shortPercentOfFloat > 10) shortInterest = 40;
  else if (shortPercentOfFloat > 5) shortInterest = 20;
  else shortInterest = 5;

  // ── Historical volatility penalty ─────────────────────────────
  if (priceHistory.length >= 20) {
    const closes = priceHistory.map((p) => p.close);
    const returns = closes.slice(1).map((c, i) => Math.log(c / closes[i]));
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
    const annualVol = Math.sqrt(variance * 252) * 100;
    if (annualVol > 300) volatility = Math.min(100, volatility + 15);
    else if (annualVol > 150) volatility = Math.min(100, volatility + 8);
  }

  // ── Weighted overall score ─────────────────────────────────────
  const weights = {
    volatility: 0.30,
    dilution: 0.15,
    socialHype: 0.15,
    momentum: 0.20,
    insiderActivity: 0.10,
    shortInterest: 0.10,
  };

  const overall = Math.round(
    volatility * weights.volatility +
    dilution * weights.dilution +
    socialHype * weights.socialHype +
    momentum * weights.momentum +
    insiderActivity * weights.insiderActivity +
    shortInterest * weights.shortInterest
  );

  const level =
    overall >= 75 ? "EXTREME" :
    overall >= 50 ? "HIGH" :
    overall >= 25 ? "MEDIUM" :
    "LOW";

  return {
    overall,
    level,
    components: {
      volatility: Math.round(volatility),
      dilution: Math.round(dilution),
      socialHype: Math.round(socialHype),
      momentum: Math.round(momentum),
      insiderActivity: Math.round(insiderActivity),
      shortInterest: Math.round(shortInterest),
    },
  };
}
