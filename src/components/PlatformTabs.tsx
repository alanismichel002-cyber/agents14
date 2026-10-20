import { useRef, type KeyboardEvent } from 'react';
import { PLATFORMS, type Platform } from '../../shared/video';
import { PLATFORM_LABELS } from '../lib/platforms';

// An accessible tab list: arrow keys move between tabs, as in the WAI-ARIA tabs pattern.
export function PlatformTabs({
  value,
  onChange,
  panelId,
}: {
  value: Platform;
  onChange: (p: Platform) => void;
  panelId: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: KeyboardEvent) => {
    const i = PLATFORMS.indexOf(value);
    const next =
      e.key === 'ArrowRight'
        ? PLATFORMS[(i + 1) % PLATFORMS.length]
        : e.key === 'ArrowLeft'
          ? PLATFORMS[(i - 1 + PLATFORMS.length) % PLATFORMS.length]
          : null;
    if (next) {
      e.preventDefault();
      onChange(next);
      refs.current[next]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Platform"
      onKeyDown={onKeyDown}
      className="flex gap-1 overflow-x-auto rounded-xl bg-slate-200/70 p-1"
    >
      {PLATFORMS.map((p) => {
        const selected = p === value;
        return (
          <button
            key={p}
            ref={(el) => {
              refs.current[p] = el;
            }}
            role="tab"
            id={`tab-${p}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(p)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              selected ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {PLATFORM_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}
