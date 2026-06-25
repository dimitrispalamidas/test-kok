export const SOUND_VARIANT_COUNT = 5;

export type SoundCategory =
  | 'answerCorrect'
  | 'answerWrong'
  | 'testPass'
  | 'testFail'
  | 'answerStreak';

export type SoundVariant = {
  id: number;
  label: string;
  src: string;
};

export const SOUND_CATEGORY_LABELS: Record<SoundCategory, string> = {
  answerCorrect: 'Σωστή απάντηση',
  answerWrong: 'Λάθος απάντηση',
  testPass: 'Επιτυχία τεστ',
  testFail: 'Αποτυχία τεστ',
  answerStreak: 'Σερί σωστών',
};

const variantLabels = ['Ήχος 1', 'Ήχος 2', 'Ήχος 3', 'Ήχος 4', 'Ήχος 5'] as const;

function buildVariants(folder: string): SoundVariant[] {
  return variantLabels.map((label, index) => ({
    id: index + 1,
    label,
    src: `/sounds/${folder}/${index + 1}.mp3`,
  }));
}

export const SOUND_LIBRARY: Record<SoundCategory, SoundVariant[]> = {
  answerCorrect: buildVariants('correct'),
  answerWrong: buildVariants('wrong'),
  testPass: buildVariants('pass'),
  testFail: buildVariants('fail'),
  answerStreak: buildVariants('streak'),
};

export type SoundPreferences = {
  enabled: boolean;
} & Record<SoundCategory, number>;

export const DEFAULT_SOUND_PREFERENCES: SoundPreferences = {
  enabled: true,
  answerCorrect: 1,
  answerWrong: 1,
  testPass: 1,
  testFail: 1,
  answerStreak: 1,
};

export function getSoundSrc(
  category: SoundCategory,
  variantId: number
): string {
  const variant = SOUND_LIBRARY[category].find((item) => item.id === variantId);
  return variant?.src ?? SOUND_LIBRARY[category][0].src;
}
