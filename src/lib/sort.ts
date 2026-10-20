import type { Video } from '../../shared/video';

export const SORTS = ['top', 'views', 'likes', 'newest'] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABELS: Record<Sort, string> = {
  top: 'Top (platform order)',
  views: 'Most views',
  likes: 'Most likes',
  newest: 'Newest',
};

// Unknown values sort last, whatever the direction.
const desc = (a: number | null, b: number | null) => (b ?? -Infinity) - (a ?? -Infinity);
const time = (iso: string | null) => (iso ? Date.parse(iso) : null);

export function sortVideos(videos: Video[], sort: Sort): Video[] {
  if (sort === 'top') return interleaveByPlatform(videos);
  const copy = [...videos];
  if (sort === 'views') copy.sort((a, b) => desc(a.stats.views, b.stats.views));
  if (sort === 'likes') copy.sort((a, b) => desc(a.stats.likes, b.stats.likes));
  if (sort === 'newest') copy.sort((a, b) => desc(time(a.postedAt), time(b.postedAt)));
  return copy;
}

// Keeps each platform's own ranking but alternates platforms, so an "All"
// search doesn't show every TikTok result before the first YouTube one.
export function interleaveByPlatform(videos: Video[]): Video[] {
  const queues = new Map<string, Video[]>();
  for (const v of videos) {
    const q = queues.get(v.platform) ?? [];
    q.push(v);
    queues.set(v.platform, q);
  }
  const out: Video[] = [];
  const lists = [...queues.values()];
  for (let i = 0; out.length < videos.length; i++) {
    for (const list of lists) {
      const v = list[i];
      if (v) out.push(v);
    }
  }
  return out;
}
