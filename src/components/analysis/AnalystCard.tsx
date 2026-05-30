import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalystCardProps {
  recommendationKey: string | null;
  recommendationMean: number | null;
  numberOfAnalysts: number;
  targetMeanPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  currentPrice: number;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

// ─── Rating helpers ───────────────────────────────────────────────────────────

interface RatingMeta {
  label: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
}

function getRatingMeta(key: string | null, mean: number | null): RatingMeta {
  const k = key?.toLowerCase() ?? "";

  if (k === "strongbuy" || (mean !== null && mean <= 1.5)) {
    return { label: "Strong Buy", textClass: "text-emerald-500", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/25" };
  }
  if (k === "buy" || (mean !== null && mean <= 2.5)) {
    return { label: "Buy", textClass: "text-emerald-400", bgClass: "bg-emerald-400/10", borderClass: "border-emerald-400/25" };
  }
  if (k === "hold" || (mean !== null && mean <= 3.5)) {
    return { label: "Hold", textClass: "text-yellow-400", bgClass: "bg-yellow-400/10", borderClass: "border-yellow-400/25" };
  }
  if (k === "sell" || (mean !== null && mean <= 4.5)) {
    return { label: "Sell", textClass: "text-orange-400", bgClass: "bg-orange-400/10", borderClass: "border-orange-400/25" };
  }
  return { label: "Strong Sell", textClass: "text-red-400", bgClass: "bg-red-400/10", borderClass: "border-red-400/25" };
}

// ─── Analyst distribution bar ─────────────────────────────────────────────────

interface DistBarProps {
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

function DistributionBar({ strongBuy, buy, hold, sell, strongSell }: DistBarProps) {
  const total = strongBuy + buy + hold + sell + strongSell;
  if (total === 0) return null;

  const segments = [
    { count: strongBuy, color: "bg-emerald-600",  label: "Strong Buy",  textColor: "text-emerald-500"  },
    { count: buy,       color: "bg-emerald-400",  label: "Buy",         textColor: "text-emerald-400"  },
    { count: hold,      color: "bg-yellow-400",   label: "Hold",        textColor: "text-yellow-400"   },
    { count: sell,      color: "bg-orange-400",   label: "Sell",        textColor: "text-orange-400"   },
    { count: strongSell,color: "bg-red-400",      label: "Strong Sell", textColor: "text-red-400"      },
  ].filter((s) => s.count > 0);

  return (
    <div className="mt-4">
      {/* Stacked bar */}
      <div className="h-6 rounded-full overflow-hidden flex gap-0.5">
        {segments.map((seg) => {
          const pct = (seg.count / total) * 100;
          return (
            <div
              key={seg.label}
              className={cn("h-full flex items-center justify-center text-[10px] font-bold text-black/70 overflow-hidden transition-all", seg.color)}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${seg.count}`}
            >
              {pct >= 10 ? seg.count : ""}
            </div>
          );
        })}
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-2 mt-3">
        {[
          { count: strongBuy,  label: "Strong Buy",  textColor: "text-emerald-500", bg: "bg-emerald-500/10" },
          { count: buy,        label: "Buy",         textColor: "text-emerald-400", bg: "bg-emerald-400/10" },
          { count: hold,       label: "Hold",        textColor: "text-yellow-400",  bg: "bg-yellow-400/10"  },
          { count: sell,       label: "Sell",        textColor: "text-orange-400",  bg: "bg-orange-400/10"  },
          { count: strongSell, label: "Strong Sell", textColor: "text-red-400",     bg: "bg-red-400/10"     },
        ].map((item) => (
          <div
            key={item.label}
            className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold", item.bg, item.textColor)}
          >
            <span>{item.count}</span>
            <span className="opacity-75">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Price target range bar ───────────────────────────────────────────────────

interface PriceRangeProps {
  currentPrice: number;
  targetMeanPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
}

function PriceTargetRange({ currentPrice, targetMeanPrice, targetHighPrice, targetLowPrice }: PriceRangeProps) {
  if (targetLowPrice === null || targetHighPrice === null || targetMeanPrice === null) {
    return (
      <div className="text-sm text-muted-foreground">Price target data unavailable.</div>
    );
  }

  const rangeMin = Math.min(currentPrice, targetLowPrice) * 0.97;
  const rangeMax = Math.max(currentPrice, targetHighPrice) * 1.03;
  const span     = rangeMax - rangeMin;

  const toPct = (v: number) => ((v - rangeMin) / span) * 100;

  const currentPct = toPct(currentPrice);
  const lowPct     = toPct(targetLowPrice);
  const meanPct    = toPct(targetMeanPrice);
  const highPct    = toPct(targetHighPrice);

  const upsidePct  = ((targetMeanPrice - currentPrice) / currentPrice) * 100;
  const isUpside   = upsidePct >= 0;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price Target Range</span>
        <span className={cn("text-sm font-bold font-mono", isUpside ? "text-emerald-400" : "text-red-400")}>
          {isUpside ? "+" : ""}{upsidePct.toFixed(1)}% to target
        </span>
      </div>

      {/* Visual range bar */}
      <div className="relative h-8 mb-3">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-white/5 rounded-full" />

        {/* Low → High filled range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-primary/30 rounded-full"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />

        {/* Low marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-4 rounded-sm bg-red-400/70"
          style={{ left: `calc(${lowPct}% - 4px)` }}
          title={`Low: $${targetLowPrice.toFixed(2)}`}
        />

        {/* High marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-4 rounded-sm bg-emerald-400/70"
          style={{ left: `calc(${highPct}% - 4px)` }}
          title={`High: $${targetHighPrice.toFixed(2)}`}
        />

        {/* Mean marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-5 rounded-sm bg-primary"
          style={{ left: `calc(${meanPct}% - 5px)` }}
          title={`Target: $${targetMeanPrice.toFixed(2)}`}
        />

        {/* Current price marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-6 rounded-sm bg-white"
          style={{ left: `calc(${currentPct}% - 5px)` }}
          title={`Current: $${currentPrice.toFixed(2)}`}
        />
      </div>

      {/* Labels row */}
      <div className="flex justify-between text-[11px] font-mono">
        <div className="text-red-400">
          <div className="text-muted-foreground">Low</div>
          <div>${targetLowPrice.toFixed(2)}</div>
        </div>
        <div className="text-center text-primary">
          <div className="text-muted-foreground">Target</div>
          <div>${targetMeanPrice.toFixed(2)}</div>
        </div>
        <div className="text-right text-emerald-400">
          <div className="text-muted-foreground">High</div>
          <div>${targetHighPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-2 text-center text-xs text-muted-foreground">
        Current price: <span className="text-white font-mono font-semibold">${currentPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalystCard({
  recommendationKey,
  recommendationMean,
  numberOfAnalysts,
  targetMeanPrice,
  targetHighPrice,
  targetLowPrice,
  currentPrice,
  strongBuy,
  buy,
  hold,
  sell,
  strongSell,
}: AnalystCardProps) {
  // Empty state
  if (numberOfAnalysts === 0) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Analyst Ratings</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <Users className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No analyst coverage available</p>
        </div>
      </div>
    );
  }

  const meta = getRatingMeta(recommendationKey, recommendationMean);

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Analyst Ratings</h3>
      </div>

      {/* Big consensus label */}
      <div className={cn("flex flex-col items-center py-4 rounded-xl border mb-4", meta.bgClass, meta.borderClass)}>
        <span className={cn("text-3xl font-extrabold tracking-tight", meta.textClass)}>
          {meta.label.toUpperCase()}
        </span>
        {recommendationMean !== null && (
          <span className="text-xs text-muted-foreground mt-1 font-mono">
            Consensus score: {recommendationMean.toFixed(2)} / 5.0
          </span>
        )}
        <span className="text-xs text-muted-foreground mt-0.5">
          Based on {numberOfAnalysts} analyst{numberOfAnalysts !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Distribution bar + pills */}
      <DistributionBar
        strongBuy={strongBuy}
        buy={buy}
        hold={hold}
        sell={sell}
        strongSell={strongSell}
      />

      {/* Divider */}
      <div className="my-4 border-t border-white/5" />

      {/* Price target section */}
      <PriceTargetRange
        currentPrice={currentPrice}
        targetMeanPrice={targetMeanPrice}
        targetHighPrice={targetHighPrice}
        targetLowPrice={targetLowPrice}
      />
    </div>
  );
}
