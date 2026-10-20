import { SORTS, SORT_LABELS, type Sort } from '../lib/sort';

export function SortMenu({
  value,
  onChange,
  id,
}: {
  value: Sort;
  onChange: (s: Sort) => void;
  id: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={id} className="text-slate-600">
        Sort by
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as Sort)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {SORT_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
