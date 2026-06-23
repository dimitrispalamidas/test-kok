'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
  showCount?: boolean;
  className?: string;
};

export function ProgressBar({
  value,
  max,
  label,
  showCount = true,
  className,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showCount) && (
        <div className="flex items-center justify-between gap-4 text-sm">
          {label ? (
            <span className="font-medium text-muted-foreground">{label}</span>
          ) : (
            <span />
          )}
          {showCount && (
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary shadow-[0_0_12px_oklch(0.52_0.22_264_/_35%)]"
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
        />
      </div>
    </div>
  );
}
