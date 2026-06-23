import type { QuestWithAnswers } from '@/types/database';

export type ExamAnswerRecord = {
  qcod: number;
  selectedAaa: number | null;
  correctAaa: number;
  isCorrect: boolean;
};

export type StoredExamResult = {
  kcod: number;
  categoryLabel: string;
  categoryName: string;
  timeLimitMinutes: number;
  questions: QuestWithAnswers[];
  answers: Record<string, number | null>;
  score: number;
  total: number;
  passMin: number;
  passed: boolean;
  completedAt: string;
};

export function getExamResultStorageKey(kcod: number): string {
  return `kok-exam-result-${kcod}`;
}

export function computeExamScore(
  questions: QuestWithAnswers[],
  answers: Record<number, number | null>
): { score: number; records: ExamAnswerRecord[] } {
  const records: ExamAnswerRecord[] = questions.map((question) => {
    const correct = question.answers.find((a) => a.acorr);
    const correctAaa = correct?.aaa ?? 0;
    const selectedAaa = answers[question.qcod] ?? null;
    const isCorrect = selectedAaa !== null && selectedAaa === correctAaa;

    return {
      qcod: question.qcod,
      selectedAaa,
      correctAaa,
      isCorrect,
    };
  });

  const score = records.filter((r) => r.isCorrect).length;

  return { score, records };
}
