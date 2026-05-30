"use client";

import { useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Loader2 } from "lucide-react";
import type { PricePoint } from "@/types";
import { cn, formatCurrency, formatVolume } from "@/lib/utils";

type TF = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "5Y";

const TF_PERIOD: Record<TF, string> = {
  "1D": "1d", "5D": "5d", "1M": "1m", "3M": "3m",
  "6M": "6m", "1Y": "1y", "5Y": "5y",
};

function fmtAxis(iso: string, tf: TF): string {
  const d = new Date(iso);
  if (tf === "1D") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (tf === "5D") return d.toLocaleDateString([], { month: "short", day: "numeric" });
  if (tf === "5Y") return d.toLocaleDateString([], { month: "short", year: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PriceTooltip({ active, payload, tf }: { active?: boolean; payload?: any[]; tf: TF }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const date = new Date(d.date);
  const dateStr = (tf === "1D" || tf === "5D")
    ? date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="bg-[#0c0e14] border border-white/10 rounded-xl p-3 text-xs shadow-2xl min-w-[155px]">
      <div className="text-muted-foreground mb-2 font-medium">{dateStr}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-muted-foreground">Open</span>
        <span className="font-mono text-right">{formatCurrency(d.open)}</span>
        <span className="text-emerald-400">High</span>
        <span className="font-mono text-right text-emerald-400">{formatCurrency(d.high)}</span>
        <span className="text-red-400">Low</span>
        <span className="font-mono text-right text-red-400">{formatCurrency(d.low)}</span>
        <span className="font-semibold">Close</span>
        <span className="font-mono text-right font-semibold">{formatCurrency(d.close)}</span>
        {d.volume > 0 && (
          <>
            <span className="text-muted-foreground">Volume</span>
            <span className="font-mono text-right">{formatVolume(d.volume)}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function PriceChart({
  data: initialData,
  ticker,
  currentPrice,
  changePercent,
}: {
  data: PricePoint[];
  ticker: string;
  currentPrice: number;
  changePercent: number;
}) {
  const [tf, setTf] = useState<TF>("3M");
  const [chartData, setChartData] = useState<PricePoint[]>(initialData);
  const [loading, setLoading] = useState(false);

  const loadTf = useCallback(async (newTf: TF) => {
    setTf(newTf);
    if (newTf === "3M") { setChartData(initialData); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/chart/${ticker}?period=${TF_PERIOD[newTf]}`);
      const d: PricePoint[] = await res.json();
      setChartData(d.length ? d : initialData);
    } catch {
      setChartData(initialData);
    } finally {
      setLoading(false);
    }
  }, [ticker, initialData]);

  // ── Y-axis domain: tight around actual price range ──────────────
  const closes = chartData.map((d) => d.close).filter((v) => v != null && v > 0);
  const minP = closes.length ? Math.min(...closes) : currentPrice * 0.95;
  const maxP = closes.length ? Math.max(...closes) : currentPrice * 1.05;
  const range = maxP - minP || maxP * 0.02;
  const pad = range * 0.06;
  const priceDomain: [number, number] = [minP - pad, maxP + pad];

  const tickFmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : v >= 1 ? `$${v.toFixed(0)}` : `$${v.toFixed(3)}`;

  // ── Color based on period performance ──────────────────────────
  const first = chartData[0]?.close ?? currentPrice;
  const last = chartData[chartData.length - 1]?.close ?? currentPrice;
  const isUp = last >= first;
  const stroke = isUp ? "#34d399" : "#f87171";
  const gradFill = isUp ? "url(#gradGreen)" : "url(#gradRed)";
  const volColor = isUp ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)";

  const periodChange = first > 0 ? ((last - first) / first) * 100 : changePercent;
  const dollarChange = last - first;
  const lastBar = chartData[chartData.length - 1];

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold font-mono">{formatCurrency(currentPrice)}</span>
            <span className={cn("text-sm font-semibold", isUp ? "text-emerald-400" : "text-red-400")}>
              {dollarChange >= 0 ? "+" : ""}{formatCurrency(Math.abs(dollarChange))}
              {"  "}{periodChange >= 0 ? "+" : ""}{periodChange.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tf} · {chartData.length} data points
          </p>
        </div>

        <div className="flex gap-0.5 bg-white/5 rounded-xl p-1">
          {(["1D", "5D", "1M", "3M", "6M", "1Y", "5Y"] as TF[]).map((t) => (
            <button
              key={t}
              onClick={() => loadTf(t)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                tf === t
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/8"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-72 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* ── Price chart ─────────────────────────────────────── */}
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} syncId="sc" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={(v) => fmtAxis(v, tf)}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />

              <YAxis
                domain={priceDomain}
                tickFormatter={tickFmt}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                axisLine={false}
                tickLine={false}
                width={58}
                orientation="right"
                tickCount={5}
              />

              <Tooltip content={<PriceTooltip tf={tf} />} />

              <Area
                type="monotone"
                dataKey="close"
                stroke={stroke}
                strokeWidth={1.8}
                fill={gradFill}
                dot={false}
                activeDot={{ r: 3.5, fill: stroke, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* ── Volume chart ────────────────────────────────────── */}
          <ResponsiveContainer width="100%" height={48}>
            <BarChart data={chartData} syncId="sc" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Bar
                dataKey="volume"
                fill={volColor}
                radius={[1, 1, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {/* OHLC row */}
      {lastBar && (
        <div className="grid grid-cols-5 gap-2 mt-2 pt-3 border-t border-white/5 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Open</div>
            <div className="text-xs font-mono">{formatCurrency(lastBar.open)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">High</div>
            <div className="text-xs font-mono text-emerald-400">{formatCurrency(lastBar.high)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Low</div>
            <div className="text-xs font-mono text-red-400">{formatCurrency(lastBar.low)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Close</div>
            <div className="text-xs font-mono">{formatCurrency(lastBar.close)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Volume</div>
            <div className="text-xs font-mono">{formatVolume(lastBar.volume)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
