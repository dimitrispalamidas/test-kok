import { getCategories } from '@/actions/categories';
import {
  getExamHistory,
  getSavedWrongCountsByCategory,
} from '@/actions/user-data';
import { Dashboard } from '@/components/home/Dashboard';

export default async function HomePage() {
  const [categories, history, countsByCategory] = await Promise.all([
    getCategories(),
    getExamHistory(50),
    getSavedWrongCountsByCategory(),
  ]);

  return (
    <Dashboard
      categories={categories}
      history={history}
      countsByCategory={countsByCategory}
    />
  );
}
