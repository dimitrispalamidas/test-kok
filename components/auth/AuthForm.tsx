'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { signIn, signUp } from '@/actions/user-data';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

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
