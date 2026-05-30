import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require("yahoo-finance2").default;
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

function periodConfig(period: string): { period1: Date; interval: string } {
  const now = new Date();
  switch (period) {
    case "1d": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return { period1: d, interval: "5m" };
    }
    case "5d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 5);
      return { period1: d, interval: "30m" };
    }
    case "1m": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return { period1: d, interval: "1d" };
    }
    case "3m": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return { period1: d, interval: "1d" };
    }
    case "6m": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return { period1: d, interval: "1d" };
    }
    case "1y": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return { period1: d, interval: "1d" };
    }
    case "5y": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 5);
      return { period1: d, interval: "1wk" };
    }
    default: {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return { period1: d, interval: "1d" };
    }
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const period = req.nextUrl.searchParams.get("period") ?? "3m";
  const upper = ticker.toUpperCase();
  const { period1, interval } = periodConfig(period);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.chart(upper, { period1, interval });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = ((result?.quotes ?? []) as any[])
      .filter((p: any) => p.close != null)
      .map((p: any) => ({
        date: new Date(p.date).toISOString(),
        open: p.open ?? p.close,
        high: p.high ?? p.close,
        low: p.low ?? p.close,
        close: p.close,
        volume: p.volume ?? 0,
      }));
    return NextResponse.json(quotes);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
