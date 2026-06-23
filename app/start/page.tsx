import { getCategories } from '@/actions/categories';
import { getTopics } from '@/actions/topics';
import { StartTestClient } from '@/components/start/StartTestClient';
import { EXAM_CATEGORIES } from '@/lib/constants';

export default async function StartPage() {
  const categories = await getCategories();

  const topicCountByKcod: Record<number, number> = {};
  for (const kcod of EXAM_CATEGORIES) {
    const topics = await getTopics(kcod);
    topicCountByKcod[kcod] = topics.length;
  }

  return (
    <StartTestClient
      categories={categories}
      topicCountByKcod={topicCountByKcod}
    />
  );
}
