'use client';

import { useMemo } from 'react';
import {
  computeStatsFromHistory,
  filterHistoryByKcod,
  type CategoryCounts,
  type HistoryEntry,
} from '@/lib/category-stats';
import { useCategory } from '@/hooks/use-category';

export function useCategoryStats(
  history: HistoryEntry[],
  countsByCategory: CategoryCounts
) {
  const { kcod } = useCategory();

  return useMemo(() => {
    const filteredHistory = filterHistoryByKcod(history, kcod);
    const counts = countsByCategory[kcod] ?? {
      savedCount: 0,
      wrongCount: 0,
    };

    return {
      kcod,
      history: filteredHistory,
      stats: computeStatsFromHistory(filteredHistory, counts),
    };
  }, [history, countsByCategory, kcod]);
}
