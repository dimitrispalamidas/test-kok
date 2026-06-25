'use server';

import { unstable_cache } from 'next/cache';
import { isExamCategory, LANG } from '@/lib/constants';
import { createStaticClient } from '@/lib/supabase/static';
import { extractTheme } from '@/lib/topics';

export type TopicWithCount = {
  theme: string;
  questionCount: number;
};

async function fetchTopics(kcod: number): Promise<TopicWithCount[]> {
  if (!isExamCategory(kcod)) {
    throw new Error('Invalid exam category');
  }

  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from('quest')
    .select('qbook')
    .eq('qkateg', kcod)
    .eq('qlang', LANG.EL)
    .not('qbook', 'is', null);

  if (error) {
    throw new Error(`Failed to load topics: ${error.message}`);
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const theme = extractTheme(row.qbook);
    if (!theme) continue;
    counts.set(theme, (counts.get(theme) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([theme, questionCount]) => ({ theme, questionCount }))
    .sort((a, b) => a.theme.localeCompare(b.theme, 'el'));
}

export async function getTopics(kcod: number): Promise<TopicWithCount[]> {
  return unstable_cache(
    () => fetchTopics(kcod),
    ['topics', String(kcod)],
    { revalidate: 3600, tags: ['topics', `topics-${kcod}`] }
  )();
}
