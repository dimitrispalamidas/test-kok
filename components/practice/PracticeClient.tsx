'use client';

import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { PracticeBatch } from '@/actions/practice';
import { getPracticeQuestions } from '@/actions/practice';
import { ExamActionBar } from '@/components/exam/ExamActionBar';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { QuestionNumberStrip } from '@/components/ui/QuestionNumberStrip';
import { CATEGORY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Kateg, QuestWithAnswers } from '@/types/database';

type PracticeClientProps = {
  category: Kateg;
  initialBatch: PracticeBatch;
  theme?: string | null;
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
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [answeredIndices] = useState<Set<number>>(new Set());

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
  ]);

  const handleSelect = (aaa: number) => {
    if (revealed || !currentQuestion) return;
    setSelectedAaa(aaa);
    setRevealed(true);
  };

  const handleConfirm = async () => {
    if (!revealed) {
      if (selectedAaa == null && currentQuestion) {
        return;
      }
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

  const toggleBookmark = () => {
    if (!currentQuestion) return;
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

  if (!currentQuestion) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Δεν βρέθηκαν ερωτήσεις για αυτή την κατηγορία.
      </div>
    );
  }

  const isCorrect =
    selectedAaa != null &&
    currentQuestion.answers.find((a) => a.aaa === selectedAaa)?.acorr;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 pb-28 pt-4 lg:max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-primary">
          {theme ?? categoryLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          {theme ? 'Εξάσκηση ανά Θέμα' : 'Ελεύθερη Εξάσκηση'}
        </p>
      </div>

      <ExamHeader
        current={currentIndex + 1}
        total={total}
        timerDisplay="∞"
        bookmarked={bookmarks.has(currentQuestion.qcod)}
        onToggleBookmark={toggleBookmark}
        exitHref="/questions"
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

        <AnimatePresence>
          {revealed && selectedAaa != null && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className={cn(
                'mt-5 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium',
                isCorrect
                  ? 'bg-success/12 text-success'
                  : 'bg-destructive/12 text-destructive'
              )}
            >
              {isCorrect ? (
                <CheckCircle2 className="size-5 shrink-0" />
              ) : (
                <XCircle className="size-5 shrink-0" />
              )}
              <span>
                {isCorrect
                  ? 'Σωστή απάντηση!'
                  : 'Λάθος απάντηση — δες τη σωστή παραπάνω.'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExamActionBar
        onSkip={handleSkip}
        onConfirm={handleConfirm}
        confirmDisabled={loadingMore}
      />
    </div>
  );
}
