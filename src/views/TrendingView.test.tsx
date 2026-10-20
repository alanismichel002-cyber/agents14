import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeResponse, makeVideo } from '../test/fixtures';
import { TrendingView } from './TrendingView';

const ok = (body: unknown) => Promise.resolve(Response.json(body));

describe('TrendingView', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('loads TikTok trending first, then switches platform', async () => {
    const fetchSpy = vi.fn((url: string) =>
      ok(
        makeResponse({
          videos: [
            makeVideo({
              id: url.includes('youtube') ? 'yt' : 'tt',
              caption: url.includes('youtube') ? 'A YouTube short' : 'A TikTok',
            }),
          ],
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchSpy);
    render(<TrendingView />);

    expect(screen.getByRole('status', { name: 'Loading videos' })).toBeInTheDocument();
    expect(await screen.findByText('A TikTok')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenLastCalledWith(
      '/api/videos?platform=tiktok&mode=trending',
      expect.anything(),
    );

    await userEvent.click(screen.getByRole('tab', { name: 'YouTube Shorts' }));
    expect(await screen.findByText('A YouTube short')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'YouTube Shorts' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('moves between tabs with the arrow keys', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => ok(makeResponse())),
    );
    render(<TrendingView />);
    screen.getByRole('tab', { name: 'TikTok' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Instagram Reels' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Instagram Reels' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('shows a friendly error and retries', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ error: { code: 'out_of_credits', message: 'x' } }, { status: 502 }),
      )
      .mockImplementation(() => ok(makeResponse()));
    vi.stubGlobal('fetch', fetchSpy);
    render(<TrendingView />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/out of credits/);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('A trending video')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('shows an empty state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => ok(makeResponse({ videos: [] }))),
    );
    render(<TrendingView />);
    expect(await screen.findByText('Nothing trending on TikTok right now')).toBeInTheDocument();
  });

  it('shows a network error when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('offline'))),
    );
    render(<TrendingView />);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Could not reach the server/),
    );
  });
});
