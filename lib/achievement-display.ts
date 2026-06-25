import type { AchievementId } from '@/lib/achievements';
import {
  ClipboardList,
  Flame,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const ACHIEVEMENT_ICONS: Record<AchievementId, LucideIcon> = {
  'daily-streak-3': Flame,
  'daily-streak-7': Flame,
  'answer-streak-10': Sparkles,
  'answer-streak-25': Sparkles,
  'first-quick-test': Zap,
  'first-simulation': ClipboardList,
  'simulation-pass': Trophy,
  'simulation-pass-3': Trophy,
};

export const ACHIEVEMENT_COLORS: Record<AchievementId, string> = {
  'daily-streak-3': 'text-orange-400 bg-orange-400/15',
  'daily-streak-7': 'text-orange-400 bg-orange-400/15',
  'answer-streak-10': 'text-violet-400 bg-violet-400/15',
  'answer-streak-25': 'text-violet-400 bg-violet-400/15',
  'first-quick-test': 'text-amber-400 bg-amber-400/15',
  'first-simulation': 'text-emerald-400 bg-emerald-400/15',
  'simulation-pass': 'text-primary bg-primary/15',
  'simulation-pass-3': 'text-primary bg-primary/15',
};
