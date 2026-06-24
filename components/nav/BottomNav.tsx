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

const allItems = [...leftItems, ...rightItems];

function NavLink({
  item,
  active,
  variant = 'mobile',
}: {
  item: NavItem;
  active: boolean;
  variant?: 'mobile' | 'sidebar';
}) {
  const Icon = item.icon;

  if (variant === 'sidebar') {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
      >
        <Icon
          className={cn(
            'size-5 shrink-0',
            active && 'drop-shadow-[0_0_6px_var(--color-primary)]'
          )}
        />
        <span>{item.label}</span>
      </Link>
    );
  }

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
        'bg-card/90 backdrop-blur-xl safe-bottom',
        'lg:inset-y-0 lg:right-auto lg:left-0 lg:w-64 lg:border-t-0 lg:border-r'
      )}
    >
      <div className="mx-auto flex max-w-lg items-end px-2 pb-1 pt-2 lg:hidden">
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

      <div className="hidden h-full flex-col px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <h2 className="text-lg font-bold tracking-tight">ΚΟΚ Practice</h2>
          <p className="text-xs text-muted-foreground">Smart εξάσκηση</p>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {allItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              variant="sidebar"
            />
          ))}
        </div>

        <Link
          href="/start"
          className={cn(
            'mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3',
            'text-sm font-semibold text-primary-foreground fab-glow',
            'transition-transform hover:brightness-110 active:scale-[0.98]'
          )}
        >
          <Play className="size-5 fill-current" />
          Έναρξη Τεστ
        </Link>
      </div>
    </nav>
  );
}

export function FloatingCategoryButton() {
  return (
    <Link
      href="/start"
      className={cn(
        'fixed bottom-24 left-4 z-40 flex size-11 items-center justify-center lg:hidden',
        'rounded-xl border border-primary/40 bg-card/90 text-primary backdrop-blur-md',
        'shadow-lg transition-transform active:scale-95'
      )}
      aria-label="Επιλογή κατηγορίας"
    >
      <Car className="size-5" />
    </Link>
  );
}
