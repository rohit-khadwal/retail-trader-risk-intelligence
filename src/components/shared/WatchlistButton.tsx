"use client";

import { Star } from "lucide-react";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { cn } from "@/lib/utils";

export function WatchlistButton({ ticker, name }: { ticker: string; name: string }) {
  const { has, add, remove } = useWatchlist();
  const watching = has(ticker);

  function toggle() {
    if (watching) remove(ticker);
    else add(ticker, name);
  }

  return (
    <button
      onClick={toggle}
      title={watching ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "p-2 rounded-xl transition-colors",
        watching
          ? "bg-yellow-500/15 text-yellow-400 hover:bg-red-500/15 hover:text-red-400"
          : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-yellow-400"
      )}
    >
      <Star className={cn("w-4 h-4", watching && "fill-yellow-400")} />
    </button>
  );
}
