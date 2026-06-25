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
  activeBg: string;
  activeGlow: string;
};

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Αρχική',
    icon: Grid2X2,
    color: 'text-cyan-400',
    activeBg: 'bg-cyan-400/20',
    activeGlow: 'drop-shadow-[0_0_10px_rgba(34,211,238,0.65)]',
  },
  {
    href: '/questions',
    label: 'Ερωτήσεις',
    icon: BookOpen,
    color: 'text-blue-400',
    activeBg: 'bg-blue-400/20',
    activeGlow: 'drop-shadow-[0_0_10px_rgba(96,165,250,0.65)]',
  },
  {
    href: '/start',
    label: 'Τεστ',
    icon: ClipboardList,
    color: 'text-emerald-400',
    activeBg: 'bg-emerald-400/20',
    activeGlow: 'drop-shadow-[0_0_10px_rgba(52,211,153,0.65)]',
  },
  {
    href: '/ranking',
    label: 'Κατάταξη',
    icon: Trophy,
    color: 'text-amber-400',
    activeBg: 'bg-amber-400/20',
    activeGlow: 'drop-shadow-[0_0_10px_rgba(251,191,36,0.65)]',
  },
  {
    href: '/profile',
    label: 'Προφίλ',
    icon: User,
    color: 'text-violet-400',
    activeBg: 'bg-violet-400/20',
    activeGlow: 'drop-shadow-[0_0_10px_rgba(167,139,250,0.65)]',
  },
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
      className="flex flex-1 flex-col items-center gap-0.5 py-1.5"
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-2xl px-3 py-1.5 transition-all duration-200',
          active ? item.activeBg : 'bg-transparent'
        )}
      >
        <Icon
          className={cn(
            'transition-all duration-200',
            item.color,
            active
              ? cn('size-7 scale-110', item.activeGlow)
              : 'size-6 opacity-80'
          )}
        />
      </span>
      <span
        className={cn(
          'text-[10px] font-bold uppercase tracking-wide transition-all duration-200',
          active ? item.color : 'text-muted-foreground'
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
