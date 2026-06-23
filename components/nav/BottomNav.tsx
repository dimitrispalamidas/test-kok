'use client';

import { BookOpen, Car, Grid2X2, Play, Trophy, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const leftItems: NavItem[] = [
  { href: '/', label: 'Αρχική', icon: Grid2X2 },
  { href: '/questions', label: 'Ερωτήσεις', icon: BookOpen },
];

const rightItems: NavItem[] = [
  { href: '/ranking', label: 'Κατάταξη', icon: Trophy },
  { href: '/profile', label: 'Προφίλ', icon: User },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <Icon
        className={cn(
          'size-5',
          active && 'drop-shadow-[0_0_6px_var(--color-primary)]'
        )}
      />
      <span>{item.label}</span>
      {active && (
        <span className="size-1 rounded-full bg-primary" aria-hidden />
      )}
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-border/60',
        'bg-card/90 backdrop-blur-xl safe-bottom'
      )}
    >
      <div className="mx-auto flex max-w-lg items-end px-2 pb-1 pt-2">
        <div className="flex flex-1">
          {leftItems.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>

        <Link
          href="/start"
          className={cn(
            'relative -top-4 mx-2 flex size-14 shrink-0 items-center justify-center',
            'rounded-full bg-primary text-primary-foreground fab-glow',
            'transition-transform active:scale-95'
          )}
          aria-label="Έναρξη τεστ"
        >
          <Play className="size-6 fill-current" />
        </Link>

        <div className="flex flex-1">
          {rightItems.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

export function FloatingCategoryButton() {
  return (
    <Link
      href="/start"
      className={cn(
        'fixed bottom-24 left-4 z-40 flex size-11 items-center justify-center',
        'rounded-xl border border-primary/40 bg-card/90 text-primary backdrop-blur-md',
        'shadow-lg transition-transform active:scale-95'
      )}
      aria-label="Επιλογή κατηγορίας"
    >
      <Car className="size-5" />
    </Link>
  );
}
