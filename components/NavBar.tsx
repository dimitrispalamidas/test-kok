import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ΚΟΚ Practice
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
