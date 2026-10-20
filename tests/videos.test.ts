import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../netlify/functions/videos';
import tiktokKeyword from '../netlify/functions/lib/normalize/__fixtures__/tiktok_keyword.json';
import youtubeTrending from '../netlify/functions/lib/normalize/__fixtures__/youtube_trending.json';

// A single regular video, so "all" mode returns exactly one YouTube result.
const youtubeKeyword = {
  videos: [{ type: 'video', id: 'abc', url: 'https://www.youtube.com/watch?v=abc', title: 'x' }],
};

const call = (qs: string) => handler(new Request(`https://example.test/api/videos?${qs}`));

describe('videos function', () => {
  beforeEach(() => {
    vi.stubEnv('SCRAPE_CREATORS_API_KEY', 'test-key');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns 400 for invalid input without calling upstream', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await call('platform=nope&mode=trending');
    expect(res.status).toBe(400);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns 500 when the API key is missing', async () => {
    vi.stubEnv('SCRAPE_CREATORS_API_KEY', '');
    const res = await call('platform=tiktok&mode=trending');
    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe('missing_key');
  });

  it('sends the key upstream and CDN-caches a successful trending response', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(Response.json(youtubeTrending));
    vi.stubGlobal('fetch', fetchSpy);
    const res = await call('platform=youtube&mode=trending');
    expect(res.status).toBe(200);
    const [, init] = fetchSpy.mock.calls[0]!;
    expect(init.headers['x-api-key']).toBe('test-key');
    expect(res.headers.get('netlify-cdn-cache-control')).toContain('s-maxage=900');
    const body = await res.json();
    expect(body.videos).toHaveLength(1);
    expect(body.videos[0]).toMatchObject({ platform: 'youtube', id: 'ou0nl5ET0HA' });
    expect(JSON.stringify(body)).not.toContain('test-key');
  });

  it('only lets platform, mode and q affect the cache or reach upstream', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(Response.json(tiktokKeyword));
    vi.stubGlobal('fetch', fetchSpy);
    const res = await call('platform=tiktok&mode=keyword&q=cats&x=1&region=FR');
    expect(res.headers.get('netlify-vary')).toBe('query=platform|mode|q');
    const url: URL = fetchSpy.mock.calls[0]![0];
    expect([...url.searchParams.keys()]).toEqual(['query']);
  });

  it('makes exactly one upstream call per platform in "all" mode', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(Response.json({}));
    vi.stubGlobal('fetch', fetchSpy);
    await call('platform=all&mode=trending');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('returns partial results, uncached, when one platform fails in "all" mode', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: URL) =>
        Promise.resolve(
          url.pathname.includes('instagram')
            ? new Response('nope', { status: 402 })
            : Response.json(url.pathname.includes('tiktok') ? tiktokKeyword : youtubeKeyword),
        ),
      ),
    );
    const res = await call('platform=all&mode=keyword&q=cats');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.json();
    expect(body.videos.map((v: { platform: string }) => v.platform)).toEqual(['tiktok', 'youtube']);
    expect(body.errors).toEqual([
      { platform: 'instagram', code: 'out_of_credits', message: expect.any(String) },
    ]);
  });

  it('does not CDN-cache an empty result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ shorts: [] })));
    const res = await call('platform=youtube&mode=trending');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('returns 429 when every platform is rate-limited', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 429 })));
    const res = await call('platform=tiktok&mode=keyword&q=cats');
    expect(res.status).toBe(429);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});
