'use client';

import { Award, BarChart3, Target, Trophy } from 'lucide-react';
import { useState } from 'react';
import type { getExamHistory } from '@/actions/user-data';
import type { CategoryWithStats } from '@/actions/categories';
import { CategorySelector } from '@/components/home/CategorySelector';
import { useCategoryStats } from '@/hooks/use-category-stats';
import type { CategoryCounts } from '@/lib/category-stats';
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

type RankingClientProps = {
  categories: CategoryWithStats[];
  history: Awaited<ReturnType<typeof getExamHistory>>;
  countsByCategory: CategoryCounts;
};

export function RankingClient({
  categories,
  history,
  countsByCategory,
}: RankingClientProps) {
  const [tab, setTab] = useState<RankingTab>('charts');
  const { stats } = useCategoryStats(history, countsByCategory);

  const successRate =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  const hasData = stats.totalTests > 0;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 safe-top lg:max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Κατάταξη</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Γραφήματα, κατάταξη και επιτεύγματα
        </p>
      </header>

      <CategorySelector categories={categories} />

      <div className="flex rounded-2xl border border-border/60 bg-card p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-colors',
              tab === id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="size-10 text-primary" />
          </span>
          <p className="text-muted-foreground">
            Δεν υπάρχουν δεδομένα για αυτή την κατηγορία
          </p>
        </div>
      ) : tab === 'charts' ? (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={BarChart3}
            value={String(stats.totalTests)}
            label="Συνολικά Τεστ"
          />
          <StatCard
            icon={Target}
            value={`${successRate}%`}
            label="Ποσοστό Επιτυχίας"
          />
          <StatCard
            icon={Trophy}
            value={String(stats.completedExams)}
            label="Επιτυχημένα"
          />
          <StatCard
            icon={Award}
            value={String(stats.bestStreak)}
            label="Καλύτερο Σερί"
            accent="warning"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-24">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="size-10 text-primary" />
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
  accent = 'primary',
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  accent?: 'primary' | 'warning';
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4">
      <Icon
        className={cn(
          'size-5',
          accent === 'warning' ? 'text-warning' : 'text-primary'
        )}
      />
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
