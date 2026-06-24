'use server';

import { isExamCategory, LANG } from '@/lib/constants';
import { attachAnswers } from '@/lib/quest';
import { createClient } from '@/lib/supabase/server';
import type { QuestWithAnswers } from '@/types/database';

async function getCategoryQuestionIds(
  table: 'user_saved_questions' | 'user_wrong_questions',
  kcod: number
): Promise<number[]> {
  if (!isExamCategory(kcod)) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: userRows } = await supabase
    .from(table)
    .select('qcod')
    .eq('user_id', user.id);

  const qcods = (userRows ?? []).map((row) => row.qcod);
  if (qcods.length === 0) return [];

  const { data: quests } = await supabase
    .from('quest')
    .select('qcod')
    .in('qcod', qcods)
    .eq('qkateg', kcod)
    .eq('qlang', LANG.EL);

  return (quests ?? []).map((quest) => quest.qcod);
}

async function loadQuestionsByIds(qcods: number[]): Promise<QuestWithAnswers[]> {
  if (qcods.length === 0) return [];

  const supabase = await createClient();
  const { data: quests, error } = await supabase
    .from('quest')
    .select('*')
    .in('qcod', qcods)
    .eq('qlang', LANG.EL)
    .order('qcod');

  if (error) {
    throw new Error(`Failed to load questions: ${error.message}`);
  }

  return attachAnswers(supabase, quests ?? []);
}

export async function getCategorySavedQuestions(
  kcod: number
): Promise<QuestWithAnswers[]> {
  const qcods = await getCategoryQuestionIds('user_saved_questions', kcod);
  return loadQuestionsByIds(qcods);
}

export async function getCategoryWrongQuestions(
  kcod: number
): Promise<QuestWithAnswers[]> {
  const qcods = await getCategoryQuestionIds('user_wrong_questions', kcod);
  return loadQuestionsByIds(qcods);
}
