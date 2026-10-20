import { useState } from 'react';
import { LabeledSelect } from '../components/LabeledSelect';
import type { Video } from '../../shared/video';
import {
  filterVideos,
  MIN_VIEWS,
  MIN_VIEWS_LABELS,
  NO_FILTERS,
  POSTED_WITHIN,
  POSTED_WITHIN_LABELS,
  type Filters,
  type MinViews,
  type PostedWithin,
} from '../lib/filters';
import { SORTS, SORT_LABELS, sortVideos, type Sort } from '../lib/sort';

// Sorting and filtering happen in the browser on the results already loaded,
// so changing them never costs API credits.
export function useResultControls(idPrefix: string) {
  const [sort, setSort] = useState<Sort>('top');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  const controls = (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
      <LabeledSelect<MinViews>
        id={`${idPrefix}-views`}
        label="Views"
        value={filters.minViews}
        options={MIN_VIEWS}
        labels={MIN_VIEWS_LABELS}
        onChange={(minViews) => setFilters((f) => ({ ...f, minViews }))}
      />
      <LabeledSelect<PostedWithin>
        id={`${idPrefix}-posted`}
        label="Posted"
        value={filters.postedWithin}
        options={POSTED_WITHIN}
        labels={POSTED_WITHIN_LABELS}
        onChange={(postedWithin) => setFilters((f) => ({ ...f, postedWithin }))}
      />
      <LabeledSelect<Sort>
        id={`${idPrefix}-sort`}
        label="Sort by"
        value={sort}
        options={SORTS}
        labels={SORT_LABELS}
        onChange={setSort}
      />
    </div>
  );

  const arrange = (videos: Video[]) => sortVideos(filterVideos(videos, filters), sort);
  const filtered = filters.minViews > 0 || filters.postedWithin !== 'any';
  return { controls, arrange, filtered, clearFilters: () => setFilters(NO_FILTERS) };
}
