"use client";

import { useState } from "react";
import { BookOpen, Plus, TrendingUp, TrendingDown, Brain, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { mockJournalTrades, mockTradingStats } from "@/lib/mock-data/stocks";
import type { JournalTrade } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

const emotionConfig = {
  confident: { label: "Confident", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  fomo: { label: "FOMO", color: "text-red-400", bg: "bg-red-500/10" },
  revenge: { label: "Revenge Trade", color: "text-red-400", bg: "bg-red-500/10" },
  greedy: { label: "Greedy", color: "text-orange-400", bg: "bg-orange-500/10" },
  fearful: { label: "Fearful", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  neutral: { label: "Neutral", color: "text-muted-foreground", bg: "bg-white/5" },
};

function TradeCard({ trade }: { trade: JournalTrade }) {
  const emotion = emotionConfig[trade.emotion];
  const isProfitable = trade.pnl !== null && trade.pnl > 0;
  const isClosed = trade.status === "closed";

  return (
    <div className={cn(
      "glass-card rounded-xl p-4 border",
      trade.emotion === "fomo" || trade.emotion === "revenge"
        ? "border-red-500/15"
        : "border-transparent"
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", trade.direction === "long" ? "bg-emerald-500/15" : "bg-red-500/15")}>
            {trade.direction === "long"
              ? <TrendingUp className="w-4 h-4 text-emerald-400" />
              : <TrendingDown className="w-4 h-4 text-red-400" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{trade.ticker}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", emotion.bg, emotion.color)}>
                {emotion.label}
              </span>
              {trade.status === "open" && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Open</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{new Date(trade.entryDate).toLocaleDateString()}</div>
          </div>
        </div>
        {isClosed && trade.pnl !== null && (
          <div className={cn("text-lg font-bold font-mono", isProfitable ? "text-emerald-400" : "text-red-400")}>
            {isProfitable ? "+" : ""}{formatCurrency(trade.pnl)}
          </div>
        )}
        {!isClosed && (
          <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-lg font-medium">In Progress</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="text-xs text-muted-foreground">Entry</div>
          <div className="text-sm font-mono font-medium">{formatCurrency(trade.entryPrice)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Exit</div>
          <div className="text-sm font-mono font-medium">{trade.exitPrice ? formatCurrency(trade.exitPrice) : "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Shares</div>
          <div className="text-sm font-mono font-medium">{trade.shares.toLocaleString()}</div>
        </div>
      </div>

      {trade.notes && (
        <p className="text-xs text-muted-foreground bg-white/3 rounded-lg p-2 mb-3 italic">{trade.notes}</p>
      )}

      {trade.mistakes.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-red-400/80">Mistakes</p>
          {trade.mistakes.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <XCircle className="w-3 h-3 text-red-400 shrink-0" />
              {m}
            </div>
          ))}
        </div>
      )}

      {trade.mistakes.length === 0 && isClosed && isProfitable && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          Clean execution — no mistakes logged
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const [trades] = useState(mockJournalTrades);
  const stats = mockTradingStats;

  const fomoLoss = Math.abs(stats.fomoCost);
  const revengeLoss = Math.abs(stats.revengeTradeLoss);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Trading Journal</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track trades, emotions, and break bad patterns</p>
      </div>

      {/* Psychology alerts */}
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
                    <p className="text-xs text-muted-foreground">Trades entered due to fear of missing out</p>
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
                    <p className="text-xs text-muted-foreground">Trades entered to recover from prior losses</p>
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-xl font-bold">{stats.totalTrades}</div>
          <div className="text-xs text-muted-foreground">Total Trades</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className={cn("text-xl font-bold", stats.winRate >= 50 ? "text-emerald-400" : "text-red-400")}>
            {stats.winRate}%
          </div>
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

      {/* Log new trade CTA */}
      <button className="w-full glass-card rounded-2xl p-4 flex items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors border border-primary/20">
        <Plus className="w-5 h-5" />
        <span className="font-medium">Log New Trade</span>
      </button>

      {/* Trade list */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recent Trades</h2>
        <div className="space-y-3">
          {trades.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground text-sm">No trades logged yet.</p>
            </div>
          ) : (
            trades.map((trade) => <TradeCard key={trade.id} trade={trade} />)
          )}
        </div>
      </div>
    </div>
  );
}
