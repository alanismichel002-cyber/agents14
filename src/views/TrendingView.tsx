import { useMemo, useState } from 'react';
import type { Platform } from '../../shared/video';
import { PlatformTabs } from '../components/PlatformTabs';
import { SortMenu } from '../components/SortMenu';
import { sortVideos, type Sort } from '../lib/sort';
import { ResultsPanel } from '../components/ResultsPanel';
import { useVideos } from '../hooks/useVideos';
import { PLATFORM_LABELS } from '../lib/platforms';

export function TrendingView({
  platform,
  onPlatformChange,
}: {
  platform: Platform;
  onPlatformChange: (p: Platform) => void;
}) {
  const [sort, setSort] = useState<Sort>('top');
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
      <PlatformTabs value={platform} onChange={onPlatformChange} panelId="trending-panel" />
      <div className="flex justify-end">
        <SortMenu id="trending-sort" value={sort} onChange={setSort} />
      </div>
      <div id="trending-panel" role="tabpanel" aria-labelledby={`tab-${platform}`}>
        <ResultsPanel
          state={state}
          retry={retry}
          emptyTitle={`Nothing trending on ${PLATFORM_LABELS[platform]} right now`}
          emptyHint="Try another platform, or check back later."
          arrange={(videos) => sortVideos(videos, sort)}
        />
      </div>
    </section>
  );
}
