// Pace zones and race estimates from your own runs.
// Zones relative to 5 km race pace follow the usual training-pace tables (Daniels' VDOT): easy runs
// clearly slower than race pace, tempo just slower, intervals around 5 km pace (H). Race estimates
// use Riegel's formula T2 = T1 × (D2/D1)^1.06.
import type { ModuleCtx } from '../types';
import { km, runs } from './planner';

export type Zone = [number, number]; // seconds per km, [fastest, slowest]
export interface Zones { easy: Zone; tempo: Zone; interval: Zone; p5: number; source: string }

/** 5 km pace (s/km) from the latest 5 km test, else from the best GPS run of 3 km or more in 90 days. */
export function fiveKPace(ctx: ModuleCtx): { p5: number; source: string } | null {
  const tests = ctx.tests.filter((t) => t.testId === '5k' && t.value > 10);
  const lastTest = tests[tests.length - 1];
  const recentTest = lastTest && ctx.now.getTime() - new Date(lastTest.date).getTime() < 120 * 864e5;
  if (recentTest) return { p5: (lastTest.value * 60) / 5, source: 'ditt senaste 5 km-test' };
  const best = runs(ctx.logs)
    .filter((l) => km(l) >= 3 && ctx.now.getTime() - new Date(l.startedAt).getTime() < 90 * 864e5 && l.type !== 'walkrun')
    .map((l) => {
      // Logged minutes include the walk in and out; count the running part (~90 %).
      const sec = l.minutes * 60 * 0.9;
      return riegel(sec, km(l), 5) / 5;
    })
    .sort((a, b) => a - b)[0];
  if (best && best > 150 && best < 720) return { p5: best, source: 'dina GPS-rundor (uppskattat)' };
  return null;
}

export function paceZones(ctx: ModuleCtx): Zones | null {
  const f = fiveKPace(ctx);
  if (!f) return null;
  const { p5 } = f;
  return { p5, source: f.source, easy: [p5 * 1.18, p5 * 1.32], tempo: [p5 * 1.05, p5 * 1.12], interval: [p5 * 0.97, p5 * 1.03] };
}

/** Riegel: time for a new distance from a known time (seconds). */
export const riegel = (sec: number, fromKm: number, toKm: number) => sec * Math.pow(toKm / fromKm, 1.06);

export const fmtPaceS = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
export const fmtTime = (sec: number) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.round(sec % 60);
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};

/** Where a pace sits against a zone: -1 … 1 inside, beyond that outside. Negative = faster than the zone. */
export function zonePosition(pace: number, z: Zone): number {
  const mid = (z[0] + z[1]) / 2, half = (z[1] - z[0]) / 2;
  return (pace - mid) / half;
}
