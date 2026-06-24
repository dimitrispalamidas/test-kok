'use client';

import { useQuery } from '@tanstack/react-query';
import { Bookmark, Loader2, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getCategorySavedQuestions,
  getCategoryWrongQuestions,
  type WrongQuestWithAnswers,
} from '@/actions/questions';
import type { CategoryWithStats } from '@/actions/categories';
import { CategorySelector } from '@/components/home/CategorySelector';
import { QuestionCard } from '@/components/ui/QuestionCard';
import { useCategory } from '@/hooks/use-category';
import { cn } from '@/lib/utils';

type QuestionsClientProps = {
  categories: CategoryWithStats[];
};

type Tab = 'saved' | 'wrong';

export function QuestionsClient({ categories }: QuestionsClientProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'wrong';
  const [tab, setTab] = useState<Tab>(initialTab);
  const { kcod } = useCategory();

  useEffect(() => {
    const nextTab = searchParams.get('tab') as Tab;
    if (nextTab === 'saved' || nextTab === 'wrong') setTab(nextTab);
  }, [searchParams]);

  const { data: savedQuestions = [], isLoading: savedLoading } = useQuery({
    queryKey: ['saved-questions', kcod],
    queryFn: () => getCategorySavedQuestions(kcod),
  });

  const { data: wrongQuestions = [], isLoading: wrongLoading } = useQuery<WrongQuestWithAnswers[]>({
    queryKey: ['wrong-questions', kcod],
    queryFn: () => getCategoryWrongQuestions(kcod),
  });

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }[] = [
    {
      id: 'wrong',
      label: `Λανθασμένες (${wrongQuestions.length})`,
      icon: X,
      count: wrongQuestions.length,
    },
    {
      id: 'saved',
      label: `Αποθηκευμένες (${savedQuestions.length})`,
      icon: Bookmark,
      count: savedQuestions.length,
    },
  ];

  const activeQuestions = tab === 'wrong' ? wrongQuestions : savedQuestions;
  const isLoading = tab === 'wrong' ? wrongLoading : savedLoading;

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 safe-top lg:max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Ερωτήσεις</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Λανθασμένες και αποθηκευμένες ερωτήσεις
        </p>
      </header>

      <CategorySelector categories={categories} />

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
              tab === id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : activeQuestions.length === 0 ? (
        <EmptyState
          icon={tab === 'saved' ? Bookmark : X}
          message={
            tab === 'saved'
              ? 'Δεν υπάρχουν αποθηκευμένες ερωτήσεις για αυτή την κατηγορία'
              : 'Δεν υπάρχουν λανθασμένες ερωτήσεις για αυτή την κατηγορία'
          }
          variant={tab === 'wrong' ? 'destructive' : 'primary'}
        />
      ) : (
        <div className="space-y-4">
          {activeQuestions.map((question, index) => (
            <div
              key={question.qcod}
              className="rounded-2xl border border-border/60 bg-card p-4"
            >
              <QuestionCard
                question={question}
                questionNumber={index + 1}
                totalQuestions={activeQuestions.length}
                selectedAaa={tab === 'wrong' ? (question as WrongQuestWithAnswers).selectedAaa : null}
                onSelect={() => {}}
                revealMode
                disabled
                showProgress={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
  variant = 'primary',
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
  variant?: 'primary' | 'destructive';
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <span
        className={cn(
          'flex size-20 items-center justify-center rounded-full',
          variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'
        )}
      >
        <Icon
          className={cn(
            'size-10',
            variant === 'destructive' ? 'text-destructive' : 'text-primary'
          )}
        />
      </span>
      <p className="max-w-xs text-center text-muted-foreground">{message}</p>
    </div>
  );
}
