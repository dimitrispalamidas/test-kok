import { notFound } from 'next/navigation';
import { getPracticeQuestions } from '@/actions/practice';
import { PracticeClient } from '@/components/practice/PracticeClient';
import { isExamCategory } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';

type PracticePageProps = {
  params: Promise<{ kcod: string }>;
};

export default async function PracticePage({ params }: PracticePageProps) {
  const { kcod: kcodParam } = await params;
  const kcod = Number(kcodParam);

  if (!isExamCategory(kcod)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: category } = await supabase
    .from('kateg')
    .select('*')
    .eq('kcod', kcod)
    .single();

  if (!category) {
    notFound();
  }

  let batch;
  try {
    batch = await getPracticeQuestions(kcod, 0, 20);
  } catch {
    notFound();
  }

  return <PracticeClient category={category} initialBatch={batch} />;
}
