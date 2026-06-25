import {
  DEFAULT_SOUND_PREFERENCES,
  SOUND_LIBRARY,
  SOUND_VARIANT_COUNT,
  type SoundCategory,
  type SoundPreferences,
} from '@/lib/sound-library';

let activePreferences: SoundPreferences = { ...DEFAULT_SOUND_PREFERENCES };

function clampVariant(value: unknown): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > SOUND_VARIANT_COUNT) {
    return 1;
  }

  return parsed;
}

export function parseSoundPreferences(
  value: unknown
): SoundPreferences {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_SOUND_PREFERENCES };
  }

  const record = value as Partial<Record<SoundCategory, unknown>> & {
    enabled?: unknown;
  };

  return {
    enabled: record.enabled !== false,
    answerCorrect: clampVariant(record.answerCorrect ?? 1),
    answerWrong: clampVariant(record.answerWrong ?? 1),
    testPass: clampVariant(record.testPass ?? 1),
    testFail: clampVariant(record.testFail ?? 1),
    answerStreak: clampVariant(record.answerStreak ?? 1),
  };
}

export function getSoundPreferences(): SoundPreferences {
  return activePreferences;
}

export function setSoundPreferences(preferences: SoundPreferences): void {
  activePreferences = { ...preferences };
}

export function isValidSoundPreferences(
  value: unknown
): value is SoundPreferences {
  const parsed = parseSoundPreferences(value);
  return (Object.keys(SOUND_LIBRARY) as SoundCategory[]).every(
    (category) => parsed[category] === clampVariant(parsed[category])
  );
}
