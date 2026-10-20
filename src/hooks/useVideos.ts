import { useEffect, useState } from 'react';
import type { VideosResponse } from '../../shared/video';
import { fetchVideos, VideosApiError, ERROR_MESSAGES, type VideosQuery } from '../api/videos';

export type VideosState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: VideosApiError }
  | { status: 'success'; data: VideosResponse };

type Settled =
  | { key: string; status: 'error'; error: VideosApiError }
  | { key: string; status: 'success'; data: VideosResponse };

const keyOf = (q: VideosQuery) => JSON.stringify([q.platform, q.mode, q.q ?? '']);

// Fetches once per distinct query (pass null to fetch nothing); `retry` refetches.
// Loading is derived: it's whenever the last settled result is for a different request.
export function useVideos(query: VideosQuery | null): VideosState & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);
  const key = query ? `${keyOf(query)}#${attempt}` : null;

  useEffect(() => {
    if (!query || !key) return;
    const controller = new AbortController();
    fetchVideos(query, controller.signal)
      .then((data) => setSettled({ key, status: 'success', data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error =
          err instanceof VideosApiError
            ? err
            : new VideosApiError('upstream_error', ERROR_MESSAGES.upstream_error);
        setSettled({ key, status: 'error', error });
      });
    return () => controller.abort();
    // `key` captures everything in `query` that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const retry = () => setAttempt((n) => n + 1);
  if (!key) return { status: 'idle', retry };
  if (!settled || settled.key !== key) return { status: 'loading', retry };
  return settled.status === 'success'
    ? { status: 'success', data: settled.data, retry }
    : { status: 'error', error: settled.error, retry };
}
