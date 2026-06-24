'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { signIn, signUp } from '@/actions/user-data';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.push(nextPath);
        router.refresh();
      } else {
        await signUp(email, password);
        toast.success('Έλεγξε το email σου για επιβεβαίωση λογαριασμού');
        setMode('login');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Κάτι πήγε στραβά';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Κάτι πήγε στραβά';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">
          {mode === 'login' ? 'Σύνδεση' : 'Δημιουργία λογαριασμού'}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === 'login'
            ? 'Εισήγαγε τα στοιχεία σου για να συνεχίσεις'
            : 'Δημιούργησε λογαριασμό για να αποθηκεύεις τα αποτελέσματά σου'}
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-semibold',
            'transition-all hover:bg-muted active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          <GoogleIcon className="size-5" />
          Συνέχεια με Google
        </button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ή</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className={cn(
              'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm',
              'placeholder:text-muted-foreground/50',
              'focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20',
              'transition-colors'
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Κωδικός
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={cn(
              'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm',
              'placeholder:text-muted-foreground/50',
              'focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20',
              'transition-colors'
            )}
          />
          {mode === 'register' && (
            <p className="text-xs text-muted-foreground">Τουλάχιστον 6 χαρακτήρες</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl',
            'bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground',
            'transition-all hover:brightness-110 active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {mode === 'login' ? 'Σύνδεση' : 'Εγγραφή'}
        </button>
      </form>

      <div className="mt-6 border-t border-border/40 pt-6 text-center text-sm">
        {mode === 'login' ? (
          <span className="text-muted-foreground">
            Δεν έχεις λογαριασμό;{' '}
            <button
              type="button"
              onClick={() => setMode('register')}
              className="font-semibold text-primary hover:underline"
            >
              Εγγραφή
            </button>
          </span>
        ) : (
          <span className="text-muted-foreground">
            Έχεις ήδη λογαριασμό;{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="font-semibold text-primary hover:underline"
            >
              Σύνδεση
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
