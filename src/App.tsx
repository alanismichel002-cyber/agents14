import { useEffect, useState } from 'react';
import { SearchView } from './views/SearchView';
import { TrendingView } from './views/TrendingView';
import { parseUrl, toUrl, type AppState } from './lib/urlState';

const NAV: { view: AppState['view']; label: string }[] = [
  { view: 'trending', label: 'Trending' },
  { view: 'search', label: 'Search' },
];

export default function App() {
  const [state, setState] = useState<AppState>(() => parseUrl(window.location.search));

  // Back/forward restores the earlier view, tab or search.
  useEffect(() => {
    const onPop = () => setState(parseUrl(window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (next: AppState) => {
    const url = toUrl(next);
    if (url !== window.location.pathname + window.location.search) {
      window.history.pushState(null, '', url);
    }
    setState(next);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate({ view: 'trending', platform: 'tiktok' });
            }}
            className="flex items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            <h1 className="text-xl font-semibold tracking-tight">Trend Finder</h1>
          </a>
          <nav aria-label="Main">
            <ul className="flex gap-1 rounded-xl bg-slate-100 p-1">
              {NAV.map((item) => {
                const current = state.view === item.view;
                return (
                  <li key={item.view}>
                    <button
                      type="button"
                      aria-current={current ? 'page' : undefined}
                      onClick={() =>
                        navigate(
                          item.view === 'trending'
                            ? { view: 'trending', platform: 'tiktok' }
                            : { view: 'search', search: null },
                        )
                      }
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                        current
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {state.view === 'trending' ? (
          <TrendingView
            platform={state.platform}
            onPlatformChange={(platform) => navigate({ view: 'trending', platform })}
          />
        ) : (
          <SearchView
            search={state.search}
            onSearch={(search) => navigate({ view: 'search', search })}
          />
        )}
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500">
        Public data via Scrape Creators. Videos link to the original posts.
      </footer>
    </div>
  );
}
