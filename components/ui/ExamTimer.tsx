'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type ExamTimerProps = {
  totalMinutes: number;
  onExpire: () => void;
  paused?: boolean;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function ExamTimer({
  totalMinutes,
  onExpire,
  paused = false,
}: ExamTimerProps) {
  const totalSeconds = totalMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (paused || remaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true;
          onExpire();
        }
        return Math.max(next, 0);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, remaining, onExpire]);

  const progress = remaining / totalSeconds;
  const isUrgent = progress <= 0.2;

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'relative flex size-12 items-center justify-center rounded-full border-2',
          isUrgent
            ? 'border-destructive text-destructive'
            : 'border-primary text-primary'
        )}
      >
        <svg
          className="absolute inset-0 size-full -rotate-90"
          viewBox="0 0 36 36"
          aria-hidden
        >
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className="stroke-muted"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className={isUrgent ? 'stroke-destructive' : 'stroke-primary'}
            strokeWidth="3"
            strokeDasharray={`${progress * 97.4} 97.4`}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[10px] font-bold tabular-nums">
          {formatTime(remaining)}
        </span>
      </div>
      <div className="hidden sm:block">
        <p className="text-xs text-muted-foreground">Υπολειπόμενος χρόνος</p>
        <p
          className={cn(
            'text-sm font-semibold tabular-nums',
            isUrgent && 'text-destructive'
          )}
        >
          {formatTime(remaining)}
        </p>
      </div>
    </div>
  );
}
