'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type QuestionNumberStripProps = {
  total: number;
  current: number;
  answered: Set<number>;
  onNavigate: (index: number) => void;
};

export function QuestionNumberStrip({
  total,
  current,
  answered,
  onNavigate,
}: QuestionNumberStripProps) {
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [current]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {Array.from({ length: total }, (_, index) => {
        const isCurrent = index === current;
        const isAnswered = answered.has(index);

        return (
          <button
            key={index}
            ref={isCurrent ? currentRef : undefined}
            type="button"
            onClick={() => onNavigate(index)}
            aria-label={`Ερώτηση ${index + 1}`}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all',
              isCurrent &&
                'bg-primary text-primary-foreground ring-2 ring-primary/30',
              !isCurrent &&
                isAnswered &&
                'border-2 border-warning bg-warning/10 text-warning',
              !isCurrent &&
                !isAnswered &&
                'border border-border/60 bg-card text-muted-foreground hover:border-primary/40'
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
