'use client';

import {
  Calendar,
  Car,
  CheckCircle2,
  ExternalLink,
  FileText,
  Gauge,
  Heart,
  Leaf,
  LogIn,
  LogOut,
  Shield,
  Star,
  TriangleAlert,
  Trophy,
  User,
  Wrench,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { getExamHistory } from '@/actions/user-data';
import { signOut } from '@/actions/user-data';
import { CategorySelector } from '@/components/home/CategorySelector';
import type { CategoryWithStats } from '@/actions/categories';
import { useCategoryStats } from '@/hooks/use-category-stats';
import type { CategoryCounts } from '@/lib/category-stats';
import { CATEGORY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

type ProfileUser = { email: string; id: string };
type HistoryEntry = Awaited<ReturnType<typeof getExamHistory>>[number];

type ProfileClientProps = {
  categories: CategoryWithStats[];
  user: ProfileUser | null;
  history: HistoryEntry[];
  countsByCategory: CategoryCounts;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ProfileClient({
  categories,
  user,
  history,
  countsByCategory,
}: ProfileClientProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { history: filteredHistory, stats } = useCategoryStats(
    history,
    countsByCategory
  );

  const successRate =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Σφάλμα αποσύνδεσης');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6 safe-top lg:max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Προφίλ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ρυθμίσεις και χρήσιμες πληροφορίες
        </p>
      </header>

      <CategorySelector categories={categories} />

      {/* Auth section */}
      {user ? (
        <section className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <User className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.email}</p>
              <p className="text-xs text-muted-foreground">Συνδεδεμένος</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loggingOut}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5',
                'text-xs font-medium text-muted-foreground transition-colors hover:bg-accent',
                'disabled:opacity-50'
              )}
            >
              <LogOut className="size-3.5" />
              Αποσύνδεση
            </button>
          </div>

          {/* Stats grid */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/40 pt-4">
            <div className="text-center">
              <p className="text-xl font-bold tabular-nums">{stats.totalTests}</p>
              <p className="text-[10px] text-muted-foreground">Τεστ</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold tabular-nums">{successRate}%</p>
              <p className="text-[10px] text-muted-foreground">Επιτυχία</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold tabular-nums">
                {stats.completedExams}
              </p>
              <p className="text-[10px] text-muted-foreground">Επιτυχημένα</p>
            </div>
          </div>

          {/* Additional stats */}
          {(stats.savedCount > 0 || stats.wrongCount > 0) && (
            <div className="mt-3 flex gap-3 border-t border-border/40 pt-3">
              {stats.savedCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="size-3.5 text-warning" />
                  <span>{stats.savedCount} αποθηκευμένες</span>
                </div>
              )}
              {stats.wrongCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <XCircle className="size-3.5 text-destructive" />
                  <span>{stats.wrongCount} λάθη</span>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-6 text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted mx-auto">
            <User className="size-6 text-muted-foreground" />
          </span>
          <p className="font-medium">Δεν έχεις συνδεθεί</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Συνδέσου για να αποθηκεύεις τα αποτελέσματά σου
          </p>
          <Link
            href="/auth"
            className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5',
              'text-sm font-semibold text-primary-foreground',
              'transition-all hover:brightness-110 active:scale-[0.98]'
            )}
          >
            <LogIn className="size-4" />
            Σύνδεση / Εγγραφή
          </Link>
        </section>
      )}

      {/* Exam history */}
      {user && filteredHistory.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            <h2 className="font-semibold">Ιστορικό Εξετάσεων</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            {filteredHistory.map((entry, idx) => {
              const pct = entry.total > 0 ? Math.round((entry.score / entry.total) * 100) : 0;
              return (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    idx > 0 && 'border-t border-border/40'
                  )}
                >
                  {entry.passed ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-destructive" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {CATEGORY_LABELS[entry.kcod] ?? entry.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {entry.score}/{entry.total}
                    </p>
                    <p className="text-xs text-muted-foreground">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
        <p className="mt-1">Ταμπουρεάς Driving Test — Σχολή Οδηγών Σωτήρης Ταμπουρεάς</p>
      </footer>
    </div>
  );
}
