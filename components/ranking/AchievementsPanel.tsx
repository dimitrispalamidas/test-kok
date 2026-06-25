'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { getProfileInsights } from '@/actions/profile-insights';
import { AchievementGrid } from '@/components/profile/AchievementGrid';
import { useCategory } from '@/hooks/use-category';
import { queryKeys } from '@/lib/query-keys';

export function AchievementsPanel() {
  const { kcod } = useCategory();

  const { data: insights, isLoading, error } = useQuery({
    queryKey: queryKeys.profileInsights(kcod),
    queryFn: () => getProfileInsights(kcod),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !insights) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Σύνδεσου για να δεις τα επιτεύγματά σου
      </p>
    );
  }

  return (
    <AchievementGrid
      achievements={insights.achievements}
      kcod={kcod}
      preview={false}
    />
  );
}
