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
    <div className="page-container space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <p className="page-eyebrow">Καλωσήρθες</p>
        <h1 className="page-title">Έτοιμος για εξάσκηση;</h1>
      </header>

      <CategorySelector categories={categories} />

      {/* CTA */}
      <Link
        href={categorySerializer('/start', { k: kcod })}
        className="group flex w-full items-center gap-4 rounded-2xl bg-primary px-6 py-5 font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Play className="size-5 fill-current" />
        </span>
        <span className="flex-1 text-left text-lg">Έναρξη Τεστ</span>
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
      </Link>

      <StatsGrid
        examQuestionCount={selected?.examQuestionCount ?? 0}
        stats={stats}
      />

      <RecentResults history={filteredHistory} />
    </div>
  );
}
