"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

const POPULAR = ["AAPL", "TSLA", "NVDA", "GME", "AMC", "MULN", "PLTR", "COIN", "META", "AMZN", "MSTR", "HOOD"];

export function StockSearchBar() {
  const [ticker, setTicker] = useState("");
  const router = useRouter();

  function go(symbol: string) {
    if (symbol.trim()) {
      router.push(`/analyze/${symbol.trim().toUpperCase()}`);
      setTicker("");
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
        Analyze any stock — enter any ticker
      </p>
      <form onSubmit={(e) => { e.preventDefault(); go(ticker); }} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="e.g. AAPL, TSLA, MULN, MSFT…"
            className="w-full pl-9 pr-4 h-11 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={!ticker.trim()}
          className="h-11 px-5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shrink-0"
        >
          Analyze <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {POPULAR.map((s) => (
          <button
            key={s}
            onClick={() => go(s)}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors font-mono border border-white/8"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
