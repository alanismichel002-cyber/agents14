import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeVideo } from '../test/fixtures';
import { VideoCard } from './VideoCard';

describe('VideoCard', () => {
  it('links to the original in a new tab, safely', () => {
    render(<VideoCard video={makeVideo()} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://www.tiktok.com/@creator/video/1');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleName(/Open on TikTok: A trending video/);
  });

  it('shows creator, caption, platform and compact stats', () => {
    render(<VideoCard video={makeVideo()} />);
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('A trending video')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
    expect(screen.getByTitle('Views: 1200000')).toHaveTextContent('1.2M');
    expect(screen.getByTitle('Likes: 34000')).toHaveTextContent('34K');
  });

  it('shows a dash for unknown stats and a placeholder when the thumbnail fails', () => {
    const { container } = render(
      <VideoCard video={makeVideo({ stats: { views: null, likes: 1, comments: 2 } })} />,
    );
    expect(screen.getByTitle('Views: unknown')).toHaveTextContent('–');
    const thumb = container.querySelector('img')!;
    expect(thumb).toHaveAttribute('referrerpolicy', 'no-referrer');
    fireEvent.error(thumb);
    expect(screen.getByText('No preview')).toBeInTheDocument();
  });

  it('renders captions as text, never HTML', () => {
    render(<VideoCard video={makeVideo({ caption: '<img src=x onerror=alert(1)>' })} />);
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  });
});
