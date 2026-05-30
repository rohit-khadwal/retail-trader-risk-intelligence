"use client";

import { useState } from "react";
import {
  AlertTriangle, BookOpen, Brain, CheckCircle, Plus,
  TrendingDown, TrendingUp, X, XCircle,
} from "lucide-react";
import { useJournal } from "@/lib/hooks/useJournal";
import type { JournalTrade } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emotionConfig = {
  confident: { label: "Confident", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  fomo:      { label: "FOMO",       color: "text-red-400",     bg: "bg-red-500/10"     },
  revenge:   { label: "Revenge",    color: "text-red-400",     bg: "bg-red-500/10"     },
  greedy:    { label: "Greedy",     color: "text-orange-400",  bg: "bg-orange-500/10"  },
  fearful:   { label: "Fearful",    color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
  neutral:   { label: "Neutral",    color: "text-muted-foreground", bg: "bg-white/5"   },
};

const EMOTIONS = Object.entries(emotionConfig) as [JournalTrade["emotion"], typeof emotionConfig[keyof typeof emotionConfig]][];

function TradeCard({ trade, onRemove }: { trade: JournalTrade; onRemove: () => void }) {
  const emotion = emotionConfig[trade.emotion];
  const isProfitable = trade.pnl !== null && trade.pnl > 0;
  const isClosed = trade.status === "closed";

  return (
    <div className={cn("glass-card rounded-xl p-4 border", trade.emotion === "fomo" || trade.emotion === "revenge" ? "border-red-500/15" : "border-transparent")}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", trade.direction === "long" ? "bg-emerald-500/15" : "bg-red-500/15")}>
            {trade.direction === "long" ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold">{trade.ticker}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", emotion.bg, emotion.color)}>{emotion.label}</span>
              {trade.status === "open" && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Open</span>}
            </div>
            <div className="text-xs text-muted-foreground">{new Date(trade.entryDate).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isClosed && trade.pnl !== null && (
            <div className={cn("text-lg font-bold font-mono", isProfitable ? "text-emerald-400" : "text-red-400")}>
              {isProfitable ? "+" : ""}{formatCurrency(trade.pnl)}
            </div>
          )}
          {!isClosed && <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-lg font-medium">Open</span>}
          <button onClick={onRemove} className="p-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div><div className="text-xs text-muted-foreground">Entry</div><div className="text-sm font-mono font-medium">{formatCurrency(trade.entryPrice)}</div></div>
        <div><div className="text-xs text-muted-foreground">Exit</div><div className="text-sm font-mono font-medium">{trade.exitPrice ? formatCurrency(trade.exitPrice) : "—"}</div></div>
        <div><div className="text-xs text-muted-foreground">Shares</div><div className="text-sm font-mono font-medium">{trade.shares.toLocaleString()}</div></div>
      </div>

      {trade.notes && <p className="text-xs text-muted-foreground bg-white/3 rounded-lg p-2 mb-3 italic">{trade.notes}</p>}

      {isClosed && trade.pnl !== null && (
        <div className="flex items-center gap-1.5 text-xs">
          {isProfitable
            ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Profitable trade</span></>
            : <><XCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">Loss trade</span></>}
        </div>
      )}
    </div>
  );
}

const today = new Date().toISOString().slice(0, 10);

function emptyForm() {
  return {
    ticker: "",
    direction: "long" as JournalTrade["direction"],
    entryPrice: "",
    exitPrice: "",
    shares: "",
    entryDate: today,
    exitDate: "",
    emotion: "neutral" as JournalTrade["emotion"],
    notes: "",
    isClosed: false,
  };
}

export default function JournalPage() {
  const { trades, addTrade, removeTrade, stats } = useJournal();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");

  function f(key: string, value: string | boolean) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function submit() {
    const ticker = form.ticker.trim().toUpperCase();
    const entryPrice = parseFloat(form.entryPrice);
    const shares = parseFloat(form.shares);

    if (!ticker) { setError("Ticker is required."); return; }
    if (isNaN(entryPrice) || entryPrice <= 0) { setError("Valid entry price required."); return; }
    if (isNaN(shares) || shares <= 0) { setError("Valid share count required."); return; }

    const exitPrice = form.isClosed && form.exitPrice ? parseFloat(form.exitPrice) : null;
    const pnl = exitPrice !== null
      ? (exitPrice - entryPrice) * shares * (form.direction === "long" ? 1 : -1)
      : null;

    addTrade({
      ticker,
      direction: form.direction,
      entryPrice,
      exitPrice,
      shares,
      entryDate: form.entryDate,
      exitDate: form.isClosed && form.exitDate ? form.exitDate : null,
      emotion: form.emotion,
      setup: "",
      notes: form.notes,
      screenshotUrl: null,
      pnl,
      riskRewardRatio: null,
      mistakes: [],
      status: form.isClosed ? "closed" : "open",
    });

    setForm(emptyForm());
    setError("");
    setOpen(false);
  }

  const fomoLoss = Math.abs(stats.fomoCost);
  const revengeLoss = Math.abs(stats.revengeTradeLoss);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Trading Journal</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track trades, emotions, and break bad patterns</p>
      </div>

      {(fomoLoss > 0 || revengeLoss > 0) && (
        <div className="glass-card rounded-2xl p-5 border border-orange-500/15">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-orange-400" />
            <h3 className="font-semibold text-sm">Pattern Analysis</h3>
          </div>
          <div className="space-y-2">
            {fomoLoss > 0 && (
              <div className="flex items-center justify-between bg-red-500/8 border border-red-500/15 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-300">FOMO Trading Cost</p>
                    <p className="text-xs text-muted-foreground">Losses from fear-of-missing-out entries</p>
                  </div>
                </div>
                <span className="text-red-400 font-bold font-mono">-{formatCurrency(fomoLoss)}</span>
              </div>
            )}
            {revengeLoss > 0 && (
              <div className="flex items-center justify-between bg-orange-500/8 border border-orange-500/15 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-300">Revenge Trade Loss</p>
                    <p className="text-xs text-muted-foreground">Losses from trading to recover prior losses</p>
                  </div>
                </div>
                <span className="text-orange-400 font-bold font-mono">-{formatCurrency(revengeLoss)}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Eliminating emotional trades would have saved you <strong className="text-foreground">{formatCurrency(fomoLoss + revengeLoss)}</strong>.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-xl font-bold">{stats.totalTrades}</div>
          <div className="text-xs text-muted-foreground">Total Trades</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className={cn("text-xl font-bold", stats.winRate >= 50 ? "text-emerald-400" : "text-red-400")}>{stats.winRate}%</div>
          <div className="text-xs text-muted-foreground">Win Rate</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className={cn("text-xl font-bold font-mono", stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
            {stats.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(stats.totalPnl))}
          </div>
          <div className="text-xs text-muted-foreground">Total P&L</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className={cn("text-xl font-bold", stats.profitFactor >= 1.5 ? "text-emerald-400" : stats.profitFactor >= 1 ? "text-yellow-400" : "text-red-400")}>
            {stats.profitFactor.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">Profit Factor</div>
        </div>
      </div>

      {/* Log button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full glass-card rounded-2xl p-4 flex items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors border border-primary/20"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Log New Trade</span>
      </button>

      {/* Trade list */}
      <div>
        {trades.length > 0 && (
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recent Trades</h2>
        )}
        <div className="space-y-3">
          {trades.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground text-sm">No trades logged yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Click &quot;Log New Trade&quot; to start tracking your performance.</p>
            </div>
          ) : (
            trades.map((trade) => <TradeCard key={trade.id} trade={trade} onRemove={() => removeTrade(trade.id)} />)
          )}
        </div>
      </div>

      {/* Log Trade Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0f1117] border-white/10 text-foreground max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log New Trade</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Ticker */}
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Ticker *</label>
              <input
                value={form.ticker}
                onChange={(e) => f("ticker", e.target.value.toUpperCase())}
                placeholder="e.g. AAPL"
                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono uppercase placeholder:normal-case placeholder:font-sans"
              />
            </div>

            {/* Direction */}
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Direction *</label>
              <div className="grid grid-cols-2 gap-2">
                {(["long", "short"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => f("direction", d)}
                    className={cn("h-10 rounded-xl text-sm font-semibold transition-colors capitalize", form.direction === d
                      ? d === "long" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10")}
                  >
                    {d === "long" ? "↑ Long" : "↓ Short"}
                  </button>
                ))}
              </div>
            </div>

            {/* Entry + Shares */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Entry Price *</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.entryPrice}
                  onChange={(e) => f("entryPrice", e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">Shares *</label>
                <input
                  type="number" step="1" min="1"
                  value={form.shares}
                  onChange={(e) => f("shares", e.target.value)}
                  placeholder="100"
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
              </div>
            </div>

            {/* Entry date */}
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Entry Date</label>
              <input
                type="date"
                value={form.entryDate}
                onChange={(e) => f("entryDate", e.target.value)}
                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Closed toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="closed"
                checked={form.isClosed}
                onChange={(e) => f("isClosed", e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="closed" className="text-sm cursor-pointer">Trade is closed (has exit price)</label>
            </div>

            {form.isClosed && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">Exit Price</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={form.exitPrice}
                    onChange={(e) => f("exitPrice", e.target.value)}
                    placeholder="0.00"
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">Exit Date</label>
                  <input
                    type="date"
                    value={form.exitDate}
                    onChange={(e) => f("exitDate", e.target.value)}
                    className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            )}

            {/* P&L preview */}
            {form.isClosed && form.exitPrice && form.entryPrice && form.shares && (
              (() => {
                const pnl = (parseFloat(form.exitPrice) - parseFloat(form.entryPrice)) * parseFloat(form.shares) * (form.direction === "long" ? 1 : -1);
                return (
                  <div className={cn("rounded-xl px-3 py-2.5 text-sm font-medium text-center", pnl >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                    P&L: {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
                  </div>
                );
              })()
            )}

            {/* Emotion */}
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Emotion / Psychology</label>
              <div className="grid grid-cols-3 gap-1.5">
                {EMOTIONS.map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => f("emotion", key)}
                    className={cn("h-8 rounded-lg text-xs font-medium transition-colors", form.emotion === key ? `${cfg.bg} ${cfg.color} border border-current/20` : "bg-white/5 text-muted-foreground hover:bg-white/10")}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                placeholder="Setup, reasoning, what you learned…"
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none placeholder:text-muted-foreground"
              />
            </div>

            {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={submit}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors"
            >
              Save Trade
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
