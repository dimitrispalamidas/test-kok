'use client';

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import { getCategories } from '@/actions/categories';
import {
  getAnswerStreakStatus,
  getDailyStreakStatus,
  getExamHistory,
  getSavedWrongCountsByCategory,
  getUser,
} from '@/actions/user-data';
import {
  CATEGORIES_STALE_TIME,
  USER_DATA_STALE_TIME,
} from '@/lib/invalidate-user-data';
import { queryKeys } from '@/lib/query-keys';

function PrefetchAppData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.categories(),
      queryFn: getCategories,
      staleTime: CATEGORIES_STALE_TIME,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.examHistory(50),
      queryFn: () => getExamHistory(50),
      staleTime: USER_DATA_STALE_TIME,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.savedWrongCounts(),
      queryFn: getSavedWrongCountsByCategory,
      staleTime: USER_DATA_STALE_TIME,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.dailyStreak(),
      queryFn: getDailyStreakStatus,
      staleTime: USER_DATA_STALE_TIME,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.answerStreak(),
      queryFn: getAnswerStreakStatus,
      staleTime: USER_DATA_STALE_TIME,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.currentUser(),
      queryFn: async () => {
        const user = await getUser();
        if (!user) return null;
        return { id: user.id, email: user.email ?? '' };
      },
      staleTime: USER_DATA_STALE_TIME,
    });
  }, [queryClient]);

  return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PrefetchAppData />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
