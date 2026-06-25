'use client';

import { Flame } from 'lucide-react';
import type { DailyStreakStatus } from '@/lib/daily-streak';
import { cn } from '@/lib/utils';

type DailyStreakBannerProps = {
  status: DailyStreakStatus;
};

export function DailyStreakBanner({ status }: DailyStreakBannerProps) {
  if (!status.welcomeMessage) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3',
        status.atRisk
          ? 'border-amber-400/40 bg-amber-400/10'
          : 'border-orange-400/40 bg-orange-400/10'
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl',
          status.atRisk ? 'bg-amber-400/20' : 'bg-orange-400/20'
        )}
      >
        <Flame
          className={cn(
            'size-5',
            status.atRisk ? 'text-amber-400' : 'text-orange-400'
          )}
        />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-bold">
          {status.atRisk ? 'Κράτησε το σερί σου!' : 'Ημερήσιο σερί τεστ'}
        </p>
        <p className="text-sm text-muted-foreground">{status.welcomeMessage}</p>
      </div>
    </div>
  );
}
