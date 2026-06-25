'use client';

import { ArrowRight, Loader2, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExamActionBarProps = {
  onSkip: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  revealed?: boolean;
  isLast?: boolean;
  isSubmitting?: boolean;
  lastConfirmLabel?: string;
};

export function ExamActionBar({
  onSkip,
  onConfirm,
  confirmDisabled = false,
  revealed = false,
  isLast = false,
  isSubmitting = false,
  lastConfirmLabel,
}: ExamActionBarProps) {
  const confirmLabel = revealed
    ? isLast
      ? (lastConfirmLabel ?? 'Ολοκλήρωση')
      : 'Επόμενη'
    : 'Επιβεβαίωση';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg gap-2 px-4 py-3 lg:max-w-3xl">
        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting || (revealed && isLast)}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-border',
            'px-3 py-3.5 text-sm font-bold uppercase tracking-wide transition-colors hover:border-primary/30',
            'disabled:opacity-40'
          )}
        >
          <SkipForward className="size-4" />
          Παράλειψη
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={confirmDisabled || isSubmitting}
          className={cn(
            'inline-flex flex-[1.4] items-center justify-center gap-2 rounded-2xl',
            'px-3 py-3.5 text-sm font-extrabold uppercase tracking-wide',
            'transition-all active:scale-[0.98] disabled:opacity-40',
            revealed && isLast
              ? 'bg-success text-success-foreground'
              : revealed
                ? 'bg-foreground text-background'
                : 'bg-primary text-primary-foreground'
          )}
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {confirmLabel}
          {!isSubmitting && <ArrowRight className="size-4" />}
        </button>
      </div>
    </div>
  );
}
