'use client';

import type { AnswerStreakStatus } from '@/lib/answer-streak';
import { AnswerStreakBadge } from '@/components/home/AnswerStreakBadge';

type AnswerStreakBannerProps = {
  status: AnswerStreakStatus;
};

export function AnswerStreakBanner({ status }: AnswerStreakBannerProps) {
  if (status.currentStreak <= 0) return null;

  return (
    <AnswerStreakBadge
      count={status.currentStreak}
      toNextBonus={status.toNextBonus}
    />
  );
}
