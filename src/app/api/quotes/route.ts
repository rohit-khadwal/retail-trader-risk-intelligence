import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require("yahoo-finance2").default;
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("tickers") ?? "";
  const tickers = raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 30);

  if (!tickers.length) return NextResponse.json({});

  const results = await Promise.allSettled(tickers.map((t) => yf.quote(t)));
  const out: Record<string, { price: number; changePercent: number; name: string }> = {};

  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q: any = r.value;
      if (q?.regularMarketPrice) {
        out[tickers[i]] = {
          price: q.regularMarketPrice,
          changePercent: q.regularMarketChangePercent ?? 0,
          name: q.longName ?? q.shortName ?? tickers[i],
        };
      }
    }
  });

  return NextResponse.json(out);
}
