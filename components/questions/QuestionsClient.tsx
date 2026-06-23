'use client';

import { Bookmark, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { CategoryWithStats } from '@/actions/categories';
import { CategorySelector } from '@/components/home/CategorySelector';
import { cn } from '@/lib/utils';

type QuestionsClientProps = {
  categories: CategoryWithStats[];
};

type Tab = 'saved' | 'wrong';

export function QuestionsClient({ categories }: QuestionsClientProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'saved';
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const t = searchParams.get('tab') as Tab;
    if (t === 'saved' || t === 'wrong') setTab(t);
  }, [searchParams]);

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'saved', label: 'Αποθηκευμένες (0)', icon: Bookmark },
    { id: 'wrong', label: 'Λανθασμένες (0)', icon: X },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 safe-top">
      <header>
        <h1 className="text-2xl font-bold">Ερωτήσεις</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Αποθηκευμένες και λανθασμένες ερωτήσεις
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

      {tab === 'saved' && (
        <EmptyState
          icon={Bookmark}
          message="Δεν υπάρχουν αποθηκευμένες ερωτήσεις"
        />
      )}

      {tab === 'wrong' && (
        <EmptyState
          icon={X}
          message="Δεν υπάρχουν λανθασμένες ερωτήσεις"
          variant="destructive"
        />
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
      <p className="text-center text-muted-foreground">{message}</p>
    </div>
  );
}
