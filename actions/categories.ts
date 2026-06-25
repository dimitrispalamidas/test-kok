'use server';

import { unstable_cache } from 'next/cache';
import { EXAM_CATEGORIES } from '@/lib/constants';
import { createStaticClient } from '@/lib/supabase/static';
import type { Kateg } from '@/types/database';

export type CategoryWithStats = Kateg & {
  questionCount: number;
  examQuestionCount: number;
};

async function fetchCategoriesWithStats(): Promise<CategoryWithStats[]> {
  const supabase = createStaticClient();

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

  return Promise.all(
    categories.map(async (category) => {
      const [{ count: questionCount }, { data: pools }] = await Promise.all([
        supabase
          .from('quest')
          .select('*', { count: 'exact', head: true })
          .eq('qkateg', category.kcod)
          .eq('qlang', 1),
        supabase.from('numbs').select('numb').eq('kcod', category.kcod),
      ]);

      const examQuestionCount =
        pools?.reduce((sum, pool) => sum + pool.numb, 0) ?? 0;

      return {
        ...category,
        questionCount: questionCount ?? 0,
        examQuestionCount,
      };
    })
  );
}

const getCachedCategories = unstable_cache(
  fetchCategoriesWithStats,
  ['categories-with-stats'],
  { revalidate: 3600, tags: ['categories'] }
);

export async function getCategories(): Promise<CategoryWithStats[]> {
  return getCachedCategories();
}
