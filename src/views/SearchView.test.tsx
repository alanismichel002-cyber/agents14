import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SearchInput } from '../lib/search';
import { makeResponse, makeVideo } from '../test/fixtures';
import { SearchView } from './SearchView';

function Harness() {
  const [search, setSearch] = useState<SearchInput | null>(null);
  return <SearchView search={search} onSearch={setSearch} />;
}

const ok = (body: unknown) => Promise.resolve(Response.json(body));

describe('SearchView', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not call the API until a search is submitted', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<Harness />);
    expect(screen.getByText(/Search across TikTok, Instagram and YouTube/)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('runs a keyword search across all platforms', async () => {
    const fetchSpy = vi.fn(() => ok(makeResponse({ mode: 'keyword' })));
    vi.stubGlobal('fetch', fetchSpy);
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('Keyword or hashtag'), 'street food{Enter}');
    expect(await screen.findByText('A trending video')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/videos?platform=all&mode=keyword&q=street+food',
      expect.anything(),
    );
  });

  it('treats # as a hashtag search on the chosen platform', async () => {
    const fetchSpy = vi.fn(() => ok(makeResponse({ mode: 'hashtag' })));
    vi.stubGlobal('fetch', fetchSpy);
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('Keyword or hashtag'), '#booktok');
    expect(screen.getByText(/Searching posts tagged/)).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Platform'), 'instagram');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await screen.findByText('A trending video');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/videos?platform=instagram&mode=hashtag&q=%23booktok',
      expect.anything(),
    );
  });

  it.each([
    ['', 'Type a keyword or a #hashtag.'],
    ['#two words', 'Hashtags can’t contain spaces.'],
    ['x'.repeat(101), 'Keep it under 100 characters.'],
  ])('rejects %j before calling the API', async (text, message) => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<Harness />);
    if (text) await userEvent.type(screen.getByLabelText('Keyword or hashtag'), text);
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText('Keyword or hashtag')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows partial results with a notice when a platform fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        ok(
          makeResponse({
            videos: [makeVideo({ platform: 'youtube' })],
            errors: [{ platform: 'instagram', code: 'timeout', message: 'Too slow.' }],
          }),
        ),
      ),
    );
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('Keyword or hashtag'), 'cats{Enter}');
    expect(
      await screen.findByText(/Some results are missing: Instagram \(Too slow\.\)/),
    ).toBeInTheDocument();
    expect(screen.getByText('A trending video')).toBeInTheDocument();
  });

  it('shows an empty state naming the query', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => ok(makeResponse({ videos: [] }))),
    );
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('Keyword or hashtag'), 'zzzz{Enter}');
    expect(await screen.findByText('No videos found for “zzzz”')).toBeInTheDocument();
  });
});
