'use client';

import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/actions/categories';
import {
  getAnswerStreakStatus,
  getDailyStreakStatus,
  getExamHistory,
  getProfile,
  getSavedWrongCountsByCategory,
  getUser,
} from '@/actions/user-data';
import {
  CATEGORIES_STALE_TIME,
  USER_DATA_STALE_TIME,
} from '@/lib/invalidate-user-data';
import { queryKeys } from '@/lib/query-keys';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: getCategories,
    staleTime: CATEGORIES_STALE_TIME,
  });
}

export function useExamHistory(limit = 50) {
  return useQuery({
    queryKey: queryKeys.examHistory(limit),
    queryFn: () => getExamHistory(limit),
    staleTime: USER_DATA_STALE_TIME,
  });
}

export function useSavedWrongCountsByCategory() {
  return useQuery({
    queryKey: queryKeys.savedWrongCounts(),
    queryFn: getSavedWrongCountsByCategory,
    staleTime: USER_DATA_STALE_TIME,
  });
}

export function useDailyStreakStatus() {
  return useQuery({
    queryKey: queryKeys.dailyStreak(),
    queryFn: getDailyStreakStatus,
    staleTime: USER_DATA_STALE_TIME,
  });
}

export function useAnswerStreakStatus() {
  return useQuery({
    queryKey: queryKeys.answerStreak(),
    queryFn: getAnswerStreakStatus,
    staleTime: USER_DATA_STALE_TIME,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: getProfile,
    staleTime: USER_DATA_STALE_TIME,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser(),
    queryFn: async () => {
      const user = await getUser();
      if (!user) return null;
      return { id: user.id, email: user.email ?? '' };
    },
    staleTime: USER_DATA_STALE_TIME,
  });
}
