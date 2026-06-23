'use server';

import { isExamCategory, LANG } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { extractTheme } from '@/lib/topics';
import type { Answer, Quest, QuestWithAnswers } from '@/types/database';

export type PracticeBatch = {
  questions: QuestWithAnswers[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function attachAnswers(
  supabase: SupabaseClient,
  questRows: Quest[]
): Promise<QuestWithAnswers[]> {
  if (!questRows.length) {
    return [];
  }

  const qcodes = questRows.map((q) => q.qcod);

  const { data: answers, error: answersError } = await supabase
    .from('answer')
    .select('*')
    .in('aqcod', qcodes)
    .order('aaa');

  if (answersError) {
    throw new Error(`Failed to load answers: ${answersError.message}`);
  }

  const answersByQuestion = new Map<number, Answer[]>();
  for (const answer of answers ?? []) {
    const existing = answersByQuestion.get(answer.aqcod) ?? [];
    existing.push(answer);
    answersByQuestion.set(answer.aqcod, existing);
  }

  return questRows.map((question) => ({
    ...question,
    answers: answersByQuestion.get(question.qcod) ?? [],
  }));
}

export async function getPracticeQuestions(
  kcod: number,
  offset = 0,
  limit = 20,
  theme?: string | null
): Promise<PracticeBatch> {
  if (!isExamCategory(kcod)) {
    throw new Error('Invalid exam category');
  }

  const supabase = await createClient();

  // Theme mode: load every question whose qbook prefix matches the topic.
  // Topic sets are small enough to return in one batch (no pagination).
  if (theme) {
    const { data: questions, error } = await supabase
      .from('quest')
      .select('*')
      .eq('qkateg', kcod)
      .eq('qlang', LANG.EL)
      .ilike('qbook', `${theme}%`)
      .order('qcod');

    if (error) {
      throw new Error(`Failed to load questions: ${error.message}`);
    }

    const filtered = (questions ?? []).filter(
      (q) => extractTheme(q.qbook) === theme
    );

    const questionsWithAnswers = await attachAnswers(supabase, filtered);

    return {
      questions: questionsWithAnswers,
      total: filtered.length,
      offset: 0,
      limit: filtered.length,
      hasMore: false,
    };
  }

  const { count, error: countError } = await supabase
    .from('quest')
    .select('*', { count: 'exact', head: true })
    .eq('qkateg', kcod)
    .eq('qlang', LANG.EL);

  if (countError) {
    throw new Error(`Failed to count questions: ${countError.message}`);
  }

  const total = count ?? 0;

  const { data: questions, error: questError } = await supabase
    .from('quest')
    .select('*')
    .eq('qkateg', kcod)
    .eq('qlang', LANG.EL)
    .order('qcod')
    .range(offset, offset + limit - 1);

  if (questError) {
    throw new Error(`Failed to load questions: ${questError.message}`);
  }

  const questRows = questions ?? [];

  if (!questRows.length) {
    return {
      questions: [],
      total,
      offset,
      limit,
      hasMore: false,
    };
  }

  const questionsWithAnswers = await attachAnswers(supabase, questRows);

  return {
    questions: questionsWithAnswers,
    total,
    offset,
    limit,
    hasMore: offset + questRows.length < total,
  };
}
