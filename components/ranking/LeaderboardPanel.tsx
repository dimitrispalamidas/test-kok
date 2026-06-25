'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  RefreshCw,
  Trophy,
  Zap,
} from 'lucide-react';
import { getLeaderboard } from '@/actions/user-data';
import { useCategory } from '@/hooks/use-category';
import {
  LeaderboardAvatar,
  LeaderboardRankIndicator,
} from '@/components/ranking/LeaderboardRankDisplay';
import { XpGuide } from '@/components/ranking/XpGuide';
import { queryKeys } from '@/lib/query-keys';
import { HOME_STAT_DISPLAY } from '@/lib/stat-display';
import type { LeaderboardEntry } from '@/types/database';
import { cn } from '@/lib/utils';

type LeaderboardPanelProps = {
  currentUserId: string | null;
};

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

function LeaderboardStats({ entry }: { entry: LeaderboardEntry }) {
  const dailyStreak =
    entry.daily_streak_current > 0
      ? entry.daily_streak_current
      : entry.daily_streak_longest;

  const quickDisplay = HOME_STAT_DISPLAY.quickTests;
  const simulationDisplay = HOME_STAT_DISPLAY.simulationTests;
  const dailyDisplay = HOME_STAT_DISPLAY.dailyStreak;
  const answerDisplay = HOME_STAT_DISPLAY.answerStreak;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <StatPill
        icon={quickDisplay.icon}
        value={entry.quick_tests}
        iconClass={quickDisplay.iconColor}
      />
      <StatPill
        icon={simulationDisplay.icon}
        value={entry.simulation_tests}
        iconClass={simulationDisplay.iconColor}
      />
      <StatPill
        icon={dailyDisplay.icon}
        value={dailyStreak}
        iconClass={dailyDisplay.iconColor}
      />
      <StatPill
        icon={answerDisplay.icon}
        value={entry.best_answer_streak}
        iconClass={answerDisplay.iconColor}
      />
    </div>
  );
}

export function LeaderboardPanel({ currentUserId }: LeaderboardPanelProps) {
  const { kcod } = useCategory();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: queryKeys.leaderboard(kcod),
    queryFn: () => getLeaderboard(kcod),
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard(kcod) });
  };

  const currentUser = currentUserId
    ? entries.find((entry) => entry.user_id === currentUserId)
    : undefined;

  const listEntries = entries.slice(0, 20);

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

      {currentUser && (
        <section className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 shadow-sm shadow-primary/10">
          <p className="page-eyebrow">Η θέση σου</p>
          <div className="mt-3">
            <LeaderboardRow
              entry={currentUser}
              isCurrentUser
              featured
            />
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="card-title">Κατάταξη</h2>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <ul>
            {listEntries.map((entry, idx) => (
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
      </section>
    </div>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
  featured = false,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        featured ? 'py-0' : 'px-4 py-3.5',
        isCurrentUser && !featured && 'bg-primary/5'
      )}
    >
      <LeaderboardRankIndicator rank={entry.rank} size={featured ? 'lg' : 'md'} />

      <LeaderboardAvatar
        username={entry.username}
        avatarUrl={entry.avatar_url}
        size={featured ? 'lg' : 'md'}
      />

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
        <LeaderboardStats entry={entry} />
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
