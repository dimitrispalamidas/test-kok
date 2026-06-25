'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Bookmark, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toggleSavedQuestion } from '@/actions/user-data';
import {
  ReviewQuestionCard,
} from '@/components/questions/ReviewQuestionCard';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { invalidateUserData } from '@/lib/invalidate-user-data';
import { cn } from '@/lib/utils';
import type { QuestWithAnswers } from '@/types/database';

type SavedQuestionCardProps = {
  question: QuestWithAnswers;
  questionNumber: number;
  totalQuestions: number;
  kcod: number;
};

export function SavedQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  kcod,
}: SavedQuestionCardProps) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleConfirmRemove = async () => {
    setRemoving(true);
    try {
      await toggleSavedQuestion(question.qcod);
      queryClient.setQueryData<QuestWithAnswers[]>(
        ['saved-questions', kcod],
        (current) => current?.filter((item) => item.qcod !== question.qcod) ?? []
      );
      invalidateUserData(queryClient);
    } finally {
      setRemoving(false);
      setConfirming(false);
    }
  };

  return (
    <ReviewQuestionCard
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      headerAction={
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={removing}
          className={cn(
            'flex size-10 items-center justify-center rounded-xl text-warning transition-colors',
            'hover:bg-warning/10 disabled:opacity-50'
          )}
          aria-label="Αφαίρεση από αποθηκευμένες"
        >
          <Bookmark className="size-5 fill-current" />
        </button>
      }
      banner={
        confirming ? (
          <div className="border-b border-warning/30 bg-warning/10 px-4 py-4">
            <p className="text-sm font-bold text-foreground">
              Αφαίρεση από τις αποθηκευμένες;
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Η ερώτηση θα εξαφανιστεί από τη λίστα σου — μπορείς να την
              ξανα-αποθηκεύσεις όποτε θέλεις.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={removing}
                className={cn(
                  'inline-flex flex-1 items-center justify-center rounded-xl border border-border/60',
                  'px-4 py-2.5 text-sm font-bold transition-colors hover:bg-card',
                  'disabled:opacity-50 sm:flex-none'
                )}
              >
                Όχι, κράτα την
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={removing}
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-2 rounded-xl',
                  'bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground',
                  'transition-all hover:brightness-110 disabled:opacity-50 sm:flex-none'
                )}
              >
                {removing && <Loader2 className="size-4 animate-spin" />}
                Ναι, αφαίρεσέ την
              </button>
            </div>
          </div>
        ) : undefined
      }
    >
      <QuestionCard
        question={question}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        selectedAaa={null}
        onSelect={() => {}}
        revealMode
        disabled
        showProgress={false}
      />
    </ReviewQuestionCard>
  );
}
