import type { SupabaseClient } from '@supabase/supabase-js';
import { extractTheme } from '@/lib/topics';
import type { Database } from '@/types/database';

type ServerClient = SupabaseClient<Database>;

export type ThemeAttemptRecord = {
  qcod: number;
  is_correct: boolean;
};

export type ThemeAttemptCounts = {
  correct: number;
  wrong: number;
};

const QUICK_TEST_ATTEMPT_WINDOW_MS = 5000;

async function loadQbookByQcod(
  supabase: ServerClient,
  qcodes: number[]
): Promise<Map<number, string | null>> {
  if (qcodes.length === 0) return new Map();

  const uniqueQcodes = [...new Set(qcodes)];
  const { data: quests, error } = await supabase
    .from('quest')
    .select('qcod, qbook')
    .in('qcod', uniqueQcodes);

  if (error) {
    throw new Error(`Failed to load question themes: ${error.message}`);
  }

  return new Map((quests ?? []).map((quest) => [quest.qcod, quest.qbook]));
}

function getSupplementalQuickTestRecords(
  quickResults: { id: string; created_at: string }[],
  practiceAttempts: { created_at: string }[],
  examAnswers: {
    qcod: number;
    is_correct: boolean;
    result_id: string;
  }[]
): ThemeAttemptRecord[] {
  const loggedResultIds = new Set<string>();

  for (const result of quickResults) {
    const resultTime = new Date(result.created_at).getTime();
    const hasLoggedAttempts = practiceAttempts.some((attempt) => {
      const attemptTime = new Date(attempt.created_at).getTime();
      return (
        Math.abs(attemptTime - resultTime) <= QUICK_TEST_ATTEMPT_WINDOW_MS
      );
    });

    if (hasLoggedAttempts) {
      loggedResultIds.add(result.id);
    }
  }

  return examAnswers
    .filter((answer) => !loggedResultIds.has(answer.result_id))
    .map((answer) => ({
      qcod: answer.qcod,
      is_correct: answer.is_correct,
    }));
}

export async function fetchCategoryAttemptRecords(
  supabase: ServerClient,
  userId: string,
  kcod: number,
  since?: string
): Promise<ThemeAttemptRecord[]> {
  let attemptsQuery = supabase
    .from('user_question_attempts')
    .select('qcod, is_correct')
    .eq('user_id', userId)
    .eq('kcod', kcod);

  if (since) {
    attemptsQuery = attemptsQuery.gte('created_at', since);
  }

  let quickResultsQuery = supabase
    .from('user_exam_results')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('kcod', kcod)
    .is('duration_seconds', null);

  if (since) {
    quickResultsQuery = quickResultsQuery.gte('created_at', since);
  }

  const [{ data: attempts }, { data: quickResults }] = await Promise.all([
    attemptsQuery,
    quickResultsQuery,
  ]);

  const records: ThemeAttemptRecord[] = (attempts ?? []).map((attempt) => ({
    qcod: attempt.qcod,
    is_correct: attempt.is_correct,
  }));

  const quickResultIds = (quickResults ?? []).map((result) => result.id);
  if (quickResultIds.length === 0) {
    return records;
  }

  let practiceAttemptsQuery = supabase
    .from('user_question_attempts')
    .select('created_at')
    .eq('user_id', userId)
    .eq('kcod', kcod)
    .eq('source', 'practice');

  if (since) {
    practiceAttemptsQuery = practiceAttemptsQuery.gte('created_at', since);
  }

  const [{ data: examAnswers }, { data: practiceAttempts }] = await Promise.all([
    supabase
      .from('user_exam_answers')
      .select('qcod, is_correct, result_id')
      .in('result_id', quickResultIds),
    practiceAttemptsQuery,
  ]);

  return [
    ...records,
    ...getSupplementalQuickTestRecords(
      quickResults ?? [],
      practiceAttempts ?? [],
      examAnswers ?? []
    ),
  ];
}

export async function aggregateAttemptCountsByTheme(
  supabase: ServerClient,
  attempts: ThemeAttemptRecord[]
): Promise<Map<string, ThemeAttemptCounts>> {
  const byTheme = new Map<string, ThemeAttemptCounts>();
  if (attempts.length === 0) return byTheme;

  const qbookByQcod = await loadQbookByQcod(
    supabase,
    attempts.map((attempt) => attempt.qcod)
  );

  for (const attempt of attempts) {
    const theme = extractTheme(qbookByQcod.get(attempt.qcod) ?? null);
    if (!theme) continue;

    if (!byTheme.has(theme)) {
      byTheme.set(theme, { correct: 0, wrong: 0 });
    }

    const entry = byTheme.get(theme);
    if (!entry) continue;

    if (attempt.is_correct) {
      entry.correct += 1;
    } else {
      entry.wrong += 1;
    }
  }

  return byTheme;
}

export async function aggregateWrongCountsByTheme(
  supabase: ServerClient,
  qcodes: number[]
): Promise<Map<string, number>> {
  const wrongByTheme = new Map<string, number>();
  if (qcodes.length === 0) return wrongByTheme;

  const counts = await aggregateAttemptCountsByTheme(
    supabase,
    qcodes.map((qcod) => ({ qcod, is_correct: false }))
  );

  for (const [theme, entry] of counts) {
    wrongByTheme.set(theme, entry.wrong);
  }

  return wrongByTheme;
}
