import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeResponse } from './test/fixtures';
import App from './App';

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('renders the title and the trending view', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json(makeResponse()))),
    );
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Trend Finder' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Trending now' })).toBeInTheDocument();
    expect(await screen.findByText('A trending video')).toBeInTheDocument();
  });
});
