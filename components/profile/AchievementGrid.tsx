'use client';

import Link from 'next/link';
import type { AchievementStatus } from '@/lib/achievements';
import {
  ACHIEVEMENT_COLORS,
  ACHIEVEMENT_ICONS,
} from '@/lib/achievement-display';
import { hrefWithCategory } from '@/lib/category-url';
import { profileInsightBodyClass, profileInsightHeaderClass } from '@/lib/profile-section';
import { cn } from '@/lib/utils';

type AchievementGridProps = {
  achievements: AchievementStatus[];
  kcod: number;
  preview?: boolean;
  showHeader?: boolean;
};

export function AchievementGrid({
  achievements,
  kcod,
  preview = false,
  showHeader = true,
}: AchievementGridProps) {
  const unlocked = achievements.filter((item) => item.unlocked);
  const locked = achievements.filter((item) => !item.unlocked);
  const items = preview
    ? [...unlocked, ...locked].slice(0, 4)
    : achievements;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4">
      {showHeader && (
        <div className={cn(profileInsightHeaderClass, 'flex items-center justify-between gap-3')}>
          <div>
            <h2 className="card-title">Επιτεύγματα</h2>
            <p className="card-subtitle">
              {unlocked.length}/{achievements.length} ξεκλειδωμένα
            </p>
          </div>
          {preview && (
            <Link
              href={hrefWithCategory('/ranking?tab=achievements', kcod)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Όλα →
            </Link>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-6 text-center card-subtitle">
          Κάνε εξάσκηση για να κερδίσεις επιτεύγματα
        </p>
      ) : (
        <div className={profileInsightBodyClass}>
          <div
            className={cn(
              'grid gap-3',
              preview ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'
            )}
          >
          {items.map((achievement) => {
            const Icon = ACHIEVEMENT_ICONS[achievement.id];
            const colors = ACHIEVEMENT_COLORS[achievement.id];

            return (
              <div
                key={achievement.id}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border p-3 text-center',
                  achievement.unlocked
                    ? 'border-border/60 bg-background/40'
                    : 'border-border/40 bg-muted/20 opacity-50 grayscale'
                )}
              >
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-2xl',
                    colors
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <p className="card-item-title leading-snug">{achievement.title}</p>
                {!preview && (
                  <p className="card-subtitle leading-snug">
                    {achievement.description}
                  </p>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {preview && unlocked.length > 4 && (
        <p className="mt-3 text-center card-subtitle">
          +{unlocked.length - 4} ακόμα
        </p>
      )}
    </section>
  );
}
