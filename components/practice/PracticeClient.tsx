'use client';

import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Home, RotateCcw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { PracticeBatch } from '@/actions/practice';
import { getPracticeQuestions } from '@/actions/practice';
import { saveExamResult } from '@/actions/user-data';
import { ExamActionBar } from '@/components/exam/ExamActionBar';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { QuestionNumberStrip } from '@/components/ui/QuestionNumberStrip';
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

type PracticeSummary = {
  score: number;
  total: number;
  wrong: number;
  title: string;
};

const questionTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export function PracticeClient({
  category,
  initialBatch,
  theme = null,
  mode = null,
}: PracticeClientProps) {
  const router = useRouter();
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
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [progressByIndex, setProgressByIndex] = useState<
    Map<number, QuestionProgress>
  >(new Map());

  const categoryLabel = CATEGORY_LABELS[category.kcod] ?? category.klect;
  const sessionTitle =
    mode === 'quick'
      ? 'Γρήγορο Τεστ'
      : mode === 'weak'
        ? 'Τα λάθη σου'
        : (theme ?? 'Ελεύθερη Εξάσκηση');
  const currentQuestion = questions[currentIndex];

  const isLastQuestion =
    currentIndex >= total - 1 && currentIndex >= questions.length - 1 && !hasMore;

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

  const handleFinish = async (progress: Map<number, QuestionProgress>) => {
    if (isSubmitting) return;

    const records = buildAnswerRecords(progress);
    if (records.length === 0) {
      toast.warning('Απάντησε τουλάχιστον μία ερώτηση');
      return;
    }

    const score = records.filter((r) => r.isCorrect).length;
    const wrong = records.length - score;
    const passed = score / records.length >= 0.7;

    setIsSubmitting(true);
    try {
      await saveExamResult({
        kcod: category.kcod,
        title: sessionTitle,
        score,
        total: records.length,
        passed,
        durationSeconds: null,
        answers: records,
      });

      setSummary({
        score,
        total: records.length,
        wrong,
        title: sessionTitle,
      });
    } catch {
      toast.error('Σφάλμα αποθήκευσης αποτελεσμάτων');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      const nextProgress = new Map(progressByIndex).set(currentIndex, {
        selectedAaa,
        isCorrect,
      });

      setProgressByIndex(nextProgress);
      setRevealed(true);
      return;
    }

    if (isLastQuestion) {
      await handleFinish(progressByIndex);
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
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.qcod)) {
        next.delete(currentQuestion.qcod);
      } else {
        next.add(currentQuestion.qcod);
      }
      return next;
    });
  };

  if (summary) {
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
            ? 'Δεν έχεις ακόμα λανθασμένες ερωτήσεις σε αυτή την κατηγορία. Κάνε ένα τεστ πρώτα!'
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

      <ExamHeader
        current={currentIndex + 1}
        total={total}
        timerDisplay="∞"
        bookmarked={bookmarks.has(currentQuestion.qcod)}
        onToggleBookmark={toggleBookmark}
        exitHref="/start"
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
      />
    </div>
  );
}
