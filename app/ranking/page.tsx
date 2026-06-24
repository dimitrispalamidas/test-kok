import { getCategories } from '@/actions/categories';
import { getExamHistory, getSavedWrongCountsByCategory } from '@/actions/user-data';
import { RankingClient } from '@/components/ranking/RankingClient';

export default async function RankingPage() {
  const [categories, history, countsByCategory] = await Promise.all([
    getCategories(),
    getExamHistory(50),
    getSavedWrongCountsByCategory(),
  ]);

  return (
    <RankingClient
      categories={categories}
      history={history}
      countsByCategory={countsByCategory}
    />
  );
}
