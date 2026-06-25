import { getCategories } from '@/actions/categories';
import {
  getDailyStreakStatus,
  getExamHistory,
  getSavedWrongCountsByCategory,
} from '@/actions/user-data';
import { Dashboard } from '@/components/home/Dashboard';

export default async function HomePage() {
  const [categories, history, countsByCategory, streakStatus] = await Promise.all([
    getCategories(),
    getExamHistory(50),
    getSavedWrongCountsByCategory(),
    getDailyStreakStatus(),
  ]);

  return (
    <Dashboard
      categories={categories}
      history={history}
      countsByCategory={countsByCategory}
      streakStatus={streakStatus}
    />
  );
}
