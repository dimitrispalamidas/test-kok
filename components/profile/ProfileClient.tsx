'use client';

import {
  Calendar,
  Car,
  ChevronDown,
  FileText,
  Gauge,
  Heart,
  Leaf,
  LogIn,
  TriangleAlert,
  User,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfileInsights } from '@/actions/profile-insights';
import { signOut, updateUsername } from '@/actions/user-data';
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap';
import { AchievementGrid } from '@/components/profile/AchievementGrid';
import { ProfileIdentitySection } from '@/components/profile/ProfileIdentitySection';
import { WeakTopicsSection } from '@/components/profile/WeakTopicsSection';
import { CategorySelector } from '@/components/home/CategorySelector';
import { RecentResults } from '@/components/home/RecentResults';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { useCategory } from '@/hooks/use-category';
import { useCategoryStats } from '@/hooks/use-category-stats';
import {
  useCategories,
  useCurrentUser,
  useExamHistory,
  useProfile,
  useSavedWrongCountsByCategory,
} from '@/hooks/use-user-data';
import { queryKeys } from '@/lib/query-keys';
import { ATHENS_TIMEZONE } from '@/lib/daily-streak';
import { getExamResultDisplayTitle, isCountableTestResult } from '@/lib/exam-session';
import {
  DEFAULT_SOUND_PREFERENCES,
  type SoundPreferences,
} from '@/lib/sound-library';
import {
  parseSoundPreferences,
  setSoundPreferences,
} from '@/lib/sound-preferences';
import { cn } from '@/lib/utils';

const memberSinceFormatter = new Intl.DateTimeFormat('el', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: ATHENS_TIMEZONE,
});

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

export function ProfileClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { kcod } = useCategory();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: user } = useCurrentUser();
  const { data: profile } = useProfile();
  const { data: history = [] } = useExamHistory(50);
  const { data: countsByCategory = {} } = useSavedWrongCountsByCategory();

  const [loggingOut, setLoggingOut] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [soundPreferences, setSoundPreferencesState] = useState<SoundPreferences>(
    DEFAULT_SOUND_PREFERENCES
  );

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (profile) {
      setUsernameInput(profile.username);
      setAvatarUrl(profile.avatar_url ?? null);
      const preferences = parseSoundPreferences(profile.sound_preferences);
      setSoundPreferencesState(preferences);
      setSoundPreferences(preferences);
    }
  }, [profile]);

  const handleSoundPreferencesChange = (preferences: SoundPreferences) => {
    setSoundPreferencesState(preferences);
    setSoundPreferences(preferences);
    queryClient.setQueryData(queryKeys.profile(), (current: typeof profile) =>
      current ? { ...current, sound_preferences: preferences } : current
    );
  };

  const { history: filteredHistory } = useCategoryStats(
    history,
    countsByCategory
  );

  const examHistory = filteredHistory.filter(isCountableTestResult);

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: queryKeys.profileInsights(kcod),
    queryFn: () => getProfileInsights(kcod),
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  });

  const memberSince = profile?.created_at
    ? memberSinceFormatter.format(new Date(profile.created_at))
    : '';

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      queryClient.removeQueries({ queryKey: queryKeys.currentUser() });
      queryClient.removeQueries({ queryKey: queryKeys.profile() });
      queryClient.removeQueries({ queryKey: queryKeys.examHistory(50) });
      queryClient.removeQueries({ queryKey: queryKeys.savedWrongCounts() });
      queryClient.removeQueries({ queryKey: queryKeys.dailyStreak() });
      queryClient.removeQueries({ queryKey: ['profile-insights'] });
      router.push('/');
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
      toast.success('Το nickname ενημερώθηκε');
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Σφάλμα αποθήκευσης');
      throw error;
    } finally {
      setSavingUsername(false);
    }
  };

  const handleAvatarUpdated = (url: string) => {
    setAvatarUrl(url);
    queryClient.setQueryData(queryKeys.profile(), (current: typeof profile) =>
      current ? { ...current, avatar_url: url } : current
    );
  };

  if (!isReady || categoriesLoading) {
    return <PageSkeleton showCta={false} />;
  }

  return (
    <div className="page-container space-y-6">
      <header className="space-y-1">
        <p className="page-eyebrow">Λογαριασμός</p>
        <h1 className="page-title">Προφίλ</h1>
      </header>

      <CategorySelector categories={categories} />

      {user ? (
        <>
          <ProfileIdentitySection
            username={profile?.username ?? user.email}
            email={user.email}
            avatarUrl={avatarUrl}
            memberSince={memberSince}
            isDefaultUsername={profile?.isDefaultUsername ?? false}
            usernameInput={usernameInput}
            savingUsername={savingUsername}
            loggingOut={loggingOut}
            onUsernameChange={setUsernameInput}
            onSaveUsername={handleSaveUsername}
            onSignOut={handleSignOut}
            onAvatarUpdated={handleAvatarUpdated}
            soundPreferences={soundPreferences}
            onSoundPreferencesChange={handleSoundPreferencesChange}
          />

          {insightsLoading ? (
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
            </div>
          ) : insights ? (
            <>
              <AchievementGrid
                achievements={insights.achievements}
                kcod={kcod}
                preview
              />
              <ActivityHeatmap activityDates={insights.activityDates} />
              <WeakTopicsSection topics={insights.weakTopics} kcod={kcod} />
            </>
          ) : null}
        </>
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

      {user && examHistory.length > 0 && (
        <RecentResults
          title="Ιστορικό Εξετάσεων"
          history={examHistory.map((entry) => ({
            ...entry,
            title: getExamResultDisplayTitle(entry),
          }))}
        />
      )}

      <section className="space-y-3">
        <h2 className="card-title">Χρήσιμες Πληροφορίες</h2>

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
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-2xl',
                      iconBg
                    )}
                  >
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
        <p className="mt-1">
          Ταμπουρεάς Driving Test — Σχολή Οδηγών Σωτήρης Ταμπουρεάς
        </p>
      </footer>
    </div>
  );
}
