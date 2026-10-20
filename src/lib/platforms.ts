import type { Platform } from '../../shared/video';

export const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
  youtube: 'YouTube Shorts',
};

export const PLATFORM_SHORT_LABELS: Record<Platform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

export const PLATFORM_BADGE_CLASSES: Record<Platform, string> = {
  tiktok: 'bg-slate-900 text-white',
  instagram: 'bg-pink-600 text-white',
  youtube: 'bg-red-600 text-white',
};
