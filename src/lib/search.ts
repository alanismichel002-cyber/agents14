import type { Platform } from '../../shared/video';

export const MAX_QUERY_LENGTH = 100;

export type SearchInput = { platform: Platform | 'all'; text: string };

// Input starting with # is a hashtag search; anything else is a keyword search.
export const isHashtag = (text: string) => text.trim().startsWith('#');

export function validateSearch(text: string): string | null {
  const t = text.trim();
  if (!t || t === '#') return 'Type a keyword or a #hashtag.';
  if (t.length > MAX_QUERY_LENGTH) return `Keep it under ${MAX_QUERY_LENGTH} characters.`;
  if (isHashtag(t) && /\s/.test(t.replace(/^#+/, ''))) return 'Hashtags can’t contain spaces.';
  return null;
}
