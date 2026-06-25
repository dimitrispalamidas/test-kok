import { getCategories } from '@/actions/categories';
import { getTopics } from '@/actions/topics';
import { StartTestClient } from '@/components/start/StartTestClient';
import { EXAM_CATEGORIES } from '@/lib/constants';

export default async function StartPage() {
  const [categories, ...topicLists] = await Promise.all([
    getCategories(),
    ...EXAM_CATEGORIES.map((kcod) => getTopics(kcod)),
  ]);

  const topicCountByKcod = Object.fromEntries(
    EXAM_CATEGORIES.map((kcod, index) => [kcod, topicLists[index]?.length ?? 0])
  );

  return (
    <StartTestClient
      categories={categories}
      topicCountByKcod={topicCountByKcod}
    />
  );
}
