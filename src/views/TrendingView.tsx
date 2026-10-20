import { useMemo } from 'react';
import type { Platform } from '../../shared/video';
import { PlatformTabs } from '../components/PlatformTabs';
import { useResultControls } from '../hooks/useResultControls';
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
  const { controls, arrange, filtered, clearFilters } = useResultControls('trending');
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
      {controls}
      <div id="trending-panel" role="tabpanel" aria-labelledby={`tab-${platform}`}>
        <ResultsPanel
          state={state}
          retry={retry}
          emptyTitle={
            filtered
              ? 'No videos match these filters'
              : `Nothing trending on ${PLATFORM_LABELS[platform]} right now`
          }
          emptyHint={filtered ? undefined : 'Try another platform, or check back later.'}
          emptyAction={filtered ? { label: 'Clear filters', onClick: clearFilters } : undefined}
          arrange={arrange}
        />
      </div>
    </section>
  );
}
