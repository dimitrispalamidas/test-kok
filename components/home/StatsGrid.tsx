import type { CategoryStats } from '@/lib/category-stats';
import { getDailyStreakStatLabel, STAT_LABELS } from '@/lib/constants';
import { getQuickTestStatLabel, HOME_STAT_DISPLAY } from '@/lib/stat-display';

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
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

type StatsGridProps = {
  stats: CategoryStats;
  dailyStreak: {
    currentStreak: number;
    longestStreak: number;
  };
  answerStreak: {
    currentStreak: number;
    bestStreak: number;
  };
};

export function StatsGrid({
  stats,
  dailyStreak,
  answerStreak,
}: StatsGridProps) {
  const quickTests = stats.quickTests;
  const simulationTests = stats.simulationTests;
  const quickDisplay = HOME_STAT_DISPLAY.quickTests;
  const simulationDisplay = HOME_STAT_DISPLAY.simulationTests;
  const dailyDisplay = HOME_STAT_DISPLAY.dailyStreak;
  const answerDisplay = HOME_STAT_DISPLAY.answerStreak;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={quickDisplay.icon}
        value={String(quickTests)}
        label={getQuickTestStatLabel(quickTests)}
        iconBg={quickDisplay.iconBg}
        iconColor={quickDisplay.iconColor}
      />
      <StatCard
        icon={simulationDisplay.icon}
        value={String(simulationTests)}
        label={STAT_LABELS.simulationTests}
        iconBg={simulationDisplay.iconBg}
        iconColor={simulationDisplay.iconColor}
      />
      <StatCard
        icon={dailyDisplay.icon}
        value={String(
          dailyStreak.currentStreak > 0
            ? dailyStreak.currentStreak
            : dailyStreak.longestStreak
        )}
        label={getDailyStreakStatLabel(dailyStreak.currentStreak)}
        iconBg={dailyDisplay.iconBg}
        iconColor={dailyDisplay.iconColor}
      />
      <StatCard
        icon={answerDisplay.icon}
        value={String(answerStreak.bestStreak)}
        label={STAT_LABELS.answerStreakBest}
        iconBg={answerDisplay.iconBg}
        iconColor={answerDisplay.iconColor}
      />
    </div>
  );
}
