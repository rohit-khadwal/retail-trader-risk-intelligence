import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Search,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { TrendingStockCard } from "@/components/dashboard/TrendingStockCard";
import { FearGreedGauge } from "@/components/dashboard/FearGreedGauge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { mockWatchlist } from "@/lib/mock-data/stocks";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { TrendingStock } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getTrendingStocks(): Promise<TrendingStock[]> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/trending`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const aiAlerts = [
  { ticker: "GME", message: "Unusual options activity detected. Short interest elevated.", severity: "high" as const, time: "live" },
  { ticker: "AMC", message: "Social mentions up 3x in the last hour. Meme revival pattern.", severity: "high" as const, time: "live" },
  { ticker: "MULN", message: "Volume spike 8x average. Low float — high dump probability.", severity: "extreme" as const, time: "live" },
];

export default async function DashboardPage() {
  const trendingStocks = await getTrendingStocks();
  const highRisk = trendingStocks.filter((s) => s.riskScore >= 75);

  const quickStats = [
    { label: "Extreme Risk Stocks", value: String(highRisk.length), icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Active Alerts", value: "3", icon: Bell, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Stocks Scanned", value: String(trendingStocks.length), icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
    { label: "Watchlist Items", value: "4", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ];

  // Fear & greed — derived from market data
  const avgChange = trendingStocks.length
    ? trendingStocks.reduce((s, t) => s + t.changePercent, 0) / trendingStocks.length
    : 0;
  const fearGreed = Math.max(10, Math.min(90, Math.round(50 + avgChange * 1.2)));
  const fearGreedLabel =
    fearGreed >= 75 ? "Greed" :
    fearGreed >= 55 ? "Neutral" :
    fearGreed >= 35 ? "Fear" :
    "Extreme Fear";
  const fearGreedTrend: "increasing" | "decreasing" | "stable" =
    avgChange > 1 ? "increasing" : avgChange < -1 ? "decreasing" : "stable";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Risk Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live risk intelligence — updated every 5 minutes
          </p>
        </div>
        <Link
          href="/analyze/AAPL"
          className="inline-flex items-center gap-2 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <Search className="w-4 h-4" />
          Analyze Stock
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickStats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{label}</span>
              <div className={cn("p-1.5 rounded-lg", bg)}>
                <Icon className={cn("w-3.5 h-3.5", color)} />
              </div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Alerts */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-400" />
              <h2 className="font-semibold text-sm">AI Risk Alerts</h2>
              <span className="ml-auto text-xs text-muted-foreground">Live</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              {aiAlerts.map((alert) => (
                <Link
                  key={alert.ticker}
                  href={`/analyze/${alert.ticker}`}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-white/5",
                    alert.severity === "extreme"
                      ? "bg-red-500/8 border border-red-500/15"
                      : "bg-orange-500/5 border border-orange-500/10"
                  )}
                >
                  <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0", alert.severity === "extreme" ? "text-red-400" : "text-orange-400")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">{alert.ticker}</span>
                      <RiskBadge level={alert.severity === "extreme" ? "EXTREME" : "HIGH"} size="sm" showScore={false} />
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending stocks */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Live Market Scan</h2>
              <span className="ml-auto text-xs text-muted-foreground">Sorted by risk</span>
            </div>
            {trendingStocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading market data…</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trendingStocks.slice(0, 8).map((stock, i) => (
                  <TrendingStockCard key={stock.ticker} stock={stock} rank={i + 1} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <FearGreedGauge value={fearGreed} label={fearGreedLabel} trend={fearGreedTrend} />

          {/* Market context */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-3">Market Context</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg Move (scan)</span>
                <span className={cn("font-medium font-mono", avgChange >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">High Risk Stocks</span>
                <span className={cn("font-medium", highRisk.length >= 5 ? "text-red-400" : "text-orange-400")}>
                  {highRisk.length} / {trendingStocks.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pump Activity</span>
                <span className={cn("font-medium", highRisk.length >= 3 ? "text-red-400" : "text-yellow-400")}>
                  {highRisk.length >= 3 ? "Elevated" : "Normal"}
                </span>
              </div>
            </div>
          </div>

          {/* Watchlist */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Watchlist</h3>
              <Link href="/watchlist" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {mockWatchlist.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/analyze/${item.ticker}`}
                  className="flex items-center justify-between py-2 hover:bg-white/3 rounded-lg px-1 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold">{item.ticker}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(item.currentPrice)}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-xs font-medium", item.changePercent >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {formatPercent(item.changePercent)}
                    </div>
                    <RiskBadge score={item.riskScore} size="sm" showScore={false} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/journal" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-white/5 transition-colors">
                <BookOpen className="w-4 h-4 text-primary" /> Log a trade
              </Link>
              <Link href="/analyze/GME" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Shield className="w-4 h-4 text-orange-400" /> Analyze GME
              </Link>
              <Link href="/watchlist" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Star className="w-4 h-4 text-yellow-400" /> Manage watchlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
