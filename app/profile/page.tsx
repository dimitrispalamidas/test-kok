import { getCategories } from '@/actions/categories';
import {
  getExamHistory,
  getSavedWrongCountsByCategory,
} from '@/actions/user-data';
import { ProfileClient } from '@/components/profile/ProfileClient';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const [categories, supabase] = await Promise.all([
    getCategories(),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [history, countsByCategory] = user
    ? await Promise.all([
        getExamHistory(50),
        getSavedWrongCountsByCategory(),
      ])
    : [[], {}];

  return (
    <ProfileClient
      categories={categories}
      user={user ? { email: user.email ?? '', id: user.id } : null}
      history={history}
      countsByCategory={countsByCategory}
    />
  );
}
