"use client";
import { useLocalStorage } from "./useLocalStorage";

export interface Position {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  addedAt: string;
  currentPrice: number;
  changePercent: number;
}

const KEY = "rtri_portfolio_v1";

export function usePortfolio() {
  const [positions, setPositions] = useLocalStorage<Position[]>(KEY, []);

  function addPosition(ticker: string, name: string, shares: number, avgCost: number) {
    setPositions((prev) => {
      const existing = prev.find((p) => p.ticker === ticker);
      if (existing) {
        const totalShares = existing.shares + shares;
        const newAvg = (existing.shares * existing.avgCost + shares * avgCost) / totalShares;
        return prev.map((p) => (p.ticker === ticker ? { ...p, shares: totalShares, avgCost: newAvg } : p));
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          ticker,
          name,
          shares,
          avgCost,
          addedAt: new Date().toISOString(),
          currentPrice: 0,
          changePercent: 0,
        },
      ];
    });
  }

  function removePosition(id: string) {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePrices(prices: Record<string, { price: number; changePercent: number; name: string }>) {
    setPositions((prev) =>
      prev.map((p) =>
        prices[p.ticker]
          ? { ...p, currentPrice: prices[p.ticker].price, changePercent: prices[p.ticker].changePercent }
          : p
      )
    );
  }

  const totalValue = positions.reduce((s, p) => s + (p.currentPrice || p.avgCost) * p.shares, 0);
  const totalCost = positions.reduce((s, p) => s + p.avgCost * p.shares, 0);
  const totalPnl = positions.reduce((s, p) => s + ((p.currentPrice || p.avgCost) - p.avgCost) * p.shares, 0);
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return { positions, addPosition, removePosition, updatePrices, totalValue, totalCost, totalPnl, totalPnlPct };
}
