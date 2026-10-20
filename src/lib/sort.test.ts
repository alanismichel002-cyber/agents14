import { describe, expect, it } from 'vitest';
import { makeVideo } from '../test/fixtures';
import { interleaveByPlatform, sortVideos } from './sort';

const v = (
  id: string,
  platform: 'tiktok' | 'instagram' | 'youtube',
  views: number | null,
  postedAt: string | null = null,
) => makeVideo({ id, platform, stats: { views, likes: views, comments: null }, postedAt });

describe('sortVideos', () => {
  const list = [v('a', 'tiktok', 10), v('b', 'tiktok', null), v('c', 'youtube', 30)];

  it('sorts by views with unknown values last', () => {
    expect(sortVideos(list, 'views').map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });

  it('sorts by newest with missing dates last', () => {
    const dated = [
      v('old', 'tiktok', 1, '2026-01-01T00:00:00Z'),
      v('none', 'tiktok', 1),
      v('new', 'tiktok', 1, '2026-10-01T00:00:00Z'),
    ];
    expect(sortVideos(dated, 'newest').map((x) => x.id)).toEqual(['new', 'old', 'none']);
  });

  it('does not mutate its input', () => {
    const copy = [...list];
    sortVideos(list, 'views');
    expect(list).toEqual(copy);
  });
});

describe('interleaveByPlatform', () => {
  it('alternates platforms while keeping each platform’s order', () => {
    const list = [
      v('t1', 'tiktok', 1),
      v('t2', 'tiktok', 1),
      v('t3', 'tiktok', 1),
      v('i1', 'instagram', 1),
      v('y1', 'youtube', 1),
      v('y2', 'youtube', 1),
    ];
    expect(interleaveByPlatform(list).map((x) => x.id)).toEqual([
      't1',
      'i1',
      'y1',
      't2',
      'y2',
      't3',
    ]);
  });
});
