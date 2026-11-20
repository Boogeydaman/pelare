import { EXERCISE_BY_ID } from './exercises';
import { RULES } from './rules';
import type { Muscle, SessionLog } from './types';
import { hoursSince, within } from './util';

export const MUSCLES: Muscle[] = [
  'chest', 'upper_back', 'lats', 'front_delt', 'side_delt', 'rear_delt', 'biceps', 'triceps',
  'forearms', 'abs', 'lower_back', 'glutes', 'quads', 'hamstrings', 'adductors', 'calves',
];

export const LEG_MUSCLES: Muscle[] = ['quads', 'hamstrings', 'glutes', 'calves'];

const zero = (): Record<Muscle, number> =>
  Object.fromEntries(MUSCLES.map((m) => [m, 0])) as Record<Muscle, number>;

/** Fatigue per muscle: sum(set weight × proximity × e^(−Δt/τ)). */
export function muscleFatigue(sessions: SessionLog[], now: Date): Record<Muscle, number> {
  const f = zero();
  const cfg = RULES.fatigue.value;
  for (const s of within(sessions, now, 10)) {
    const dt = Math.max(0, hoursSince(s.date, now));
    if (s.strength) {
      for (const e of s.strength.exercises) {
        const ex = EXERCISE_BY_ID[e.exerciseId];
        if (!ex) continue;
        const done = e.sets.filter((x) => x.done).length;
        const prox = cfg.proximity[e.feel ?? 'unknown'] * (s.deload ? 0.6 : 1);
        for (const m of ex.primary) f[m] += done * prox * Math.exp(-dt / cfg.tauH[m]);
        for (const m of ex.secondary) f[m] += done * 0.5 * prox * Math.exp(-dt / cfg.tauH[m]);
      }
    }
    if (s.run) {
      const hard = s.run.kind === 'interval' || s.run.kind === 'long';
      let per15 = hard && s.run.kind === 'interval' ? cfg.runPer15.hard : cfg.runPer15.easy;
      if (s.run.kind === 'long') per15 *= cfg.runPer15.longFactor;
      const eq = (s.run.minutes / 15) * per15;
      for (const m of LEG_MUSCLES) f[m] += eq * Math.exp(-dt / cfg.tauH[m]);
    }
  }
  return f;
}

/** Recovery R = 1 − min(1, F / F_max) per muscle. */
export function readiness(sessions: SessionLog[], now: Date): Record<Muscle, number> {
  const f = muscleFatigue(sessions, now);
  const fMax = RULES.fatigue.value.fMax;
  return Object.fromEntries(MUSCLES.map((m) => [m, 1 - Math.min(1, f[m] / fMax)])) as Record<Muscle, number>;
}

/** Hard sets per muscle the last 7 days (secondary counts as 0.5). */
export function weeklySets(sessions: SessionLog[], now: Date): Record<Muscle, number> {
  const w = zero();
  const factor = RULES.weeklySets.value.secondaryFactor;
  for (const s of within(sessions, now, 7)) {
    if (!s.strength) continue;
    for (const e of s.strength.exercises) {
      const ex = EXERCISE_BY_ID[e.exerciseId];
      if (!ex) continue;
      const done = e.sets.filter((x) => x.done).length;
      for (const m of ex.primary) w[m] += done;
      for (const m of ex.secondary) w[m] += done * factor;
    }
  }
  return w;
}
