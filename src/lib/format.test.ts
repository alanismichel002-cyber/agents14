import { describe, expect, it } from 'vitest';
import { formatCount, formatRelativeDate } from './format';

describe('formatCount', () => {
  it('uses compact notation', () => {
    expect(formatCount(1_234_567)).toBe('1.2M');
    expect(formatCount(34_000)).toBe('34K');
    expect(formatCount(560)).toBe('560');
    expect(formatCount(null)).toBe('–');
  });
});

describe('formatRelativeDate', () => {
  const now = Date.parse('2026-10-20T12:00:00Z');
  it('describes how long ago', () => {
    expect(formatRelativeDate('2026-10-19T12:00:00Z', now)).toBe('yesterday');
    expect(formatRelativeDate('2026-10-20T09:00:00Z', now)).toBe('3 hours ago');
    expect(formatRelativeDate('2026-10-06T12:00:00Z', now)).toBe('2 weeks ago');
    expect(formatRelativeDate('2026-10-20T11:59:30Z', now)).toBe('just now');
  });
  it('returns an empty string for missing or bad dates', () => {
    expect(formatRelativeDate(null, now)).toBe('');
    expect(formatRelativeDate('soon', now)).toBe('');
  });
});
