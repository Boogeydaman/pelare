import { RULES } from './rules';
import type { Profile, RunKind, RunPlan, RunStep, SessionLog } from './types';
import { sortByDateDesc, within } from './util';

export interface Guard { maxMin: number; maxKm?: number; longestMin: number; longestKm?: number; assumed: boolean }

/** running.spike_guard: no run more than 10 % longer than the longest of the last 30 days. */
export function spikeGuard(profile: Profile, sessions: SessionLog[], now: Date): Guard {
  const g = RULES.spikeGuard.value;
  const runs = within(sessions, now, g.days).filter((s) => s.run);
  if (runs.length === 0) {
    const assumed = g.assumedLongest[profile.runLevel] ?? 20;
    return { maxMin: assumed * g.factor, longestMin: assumed, assumed: true };
  }
  const longestMin = Math.max(...runs.map((s) => s.run!.minutes));
  const kms = runs.map((s) => s.run!.distanceKm).filter((k): k is number => !!k && k > 0);
  const longestKm = kms.length ? Math.max(...kms) : undefined;
  return {
    maxMin: longestMin * g.factor, longestMin,
    maxKm: longestKm !== undefined ? longestKm * g.factor : undefined, longestKm, assumed: false,
  };
}

/** Average pace (min/km) from logged runs with distance, or undefined. */
export function pace(sessions: SessionLog[]): number | undefined {
  const runs = sortByDateDesc(sessions).filter((s) => s.run?.distanceKm && s.run.distanceKm > 0).slice(0, 6);
  if (!runs.length) return undefined;
  const min = runs.reduce((a, s) => a + s.run!.minutes, 0);
  const km = runs.reduce((a, s) => a + s.run!.distanceKm!, 0);
  return min / km;
}

/** Next walk-run stage, or 'done' when the program is finished (or not needed). */
export function walkRunStage(profile: Profile, sessions: SessionLog[]): number | 'done' {
  const stages = RULES.walkRun.value.stages;
  const last = sortByDateDesc(sessions).find((s) => s.run?.kind === 'walk_run');
  if (!last) return profile.runLevel === 'none' ? 0 : 'done';
  const stage = last.run!.stage ?? 0;
  const next = last.run!.feel === 'tungt' ? stage : stage + 1;
  return next >= stages.length ? 'done' : next;
}

function total(steps: RunStep[]): number {
  return steps.reduce((a, s) => a + s.minutes, 0);
}

function capMinutes(minutes: number, guard: Guard, p: number | undefined): number {
  let m = Math.min(minutes, guard.maxMin);
  if (guard.maxKm !== undefined && p) m = Math.min(m, guard.maxKm * p);
  return Math.floor(m);
}

const EASY_TEXT = 'Pratbart tempo – du ska kunna prata i hela meningar. Zon 2.';

export function buildRun(
  kind: RunKind, profile: Profile, sessions: SessionLog[], now: Date, timeMin: number,
): RunPlan | null {
  const guard = spikeGuard(profile, sessions, now);
  const p = pace(sessions);
  const easyCfg = RULES.easyRun.value;
  const est = (min: number) => (p ? Math.round((min / p) * 10) / 10 : undefined);

  if (kind === 'walk_run') {
    const stage = walkRunStage(profile, sessions);
    if (stage === 'done') return null;
    const st = RULES.walkRun.value.stages[stage];
    const warm = RULES.walkRun.value.warmupWalkMin;
    let reps = st.reps;
    const build = (n: number): RunStep[] => {
      const steps: RunStep[] = [{ label: 'Rask promenad', minutes: warm, intensity: 'gå' }];
      for (let i = 0; i < n; i++) {
        steps.push({ label: `Spring ${i + 1}/${n}`, minutes: st.run, intensity: 'lätt' });
        if (st.walk > 0 && i < n - 1) steps.push({ label: 'Gå', minutes: st.walk, intensity: 'gå' });
      }
      steps.push({ label: 'Gå ner i varv', minutes: 3, intensity: 'gå' });
      return steps;
    };
    let steps = build(reps);
    while (total(steps) > timeMin && reps > 2) steps = build(--reps);
    if (total(steps) > timeMin) return null;
    return { kind: 'run', runKind: 'walk_run', steps, minutes: total(steps), stage, intensityText: 'Spring så lugnt att du kan prata. Gångpauserna är en del av passet.' };
  }

  if (kind === 'easy') {
    const base = guard.assumed ? guard.longestMin : Math.max(easyCfg.minMin, guard.longestMin * easyCfg.shareOfLongest);
    const minutes = Math.min(capMinutes(base, guard, p), timeMin);
    if (minutes < 15) return null;
    return { kind: 'run', runKind: 'easy', steps: [{ label: 'Lugn löpning', minutes, intensity: 'lätt' }], minutes, estKm: est(minutes), intensityText: EASY_TEXT };
  }

  if (kind === 'long') {
    if (guard.assumed) return null;
    const easyMin = Math.max(easyCfg.minMin, guard.longestMin * easyCfg.shareOfLongest);
    const minutes = Math.min(capMinutes(guard.maxMin, guard, p), timeMin);
    if (minutes < easyMin * easyCfg.longVsEasy || minutes < 30) return null;
    return { kind: 'run', runKind: 'long', steps: [{ label: 'Långpass, lugnt', minutes, intensity: 'lätt' }], minutes, estKm: est(minutes), intensityText: 'Lugnt hela vägen – långpasset bygger uthållighet, inte fart.' };
  }

  // Intervals
  const cfg = RULES.intervals.value;
  const intervalsDone = sessions.filter((s) => s.run?.kind === 'interval').length;
  const beginner = profile.runLevel !== 'regular' && intervalsDone < 4;
  const work = beginner ? cfg.beginnerWorkMin : cfg.workMin;
  const rest = beginner ? cfg.beginnerRestMin : cfg.restMin;
  const build = (n: number, warm: number): RunStep[] => {
    const steps: RunStep[] = [{ label: 'Uppvärmning, lugn jogg', minutes: warm, intensity: 'lätt' }];
    for (let i = 0; i < n; i++) {
      steps.push({ label: `Intervall ${i + 1}/${n}`, minutes: work, intensity: 'hårt' });
      if (i < n - 1) steps.push({ label: 'Lugn jogg', minutes: rest, intensity: 'vila' });
    }
    steps.push({ label: 'Nedjogg', minutes: cfg.cooldownMin, intensity: 'lätt' });
    return steps;
  };
  const limit = Math.min(timeMin, capMinutes(guard.maxMin, guard, p));
  let reps = cfg.reps;
  let warm = cfg.warmupMin;
  let steps = build(reps, warm);
  while (total(steps) > limit && warm > 5) steps = build(reps, (warm = 5));
  while (total(steps) > limit && reps > 2) steps = build(--reps, warm);
  if (total(steps) > limit) return null;
  return {
    kind: 'run', runKind: 'interval', steps, minutes: total(steps),
    intensityText: `Intervallerna ska vara hårda: 90–95 % av maxpuls, ungefär 8 av 10 i ansträngning. ${work} min per intervall.`,
  };
}

export const RUN_TITLES: Record<RunKind, string> = {
  walk_run: 'Gå-spring', easy: 'Lugn löprunda', interval: 'Intervaller', long: 'Långpass',
};

export function isHardRun(kind: RunKind): boolean {
  return kind === 'interval' || kind === 'long';
}
