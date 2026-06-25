import { isQuickTestResult, isSimulationExamResult } from '@/lib/exam-session';

export type HistoryEntry = {
  id: string;
  kcod: number;
  title: string;
  score: number;
  total: number;
  passed: boolean;
  created_at: string;
  percentage: number;
  duration_seconds: number | null;
};

export type CategoryStats = {
  quickTests: number;
  totalCorrect: number;
  totalQuestions: number;
  completedExams: number;
  simulationTests: number;
  bestStreak: number;
  currentStreak: number;
  savedCount: number;
  wrongCount: number;
};

export type CategoryCounts = Record<
  number,
  { savedCount: number; wrongCount: number }
>;

export const EMPTY_CATEGORY_STATS: CategoryStats = {
  quickTests: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  completedExams: 0,
  simulationTests: 0,
  bestStreak: 0,
  currentStreak: 0,
  savedCount: 0,
  wrongCount: 0,
};

export function filterHistoryByKcod(
  history: HistoryEntry[],
  kcod: number
): HistoryEntry[] {
  return history.filter((entry) => entry.kcod === kcod);
}

export function computeStatsFromHistory(
  history: HistoryEntry[],
  counts: { savedCount: number; wrongCount: number } = {
    savedCount: 0,
    wrongCount: 0,
  }
): CategoryStats {
  if (history.length === 0) {
    return { ...EMPTY_CATEGORY_STATS, ...counts };
  }

  const ordered = [...history].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const quickTests = ordered.filter(isQuickTestResult).length;
  const totalCorrect = ordered.reduce((sum, entry) => sum + entry.score, 0);
  const totalQuestions = ordered.reduce((sum, entry) => sum + entry.total, 0);
  const completedExams = ordered.filter((entry) => entry.passed).length;
  const simulationTests = ordered.filter(isSimulationExamResult).length;

  let bestStreak = 0;
  let currentStreak = 0;
  let runningStreak = 0;

  for (const entry of ordered) {
    if (entry.passed) {
      runningStreak += 1;
      if (runningStreak > bestStreak) bestStreak = runningStreak;
    } else {
      runningStreak = 0;
    }
  }
  currentStreak = runningStreak;

  return {
    quickTests,
    totalCorrect,
    totalQuestions,
    completedExams,
    simulationTests,
    bestStreak,
    currentStreak,
    savedCount: counts.savedCount,
    wrongCount: counts.wrongCount,
  };
}
