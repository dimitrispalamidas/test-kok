import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Background glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, oklch(0.72 0.14 180) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -right-24 -bottom-24 size-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, oklch(0.78 0.14 180) 0%, transparent 70%)' }}
      />

      <header className="relative z-10 flex items-center justify-center px-6 py-8">
        <Image
          src="/logo-1.png"
          alt="Ταμπουρεάς Σχολή Οδηγών"
          width={210}
          height={54}
          className="h-12 w-auto"
          priority
        />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl xl:text-6xl">
          Πέρνα την εξέταση{' '}
          <span className="text-primary">ΚΟΚ</span>{' '}
          με σιγουριά.
        </h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
          Πραγματικές ερωτήσεις, άμεση ανατροφοδότηση και στατιστικά
          προόδου ανά χρήστη.
        </p>

        <Link
          href="/auth/login"
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-primary px-12 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 active:scale-95"
        >
          Ξεκίνα Τώρα!
        </Link>

      </main>

      <footer className="relative z-10 px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground/50">
          © 2026 Ταμπουρεάς Driving Test — Όλες οι κατηγορίες αδείας
        </p>
      </footer>
    </div>
  );
}
