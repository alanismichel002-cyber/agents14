import type { Video } from '../../../../shared/video';
import { arr, httpsUrl, isoDate, num, obj, str } from './util';

export function instagramItems(raw: unknown): unknown[] {
  const body = obj(raw);
  // Trending and keyword search use reels; hashtag search uses posts.
  return [...arr(body?.reels), ...arr(body?.posts)];
}

export function normalizeInstagramItem(item: unknown): Video | null {
  const v = obj(item);
  const id = str(v?.id) ?? str(v?.pk);
  const shortcode = str(v?.shortcode);
  if (!v || !id || v.is_ad === true) return null;
  // Only videos: search results flag them with is_video, trending reels with media_type 2.
  if (v.is_video === false || (v.media_type != null && num(v.media_type) !== 2)) return null;

  const url =
    httpsUrl(v.url) ??
    (shortcode ? `https://www.instagram.com/p/${encodeURIComponent(shortcode)}/` : null);
  if (!url) return null;

  // Trending reels carry the author in `user`; search results in `owner`.
  const user = obj(v.user) ?? obj(v.owner);
  const handle = str(user?.username) ?? '';
  const candidates = arr(obj(v.image_versions2)?.candidates);

  return {
    id,
    platform: 'instagram',
    url,
    thumbnail:
      httpsUrl(v.thumbnail_src) ??
      httpsUrl(v.display_url) ??
      httpsUrl(v.image_url) ??
      httpsUrl(obj(candidates[0])?.url),
    caption: str(v.caption) ?? str(obj(v.caption)?.text) ?? '',
    author: {
      name: str(user?.full_name) ?? handle,
      handle,
      avatar: httpsUrl(user?.profile_pic_url),
    },
    stats: {
      views: num(v.play_count) ?? num(v.ig_play_count) ?? num(v.video_view_count),
      likes: num(v.like_count),
      comments: num(v.comment_count),
    },
    postedAt: isoDate(v.taken_at),
  };
}
