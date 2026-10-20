import { describe, expect, it } from 'vitest';
import { PLATFORMS, type Video } from '../../../../shared/video';
import { normalize } from '.';
import { httpsUrl, isoDate, num } from './util';
import tiktokTrending from './__fixtures__/tiktok_trending.json';
import tiktokKeyword from './__fixtures__/tiktok_keyword.json';
import tiktokHashtag from './__fixtures__/tiktok_hashtag.json';
import instagramTrending from './__fixtures__/instagram_trending.json';
import instagramKeyword from './__fixtures__/instagram_keyword.json';
import instagramHashtag from './__fixtures__/instagram_hashtag.json';
import youtubeTrending from './__fixtures__/youtube_trending.json';
import youtubeKeyword from './__fixtures__/youtube_keyword.json';
import youtubeHashtag from './__fixtures__/youtube_hashtag.json';

const one = (videos: Video[]) => {
  expect(videos.length).toBeGreaterThan(0);
  return videos[0]!;
};

describe('TikTok', () => {
  it('skips photo posts (the spec example is one)', () => {
    expect(normalize('tiktok', tiktokTrending)).toEqual([]);
  });

  it('normalizes the trending feed, taking the handle from the URL', () => {
    const item = tiktokTrending.aweme_list[0]!;
    const asVideo = { aweme_list: [{ ...item, url: item.url.replace('/photo/', '/video/') }] };
    expect(one(normalize('tiktok', asVideo))).toMatchObject({
      id: '7540000301621841183',
      platform: 'tiktok',
      url: 'https://www.tiktok.com/@breannafriedman0/video/7540000301621841183',
      author: { name: 'Bre 🤍', handle: 'breannafriedman0' },
      stats: { views: 1443873, likes: 71423, comments: 646 },
      postedAt: '2025-08-18T18:52:13.000Z',
    });
  });

  it('normalizes keyword search', () => {
    const v = one(normalize('tiktok', tiktokKeyword));
    expect(v).toMatchObject({
      id: '7268287584244124971',
      author: { handle: 'thatgreygentlemanitdxz' },
      stats: { views: 1282645, likes: 481608, comments: 187 },
    });
    expect(v.thumbnail).toMatch(/^https:\/\//);
    // Every avatar in the spec example is HEIC, which browsers can't show.
    expect(v.author.avatar).toBeNull();
  });

  it('unwraps keyword results nested in aweme_info', () => {
    const wrapped = { search_item_list: [{ aweme_info: tiktokKeyword.search_item_list[0] }] };
    expect(one(normalize('tiktok', wrapped)).id).toBe('7268287584244124971');
  });

  it('normalizes hashtag search', () => {
    expect(one(normalize('tiktok', tiktokHashtag))).toMatchObject({
      author: { handle: 'gilmoreluvrr' },
      stats: { views: 12711728 },
    });
  });
});

describe('Instagram', () => {
  it('normalizes trending reels (author in user, views from play_count)', () => {
    expect(one(normalize('instagram', instagramTrending))).toMatchObject({
      id: '4000819054877393649',
      url: 'https://www.instagram.com/reel/DeFw7uwlMLx/',
      author: { name: 'UFC', handle: 'ufc' },
      stats: { views: 5112349, likes: 423127, comments: 1623 },
      postedAt: '2026-10-04T23:00:03.000Z',
    });
  });

  it('normalizes keyword search (author in owner, no view count)', () => {
    expect(one(normalize('instagram', instagramKeyword))).toMatchObject({
      url: 'https://www.instagram.com/reel/DOq6eV6iIgD/',
      author: { handle: 'fetchmycamera_' },
      stats: { views: null, likes: 3487, comments: 90 },
    });
  });

  it('normalizes hashtag posts', () => {
    expect(one(normalize('instagram', instagramHashtag))).toMatchObject({
      author: { handle: '_layla_the_boxer', name: 'Layla the Boxer' },
      stats: { likes: 35854, comments: 1263 },
    });
  });
});

describe('YouTube', () => {
  it('normalizes trending shorts, linking to the Shorts player', () => {
    expect(one(normalize('youtube', youtubeTrending))).toMatchObject({
      id: 'ou0nl5ET0HA',
      url: 'https://www.youtube.com/shorts/ou0nl5ET0HA',
      caption: 'That hooper who says their just shoes',
      author: { name: 'Dame Universe', handle: 'dameuniverse', avatar: null },
      stats: { views: 13798774, likes: 151957, comments: 168 },
    });
  });

  it('combines shorts, videos and shelf items from search, with shorts URLs for shorts', () => {
    const videos = normalize('youtube', youtubeKeyword);
    expect(videos.map((v) => v.id)).toEqual(['uMNvF-lSCHg', 'BzSzwqb-OEE', 'LLBR5nO05tE']);
    expect(videos[0]!.url).toBe('https://www.youtube.com/shorts/uMNvF-lSCHg');
    // A channel with no handle comes back as "channel/<id>".
    expect(videos[1]!.author.handle).toBe('');
  });

  it('normalizes hashtag search', () => {
    expect(one(normalize('youtube', youtubeHashtag))).toMatchObject({
      id: 'jXMISgQq9MM',
      stats: { views: 22668056, likes: null },
    });
  });

  it('skips channels and playlists and removes duplicates', () => {
    const raw = {
      videos: [
        { type: 'video', id: 'a' },
        { type: 'channel', id: 'c' },
      ],
      shorts: [{ type: 'short', id: 'a' }],
    };
    expect(normalize('youtube', raw).map((v) => v.id)).toEqual(['a']);
  });
});

describe('robustness', () => {
  it.each(PLATFORMS)('%s returns [] for empty or malformed input', (platform) => {
    for (const raw of [null, undefined, 42, 'x', [], {}, { aweme_list: 'nope', reels: {} }]) {
      expect(normalize(platform, raw)).toEqual([]);
    }
  });

  it.each([
    ['tiktok', { aweme_list: [{ aweme_id: '1', url: 'https://www.tiktok.com/@a/video/1' }] }],
    ['instagram', { reels: [{ id: '1', shortcode: 'abc' }] }],
    ['youtube', { videos: [{ id: '1' }] }],
  ] as const)('%s keeps a minimal item with unknown fields as null', (platform, raw) => {
    const v = one(normalize(platform, raw));
    expect(v.stats).toEqual({ views: null, likes: null, comments: null });
    expect(v.postedAt).toBeNull();
    expect(v.author.avatar).toBeNull();
  });

  it('skips ads and non-video posts', () => {
    expect(
      normalize('tiktok', {
        aweme_list: [{ aweme_id: '1', url: 'https://www.tiktok.com/@a/video/1', is_ad: true }],
      }),
    ).toEqual([]);
    expect(
      normalize('instagram', { posts: [{ id: '1', shortcode: 'a', is_video: false }] }),
    ).toEqual([]);
    expect(normalize('instagram', { reels: [{ id: '1', shortcode: 'a', media_type: 1 }] })).toEqual(
      [],
    );
  });

  it('prefers non-HEIC TikTok images and skips non-https entries', () => {
    const raw = {
      aweme_list: [
        {
          aweme_id: '1',
          url: 'https://www.tiktok.com/@a/video/1',
          author: {
            avatar_thumb: {
              url_list: ['http://x/a.jpeg', 'https://x/a.heic?s=1', 'https://x/a.jpeg'],
            },
          },
          video: { cover: { url_list: ['https://x/c.heic'] } },
        },
      ],
    };
    const v = one(normalize('tiktok', raw));
    expect(v.author.avatar).toBe('https://x/a.jpeg');
    expect(v.thumbnail).toBeNull();
  });

  it('drops non-https URLs so they never reach the browser', () => {
    const item = {
      id: '1',
      shortcode: 'abc',
      url: 'javascript:alert(1)',
      thumbnail_src: 'http://insecure.example/x.jpg',
      user: { username: 'u', profile_pic_url: 'data:image/png;base64,AAAA' },
    };
    expect(one(normalize('instagram', { reels: [item] }))).toMatchObject({
      url: 'https://www.instagram.com/p/abc/',
      thumbnail: null,
      author: { avatar: null },
    });
    // With no safe URL to fall back to, the item is dropped.
    expect(normalize('instagram', { reels: [{ ...item, shortcode: undefined }] })).toEqual([]);
  });
});

describe('util', () => {
  it('parses numbers defensively', () => {
    expect(num('13,798,774')).toBe(13798774);
    expect(num(5)).toBe(5);
    expect(num('12K')).toBeNull();
    expect(num(-1)).toBeNull();
    expect(num(null)).toBeNull();
  });

  it('accepts only https URLs', () => {
    expect(httpsUrl('https://a.example/x')).toBe('https://a.example/x');
    expect(httpsUrl('http://a.example/x')).toBeNull();
    expect(httpsUrl('javascript:alert(1)')).toBeNull();
    expect(httpsUrl('not a url')).toBeNull();
  });

  it('parses unix seconds and ISO dates', () => {
    expect(isoDate(1755543133)).toBe('2025-08-18T18:52:13.000Z');
    expect(isoDate('1755543133')).toBe('2025-08-18T18:52:13.000Z');
    expect(isoDate('2025-08-07T13:00:22-07:00')).toBe('2025-08-07T20:00:22.000Z');
    expect(isoDate('soon')).toBeNull();
    expect(isoDate(1e13)).toBeNull();
    expect(isoDate('10000000000000')).toBeNull();
  });
});
