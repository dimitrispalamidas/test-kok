'use client';

import type { CategoryWithStats } from '@/actions/categories';
import { CategorySelector } from '@/components/home/CategorySelector';
import { TestOptionsList } from '@/components/home/TestOptionsList';
import { useCategory } from '@/hooks/use-category';

type StartTestClientProps = {
  categories: CategoryWithStats[];
  topicCountByKcod: Record<number, number>;
};

export function StartTestClient({
  categories,
  topicCountByKcod,
}: StartTestClientProps) {
  const { kcod } = useCategory();

  const selected =
    categories.find((c) => c.kcod === kcod) ?? categories[0] ?? null;

  const examCount = selected?.examQuestionCount ?? 0;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 safe-top lg:max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Τεστ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Επίλεξε τον τύπο εξέτασης
        </p>
      </header>

      <CategorySelector categories={categories} />

      <TestOptionsList
        examQuestionCount={examCount}
        topicCount={topicCountByKcod[kcod] ?? 0}
      />
    </div>
  );
}
