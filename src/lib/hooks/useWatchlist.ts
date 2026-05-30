"use client";
import { useLocalStorage } from "./useLocalStorage";
import type { WatchlistItem } from "@/types";

const KEY = "rtri_watchlist_v2";

export function useWatchlist() {
  const [items, setItems] = useLocalStorage<WatchlistItem[]>(KEY, []);

  function add(ticker: string, name: string) {
    setItems((prev) => {
      if (prev.some((i) => i.ticker === ticker)) return prev;
      return [
        ...prev,
        {
          id: Date.now().toString(),
          ticker,
          name,
          addedAt: new Date().toISOString().slice(0, 10),
          alertPrice: null,
          notes: "",
          riskScore: 50,
          currentPrice: 0,
          changePercent: 0,
        },
      ];
    });
  }

  function remove(ticker: string) {
    setItems((prev) => prev.filter((i) => i.ticker !== ticker));
  }

  function updatePrices(prices: Record<string, { price: number; changePercent: number; name: string }>) {
    setItems((prev) =>
      prev.map((i) =>
        prices[i.ticker]
          ? { ...i, currentPrice: prices[i.ticker].price, changePercent: prices[i.ticker].changePercent, name: prices[i.ticker].name || i.name }
          : i
      )
    );
  }

  function setAlertPrice(ticker: string, price: number | null) {
    setItems((prev) => prev.map((i) => (i.ticker === ticker ? { ...i, alertPrice: price } : i)));
  }

  function has(ticker: string) {
    return items.some((i) => i.ticker === ticker);
  }

  return { items, add, remove, updatePrices, setAlertPrice, has };
}
