import type { Platform, Video } from '../../../../shared/video';
import { instagramItems, normalizeInstagramItem } from './instagram';
import { normalizeTiktokItem, tiktokItems } from './tiktok';
import { normalizeYoutubeItem, youtubeItems } from './youtube';

const NORMALIZERS: Record<
  Platform,
  { items: (raw: unknown) => unknown[]; one: (item: unknown) => Video | null }
> = {
  tiktok: { items: tiktokItems, one: normalizeTiktokItem },
  instagram: { items: instagramItems, one: normalizeInstagramItem },
  youtube: { items: youtubeItems, one: normalizeYoutubeItem },
};

// Converts one platform's raw response into Video[], dropping unusable items
// and duplicates (YouTube search can list the same short twice).
export function normalize(platform: Platform, raw: unknown): Video[] {
  const { items, one } = NORMALIZERS[platform];
  const seen = new Set<string>();
  const videos: Video[] = [];
  for (const item of items(raw)) {
    const video = one(item);
    if (video && !seen.has(video.id)) {
      seen.add(video.id);
      videos.push(video);
    }
  }
  return videos;
}
