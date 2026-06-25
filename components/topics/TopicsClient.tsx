'use client';

import type { CategoryWithStats } from '@/actions/categories';
import type { TopicWithCount } from '@/actions/topics';
import { CategorySelector } from '@/components/home/CategorySelector';
import { TopicList } from '@/components/questions/TopicList';
import { useCategory } from '@/hooks/use-category';

type TopicsClientProps = {
  categories: CategoryWithStats[];
  topicsByKcod: Record<number, TopicWithCount[]>;
};

export function TopicsClient({ categories, topicsByKcod }: TopicsClientProps) {
  const { kcod } = useCategory();
  const topics = topicsByKcod[kcod] ?? [];

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6 safe-top lg:max-w-3xl">
      <header className="space-y-1">
        <p className="page-eyebrow">Εξάσκηση</p>
        <h1 className="page-title">Ανά Θέμα</h1>
      </header>

      <CategorySelector categories={categories} />

      <TopicList topics={topics} kcod={kcod} />
    </div>
  );
}
