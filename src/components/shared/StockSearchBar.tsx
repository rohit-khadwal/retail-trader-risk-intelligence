"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2 } from "lucide-react";

const POPULAR = ["AAPL", "TSLA", "NVDA", "GME", "AMC", "MULN", "PLTR", "COIN", "META", "AMZN", "MSTR", "HOOD"];

interface Suggestion {
  ticker: string;
  name: string;
  type: string;
  exchange: string;
}

export function StockSearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function go(symbol: string) {
    if (symbol.trim()) {
      router.push(`/analyze/${symbol.trim().toUpperCase()}`);
      setQuery("");
      setSuggestions([]);
      setOpen(false);
    }
  }

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
      setHighlighted(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      go(suggestions[highlighted].ticker);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
        Analyze any stock — search by name or ticker
      </p>
      <div ref={wrapperRef} className="relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (highlighted >= 0 && suggestions[highlighted]) {
              go(suggestions[highlighted].ticker);
            } else {
              go(query);
            }
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search Apple, Tesla, Nvidia… or AAPL, TSLA"
              autoComplete="off"
              className="w-full pl-9 pr-4 h-11 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim()}
            className="h-11 px-5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shrink-0"
          >
            Analyze <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {open && suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={s.ticker}
                type="button"
                onMouseDown={() => go(s.ticker)}
                onMouseEnter={() => setHighlighted(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  highlighted === i ? "bg-white/8" : "hover:bg-white/5"
                }`}
              >
                <span className="font-bold font-mono text-sm text-foreground w-16 shrink-0">{s.ticker}</span>
                <span className="text-sm text-muted-foreground truncate flex-1">{s.name}</span>
                <span className="text-xs text-muted-foreground/60 shrink-0">{s.exchange}</span>
              </button>
            ))}
          </div>
        )}
      </div>

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
