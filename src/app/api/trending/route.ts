import { NextResponse } from "next/server";
import { getTrendingStocks } from "@/lib/trending";

export async function GET() {
  try {
    const stocks = await getTrendingStocks();
    return NextResponse.json(stocks);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
