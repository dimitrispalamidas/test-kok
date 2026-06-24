'use client';

import { BookOpen, ClipboardList, Grid2X2, Trophy, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createSerializer, parseAsInteger } from 'nuqs';
import { useCategory } from '@/hooks/use-category';
import { cn } from '@/lib/utils';

const categorySerializer = createSerializer({ k: parseAsInteger });

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Αρχική', icon: Grid2X2 },
  { href: '/questions', label: 'Ερωτήσεις', icon: BookOpen },
  { href: '/start', label: 'Τεστ', icon: ClipboardList },
  { href: '/ranking', label: 'Κατάταξη', icon: Trophy },
  { href: '/profile', label: 'Προφίλ', icon: User },
];

function NavLink({
  item,
  active,
  kcod,
  variant = 'mobile',
}: {
  item: NavItem;
  active: boolean;
  kcod: number;
  variant?: 'mobile' | 'sidebar';
}) {
  const Icon = item.icon;
  const href = categorySerializer(item.href, { k: kcod });

  if (variant === 'sidebar') {
    return (
      <Link
        href={href}
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
      href={href}
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
  const { kcod } = useCategory();

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
      <div className="mx-auto flex max-w-lg items-end px-1 pb-1 pt-2 lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            kcod={kcod}
            active={isActive(item.href)}
          />
        ))}
      </div>

      <div className="hidden h-full flex-col px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <Image
            src="/logo-1.png"
            alt="Ταμπουρεάς Σχολή Οδηγών"
            width={180}
            height={48}
            className="h-12 w-auto"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              kcod={kcod}
              active={isActive(item.href)}
              variant="sidebar"
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
