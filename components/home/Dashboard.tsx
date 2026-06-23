'use client';

import { ArrowRight, Flame, Play, Target } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CategoryWithStats } from '@/actions/categories';
import { CategorySelector } from '@/components/home/CategorySelector';
import { RecentResults } from '@/components/home/RecentResults';
import { StatsGrid } from '@/components/home/StatsGrid';
import { useCategoryStore } from '@/lib/store/category-store';
import { getStats, getSuccessRate } from '@/lib/stats';
import { cn } from '@/lib/utils';

type DashboardProps = {
  categories: CategoryWithStats[];
};

export function Dashboard({ categories }: DashboardProps) {
  const { kcod } = useCategoryStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selected =
    categories.find((c) => c.kcod === kcod) ?? categories[0] ?? null;

  const stats = mounted ? getStats() : null;
  const successRate = stats ? getSuccessRate(stats) : 0;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6 safe-top">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="pointer-events-none absolute right-4 top-4 opacity-20">
          <svg width="60" height="40" viewBox="0 0 60 40" aria-hidden>
            <path
              d="M0 20 Q15 10 30 20 T60 20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
              className="text-primary"
            />
          </svg>
        </div>

        <p className="text-sm text-muted-foreground">Καλωσήρθες</p>
        <h1 className="text-2xl font-bold tracking-tight">Αρχική</h1>

        <div className="mt-3 flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            <Target className="size-3.5" />
            {successRate}%
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">
            <Flame className="size-3.5" />
            {stats?.bestStreak ?? 0}
          </span>
        </div>
      </header>

      {/* Category selector */}
      <CategorySelector categories={categories} />

      {/* Start test CTA → middle page */}
      <Link
        href="/start"
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl bg-primary px-5 py-4',
          'font-semibold text-primary-foreground shadow-lg shadow-primary/20',
          'transition-transform active:scale-[0.98]'
        )}
      >
        <Play className="size-5 fill-current" />
        <span className="flex-1 text-left">Έναρξη Τεστ</span>
        <ArrowRight className="size-5" />
      </Link>

      {/* Stats */}
      <StatsGrid examQuestionCount={selected?.examQuestionCount ?? 0} />

      {/* Recent results */}
      <RecentResults />
    </div>
  );
}
