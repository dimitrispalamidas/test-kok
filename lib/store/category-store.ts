'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamCategoryId } from '@/lib/constants';

type CategoryStore = {
  kcod: ExamCategoryId;
  setKcod: (kcod: ExamCategoryId) => void;
};

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      kcod: 1,
      setKcod: (kcod) => set({ kcod }),
    }),
    { name: 'kok-selected-category' }
  )
);
