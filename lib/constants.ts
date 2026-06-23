export { LANG } from '@/types/database';

export const CATEGORY_LABELS: Record<number, string> = {
  1: 'Κατηγορία Β — Αυτοκίνητο',
  2: 'Κατηγορία Α — Μοτοσικλέτα',
  3: 'Κατηγορία C — Φορτηγό',
  4: 'Κατηγορία D — Λεωφορείο',
  5: 'Κατηγορία ADR — Επικίνδυνα Φορτία',
};

export const CATEGORY_SHORT: Record<number, string> = {
  1: 'Β',
  2: 'Α',
  3: 'C',
  4: 'D',
  5: 'ADR',
};

/** Minimum correct answers to pass per category */
export const PASS_THRESHOLDS: Record<number, { min: number; total: number }> = {
  1: { min: 37, total: 40 },
  2: { min: 22, total: 25 },
  3: { min: 22, total: 25 },
  4: { min: 22, total: 25 },
  5: { min: 22, total: 25 },
};

export const EXAM_CATEGORIES = [1, 2, 3, 4, 5] as const;

export type ExamCategoryId = (typeof EXAM_CATEGORIES)[number];

export function isExamCategory(kcod: number): kcod is ExamCategoryId {
  return (EXAM_CATEGORIES as readonly number[]).includes(kcod);
}

export function getPassThreshold(kcod: number): { min: number; total: number } {
  return PASS_THRESHOLDS[kcod] ?? { min: 22, total: 25 };
}
