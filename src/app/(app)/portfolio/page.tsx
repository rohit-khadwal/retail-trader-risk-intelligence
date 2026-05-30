"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Briefcase, Loader2, Plus, Search, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

interface Suggestion { ticker: string; name: string; exchange: string }

export default function PortfolioPage() {
  const { positions, addPosition, removePosition, updatePrices, totalValue, totalPnl, totalPnlPct } = usePortfolio();
  const [query, setQuery] = useState("");
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [searching, setSearching] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [formError, setFormError] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!positions.length) return;
    const tickers = positions.map((p) => p.ticker).join(",");
    setLoadingPrices(true);
    fetch(`/api/quotes?tickers=${tickers}`)
      .then((r) => r.json())
      .then((data) => updatePrices(data))
      .catch(() => {})
      .finally(() => setLoadingPrices(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.length]);

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

  function pickSuggestion(s: Suggestion) {
    setSelected(s);
    setQuery(`${s.ticker} — ${s.name}`);
    setDropOpen(false);
  }

  function submit() {
    const ticker = selected?.ticker ?? query.trim().toUpperCase();
    const name = selected?.name ?? ticker;
    const sharesNum = parseFloat(shares);
    const costNum = parseFloat(avgCost);

    if (!ticker) { setFormError("Enter a ticker."); return; }
    if (isNaN(sharesNum) || sharesNum <= 0) { setFormError("Enter valid share count."); return; }
    if (isNaN(costNum) || costNum <= 0) { setFormError("Enter valid avg cost."); return; }

    addPosition(ticker, name, sharesNum, costNum);
    fetch(`/api/quotes?tickers=${ticker}`)
      .then((r) => r.json())
      .then((data) => updatePrices(data))
      .catch(() => {});

    setQuery(""); setShares(""); setAvgCost(""); setSelected(null); setFormError("");
  }

  const totalCostBasis = positions.reduce((s, p) => s + p.avgCost * p.shares, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your positions and overall P&L</p>
        </div>
        {loadingPrices && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Portfolio summary */}
      {positions.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Portfolio Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total Value</div>
              <div className="text-2xl font-bold font-mono">{formatCurrency(totalValue)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Cost Basis</div>
              <div className="text-2xl font-bold font-mono text-muted-foreground">{formatCurrency(totalCostBasis)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
              <div className={cn("text-2xl font-bold font-mono", totalPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
              </div>
              <div className={cn("text-xs font-medium", totalPnlPct >= 0 ? "text-emerald-400" : "text-red-400")}>
                {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add position form */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold">Add Position</h2>

        <div ref={wrapperRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              onFocus={() => suggestions.length > 0 && setDropOpen(true)}
              placeholder="Search stock by name or ticker…"
              className="w-full pl-9 pr-4 h-10 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
            />
          </div>
          {dropOpen && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              {suggestions.map((s) => (
                <button key={s.ticker} type="button" onMouseDown={() => pickSuggestion(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/8 transition-colors">
                  <span className="font-bold font-mono text-sm w-16 shrink-0">{s.ticker}</span>
                  <span className="text-sm text-muted-foreground truncate flex-1">{s.name}</span>
                  <span className="text-xs text-muted-foreground/60 shrink-0">{s.exchange}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Shares</label>
            <input
              type="number" min="0" step="1"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="100"
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Avg Cost / Share ($)</label>
            <input
              type="number" min="0" step="0.01"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              placeholder="150.00"
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
            />
          </div>
        </div>

        {shares && avgCost && (
          <div className="text-xs text-muted-foreground px-1">
            Position size: <span className="text-foreground font-mono font-medium">{formatCurrency(parseFloat(shares) * parseFloat(avgCost))}</span>
          </div>
        )}

        {formError && <p className="text-xs text-red-400">{formError}</p>}

        <button
          onClick={submit}
          className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add to Portfolio
        </button>
      </div>

      {/* Positions */}
      {positions.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">No positions yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first position above to track your portfolio.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Positions</h2>
          {positions.map((pos) => {
            const currentVal = (pos.currentPrice || pos.avgCost) * pos.shares;
            const costVal = pos.avgCost * pos.shares;
            const pnl = currentVal - costVal;
            const pnlPct = costVal > 0 ? (pnl / costVal) * 100 : 0;
            const hasPrice = pos.currentPrice > 0;
            const isUp = pnl >= 0;

            return (
              <div key={pos.id} className={cn("glass-card rounded-xl p-4", !isUp && hasPrice && "border-red-500/10")}>
                <div className="flex items-center gap-4">
                  <Link href={`/analyze/${pos.ticker}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold font-mono">{pos.ticker}</span>
                      <span className="text-xs text-muted-foreground">{pos.shares.toLocaleString()} shares</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{pos.name}</p>
                  </Link>

                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="text-sm font-mono font-semibold">{formatCurrency(currentVal)}</div>
                    {hasPrice && (
                      <div className={cn("text-xs font-medium flex items-center justify-end gap-1", isUp ? "text-emerald-400" : "text-red-400")}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}{formatCurrency(pnl)} ({formatPercent(pnlPct)})
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">Avg: {formatCurrency(pos.avgCost)}</div>
                  </div>

                  {hasPrice && (
                    <div className={cn("text-right shrink-0", isUp ? "text-emerald-400" : "text-red-400")}>
                      <div className="text-sm font-mono font-bold">{formatCurrency(pos.currentPrice)}</div>
                      <div className="text-xs">{formatPercent(pos.changePercent)}</div>
                    </div>
                  )}

                  <button
                    onClick={() => removePosition(pos.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
