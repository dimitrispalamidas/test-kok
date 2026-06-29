'use client';

import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { CategorySelector } from '@/components/home/CategorySelector';
import { DailyStreakBanner } from '@/components/home/DailyStreakBanner';
import { StatsGrid } from '@/components/home/StatsGrid';
import { PageSkeleton, StatsGridSkeleton } from '@/components/ui/PageSkeleton';
import { useCategory } from '@/hooks/use-category';
import { useCategoryStats } from '@/hooks/use-category-stats';
import {
  useCategories,
  useCategoryStreakStats,
  useDailyStreakStatus,
  useExamHistory,
  useSavedWrongCountsByCategory,
} from '@/hooks/use-user-data';
import { hrefWithCategory } from '@/lib/category-url';
import { EMPTY_CATEGORY_STREAK_STATS } from '@/lib/category-streak';

export function Dashboard() {
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: history = [], isLoading: historyLoading } = useExamHistory(50);
  const { data: countsByCategory = {} } = useSavedWrongCountsByCategory();
  const { data: streakStatus } = useDailyStreakStatus();

  const { kcod } = useCategory();
  const { stats } = useCategoryStats(history, countsByCategory);
  const { data: categoryStreakStats, isLoading: categoryStreakLoading } =
    useCategoryStreakStats(kcod);

  if (categoriesLoading) {
    return <PageSkeleton showRecentResults={false} />;
  }

  return (
    <div className="page-container space-y-6">
      <header className="space-y-1">
        <p className="page-eyebrow">Καλωσήρθες</p>
        <h1 className="page-title">Έτοιμος για εξάσκηση;</h1>
      </header>

      <CategorySelector categories={categories} />

      {streakStatus && <DailyStreakBanner status={streakStatus} />}

      <Link
        href={hrefWithCategory('/start', kcod)}
        className="group flex w-full items-center gap-4 rounded-2xl bg-primary px-6 py-5 font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Play className="size-5 fill-current" />
        </span>
        <span className="flex-1 text-left text-lg">Έναρξη Τεστ</span>
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
      </Link>

      {historyLoading || categoryStreakLoading ? (
        <StatsGridSkeleton />
      ) : (
        <StatsGrid
          stats={stats}
          dailyStreak={
            categoryStreakStats?.dailyStreak ??
            EMPTY_CATEGORY_STREAK_STATS.dailyStreak
          }
          answerStreak={
            categoryStreakStats?.answerStreak ??
            EMPTY_CATEGORY_STREAK_STATS.answerStreak
          }
        />
      )}
    </div>
  );
}
