'use client';

import Image from 'next/image';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

type LeaderboardAvatarProps = {
  username: string;
  avatarUrl: string | null;
  size?: 'md' | 'lg';
  className?: string;
};

export function LeaderboardAvatar({
  username,
  avatarUrl,
  size = 'md',
  className,
}: LeaderboardAvatarProps) {
  const dimension = size === 'lg' ? 48 : 44;
  const sizeClass = size === 'lg' ? 'size-12' : 'size-11';
  const initial = username.trim().charAt(0).toUpperCase() || '?';

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={dimension}
        height={dimension}
        unoptimized
        className={cn('shrink-0 rounded-full object-cover ring-2 ring-border/40', sizeClass, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary ring-2 ring-border/40',
        size === 'lg' ? 'text-lg' : 'text-base',
        sizeClass,
        className
      )}
      aria-hidden
    >
      {initial.length > 0 ? initial : <User className="size-5" />}
    </span>
  );
}

const medalStyles: Record<1 | 2 | 3, string> = {
  1: 'bg-gradient-to-b from-amber-300 to-amber-600 text-amber-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-200/40',
  2: 'bg-gradient-to-b from-slate-200 to-slate-400 text-slate-800 shadow-md shadow-slate-400/20 ring-2 ring-slate-100/30',
  3: 'bg-gradient-to-b from-orange-300 to-orange-600 text-orange-950 shadow-md shadow-orange-500/20 ring-2 ring-orange-200/35',
};

type LeaderboardRankIndicatorProps = {
  rank: number;
  size?: 'md' | 'lg';
};

export function LeaderboardRankIndicator({
  rank,
  size = 'md',
}: LeaderboardRankIndicatorProps) {
  const slotClass = size === 'lg' ? 'size-12' : 'size-10';

  if (rank >= 1 && rank <= 3) {
    return (
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-full font-extrabold tabular-nums',
          slotClass,
          size === 'lg' ? 'text-base' : 'text-sm',
          medalStyles[rank as 1 | 2 | 3]
        )}
        aria-label={`Θέση ${rank}`}
      >
        {rank}
        <span
          className={cn(
            'absolute -bottom-1 left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-b-full opacity-80',
            rank === 1 && 'bg-amber-500',
            rank === 2 && 'bg-slate-400',
            rank === 3 && 'bg-orange-500'
          )}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center font-extrabold tabular-nums text-primary',
        slotClass,
        size === 'lg' ? 'text-xl' : 'text-lg'
      )}
      aria-label={`Θέση ${rank}`}
    >
      {rank}
    </span>
  );
}
