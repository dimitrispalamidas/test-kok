'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { saveExamResult } from '@/actions/user-data';
import { ExamActionBar } from '@/components/exam/ExamActionBar';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { useExamTimer } from '@/components/exam/useExamTimer';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { QuestionNumberStrip } from '@/components/ui/QuestionNumberStrip';
import { hrefWithCategory } from '@/lib/category-url';
import { SIMULATION_EXAM_TITLE, TEST_EXIT_CONFIRMATION } from '@/lib/exam-session';
import { CATEGORY_LABELS, getPassThreshold } from '@/lib/constants';
import { invalidateUserData } from '@/lib/invalidate-user-data';
import { playStreakSound } from '@/lib/sound-effects';
import { useQuestionBookmarks } from '@/hooks/use-question-bookmarks';
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

const questionTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export function ExamClient({ category, questions }: ExamClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const { bookmarks, toggleBookmark: saveBookmark } = useQuestionBookmarks();
  const startTimeRef = useRef<number>(Date.now());

  const passThreshold = getPassThreshold(category.kcod);
  const categoryLabel = CATEGORY_LABELS[category.kcod] ?? category.klect;

  // Scale pass minimum to the generated question count (same ratio as official exam).
  const scaledPassMin = Math.ceil(
    questions.length * (passThreshold.min / passThreshold.total)
  );

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

    const { score, records } = computeExamScore(questions, answers);
    const passed = score >= scaledPassMin;
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    saveExamResult({
      kcod: category.kcod,
      title: SIMULATION_EXAM_TITLE,
      score,
      total: questions.length,
      passed,
      durationSeconds,
      answers: records,
    })
      .then((response) => {
        if (response?.streak?.message) {
          toast.success(response.streak.message, { duration: 5000 });
        }
        for (const message of response?.answerStreakMessages ?? []) {
          playStreakSound();
          toast.success(message, { duration: 5000 });
        }
        invalidateUserData(queryClient);
      })
      .catch(() => {});

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
      passMin: scaledPassMin,
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
    scaledPassMin,
    category,
    categoryLabel,
    router,
  ]);

  const { display, isUrgent } = useExamTimer({
    totalMinutes: category.ktime,
    onExpire: finishExam,
    paused: submitted,
  });

  const handleSelect = (aaa: number) => {
    if (submitted || !currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.qcod]: aaa }));
  };

  const handleConfirm = () => {
    if (!currentQuestion) return;

    const hasAnswer = answers[currentQuestion.qcod] != null;

    if (!hasAnswer) {
      toast.warning('Επίλεξε μια απάντηση');
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

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

  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const toggleBookmark = () => {
    if (!currentQuestion) return;
    void saveBookmark(currentQuestion.qcod);
  };

  if (!currentQuestion) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Δεν βρέθηκαν ερωτήσεις για αυτή την εξέταση.
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 pb-28 pt-4 lg:max-w-3xl">
      <ExamHeader
        current={currentIndex + 1}
        total={questions.length}
        timerDisplay={display}
        isUrgent={isUrgent}
        bookmarked={bookmarks.has(currentQuestion.qcod)}
        onToggleBookmark={toggleBookmark}
        exitHref={hrefWithCategory('/', category.kcod)}
        exitConfirmation={TEST_EXIT_CONFIRMATION.simulation}
      />

      <QuestionNumberStrip
        total={questions.length}
        current={currentIndex}
        answered={answeredIndices}
        onNavigate={setCurrentIndex}
      />

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={currentQuestion.qcod} {...questionTransition}>
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedAaa={answers[currentQuestion.qcod] ?? null}
              onSelect={handleSelect}
              disabled={submitted}
              showProgress={false}
              variant="exam"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <ExamActionBar
        onSkip={handleSkip}
        onConfirm={handleConfirm}
        confirmDisabled={submitted}
      />
    </div>
  );
}
