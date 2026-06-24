'use server';

import { isExamCategory, LANG } from '@/lib/constants';
import { attachAnswers } from '@/lib/quest';
import { shuffle } from '@/lib/shuffle';
import { createClient } from '@/lib/supabase/server';
import { extractTheme } from '@/lib/topics';
import type { Quest, QuestWithAnswers } from '@/types/database';

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
  limit = 20,
  theme?: string | null
): Promise<PracticeBatch> {
  if (!isExamCategory(kcod)) {
    throw new Error('Invalid exam category');
  }

  const supabase = await createClient();

  if (theme) {
    const { data: questions, error } = await supabase
      .from('quest')
      .select('*')
      .eq('qkateg', kcod)
      .eq('qlang', LANG.EL)
      .ilike('qbook', `${theme}%`);

    if (error) {
      throw new Error(`Failed to load questions: ${error.message}`);
    }

    const filtered = shuffle(
      (questions ?? []).filter((q) => extractTheme(q.qbook) === theme)
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
    return { questions: [], total, offset, limit, hasMore: false };
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

export async function getQuickPracticeQuestions(
  kcod: number,
  count = 10
): Promise<PracticeBatch> {
  if (!isExamCategory(kcod)) {
    throw new Error('Invalid exam category');
  }

  const supabase = await createClient();

  const { data: allQuestions, error } = await supabase
    .from('quest')
    .select('*')
    .eq('qkateg', kcod)
    .eq('qlang', LANG.EL);

  if (error) {
    throw new Error(`Failed to load questions: ${error.message}`);
  }

  const rows = allQuestions ?? [];

  // Group by qpag so we pick from different topics
  const byPage = new Map<number, Quest[]>();
  for (const q of rows) {
    const page = q.qpag ?? 0;
    const group = byPage.get(page) ?? [];
    group.push(q);
    byPage.set(page, group);
  }

  // Shuffle pages, pick 1 question from each until we have `count`
  const pages = shuffle([...byPage.keys()]);
  const selected: Quest[] = [];

  for (const page of pages) {
    if (selected.length >= count) break;
    const group = byPage.get(page) ?? [];
    const picked = shuffle(group)[0];
    if (picked) selected.push(picked);
  }

  const questionsWithAnswers = await attachAnswers(supabase, selected);

  return {
    questions: questionsWithAnswers,
    total: questionsWithAnswers.length,
    offset: 0,
    limit: questionsWithAnswers.length,
    hasMore: false,
  };
}

export async function getWeakPracticeQuestions(
  kcod: number
): Promise<PracticeBatch> {
  if (!isExamCategory(kcod)) {
    throw new Error('Invalid exam category');
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { questions: [], total: 0, offset: 0, limit: 0, hasMore: false };
  }

  const { data: wrongEntries, error: wrongError } = await supabase
    .from('user_wrong_questions')
    .select('qcod')
    .eq('user_id', user.id);

  if (wrongError) {
    throw new Error(`Failed to load wrong questions: ${wrongError.message}`);
  }

  if (!wrongEntries?.length) {
    return { questions: [], total: 0, offset: 0, limit: 0, hasMore: false };
  }

  const qcodes = wrongEntries.map((w) => w.qcod);

  const { data: questions, error: questError } = await supabase
    .from('quest')
    .select('*')
    .eq('qkateg', kcod)
    .eq('qlang', LANG.EL)
    .in('qcod', qcodes);

  if (questError) {
    throw new Error(`Failed to load questions: ${questError.message}`);
  }

  const questRows = shuffle(questions ?? []);
  const questionsWithAnswers = await attachAnswers(supabase, questRows);

  return {
    questions: questionsWithAnswers,
    total: questionsWithAnswers.length,
    offset: 0,
    limit: questionsWithAnswers.length,
    hasMore: false,
  };
}
