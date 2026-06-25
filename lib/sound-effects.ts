import { Howl } from 'howler';
import type { SoundCategory } from '@/lib/sound-library';
import { getSoundSrc } from '@/lib/sound-library';
import { getSoundPreferences } from '@/lib/sound-preferences';

const SFX_VOLUME = 0.72;

const howlCache = new Map<string, Howl>();

function getHowl(src: string): Howl | null {
  if (typeof window === 'undefined') {
    return null;
  }

  let howl = howlCache.get(src);
  if (!howl) {
    howl = new Howl({
      src: [src],
      volume: SFX_VOLUME,
      preload: true,
    });
    howlCache.set(src, howl);
  }

  return howl;
}

export function invalidateSoundCache() {
  for (const howl of howlCache.values()) {
    howl.unload();
  }
  howlCache.clear();
}

function playCategory(category: SoundCategory) {
  const preferences = getSoundPreferences();
  if (!preferences.enabled) return;

  const src = getSoundSrc(category, preferences[category]);
  const howl = getHowl(src);
  if (!howl) return;

  howl.stop();
  howl.play();
}

export function previewSound(category: SoundCategory, variantId: number) {
  const src = getSoundSrc(category, variantId);
  const howl = getHowl(src);
  if (!howl) return;

  howl.stop();
  howl.play();
}

export function playCorrectSound() {
  playCategory('answerCorrect');
}

export function playWrongSound() {
  playCategory('answerWrong');
}

export function playTestPassSound() {
  playCategory('testPass');
}

export function playTestFailSound() {
  playCategory('testFail');
}

export function playStreakSound() {
  playCategory('answerStreak');
}

export function playAnswerSound(isCorrect: boolean) {
  if (isCorrect) {
    playCorrectSound();
    return;
  }

  playWrongSound();
}

export function playTestResultSound(passed: boolean) {
  if (passed) {
    playTestPassSound();
    return;
  }

  playTestFailSound();
}
