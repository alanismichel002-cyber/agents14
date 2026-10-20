import { PLATFORMS } from '../shared/video';

const PLATFORM_LABELS: Record<(typeof PLATFORMS)[number], string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
  youtube: 'YouTube Shorts',
};

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight">Trend Finder</h1>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">See what's trending right now</h2>
        <p className="mt-2 text-slate-600">
          Trending videos and search across {PLATFORMS.map((p) => PLATFORM_LABELS[p]).join(', ')}{' '}
          are coming soon.
        </p>
      </main>
    </div>
  );
}
