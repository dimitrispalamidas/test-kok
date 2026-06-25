'use client';

import {
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  FileText,
  Gauge,
  Heart,
  Leaf,
  LogIn,
  LogOut,
  Star,
  TriangleAlert,
  User,
  Wrench,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { getExamHistory, getProfile } from '@/actions/user-data';
import { signOut, updateUsername } from '@/actions/user-data';
import { CategorySelector } from '@/components/home/CategorySelector';
import type { CategoryWithStats } from '@/actions/categories';
import { useCategoryStats } from '@/hooks/use-category-stats';
import type { CategoryCounts } from '@/lib/category-stats';
import { CATEGORY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

type ProfileUser = { email: string; id: string };
type HistoryEntry = Awaited<ReturnType<typeof getExamHistory>>[number];
type ProfileData = NonNullable<Awaited<ReturnType<typeof getProfile>>>;

type ProfileClientProps = {
  categories: CategoryWithStats[];
  user: ProfileUser | null;
  profile: ProfileData | null;
  history: HistoryEntry[];
  countsByCategory: CategoryCounts;
};

const infoItems = [
  {
    id: 'tire',
    icon: Wrench,
    label: 'Αλλαγή Λάστιχου',
    iconBg: 'bg-blue-400/15',
    iconColor: 'text-blue-400',
    content:
      'Σταμάτα σε ασφαλές σημείο, ανάψε τα αλάρμ και βάλε τρίγωνο. Χαλάρωσε τα μπουλόνια πριν σηκώσεις το αυτοκίνητο με το jack. Αντικατάστησε το λάστιχο, σφίξε σταυρωτά και έλεγξε την πίεση αέρα πριν ξαναβγείς στον δρόμο.',
  },
  {
    id: 'checks',
    icon: Car,
    label: 'Έλεγχοι Πριν την Οδήγηση',
    iconBg: 'bg-cyan-400/15',
    iconColor: 'text-cyan-400',
    content:
      'Έλεγξε φώτα, φρένα, καθρέφτες και σήμανση. Βεβαιώσου ότι δεν υπάρχουν εμπόδια γύρω από το όχημα. Ρύθμισε κάθισμα, ζώνη και καθρέφτες πριν κινηθείς.',
  },
  {
    id: 'eco',
    icon: Leaf,
    label: 'Οικονομική Οδήγηση',
    iconBg: 'bg-emerald-400/15',
    iconColor: 'text-emerald-400',
    content:
      'Κράτα σταθερή ταχύτητα, απόφυγε απότομα φρενάρισμα και επιτάχυνση. Κλείσε τα παράθυρα σε υψηλές ταχύτητες, αφαίρεσε περιττό βάρος και κράτα τα λάστιχα στη σωστή πίεση για λιγότερη κατανάλωση.',
  },
  {
    id: 'emergency',
    icon: TriangleAlert,
    label: 'Κατάσταση Έκτακτης Ανάγκης',
    iconBg: 'bg-amber-400/15',
    iconColor: 'text-amber-400',
    content:
      'Σε ατύχημα: προστατεύεις ζωές, καλείς 112, σηματοδοτείς το σημείο και δεν μετακινείς τραυματίες εκτός αν υπάρχει άμεσος κίνδυνος. Κράτα ψυχραιμία και ακολούθησε τις οδηγίες των υπηρεσιών.',
  },
  {
    id: 'dashboard',
    icon: Gauge,
    label: 'Λυχνίες Ταμπλό',
    iconBg: 'bg-violet-400/15',
    iconColor: 'text-violet-400',
    content:
      'Κόκκινη λυχνία: σταμάτα αμέσως και έλεγξε. Κίτρινη: προσοχή, έλεγχος σύντομα. Πράσινη/μπλε: κανονική λειτουργία. Μην αγνοείς επαναλαμβανόμενα σήματα — σημαίνουν βλάβη ή ανάγκη συντήρησης.',
  },
  {
    id: 'maintenance',
    icon: Calendar,
    label: 'Πρόγραμμα Συντήρησης',
    iconBg: 'bg-sky-400/15',
    iconColor: 'text-sky-400',
    content:
      'Έλεγχος λαδιών, φίλτρων, φρένων και λαστιχών ανά χιλιόμετρα ή χρόνο. Τακτικό KTEO και service βοηθούν στην ασφάλεια και μειώνουν το κόστος επισκευών μακροπρόθεσμα.',
  },
  {
    id: 'firstaid',
    icon: Heart,
    label: 'Πρώτες Βοήθειες',
    iconBg: 'bg-rose-400/15',
    iconColor: 'text-rose-400',
    content:
      'Κάλεσε 112, ασφάλισε το σημείο και μην κινείς σοβαρά τραυματίες. Σε αιμορραγία πίεσε με καθαρό ύφασμα. Σε απώλεια αισθήσεων έλεγξε αναπνοή και ακολούθησε βασικές οδηγίες πρώτων βοηθειών μέχρι να φτάσει βοήθεια.',
  },
  {
    id: 'accident',
    icon: FileText,
    label: 'Μετά από Ατύχημα',
    iconBg: 'bg-orange-400/15',
    iconColor: 'text-orange-400',
    content:
      'Κατέγραψε στοιχεία, φωτογραφίες και μάρτυρες. Μην παραδεχτείς ευθύνη χωρίς εξέταση. Ενημέρωσε ασφαλιστική και αστυνομία όπου απαιτείται. Κράτα αντίγραφα εγγράφων και επικοινώνησε με τη σχολή οδηγών αν χρειάζεσαι καθοδήγηση.',
  },
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
  profile,
  history,
  countsByCategory,
}: ProfileClientProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState(profile?.username ?? '');
  const [savingUsername, setSavingUsername] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(
    profile?.isDefaultUsername ?? false
  );
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

  const toggleInfo = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleSaveUsername = async () => {
    setSavingUsername(true);
    try {
      await updateUsername(usernameInput);
      toast.success('Το όνομα ενημερώθηκε');
      setShowUsernameForm(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Σφάλμα αποθήκευσης');
    } finally {
      setSavingUsername(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <header className="space-y-1">
        <p className="page-eyebrow">Λογαριασμός</p>
        <h1 className="page-title">Προφίλ</h1>
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
              <p className="card-title truncate">
                {profile?.username ?? user.email}
              </p>
              <p className="card-subtitle truncate">{user.email}</p>
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

          {(showUsernameForm || profile) && (
            <div className="mt-4 space-y-3 border-t border-border/40 pt-4">
              {showUsernameForm && (
                <p className="text-sm text-muted-foreground">
                  Όρισε ένα nickname για να εμφανίζεσαι στην κατάταξη.
                </p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(event) => setUsernameInput(event.target.value)}
                  maxLength={20}
                  placeholder="nickname"
                  className={cn(
                    'flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm',
                    'outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
                  )}
                />
                <button
                  type="button"
                  onClick={handleSaveUsername}
                  disabled={savingUsername || usernameInput.trim().length < 2}
                  className={cn(
                    'rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground',
                    'transition-all hover:brightness-110 disabled:opacity-50'
                  )}
                >
                  {savingUsername ? 'Αποθήκευση…' : 'Αποθήκευση'}
                </button>
              </div>
              {!showUsernameForm && (
                <button
                  type="button"
                  onClick={() => setShowUsernameForm(true)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Αλλαγή nickname
                </button>
              )}
            </div>
          )}

          {/* Stats grid */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/40 pt-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold tabular-nums">{stats.totalTests}</p>
              <p className="text-xs text-muted-foreground">Τεστ</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold tabular-nums text-success">{successRate}%</p>
              <p className="text-xs text-muted-foreground">Επιτυχία</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold tabular-nums">
                {stats.completedExams}
              </p>
              <p className="text-xs text-muted-foreground">Επιτυχημένα</p>
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
            href="/auth/login"
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
          <h2 className="section-title">Ιστορικό Εξετάσεων</h2>
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
        <h2 className="section-title">Χρήσιμες Πληροφορίες</h2>

        <div className="space-y-2">
          {infoItems.map(({ id, icon: Icon, label, content, iconBg, iconColor }) => {
            const isExpanded = expandedId === id;

            return (
              <div
                key={id}
                className={cn(
                  'overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors',
                  isExpanded && 'border-primary/30'
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleInfo(id)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-accent/30"
                >
                  <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-2xl', iconBg)}>
                    <Icon className={cn('size-5', iconColor)} />
                  </span>
                  <span className="card-title flex-1">{label}</span>
                  <ChevronDown
                    className={cn(
                      'size-5 shrink-0 text-muted-foreground transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-border/40 px-4 pb-4 pt-3">
                    <p className="card-subtitle leading-relaxed">{content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="pb-4 text-center text-xs text-muted-foreground">
        <p>Έκδοση 0.1.0</p>
        <p className="mt-1">Ταμπουρεάς Driving Test — Σχολή Οδηγών Σωτήρης Ταμπουρεάς</p>
      </footer>
    </div>
  );
}
