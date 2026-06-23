'use server';

import { isExamCategory, LANG } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { extractTheme } from '@/lib/topics';

export type TopicWithCount = {
  theme: string;
  questionCount: number;
};

export async function getTopics(kcod: number): Promise<TopicWithCount[]> {
  if (!isExamCategory(kcod)) {
    throw new Error('Invalid exam category');
  }

  const supabase = await createClient();

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
