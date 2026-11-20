import type { SessionLog } from './types';

export const HOUR = 3600_000;
export const DAY = 24 * HOUR;

export function hoursSince(iso: string, now: Date): number {
  return (now.getTime() - new Date(iso).getTime()) / HOUR;
}

export function within(sessions: SessionLog[], now: Date, days: number): SessionLog[] {
  const from = now.getTime() - days * DAY;
  return sessions.filter((s) => {
    const t = new Date(s.date).getTime();
    return t >= from && t <= now.getTime();
  });
}

/** Local calendar day key, e.g. 2026-11-19. */
export function dayKey(d: Date | string): string {
  const x = typeof d === 'string' ? new Date(d) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function roundTo(v: number, step: number): number {
  if (step <= 0) return Math.round(v);
  return Math.round(v / step) * step;
}

export function sortByDateDesc(sessions: SessionLog[]): SessionLog[] {
  return [...sessions].sort((a, b) => b.date.localeCompare(a.date));
}
