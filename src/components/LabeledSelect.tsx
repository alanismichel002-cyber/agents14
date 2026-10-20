const SELECT =
  'rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500';

export function LabeledSelect<T extends string | number>({
  id,
  label,
  value,
  options,
  labels,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-slate-600">
        {label}
      </label>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => onChange(options.find((o) => String(o) === e.target.value) ?? options[0]!)}
        className={SELECT}
      >
        {options.map((o) => (
          <option key={String(o)} value={String(o)}>
            {labels[o]}
          </option>
        ))}
      </select>
    </div>
  );
}
