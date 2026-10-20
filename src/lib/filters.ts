import type { Video } from '../../shared/video';

export const MIN_VIEWS = [0, 10_000, 100_000, 1_000_000] as const;
export type MinViews = (typeof MIN_VIEWS)[number];

export const POSTED_WITHIN = ['any', '24h', '7d', '30d'] as const;
export type PostedWithin = (typeof POSTED_WITHIN)[number];

export const MIN_VIEWS_LABELS: Record<MinViews, string> = {
  0: 'Any views',
  10_000: '10K+ views',
  100_000: '100K+ views',
  1_000_000: '1M+ views',
};

export const POSTED_WITHIN_LABELS: Record<PostedWithin, string> = {
  any: 'Any time',
  '24h': 'Past 24 hours',
  '7d': 'Past week',
  '30d': 'Past month',
};

const WINDOW_MS: Record<Exclude<PostedWithin, 'any'>, number> = {
  '24h': 24 * 3600 * 1000,
  '7d': 7 * 24 * 3600 * 1000,
  '30d': 30 * 24 * 3600 * 1000,
};

export type Filters = { minViews: MinViews; postedWithin: PostedWithin };
export const NO_FILTERS: Filters = { minViews: 0, postedWithin: 'any' };

// A video with an unknown view count or date is hidden only when that filter is on.
export function filterVideos(videos: Video[], f: Filters, now: number = Date.now()): Video[] {
  return videos.filter((v) => {
    if (f.minViews > 0 && (v.stats.views ?? -1) < f.minViews) return false;
    if (f.postedWithin !== 'any') {
      const t = v.postedAt ? Date.parse(v.postedAt) : NaN;
      if (Number.isNaN(t) || now - t > WINDOW_MS[f.postedWithin]) return false;
    }
    return true;
  });
}
