import type { VideosState } from '../hooks/useVideos';
import { PLATFORM_SHORT_LABELS } from '../lib/platforms';
import type { Video } from '../../shared/video';
import { StateMessage } from './StateMessage';
import { VideoGrid, VideoGridSkeleton } from './VideoGrid';

// Shared loading / error / empty / results rendering for every view.
export function ResultsPanel({
  state,
  retry,
  emptyTitle,
  emptyHint,
  emptyAction,
  arrange = (v) => v,
}: {
  state: VideosState;
  retry: () => void;
  emptyTitle: string;
  emptyHint?: string;
  emptyAction?: { label: string; onClick: () => void };
  arrange?: (videos: Video[]) => Video[];
}) {
  if (state.status === 'idle') return null;
  if (state.status === 'loading') return <VideoGridSkeleton />;
  if (state.status === 'error') {
    return (
      <StateMessage
        tone="error"
        title="Couldn't load videos"
        action={{ label: 'Try again', onClick: retry }}
      >
        {state.error.message}
      </StateMessage>
    );
  }

  const { videos, errors } = state.data;
  const shown = arrange(videos);
  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Some results are missing:{' '}
          {errors.map((e) => `${PLATFORM_SHORT_LABELS[e.platform]} (${e.message})`).join('; ')}
        </div>
      )}
      <p aria-live="polite" className="text-sm text-slate-600">
        {shown.length === videos.length
          ? `${shown.length} ${shown.length === 1 ? 'video' : 'videos'}`
          : `Showing ${shown.length} of ${videos.length} videos`}
      </p>
      {shown.length === 0 ? (
        <StateMessage title={emptyTitle} action={emptyAction}>
          {emptyHint}
        </StateMessage>
      ) : (
        <VideoGrid videos={shown} />
      )}
    </div>
  );
}
