'use client';

import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { createSerializer, parseAsInteger } from 'nuqs';
import type { getExamHistory } from '@/actions/user-data';
import type { CategoryWithStats } from '@/actions/categories';
import { CategorySelector } from '@/components/home/CategorySelector';
import { RecentResults } from '@/components/home/RecentResults';
import { StatsGrid } from '@/components/home/StatsGrid';
import { useCategory } from '@/hooks/use-category';
import { useCategoryStats } from '@/hooks/use-category-stats';
import type { CategoryCounts } from '@/lib/category-stats';
import { cn } from '@/lib/utils';

const categorySerializer = createSerializer({ k: parseAsInteger });

type DashboardProps = {
  categories: CategoryWithStats[];
  history: Awaited<ReturnType<typeof getExamHistory>>;
  countsByCategory: CategoryCounts;
};

export function Dashboard({
  categories,
  history,
  countsByCategory,
}: DashboardProps) {
  const { kcod } = useCategory();
  const { history: filteredHistory, stats } = useCategoryStats(
    history,
    countsByCategory
  );

  const selected =
    categories.find((c) => c.kcod === kcod) ?? categories[0] ?? null;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 safe-top lg:max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Αρχική</h1>
        <p className="mt-1 text-sm text-muted-foreground">Καλωσήρθες</p>
      </header>

      <CategorySelector categories={categories} />

      <Link
        href={categorySerializer('/start', { k: kcod })}
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

      <StatsGrid
        examQuestionCount={selected?.examQuestionCount ?? 0}
        stats={stats}
      />

      <RecentResults history={filteredHistory} />
    </div>
  );
}
