import { BarChart3, ClipboardList, Flame, Target } from 'lucide-react';
import type { CategoryStats } from '@/lib/category-stats';

type StatCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  iconBg: string;
  iconColor: string;
};

function StatCard({ icon: Icon, value, label, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5">
      <span className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`size-5 ${iconColor}`} />
      </span>
      <div>
        <p className="text-3xl font-extrabold tabular-nums">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

type StatsGridProps = {
  examQuestionCount?: number;
  stats: CategoryStats;
};

export function StatsGrid({ examQuestionCount = 0, stats }: StatsGridProps) {
  const totalTests = stats.totalTests;
  const successRate =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;
  const bestStreak = stats.bestStreak;
  const completedExams = stats.completedExams;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={BarChart3}
        value={String(totalTests)}
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
        icon={Flame}
        value={String(bestStreak)}
        label="Καλύτερο Σερί"
        iconBg="bg-warning/15"
        iconColor="text-warning"
      />
      <StatCard
        icon={ClipboardList}
        value={`${completedExams}/${examQuestionCount > 0 ? '∞' : '0'}`}
        label="Τεστ Ολοκλήρωσης"
        iconBg="bg-primary/15"
        iconColor="text-primary"
      />
    </div>
  );
}
