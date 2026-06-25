import {
  XP_ANSWER_STREAK_BONUS,
  XP_ANSWER_STREAK_MILESTONE,
} from '@/lib/xp-rewards';

export const ANSWER_STREAK_MILESTONE = XP_ANSWER_STREAK_MILESTONE;
export const ANSWER_STREAK_XP_BONUS = XP_ANSWER_STREAK_BONUS;

export type AnswerStreakStepResult = {
  newStreak: number;
  milestoneReached: boolean;
  xpBonus: number;
  bestStreakCandidate: number;
};

export function processAnswerStreakStep(
  currentStreak: number,
  isCorrect: boolean
): AnswerStreakStepResult {
  if (!isCorrect) {
    return {
      newStreak: 0,
      milestoneReached: false,
      xpBonus: 0,
      bestStreakCandidate: currentStreak,
    };
  }

  const newStreak = currentStreak + 1;
  const milestoneReached =
    newStreak > 0 && newStreak % ANSWER_STREAK_MILESTONE === 0;

  return {
    newStreak,
    milestoneReached,
    xpBonus: milestoneReached ? ANSWER_STREAK_XP_BONUS : 0,
    bestStreakCandidate: newStreak,
  };
}

export function buildAnswerStreakMessage(
  streakCount: number,
  xpBonus: number
): string {
  return `🎯 ${streakCount} συνεχόμενες σωστές! +${xpBonus} XP — συνέχισε!`;
}

export type AnswerStreakStatus = {
  currentStreak: number;
  bestStreak: number;
  toNextBonus: number;
  subtitle: string | null;
};

export function buildAnswerStreakStatus(
  currentStreak: number,
  bestStreak: number
): AnswerStreakStatus {
  if (currentStreak <= 0) {
    return {
      currentStreak: 0,
      bestStreak,
      toNextBonus: ANSWER_STREAK_MILESTONE,
      subtitle: null,
    };
  }

  const remainder = currentStreak % ANSWER_STREAK_MILESTONE;
  const toNextBonus =
    remainder === 0 ? ANSWER_STREAK_MILESTONE : ANSWER_STREAK_MILESTONE - remainder;

  return {
    currentStreak,
    bestStreak,
    toNextBonus,
    subtitle: `${toNextBonus} ακόμα για +${ANSWER_STREAK_XP_BONUS} XP`,
  };
}

export function processAnswerStreakBatch(
  currentStreak: number,
  answers: boolean[]
): {
  newStreak: number;
  bestStreakCandidate: number;
  totalXpBonus: number;
  messages: string[];
} {
  let streak = currentStreak;
  let bestStreakCandidate = currentStreak;
  let totalXpBonus = 0;
  const messages: string[] = [];

  for (const isCorrect of answers) {
    const step = processAnswerStreakStep(streak, isCorrect);
    streak = step.newStreak;
    bestStreakCandidate = Math.max(bestStreakCandidate, step.bestStreakCandidate);

    if (step.milestoneReached) {
      totalXpBonus += step.xpBonus;
      messages.push(buildAnswerStreakMessage(streak, step.xpBonus));
    }
  }

  return {
    newStreak: streak,
    bestStreakCandidate,
    totalXpBonus,
    messages,
  };
}
