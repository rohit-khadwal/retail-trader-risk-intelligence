"use client";

import { BarChart2 } from "lucide-react";
import type { TechnicalIndicator } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

interface TechnicalCardProps {
  technicals: TechnicalIndicator;
  currentPrice: number;
}

export function TechnicalCard({ technicals, currentPrice }: TechnicalCardProps) {
  const rsiColor =
    technicals.rsi > 70 ? "text-red-400" :
    technicals.rsi < 30 ? "text-emerald-400" :
    "text-yellow-400";

  const rsiLabel =
    technicals.rsi > 70 ? "Overbought" :
    technicals.rsi < 30 ? "Oversold" :
    "Neutral";

  const macdBull = technicals.macd > technicals.macdSignal;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Technical Analysis</h3>
      </div>

      {/* Price levels */}
      <div className="mb-4 relative">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Support: {formatCurrency(technicals.support)}</span>
          <span>Resistance: {formatCurrency(technicals.resistance)}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500/30 rounded-full"
            style={{ width: `${((currentPrice - technicals.support) / (technicals.resistance - technicals.support)) * 100}%` }}
          />
          <div
            className="absolute inset-y-0 w-1 bg-white rounded-full"
            style={{ left: `calc(${((currentPrice - technicals.support) / (technicals.resistance - technicals.support)) * 100}% - 2px)` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">Low</span>
          <span className="font-medium">{formatCurrency(currentPrice)}</span>
          <span className="text-muted-foreground">High</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/3 rounded-xl p-3">
          <div className="text-xs text-muted-foreground mb-1">RSI (14)</div>
          <div className={cn("text-xl font-bold font-mono", rsiColor)}>{technicals.rsi}</div>
          <div className={cn("text-xs font-medium", rsiColor)}>{rsiLabel}</div>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", {
                "bg-red-400": technicals.rsi > 70,
                "bg-yellow-400": technicals.rsi >= 30 && technicals.rsi <= 70,
                "bg-emerald-400": technicals.rsi < 30,
              })}
              style={{ width: `${technicals.rsi}%` }}
            />
          </div>
        </div>

        <div className="bg-white/3 rounded-xl p-3">
          <div className="text-xs text-muted-foreground mb-1">MACD</div>
          <div className={cn("text-xl font-bold font-mono", macdBull ? "text-emerald-400" : "text-red-400")}>
            {technicals.macd > 0 ? "+" : ""}{technicals.macd.toFixed(2)}
          </div>
          <div className={cn("text-xs font-medium", macdBull ? "text-emerald-400" : "text-red-400")}>
            {macdBull ? "Bullish" : "Bearish"}
          </div>
        </div>

        <div className="bg-white/3 rounded-xl p-3">
          <div className="text-xs text-muted-foreground mb-1">Bollinger Bands</div>
          <div className="text-xs space-y-0.5 mt-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upper</span>
              <span className="font-mono text-red-300/80">{formatCurrency(technicals.bollingerUpper)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lower</span>
              <span className="font-mono text-emerald-300/80">{formatCurrency(technicals.bollingerLower)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/3 rounded-xl p-3">
          <div className="text-xs text-muted-foreground mb-1">Moving Averages</div>
          <div className="text-xs space-y-0.5 mt-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMA 20</span>
              <span className={cn("font-mono", currentPrice > technicals.sma20 ? "text-emerald-400" : "text-red-400")}>
                {formatCurrency(technicals.sma20)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMA 50</span>
              <span className={cn("font-mono", currentPrice > technicals.sma50 ? "text-emerald-400" : "text-red-400")}>
                {formatCurrency(technicals.sma50)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
