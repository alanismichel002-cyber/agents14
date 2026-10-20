import { describe, expect, it } from 'vitest';
import { MAX_QUERY_LENGTH, parseVideosRequest } from './validate';

const parse = (qs: string) => parseVideosRequest(new URLSearchParams(qs));

describe('parseVideosRequest', () => {
  it('accepts trending without a query', () => {
    expect(parse('platform=tiktok&mode=trending')).toEqual({
      ok: true,
      value: { platform: 'tiktok', platforms: ['tiktok'], mode: 'trending', query: null },
    });
  });

  it('expands "all" to the three platforms', () => {
    const r = parse('platform=all&mode=keyword&q=skincare');
    expect(r.ok && r.value.platforms).toEqual(['tiktok', 'instagram', 'youtube']);
  });

  it('strips leading # from hashtags and trims', () => {
    const r = parse('platform=instagram&mode=hashtag&q=%20%23skincare%20');
    expect(r.ok && r.value.query).toBe('skincare');
  });

  it.each([
    ['unknown platform', 'platform=facebook&mode=trending'],
    ['unknown mode', 'platform=tiktok&mode=profile'],
    ['missing query', 'platform=tiktok&mode=keyword'],
    ['blank hashtag', 'platform=tiktok&mode=hashtag&q=%23'],
    ['hashtag with spaces', 'platform=tiktok&mode=hashtag&q=two%20words'],
    ['too long', `platform=tiktok&mode=keyword&q=${'a'.repeat(MAX_QUERY_LENGTH + 1)}`],
  ])('rejects %s', (_label, qs) => {
    expect(parse(qs).ok).toBe(false);
  });
});
