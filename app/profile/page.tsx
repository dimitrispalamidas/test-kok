import { getCategories } from '@/actions/categories';
import { ProfileClient } from '@/components/profile/ProfileClient';

export default async function ProfilePage() {
  const categories = await getCategories();

  return <ProfileClient categories={categories} />;
}
