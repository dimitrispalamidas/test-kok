'use client';

import {
  Bike,
  Bus,
  Car,
  ChevronDown,
  ClipboardList,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import type { CategoryWithStats } from '@/actions/categories';
import { useCategory } from '@/hooks/use-category';
import {
  CATEGORY_LABELS,
  CATEGORY_SHORT,
  type ExamCategoryId,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<
  ExamCategoryId,
  React.ComponentType<{ className?: string }>
> = {
  1: Car,
  2: Bike,
  3: Truck,
  4: Bus,
  5: AlertTriangle,
  6: ClipboardList,
  7: ClipboardList,
};

type CategorySelectorProps = {
  categories: CategoryWithStats[];
  variant?: 'dropdown' | 'compact';
};

function CategorySelectorInner({
  categories,
  variant = 'dropdown',
}: CategorySelectorProps) {
  const { kcod, setKcod } = useCategory();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected =
    categories.find((c) => c.kcod === kcod) ?? categories[0] ?? null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!selected) return null;

  const Icon = CATEGORY_ICONS[selected.kcod as ExamCategoryId] ?? Car;
  const label = CATEGORY_LABELS[selected.kcod] ?? selected.klect;
  const short = CATEGORY_SHORT[selected.kcod] ?? String(selected.kcod);

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex size-11 items-center justify-center rounded-xl',
          'border border-primary/40 bg-card text-primary',
          'transition-transform active:scale-95'
        )}
        aria-label={`Κατηγορία: ${label}`}
      >
        <Icon className="size-5" />
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-4 rounded-2xl border-2 border-border/60',
          'bg-card px-4 py-3.5 text-left transition-colors',
          'hover:border-primary/40 active:scale-[0.99]'
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-400">
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="card-field-label">Κατηγορία Οχήματος</p>
          <p className="card-title truncate">{label}</p>
        </div>
        <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-extrabold text-primary">
          {short}
        </span>
        <ChevronDown
          className={cn(
            'size-5 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute inset-x-0 top-full z-50 mt-2 overflow-hidden',
            'rounded-2xl border border-border bg-card shadow-xl'
          )}
        >
          {categories.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat.kcod as ExamCategoryId] ?? Car;
            const catLabel = CATEGORY_LABELS[cat.kcod] ?? cat.klect;
            const isSelected = cat.kcod === kcod;

            return (
              <button
                key={cat.kcod}
                type="button"
                onClick={() => {
                  setKcod(cat.kcod as ExamCategoryId);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                  'hover:bg-accent/60',
                  isSelected && 'bg-primary/10'
                )}
              >
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <CatIcon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="card-title truncate">{catLabel}</p>
                  <p className="card-subtitle">
                    {cat.questionCount} ερωτήσεις · {cat.ktime} λεπτά
                  </p>
                </div>
                {isSelected && (
                  <span className="size-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CategorySelector(props: CategorySelectorProps) {
  return (
    <Suspense fallback={null}>
      <CategorySelectorInner {...props} />
    </Suspense>
  );
}
