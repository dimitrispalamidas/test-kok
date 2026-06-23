import { getCategories } from '@/actions/categories';
import { Dashboard } from '@/components/home/Dashboard';

export default async function HomePage() {
  const categories = await getCategories();

  return <Dashboard categories={categories} />;
}
