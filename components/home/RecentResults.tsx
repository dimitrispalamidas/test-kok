import { CheckCircle2, XCircle } from 'lucide-react';
import type { getExamHistory } from '@/actions/user-data';
import { cn } from '@/lib/utils';

type HistoryEntry = Awaited<ReturnType<typeof getExamHistory>>[number];

type RecentResultsProps = {
  history: HistoryEntry[];
};

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

export function RecentResults({ history }: RecentResultsProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="section-title">Πρόσφατα Αποτελέσματα</h2>

      <div className="space-y-3">
        {history.map((entry) => (
          <article
            key={entry.id}
            className="rounded-2xl border border-border/60 bg-card p-4"
          >
            <div className="flex items-center gap-3">
              {/* Pass/fail icon */}
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  entry.passed ? 'bg-success/15' : 'bg-destructive/15'
                )}
              >
                {entry.passed ? (
                  <CheckCircle2 className="size-5 text-success" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )}
              </span>

              {/* Title & date */}
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{entry.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(entry.created_at)}
                </p>
              </div>

              {/* Score badge */}
              <div className="text-right">
                <p
                  className={cn(
                    'text-xl font-extrabold tabular-nums',
                    entry.passed ? 'text-success' : 'text-destructive'
                  )}
                >
                  {entry.percentage}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.score}/{entry.total}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  entry.passed ? 'bg-success' : 'bg-destructive'
                )}
                style={{ width: `${entry.percentage}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
