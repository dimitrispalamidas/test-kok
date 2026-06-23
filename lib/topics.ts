/**
 * Topic extraction from the `quest.qbook` field.
 *
 * `qbook` values look like "ΑΛΚΟΟΛ 06", "ΣΗΜΑΝΣΗ 25", "ΕΚΤΑΚΤΑ Α 02".
 * The thematic name is everything before the trailing number. We only strip
 * the trailing digits (and their surrounding whitespace) so that distinct
 * topics like "ΕΚΤΑΚΤΑ" and "ΕΚΤΑΚΤΑ Α" stay separate.
 */
const THEME_CODE_SUFFIX = /\s*\d+\s*$/u;

export function extractTheme(qbook: string | null): string | null {
  if (!qbook) return null;
  const theme = qbook.replace(THEME_CODE_SUFFIX, '').trim();
  return theme || qbook.trim();
}
