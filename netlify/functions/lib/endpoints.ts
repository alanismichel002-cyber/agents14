import type { Mode, Platform } from '../../../shared/video';

export const API_BASE = 'https://api.scrapecreators.com';

// The only Scrape Creators endpoints this proxy may call. Callers pick a
// platform + mode; they never control the upstream path or host.
export const ENDPOINTS: Record<Platform, Record<Mode, string>> = {
  tiktok: {
    trending: '/v1/tiktok/get-trending-feed',
    keyword: '/v1/tiktok/search/keyword',
    hashtag: '/v1/tiktok/search/hashtag',
  },
  instagram: {
    trending: '/v1/instagram/reels/trending',
    keyword: '/v2/instagram/reels/search',
    hashtag: '/v1/instagram/search/hashtag',
  },
  youtube: {
    trending: '/v1/youtube/shorts/trending',
    keyword: '/v1/youtube/search',
    hashtag: '/v1/youtube/search/hashtag',
  },
};

export const DEFAULT_TIKTOK_REGION = 'US';

export function buildUpstreamUrl(platform: Platform, mode: Mode, query: string | null): URL {
  const url = new URL(ENDPOINTS[platform][mode], API_BASE);
  if (mode === 'keyword' && query) url.searchParams.set('query', query);
  if (mode === 'hashtag' && query) url.searchParams.set('hashtag', query);
  if (platform === 'tiktok' && mode === 'trending') {
    url.searchParams.set('region', DEFAULT_TIKTOK_REGION);
  }
  return url;
}
