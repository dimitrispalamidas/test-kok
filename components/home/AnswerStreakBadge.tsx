'use client';

import { Sparkles } from 'lucide-react';
import { XP_ANSWER_STREAK_BONUS } from '@/lib/xp-rewards';
import { cn } from '@/lib/utils';

type AnswerStreakBadgeProps = {
  count: number;
  toNextBonus?: number;
  size?: 'sm' | 'md';
  className?: string;
};

export function AnswerStreakBadge({
  count,
  toNextBonus,
  size = 'md',
  className,
}: AnswerStreakBadgeProps) {
  if (count <= 0) return null;

  const remainder =
    toNextBonus ??
    (count % 10 === 0 ? 10 : 10 - (count % 10));

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-400/10',
        size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2.5',
        className
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl bg-violet-400/20',
          size === 'sm' ? 'size-7' : 'size-9'
        )}
      >
        <Sparkles
          className={cn(
            'text-violet-400',
            size === 'sm' ? 'size-3.5' : 'size-4'
          )}
        />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            'font-extrabold tabular-nums leading-none',
            size === 'sm' ? 'text-sm' : 'text-base'
          )}
        >
          {count} σερί σωστών
        </p>
        <p
          className={cn(
            'mt-0.5 text-muted-foreground',
            size === 'sm' ? 'text-[11px]' : 'text-xs'
          )}
        >
          {remainder} ακόμα για +{XP_ANSWER_STREAK_BONUS} XP
        </p>
      </div>
    </div>
  );
}
