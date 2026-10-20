import { describe, expect, it } from 'vitest';
import { API_BASE, buildUpstreamUrl } from './endpoints';

describe('buildUpstreamUrl', () => {
  it('always targets the Scrape Creators host', () => {
    const url = buildUpstreamUrl('youtube', 'keyword', '../../evil?x=1');
    expect(url.origin).toBe(API_BASE);
    expect(url.pathname).toBe('/v1/youtube/search');
    expect(url.searchParams.get('query')).toBe('../../evil?x=1');
  });

  it('adds the required region for TikTok trending', () => {
    const url = buildUpstreamUrl('tiktok', 'trending', null);
    expect(url.pathname).toBe('/v1/tiktok/get-trending-feed');
    expect(url.searchParams.get('region')).toBe('US');
  });

  it('uses the hashtag parameter for hashtag searches', () => {
    const url = buildUpstreamUrl('instagram', 'hashtag', 'skincare');
    expect(url.pathname).toBe('/v1/instagram/search/hashtag');
    expect(url.searchParams.get('hashtag')).toBe('skincare');
  });
});
