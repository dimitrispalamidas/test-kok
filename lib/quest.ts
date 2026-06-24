import type { createClient } from '@/lib/supabase/server';
import type { Answer, Quest, QuestWithAnswers } from '@/types/database';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function attachAnswers(
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
