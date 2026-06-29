import { processAnswerStreakStep } from '@/lib/answer-streak';
import { getDateInAthens, getYesterdayInAthens } from '@/lib/daily-streak';

export type CategoryDailyStreak = {
  currentStreak: number;
  longestStreak: number;
};

export type CategoryAnswerStreak = {
  currentStreak: number;
  bestStreak: number;
};

export type CategoryStreakStats = {
  dailyStreak: CategoryDailyStreak;
  answerStreak: CategoryAnswerStreak;
};

export const EMPTY_CATEGORY_STREAK_STATS: CategoryStreakStats = {
  dailyStreak: { currentStreak: 0, longestStreak: 0 },
  answerStreak: { currentStreak: 0, bestStreak: 0 },
};

function isConsecutiveDay(earlier: string, later: string): boolean {
  const [year, month, day] = earlier.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10) === later;
}

export function computeDailyStreakFromActivityDates(
  activityDates: string[],
  today = getDateInAthens()
): CategoryDailyStreak {
  const uniqueSorted = [...new Set(activityDates)].sort();
  if (uniqueSorted.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < uniqueSorted.length; i += 1) {
    if (isConsecutiveDay(uniqueSorted[i - 1], uniqueSorted[i])) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 1;
    }
  }

  const yesterday = getYesterdayInAthens();
  const lastActive = uniqueSorted[uniqueSorted.length - 1];

  if (lastActive !== today && lastActive !== yesterday) {
    return { currentStreak: 0, longestStreak };
  }

  let currentStreak = 1;
  for (let i = uniqueSorted.length - 2; i >= 0; i -= 1) {
    if (isConsecutiveDay(uniqueSorted[i], uniqueSorted[i + 1])) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

export function computeAnswerStreakFromAttempts(
  isCorrectList: boolean[]
): CategoryAnswerStreak {
  let currentStreak = 0;
  let bestStreak = 0;

  for (const isCorrect of isCorrectList) {
    const step = processAnswerStreakStep(currentStreak, isCorrect);
    currentStreak = step.newStreak;
    bestStreak = Math.max(bestStreak, step.bestStreakCandidate, currentStreak);
  }

  return { currentStreak, bestStreak };
}
