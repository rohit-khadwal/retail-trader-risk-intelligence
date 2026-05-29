"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { Shield, AlertTriangle } from "lucide-react";
import type { RiskScore } from "@/types";
import { cn, getRiskBg, getRiskColor } from "@/lib/utils";

interface RiskScoreCardProps {
  riskScore: RiskScore;
}

export function RiskScoreCard({ riskScore }: RiskScoreCardProps) {
  const { overall, level, components } = riskScore;

  const radarData = [
    { subject: "Volatility", value: components.volatility },
    { subject: "Dilution", value: components.dilution },
    { subject: "Social Hype", value: components.socialHype },
    { subject: "Momentum", value: components.momentum },
    { subject: "Insider", value: components.insiderActivity },
    { subject: "Short Interest", value: components.shortInterest },
  ];

  const gaugeAngle = (overall / 100) * 180;

  const colorClass = getRiskColor(level);
  const bgClass = getRiskBg(level);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Risk Score</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Dial */}
        <div className="relative flex flex-col items-center shrink-0">
          <svg viewBox="0 0 160 90" className="w-40">
            <defs>
              <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="33%" stopColor="#facc15" />
                <stop offset="66%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>
            <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
            <path
              d="M 15 80 A 65 65 0 0 1 145 80"
              fill="none"
              stroke="url(#riskGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(overall / 100) * 204} 204`}
            />
            <g transform={`rotate(${gaugeAngle - 90}, 80, 80)`}>
              <line x1="80" y1="80" x2="80" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="80" cy="80" r="4" fill="white" />
            </g>
          </svg>
          <div className="text-center -mt-1">
            <div className={cn("text-4xl font-bold font-mono", colorClass)}>{overall}</div>
            <div className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full mt-1", bgClass)}>{level}</div>
          </div>
        </div>

        {/* Radar */}
        <div className="flex-1 w-full" style={{ minHeight: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "rgba(255,255,255,0.8)" }}
              />
              <Radar
                name="Risk"
                dataKey="value"
                stroke={overall >= 75 ? "#f87171" : overall >= 50 ? "#fb923c" : "#4ade80"}
                fill={overall >= 75 ? "#f87171" : overall >= 50 ? "#fb923c" : "#4ade80"}
                fillOpacity={0.15}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Component bars */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {Object.entries(components).map(([key, value]) => {
          const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-medium font-mono", getRiskColor(value))}>{value}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn("h-full rounded-full", {
                    "bg-red-400": value >= 75,
                    "bg-orange-400": value >= 50 && value < 75,
                    "bg-yellow-400": value >= 25 && value < 50,
                    "bg-emerald-400": value < 25,
                  })}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {level === "EXTREME" && (
        <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">
            Extreme risk detected. This stock exhibits multiple high-risk patterns simultaneously.
          </p>
        </div>
      )}
    </div>
  );
}
