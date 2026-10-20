import { useMemo, useState } from 'react';
import type { Platform } from '../../shared/video';
import { PlatformTabs } from '../components/PlatformTabs';
import { ResultsPanel } from '../components/ResultsPanel';
import { useVideos } from '../hooks/useVideos';
import { PLATFORM_LABELS } from '../lib/platforms';

export function TrendingView() {
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const query = useMemo(() => ({ platform, mode: 'trending' as const }), [platform]);
  const { retry, ...state } = useVideos(query);

  return (
    <section aria-labelledby="trending-heading" className="space-y-5">
      <div>
        <h2 id="trending-heading" className="text-2xl font-semibold tracking-tight">
          Trending now
        </h2>
        <p className="mt-1 text-slate-600">The most popular short videos on each platform today.</p>
      </div>
      <PlatformTabs value={platform} onChange={setPlatform} panelId="trending-panel" />
      <div id="trending-panel" role="tabpanel" aria-labelledby={`tab-${platform}`}>
        <ResultsPanel
          state={state}
          retry={retry}
          emptyTitle={`Nothing trending on ${PLATFORM_LABELS[platform]} right now`}
          emptyHint="Try another platform, or check back later."
        />
      </div>
    </section>
  );
}
