'use client';

import {
  BookOpen,
  ChevronRight,
  ClipboardList,
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
  iconBg: string;
  iconColor: string;
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
      iconBg: 'bg-amber-400/15',
      iconColor: 'text-amber-400',
    },
    {
      id: 'exam',
      icon: ClipboardList,
      title: 'Προσομοίωση Εξέτασης',
      subtitle: `${examQuestionCount} ερωτήσεις · Πραγματική κατανομή ΚΟΚ`,
      href: `/exam/${kcod}`,
      iconBg: 'bg-emerald-400/15',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'topics',
      icon: BookOpen,
      title: 'Ανά Θέμα',
      subtitle: `${topicCount} θεματικές ενότητες`,
      href: '/topics',
      iconBg: 'bg-blue-400/15',
      iconColor: 'text-blue-400',
    },
    {
      id: 'weak',
      icon: Target,
      title: 'Τα λάθη σου',
      subtitle: 'Εξάσκηση στις ερωτήσεις που έκανες λάθος',
      href: `/practice/${kcod}?mode=weak`,
      iconBg: 'bg-rose-400/15',
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="section-title">Επιλογές</h2>

      <div className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <Link
              key={option.id}
              href={option.href}
              className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card px-4 py-4 transition-colors hover:border-primary/30"
            >
              <span
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                  option.iconBg
                )}
              >
                <Icon className={cn('size-6', option.iconColor)} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="card-title">{option.title}</p>
                <p className="card-subtitle">{option.subtitle}</p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
