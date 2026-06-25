import { isQuickTestResult, isSimulationExamResult } from '@/lib/exam-session';

export type AchievementId =
  | 'daily-streak-3'
  | 'daily-streak-7'
  | 'answer-streak-10'
  | 'answer-streak-25'
  | 'first-quick-test'
  | 'first-simulation'
  | 'simulation-pass'
  | 'simulation-pass-3';

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
};

export type AchievementStatus = AchievementDefinition & {
  unlocked: boolean;
};

export type AchievementContext = {
  longestDailyStreak: number;
  bestAnswerStreak: number;
  quickTests: number;
  simulationTests: number;
  passedSimulations: number;
};

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-quick-test',
    title: 'Πρώτο γρήγορο τεστ',
    description: 'Ολοκλήρωσες το πρώτο σου γρήγορο τεστ',
  },
  {
    id: 'first-simulation',
    title: 'Πρώτη προσομοίωση',
    description: 'Ολοκλήρωσες την πρώτη σου προσομοίωση εξέτασης',
  },
  {
    id: 'simulation-pass',
    title: 'Επιτυχία προσομοίωσης',
    description: 'Πέρασες μια προσομοίωση εξέτασης',
  },
  {
    id: 'simulation-pass-3',
    title: 'Έτοιμος για εξέταση',
    description: 'Πέρασες 3 προσομοιώσεις με επιτυχία',
  },
  {
    id: 'daily-streak-3',
    title: '3 μέρες σερί',
    description: 'Μελέτησες 3 συνεχόμενες ημέρες',
  },
  {
    id: 'daily-streak-7',
    title: '7 μέρες σερί',
    description: 'Μελέτησες 7 συνεχόμενες ημέρες',
  },
  {
    id: 'answer-streak-10',
    title: '10 σερί σωστών',
    description: '10 συνεχόμενες σωστές απαντήσεις',
  },
  {
    id: 'answer-streak-25',
    title: '25 σερί σωστών',
    description: '25 συνεχόμενες σωστές απαντήσεις',
  },
];

function isUnlocked(id: AchievementId, ctx: AchievementContext): boolean {
  switch (id) {
    case 'daily-streak-3':
      return ctx.longestDailyStreak >= 3;
    case 'daily-streak-7':
      return ctx.longestDailyStreak >= 7;
    case 'answer-streak-10':
      return ctx.bestAnswerStreak >= 10;
    case 'answer-streak-25':
      return ctx.bestAnswerStreak >= 25;
    case 'first-quick-test':
      return ctx.quickTests >= 1;
    case 'first-simulation':
      return ctx.simulationTests >= 1;
    case 'simulation-pass':
      return ctx.passedSimulations >= 1;
    case 'simulation-pass-3':
      return ctx.passedSimulations >= 3;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function computeAchievements(ctx: AchievementContext): AchievementStatus[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => ({
    ...definition,
    unlocked: isUnlocked(definition.id, ctx),
  }));
}

export function buildAchievementContext(params: {
  longestDailyStreak: number;
  bestAnswerStreak: number;
  examHistory: {
    title: string;
    passed: boolean;
    duration_seconds: number | null;
  }[];
}): AchievementContext {
  const quickTests = params.examHistory.filter(isQuickTestResult).length;
  const simulationTests = params.examHistory.filter(isSimulationExamResult).length;
  const passedSimulations = params.examHistory.filter(
    (entry) => isSimulationExamResult(entry) && entry.passed
  ).length;

  return {
    longestDailyStreak: params.longestDailyStreak,
    bestAnswerStreak: params.bestAnswerStreak,
    quickTests,
    simulationTests,
    passedSimulations,
  };
}
