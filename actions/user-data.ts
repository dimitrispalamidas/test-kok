'use server';

import {
  processAnswerStreakBatch,
  buildAnswerStreakStatus,
  type AnswerStreakStatus,
} from '@/lib/answer-streak';
import {
  buildDailyStreakStatus,
  buildStreakToastMessage,
  computeDailyStreakUpdate,
  getDateInAthens,
  type DailyStreakStatus,
  type DailyStreakUpdate,
} from '@/lib/daily-streak';
import { getAuthUser } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import type { ExamAnswerRecord } from '@/types/exam';
import type { LeaderboardEntry } from '@/types/database';

export type SaveExamResultResponse = {
  resultId: string;
  streak: DailyStreakUpdate | null;
  answerStreakMessages: string[];
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function getUser() {
  return getAuthUser();
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
  answerStreakAlreadyRecorded?: boolean;
}): Promise<SaveExamResultResponse | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

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

  const streak = await updateDailyStreak(supabase, user.id);
  const answerStreakMessages = params.answerStreakAlreadyRecorded
    ? []
    : await updateAnswerStreak(
        supabase,
        user.id,
        params.answers.map((answer) => answer.isCorrect)
      );

  return {
    resultId: result.id,
    streak,
    answerStreakMessages,
  };
}

export async function recordAnswerStreakStep(
  isCorrect: boolean
): Promise<{ message: string | null; currentStreak: number } | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

  const messages = await updateAnswerStreak(supabase, user.id, [isCorrect]);
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_answer_streak')
    .eq('user_id', user.id)
    .single();

  return {
    message: messages[0] ?? null,
    currentStreak: profile?.current_answer_streak ?? 0,
  };
}

async function updateAnswerStreak(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  answers: boolean[]
): Promise<string[]> {
  if (answers.length === 0) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'current_answer_streak, best_answer_streak, total_answer_streak_xp'
    )
    .eq('user_id', userId)
    .single();

  if (!profile) return [];

  const batch = processAnswerStreakBatch(
    profile.current_answer_streak,
    answers
  );

  await supabase
    .from('profiles')
    .update({
      current_answer_streak: batch.newStreak,
      best_answer_streak: Math.max(
        profile.best_answer_streak,
        batch.bestStreakCandidate
      ),
      total_answer_streak_xp:
        profile.total_answer_streak_xp + batch.totalXpBonus,
    })
    .eq('user_id', userId);

  return batch.messages;
}

async function updateDailyStreak(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<DailyStreakUpdate | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'last_active_date, current_daily_streak, longest_daily_streak, total_streak_xp'
    )
    .eq('user_id', userId)
    .single();

  if (!profile) return null;

  const today = getDateInAthens();
  const update = computeDailyStreakUpdate({
    lastActiveDate: profile.last_active_date,
    currentStreak: profile.current_daily_streak,
    today,
  });

  if (profile.last_active_date === today) {
    return null;
  }

  const longestDailyStreak = Math.max(
    profile.longest_daily_streak,
    update.newStreak
  );

  await supabase
    .from('profiles')
    .update({
      last_active_date: today,
      current_daily_streak: update.newStreak,
      longest_daily_streak: longestDailyStreak,
      total_streak_xp: profile.total_streak_xp + update.xpBonus,
    })
    .eq('user_id', userId);

  const message = buildStreakToastMessage({
    currentStreak: update.newStreak,
    xpBonus: update.xpBonus,
    extended: update.extended,
    isFirstDay: update.isFirstDay,
  });

  if (!message) return null;

  return {
    currentStreak: update.newStreak,
    xpBonus: update.xpBonus,
    extended: update.extended,
    isFirstDay: update.isFirstDay,
    message,
  };
}

export async function getDailyStreakStatus(): Promise<DailyStreakStatus | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'last_active_date, current_daily_streak, longest_daily_streak'
    )
    .eq('user_id', user.id)
    .single();

  if (!profile) return null;

  return buildDailyStreakStatus({
    currentStreak: profile.current_daily_streak,
    longestStreak: profile.longest_daily_streak,
    lastActiveDate: profile.last_active_date,
  });
}

export async function getAnswerStreakStatus(): Promise<AnswerStreakStatus | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_answer_streak, best_answer_streak')
    .eq('user_id', user.id)
    .single();

  if (!profile) return null;

  return buildAnswerStreakStatus(
    profile.current_answer_streak,
    profile.best_answer_streak
  );
}

export async function getExamHistory(limit = 20) {
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();

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
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

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
  const user = await getAuthUser();
  if (!user) return {};

  const supabase = await createClient();

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
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from('user_saved_questions')
    .select('qcod')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false });

  return (data ?? []).map((r) => r.qcod);
}

export async function toggleSavedQuestion(qcod: number): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');

  const supabase = await createClient();

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
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from('user_wrong_questions')
    .select('qcod, wrong_count')
    .eq('user_id', user.id)
    .order('wrong_count', { ascending: false });

  return (data ?? []).map((r) => r.qcod);
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile() {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('user_id, username, created_at')
    .eq('user_id', user.id)
    .single();

  if (!data) return null;

  const emailPrefix = user.email
    ? user.email.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) ?? ''
    : '';

  return {
    ...data,
    email: user.email ?? '',
    isDefaultUsername:
      emailPrefix.length >= 2 && data.username === emailPrefix,
  };
}

export async function updateUsername(username: string) {
  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    throw new Error('Το όνομα πρέπει να έχει 2–20 χαρακτήρες');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    throw new Error('Μόνο γράμματα, αριθμοί και _ επιτρέπονται');
  }

  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');

  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ username: trimmed })
    .eq('user_id', user.id);

  if (error) {
    if (error.code === '23505') {
      throw new Error('Αυτό το όνομα χρησιμοποιείται ήδη');
    }
    throw new Error(error.message);
  }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function getLeaderboard(kcod: number): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_kcod: kcod,
  });

  if (error) throw new Error(error.message);

  return (data ?? []).map((entry) => ({
    user_id: entry.user_id,
    username: entry.username,
    total_xp: Number(entry.total_xp),
    total_tests: Number(entry.total_tests),
    passed_tests: Number(entry.passed_tests),
    best_streak: Number(entry.best_streak),
    daily_streak: Number(entry.daily_streak),
    rank: Number(entry.rank),
  }));
}
