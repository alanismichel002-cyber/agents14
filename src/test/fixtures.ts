import type { Video, VideosResponse } from '../../shared/video';

export function makeVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: '1',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@creator/video/1',
    thumbnail: 'https://example.com/thumb.jpg',
    caption: 'A trending video',
    author: { name: 'Creator', handle: 'creator', avatar: 'https://example.com/a.jpg' },
    stats: { views: 1_200_000, likes: 34_000, comments: 560 },
    postedAt: '2026-10-19T12:00:00.000Z',
    ...overrides,
  };
}

export function makeResponse(overrides: Partial<VideosResponse> = {}): VideosResponse {
  return {
    platform: 'tiktok',
    mode: 'trending',
    query: null,
    videos: [makeVideo()],
    errors: [],
    ...overrides,
  };
}
