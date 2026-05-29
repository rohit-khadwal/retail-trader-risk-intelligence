"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { PricePoint } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

interface PriceChartProps {
  data: PricePoint[];
  ticker: string;
  currentPrice: number;
  changePercent: number;
}

const RANGES = ["1W", "1M", "3M"] as const;

function filterByRange(data: PricePoint[], range: (typeof RANGES)[number]) {
  const days = range === "1W" ? 7 : range === "1M" ? 30 : 90;
  return data.slice(-days);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-mono font-semibold">{formatCurrency(payload[0]?.value)}</p>
    </div>
  );
}

export function PriceChart({ data, ticker, currentPrice, changePercent }: PriceChartProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1M");
  const filtered = filterByRange(data, range);
  const isPositive = changePercent >= 0;
  const color = isPositive ? "#4ade80" : "#f87171";

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{ticker} Price</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono font-bold text-xl">{formatCurrency(currentPrice)}</span>
            <span className={cn("text-sm font-medium", isPositive ? "text-emerald-400" : "text-red-400")}>
              {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                range === r
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={filtered} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.slice(5)}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
