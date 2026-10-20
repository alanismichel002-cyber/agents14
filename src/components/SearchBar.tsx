import { useState, type FormEvent } from 'react';
import { PLATFORMS, type Platform } from '../../shared/video';
import { PLATFORM_SHORT_LABELS } from '../lib/platforms';
import { MAX_QUERY_LENGTH, isHashtag, validateSearch, type SearchInput } from '../lib/search';

export function SearchBar({
  initial,
  onSearch,
  busy,
}: {
  initial: SearchInput;
  onSearch: (s: SearchInput) => void;
  busy: boolean;
}) {
  const [text, setText] = useState(initial.text);
  const [platform, setPlatform] = useState<Platform | 'all'>(initial.platform);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const problem = validateSearch(text);
    setError(problem);
    if (!problem) onSearch({ platform, text: text.trim() });
  };

  return (
    <form role="search" onSubmit={submit} className="space-y-2" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="search-text" className="sr-only">
          Keyword or hashtag
        </label>
        <input
          id="search-text"
          type="search"
          value={text}
          maxLength={MAX_QUERY_LENGTH + 1}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search a keyword or #hashtag"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby="search-help"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        />
        <div className="flex gap-2">
          <label htmlFor="search-platform" className="sr-only">
            Platform
          </label>
          <select
            id="search-platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform | 'all')}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 sm:flex-none"
          >
            <option value="all">All platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_SHORT_LABELS[p]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-rose-600 px-5 py-2.5 font-medium text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            Search
          </button>
        </div>
      </div>
      <p id="search-help" className={`text-sm ${error ? 'text-rose-700' : 'text-slate-500'}`}>
        {error ??
          (isHashtag(text)
            ? 'Searching posts tagged with this hashtag.'
            : 'Tip: start with # to search a hashtag.')}
      </p>
    </form>
  );
}
