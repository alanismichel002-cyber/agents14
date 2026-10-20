// Shared between the browser (src/) and the Netlify Function (netlify/functions/).
// The function converts every platform's response into this one shape.

export const PLATFORMS = ['tiktok', 'instagram', 'youtube'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const MODES = ['trending', 'keyword', 'hashtag'] as const;
export type Mode = (typeof MODES)[number];

export type Video = {
  id: string;
  platform: Platform;
  url: string;
  thumbnail: string | null;
  caption: string;
  author: { name: string; handle: string; avatar: string | null };
  stats: { views: number | null; likes: number | null; comments: number | null };
  postedAt: string | null; // ISO 8601
};

export type ApiErrorCode =
  | 'bad_request'
  | 'missing_key'
  | 'bad_key'
  | 'out_of_credits'
  | 'rate_limited'
  | 'timeout'
  | 'upstream_error';

export type PlatformError = { platform: Platform; code: ApiErrorCode; message: string };

export type PlatformResult = {
  platform: Platform;
  // Raw upstream JSON until the Milestone 2 normalizers turn it into Video[].
  raw: unknown;
};

export type VideosResponse = {
  platform: Platform | 'all';
  mode: Mode;
  query: string | null;
  results: PlatformResult[];
  errors: PlatformError[];
};
