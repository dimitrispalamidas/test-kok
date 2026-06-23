import { Suspense } from 'react';
import { getCategories } from '@/actions/categories';
import { QuestionsClient } from '@/components/questions/QuestionsClient';

export default async function QuestionsPage() {
  const categories = await getCategories();

  return (
    <Suspense>
      <QuestionsClient categories={categories} />
    </Suspense>
  );
}
