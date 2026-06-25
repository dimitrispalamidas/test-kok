'use client';

import { useEffect } from 'react';

const MIN_SPLASH_MS = 750;
const FADE_MS = 350;

export function SplashDismiss() {
  useEffect(() => {
    const splash = document.getElementById('app-splash');
    if (!splash) return;

    const startedAt = performance.now();

    const dismiss = () => {
      const remaining = Math.max(0, MIN_SPLASH_MS - (performance.now() - startedAt));

      window.setTimeout(() => {
        splash.classList.add('app-splash--hide');

        window.setTimeout(() => {
          splash.remove();
        }, FADE_MS);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      dismiss();
      return;
    }

    window.addEventListener('load', dismiss, { once: true });
    return () => window.removeEventListener('load', dismiss);
  }, []);

  return null;
}
