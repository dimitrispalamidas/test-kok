import type { ExamAnswerRecord } from '@/types/exam';
import type { Database } from '@/types/database';

export type QuestionAttemptSource =
  Database['public']['Tables']['user_question_attempts']['Row']['source'];

export function resolveQuestionAttemptSource(params: {
  title: string;
  durationSeconds: number | null;
}): QuestionAttemptSource {
  if (params.title === 'Τα λάθη σου') {
    return 'weak';
  }

  if (params.durationSeconds != null) {
    return 'exam';
  }

  return 'practice';
}

export function buildQuestionAttemptRows(
  userId: string,
  kcod: number,
  answers: ExamAnswerRecord[],
  source: QuestionAttemptSource,
  theme: string | null = null
) {
  return answers.map((answer) => ({
    user_id: userId,
    qcod: answer.qcod,
    kcod,
    selected_aaa: answer.selectedAaa,
    is_correct: answer.isCorrect,
    source,
    theme,
  }));
}
