'use client';

import { useEffect } from 'react';

const MIN_SPLASH_MS = 800;
const FADE_MS = 350;
const SESSION_KEY = 'app-splash-shown';

export function SplashDismiss() {
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) {
      return;
    }

    const splash = document.createElement('div');
    splash.className = 'app-splash';
    splash.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.src = '/logo-1.png';
    img.alt = '';
    img.width = 280;
    img.height = 72;
    img.decoding = 'sync';
    splash.appendChild(img);

    document.body.appendChild(splash);

    const startedAt = performance.now();

    const dismiss = () => {
      const remaining = Math.max(0, MIN_SPLASH_MS - (performance.now() - startedAt));
      setTimeout(() => {
        splash.classList.add('app-splash--hide');
        setTimeout(() => {
          splash.remove();
          sessionStorage.setItem(SESSION_KEY, '1');
        }, FADE_MS);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      dismiss();
    } else {
      window.addEventListener('load', dismiss, { once: true });
    }

    return () => {
      window.removeEventListener('load', dismiss);
    };
  }, []);

  return null;
}
