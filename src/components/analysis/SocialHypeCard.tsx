"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { MessageCircle, TrendingUp } from "lucide-react";
import type { SocialSignal } from "@/types";
import { cn, formatVolume } from "@/lib/utils";

interface SocialHypeCardProps {
  signals: SocialSignal[];
}

export function SocialHypeCard({ signals }: SocialHypeCardProps) {
  if (!signals.length) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Social Hype Detection</h3>
        </div>
        <p className="text-sm text-muted-foreground">No significant social signals detected.</p>
      </div>
    );
  }

  const totalMentions = signals.reduce((s, n) => s + n.mentions, 0);
  const avgSentiment = signals.reduce((s, n) => s + n.sentiment, 0) / signals.length;
  const totalChange = signals.reduce((s, n) => s + n.change24h, 0);

  const hyp = totalChange / (totalMentions / 1000);
  const hypiLabel = hyp > 50 ? "Extreme" : hyp > 20 ? "High" : hyp > 10 ? "Elevated" : "Normal";
  const hypiColor = hyp > 50 ? "text-red-400" : hyp > 20 ? "text-orange-400" : hyp > 10 ? "text-yellow-400" : "text-emerald-400";

  const chartData = signals.map((s) => ({
    name: s.platform,
    mentions: s.mentions,
    change: s.change24h,
  }));

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Social Hype Detection</h3>
        <span className={cn("ml-auto text-xs font-semibold", hypiColor)}>
          {hypiLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold font-mono">{formatVolume(totalMentions)}</div>
          <div className="text-xs text-muted-foreground">Total Mentions</div>
        </div>
        <div className="text-center">
          <div className={cn("text-xl font-bold font-mono", totalChange > 0 ? "text-emerald-400" : "text-red-400")}>
            +{formatVolume(totalChange)}
          </div>
          <div className="text-xs text-muted-foreground">24h Change</div>
        </div>
        <div className="text-center">
          <div className={cn("text-xl font-bold", avgSentiment > 0.3 ? "text-emerald-400" : avgSentiment < -0.3 ? "text-red-400" : "text-yellow-400")}>
            {avgSentiment > 0 ? "Bullish" : "Bearish"}
          </div>
          <div className="text-xs text-muted-foreground">Sentiment</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={chartData} barSize={32}>
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
          />
          <Bar dataKey="mentions" fill="rgba(99,102,241,0.6)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-2">
        {signals.map((s) => (
          <div key={s.platform} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{s.platform}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono">{formatVolume(s.mentions)} mentions</span>
              <div className="flex flex-wrap gap-1">
                {s.topKeywords.slice(0, 2).map((kw) => (
                  <span key={kw} className="bg-white/5 px-1.5 py-0.5 rounded text-xs">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hyp > 20 && (
        <div className="mt-3 flex items-center gap-2 bg-orange-500/8 border border-orange-500/15 rounded-xl px-3 py-2">
          <TrendingUp className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <p className="text-xs text-orange-300">
            Social hype is {hypiLabel.toLowerCase()}. Elevated retail FOMO often precedes sharp reversals.
          </p>
        </div>
      )}
    </div>
  );
}
