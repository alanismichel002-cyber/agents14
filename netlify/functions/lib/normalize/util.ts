// Small, defensive readers for untyped upstream JSON. Response shapes differ
// between platforms and can change without notice, so nothing here throws.

export type Json = Record<string, unknown>;

export const obj = (v: unknown): Json | null =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : null;

export const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export const str = (v: unknown): string | null => {
  if (typeof v === 'string') return v.trim() || null;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return null;
};

// Accepts numbers and numeric strings, including "13,798,774".
export const num = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : null;
  if (typeof v === 'string') {
    const cleaned = v.replace(/,/g, '').trim();
    if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
    return Number(cleaned);
  }
  return null;
};

// Only https URLs are passed to the browser, where they become links and images.
export const httpsUrl = (v: unknown): string | null => {
  const s = str(v);
  if (!s) return null;
  try {
    return new URL(s).protocol === 'https:' ? s : null;
  } catch {
    return null;
  }
};

export const isoDate = (v: unknown): string | null => {
  let t: number;
  if (typeof v === 'number') {
    // Unix seconds (TikTok create_time).
    t = v > 0 ? v * 1000 : NaN;
  } else {
    const s = str(v);
    if (!s) return null;
    t = /^\d+$/.test(s) ? Number(s) * 1000 : Date.parse(s);
  }
  const d = new Date(t);
  // An out-of-range timestamp gives an invalid Date, whose toISOString() throws.
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// Picks the first https URL from a TikTok image's url_list, preferring formats
// browsers can show (Chrome and Firefox can't render HEIC).
export const firstUrl = (image: unknown): string | null => {
  const urls = arr(obj(image)?.url_list)
    .map((u) => httpsUrl(u))
    .filter((u): u is string => u !== null);
  return urls.find((u) => !/\.heic(\?|$)/i.test(u)) ?? null;
};
