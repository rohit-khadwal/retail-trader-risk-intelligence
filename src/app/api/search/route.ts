import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require("yahoo-finance2").default;
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) return NextResponse.json([]);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.search(q, { quotesCount: 8, newsCount: 0 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = (result?.quotes ?? []) as any[];
    const suggestions = quotes
      .filter((r: any) => r.symbol && (r.quoteType === "EQUITY" || r.quoteType === "ETF"))
      .slice(0, 7)
      .map((r: any) => ({
        ticker: r.symbol as string,
        name: (r.longname ?? r.shortname ?? r.symbol) as string,
        type: (r.quoteType ?? "EQUITY") as string,
        exchange: (r.exchDisp ?? "") as string,
      }));
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
