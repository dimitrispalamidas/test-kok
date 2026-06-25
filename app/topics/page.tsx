import { getCategories } from '@/actions/categories';
import { getTopics } from '@/actions/topics';
import { TopicsClient } from '@/components/topics/TopicsClient';
import { EXAM_CATEGORIES } from '@/lib/constants';

export default async function TopicsPage() {
  const [categories, ...topicLists] = await Promise.all([
    getCategories(),
    ...EXAM_CATEGORIES.map((kcod) => getTopics(kcod)),
  ]);

  const topicsByKcod = Object.fromEntries(
    EXAM_CATEGORIES.map((kcod, index) => [kcod, topicLists[index] ?? []])
  );

  return <TopicsClient categories={categories} topicsByKcod={topicsByKcod} />;
}
