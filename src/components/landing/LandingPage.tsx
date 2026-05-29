"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Search,
  TrendingUp,
  AlertTriangle,
  Brain,
  BarChart3,
  History,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Eye,
  BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Shield,
    title: "Pump & Dump Detection",
    description: "AI identifies classic pump patterns — low float spikes, social hype surges, and abnormal volume before you chase.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: AlertTriangle,
    title: "Dilution Risk Scoring",
    description: "Automatically surfaces ATM offerings, shelf registrations, and convertible notes that dilute shareholder value.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: History,
    title: "Reverse Split History",
    description: "Every reverse split on record, with price context. Multiple splits = long-term value destruction signal.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Brain,
    title: "Emotional Risk Warnings",
    description: "Pattern-based warnings when a trade setup matches known FOMO, momentum-chasing, or panic-selling scenarios.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: TrendingUp,
    title: "Short Squeeze Analysis",
    description: "Short float, days-to-cover, and squeeze probability — so you understand the full picture, not just the hype.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Users,
    title: "Insider Transaction Tracker",
    description: "Know when executives and directors are selling. Insider selling patterns often precede major drawdowns.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "Technical Analysis",
    description: "RSI, MACD, Bollinger Bands, and support/resistance levels — visualized in clean, readable charts.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: BookOpen,
    title: "Trading Journal",
    description: "Log trades with emotion tracking. Identify revenge trading, overtrading, and FOMO patterns before they cost you.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

const testimonials = [
  {
    name: "Marcus T.",
    handle: "@daytrader_mn",
    avatar: "M",
    text: "I almost bought MULN on the 180% spike. The dump probability score was 87%. Walked away. Three days later it was down 70%. This app saved me real money.",
  },
  {
    name: "Priya K.",
    handle: "@priya_trades",
    avatar: "P",
    text: "The FOMO detection in the journal is eye-opening. I didn't realize how much I was losing to emotional decisions until I saw the numbers — over $2,000 to FOMO trades alone.",
  },
  {
    name: "Jordan L.",
    handle: "@jl_retail",
    avatar: "J",
    text: "Finally a tool built FOR retail traders, not against them. The reverse split history alone is worth it. I had no idea how many stocks I looked at had 5+ splits.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For cautious beginners",
    features: [
      "5 stock analyses per day",
      "Basic risk score",
      "Pump/dump signals",
      "7-day price history",
      "Watchlist (5 stocks)",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For active retail traders",
    features: [
      "50 analyses per day",
      "Full risk breakdown",
      "Social hype detection",
      "Insider activity",
      "Trading journal + analytics",
      "Email risk alerts",
      "Unlimited watchlist",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$29",
    period: "/month",
    description: "For serious traders",
    features: [
      "Unlimited analyses",
      "Real-time API access",
      "Priority alerts",
      "SEC filing scanner",
      "Portfolio risk score",
      "White-label reports",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const riskExamples = [
  { ticker: "MULN", score: 94, label: "Extreme", color: "text-red-400", bg: "bg-red-500/10", badge: "border-red-500/20" },
  { ticker: "AMC", score: 77, label: "High", color: "text-orange-400", bg: "bg-orange-500/10", badge: "border-orange-500/20" },
  { ticker: "NVDA", score: 31, label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10", badge: "border-emerald-500/20" },
];

export default function LandingPage() {
  const [ticker, setTicker] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (ticker.trim()) {
      router.push(`/analyze/${ticker.trim().toUpperCase()}`);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-white/8 h-14">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold tracking-tight">
              Risk<span className="text-primary">IQ</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20 rounded-xl px-4 py-1.5 text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            AI-powered risk intelligence for retail traders
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
            Know the risk
            <br />
            <span className="gradient-text">before you trade</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Stop chasing pumps. Stop falling for hype. Enter any stock ticker and get instant analysis — risk score, dump probability, dilution history, and emotional warnings — in seconds.
          </p>

          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md mx-auto mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Enter any ticker (e.g. MULN, AMC)"
                className="pl-10 h-12 bg-white/8 border-white/12 text-base focus-visible:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
            >
              Analyze <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-muted-foreground">
            Try{" "}
            <button onClick={() => router.push("/analyze/MULN")} className="text-red-400 hover:underline font-medium">MULN</button>,{" "}
            <button onClick={() => router.push("/analyze/AMC")} className="text-orange-400 hover:underline font-medium">AMC</button>, or{" "}
            <button onClick={() => router.push("/analyze/NVDA")} className="text-emerald-400 hover:underline font-medium">NVDA</button>
          </p>
        </div>

        <div className="max-w-2xl mx-auto mt-12 grid grid-cols-3 gap-3">
          {riskExamples.map((ex) => (
            <button
              key={ex.ticker}
              onClick={() => router.push(`/analyze/${ex.ticker}`)}
              className={cn("glass-card rounded-2xl p-4 text-center hover:bg-white/8 transition-colors border", ex.badge)}
            >
              <div className="font-bold text-lg">{ex.ticker}</div>
              <div className={cn("text-2xl font-bold font-mono mt-1", ex.color)}>{ex.score}</div>
              <div className={cn("text-xs font-semibold px-2 py-0.5 rounded-full mt-1.5 mx-auto inline-block", ex.bg, ex.color)}>
                {ex.label} Risk
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything you need to trade smarter</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built specifically for retail traders who use Robinhood, Webull, and trade small-cap momentum stocks.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="glass-card rounded-2xl p-5 hover:bg-white/6 transition-colors">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", bg)}>
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <h3 className="font-semibold mb-1.5 text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Intelligence explanation */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Risk Intelligence</div>
              <h2 className="text-3xl font-bold mb-4">What does a Risk Score actually mean?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                The 0–100 risk score combines six independently weighted signals: volatility, dilution history, social hype, price momentum, insider activity, and short interest.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                A score above 75 means the stock is showing multiple high-risk characteristics simultaneously — the same patterns that historically precede sharp drawdowns of 40–80%.
              </p>
              <div className="space-y-2">
                {[
                  { range: "0–24", label: "Low Risk", color: "bg-emerald-400", desc: "Fundamentally driven move" },
                  { range: "25–49", label: "Medium Risk", color: "bg-yellow-400", desc: "Some elevated signals" },
                  { range: "50–74", label: "High Risk", color: "bg-orange-400", desc: "Multiple risk flags" },
                  { range: "75–100", label: "Extreme Risk", color: "bg-red-400", desc: "Avoid or extreme caution" },
                ].map((level) => (
                  <div key={level.range} className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full shrink-0", level.color)} />
                    <span className="text-sm font-medium w-12">{level.range}</span>
                    <span className="text-sm">{level.label}</span>
                    <span className="text-xs text-muted-foreground">— {level.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Example: MULN Analysis</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Volatility", value: 97, color: "bg-red-400" },
                  { label: "Dilution Risk", value: 98, color: "bg-red-400" },
                  { label: "Social Hype", value: 92, color: "bg-red-400" },
                  { label: "Momentum", value: 88, color: "bg-red-400" },
                  { label: "Insider Activity", value: 85, color: "bg-red-400" },
                  { label: "Short Interest", value: 61, color: "bg-orange-400" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-mono text-red-400">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <div className="text-3xl font-bold text-red-400 font-mono">94</div>
                <div className="text-xs text-red-400 font-semibold mt-0.5">EXTREME RISK</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Traders who avoided the traps</h2>
            <p className="text-muted-foreground text-sm">Real stories from retail traders protecting their capital</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card rounded-2xl p-5">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-sm">One good trade pays for years of this service.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "glass-card rounded-2xl p-6",
                  plan.highlighted && "border border-primary/30 bg-primary/5"
                )}
              >
                {plan.highlighted && (
                  <div className="text-xs font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-full inline-block mb-3">
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-xl">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1 mb-1">
                  <span className="text-3xl font-bold font-mono">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                <div className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href="/dashboard"
                  className={cn(
                    "block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors",
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-white/8 hover:bg-white/12 text-foreground"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Stop gambling. Start trading intelligently.</h2>
          <p className="text-muted-foreground mb-6">
            Join traders who use data and discipline — not hype — to protect their capital.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>RiskIQ — Retail Trader Risk Intelligence</span>
          </div>
          <p className="text-xs text-center sm:text-right max-w-sm">
            For informational purposes only. Not financial advice. Always do your own research.
          </p>
        </div>
      </footer>
    </div>
  );
}
