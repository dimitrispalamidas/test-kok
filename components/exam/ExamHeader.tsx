'use client';

import { Bookmark, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ExamHeaderProps = {
  current: number;
  total: number;
  timerDisplay: string;
  isUrgent?: boolean;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  exitHref?: string;
};

export function ExamHeader({
  current,
  total,
  timerDisplay,
  isUrgent = false,
  bookmarked = false,
  onToggleBookmark,
  exitHref = '/',
}: ExamHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 safe-top">
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
  );
}
