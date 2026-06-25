import { cn } from '@/lib/utils';

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-muted/70',
        className
      )}
    />
  );
}

type PageSkeletonProps = {
  showStats?: boolean;
  showCta?: boolean;
};

export function PageSkeleton({
  showStats = true,
  showCta = true,
}: PageSkeletonProps) {
  return (
    <div className="page-container space-y-6" aria-busy="true" aria-label="Φόρτωση">
      <header className="space-y-2">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-9 w-56" />
      </header>

      <SkeletonBlock className="h-14 w-full" />

      {showCta && <SkeletonBlock className="h-[4.75rem] w-full" />}

      {showStats && (
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
      )}

      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-20 w-full" />
      </div>
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3" aria-busy="true">
      <SkeletonBlock className="h-28" />
      <SkeletonBlock className="h-28" />
      <SkeletonBlock className="h-28" />
      <SkeletonBlock className="h-28" />
    </div>
  );
}
