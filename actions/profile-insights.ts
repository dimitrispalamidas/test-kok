'use server';

import { getAuthUser } from '@/lib/auth/server';
import {
  buildAchievementContext,
  computeAchievements,
  type AchievementStatus,
} from '@/lib/achievements';
import { isExamCategory } from '@/lib/constants';
import { getDateInAthens } from '@/lib/daily-streak';
import { createClient } from '@/lib/supabase/server';
import {
  aggregateAttemptCountsByTheme,
  fetchCategoryAttemptRecords,
} from '@/lib/topic-stats';

export type WeakTopicInsight = {
  theme: string;
  wrongCount: number;
};

export type ProfileInsights = {
  activityDates: string[];
  weakTopics: WeakTopicInsight[];
  achievements: AchievementStatus[];
};

const ACTIVITY_LOOKBACK_DAYS = 7;
const WEAK_TOPIC_LOOKBACK_DAYS = 7;
const WEAK_TOPIC_LIMIT = 3;

const ALLOWED_AVATAR_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function getLookbackIso(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

export async function getProfileInsights(kcod: number): Promise<ProfileInsights | null> {
  const user = await getAuthUser();
  if (!user) return null;

  if (!isExamCategory(kcod)) {
    throw new Error('Invalid exam category');
  }

  const supabase = await createClient();
  const activitySince = getLookbackIso(ACTIVITY_LOOKBACK_DAYS);
  const weakSince = getLookbackIso(WEAK_TOPIC_LOOKBACK_DAYS);

  const [
    { data: profile },
    { data: attempts },
    { data: examResults },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('longest_daily_streak, best_answer_streak')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('user_question_attempts')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', activitySince),
    supabase
      .from('user_exam_results')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', activitySince),
  ]);

  const activityDates = new Set<string>();

  for (const attempt of attempts ?? []) {
    activityDates.add(getDateInAthens(new Date(attempt.created_at)));
  }

  for (const result of examResults ?? []) {
    activityDates.add(getDateInAthens(new Date(result.created_at)));
  }

  const attemptRecords = await fetchCategoryAttemptRecords(
    supabase,
    user.id,
    kcod,
    weakSince
  );
  const countsByTheme = await aggregateAttemptCountsByTheme(
    supabase,
    attemptRecords
  );

  const weakTopics = [...countsByTheme.entries()]
    .map(([theme, counts]) => ({ theme, wrongCount: counts.wrong }))
    .filter((item) => item.wrongCount > 0)
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, WEAK_TOPIC_LIMIT);

  const { data: fullHistory } = await supabase
    .from('user_exam_results')
    .select('title, passed, duration_seconds')
    .eq('user_id', user.id);

  const achievementContext = buildAchievementContext({
    longestDailyStreak: profile?.longest_daily_streak ?? 0,
    bestAnswerStreak: profile?.best_answer_streak ?? 0,
    examHistory: (fullHistory ?? []).map((entry) => ({
      title: entry.title,
      passed: entry.passed,
      duration_seconds: entry.duration_seconds,
    })),
  });

  return {
    activityDates: [...activityDates].sort(),
    weakTopics,
    achievements: computeAchievements(achievementContext),
  };
}

export async function uploadAvatar(formData: FormData): Promise<string> {
  const user = await getAuthUser();
  if (!user) throw new Error('Not authenticated');

  const file = formData.get('avatar');
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Δεν επιλέχθηκε εικόνα');
  }

  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    throw new Error('Μόνο JPG, PNG, WebP ή GIF επιτρέπονται');
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('Η εικόνα πρέπει να είναι μέχρι 5 MB');
  }

  const extension =
    file.type === 'image/jpeg'
      ? 'jpg'
      : file.type === 'image/png'
        ? 'png'
        : file.type === 'image/webp'
          ? 'webp'
          : 'gif';

  const supabase = await createClient();
  const path = `${user.id}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: '3600',
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('user_id', user.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return avatarUrl;
}
