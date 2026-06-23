const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/question-images`;

/**
 * Build storage filename from quest.qphoto.
 * qphoto is the filename stem as stored in the DB (e.g. "C001", "B-01", "B02").
 * Stems "B02" and "B-02" are distinct files — never rewrite B-prefixed digits.
 */
function buildFilename(qphoto: string, extension: 'webp' | 'jpg'): string {
  return `${qphoto.trim().toUpperCase()}.${extension}`;
}

export function getImageUrl(qphoto: string): string {
  return `${STORAGE_BASE}/${buildFilename(qphoto, 'webp')}`;
}

export function getImageUrlFallback(qphoto: string): string {
  return `${STORAGE_BASE}/${buildFilename(qphoto, 'jpg')}`;
}

export function getCategoryImageUrl(kpict: string): string {
  return `${STORAGE_BASE}/${kpict}`;
}

export function hasQuestionImage(qphoto: string | null): qphoto is string {
  return qphoto !== null && qphoto !== '0' && qphoto.trim() !== '';
}
