import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the app title and the three platforms', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Trend Finder' })).toBeInTheDocument();
    expect(screen.getByText(/TikTok, Instagram Reels, YouTube Shorts/)).toBeInTheDocument();
  });
});
