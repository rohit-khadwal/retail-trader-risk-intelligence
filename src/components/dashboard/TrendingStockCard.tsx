"use client";

import Link from "next/link";
import { TrendingUp, AlertTriangle, Volume2 } from "lucide-react";
import { cn, formatCurrency, formatPercent, formatVolume, getRiskColor } from "@/lib/utils";
import { RiskBadge } from "@/components/shared/RiskBadge";
import type { TrendingStock } from "@/types";

interface TrendingStockCardProps {
  stock: TrendingStock;
  rank: number;
}

export function TrendingStockCard({ stock, rank }: TrendingStockCardProps) {
  const isRisky = stock.riskScore >= 75;

  return (
    <Link href={`/analyze/${stock.ticker}`}>
      <div className={cn(
        "glass-card rounded-xl p-4 transition-all duration-200 hover:bg-white/8 cursor-pointer group",
        isRisky && "border-red-500/15"
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
              isRisky ? "bg-red-500/15 text-red-400" : "bg-primary/15 text-primary"
            )}>
              {rank}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{stock.ticker}</span>
                <RiskBadge level={stock.riskLevel} size="sm" showScore={false} />
              </div>
              <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono font-semibold text-sm">{formatCurrency(stock.price)}</div>
            <div className={cn(
              "text-xs font-medium flex items-center justify-end gap-0.5",
              stock.changePercent >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              <TrendingUp className="w-3 h-3" />
              {formatPercent(stock.changePercent)}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            {isRisky && <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0" />}
            <span className="truncate">{stock.reason}</span>
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Volume2 className="w-3 h-3" />
            {formatVolume(stock.volume)}
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Risk</span>
            <span className={cn("font-medium", getRiskColor(stock.riskScore))}>{stock.riskScore}/100</span>
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", {
                "bg-red-400": stock.riskScore >= 75,
                "bg-orange-400": stock.riskScore >= 50 && stock.riskScore < 75,
                "bg-yellow-400": stock.riskScore >= 25 && stock.riskScore < 50,
                "bg-emerald-400": stock.riskScore < 25,
              })}
              style={{ width: `${stock.riskScore}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
