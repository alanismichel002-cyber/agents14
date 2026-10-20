import type { ApiErrorCode, Mode, Platform } from '../../../shared/video';
import { buildUpstreamUrl } from './endpoints';

// Scrape Creators often takes 7–15 s (seen up to 30 s); Netlify stops sync functions at 30 s.
export const UPSTREAM_TIMEOUT_MS = 25_000;

export class UpstreamError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export function errorForStatus(status: number): UpstreamError {
  if (status === 401 || status === 403) {
    return new UpstreamError('bad_key', 'The Scrape Creators API key was rejected.');
  }
  if (status === 402) {
    return new UpstreamError('out_of_credits', 'The Scrape Creators account is out of credits.');
  }
  if (status === 429) {
    return new UpstreamError('rate_limited', 'Too many requests. Try again in a minute.');
  }
  return new UpstreamError('upstream_error', `Scrape Creators returned an error (${status}).`);
}

export async function fetchFromScrapeCreators(
  apiKey: string,
  platform: Platform,
  mode: Mode,
  query: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<unknown> {
  let res: Response;
  try {
    res = await fetchImpl(buildUpstreamUrl(platform, mode, query), {
      headers: { 'x-api-key': apiKey, accept: 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new UpstreamError('timeout', 'Scrape Creators took too long to respond.');
    }
    throw new UpstreamError('upstream_error', 'Could not reach Scrape Creators.');
  }
  if (!res.ok) throw errorForStatus(res.status);
  let body: unknown;
  try {
    body = await res.json();
  } catch (err) {
    // The timeout can also fire while the body is still downloading.
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new UpstreamError('timeout', 'Scrape Creators took too long to respond.');
    }
    throw new UpstreamError('upstream_error', 'Scrape Creators returned invalid JSON.');
  }
  if (body && typeof body === 'object' && (body as { success?: unknown }).success === false) {
    throw new UpstreamError('upstream_error', 'Scrape Creators could not complete the request.');
  }
  return body;
}
