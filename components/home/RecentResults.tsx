'use client';

import { CircleCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type ExamHistoryEntry, getHistory } from '@/lib/stats';
import { cn } from '@/lib/utils';

const dateFormatter = new Intl.DateTimeFormat('el', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function formatDate(iso: string): string {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return '';
  }
}

export function RecentResults() {
  const [history, setHistory] = useState<ExamHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <CircleCheck className="size-4 text-primary" />
        <h2 className="font-semibold">Πρόσφατα Αποτελέσματα</h2>
      </div>

      <div className="space-y-2">
        {history.map((entry) => (
          <article
            key={entry.id}
            className="rounded-2xl border border-border/60 bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{entry.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(entry.completedAt)}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                  entry.passed
                    ? 'bg-success/15 text-success'
                    : 'bg-destructive/15 text-destructive'
                )}
              >
                <CircleCheck className="size-3.5" />
                {entry.percentage}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  entry.passed ? 'bg-success' : 'bg-destructive'
                )}
                style={{ width: `${entry.percentage}%` }}
              />
            </div>

            <p className="mt-2 text-sm tabular-nums text-muted-foreground">
              {entry.score}/{entry.total}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
