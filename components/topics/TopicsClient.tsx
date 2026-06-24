'use client';

import { BookOpen } from 'lucide-react';
import type { CategoryWithStats } from '@/actions/categories';
import type { TopicWithCount } from '@/actions/topics';
import { CategorySelector } from '@/components/home/CategorySelector';
import { TopicList } from '@/components/questions/TopicList';
import { useCategoryStore } from '@/lib/store/category-store';

type TopicsClientProps = {
  categories: CategoryWithStats[];
  topicsByKcod: Record<number, TopicWithCount[]>;
};

export function TopicsClient({ categories, topicsByKcod }: TopicsClientProps) {
  const { kcod } = useCategoryStore();
  const topics = topicsByKcod[kcod] ?? [];

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 safe-top lg:max-w-3xl">
      <header>
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h1 className="text-2xl font-bold">Ανά Θέμα</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Εξάσκηση ανά θεματική ενότητα
        </p>
      </header>

      <CategorySelector categories={categories} />

      <TopicList topics={topics} kcod={kcod} />
    </div>
  );
}
