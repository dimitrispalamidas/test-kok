'use client';

import { Award, BarChart3, Trophy } from 'lucide-react';
import { useState } from 'react';
import type { CategoryWithStats } from '@/actions/categories';
import { CategorySelector } from '@/components/home/CategorySelector';
import { cn } from '@/lib/utils';

type RankingTab = 'charts' | 'ranking' | 'achievements';

const tabs: {
  id: RankingTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'charts', label: 'Γραφήματα', icon: BarChart3 },
  { id: 'ranking', label: 'Κατάταξη', icon: Trophy },
  { id: 'achievements', label: 'Επιτεύγματα', icon: Award },
];

type RankingClientProps = {
  categories: CategoryWithStats[];
};

export function RankingClient({ categories }: RankingClientProps) {
  const [tab, setTab] = useState<RankingTab>('charts');

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6 safe-top lg:max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Κατάταξη</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Γραφήματα, κατάταξη και επιτεύγματα
        </p>
      </header>

      <CategorySelector categories={categories} />

      <div className="flex rounded-2xl border border-border/60 bg-card p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-colors',
              tab === id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 py-24">
        <span className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <BarChart3 className="size-10 text-primary" />
        </span>
        <p className="text-muted-foreground">Δεν υπάρχουν δεδομένα ακόμα</p>
      </div>
    </div>
  );
}
