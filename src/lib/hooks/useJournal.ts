"use client";
import { useLocalStorage } from "./useLocalStorage";
import type { JournalTrade, TradingStats } from "@/types";

const KEY = "rtri_journal_v2";

export function useJournal() {
  const [trades, setTrades] = useLocalStorage<JournalTrade[]>(KEY, []);

  function addTrade(trade: Omit<JournalTrade, "id">) {
    setTrades((prev) => [{ ...trade, id: Date.now().toString() }, ...prev]);
  }

  function removeTrade(id: string) {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTrade(id: string, patch: Partial<JournalTrade>) {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  return { trades, addTrade, removeTrade, updateTrade, stats: computeStats(trades) };
}

function computeStats(trades: JournalTrade[]): TradingStats {
  const closed = trades.filter((t) => t.status === "closed" && t.pnl !== null);
  const wins = closed.filter((t) => t.pnl! > 0);
  const losses = closed.filter((t) => t.pnl! <= 0);
  const totalPnl = closed.reduce((s, t) => s + t.pnl!, 0);
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl!, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl!, 0) / losses.length) : 0;
  const fomoCost = trades
    .filter((t) => t.emotion === "fomo" && t.pnl !== null && t.pnl < 0)
    .reduce((s, t) => s + t.pnl!, 0);
  const revengeLoss = trades
    .filter((t) => t.emotion === "revenge" && t.pnl !== null && t.pnl < 0)
    .reduce((s, t) => s + t.pnl!, 0);

  return {
    totalTrades: trades.length,
    winRate: closed.length ? Math.round((wins.length / closed.length) * 100) : 0,
    avgWin,
    avgLoss,
    profitFactor: avgLoss > 0 ? parseFloat((avgWin / avgLoss).toFixed(2)) : avgWin > 0 ? 99 : 0,
    totalPnl,
    fomoCost,
    revengeTradeLoss: revengeLoss,
    bestSetup: "",
    worstEmotion: Math.abs(fomoCost) >= Math.abs(revengeLoss) ? "FOMO" : "Revenge",
  };
}
