'use client';

import { CheckCircle2, Home, RotateCcw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { cn } from '@/lib/utils';
import {
  computeExamScore,
  getExamResultStorageKey,
  type StoredExamResult,
} from '@/types/exam';

type ExamResultsClientProps = {
  kcod: number;
};

export function ExamResultsClient({ kcod }: ExamResultsClientProps) {
  const [result, setResult] = useState<StoredExamResult | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(getExamResultStorageKey(kcod));
    if (!raw) return;
    try {
      setResult(JSON.parse(raw) as StoredExamResult);
    } catch {
      setResult(null);
    }
  }, [kcod]);

  const records = useMemo(() => {
    if (!result) return [];
    const numericAnswers: Record<number, number | null> = {};
    for (const [key, value] of Object.entries(result.answers)) {
      numericAnswers[Number(key)] = value;
    }
    return computeExamScore(result.questions, numericAnswers).records;
  }, [result]);

  const wrongQuestions = useMemo(() => {
    if (!result) return [];
    return records
      .filter((r) => !r.isCorrect)
      .map((r) => result.questions.find((q) => q.qcod === r.qcod))
      .filter((q) => q != null);
  }, [records, result]);

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground">
          Δεν βρέθηκαν αποτελέσματα εξέτασης.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Home className="size-4" />
          Αρχική
        </Link>
      </div>
    );
  }

  const reviewQuestion =
    reviewIndex != null ? wrongQuestions[reviewIndex] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <section className="text-center">
        <div
          className={cn(
            'mx-auto mb-4 flex size-20 items-center justify-center rounded-full',
            result.passed
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/15 text-destructive'
          )}
        >
          {result.passed ? (
            <CheckCircle2 className="size-10" />
          ) : (
            <XCircle className="size-10" />
          )}
        </div>

        <h1 className="text-3xl font-bold">
          {result.passed ? 'Επιτυχία!' : 'Αποτυχία'}
        </h1>
        <p className="mt-2 text-muted-foreground">{result.categoryLabel}</p>

        <p className="mt-6 text-5xl font-bold tabular-nums">
          {result.score}
          <span className="text-2xl text-muted-foreground">
            /{result.total}
          </span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Απαιτούνται τουλάχιστον {result.passMin} σωστές απαντήσεις για
          επιτυχία
        </p>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/exam/${kcod}`}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <RotateCcw className="size-4" />
          Νέα εξέταση
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Home className="size-4" />
          Αρχική
        </Link>
      </section>

      {wrongQuestions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Λάθος απαντήσεις ({wrongQuestions.length})
          </h2>

          <div className="flex flex-wrap gap-2">
            {wrongQuestions.map((q, index) => (
              <button
                key={q.qcod}
                type="button"
                onClick={() => setReviewIndex(index)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm transition-colors',
                  reviewIndex === index
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border hover:bg-accent'
                )}
              >
                Ερ.{' '}
                {result.questions.findIndex((item) => item.qcod === q.qcod) + 1}
              </button>
            ))}
          </div>

          {reviewQuestion && (
            <div className="rounded-xl border border-border bg-card p-6">
              <QuestionCard
                question={reviewQuestion}
                questionNumber={
                  result.questions.findIndex(
                    (q) => q.qcod === reviewQuestion.qcod
                  ) + 1
                }
                totalQuestions={result.total}
                selectedAaa={
                  result.answers[String(reviewQuestion.qcod)] ?? null
                }
                onSelect={() => {}}
                revealMode
                disabled
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
