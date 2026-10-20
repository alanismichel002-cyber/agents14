import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeResponse } from './test/fixtures';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json(makeResponse()))),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('starts on the trending view', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Trend Finder' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Trending now' })).toBeInTheDocument();
    expect(await screen.findByText('A trending video')).toBeInTheDocument();
  });

  it('switches to search and keeps the search in the URL', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('heading', { name: 'Search' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Keyword or hashtag'), '#skincare{Enter}');
    await screen.findByText('A trending video');
    expect(window.location.search).toBe('?view=search&q=%23skincare&p=all');
  });

  it('opens a shared search link directly', async () => {
    window.history.replaceState(null, '', '/?view=search&q=cats&p=youtube');
    render(<App />);
    expect(screen.getByLabelText('Keyword or hashtag')).toHaveValue('cats');
    expect(screen.getByLabelText('Platform')).toHaveValue('youtube');
    await screen.findByText('A trending video');
    expect(fetch).toHaveBeenCalledWith(
      '/api/videos?platform=youtube&mode=keyword&q=cats',
      expect.anything(),
    );
  });

  it('remembers the trending tab in the URL', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('tab', { name: 'YouTube Shorts' }));
    expect(window.location.search).toBe('?p=youtube');
  });
});
