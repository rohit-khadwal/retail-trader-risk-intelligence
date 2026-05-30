"use client";

import { BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickSnapshotProps {
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number | null;
  forwardPE: number | null;
  eps: number | null;
  revenue: number | null;
  profitMargin: number | null;
  beta: number | null;
  week52High: number | null;
  week52Low: number | null;
  volume: number;
  avgVolume: number;
  dividendYield: number | null;
  analystRating: string | null;
  priceTarget: number | null;
  isProfit: boolean;
}

// ─── Formatters ──────────────────────────────────────────────────────────────

function fmt(
  n: number | null,
  prefix = "",
  suffix = "",
  decimals = 2
): string {
  if (n === null || n === undefined) return "N/A";
  return `${prefix}${n.toFixed(decimals)}${suffix}`;
}

function fmtBig(n: number | null, withDollar = true): string {
  if (n === null || n === undefined) return "N/A";
  const prefix = withDollar ? "$" : "";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${prefix}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `${sign}${prefix}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `${sign}${prefix}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3)  return `${sign}${prefix}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${prefix}${abs.toFixed(2)}`;
}

function fmtPct(n: number | null): string {
  if (n === null || n === undefined) return "N/A";
  return `${(n * 100).toFixed(2)}%`;
}

// ─── Tile ─────────────────────────────────────────────────────────────────────

interface TileProps {
  label: string;
  value: React.ReactNode;
}

function Tile({ label, value }: TileProps) {
  return (
    <div className="bg-white/3 rounded-xl p-3 flex flex-col gap-1 min-w-0">
      <span className="text-[11px] text-muted-foreground leading-tight truncate">{label}</span>
      <span className="text-sm font-semibold leading-snug break-words">{value}</span>
    </div>
  );
}

// ─── Rating colour ────────────────────────────────────────────────────────────

function ratingColor(rating: string | null): string {
  if (!rating) return "text-muted-foreground";
  const r = rating.toLowerCase().replace(/\s/g, "");
  if (r === "strongbuy" || r === "buy") return "text-emerald-400";
  if (r === "hold")                      return "text-yellow-400";
  return "text-red-400";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function QuickSnapshot({
  price,
  change,
  changePercent,
  marketCap,
  peRatio,
  forwardPE,
  eps,
  revenue,
  profitMargin,
  beta,
  week52High,
  week52Low,
  volume,
  avgVolume,
  dividendYield,
  analystRating,
  priceTarget,
  isProfit,
}: QuickSnapshotProps) {
  const isUp = change >= 0;

  // P/E value node
  const peNode = peRatio !== null
    ? <span className="font-mono">{peRatio.toFixed(2)}</span>
    : !isProfit
      ? <span className="text-red-400">Loss</span>
      : <span className="text-muted-foreground">N/A</span>;

  // Profit margin colour
  const marginColor =
    profitMargin === null ? "text-muted-foreground" :
    profitMargin > 0       ? "text-emerald-400" :
    "text-red-400";

  // Beta colour
  const betaColor =
    beta === null  ? "text-muted-foreground" :
    beta < 1       ? "text-emerald-400" :
    beta <= 1.5    ? "text-yellow-400" :
    "text-red-400";

  // Dividend
  const divNode =
    dividendYield === null || dividendYield === 0
      ? <span className="text-muted-foreground">None</span>
      : <span className="text-emerald-400">{fmtPct(dividendYield)}</span>;

  // 52-week range
  const rangeNode =
    week52Low !== null && week52High !== null
      ? <span className="font-mono text-xs">${week52Low.toFixed(2)} — ${week52High.toFixed(2)}</span>
      : <span className="text-muted-foreground">N/A</span>;

  // Analyst rating node
  const ratingNode = analystRating
    ? <span className={ratingColor(analystRating)}>{analystRating}</span>
    : <span className="text-muted-foreground">N/A</span>;

  // Price target node
  const targetNode = priceTarget !== null
    ? (
      <span className="font-mono text-xs leading-relaxed">
        ${priceTarget.toFixed(2)}{" "}
        <span className="text-muted-foreground">(now ${price.toFixed(2)})</span>
      </span>
    )
    : <span className="text-muted-foreground">N/A</span>;

  const tiles: TileProps[] = [
    {
      label: "Market Cap",
      value: <span className="font-mono">{fmtBig(marketCap)}</span>,
    },
    {
      label: "P/E Ratio",
      value: peNode,
    },
    {
      label: "Forward P/E",
      value: forwardPE !== null
        ? <span className="font-mono">{forwardPE.toFixed(2)}</span>
        : <span className="text-muted-foreground">N/A</span>,
    },
    {
      label: "EPS — TTM",
      value: <span className={cn("font-mono", eps !== null && eps < 0 ? "text-red-400" : "text-emerald-400")}>{fmt(eps, "$")}</span>,
    },
    {
      label: "Revenue — TTM",
      value: <span className="font-mono">{fmtBig(revenue)}</span>,
    },
    {
      label: "Profit Margin",
      value: <span className={cn("font-mono", marginColor)}>{fmtPct(profitMargin)}</span>,
    },
    {
      label: "Beta",
      value: <span className={cn("font-mono", betaColor)}>{fmt(beta)}</span>,
    },
    {
      label: "Dividend Yield",
      value: divNode,
    },
    {
      label: "Volume",
      value: <span className="font-mono">{fmtBig(volume, false)}</span>,
    },
    {
      label: "52-Week Range",
      value: rangeNode,
    },
    {
      label: "Analyst Rating",
      value: ratingNode,
    },
    {
      label: "Price Target",
      value: targetNode,
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Investor Snapshot</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono">${price.toFixed(2)}</span>
          <span className={cn("text-sm font-semibold font-mono", isUp ? "text-emerald-400" : "text-red-400")}>
            {isUp ? "+" : ""}{change.toFixed(2)} ({isUp ? "+" : ""}{changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {tiles.map((tile) => (
          <Tile key={tile.label} label={tile.label} value={tile.value} />
        ))}
      </div>
    </div>
  );
}
