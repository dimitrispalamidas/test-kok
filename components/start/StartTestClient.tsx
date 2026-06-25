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
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6 safe-top lg:max-w-3xl">
      <header className="space-y-1">
        <p className="page-eyebrow">Εξάσκηση</p>
        <h1 className="page-title">Τεστ</h1>
      </header>

      <CategorySelector categories={categories} />

      <TestOptionsList
        examQuestionCount={examCount}
        topicCount={topicCountByKcod[kcod] ?? 0}
      />
    </div>
  );
}
