import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toFixed(decimals)}`;
}

export function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function getRiskColor(level: RiskLevel | number): string {
  if (typeof level === "number") {
    if (level >= 75) return "text-red-400";
    if (level >= 50) return "text-yellow-400";
    if (level >= 25) return "text-emerald-400";
    return "text-emerald-500";
  }
  switch (level) {
    case "EXTREME": return "text-red-400";
    case "HIGH": return "text-orange-400";
    case "MEDIUM": return "text-yellow-400";
    case "LOW": return "text-emerald-400";
  }
}

export function getRiskBg(level: RiskLevel | number): string {
  if (typeof level === "number") {
    if (level >= 75) return "bg-red-500/10 border-red-500/20 text-red-400";
    if (level >= 50) return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
    return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
  }
  switch (level) {
    case "EXTREME": return "bg-red-500/10 border-red-500/20 text-red-400";
    case "HIGH": return "bg-orange-500/10 border-orange-500/20 text-orange-400";
    case "MEDIUM": return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
    case "LOW": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
  }
}

export function getRiskLabel(score: number): RiskLevel {
  if (score >= 75) return "EXTREME";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
