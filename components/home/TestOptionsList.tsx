'use client';

import {
  Bookmark,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Play,
  Shuffle,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCategoryStore } from '@/lib/store/category-store';
import { getStats } from '@/lib/stats';
import { cn } from '@/lib/utils';

type TestOptionsListProps = {
  examQuestionCount: number;
  topicCount?: number;
};

type TestOption = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  href: string;
  accent?: 'primary' | 'warning' | 'destructive';
};

export function TestOptionsList({
  examQuestionCount,
  topicCount = 0,
}: TestOptionsListProps) {
  const { kcod } = useCategoryStore();
  const [savedCount, setSavedCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    const stats = getStats();
    setSavedCount(stats.savedCount);
    setWrongCount(stats.wrongCount);
  }, []);

  const options: TestOption[] = [
    {
      id: 'exam',
      icon: ClipboardList,
      title: 'Έτοιμο Τεστ',
      subtitle: `${examQuestionCount} ερωτήσεις`,
      href: `/exam/${kcod}`,
      accent: 'primary',
    },
    {
      id: 'topics',
      icon: BookOpen,
      title: 'Ανά Θέμα',
      subtitle: `${topicCount} θέματα`,
      href: '/topics',
      accent: 'primary',
    },
    {
      id: 'random',
      icon: Shuffle,
      title: 'Τυχαίο Τεστ',
      subtitle: `${examQuestionCount} ερωτήσεις`,
      href: `/exam/${kcod}`,
      accent: 'primary',
    },
    {
      id: 'saved',
      icon: Bookmark,
      title: 'Αποθηκευμένες',
      subtitle: `${savedCount} αποθηκευμένες`,
      href: '/questions?tab=saved',
      accent: 'warning',
    },
    {
      id: 'wrong',
      icon: X,
      title: 'Λανθασμένες',
      subtitle: `${wrongCount} λανθασμένες`,
      href: '/questions?tab=wrong',
      accent: 'destructive',
    },
  ];

  const accentColors = {
    primary: 'text-primary bg-primary/15',
    warning: 'text-warning bg-warning/15',
    destructive: 'text-destructive bg-destructive/15',
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Play className="size-4 text-primary" />
        <h2 className="font-semibold">Έναρξη Τεστ</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        {options.map((option, idx) => {
          const Icon = option.icon;
          const accent = option.accent ?? 'primary';

          return (
            <Link
              key={option.id}
              href={option.href}
              className={cn(
                'flex items-center gap-3 px-4 py-4 transition-colors hover:bg-accent/40',
                idx > 0 && 'border-t border-border/40'
              )}
            >
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  accentColors[accent]
                )}
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{option.title}</p>
                <p className="text-sm text-muted-foreground">
                  {option.subtitle}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
