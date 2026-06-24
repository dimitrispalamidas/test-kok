'use client';

import {
  BookOpen,
  ChevronRight,
  ClipboardList,
  Play,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useCategory } from '@/hooks/use-category';
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
};

export function TestOptionsList({
  examQuestionCount,
  topicCount = 0,
}: TestOptionsListProps) {
  const { kcod } = useCategory();

  const options: TestOption[] = [
    {
      id: 'quick',
      icon: Zap,
      title: 'Γρήγορο Τεστ',
      subtitle: '10 ερωτήσεις από διαφορετικά θέματα',
      href: `/practice/${kcod}?mode=quick`,
    },
    {
      id: 'exam',
      icon: ClipboardList,
      title: 'Προσομοίωση Εξέτασης',
      subtitle: `${examQuestionCount} ερωτήσεις · Πραγματική κατανομή ΚΟΚ`,
      href: `/exam/${kcod}`,
    },
    {
      id: 'topics',
      icon: BookOpen,
      title: 'Ανά Θέμα',
      subtitle: `${topicCount} θεματικές ενότητες`,
      href: '/topics',
    },
    {
      id: 'weak',
      icon: Target,
      title: 'Αδύναμα σου',
      subtitle: 'Εξάσκηση στις ερωτήσεις που έκανες λάθος',
      href: `/practice/${kcod}?mode=weak`,
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Play className="size-4 text-primary" />
        <h2 className="font-semibold">Επιλογές</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        {options.map((option, idx) => {
          const Icon = option.icon;

          return (
            <Link
              key={option.id}
              href={option.href}
              className={cn(
                'flex items-center gap-3 px-4 py-4 transition-colors hover:bg-accent/40',
                idx > 0 && 'border-t border-border/40'
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{option.title}</p>
                <p className="text-sm text-muted-foreground">{option.subtitle}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
