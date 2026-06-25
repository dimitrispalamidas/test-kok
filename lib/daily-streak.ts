import { XP_DAILY_STREAK } from '@/lib/xp-rewards';

export const STREAK_XP_BONUS = XP_DAILY_STREAK;
export const ATHENS_TIMEZONE = 'Europe/Athens';

export type DailyStreakUpdate = {
  currentStreak: number;
  xpBonus: number;
  extended: boolean;
  isFirstDay: boolean;
  message: string;
};

export type DailyStreakStatus = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activeToday: boolean;
  atRisk: boolean;
  welcomeMessage: string | null;
};

export function getDateInAthens(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ATHENS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getYesterdayInAthens(): string {
  const today = getDateInAthens();
  const [year, month, day] = today.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  utcDate.setUTCDate(utcDate.getUTCDate() - 1);
  return utcDate.toISOString().slice(0, 10);
}

export function computeDailyStreakUpdate(params: {
  lastActiveDate: string | null;
  currentStreak: number;
  today?: string;
}): {
  newStreak: number;
  xpBonus: number;
  extended: boolean;
  isFirstDay: boolean;
} {
  const today = params.today ?? getDateInAthens();
  const yesterday = getYesterdayInAthens();
  const { lastActiveDate, currentStreak } = params;

  if (lastActiveDate === today) {
    return {
      newStreak: currentStreak,
      xpBonus: 0,
      extended: false,
      isFirstDay: false,
    };
  }

  if (lastActiveDate === yesterday) {
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      xpBonus: newStreak >= 2 ? STREAK_XP_BONUS : 0,
      extended: true,
      isFirstDay: false,
    };
  }

  return {
    newStreak: 1,
    xpBonus: 0,
    extended: lastActiveDate !== null,
    isFirstDay: lastActiveDate === null,
  };
}

export function buildStreakToastMessage(update: {
  currentStreak: number;
  xpBonus: number;
  extended: boolean;
  isFirstDay: boolean;
}): string {
  if (update.isFirstDay) {
    return `Ξεκίνησες σερί! Κάνε τεστ και αύριο ξανά για +${STREAK_XP_BONUS} XP.`;
  }

  if (update.extended && update.currentStreak >= 2) {
    return `🔥 ${update.currentStreak} μέρες σερί με τεστ! +${update.xpBonus} XP — συνέχισε έτσι!`;
  }

  if (update.extended && update.currentStreak === 1) {
    return `Νέο σερί — κάνε τεστ και αύριο ξανά για +${STREAK_XP_BONUS} XP.`;
  }

  return '';
}

export function buildDailyStreakStatus(params: {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  today?: string;
}): DailyStreakStatus {
  const today = params.today ?? getDateInAthens();
  const yesterday = getYesterdayInAthens();
  const activeToday = params.lastActiveDate === today;
  const atRisk =
    !activeToday &&
    params.lastActiveDate === yesterday &&
    params.currentStreak > 0;

  let welcomeMessage: string | null = null;

  if (atRisk) {
    welcomeMessage = `Σερί ${params.currentStreak} ${params.currentStreak === 1 ? 'μέρας' : 'ημερών'} — κάνε τεστ σήμερα για να το συνεχίσεις και να πάρεις +${STREAK_XP_BONUS} XP.`;
  } else if (activeToday && params.currentStreak >= 2) {
    welcomeMessage = `Σερί ${params.currentStreak} ημερών με τεστ — γύρνα αύριο για +${STREAK_XP_BONUS} XP.`;
  }

  return {
    currentStreak: params.currentStreak,
    longestStreak: params.longestStreak,
    lastActiveDate: params.lastActiveDate,
    activeToday,
    atRisk,
    welcomeMessage,
  };
}
