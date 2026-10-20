import { useMemo, useState } from 'react';
import { ResultsPanel } from '../components/ResultsPanel';
import { SearchBar } from '../components/SearchBar';
import { isHashtag, type SearchInput } from '../lib/search';
import { SortMenu } from '../components/SortMenu';
import { StateMessage } from '../components/StateMessage';
import { useVideos } from '../hooks/useVideos';
import { sortVideos, type Sort } from '../lib/sort';

export function SearchView({
  search,
  onSearch,
}: {
  search: SearchInput | null;
  onSearch: (s: SearchInput) => void;
}) {
  const [sort, setSort] = useState<Sort>('top');
  const query = useMemo(
    () =>
      search
        ? {
            platform: search.platform,
            mode: isHashtag(search.text) ? ('hashtag' as const) : ('keyword' as const),
            q: search.text,
          }
        : null,
    [search],
  );
  const { retry, ...state } = useVideos(query);

  return (
    <section aria-labelledby="search-heading" className="space-y-5">
      <div>
        <h2 id="search-heading" className="text-2xl font-semibold tracking-tight">
          Search
        </h2>
        <p className="mt-1 text-slate-600">
          Find videos by keyword or #hashtag on one platform or all three.
        </p>
      </div>
      <SearchBar
        // Remount when the search changes from outside (e.g. a shared link).
        key={search ? `${search.platform}|${search.text}` : 'empty'}
        initial={search ?? { platform: 'all', text: '' }}
        onSearch={onSearch}
        busy={state.status === 'loading'}
      />
      {search ? (
        <>
          <div className="flex justify-end">
            <SortMenu id="search-sort" value={sort} onChange={setSort} />
          </div>
          <ResultsPanel
            state={state}
            retry={retry}
            emptyTitle={`No videos found for “${search.text}”`}
            emptyHint="Try a broader keyword, a different hashtag, or another platform."
            arrange={(videos) => sortVideos(videos, sort)}
          />
        </>
      ) : (
        <StateMessage title="Search across TikTok, Instagram and YouTube">
          Try “skincare”, “#booktok” or “street food”.
        </StateMessage>
      )}
    </section>
  );
}
