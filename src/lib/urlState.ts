import { PLATFORMS, type Platform } from '../../shared/video';
import { validateSearch, type SearchInput } from './search';

export type AppState =
  { view: 'trending'; platform: Platform } | { view: 'search'; search: SearchInput | null };

const isPlatform = (v: string | null): v is Platform =>
  v !== null && (PLATFORMS as readonly string[]).includes(v);

// URLs look like /?p=youtube (trending) or /?view=search&q=%23skincare&p=all.
// A link with q but no view (e.g. /?q=%23skincare&p=tiktok) also opens search.
export function parseUrl(search: string): AppState {
  const params = new URLSearchParams(search);
  const p = params.get('p');
  if (params.get('view') === 'search' || params.has('q')) {
    const q = (params.get('q') ?? '').trim();
    const platform = p === 'all' || isPlatform(p) ? p : 'all';
    // A link with an invalid search opens the empty search page instead of running it.
    return { view: 'search', search: validateSearch(q) ? null : { platform, text: q } };
  }
  return { view: 'trending', platform: isPlatform(p) ? p : 'tiktok' };
}

export function toUrl(state: AppState): string {
  const params = new URLSearchParams();
  if (state.view === 'trending') {
    if (state.platform !== 'tiktok') params.set('p', state.platform);
  } else {
    params.set('view', 'search');
    if (state.search) {
      params.set('q', state.search.text);
      params.set('p', state.search.platform);
    }
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}
