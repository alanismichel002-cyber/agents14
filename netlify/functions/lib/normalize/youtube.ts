import type { Video } from '../../../../shared/video';
import { arr, httpsUrl, isoDate, num, obj, str } from './util';

export function youtubeItems(raw: unknown): unknown[] {
  const body = obj(raw);
  const shelfItems = arr(body?.shelves).flatMap((shelf) => arr(obj(shelf)?.items));
  // Search returns shorts, regular videos and shelves of either; trending returns shorts.
  return [...arr(body?.shorts), ...arr(body?.videos), ...shelfItems];
}

export function normalizeYoutubeItem(item: unknown): Video | null {
  const v = obj(item);
  const id = str(v?.id);
  if (!v || !id) return null;
  if (v.type && v.type !== 'video' && v.type !== 'short') return null;

  const channel = obj(v.channel);
  const rawHandle = str(channel?.handle) ?? '';
  // Channels without a handle come back as "channel/<id>".
  const handle = rawHandle.startsWith('channel/') ? '' : rawHandle.replace(/^@/, '');
  const url =
    v.type === 'short'
      ? `https://www.youtube.com/shorts/${encodeURIComponent(id)}`
      : (httpsUrl(v.url) ?? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`);

  return {
    id,
    platform: 'youtube',
    url,
    thumbnail:
      httpsUrl(v.thumbnail) ?? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`,
    caption: str(v.title) ?? '',
    author: {
      name: str(channel?.title) ?? handle,
      handle,
      avatar: httpsUrl(channel?.thumbnail),
    },
    stats: {
      views: num(v.viewCountInt) ?? num(str(v.viewCountText)?.replace(/\s*views?$/i, '')),
      likes: num(v.likeCountInt),
      comments: num(v.commentCountInt),
    },
    postedAt: isoDate(v.publishDate) ?? isoDate(v.publishedTime),
  };
}
