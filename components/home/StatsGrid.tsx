'use client';

import { BarChart3, ClipboardList, Flame, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStats, getSuccessRate, type UserStats } from '@/lib/stats';
import { cn } from '@/lib/utils';

type StatCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  accent?: 'primary' | 'warning';
};

function StatCard({
  icon: Icon,
  value,
  label,
  accent = 'primary',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4',
        'transition-colors hover:border-primary/20'
      )}
    >
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

type StatsGridProps = {
  examQuestionCount?: number;
};

export function StatsGrid({ examQuestionCount = 0 }: StatsGridProps) {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  const successRate = stats ? getSuccessRate(stats) : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={BarChart3}
        value={String(stats?.totalTests ?? 0)}
        label="Συνολικά Τεστ"
      />
      <StatCard
        icon={Target}
        value={`${successRate}%`}
        label="Ποσοστό Επιτυχίας"
      />
      <StatCard
        icon={Flame}
        value={String(stats?.bestStreak ?? 0)}
        label="Καλύτερο Σερί"
        accent="warning"
      />
      <StatCard
        icon={ClipboardList}
        value={`${stats?.completedExams ?? 0}/${examQuestionCount > 0 ? '∞' : '0'}`}
        label="Τεστ Ολοκλήρωσης"
      />
    </div>
  );
}
