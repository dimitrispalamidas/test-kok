'use client';

import { useEffect } from 'react';
import { useProfile } from '@/hooks/use-user-data';
import { parseSoundPreferences, setSoundPreferences } from '@/lib/sound-preferences';

export function SoundPreferencesSync() {
  const { data: profile } = useProfile();

  useEffect(() => {
    setSoundPreferences(parseSoundPreferences(profile?.sound_preferences));
  }, [profile?.sound_preferences]);

  return null;
}
