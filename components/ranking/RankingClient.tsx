'use client';

import { Award, Trophy } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CategorySelector } from '@/components/home/CategorySelector';
import { AchievementsPanel } from '@/components/ranking/AchievementsPanel';
import { LeaderboardPanel } from '@/components/ranking/LeaderboardPanel';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { useCategories, useCurrentUser } from '@/hooks/use-user-data';
import { cn } from '@/lib/utils';

type RankingTab = 'ranking' | 'achievements';

const tabs: {
  id: RankingTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'ranking', label: 'Κατάταξη', icon: Trophy },
  { id: 'achievements', label: 'Επιτεύγματα', icon: Award },
];

export function RankingClient() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as RankingTab) ?? 'ranking';
  const [tab, setTab] = useState<RankingTab>(
    initialTab === 'achievements' ? 'achievements' : 'ranking'
  );
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    const nextTab = searchParams.get('tab') as RankingTab;
    if (nextTab === 'achievements' || nextTab === 'ranking') {
      setTab(nextTab);
    }
  }, [searchParams]);

  if (categoriesLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="page-container space-y-6">
      <header className="space-y-1">
        <p className="page-eyebrow">Πρόοδος</p>
        <h1 className="page-title">Κατάταξη</h1>
      </header>

      <CategorySelector categories={categories} />

      <div className="flex rounded-2xl border border-border/60 bg-card p-1.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-colors',
              tab === id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'ranking' ? (
        <LeaderboardPanel currentUserId={currentUser?.id ?? null} />
      ) : (
        <AchievementsPanel />
      )}
    </div>
  );
}
