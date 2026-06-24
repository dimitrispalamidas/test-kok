'use server';

import { createClient } from '@/lib/supabase/server';
import type { ExamAnswerRecord } from '@/types/exam';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback`,
    },
  });
  if (error) throw new Error(error.message);
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

// ─── Exam Results ─────────────────────────────────────────────────────────────

export async function saveExamResult(params: {
  kcod: number;
  title: string;
  score: number;
  total: number;
  passed: boolean;
  durationSeconds: number | null;
  answers: ExamAnswerRecord[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: result, error: resultError } = await supabase
    .from('user_exam_results')
    .insert({
      user_id: user.id,
      kcod: params.kcod,
      score: params.score,
      total: params.total,
      passed: params.passed,
      duration_seconds: params.durationSeconds,
      title: params.title,
    })
    .select('id')
    .single();

  if (resultError || !result) return null;

  if (params.answers.length > 0) {
    await supabase.from('user_exam_answers').insert(
      params.answers.map((a) => ({
        result_id: result.id,
        qcod: a.qcod,
        selected_aaa: a.selectedAaa,
        is_correct: a.isCorrect,
      }))
    );

    // Upsert wrong questions counter, storing the last selected answer
    const wrongAnswers = params.answers.filter((a) => !a.isCorrect);
    for (const a of wrongAnswers) {
      await supabase.rpc('increment_wrong_question', {
        p_user_id: user.id,
        p_qcod: a.qcod,
        p_selected_aaa: a.selectedAaa,
      });
    }
  }

  return result.id;
}

export async function getExamHistory(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('user_exam_results')
    .select('id, kcod, title, score, total, passed, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => ({
    ...r,
    percentage: r.total > 0 ? Math.round((r.score / r.total) * 100) : 0,
  }));
}

export async function getUserStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch results ordered by date to compute streaks
  const { data: results } = await supabase
    .from('user_exam_results')
    .select('score, total, passed, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!results || results.length === 0) {
    return {
      totalTests: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      completedExams: 0,
      bestStreak: 0,
      currentStreak: 0,
      savedCount: 0,
      wrongCount: 0,
    };
  }

  const totalTests = results.length;
  const totalCorrect = results.reduce((s, r) => s + r.score, 0);
  const totalQuestions = results.reduce((s, r) => s + r.total, 0);
  const completedExams = results.filter((r) => r.passed).length;

  // Compute streaks from ordered results
  let bestStreak = 0;
  let currentStreak = 0;
  let runningStreak = 0;
  for (const r of results) {
    if (r.passed) {
      runningStreak += 1;
      if (runningStreak > bestStreak) bestStreak = runningStreak;
    } else {
      runningStreak = 0;
    }
  }
  // currentStreak is the running streak at the end (most recent results)
  currentStreak = runningStreak;

  const [{ count: savedCount }, { count: wrongCount }] = await Promise.all([
    supabase
      .from('user_saved_questions')
      .select('qcod', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('user_wrong_questions')
      .select('qcod', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  return {
    totalTests,
    totalCorrect,
    totalQuestions,
    completedExams,
    bestStreak,
    currentStreak,
    savedCount: savedCount ?? 0,
    wrongCount: wrongCount ?? 0,
  };
}

export async function getSavedWrongCountsByCategory(): Promise<
  Record<number, { savedCount: number; wrongCount: number }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const [{ data: savedRows }, { data: wrongRows }] = await Promise.all([
    supabase
      .from('user_saved_questions')
      .select('qcod')
      .eq('user_id', user.id),
    supabase
      .from('user_wrong_questions')
      .select('qcod')
      .eq('user_id', user.id),
  ]);

  const allQcods = [
    ...new Set([
      ...(savedRows ?? []).map((row) => row.qcod),
      ...(wrongRows ?? []).map((row) => row.qcod),
    ]),
  ];

  if (allQcods.length === 0) return {};

  const { data: quests } = await supabase
    .from('quest')
    .select('qcod, qkateg')
    .in('qcod', allQcods);

  const categoryByQcod = new Map(
    (quests ?? []).map((quest) => [quest.qcod, quest.qkateg])
  );

  const counts: Record<number, { savedCount: number; wrongCount: number }> =
    {};

  for (const row of savedRows ?? []) {
    const kcod = categoryByQcod.get(row.qcod);
    if (kcod == null) continue;
    if (!counts[kcod]) counts[kcod] = { savedCount: 0, wrongCount: 0 };
    counts[kcod].savedCount += 1;
  }

  for (const row of wrongRows ?? []) {
    const kcod = categoryByQcod.get(row.qcod);
    if (kcod == null) continue;
    if (!counts[kcod]) counts[kcod] = { savedCount: 0, wrongCount: 0 };
    counts[kcod].wrongCount += 1;
  }

  return counts;
}

// ─── Saved Questions ──────────────────────────────────────────────────────────

export async function getSavedQuestionIds(): Promise<number[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('user_saved_questions')
    .select('qcod')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false });

  return (data ?? []).map((r) => r.qcod);
}

export async function toggleSavedQuestion(qcod: number): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('user_saved_questions')
    .select('qcod')
    .eq('user_id', user.id)
    .eq('qcod', qcod)
    .single();

  if (existing) {
    await supabase
      .from('user_saved_questions')
      .delete()
      .eq('user_id', user.id)
      .eq('qcod', qcod);
    return false;
  }

  await supabase
    .from('user_saved_questions')
    .insert({ user_id: user.id, qcod });
  return true;
}

// ─── Wrong Questions ──────────────────────────────────────────────────────────

export async function getWrongQuestionIds(): Promise<number[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('user_wrong_questions')
    .select('qcod, wrong_count')
    .eq('user_id', user.id)
    .order('wrong_count', { ascending: false });

  return (data ?? []).map((r) => r.qcod);
}
