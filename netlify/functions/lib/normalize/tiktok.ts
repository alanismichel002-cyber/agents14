import type { Video } from '../../../../shared/video';
import { arr, firstUrl, httpsUrl, isoDate, num, obj, str } from './util';

export function tiktokItems(raw: unknown): unknown[] {
  const body = obj(raw);
  // Trending and hashtag use aweme_list; keyword search uses search_item_list,
  // whose items are sometimes wrapped in aweme_info.
  return [...arr(body?.aweme_list), ...arr(body?.search_item_list)].map(
    (item) => obj(item)?.aweme_info ?? item,
  );
}

export function normalizeTiktokItem(item: unknown): Video | null {
  const v = obj(item);
  const id = str(v?.aweme_id);
  if (!v || !id) return null;

  const author = obj(v.author);
  const stats = obj(v.statistics);
  const video = obj(v.video);
  const handleFromUrl = str(v.url)?.match(/tiktok\.com\/@([^/?#]+)/)?.[1] ?? null;
  const handle = str(author?.unique_id) ?? handleFromUrl ?? '';
  const url = httpsUrl(v.url) ?? (handle ? `https://www.tiktok.com/@${handle}/video/${id}` : null);
  if (!url) return null;

  return {
    id,
    platform: 'tiktok',
    url,
    thumbnail: firstUrl(video?.cover) ?? firstUrl(video?.origin_cover),
    caption: str(v.desc) ?? '',
    author: {
      name: str(author?.nickname) ?? handle,
      handle,
      avatar: firstUrl(author?.avatar_thumb) ?? firstUrl(author?.avatar_medium),
    },
    stats: {
      views: num(stats?.play_count),
      likes: num(stats?.digg_count),
      comments: num(stats?.comment_count),
    },
    postedAt: isoDate(v.create_time_utc) ?? isoDate(v.create_time),
  };
}
