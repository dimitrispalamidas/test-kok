import { createSerializer, parseAsInteger } from 'nuqs';
import type { ExamCategoryId } from '@/lib/constants';

const categorySerializer = createSerializer({ k: parseAsInteger });

export function hrefWithCategory(
  path: string,
  kcod: ExamCategoryId | number
): string {
  return categorySerializer(path, { k: kcod });
}
