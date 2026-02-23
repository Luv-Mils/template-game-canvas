import React from 'react';

interface SkeletonProps {
  /** Width class (default: 'w-full') */
  width?: string;
  /** Height class (default: 'h-4') */
  height?: string;
  /** Border radius class (default: 'rounded') */
  rounded?: string;
  /** Additional className */
  className?: string;
}

export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-border/50 ${width} ${height} ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

/** Pre-built skeleton for a text block (3 lines of varying width) */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

/** Pre-built skeleton for a card */
export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
      <Skeleton height="h-40" rounded="rounded-xl" />
      <Skeleton width="w-3/4" height="h-5" />
      <Skeleton width="w-full" />
      <Skeleton width="w-5/6" />
    </div>
  );
}
