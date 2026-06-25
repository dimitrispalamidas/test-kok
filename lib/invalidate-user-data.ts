import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export const USER_DATA_STALE_TIME = 5 * 60 * 1000;
export const CATEGORIES_STALE_TIME = 60 * 60 * 1000;

export function invalidateUserData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.examHistory(50) });
  queryClient.invalidateQueries({ queryKey: queryKeys.savedWrongCounts() });
  queryClient.invalidateQueries({ queryKey: queryKeys.dailyStreak() });
  queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
  queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
}
