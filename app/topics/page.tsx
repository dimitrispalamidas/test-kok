import { getCategories } from '@/actions/categories';
import { getTopics } from '@/actions/topics';
import { TopicsClient } from '@/components/topics/TopicsClient';
import { EXAM_CATEGORIES } from '@/lib/constants';

export default async function TopicsPage() {
  const categories = await getCategories();

  const topicsByKcod: Record<
    number,
    Awaited<ReturnType<typeof getTopics>>
  > = {};

  for (const kcod of EXAM_CATEGORIES) {
    topicsByKcod[kcod] = await getTopics(kcod);
  }

  return <TopicsClient categories={categories} topicsByKcod={topicsByKcod} />;
}
