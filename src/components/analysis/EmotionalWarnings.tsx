"use client";

import { AlertTriangle, Brain, CheckCircle } from "lucide-react";

interface EmotionalWarningsProps {
  warnings: string[];
}

const disciplines = [
  "Define your stop loss BEFORE entering any position",
  "Never risk more than 1–2% of your portfolio on a single trade",
  "Wait for the move to confirm — chasing costs money",
  "Take notes on your emotional state before entering",
];

export function EmotionalWarnings({ warnings }: EmotionalWarningsProps) {
  if (!warnings.length) return null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-orange-500/15">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-orange-400" />
        <h3 className="font-semibold">Psychology & Emotional Risk</h3>
      </div>

      <div className="space-y-2.5 mb-5">
        {warnings.map((warning, i) => (
          <div key={i} className="flex items-start gap-2.5 bg-orange-500/8 border border-orange-500/15 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <p className="text-sm text-orange-200/90">{warning}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 pt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Disciplined Trader Checklist
        </p>
        <div className="space-y-2">
          {disciplines.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-400/60 mt-0.5 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
