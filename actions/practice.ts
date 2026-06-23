'use server';

import { isExamCategory, LANG } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import type { Answer, Quest, QuestWithAnswers } from '@/types/database';

export type PracticeBatch = {
  questions: QuestWithAnswers[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
};

export async function getPracticeQuestions(
  kcod: number,
  offset = 0,
  limit = 20
): Promise<PracticeBatch> {
  if (!isExamCategory(kcod)) {
    throw new Error('Invalid exam category');
  }

  const supabase = await createClient();

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

  const questionsWithAnswers: QuestWithAnswers[] = questRows.map(
    (question: Quest) => ({
      ...question,
      answers: answersByQuestion.get(question.qcod) ?? [],
    })
  );

  return {
    questions: questionsWithAnswers,
    total,
    offset,
    limit,
    hasMore: offset + questRows.length < total,
  };
}
