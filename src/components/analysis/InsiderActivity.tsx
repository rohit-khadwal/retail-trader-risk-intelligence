"use client";

import { UserX } from "lucide-react";
import type { InsiderTransaction } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

interface InsiderActivityProps {
  transactions: InsiderTransaction[];
}

export function InsiderActivity({ transactions }: InsiderActivityProps) {
  if (!transactions.length) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <UserX className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Insider Activity</h3>
        </div>
        <p className="text-sm text-muted-foreground">No recent insider transactions.</p>
      </div>
    );
  }

  const totalSells = transactions.filter((t) => t.type === "sell").reduce((s, t) => s + t.value, 0);
  const totalBuys = transactions.filter((t) => t.type === "buy").reduce((s, t) => s + t.value, 0);
  const sellDominant = totalSells > totalBuys;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <UserX className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Insider Activity</h3>
        {sellDominant && (
          <span className="ml-auto text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
            Net Selling
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-emerald-400">{formatCurrency(totalBuys)}</div>
          <div className="text-xs text-muted-foreground">Insider Buys</div>
        </div>
        <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-red-400">{formatCurrency(totalSells)}</div>
          <div className="text-xs text-muted-foreground">Insider Sells</div>
        </div>
      </div>

      <div className="space-y-2">
        {transactions.map((t, i) => (
          <div key={i} className={cn(
            "flex items-start justify-between p-3 rounded-xl border text-sm",
            t.type === "sell"
              ? "bg-red-500/5 border-red-500/10"
              : "bg-emerald-500/5 border-emerald-500/10"
          )}>
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.date}</div>
            </div>
            <div className="text-right">
              <div className={cn("font-semibold", t.type === "sell" ? "text-red-400" : "text-emerald-400")}>
                {t.type === "sell" ? "Sold" : "Bought"} {formatCurrency(t.value)}
              </div>
              <div className="text-xs text-muted-foreground">
                {t.shares.toLocaleString()} shares @ {formatCurrency(t.price)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
