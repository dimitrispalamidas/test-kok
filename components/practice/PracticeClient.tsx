'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import type { PracticeBatch } from '@/actions/practice';
import { getPracticeQuestions } from '@/actions/practice';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { CATEGORY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Kateg, QuestWithAnswers } from '@/types/database';

type PracticeClientProps = {
  category: Kateg;
  initialBatch: PracticeBatch;
};

export function PracticeClient({
  category,
  initialBatch,
}: PracticeClientProps) {
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

  const categoryLabel = CATEGORY_LABELS[category.kcod] ?? category.klect;
  const currentQuestion = questions[currentIndex];

  const loadMore = useCallback(async (): Promise<QuestWithAnswers[]> => {
    if (!hasMore || loadingMore) {
      return questions;
    }

    setLoadingMore(true);
    try {
      const batch = await getPracticeQuestions(
        category.kcod,
        offset + initialBatch.limit,
        initialBatch.limit
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
  ]);

  const handleSelect = (aaa: number) => {
    if (revealed || !currentQuestion) return;
    setSelectedAaa(aaa);
    setRevealed(true);
  };

  const handleNext = async () => {
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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAaa(null);
      setRevealed(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Δεν βρέθηκαν ερωτήσεις για αυτή την κατηγορία.
      </div>
    );
  }

  const isLastLoaded = currentIndex === questions.length - 1;
  const canGoNext = !isLastLoaded || hasMore;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{categoryLabel}</p>
          <h1 className="text-xl font-semibold">Ελεύθερη Εξάσκηση</h1>
        </div>
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Αρχική
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={total}
          selectedAaa={selectedAaa}
          onSelect={handleSelect}
          revealMode={revealed}
          disabled={revealed}
        />

        {revealed && selectedAaa != null && (
          <p
            className={cn(
              'mt-4 rounded-md px-4 py-2 text-sm font-medium',
              currentQuestion.answers.find((a) => a.aaa === selectedAaa)?.acorr
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {currentQuestion.answers.find((a) => a.aaa === selectedAaa)?.acorr
              ? 'Σωστή απάντηση!'
              : 'Λάθος απάντηση — δες τη σωστή παραπάνω.'}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrevious}
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
            onClick={handleNext}
            disabled={!canGoNext || loadingMore}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm',
              'transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {loadingMore ? 'Φόρτωση...' : 'Επόμενη'}
            <ChevronRight className="size-4" />
          </button>
        </div>

        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {total}
        </span>
      </div>
    </div>
  );
}
