'use client';

import { ArrowRight, CircleHelp, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExamActionBarProps = {
  onSkip: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  helpsRemaining?: number;
};

export function ExamActionBar({
  onSkip,
  onConfirm,
  confirmDisabled = false,
  helpsRemaining = 3,
}: ExamActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onSkip}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border',
            'px-3 py-3.5 text-sm font-medium transition-colors hover:border-primary/30'
          )}
        >
          <SkipForward className="size-4" />
          Παράλειψη
        </button>

        <button
          type="button"
          disabled
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl',
            'border border-warning/50 px-3 py-3.5 text-sm font-medium text-warning',
            'opacity-80'
          )}
        >
          <CircleHelp className="size-4" />
          {helpsRemaining} βοήθειες
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={confirmDisabled}
          className={cn(
            'inline-flex flex-[1.2] items-center justify-center gap-2 rounded-2xl bg-primary',
            'px-3 py-3.5 text-sm font-semibold text-primary-foreground',
            'transition-transform active:scale-[0.98] disabled:opacity-50'
          )}
        >
          Επιβεβαίωση
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
