import { describe, expect, it } from 'vitest';
import { parseUrl, toUrl } from './urlState';

describe('url state', () => {
  it('defaults to TikTok trending', () => {
    expect(parseUrl('')).toEqual({ view: 'trending', platform: 'tiktok' });
    expect(toUrl({ view: 'trending', platform: 'tiktok' })).toBe('/');
  });

  it('round-trips a hashtag search', () => {
    const state = { view: 'search', search: { platform: 'instagram', text: '#skincare' } } as const;
    const url = toUrl(state);
    expect(url).toBe('/?view=search&q=%23skincare&p=instagram');
    expect(parseUrl(url.slice(1))).toEqual(state);
  });

  it('opens search for a link with q but no view (the PRD example)', () => {
    expect(parseUrl('?q=%23skincare&p=tiktok')).toEqual({
      view: 'search',
      search: { platform: 'tiktok', text: '#skincare' },
    });
  });

  it('does not run invalid searches from a link', () => {
    for (const q of ['%23', '%23a%20b', 'x'.repeat(101)]) {
      expect(parseUrl(`?view=search&q=${q}`)).toEqual({ view: 'search', search: null });
    }
  });

  it('ignores unknown platforms and empty queries', () => {
    expect(parseUrl('?p=myspace')).toEqual({ view: 'trending', platform: 'tiktok' });
    expect(parseUrl('?view=search&q=%20&p=nope')).toEqual({ view: 'search', search: null });
    expect(parseUrl('?view=search&q=cats&p=nope')).toEqual({
      view: 'search',
      search: { platform: 'all', text: 'cats' },
    });
  });
});
