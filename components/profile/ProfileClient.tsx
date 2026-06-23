'use client';

import {
  Calendar,
  Car,
  ExternalLink,
  FileText,
  Gauge,
  Heart,
  Leaf,
  Shield,
  Star,
  TriangleAlert,
  Wrench,
} from 'lucide-react';
import { CategorySelector } from '@/components/home/CategorySelector';
import type { CategoryWithStats } from '@/actions/categories';
import { cn } from '@/lib/utils';

type ProfileClientProps = {
  categories: CategoryWithStats[];
};

const infoItems = [
  { icon: Wrench, label: 'Αλλαγή Λάστιχου', locked: true },
  { icon: Car, label: 'Έλεγχοι Πριν την Οδήγηση', locked: true },
  { icon: Leaf, label: 'Οικονομική Οδήγηση', locked: true },
  { icon: TriangleAlert, label: 'Κατάσταση Έκτακτης Ανάγκης', locked: true },
  { icon: Gauge, label: 'Λυχνίες Ταμπλό', locked: true },
  { icon: Calendar, label: 'Πρόγραμμα Συντήρησης', locked: true },
  { icon: Heart, label: 'Πρώτες Βοήθειες', locked: true },
  { icon: FileText, label: 'Μετά από Ατύχημα', locked: true },
];

const aboutItems = [
  { icon: Shield, label: 'Πολιτική Απορρήτου' },
  { icon: FileText, label: 'Όροι Χρήσης' },
  { icon: Star, label: 'Αξιολόγηση Εφαρμογής' },
];

export function ProfileClient({ categories }: ProfileClientProps) {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6 safe-top">
      <header>
        <h1 className="text-2xl font-bold">Προφίλ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ρυθμίσεις και χρήσιμες πληροφορίες
        </p>
      </header>

      <CategorySelector categories={categories} />

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Car className="size-4 text-primary" />
          <h2 className="font-semibold">Χρήσιμες Πληροφορίες</h2>
        </div>

        <div className="space-y-2">
          {infoItems.map(({ icon: Icon, label, locked }) => (
            <button
              key={label}
              type="button"
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border border-border/60',
                'bg-card px-4 py-4 text-left transition-colors hover:border-primary/20'
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="flex-1 font-medium">{label}</span>
              {locked && (
                <span className="text-xs text-muted-foreground">🔒</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">Σχετικά</h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          {aboutItems.map(({ icon: Icon, label }, idx) => (
            <button
              key={label}
              type="button"
              className={cn(
                'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-accent/40',
                idx > 0 && 'border-t border-border/40'
              )}
            >
              <Icon className="size-5 text-muted-foreground" />
              <span className="flex-1 font-medium">{label}</span>
              <ExternalLink className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      <footer className="pb-4 text-center text-xs text-muted-foreground">
        <p>Έκδοση 0.1.0</p>
        <p className="mt-1">ΚΟΚ Practice — Όλες οι κατηγορίες</p>
      </footer>
    </div>
  );
}
