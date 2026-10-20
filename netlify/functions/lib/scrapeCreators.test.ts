import { describe, expect, it, vi } from 'vitest';
import { errorForStatus, fetchFromScrapeCreators, UpstreamError } from './scrapeCreators';

describe('errorForStatus', () => {
  it.each([
    [401, 'bad_key'],
    [403, 'bad_key'],
    [402, 'out_of_credits'],
    [429, 'rate_limited'],
    [500, 'upstream_error'],
  ])('maps %i to %s', (status, code) => {
    expect(errorForStatus(status).code).toBe(code);
  });
});

describe('fetchFromScrapeCreators', () => {
  const run = (fetchImpl: typeof fetch) =>
    fetchFromScrapeCreators('k', 'tiktok', 'keyword', 'cats', fetchImpl);

  it('returns parsed JSON on success', async () => {
    await expect(run(vi.fn().mockResolvedValue(Response.json({ a: 1 })))).resolves.toEqual({
      a: 1,
    });
  });

  it.each([
    ['a timeout', () => Promise.reject(new DOMException('t', 'TimeoutError')), 'timeout'],
    ['a network failure', () => Promise.reject(new TypeError('fetch failed')), 'upstream_error'],
    ['invalid JSON', () => Promise.resolve(new Response('<html>')), 'upstream_error'],
    ['success: false', () => Promise.resolve(Response.json({ success: false })), 'upstream_error'],
    ['a 401', () => Promise.resolve(new Response('', { status: 401 })), 'bad_key'],
  ])('turns %s into an UpstreamError', async (_label, impl, code) => {
    const err: unknown = await run(vi.fn(impl) as unknown as typeof fetch).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(UpstreamError);
    expect((err as UpstreamError).code).toBe(code);
  });
});
