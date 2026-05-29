"use client";

import { cn } from "@/lib/utils";

interface FearGreedGaugeProps {
  value: number;
  label: string;
  trend: "increasing" | "decreasing" | "stable";
}

export function FearGreedGauge({ value, label, trend }: FearGreedGaugeProps) {
  const angle = (value / 100) * 180 - 90;

  const getColor = () => {
    if (value <= 25) return "#f87171";
    if (value <= 45) return "#fb923c";
    if (value <= 55) return "#facc15";
    if (value <= 75) return "#4ade80";
    return "#22d3ee";
  };

  const getLabelColor = () => {
    if (value <= 25) return "text-red-400";
    if (value <= 45) return "text-orange-400";
    if (value <= 55) return "text-yellow-400";
    if (value <= 75) return "text-emerald-400";
    return "text-cyan-400";
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Fear & Greed Index</h3>
        <span className={cn("text-xs font-medium flex items-center gap-1", {
          "text-emerald-400": trend === "increasing",
          "text-red-400": trend === "decreasing",
          "text-muted-foreground": trend === "stable",
        })}>
          {trend === "increasing" ? "↑" : trend === "decreasing" ? "↓" : "→"} {trend}
        </span>
      </div>

      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="25%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="75%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 251.2} 251.2`}
          />
          {/* Needle */}
          <g transform={`rotate(${angle}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke={getColor()}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="4" fill={getColor()} />
          </g>
        </svg>

        <div className="text-center -mt-2">
          <div className={cn("text-3xl font-bold font-mono", getLabelColor())}>{value}</div>
          <div className={cn("text-sm font-semibold mt-0.5", getLabelColor())}>{label}</div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mt-3 px-1">
        <span>Extreme Fear</span>
        <span>Neutral</span>
        <span>Extreme Greed</span>
      </div>
    </div>
  );
}
