import { NextRequest, NextResponse } from "next/server";
import { fetchStockAnalysis } from "@/lib/market-data";

// In-memory cache: ticker → { data, expiresAt }
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upper = ticker.toUpperCase();

  const cached = cache.get(upper);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const analysis = await fetchStockAnalysis(upper);
    cache.set(upper, { data: analysis, expiresAt: Date.now() + CACHE_TTL });
    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch data";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
