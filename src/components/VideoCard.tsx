import { useState } from 'react';
import type { Video } from '../../shared/video';
import { formatCount, formatRelativeDate } from '../lib/format';
import { PLATFORM_BADGE_CLASSES, PLATFORM_SHORT_LABELS } from '../lib/platforms';

function Stat({ label, value, icon }: { label: string; value: number | null; icon: string }) {
  return (
    <span className="inline-flex items-center gap-1" title={`${label}: ${value ?? 'unknown'}`}>
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{label}: </span>
      {formatCount(value)}
    </span>
  );
}

export function VideoCard({ video }: { video: Video }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const posted = formatRelativeDate(video.postedAt);
  const creator = video.author.name || video.author.handle || 'Unknown creator';

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-rose-500">
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none"
      >
        <div className="relative aspect-[9/16] bg-slate-200">
          {video.thumbnail && !thumbFailed ? (
            <img
              src={video.thumbnail}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setThumbFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-700">
              No preview
            </div>
          )}
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${PLATFORM_BADGE_CLASSES[video.platform]}`}
          >
            {PLATFORM_SHORT_LABELS[video.platform]}
          </span>
        </div>
        <div className="space-y-2 p-3">
          <div className="flex items-center gap-2">
            {video.author.avatar && !avatarFailed ? (
              <img
                src={video.author.avatar}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="h-6 w-6 shrink-0 rounded-full bg-slate-200 object-cover"
              />
            ) : (
              <span aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full bg-slate-200" />
            )}
            <span className="truncate text-sm font-medium text-slate-900">{creator}</span>
          </div>
          {video.caption && (
            <p className="line-clamp-2 text-sm text-slate-700" title={video.caption}>
              {video.caption}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <Stat label="Views" value={video.stats.views} icon="▶" />
            <Stat label="Likes" value={video.stats.likes} icon="♥" />
            <Stat label="Comments" value={video.stats.comments} icon="💬" />
            {posted && <span className="ml-auto">{posted}</span>}
          </div>
          <span className="sr-only">
            (opens on {PLATFORM_SHORT_LABELS[video.platform]} in a new tab)
          </span>
        </div>
      </a>
    </article>
  );
}
