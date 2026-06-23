'use client';

import { Bookmark, Hash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CategoryWithStats } from '@/actions/categories';
import { CategorySelector } from '@/components/home/CategorySelector';
import { TestOptionsList } from '@/components/home/TestOptionsList';
import { useCategoryStore } from '@/lib/store/category-store';
import { getStats } from '@/lib/stats';

type StartTestClientProps = {
  categories: CategoryWithStats[];
  topicCountByKcod: Record<number, number>;
};

export function StartTestClient({
  categories,
  topicCountByKcod,
}: StartTestClientProps) {
  const { kcod } = useCategoryStore();
  const [savedCount, setSavedCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    const stats = getStats();
    setSavedCount(stats.savedCount);
    setWrongCount(stats.wrongCount);
  }, []);

  const selected =
    categories.find((c) => c.kcod === kcod) ?? categories[0] ?? null;

  const examCount = selected?.examQuestionCount ?? 0;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 safe-top">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold">Έναρξη Τεστ</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            <Hash className="size-3.5" />
            {examCount} ερωτήσεις
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">
            <Bookmark className="size-3.5" />
            {savedCount}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1 text-xs font-medium text-destructive">
            <X className="size-3.5" />
            {wrongCount}
          </span>
        </div>
      </header>

      {/* Category selector */}
      <CategorySelector categories={categories} />

      {/* Test options (Έτοιμο Τεστ, Ανά Θέμα, Τυχαίο, Αποθηκευμένες, Λανθασμένες) */}
      <TestOptionsList
        examQuestionCount={examCount}
        topicCount={topicCountByKcod[kcod] ?? 0}
      />
    </div>
  );
}
