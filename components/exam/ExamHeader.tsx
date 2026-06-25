'use client';

import { Bookmark, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type ExitConfirmation = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ExamHeaderProps = {
  current: number;
  total: number;
  timerDisplay: string;
  isUrgent?: boolean;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  exitHref?: string;
  exitConfirmation?: ExitConfirmation | null;
};

export function ExamHeader({
  current,
  total,
  timerDisplay,
  isUrgent = false,
  bookmarked = false,
  onToggleBookmark,
  exitHref = '/',
  exitConfirmation = null,
}: ExamHeaderProps) {
  const router = useRouter();
  const [confirmingExit, setConfirmingExit] = useState(false);

  const handleConfirmExit = () => {
    router.push(exitHref);
  };

  return (
    <div className="space-y-3 safe-top">
      <header className="flex items-center justify-between gap-3">
        {exitConfirmation ? (
          <button
            type="button"
            onClick={() => setConfirmingExit(true)}
            className={cn(
              'flex size-10 items-center justify-center rounded-xl',
              'text-muted-foreground transition-colors hover:bg-card hover:text-foreground'
            )}
            aria-label="Έξοδος"
          >
            <X className="size-5" />
          </button>
        ) : (
          <Link
            href={exitHref}
            className={cn(
              'flex size-10 items-center justify-center rounded-xl',
              'text-muted-foreground transition-colors hover:bg-card hover:text-foreground'
            )}
            aria-label="Έξοδος"
          >
            <X className="size-5" />
          </Link>
        )}

        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tabular-nums',
            isUrgent
              ? 'border-destructive/50 text-destructive'
              : 'border-border/60 bg-card text-foreground'
          )}
        >
          <Clock className="size-4" />
          {timerDisplay}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {current}/{total}
          </span>
          <button
            type="button"
            onClick={onToggleBookmark}
            className={cn(
              'flex size-10 items-center justify-center rounded-xl transition-colors',
              bookmarked
                ? 'text-warning'
                : 'text-muted-foreground hover:bg-card hover:text-foreground'
            )}
            aria-label="Αποθήκευση ερώτησης"
          >
            <Bookmark className={cn('size-5', bookmarked && 'fill-current')} />
          </button>
        </div>
      </header>

      {confirmingExit && exitConfirmation && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-4">
          <p className="text-sm font-bold text-foreground">{exitConfirmation.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{exitConfirmation.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setConfirmingExit(false)}
              className={cn(
                'inline-flex flex-1 items-center justify-center rounded-xl border border-border/60',
                'px-4 py-2.5 text-sm font-bold transition-colors hover:bg-card sm:flex-none'
              )}
            >
              {exitConfirmation.cancelLabel ?? 'Συνέχισε'}
            </button>
            <button
              type="button"
              onClick={handleConfirmExit}
              className={cn(
                'inline-flex flex-1 items-center justify-center rounded-xl',
                'bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground',
                'transition-all hover:brightness-110 sm:flex-none'
              )}
            >
              {exitConfirmation.confirmLabel ?? 'Έξοδος'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
