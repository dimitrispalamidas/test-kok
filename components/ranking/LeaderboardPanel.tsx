'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Loader2, RefreshCw, Trophy, Zap } from 'lucide-react';
import { getLeaderboard } from '@/actions/user-data';
import { useCategory } from '@/hooks/use-category';
import { XpGuide } from '@/components/ranking/XpGuide';
import { cn } from '@/lib/utils';

type LeaderboardPanelProps = {
  currentUserId: string | null;
};

function rankBadgeClass(rank: number) {
  if (rank === 1) return 'bg-amber-400/20 text-amber-400 ring-2 ring-amber-400/30';
  if (rank === 2) return 'bg-slate-300/20 text-slate-300 ring-2 ring-slate-300/25';
  if (rank === 3) return 'bg-orange-400/20 text-orange-400 ring-2 ring-orange-400/30';
  return 'bg-muted text-muted-foreground';
}

function RankBadge({ rank, size = 'md' }: { rank: number; size?: 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl font-extrabold tabular-nums',
        size === 'lg' ? 'size-14 text-lg' : 'size-12 text-base',
        rankBadgeClass(rank)
      )}
    >
      #{rank}
    </span>
  );
}

function StatPill({
  icon: Icon,
  value,
  iconClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number | string;
  iconClass: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-sm font-semibold text-muted-foreground">
      <Icon className={cn('size-4', iconClass)} />
      {value}
    </span>
  );
}

export function LeaderboardPanel({ currentUserId }: LeaderboardPanelProps) {
  const { kcod } = useCategory();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading, error, isFetching } = useQuery({
    queryKey: ['leaderboard', kcod],
    queryFn: () => getLeaderboard(kcod),
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['leaderboard', kcod] });
  };

  const currentUser = currentUserId
    ? entries.find((entry) => entry.user_id === currentUserId)
    : undefined;

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3, 20);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <XpGuide />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <XpGuide />
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="card-subtitle">Σφάλμα φόρτωσης κατάταξης</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            <RefreshCw className="size-4" />
            Ανανέωση
          </button>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <XpGuide />
        <div className="flex flex-col items-center gap-4 py-12">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="size-10 text-primary" />
          </span>
          <p className="max-w-xs text-center card-subtitle">
            Δεν υπάρχουν ακόμα αποτελέσματα για αυτή την κατηγορία. Ολοκλήρωσε
            ένα τεστ για να μπεις στην κατάταξη!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <XpGuide />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Ανανεώνεται αυτόματα</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 rounded-xl bg-muted/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-opacity disabled:opacity-50"
        >
          <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />
          Ανανέωση
        </button>
      </div>

      {currentUser && (
        <section className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 shadow-sm shadow-primary/10">
          <p className="page-eyebrow">Η θέση σου</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <RankBadge rank={currentUser.rank} size="lg" />
              <div className="min-w-0">
                <p className="truncate card-title">{currentUser.username}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatPill
                    icon={Trophy}
                    value={currentUser.passed_tests}
                    iconClass="text-emerald-400"
                  />
                  {currentUser.best_streak > 0 && (
                    <StatPill
                      icon={Flame}
                      value={currentUser.best_streak}
                      iconClass="text-orange-400"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5 text-2xl font-extrabold tabular-nums text-primary">
                <Zap className="size-5 fill-primary/20" />
                {currentUser.total_xp}
              </div>
              <span className="text-sm font-bold uppercase tracking-wide text-primary/80">
                XP
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="section-title">Κατάταξη</h2>

        {topThree.length > 0 && (
          <div className="grid gap-3">
            {topThree.map((entry) => (
              <LeaderboardRow
                key={entry.user_id}
                entry={entry}
                isCurrentUser={entry.user_id === currentUserId}
                featured
              />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            <ul>
              {rest.map((entry, idx) => (
                <li
                  key={entry.user_id}
                  className={cn(idx > 0 && 'border-t border-border/40')}
                >
                  <LeaderboardRow
                    entry={entry}
                    isCurrentUser={entry.user_id === currentUserId}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
  featured = false,
}: {
  entry: {
    user_id: string;
    username: string;
    total_xp: number;
    total_tests: number;
    passed_tests: number;
    best_streak: number;
    rank: number;
  };
  isCurrentUser: boolean;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4',
        featured ? 'rounded-2xl border border-border/60 bg-card p-4' : 'px-4 py-4',
        isCurrentUser && 'bg-primary/5',
        featured && isCurrentUser && 'border-primary/40'
      )}
    >
      <RankBadge rank={entry.rank} size={featured ? 'lg' : 'md'} />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate font-extrabold leading-tight',
            featured ? 'text-lg' : 'card-title',
            isCurrentUser && 'text-primary'
          )}
        >
          {entry.username}
          {isCurrentUser && (
            <span className="ml-2 text-sm font-semibold text-muted-foreground">
              (εσύ)
            </span>
          )}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatPill
            icon={Trophy}
            value={entry.passed_tests}
            iconClass="text-emerald-400"
          />
          {entry.best_streak > 0 && (
            <StatPill
              icon={Flame}
              value={entry.best_streak}
              iconClass="text-orange-400"
            />
          )}
          <span className="inline-flex items-center rounded-lg bg-muted/60 px-2.5 py-1 text-sm font-semibold text-muted-foreground">
            {entry.total_tests} τεστ
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <div
          className={cn(
            'flex items-center gap-1.5 font-extrabold tabular-nums text-primary',
            featured ? 'text-2xl' : 'text-xl'
          )}
        >
          <Zap className={cn('fill-primary/20', featured ? 'size-5' : 'size-4')} />
          {entry.total_xp}
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          XP
        </span>
      </div>
    </div>
  );
}
