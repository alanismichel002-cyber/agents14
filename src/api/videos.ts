import type { ApiErrorCode, Mode, Platform, VideosResponse } from '../../shared/video';

export type VideosQuery = { platform: Platform | 'all'; mode: Mode; q?: string };

export class VideosApiError extends Error {
  constructor(
    public code: ApiErrorCode | 'network',
    message: string,
  ) {
    super(message);
  }
}

export const ERROR_MESSAGES: Record<VideosApiError['code'], string> = {
  bad_request: 'That search could not be run. Check the text and try again.',
  missing_key: 'The site is not set up yet: its Scrape Creators API key is missing.',
  bad_key: 'The Scrape Creators API key was rejected. The site owner needs to update it.',
  out_of_credits: 'The Scrape Creators account is out of credits.',
  rate_limited: 'Too many requests right now. Wait a minute and try again.',
  timeout: 'The platform took too long to respond. Try again.',
  upstream_error: 'The platform returned an error. Try again in a moment.',
  network: 'Could not reach the server. Check your connection and try again.',
};

// The browser only ever talks to our own /api/videos function, never to Scrape Creators.
export async function fetchVideos(
  query: VideosQuery,
  signal?: AbortSignal,
): Promise<VideosResponse> {
  const params = new URLSearchParams({ platform: query.platform, mode: query.mode });
  if (query.q) params.set('q', query.q);

  let res: Response;
  try {
    res = await fetch(`/api/videos?${params}`, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new VideosApiError('network', ERROR_MESSAGES.network);
  }

  const body: unknown = await res.json().catch(() => null);
  if (res.ok && body && typeof body === 'object' && 'videos' in body) {
    return body as VideosResponse;
  }

  // Single-error responses carry `error`; all-platforms-failed responses carry `errors`.
  const b = (body ?? {}) as { error?: { code?: string }; errors?: { code?: string }[] };
  const code = (b.error?.code ??
    b.errors?.[0]?.code ??
    (res.status === 429 ? 'rate_limited' : 'upstream_error')) as VideosApiError['code'];
  throw new VideosApiError(code, ERROR_MESSAGES[code] ?? ERROR_MESSAGES.upstream_error);
}
