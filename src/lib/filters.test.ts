import { describe, expect, it } from 'vitest';
import { makeVideo } from '../test/fixtures';
import { filterVideos, NO_FILTERS } from './filters';

const now = Date.parse('2026-10-20T12:00:00Z');
const videos = [
  makeVideo({
    id: 'big-new',
    stats: { views: 2_000_000, likes: 0, comments: 0 },
    postedAt: '2026-10-20T06:00:00Z',
  }),
  makeVideo({
    id: 'small-old',
    stats: { views: 500, likes: 0, comments: 0 },
    postedAt: '2026-08-01T00:00:00Z',
  }),
  makeVideo({ id: 'unknown', stats: { views: null, likes: 0, comments: 0 }, postedAt: null }),
];
const ids = (vs: { id: string }[]) => vs.map((v) => v.id);

describe('filterVideos', () => {
  it('keeps everything with no filters', () => {
    expect(ids(filterVideos(videos, NO_FILTERS, now))).toEqual(['big-new', 'small-old', 'unknown']);
  });
  it('filters by minimum views, dropping unknown counts', () => {
    expect(ids(filterVideos(videos, { minViews: 10_000, postedWithin: 'any' }, now))).toEqual([
      'big-new',
    ]);
  });
  it('filters by posting date, dropping unknown dates', () => {
    expect(ids(filterVideos(videos, { minViews: 0, postedWithin: '24h' }, now))).toEqual([
      'big-new',
    ]);
    expect(ids(filterVideos(videos, { minViews: 0, postedWithin: '30d' }, now))).toEqual([
      'big-new',
    ]);
  });
});
