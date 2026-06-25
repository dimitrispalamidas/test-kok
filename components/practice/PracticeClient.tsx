'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Home, RotateCcw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { PracticeBatch } from '@/actions/practice';
import { getPracticeQuestions, recordWeakPracticeStep } from '@/actions/practice';
import {
  getAnswerStreakStatus,
  recordAnswerStreakStep,
  recordPracticeStep,
  saveExamResult,
} from '@/actions/user-data';
import { ExamActionBar } from '@/components/exam/ExamActionBar';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { AnswerStreakBadge } from '@/components/home/AnswerStreakBadge';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { QuestionNumberStrip } from '@/components/ui/QuestionNumberStrip';
import { invalidateUserData } from '@/lib/invalidate-user-data';
import { playAnswerSound, playStreakSound, playTestResultSound } from '@/lib/sound-effects';
import { useQuestionBookmarks } from '@/hooks/use-question-bookmarks';
import { hrefWithCategory } from '@/lib/category-url';
import { fireSuccessConfetti } from '@/lib/confetti';
import { TEST_EXIT_CONFIRMATION } from '@/lib/exam-session';
import { CATEGORY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Kateg, QuestWithAnswers } from '@/types/database';
import type { ExamAnswerRecord } from '@/types/exam';

type PracticeMode = 'quick' | 'weak' | null;

type PracticeClientProps = {
  category: Kateg;
  initialBatch: PracticeBatch;
  theme?: string | null;
  mode?: PracticeMode;
};

type QuestionProgress = {
  selectedAaa: number;
  isCorrect: boolean;
};

type PracticeSummary =
  | {
      type: 'session';
      score: number;
      total: number;
      wrong: number;
      title: string;
      answerStreak: number;
      sessionBestStreak: number;
    }
  | {
      type: 'topic';
      theme: string;
      score: number;
      total: number;
      wrong: number;
      answerStreak: number;
      sessionBestStreak: number;
    };

const questionTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

function computeSessionBestStreakFromRecords(
  records: ExamAnswerRecord[]
): number {
  let running = 0;
  let best = 0;

  for (const record of records) {
    if (record.isCorrect) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }

  return best;
}

function rekeyProgressAfterRemoval(
  oldQuestions: QuestWithAnswers[],
  removedQcod: number,
  progress: Map<number, QuestionProgress>
): Map<number, QuestionProgress> {
  const next = new Map<number, QuestionProgress>();
  let newIdx = 0;

  for (let i = 0; i < oldQuestions.length; i++) {
    if (oldQuestions[i].qcod === removedQcod) continue;

    const item = progress.get(i);
    if (item) {
      next.set(newIdx, item);
    }
    newIdx += 1;
  }

  return next;
}

function toAnswerRecord(
  question: QuestWithAnswers,
  selectedAaa: number,
  isCorrect: boolean
): ExamAnswerRecord {
  return {
    qcod: question.qcod,
    selectedAaa,
    correctAaa: question.answers.find((answer) => answer.acorr)?.aaa ?? 0,
    isCorrect,
  };
}

export function PracticeClient({
  category,
  initialBatch,
  theme = null,
  mode = null,
}: PracticeClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<QuestWithAnswers[]>(
    initialBatch.questions
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAaa, setSelectedAaa] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [offset, setOffset] = useState(initialBatch.offset);
  const [total, setTotal] = useState(initialBatch.total);
  const [hasMore, setHasMore] = useState(initialBatch.hasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<PracticeSummary | null>(null);
  const confettiFiredRef = useRef(false);
  const { bookmarks, toggleBookmark: saveBookmark } = useQuestionBookmarks();
  const [progressByIndex, setProgressByIndex] = useState<
    Map<number, QuestionProgress>
  >(new Map());
  const [sessionRecords, setSessionRecords] = useState<ExamAnswerRecord[]>([]);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [sessionBestStreak, setSessionBestStreak] = useState(0);

  const categoryLabel = CATEGORY_LABELS[category.kcod] ?? category.klect;
  const isTopicMode = Boolean(theme) && mode == null;
  const sessionTitle =
    mode === 'quick'
      ? 'Γρήγορο Τεστ'
      : mode === 'weak'
        ? 'Τα λάθη σου'
        : (theme ?? 'Ελεύθερη Εξάσκηση');
  const currentQuestion = questions[currentIndex];

  const isLastQuestion =
    currentIndex >= total - 1 && currentIndex >= questions.length - 1 && !hasMore;

  const allQuestionsAnswered =
    isTopicMode &&
    total > 0 &&
    Array.from({ length: total }, (_, index) => index).every((index) =>
      progressByIndex.has(index)
    );

  const { answeredIndices, correctIndices, incorrectIndices } = useMemo(() => {
    const answered = new Set<number>();
    const correct = new Set<number>();
    const incorrect = new Set<number>();

    for (const [index, progress] of progressByIndex) {
      answered.add(index);
      if (progress.isCorrect) {
        correct.add(index);
      } else {
        incorrect.add(index);
      }
    }

    return {
      answeredIndices: answered,
      correctIndices: correct,
      incorrectIndices: incorrect,
    };
  }, [progressByIndex]);

  const buildAnswerRecords = useCallback(
    (progress: Map<number, QuestionProgress>): ExamAnswerRecord[] => {
      const records: ExamAnswerRecord[] = [];

      for (const [index, item] of progress) {
        const question = questions[index];
        if (!question) continue;

        const correctAaa = question.answers.find((a) => a.acorr)?.aaa ?? 0;
        records.push({
          qcod: question.qcod,
          selectedAaa: item.selectedAaa,
          correctAaa,
          isCorrect: item.isCorrect,
        });
      }

      return records;
    },
    [questions]
  );

  const loadMore = useCallback(async (): Promise<QuestWithAnswers[]> => {
    if (!hasMore || loadingMore) {
      return questions;
    }

    setLoadingMore(true);
    try {
      const batch = await getPracticeQuestions(
        category.kcod,
        offset + initialBatch.limit,
        initialBatch.limit,
        theme
      );
      const merged = [...questions, ...batch.questions];
      setQuestions(merged);
      setOffset(batch.offset);
      setTotal(batch.total);
      setHasMore(batch.hasMore);
      return merged;
    } finally {
      setLoadingMore(false);
    }
  }, [
    category.kcod,
    hasMore,
    initialBatch.limit,
    loadingMore,
    offset,
    questions,
    theme,
  ]);

  const handleFinish = async (records: ExamAnswerRecord[]) => {
    if (isSubmitting) return;

    if (records.length === 0) {
      toast.warning('Απάντησε τουλάχιστον μία ερώτηση');
      return;
    }

    const score = records.filter((record) => record.isCorrect).length;
    const wrong = records.length - score;
    const passed = score / records.length >= 0.7;

    setIsSubmitting(true);
    try {
      const response = await saveExamResult({
        kcod: category.kcod,
        title: sessionTitle,
        score,
        total: records.length,
        passed,
        durationSeconds: null,
        answers: records,
        answerStreakAlreadyRecorded: true,
        skipWrongQuestionUpdates: mode === 'weak',
      });

      if (response?.streak?.message) {
        toast.success(response.streak.message, { duration: 5000 });
      }

      invalidateUserData(queryClient);

      const streakStatus = await getAnswerStreakStatus();
      const bestInSession = Math.max(
        sessionBestStreak,
        computeSessionBestStreakFromRecords(records)
      );

      playTestResultSound(passed);

      setSummary({
        type: 'session',
        score,
        total: records.length,
        wrong,
        title: sessionTitle,
        answerStreak: streakStatus?.currentStreak ?? answerStreak,
        sessionBestStreak: bestInSession,
      });
    } catch {
      toast.error('Σφάλμα αποθήκευσης αποτελεσμάτων');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopicComplete = () => {
    const records = buildAnswerRecords(progressByIndex);
    const score = records.filter((record) => record.isCorrect).length;
    const wrong = records.length - score;
    const bestInSession = Math.max(
      sessionBestStreak,
      computeSessionBestStreakFromRecords(records)
    );

    setSummary({
      type: 'topic',
      theme: theme ?? sessionTitle,
      score,
      total: records.length,
      wrong,
      answerStreak,
      sessionBestStreak: bestInSession,
    });
  };

  useEffect(() => {
    if (!summary || summary.type !== 'session' || confettiFiredRef.current) {
      return;
    }

    const passed =
      summary.total > 0 && summary.score / summary.total >= 0.7;

    if (!passed) {
      return;
    }

    confettiFiredRef.current = true;
    fireSuccessConfetti();
  }, [summary]);

  const handleSelect = (aaa: number) => {
    if (revealed || !currentQuestion || summary) return;
    setSelectedAaa(aaa);
  };

  const handleConfirm = async () => {
    if (summary || !currentQuestion) return;

    if (!revealed) {
      if (selectedAaa == null) return;

      const isCorrect =
        currentQuestion.answers.find((a) => a.aaa === selectedAaa)?.acorr ??
        false;

      playAnswerSound(isCorrect);

      const answerRecord = toAnswerRecord(
        currentQuestion,
        selectedAaa,
        isCorrect
      );

      if (mode === 'weak') {
        const nextSessionRecords = [...sessionRecords, answerRecord];
        setSessionRecords(nextSessionRecords);

        try {
          await recordWeakPracticeStep({
            qcod: currentQuestion.qcod,
            kcod: category.kcod,
            selectedAaa,
            isCorrect,
          });
          queryClient.invalidateQueries({
            queryKey: ['wrong-questions', category.kcod],
          });
          invalidateUserData(queryClient);
        } catch {
          toast.error('Σφάλμα αποθήκευσης απάντησης');
          return;
        }

        recordAnswerStreakStep(isCorrect)
          .then((result) => {
            if (result) {
              setAnswerStreak(result.currentStreak);
              setSessionBestStreak((best) =>
                Math.max(best, result.currentStreak)
              );
              invalidateUserData(queryClient);
            }
            if (result?.message) {
              playStreakSound();
              toast.success(result.message, { duration: 5000 });
            }
          })
          .catch(() => {});

        const nextProgress = new Map(progressByIndex).set(currentIndex, {
          selectedAaa,
          isCorrect,
        });
        setProgressByIndex(nextProgress);
        setRevealed(true);
        return;
      }

      try {
        const practiceResult = await recordPracticeStep({
          qcod: currentQuestion.qcod,
          kcod: category.kcod,
          selectedAaa,
          isCorrect,
        });
        invalidateUserData(queryClient);
        if (practiceResult?.streakMessage) {
          toast.success(practiceResult.streakMessage, { duration: 5000 });
        }
      } catch {
        toast.error('Σφάλμα αποθήκευσης απάντησης');
        return;
      }

      const nextProgress = new Map(progressByIndex).set(currentIndex, {
        selectedAaa,
        isCorrect,
      });

      setProgressByIndex(nextProgress);
      setRevealed(true);

      recordAnswerStreakStep(isCorrect)
        .then((result) => {
          if (result) {
            setAnswerStreak(result.currentStreak);
            setSessionBestStreak((best) =>
              Math.max(best, result.currentStreak)
            );
            invalidateUserData(queryClient);
          }
          if (result?.message) {
            playStreakSound();
            toast.success(result.message, { duration: 5000 });
          }
        })
        .catch(() => {});

      return;
    }

    if (isLastQuestion) {
      if (isTopicMode) {
        if (allQuestionsAnswered) {
          handleTopicComplete();
        }
        return;
      }

      const records =
        mode === 'weak' ? sessionRecords : buildAnswerRecords(progressByIndex);
      await handleFinish(records);
      return;
    }

    const currentProgress = progressByIndex.get(currentIndex);

    if (mode === 'weak' && currentProgress?.isCorrect) {
      const remainingQuestions = questions.filter(
        (question) => question.qcod !== currentQuestion.qcod
      );

      if (remainingQuestions.length === 0) {
        await handleFinish(sessionRecords);
        return;
      }

      setQuestions(remainingQuestions);
      setTotal(remainingQuestions.length);
      setProgressByIndex(
        rekeyProgressAfterRemoval(
          questions,
          currentQuestion.qcod,
          progressByIndex
        )
      );
      setCurrentIndex((index) =>
        Math.min(index, Math.max(0, remainingQuestions.length - 1))
      );
      setSelectedAaa(null);
      setRevealed(false);
      return;
    }

    const nextIndex = currentIndex + 1;
    let available = questions;

    if (nextIndex >= available.length && hasMore) {
      available = await loadMore();
    }

    if (nextIndex < available.length) {
      setCurrentIndex(nextIndex);
      setSelectedAaa(null);
      setRevealed(false);
    }
  };

  const handleSkip = async () => {
    if (summary || (revealed && isLastQuestion)) return;

    const nextIndex = currentIndex + 1;
    let available = questions;

    if (nextIndex >= available.length && hasMore) {
      available = await loadMore();
    }

    if (nextIndex < available.length) {
      setCurrentIndex(nextIndex);
      setSelectedAaa(null);
      setRevealed(false);
    }
  };

  const handleNavigate = (index: number) => {
    if (summary || index >= questions.length) return;

    setCurrentIndex(index);
    const progress = progressByIndex.get(index);

    if (progress) {
      setSelectedAaa(progress.selectedAaa);
      setRevealed(true);
      return;
    }

    setSelectedAaa(null);
    setRevealed(false);
  };

  const toggleBookmark = () => {
    if (!currentQuestion || summary) return;
    void saveBookmark(currentQuestion.qcod);
  };

  if (summary) {
    if (summary.type === 'topic') {
      return (
        <div className="mx-auto max-w-lg space-y-8 px-4 py-10 safe-top lg:max-w-3xl">
          <section className="text-center">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="size-10" />
            </div>

            <h1 className="text-3xl font-bold">
              Απαντήσατε σε όλες τις ερωτήσεις!
            </h1>
            <p className="mt-2 text-muted-foreground">{summary.theme}</p>

            <p className="mt-6 text-5xl font-bold tabular-nums">
              {summary.score}
              <span className="text-2xl text-muted-foreground">
                /{summary.total}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {summary.wrong} λάθη σε αυτή τη συνεδρία
            </p>

            {(summary.answerStreak > 0 || summary.sessionBestStreak > 0) && (
              <div className="mt-5 flex flex-col items-center gap-2">
                {summary.answerStreak > 0 ? (
                  <AnswerStreakBadge count={summary.answerStreak} />
                ) : (
                  <p className="text-sm font-semibold text-violet-400">
                    Καλύτερο σερί στη συνεδρία: {summary.sessionBestStreak}{' '}
                    σωστές
                  </p>
                )}
              </div>
            )}

            <p className="mt-6 text-base font-semibold text-foreground">
              Θέλετε να επαναλάβετε αυτό το θέμα ερωτήσεων;
            </p>
          </section>

          <section className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <RotateCcw className="size-4" />
              Ναι, επανάληψη
            </button>
            <Link
              href="/topics"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Όχι, πίσω στα θέματα
            </Link>
          </section>
        </div>
      );
    }

    const percentage =
      summary.total > 0
        ? Math.round((summary.score / summary.total) * 100)
        : 0;

    return (
      <div className="mx-auto max-w-lg space-y-8 px-4 py-10 safe-top lg:max-w-3xl">
        <section className="text-center">
          <div
            className={cn(
              'mx-auto mb-4 flex size-20 items-center justify-center rounded-full',
              percentage >= 70
                ? 'bg-success/15 text-success'
                : 'bg-destructive/15 text-destructive'
            )}
          >
            {percentage >= 70 ? (
              <CheckCircle2 className="size-10" />
            ) : (
              <XCircle className="size-10" />
            )}
          </div>

          <h1 className="text-3xl font-bold">Ολοκληρώθηκε!</h1>
          <p className="mt-2 text-muted-foreground">{summary.title}</p>

          <p className="mt-6 text-5xl font-bold tabular-nums">
            {summary.score}
            <span className="text-2xl text-muted-foreground">
              /{summary.total}
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {percentage}% επιτυχία · {summary.wrong} λάθη
          </p>

          {(summary.answerStreak > 0 || summary.sessionBestStreak > 0) && (
            <div className="mt-5 flex flex-col items-center gap-2">
              {summary.answerStreak > 0 ? (
                <AnswerStreakBadge count={summary.answerStreak} />
              ) : (
                <p className="text-sm font-semibold text-violet-400">
                  Καλύτερο σερί στη συνεδρία: {summary.sessionBestStreak}{' '}
                  σωστές
                </p>
              )}
            </div>
          )}

          <p className="mt-4 text-xs text-success">
            Τα αποτελέσματα αποθηκεύτηκαν στο προφίλ σου
          </p>
        </section>

        <section className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <RotateCcw className="size-4" />
            Ξανά
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Home className="size-4" />
            Αρχική
          </Link>
        </section>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">
          {mode === 'weak'
            ? 'Δεν έχεις λανθασμένες ερωτήσεις σε αυτή την κατηγορία.'
            : 'Δεν βρέθηκαν ερωτήσεις για αυτή την κατηγορία.'}
        </p>
        <Link
          href="/start"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Πίσω στο Τεστ
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 pb-28 pt-4 lg:max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-primary">{sessionTitle}</p>
        <p className="text-xs text-muted-foreground">
          {mode === 'quick'
            ? '10 ερωτήσεις'
            : mode === 'weak'
              ? 'Βασισμένο στα λάθη σου'
              : theme
                ? 'Εξάσκηση ανά Θέμα'
                : 'Ελεύθερη Εξάσκηση'}
        </p>
      </div>

      {answerStreak > 0 && (
        <AnswerStreakBadge count={answerStreak} size="sm" className="w-full" />
      )}

      <ExamHeader
        current={currentIndex + 1}
        total={total}
        timerDisplay="∞"
        bookmarked={bookmarks.has(currentQuestion.qcod)}
        onToggleBookmark={toggleBookmark}
        exitHref={
          isTopicMode
            ? hrefWithCategory('/topics', category.kcod)
            : hrefWithCategory('/start', category.kcod)
        }
        exitConfirmation={
          mode === 'quick' ? TEST_EXIT_CONFIRMATION.quick : null
        }
      />

      <QuestionNumberStrip
        total={total}
        current={currentIndex}
        answered={answeredIndices}
        correct={correctIndices}
        incorrect={incorrectIndices}
        onNavigate={handleNavigate}
      />

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={currentQuestion.qcod} {...questionTransition}>
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={total}
              selectedAaa={selectedAaa}
              onSelect={handleSelect}
              revealMode={revealed}
              disabled={revealed}
              showProgress={false}
              variant="exam"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <ExamActionBar
        onSkip={handleSkip}
        onConfirm={handleConfirm}
        confirmDisabled={selectedAaa == null || loadingMore}
        revealed={revealed}
        isLast={isLastQuestion}
        isSubmitting={isSubmitting}
        lastConfirmLabel={isTopicMode ? 'Τέλος' : undefined}
      />
    </div>
  );
}
