export { LANG } from '@/types/database';

export const CATEGORY_LABELS: Record<number, string> = {
  1: 'Κατηγορία Β — Αυτοκίνητο',
  2: 'Κατηγορία Α — Μοτοσικλέτα',
  3: 'Κατηγορία C — Φορτηγό',
  4: 'Κατηγορία D — Λεωφορείο',
  5: 'Κατηγορία ADR — Επικίνδυνα Φορτία',
  6: 'ΠΕΙ — Φορτηγό',
  7: 'ΠΕΙ — Λεωφορείο',
};

export const CATEGORY_SHORT: Record<number, string> = {
  1: 'Β',
  2: 'Α',
  3: 'C',
  4: 'D',
  5: 'ADR',
  6: 'ΠΕΙ-C',
  7: 'ΠΕΙ-D',
};

/** Official TestDrive / ΜΣΘΕΥΟ pass thresholds (min correct / exam total). */
export const PASS_THRESHOLDS: Record<number, { min: number; total: number }> = {
  1: { min: 29, total: 30 },
  2: { min: 9, total: 10 },
  3: { min: 9, total: 10 },
  4: { min: 9, total: 10 },
  5: { min: 14, total: 15 },
  6: { min: 36, total: 60 },
  7: { min: 36, total: 60 },
};

export const EXAM_CATEGORIES = [1, 2, 3, 4, 5, 6, 7] as const;

export type ExamCategoryId = (typeof EXAM_CATEGORIES)[number];

export function isExamCategory(kcod: number): kcod is ExamCategoryId {
  return (EXAM_CATEGORIES as readonly number[]).includes(kcod);
}

export function getPassThreshold(kcod: number): { min: number; total: number } {
  return PASS_THRESHOLDS[kcod] ?? { min: 9, total: 10 };
}

export const STAT_LABELS = {
  dailyStreakCurrent: 'Σερί συνεχών ημερών',
  dailyStreakBest: 'Μεγαλύτερο σερί ημερών',
  answerStreakBest: 'Μεγαλύτερο σερί σωστών απαντήσεων',
  simulationTests: 'Τεστ Προσομοίωσης',
} as const;

export function getDailyStreakStatLabel(currentStreak: number): string {
  return currentStreak > 0
    ? STAT_LABELS.dailyStreakCurrent
    : STAT_LABELS.dailyStreakBest;
}
