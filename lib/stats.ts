export type UserStats = {
  totalTests: number;
  totalCorrect: number;
  totalQuestions: number;
  bestStreak: number;
  currentStreak: number;
  completedExams: number;
  savedCount: number;
  wrongCount: number;
};

export type ExamHistoryEntry = {
  id: string;
  title: string;
  kcod: number;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
};

const STATS_KEY = 'kok-user-stats';
const HISTORY_KEY = 'kok-exam-history';
const HISTORY_LIMIT = 20;

export const DEFAULT_STATS: UserStats = {
  totalTests: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  bestStreak: 0,
  currentStreak: 0,
  completedExams: 0,
  savedCount: 0,
  wrongCount: 0,
};

export function getStats(): UserStats {
  if (typeof window === 'undefined') {
    return DEFAULT_STATS;
  }

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getHistory(): ExamHistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExamHistoryEntry[];
  } catch {
    return [];
  }
}

function addHistoryEntry(entry: ExamHistoryEntry): void {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  const next = [entry, ...history].slice(0, HISTORY_LIMIT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function recordExamResult(params: {
  kcod: number;
  title: string;
  score: number;
  total: number;
  passed: boolean;
}): UserStats {
  const { kcod, title, score, total, passed } = params;
  const stats = getStats();
  const next: UserStats = {
    ...stats,
    totalTests: stats.totalTests + 1,
    totalCorrect: stats.totalCorrect + score,
    totalQuestions: stats.totalQuestions + total,
    completedExams: passed ? stats.completedExams + 1 : stats.completedExams,
    currentStreak: passed ? stats.currentStreak + 1 : 0,
    bestStreak: passed
      ? Math.max(stats.bestStreak, stats.currentStreak + 1)
      : stats.bestStreak,
  };
  saveStats(next);

  addHistoryEntry({
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    title,
    kcod,
    score,
    total,
    percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    passed,
    completedAt: new Date().toISOString(),
  });

  return next;
}

export function getSuccessRate(stats: UserStats): number {
  if (stats.totalQuestions === 0) return 0;
  return Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
}
