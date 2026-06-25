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
  color: string;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Αρχική', icon: Grid2X2, color: 'text-cyan-400' },
  { href: '/questions', label: 'Ερωτήσεις', icon: BookOpen, color: 'text-blue-400' },
  { href: '/start', label: 'Τεστ', icon: ClipboardList, color: 'text-emerald-400' },
  { href: '/ranking', label: 'Κατάταξη', icon: Trophy, color: 'text-amber-400' },
  { href: '/profile', label: 'Προφίλ', icon: User, color: 'text-violet-400' },
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
          'flex items-center gap-4 rounded-2xl border-2 px-4 py-3 transition-colors',
          active
            ? 'border-primary/50 bg-primary/10'
            : 'border-transparent hover:bg-accent'
        )}
      >
        <Icon className={cn('size-7 shrink-0', item.color)} />
        <span
          className={cn(
            'text-sm font-extrabold uppercase tracking-wide',
            active ? 'text-primary' : 'text-foreground/90'
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center gap-1 py-2"
    >
      <Icon
        className={cn(
          'size-6 transition-transform',
          item.color,
          active && 'scale-110'
        )}
      />
      <span
        className={cn(
          'text-[10px] font-bold uppercase tracking-wide',
          active ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {item.label}
      </span>
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

      <div className="hidden h-full flex-col px-3 py-6 lg:flex">
        <div className="mb-8 px-3">
          <Image
            src="/logo-1.png"
            alt="Ταμπουρεάς Σχολή Οδηγών"
            width={180}
            height={48}
            className="h-12 w-auto"
          />
        </div>

        <div className="flex flex-1 flex-col gap-2">
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
