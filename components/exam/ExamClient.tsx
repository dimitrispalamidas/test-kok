'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ExamTimer } from '@/components/ui/ExamTimer';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { CATEGORY_LABELS, getPassThreshold } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Kateg, QuestWithAnswers } from '@/types/database';
import {
  computeExamScore,
  getExamResultStorageKey,
  type StoredExamResult,
} from '@/types/exam';

type ExamClientProps = {
  category: Kateg;
  questions: QuestWithAnswers[];
};

export function ExamClient({ category, questions }: ExamClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const passThreshold = getPassThreshold(category.kcod);
  const categoryLabel = CATEGORY_LABELS[category.kcod] ?? category.klect;

  const answeredIndices = useMemo(() => {
    const set = new Set<number>();
    questions.forEach((q, index) => {
      if (answers[q.qcod] != null) {
        set.add(index);
      }
    });
    return set;
  }, [answers, questions]);

  const currentQuestion = questions[currentIndex];
  const unansweredCount = questions.length - answeredIndices.size;

  const finishExam = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);

    const { score } = computeExamScore(questions, answers);
    const passed = score >= passThreshold.min;

    const result: StoredExamResult = {
      kcod: category.kcod,
      categoryLabel,
      categoryName: category.klect,
      timeLimitMinutes: category.ktime,
      questions,
      answers: Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [k, v])
      ),
      score,
      total: questions.length,
      passMin: passThreshold.min,
      passed,
      completedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(
      getExamResultStorageKey(category.kcod),
      JSON.stringify(result)
    );

    router.push(`/exam/${category.kcod}/results`);
  }, [
    submitted,
    questions,
    answers,
    passThreshold.min,
    category,
    categoryLabel,
    router,
  ]);

  const handleSelect = (aaa: number) => {
    if (submitted || !currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.qcod]: aaa }));
  };

  const handleSubmit = () => {
    if (unansweredCount > 0) {
      toast.warning(
        `Απάντησες ${answeredIndices.size}/${questions.length} ερωτήσεις. Θέλεις να υποβάλεις;`,
        {
          action: {
            label: 'Υποβολή',
            onClick: finishExam,
          },
        }
      );
      return;
    }
    finishExam();
  };

  if (!currentQuestion) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Δεν βρέθηκαν ερωτήσεις για αυτή την εξέταση.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{categoryLabel}</p>
          <h1 className="text-xl font-semibold">Εξεταστική Προσομοίωση</h1>
        </div>
        <ExamTimer
          totalMinutes={category.ktime}
          onExpire={finishExam}
          paused={submitted}
        />
      </div>

      <ProgressDots
        total={questions.length}
        current={currentIndex}
        answered={answeredIndices}
        onNavigate={setCurrentIndex}
      />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedAaa={answers[currentQuestion.qcod] ?? null}
          onSelect={handleSelect}
          disabled={submitted}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            disabled={currentIndex === 0}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm',
              'transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <ChevronLeft className="size-4" />
            Προηγούμενη
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))
            }
            disabled={currentIndex === questions.length - 1}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm',
              'transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            Επόμενη
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {answeredIndices.size}/{questions.length} απαντήσεις
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitted}
            className={cn(
              'rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground',
              'transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            Υποβολή
          </button>
        </div>
      </div>
    </div>
  );
}
