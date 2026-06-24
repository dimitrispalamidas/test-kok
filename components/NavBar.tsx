import { LogIn, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/server';

export async function NavBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo-1.png"
            alt="Ταμπουρεάς Σχολή Οδηγών"
            width={180}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link
              href="/profile"
              className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors hover:bg-primary/25"
              title={user.email}
            >
              <User className="size-4" />
            </Link>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogIn className="size-3.5" />
              Σύνδεση
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
