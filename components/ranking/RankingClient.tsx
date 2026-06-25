'use client';

import { Award, BarChart3, Target, Trophy } from 'lucide-react';
import { useState } from 'react';
import { CategorySelector } from '@/components/home/CategorySelector';
import { LeaderboardPanel } from '@/components/ranking/LeaderboardPanel';
import { PageSkeleton, StatsGridSkeleton } from '@/components/ui/PageSkeleton';
import { useCategoryStats } from '@/hooks/use-category-stats';
import {
  useCategories,
  useCurrentUser,
  useExamHistory,
  useSavedWrongCountsByCategory,
} from '@/hooks/use-user-data';
import { cn } from '@/lib/utils';

type RankingTab = 'charts' | 'ranking' | 'achievements';

const tabs: {
  id: RankingTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'charts', label: 'Γραφήματα', icon: BarChart3 },
  { id: 'ranking', label: 'Κατάταξη', icon: Trophy },
  { id: 'achievements', label: 'Επιτεύγματα', icon: Award },
];

export function RankingClient() {
  const [tab, setTab] = useState<RankingTab>('charts');
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: history = [], isLoading: historyLoading } = useExamHistory(50);
  const { data: countsByCategory = {} } = useSavedWrongCountsByCategory();
  const { data: currentUser } = useCurrentUser();

  const { stats } = useCategoryStats(history, countsByCategory);

  const successRate =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  const hasData = stats.totalTests > 0;
  const statsLoading = historyLoading;

  if (categoriesLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="page-container space-y-6">
      <header className="space-y-1">
        <p className="page-eyebrow">Πρόοδος</p>
        <h1 className="page-title">Κατάταξη</h1>
      </header>

      <CategorySelector categories={categories} />

      <div className="flex rounded-2xl border border-border/60 bg-card p-1.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-colors',
              tab === id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {!hasData && tab === 'charts' && !statsLoading ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="size-10 text-primary" />
          </span>
          <p className="text-muted-foreground">
            Δεν υπάρχουν δεδομένα για αυτή την κατηγορία
          </p>
        </div>
      ) : tab === 'charts' ? (
        statsLoading ? (
          <StatsGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={BarChart3}
              value={String(stats.totalTests)}
              label="Συνολικά Τεστ"
              iconBg="bg-primary/15"
              iconColor="text-primary"
            />
            <StatCard
              icon={Target}
              value={`${successRate}%`}
              label="Ποσοστό Επιτυχίας"
              iconBg="bg-success/15"
              iconColor="text-success"
            />
            <StatCard
              icon={Trophy}
              value={String(stats.completedExams)}
              label="Επιτυχημένα"
              iconBg="bg-emerald-400/15"
              iconColor="text-emerald-400"
            />
            <StatCard
              icon={Award}
              value={String(stats.bestStreak)}
              label="Καλύτερο Σερί"
              iconBg="bg-warning/15"
              iconColor="text-warning"
            />
          </div>
        )
      ) : tab === 'ranking' ? (
        <LeaderboardPanel currentUserId={currentUser?.id ?? null} />
      ) : (
        <div className="flex flex-col items-center gap-4 py-24">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Award className="size-10 text-primary" />
          </span>
          <p className="text-muted-foreground">Σύντομα διαθέσιμο</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  iconBg,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5">
      <span className={cn('flex size-10 items-center justify-center rounded-xl', iconBg)}>
        <Icon className={cn('size-5', iconColor)} />
      </span>
      <div>
        <p className="text-3xl font-extrabold tabular-nums">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
