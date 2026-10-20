import { MODES, PLATFORMS, type Mode, type Platform } from '../../../shared/video';

export const MAX_QUERY_LENGTH = 100;

export type VideosRequest = {
  platforms: Platform[];
  platform: Platform | 'all';
  mode: Mode;
  query: string | null;
};

export type ValidationResult = { ok: true; value: VideosRequest } | { ok: false; message: string };

const isPlatform = (v: string): v is Platform => (PLATFORMS as readonly string[]).includes(v);
const isMode = (v: string): v is Mode => (MODES as readonly string[]).includes(v);

// Unknown query parameters are ignored, so they can never reach the upstream API.
export function parseVideosRequest(params: URLSearchParams): ValidationResult {
  const platformParam = params.get('platform') ?? '';
  const modeParam = params.get('mode') ?? '';

  if (platformParam !== 'all' && !isPlatform(platformParam)) {
    return { ok: false, message: `platform must be one of: ${PLATFORMS.join(', ')}, all` };
  }
  if (!isMode(modeParam)) {
    return { ok: false, message: `mode must be one of: ${MODES.join(', ')}` };
  }

  let query: string | null = null;
  if (modeParam !== 'trending') {
    let q = (params.get('q') ?? '').trim();
    if (modeParam === 'hashtag') q = q.replace(/^#+/, '').trim();
    if (!q) return { ok: false, message: 'q is required for keyword and hashtag searches' };
    if (q.length > MAX_QUERY_LENGTH) {
      return { ok: false, message: `q must be ${MAX_QUERY_LENGTH} characters or fewer` };
    }
    if (modeParam === 'hashtag' && /\s/.test(q)) {
      return { ok: false, message: 'hashtags cannot contain spaces' };
    }
    query = q;
  }

  return {
    ok: true,
    value: {
      platform: platformParam,
      platforms: platformParam === 'all' ? [...PLATFORMS] : [platformParam],
      mode: modeParam,
      query,
    },
  };
}
