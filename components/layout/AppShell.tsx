'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/nav/BottomNav';

const FULLSCREEN_PREFIXES = ['/exam/', '/practice/', '/auth'];

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideNav = FULLSCREEN_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      <div className={hideNav ? undefined : 'pb-24 lg:pb-6 lg:pl-64'}>
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </>
  );
}
