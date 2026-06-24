import { getCategories } from '@/actions/categories';
import { RankingClient } from '@/components/ranking/RankingClient';

export default async function RankingPage() {
  const categories = await getCategories();

  return <RankingClient categories={categories} />;
}
