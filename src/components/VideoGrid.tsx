import type { Video } from '../../shared/video';
import { VideoCard } from './VideoCard';

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5';

export function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <ul className={GRID}>
      {videos.map((v) => (
        <li key={`${v.platform}-${v.id}`}>
          <VideoCard video={v} />
        </li>
      ))}
    </ul>
  );
}

export function VideoGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading videos" className="space-y-3">
      <p className="text-sm text-slate-600">Fetching live data. This can take up to 20 seconds.</p>
      <ul className={GRID} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="aspect-[9/16] animate-pulse bg-slate-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
