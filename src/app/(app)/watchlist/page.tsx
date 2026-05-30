"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, Loader2, Plus, Search, Star, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

interface Suggestion { ticker: string; name: string; exchange: string }

export default function WatchlistPage() {
  const { items, add, remove, updatePrices, setAlertPrice, has } = useWatchlist();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [alertEditing, setAlertEditing] = useState<string | null>(null);
  const [alertInput, setAlertInput] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch live prices whenever watchlist changes
  useEffect(() => {
    if (!items.length) return;
    const tickers = items.map((i) => i.ticker).join(",");
    setLoadingPrices(true);
    fetch(`/api/quotes?tickers=${tickers}`)
      .then((r) => r.json())
      .then((data) => updatePrices(data))
      .catch(() => {})
      .finally(() => setLoadingPrices(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q) { setSuggestions([]); setDropOpen(false); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setDropOpen(data.length > 0);
    } catch { setSuggestions([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function addItem(ticker: string, name: string) {
    if (!has(ticker)) {
      add(ticker, name);
      fetch(`/api/quotes?tickers=${ticker}`)
        .then((r) => r.json())
        .then((data) => updatePrices(data))
        .catch(() => {});
    }
    setQuery("");
    setSuggestions([]);
    setDropOpen(false);
  }

  function saveAlert(ticker: string) {
    const val = parseFloat(alertInput);
    setAlertPrice(ticker, isNaN(val) ? null : val);
    setAlertEditing(null);
    setAlertInput("");
  }

  const triggeredAlerts = items.filter(
    (i) => i.alertPrice !== null && i.currentPrice > 0 && i.currentPrice <= i.alertPrice
  );
  const highRisk = items.filter((i) => i.riskScore >= 75);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track stocks with live prices & alerts</p>
        </div>
        {loadingPrices && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {triggeredAlerts.length > 0 && (
        <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">Price Alert Triggered</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {triggeredAlerts.map((s) => `${s.ticker} hit your target of ${formatCurrency(s.alertPrice!)}`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {highRisk.length > 0 && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Risk Alert</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {highRisk.map((s) => s.ticker).join(", ")} — high risk detected. Review before trading.
            </p>
          </div>
        </div>
      )}

      {/* Add stock */}
      <div ref={wrapperRef} className="relative">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setDropOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim() && !dropOpen) {
                  addItem(query.trim().toUpperCase(), `${query.trim().toUpperCase()} Inc.`);
                }
                if (e.key === "Escape") setDropOpen(false);
              }}
              placeholder="Search by name or ticker to add…"
              className="w-full pl-9 pr-4 h-10 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => {
              if (suggestions[0]) addItem(suggestions[0].ticker, suggestions[0].name);
              else if (query.trim()) addItem(query.trim().toUpperCase(), `${query.trim().toUpperCase()} Inc.`);
            }}
            disabled={!query.trim()}
            className="p-2.5 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {dropOpen && suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.ticker}
                type="button"
                onMouseDown={() => addItem(s.ticker, s.name)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/8 transition-colors"
              >
                <span className="font-bold font-mono text-sm w-16 shrink-0">{s.ticker}</span>
                <span className="text-sm text-muted-foreground truncate flex-1">{s.name}</span>
                <span className="text-xs text-muted-foreground/60 shrink-0">{s.exchange}</span>
              </button>
            ))}
          </div>
        )}
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
          <div className="text-xs text-muted-foreground">Alerts Set</div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground text-sm">Your watchlist is empty.</p>
            <p className="text-xs text-muted-foreground mt-1">Search for a stock above to start tracking.</p>
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "glass-card rounded-xl p-4",
              item.riskScore >= 75 && "border-red-500/15",
              item.alertPrice !== null && item.currentPrice > 0 && item.currentPrice <= item.alertPrice && "border-emerald-500/15"
            )}
          >
            <div className="flex items-center gap-4">
              <Link href={`/analyze/${item.ticker}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold">{item.ticker}</span>
                  <RiskBadge score={item.riskScore} size="sm" showScore={false} />
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.name}</p>
              </Link>

              <div className="text-right shrink-0">
                {item.currentPrice > 0 ? (
                  <>
                    <div className="font-mono font-semibold text-sm">{formatCurrency(item.currentPrice)}</div>
                    <div className={cn("text-xs font-medium flex items-center justify-end gap-0.5", item.changePercent >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {item.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPercent(item.changePercent)}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">Loading…</div>
                )}
              </div>

              {/* Alert price */}
              <div className="shrink-0">
                {alertEditing === item.ticker ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={alertInput}
                      onChange={(e) => setAlertInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveAlert(item.ticker); if (e.key === "Escape") setAlertEditing(null); }}
                      placeholder="Price"
                      className="w-20 h-7 px-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                    <button onClick={() => saveAlert(item.ticker)} className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setAlertEditing(null)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAlertEditing(item.ticker); setAlertInput(item.alertPrice?.toString() ?? ""); }}
                    className={cn("text-xs px-2 py-1 rounded-lg transition-colors", item.alertPrice ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20" : "bg-white/5 text-muted-foreground hover:text-foreground")}
                  >
                    {item.alertPrice ? `Alert: ${formatCurrency(item.alertPrice)}` : <Bell className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <button
                onClick={() => remove(item.ticker)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
