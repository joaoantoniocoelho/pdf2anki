"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className}`}
      aria-hidden
    />
  );
}

export function DeckCardSkeleton() {
  return (
    <div className="bg-white rounded-card-lg border border-border shadow-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 flex-1 max-w-[70%]" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex border-t border-border pt-4 gap-2">
        <Skeleton className="h-9 flex-1 rounded-card" />
        <Skeleton className="h-9 flex-1 rounded-card" />
        <Skeleton className="h-9 w-10 rounded-card" />
      </div>
    </div>
  );
}
