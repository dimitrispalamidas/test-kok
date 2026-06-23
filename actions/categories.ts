'use server';

import { EXAM_CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import type { Kateg } from '@/types/database';

export type CategoryWithStats = Kateg & {
  questionCount: number;
  examQuestionCount: number;
};

export async function getCategories(): Promise<CategoryWithStats[]> {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('kateg')
    .select('*')
    .in('kcod', [...EXAM_CATEGORIES])
    .order('kcod');

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`);
  }

  if (!categories?.length) {
    return [];
  }

  const results: CategoryWithStats[] = [];

  for (const category of categories) {
    const { count: questionCount } = await supabase
      .from('quest')
      .select('*', { count: 'exact', head: true })
      .eq('qkateg', category.kcod)
      .eq('qlang', 1);

    const { data: pools } = await supabase
      .from('numbs')
      .select('numb')
      .eq('kcod', category.kcod);

    const examQuestionCount =
      pools?.reduce((sum, pool) => sum + pool.numb, 0) ?? 0;

    results.push({
      ...category,
      questionCount: questionCount ?? 0,
      examQuestionCount,
    });
  }

  return results;
}
