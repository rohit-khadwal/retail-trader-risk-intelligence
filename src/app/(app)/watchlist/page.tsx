"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bell, Search, Star, Trash2, TrendingUp } from "lucide-react";
import { mockWatchlist } from "@/lib/mock-data/stocks";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

export default function WatchlistPage() {
  const [items, setItems] = useState(mockWatchlist);
  const [ticker, setTicker] = useState("");

  function removeTicker(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const highRisk = items.filter((i) => i.riskScore >= 75);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor stocks with real-time risk alerts
        </p>
      </div>

      {highRisk.length > 0 && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Risk Alert</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {highRisk.map((s) => s.ticker).join(", ")} — extreme risk levels. Review before trading.
            </p>
          </div>
        </div>
      )}

      {/* Add ticker */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Add ticker (e.g. AAPL)"
            className="pl-9 bg-white/5 border-white/10"
            onKeyDown={(e) => {
              if (e.key === "Enter" && ticker.trim()) {
                const exists = items.find((i) => i.ticker === ticker.trim());
                if (!exists) {
                  setItems((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      ticker: ticker.trim(),
                      name: `${ticker.trim()} Inc.`,
                      addedAt: new Date().toISOString().slice(0, 10),
                      alertPrice: null,
                      notes: "",
                      riskScore: 40,
                      currentPrice: 0,
                      changePercent: 0,
                    },
                  ]);
                }
                setTicker("");
              }
            }}
          />
        </div>
        <button
          onClick={() => {
            if (ticker.trim()) {
              const exists = items.find((i) => i.ticker === ticker.trim());
              if (!exists) {
                setItems((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    ticker: ticker.trim(),
                    name: `${ticker.trim()} Inc.`,
                    addedAt: new Date().toISOString().slice(0, 10),
                    alertPrice: null,
                    notes: "",
                    riskScore: 40,
                    currentPrice: 0,
                    changePercent: 0,
                  },
                ]);
              }
              setTicker("");
            }
          }}
          className="p-2 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">{items.length}</div>
          <div className="text-xs text-muted-foreground">Tracked</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{highRisk.length}</div>
          <div className="text-xs text-muted-foreground">High Risk</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {items.filter((i) => i.alertPrice !== null).length}
          </div>
          <div className="text-xs text-muted-foreground">With Alerts</div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground text-sm">Your watchlist is empty.</p>
            <p className="text-xs text-muted-foreground mt-1">Add a ticker above to start tracking.</p>
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className={cn(
            "glass-card rounded-xl p-4 flex items-center gap-4",
            item.riskScore >= 75 && "border-red-500/15"
          )}>
            <Link href={`/analyze/${item.ticker}`} className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{item.ticker}</span>
                <RiskBadge score={item.riskScore} size="sm" showScore={false} />
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.name}</p>
              {item.notes && (
                <p className="text-xs text-muted-foreground/70 mt-1 italic truncate">{item.notes}</p>
              )}
            </Link>
            <div className="text-right shrink-0">
              {item.currentPrice > 0 ? (
                <>
                  <div className="font-mono font-semibold text-sm">{formatCurrency(item.currentPrice)}</div>
                  <div className={cn("text-xs font-medium flex items-center justify-end gap-0.5", item.changePercent >= 0 ? "text-emerald-400" : "text-red-400")}>
                    <TrendingUp className="w-3 h-3" />
                    {formatPercent(item.changePercent)}
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground">No data</div>
              )}
            </div>
            <button
              onClick={() => removeTicker(item.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
