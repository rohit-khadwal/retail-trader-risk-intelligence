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
import {
  mockTrendingStocks,
  mockMarketSentiment,
  mockWatchlist,
} from "@/lib/mock-data/stocks";
import { TrendingStockCard } from "@/components/dashboard/TrendingStockCard";
import { FearGreedGauge } from "@/components/dashboard/FearGreedGauge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

const aiAlerts = [
  {
    ticker: "MULN",
    message: "Extreme social hype detected. Volume 15x average. High dump probability.",
    severity: "extreme" as const,
    time: "2m ago",
  },
  {
    ticker: "AMC",
    message: "Short interest elevated. Meme revival pattern forming.",
    severity: "high" as const,
    time: "14m ago",
  },
  {
    ticker: "BBIG",
    message: "8 reverse splits detected. Avoid momentum chasing.",
    severity: "high" as const,
    time: "31m ago",
  },
];

const quickStats = [
  { label: "Extreme Risk Stocks", value: "12", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  { label: "Active Alerts", value: "3", icon: Bell, color: "text-orange-400", bg: "bg-orange-500/10" },
  { label: "Analyzed Today", value: "48", icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
  { label: "Watchlist Items", value: "4", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
];

export default function DashboardPage() {
  const highRiskStocks = mockTrendingStocks.filter((s) => s.riskScore >= 75);
  const biggestGainers = [...mockTrendingStocks].sort((a, b) => b.changePercent - a.changePercent);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Risk Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time intelligence for disciplined trading
          </p>
        </div>
        <Link
          href="/analyze/MULN"
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
        {/* Main content — trending + alerts */}
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
                    alert.severity === "extreme" ? "bg-red-500/8 border border-red-500/15" : "bg-orange-500/5 border border-orange-500/10"
                  )}
                >
                  <AlertTriangle className={cn(
                    "w-4 h-4 mt-0.5 shrink-0",
                    alert.severity === "extreme" ? "text-red-400" : "text-orange-400"
                  )} />
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

          {/* Trending risky stocks */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Trending High-Risk Stocks</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockTrendingStocks.map((stock, i) => (
                <TrendingStockCard key={stock.ticker} stock={stock} rank={i + 1} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <FearGreedGauge
            value={mockMarketSentiment.fearGreedIndex}
            label={mockMarketSentiment.label}
            trend={mockMarketSentiment.trend}
          />

          {/* Market context */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-3">Market Context</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {mockMarketSentiment.sectorRotation}
            </p>
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current Climate</span>
                <span className="text-orange-400 font-medium">Risk-Off</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-muted-foreground">Momentum Traps</span>
                <span className="text-red-400 font-medium">Elevated</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-muted-foreground">Pump Activity</span>
                <span className="text-red-400 font-medium">High</span>
              </div>
            </div>
          </div>

          {/* Watchlist summary */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Watchlist</h3>
              <Link href="/watchlist" className="text-xs text-primary hover:underline">
                View all
              </Link>
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
                    <div className={cn(
                      "text-xs font-medium",
                      item.changePercent >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
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
              <Link
                href="/journal"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Log a trade
              </Link>
              <Link
                href="/analyze/MULN"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Shield className="w-4 h-4 text-orange-400" />
                Analyze MULN
              </Link>
              <Link
                href="/watchlist"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Star className="w-4 h-4 text-yellow-400" />
                Manage watchlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
