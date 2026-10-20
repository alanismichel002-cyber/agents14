import { TrendingView } from './views/TrendingView';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          <h1 className="text-xl font-semibold tracking-tight">Trend Finder</h1>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <TrendingView />
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500">
        Public data via Scrape Creators. Videos link to the original posts.
      </footer>
    </div>
  );
}
