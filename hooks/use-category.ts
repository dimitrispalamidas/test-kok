'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import {
  isExamCategory,
  type ExamCategoryId,
} from '@/lib/constants';

export function useCategory() {
  const [raw, setRaw] = useQueryState('k', parseAsInteger.withDefault(1));

  const kcod: ExamCategoryId = isExamCategory(raw) ? raw : 1;

  const setKcod = (next: ExamCategoryId) => {
    setRaw(next);
  };

  return { kcod, setKcod };
}
