/** Central XP reward values — keep in sync with get_leaderboard SQL pass bonus. */
export const XP_PER_CORRECT_ANSWER = 1;
export const XP_PASS_TEST = 15;
export const XP_DAILY_STREAK = 10;
export const XP_ANSWER_STREAK_MILESTONE = 10;
export const XP_ANSWER_STREAK_BONUS = 5;

export function getXpRulesDescription(): string {
  return [
    `+${XP_PER_CORRECT_ANSWER} XP ανά σωστή απάντηση`,
    `+${XP_PASS_TEST} XP αν πέρασες τεστ`,
    `+${XP_DAILY_STREAK} XP αν συνεχίζεις ημερήσιο σερί με τεστ (2+ μέρες)`,
    `+${XP_ANSWER_STREAK_BONUS} XP κάθε ${XP_ANSWER_STREAK_MILESTONE} σερί σωστών`,
  ].join(' · ');
}
