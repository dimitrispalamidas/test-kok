import { notFound } from 'next/navigation';
import {
  getPracticeQuestions,
  getQuickPracticeQuestions,
  getWeakPracticeQuestions,
} from '@/actions/practice';
import { PracticeClient } from '@/components/practice/PracticeClient';
import { isExamCategory } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';

type PracticeMode = 'quick' | 'weak' | null;

type PracticePageProps = {
  params: Promise<{ kcod: string }>;
  searchParams: Promise<{ theme?: string; mode?: string }>;
};

export default async function PracticePage({
  params,
  searchParams,
}: PracticePageProps) {
  const { kcod: kcodParam } = await params;
  const { theme, mode: modeParam } = await searchParams;
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

  const mode: PracticeMode =
    modeParam === 'quick' ? 'quick' : modeParam === 'weak' ? 'weak' : null;

  let batch;
  try {
    if (mode === 'quick') {
      batch = await getQuickPracticeQuestions(kcod);
    } else if (mode === 'weak') {
      batch = await getWeakPracticeQuestions(kcod);
    } else {
      batch = await getPracticeQuestions(kcod, 0, 20, theme);
    }
  } catch {
    notFound();
  }

  return (
    <PracticeClient
      category={category}
      initialBatch={batch}
      theme={theme ?? null}
      mode={mode}
    />
  );
}
