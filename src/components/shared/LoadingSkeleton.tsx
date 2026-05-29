import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card rounded-2xl p-5 space-y-3", className)}>
      <Skeleton className="h-4 w-24 bg-white/5" />
      <Skeleton className="h-8 w-32 bg-white/5" />
      <Skeleton className="h-3 w-full bg-white/5" />
      <Skeleton className="h-3 w-3/4 bg-white/5" />
    </div>
  );
}

export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/3">
          <Skeleton className="h-9 w-9 rounded-lg bg-white/5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-20 bg-white/5" />
            <Skeleton className="h-3 w-32 bg-white/5" />
          </div>
          <Skeleton className="h-6 w-16 bg-white/5" />
          <Skeleton className="h-6 w-12 bg-white/5" />
        </div>
      ))}
    </div>
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-20 bg-white/5" />
            <Skeleton className="h-4 w-40 bg-white/5" />
          </div>
          <Skeleton className="h-10 w-24 rounded-full bg-white/5" />
        </div>
        <Skeleton className="h-4 w-full bg-white/5" />
        <Skeleton className="h-4 w-5/6 bg-white/5 mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="glass-card rounded-2xl p-5 h-48">
        <Skeleton className="h-full w-full bg-white/3" />
      </div>
    </div>
  );
}
