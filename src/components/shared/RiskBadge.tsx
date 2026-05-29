"use client";

import { cn, getRiskBg, getRiskLabel } from "@/lib/utils";
import type { RiskLevel } from "@/types";

interface RiskBadgeProps {
  score?: number;
  level?: RiskLevel;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
  className?: string;
}

export function RiskBadge({
  score,
  level,
  size = "md",
  showScore = true,
  className,
}: RiskBadgeProps) {
  const resolvedLevel = level ?? (score !== undefined ? getRiskLabel(score) : "LOW");
  const colorClass = getRiskBg(resolvedLevel);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold tracking-wide",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      <span className={cn("rounded-full animate-pulse", dotSize[size], {
        "bg-red-400": resolvedLevel === "EXTREME",
        "bg-orange-400": resolvedLevel === "HIGH",
        "bg-yellow-400": resolvedLevel === "MEDIUM",
        "bg-emerald-400": resolvedLevel === "LOW",
      })} />
      {resolvedLevel}
      {showScore && score !== undefined && (
        <span className="opacity-70 font-mono text-xs">({score})</span>
      )}
    </span>
  );
}
