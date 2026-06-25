import { ClipboardList, Flame, Sparkles, Zap } from 'lucide-react';

export const HOME_STAT_DISPLAY = {
  quickTests: {
    icon: Zap,
    iconBg: 'bg-amber-400/15',
    iconColor: 'text-amber-400',
  },
  simulationTests: {
    icon: ClipboardList,
    iconBg: 'bg-emerald-400/15',
    iconColor: 'text-emerald-400',
  },
  dailyStreak: {
    icon: Flame,
    iconBg: 'bg-orange-400/15',
    iconColor: 'text-orange-400',
  },
  answerStreak: {
    icon: Sparkles,
    iconBg: 'bg-violet-400/15',
    iconColor: 'text-violet-400',
  },
} as const;

export function getQuickTestStatLabel(count: number): string {
  return count === 1 ? 'Γρήγορο τεστ' : 'Γρήγορα τεστ';
}
