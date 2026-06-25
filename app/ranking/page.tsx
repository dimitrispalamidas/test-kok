import { getCategories } from '@/actions/categories';
import { getExamHistory, getSavedWrongCountsByCategory } from '@/actions/user-data';
import { RankingClient } from '@/components/ranking/RankingClient';
import { createClient } from '@/lib/supabase/server';

export default async function RankingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      currentUserId={user?.id ?? null}
    />
  );
}
