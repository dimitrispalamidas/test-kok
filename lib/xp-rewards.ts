/** Central XP reward values — keep in sync with get_leaderboard SQL pass bonus. */
export const XP_PER_CORRECT_ANSWER = 1;
export const XP_PASS_TEST = 15;
export const XP_DAILY_STREAK = 10;
export const XP_ANSWER_STREAK_MILESTONE = 10;
export const XP_ANSWER_STREAK_BONUS = 5;

export type XpRule = {
  id: 'correct' | 'pass' | 'daily' | 'answer-streak';
  title: string;
  description: string;
  xpLabel: string;
};

export const XP_RULES: XpRule[] = [
  {
    id: 'correct',
    title: 'Σωστές απαντήσεις',
    description: 'Κάθε σωστή απάντηση σε τεστ ή εξάσκηση',
    xpLabel: `+${XP_PER_CORRECT_ANSWER}`,
  },
  {
    id: 'pass',
    title: 'Επιτυχία τεστ',
    description: 'Όταν περνάς ένα τεστ με επιτυχία',
    xpLabel: `+${XP_PASS_TEST}`,
  },
  {
    id: 'daily',
    title: 'Ημερήσιο σερί',
    description: 'Συνεχόμενες μέρες που ολοκληρώνεις τεστ (από 2η μέρα)',
    xpLabel: `+${XP_DAILY_STREAK}`,
  },
  {
    id: 'answer-streak',
    title: 'Σερί σωστών',
    description: `Κάθε ${XP_ANSWER_STREAK_MILESTONE} συνεχόμενες σωστές απαντήσεις`,
    xpLabel: `+${XP_ANSWER_STREAK_BONUS}`,
  },
];
