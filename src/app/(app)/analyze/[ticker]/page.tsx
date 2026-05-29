import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  TrendingDown,
  History,
  Newspaper,
  Zap,
  Star,
} from "lucide-react";
import { getMockAnalysis } from "@/lib/mock-data/stocks";
import { RiskScoreCard } from "@/components/analysis/RiskScoreCard";
import { PriceChart } from "@/components/analysis/PriceChart";
import { EmotionalWarnings } from "@/components/analysis/EmotionalWarnings";
import { SocialHypeCard } from "@/components/analysis/SocialHypeCard";
import { InsiderActivity } from "@/components/analysis/InsiderActivity";
import { TechnicalCard } from "@/components/analysis/TechnicalCard";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { AnalysisSkeleton } from "@/components/shared/LoadingSkeleton";
import { cn, formatCurrency, formatPercent, formatVolume, getRiskBg } from "@/lib/utils";

export default async function AnalyzePage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const analysis = getMockAnalysis(ticker.toUpperCase());
  const { quote, riskScore, aiSummary, volatilityAnalysis, reverseSplits, dilutionEvents, news, socialSignals, insiderTransactions, technicals, priceHistory, shortInterest, emotionalWarnings, catalysts } = analysis;

  const isUp = quote.changePercent >= 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{quote.ticker}</h1>
            <RiskBadge score={riskScore.overall} level={riskScore.level} />
          </div>
          <p className="text-sm text-muted-foreground truncate">{quote.name}</p>
        </div>
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-yellow-400">
          <Star className="w-4 h-4" />
        </button>
      </div>

      {/* Price header */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono">{formatCurrency(quote.price)}</span>
              <span className={cn("text-lg font-semibold", isUp ? "text-emerald-400" : "text-red-400")}>
                {formatPercent(quote.changePercent)}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <span>Vol: <strong className="text-foreground font-mono">{formatVolume(quote.volume)}</strong></span>
              <span>Avg: <strong className="text-foreground font-mono">{formatVolume(quote.avgVolume)}</strong></span>
              <span>Float: <strong className="text-foreground font-mono">{formatVolume(quote.float)}</strong></span>
              <span>MCap: <strong className="text-foreground font-mono">{formatCurrency(quote.marketCap)}</strong></span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Vol/Avg Ratio</div>
            <div className={cn("text-xl font-bold font-mono", quote.volume / quote.avgVolume > 5 ? "text-red-400" : "text-foreground")}>
              {(quote.volume / quote.avgVolume).toFixed(1)}x
            </div>
            {quote.volume / quote.avgVolume > 3 && (
              <div className="text-xs text-orange-400">Abnormal volume</div>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className={cn("glass-card rounded-2xl p-5 border", getRiskBg(riskScore.level).replace("text-", "border-").replace("-400", "-500/20").replace("bg-", "border-"))}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">AI Risk Summary</h2>
          <span className="ml-auto text-xs text-muted-foreground">{new Date(analysis.analysisTimestamp).toLocaleTimeString()}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{aiSummary}</p>
        {catalysts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Identified Catalysts</p>
            <div className="space-y-1">
              {catalysts.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <Suspense fallback={<div className="glass-card rounded-2xl h-64 animate-pulse" />}>
        <PriceChart
          data={priceHistory}
          ticker={quote.ticker}
          currentPrice={quote.price}
          changePercent={quote.changePercent}
        />
      </Suspense>

      {/* Risk Score */}
      <RiskScoreCard riskScore={riskScore} />

      {/* Emotional Warnings */}
      {emotionalWarnings.length > 0 && (
        <EmotionalWarnings warnings={emotionalWarnings} />
      )}

      {/* Volatility & Dump Probability */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-4 h-4 text-orange-400" />
          <h3 className="font-semibold">Volatility & Dump Probability</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/3 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono text-orange-400">{volatilityAnalysis.atrPercent.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">ATR %</div>
          </div>
          <div className="bg-white/3 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono">{volatilityAnalysis.historicalVol}%</div>
            <div className="text-xs text-muted-foreground">Hist. Volatility</div>
          </div>
          {volatilityAnalysis.impliedVol && (
            <div className="bg-white/3 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono">{volatilityAnalysis.impliedVol}%</div>
              <div className="text-xs text-muted-foreground">Implied Vol</div>
            </div>
          )}
          <div className={cn("rounded-xl p-3 text-center", volatilityAnalysis.dumpProbability >= 70 ? "bg-red-500/10" : "bg-orange-500/10")}>
            <div className={cn("text-xl font-bold font-mono", volatilityAnalysis.dumpProbability >= 70 ? "text-red-400" : "text-orange-400")}>
              {volatilityAnalysis.dumpProbability}%
            </div>
            <div className="text-xs text-muted-foreground">Dump Probability</div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-white/3 rounded-xl text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Historical pattern: </span>
          {volatilityAnalysis.typicalRetrace}
        </div>
      </div>

      {/* Short squeeze */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <h3 className="font-semibold">Short Interest</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/3 rounded-xl p-3 text-center">
            <div className={cn("text-xl font-bold font-mono", shortInterest.shortFloat > 20 ? "text-orange-400" : "text-foreground")}>
              {shortInterest.shortFloat}%
            </div>
            <div className="text-xs text-muted-foreground">Short Float</div>
          </div>
          <div className="bg-white/3 rounded-xl p-3 text-center">
            <div className="text-xl font-bold font-mono">{shortInterest.daysToCover.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Days to Cover</div>
          </div>
          <div className={cn("rounded-xl p-3 text-center", shortInterest.shortSqueezeScore >= 60 ? "bg-emerald-500/10" : "bg-white/3")}>
            <div className={cn("text-xl font-bold font-mono", shortInterest.shortSqueezeScore >= 60 ? "text-emerald-400" : "text-muted-foreground")}>
              {shortInterest.shortSqueezeScore}/100
            </div>
            <div className="text-xs text-muted-foreground">Squeeze Score</div>
          </div>
        </div>
      </div>

      {/* Reverse splits */}
      {reverseSplits.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-red-500/15">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold">Reverse Split History</h3>
            <span className="ml-auto bg-red-500/10 text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              {reverseSplits.length} splits
            </span>
          </div>
          <div className="space-y-2">
            {reverseSplits.map((rs, i) => (
              <div key={i} className="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-sm">
                <div>
                  <span className="font-semibold text-red-400">{rs.ratio}</span>
                  <span className="text-muted-foreground ml-2">on {rs.date}</span>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {formatCurrency(rs.priceBefore)} → {formatCurrency(rs.priceAfter)}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-300/80 mt-3">
            Multiple reverse splits are a strong indicator of long-term value destruction.
          </p>
        </div>
      )}

      {/* Dilution */}
      {dilutionEvents.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-orange-500/15">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <h3 className="font-semibold">Dilution History</h3>
            <span className="ml-auto bg-orange-500/10 text-orange-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              High Risk
            </span>
          </div>
          <div className="space-y-2">
            {dilutionEvents.map((d, i) => (
              <div key={i} className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-orange-400">{d.type}</span>
                  <span className="text-xs text-muted-foreground">{d.date}</span>
                </div>
                <p className="text-xs text-muted-foreground">{d.description}</p>
                <p className="text-xs text-foreground/60 mt-1">
                  +{(d.sharesAdded / 1e6).toFixed(1)}M shares at {formatCurrency(d.priceAtTime)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News */}
      {news.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Recent News</h3>
          </div>
          <div className="space-y-2">
            {news.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", {
                  "bg-emerald-400": item.sentiment === "positive",
                  "bg-red-400": item.sentiment === "negative",
                  "bg-yellow-400": item.sentiment === "neutral",
                })} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.headline}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{item.source}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Hype */}
      <SocialHypeCard signals={socialSignals} />

      {/* Insider Activity */}
      <InsiderActivity transactions={insiderTransactions} />

      {/* Technicals */}
      <TechnicalCard technicals={technicals} currentPrice={quote.price} />
    </div>
  );
}
