import type { Config } from '@netlify/functions';
import type { PlatformError, PlatformResult, VideosResponse } from '../../shared/video';
import { parseVideosRequest } from './lib/validate';
import { fetchFromScrapeCreators, UpstreamError } from './lib/scrapeCreators';

const CDN_CACHE_SECONDS = { trending: 900, search: 300 };

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

// Errors must never be CDN-cached, or one bad response would be served to everyone.
const noStore = { 'cache-control': 'no-store' };

export default async (req: Request): Promise<Response> => {
  const parsed = parseVideosRequest(new URL(req.url).searchParams);
  if (!parsed.ok) {
    return json({ error: { code: 'bad_request', message: parsed.message } }, 400, noStore);
  }
  const { platform, platforms, mode, query } = parsed.value;

  const apiKey = process.env.SCRAPE_CREATORS_API_KEY;
  if (!apiKey) {
    return json(
      { error: { code: 'missing_key', message: 'The server is missing its API key.' } },
      500,
      noStore,
    );
  }

  const settled = await Promise.allSettled(
    platforms.map((p) => fetchFromScrapeCreators(apiKey, p, mode, query)),
  );

  const results: PlatformResult[] = [];
  const errors: PlatformError[] = [];
  settled.forEach((outcome, i) => {
    const p = platforms[i]!;
    if (outcome.status === 'fulfilled') {
      results.push({ platform: p, raw: outcome.value });
    } else {
      const err =
        outcome.reason instanceof UpstreamError
          ? outcome.reason
          : new UpstreamError('upstream_error', 'Unexpected error.');
      errors.push({ platform: p, code: err.code, message: err.message });
    }
  });

  const body: VideosResponse = { platform, mode, query, results, errors };

  if (results.length === 0) {
    const status = errors.some((e) => e.code === 'rate_limited') ? 429 : 502;
    return json(body, status, noStore);
  }
  if (errors.length > 0) {
    // Partial results are worth showing, but not worth caching.
    return json(body, 200, noStore);
  }

  const seconds = mode === 'trending' ? CDN_CACHE_SECONDS.trending : CDN_CACHE_SECONDS.search;
  return json(body, 200, {
    'cache-control': 'public, max-age=0, must-revalidate',
    'netlify-cdn-cache-control': `public, s-maxage=${seconds}, stale-while-revalidate=300`,
    // Only these params affect the cache key, so junk params can't bypass the cache.
    'netlify-vary': 'query=platform|mode|q',
  });
};

export const config: Config = {
  path: '/api/videos',
  method: 'GET',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
