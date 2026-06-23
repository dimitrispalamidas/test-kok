'use client';

import { useEffect, useRef, useState } from 'react';

type UseExamTimerOptions = {
  totalMinutes: number;
  onExpire: () => void;
  paused?: boolean;
};

export function useExamTimer({
  totalMinutes,
  onExpire,
  paused = false,
}: UseExamTimerOptions) {
  const totalSeconds = totalMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (paused || remaining <= 0) return;

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

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return { remaining, display, isUrgent, progress };
}
