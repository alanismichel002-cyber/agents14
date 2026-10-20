import type { ReactNode } from 'react';

export function StateMessage({
  title,
  children,
  tone = 'neutral',
  action,
}: {
  title: string;
  children?: ReactNode;
  tone?: 'neutral' | 'error';
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={`rounded-xl border p-8 text-center ${
        tone === 'error' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'
      }`}
    >
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {children && <p className="mt-1 text-slate-600">{children}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
