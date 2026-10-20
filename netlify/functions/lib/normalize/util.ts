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
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
    // Unix seconds (TikTok create_time).
    return new Date(v * 1000).toISOString();
  }
  const s = str(v);
  if (!s) return null;
  if (/^\d+$/.test(s)) return isoDate(Number(s));
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
};

export const firstUrl = (image: unknown): string | null => httpsUrl(arr(obj(image)?.url_list)[0]);
