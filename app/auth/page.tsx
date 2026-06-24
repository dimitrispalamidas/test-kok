import { BookOpen, CheckCircle2, Trophy, Zap } from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/server';

export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Branding panel */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-card px-8 py-12 lg:px-16 lg:py-20">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, oklch(0.72 0.14 180) 0%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 size-[350px] rounded-full opacity-10"
          style={{
            background:
              'radial-gradient(circle, oklch(0.78 0.14 180) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/logo-1.png"
            alt="Ταμπουρεάς Σχολή Οδηγών"
            width={220}
            height={56}
            className="h-14 w-auto"
            priority
          />
        </div>

        {/* Headline */}
        <div className="relative z-10 py-12 lg:py-0">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl xl:text-6xl">
            Πέρνα την εξέταση{' '}
            <span className="text-primary">ΚΟΚ</span>{' '}
            με σιγουριά.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Smart εξάσκηση για τον Κώδικα Οδικής Κυκλοφορίας. Πραγματικές ερωτήσεις,
            άμεση ανατροφοδότηση, αποτελέσματα ανά χρήστη.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              { icon: Zap, text: 'Τυχαίες εξετάσεις για όλες τις κατηγορίες (Β, Α, C, D, ADR)' },
              { icon: BookOpen, text: 'Αποθήκευση λάθος απαντήσεων & σωστής ανατροφοδότησης' },
              { icon: Trophy, text: 'Στατιστικά και ιστορικό προόδου ανά χρήστη' },
              { icon: CheckCircle2, text: 'Εξάσκηση ανά θεματική ενότητα' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="size-3" />
                </span>
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-muted-foreground/60">
          © 2026 Ταμπουρεάς Driving Test — Όλες οι κατηγορίες αδείας
        </p>
      </div>

      {/* Divider */}
      <div className="hidden w-px bg-border/60 lg:block" />

      {/* Auth form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 lg:max-w-md lg:px-12 xl:max-w-lg">
        <div className="w-full">
          <Suspense>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
