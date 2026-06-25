export const queryKeys = {
  categories: () => ['categories'] as const,
  examHistory: (limit: number) => ['exam-history', limit] as const,
  savedWrongCounts: () => ['saved-wrong-counts'] as const,
  dailyStreak: () => ['daily-streak'] as const,
  answerStreak: () => ['answer-streak'] as const,
  profile: () => ['profile'] as const,
  currentUser: () => ['current-user'] as const,
  leaderboard: (kcod: number) => ['leaderboard', kcod] as const,
};
