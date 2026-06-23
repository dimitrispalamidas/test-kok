'use server';

import { isExamCategory, LANG } from '@/lib/constants';
import { shuffle } from '@/lib/shuffle';
import { createClient } from '@/lib/supabase/server';
import type { Answer, Kateg, Quest, QuestWithAnswers } from '@/types/database';

export type GeneratedExam = {
  category: Kateg;
  questions: QuestWithAnswers[];
};

export async function generateExam(kcod: number): Promise<GeneratedExam> {
  if (!isExamCategory(kcod)) {
    throw new Error('Invalid exam category');
  }

  const supabase = await createClient();

  const { data: category, error: categoryError } = await supabase
    .from('kateg')
    .select('*')
    .eq('kcod', kcod)
    .single();

  if (categoryError || !category) {
    throw new Error(`Category not found: ${categoryError?.message ?? kcod}`);
  }

  const { data: pools, error: poolsError } = await supabase
    .from('numbs')
    .select('pcod, numb')
    .eq('kcod', kcod);

  if (poolsError) {
    throw new Error(`Failed to load exam pools: ${poolsError.message}`);
  }

  if (!pools?.length) {
    throw new Error('No exam pools configured for this category');
  }

  const selectedQuestions: Quest[] = [];

  for (const pool of pools) {
    const { data: poolQuestions, error: questError } = await supabase
      .from('quest')
      .select('*')
      .eq('qkateg', kcod)
      .eq('qpag', pool.pcod)
      .eq('qlang', LANG.EL);

    if (questError) {
      throw new Error(`Failed to load questions: ${questError.message}`);
    }

    if (!poolQuestions?.length) {
      continue;
    }

    const drawn = shuffle(poolQuestions).slice(0, pool.numb);
    selectedQuestions.push(...drawn);
  }

  if (!selectedQuestions.length) {
    throw new Error('No questions available for exam generation');
  }

  const qcodes = selectedQuestions.map((q) => q.qcod);

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

  const questions: QuestWithAnswers[] = selectedQuestions.map((question) => ({
    ...question,
    answers: answersByQuestion.get(question.qcod) ?? [],
  }));

  return { category, questions };
}
