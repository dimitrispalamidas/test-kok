'use server';

import { isExamCategory, LANG } from '@/lib/constants';
import { attachAnswers } from '@/lib/quest';
import { createClient } from '@/lib/supabase/server';
import type { QuestWithAnswers } from '@/types/database';

export type WrongQuestWithAnswers = QuestWithAnswers & { selectedAaa: number | null };

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getCategorySavedQuestions(
  kcod: number
): Promise<QuestWithAnswers[]> {
  if (!isExamCategory(kcod)) return [];

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return [];

  const { data: userRows } = await supabase
    .from('user_saved_questions')
    .select('qcod')
    .eq('user_id', user.id);

  const qcods = (userRows ?? []).map((r) => r.qcod);
  if (qcods.length === 0) return [];

  const { data: quests, error } = await supabase
    .from('quest')
    .select('*')
    .in('qcod', qcods)
    .eq('qkateg', kcod)
    .eq('qlang', LANG.EL)
    .order('qcod');

  if (error) throw new Error(`Failed to load questions: ${error.message}`);

  return attachAnswers(supabase, quests ?? []);
}

export async function getCategoryWrongQuestions(
  kcod: number
): Promise<WrongQuestWithAnswers[]> {
  if (!isExamCategory(kcod)) return [];

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return [];

  const { data: wrongRows } = await supabase
    .from('user_wrong_questions')
    .select('qcod, selected_aaa')
    .eq('user_id', user.id);

  if (!wrongRows?.length) return [];

  const selectedAaaByQcod = new Map<number, number | null>(
    wrongRows.map((r) => [r.qcod, r.selected_aaa ?? null])
  );

  const { data: quests, error } = await supabase
    .from('quest')
    .select('*')
    .in('qcod', [...selectedAaaByQcod.keys()])
    .eq('qkateg', kcod)
    .eq('qlang', LANG.EL)
    .order('qcod');

  if (error) throw new Error(`Failed to load questions: ${error.message}`);

  const withAnswers = await attachAnswers(supabase, quests ?? []);

  return withAnswers.map((q) => ({
    ...q,
    selectedAaa: selectedAaaByQcod.get(q.qcod) ?? null,
  }));
}
