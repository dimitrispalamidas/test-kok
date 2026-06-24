'use client';

import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import type { CategoryWithStats } from '@/actions/categories';
import { CategorySelector } from '@/components/home/CategorySelector';
import { RecentResults } from '@/components/home/RecentResults';
import { StatsGrid } from '@/components/home/StatsGrid';
import { useCategoryStore } from '@/lib/store/category-store';
import { cn } from '@/lib/utils';

type DashboardProps = {
  categories: CategoryWithStats[];
};

export function Dashboard({ categories }: DashboardProps) {
  const { kcod } = useCategoryStore();

  const selected =
    categories.find((c) => c.kcod === kcod) ?? categories[0] ?? null;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 safe-top lg:max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Αρχική</h1>
        <p className="mt-1 text-sm text-muted-foreground">Καλωσήρθες</p>
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
