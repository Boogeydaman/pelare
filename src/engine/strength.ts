import { EXERCISES, EXERCISE_BY_ID, GYM_EQUIPMENT, type Exercise } from './exercises';
import { RULES } from './rules';
import type {
  BlockState, Equip, ExerciseLog, Feel, Joint, Location, Muscle, Pattern, PlannedExercise,
  Profile, SessionLog, StrengthPlan, StrengthTemplate,
} from './types';
import { DAY, roundTo, sortByDateDesc } from './util';

export const TEMPLATES: Record<StrengthTemplate, { title: string; slots: Pattern[] }> = {
  full: { title: 'Helkropp', slots: ['squat', 'hpush', 'vpull', 'hinge', 'hpull', 'lateral', 'core'] },
  upper: { title: 'Överkropp', slots: ['hpush', 'vpull', 'vpush', 'hpull', 'chest_iso', 'lateral', 'triceps', 'biceps', 'rear_delt'] },
  lower: { title: 'Underkropp', slots: ['squat', 'hinge', 'lunge', 'knee_flexion', 'glute', 'calf', 'core'] },
};

export const LEG_PATTERNS: Pattern[] = ['squat', 'hinge', 'lunge'];
export const MAIN_PATTERNS: Pattern[] = ['squat', 'hinge', 'hpush', 'vpull', 'vpush', 'hpull'];

/** Muscles that get a weekly set target (others are trained indirectly). */
export const TARGET_MUSCLES: Muscle[] = [
  'chest', 'upper_back', 'lats', 'front_delt', 'side_delt', 'rear_delt', 'biceps', 'triceps',
  'abs', 'glutes', 'quads', 'hamstrings', 'calves',
];

export function weeklyTarget(profile: Profile): number {
  const v = RULES.weeklySets.value;
  return profile.level === 'beginner' ? v.beginner : v.intermediate;
}

export function equipmentAt(profile: Profile, location: Location): Equip[] {
  return location === 'gym' ? GYM_EQUIPMENT : profile.homeEquipment;
}

export function painBlocks(ex: Exercise, pain: Joint[]): boolean {
  const limit = RULES.pain.value.excludeLoadAtLeast;
  return pain.some((j) => (ex.load[j] ?? 0) >= limit);
}

export function candidatesFor(pattern: Pattern, equip: Equip[]): Exercise[] {
  return EXERCISES.filter((e) => e.pattern === pattern && e.needs.every((n) => equip.includes(n)));
}

export function ensureBlock(block: BlockState | undefined, now: Date): BlockState {
  const weeks = RULES.variation.value.blockWeeks;
  if (!block) return { startDate: now.toISOString(), index: 0, picks: {} };
  const age = (now.getTime() - new Date(block.startDate).getTime()) / DAY;
  if (age >= weeks * 7) return { startDate: now.toISOString(), index: block.index + 1, picks: {} };
  return block;
}

/** Picks the block's fixed exercise for a pattern; substitutes (without changing the block) when pain blocks it. */
export function pickExercise(
  block: BlockState, location: Location, pattern: Pattern, equip: Equip[], pain: Joint[],
): { ex: Exercise | null; substituted: boolean } {
  const cands = candidatesFor(pattern, equip);
  if (cands.length === 0) return { ex: null, substituted: false };
  const key = `${location}:${pattern}`;
  let pickId = block.picks[key];
  if (!pickId || !cands.some((c) => c.id === pickId)) {
    const pool = cands.slice(0, Math.min(RULES.variation.value.rotateAmong, cands.length));
    pickId = pool[block.index % pool.length].id;
    block.picks[key] = pickId;
  }
  const picked = EXERCISE_BY_ID[pickId];
  if (!painBlocks(picked, pain)) return { ex: picked, substituted: false };
  const alt = cands.find((c) => !painBlocks(c, pain));
  return { ex: alt ?? null, substituted: !!alt };
}

const FEEL_RIR: Record<Feel, number> = { latt: 4, lagom: 2, tungt: 0 };

export function e1rm(kg: number, reps: number, rir = 2): number {
  return kg * (1 + (reps + rir) / 30);
}

export function bestE1rm(log: ExerciseLog): number {
  const rir = log.feel ? FEEL_RIR[log.feel] : 2;
  return Math.max(0, ...log.sets.filter((s) => s.done && s.kg > 0).map((s) => e1rm(s.kg, s.reps, rir)));
}

/** All logs for an exercise, newest first, excluding deload sessions. */
export function exerciseHistory(sessions: SessionLog[], exerciseId: string): { date: string; log: ExerciseLog }[] {
  const out: { date: string; log: ExerciseLog }[] = [];
  for (const s of sortByDateDesc(sessions)) {
    if (!s.strength || s.deload) continue;
    const log = s.strength.exercises.find((e) => e.exerciseId === exerciseId);
    if (log && log.sets.some((x) => x.done)) out.push({ date: s.date, log });
  }
  return out;
}

function failed(log: ExerciseLog): boolean {
  const done = log.sets.filter((s) => s.done);
  return log.feel === 'tungt' || done.length < log.sets.length || done.some((s) => s.reps < log.repRange[0]);
}

/** Double progression. Returns next load, prefill reps and a short note. */
export function nextLoad(
  ex: Exercise, sessions: SessionLog[], repRange: [number, number],
): { kg: number | null; reps: number; note?: string } {
  const hist = exerciseHistory(sessions, ex.id);
  const [lo, hi] = repRange;
  if (hist.length === 0) {
    if (ex.bodyweight) return { kg: 0, reps: lo, note: 'Första gången: hitta en nivå där du har 2–3 reps kvar.' };
    return { kg: null, reps: lo, note: `Kalibrering: välj en vikt du klarar ungefär ${hi} gånger, med 2–3 reps kvar.` };
  }
  const last = hist[0].log;
  const done = last.sets.filter((s) => s.done);
  const lastKg = Math.max(...done.map((s) => s.kg));
  const lastReps = Math.min(...done.map((s) => s.reps));
  const allTop = done.length === last.sets.length && done.every((s) => s.reps >= hi) && last.feel !== 'tungt';
  if (allTop) {
    if (ex.increment > 0) return { kg: lastKg + ex.increment, reps: lo, note: `+${ex.increment} kg – alla set nådde ${hi} reps.` };
    return { kg: lastKg, reps: Math.min(hi + 5, lastReps + 1), note: 'Alla set nådde toppen – prova en svårare variant eller långsammare tempo.' };
  }
  if (failed(last) && hist[1] && failed(hist[1].log) && ex.increment > 0) {
    const drop = RULES.progression.value.dropPct;
    const kg = Math.max(ex.increment, roundTo(lastKg * (1 - drop), ex.increment));
    return { kg, reps: lo, note: 'Två tunga pass i rad – vikten sänks lite så att du kan bygga upp igen.' };
  }
  if (failed(last)) return { kg: lastKg, reps: Math.max(lo, lastReps), note: 'Samma vikt som förra gången.' };
  return { kg: lastKg, reps: Math.min(hi, lastReps + 1), note: `Sikta på ${Math.min(hi, lastReps + 1)} reps.` };
}

export interface DeloadStatus { active: boolean; start?: string; reason?: 'performance' | 'interval' }

/** Main lifts whose estimated max dropped in each of the last two sessions. */
export function decliningLifts(sessions: SessionLog[]): string[] {
  const mains = new Set<string>();
  for (const s of sessions) s.strength?.exercises.forEach((e) => e.isMain && mains.add(e.exerciseId));
  const out: string[] = [];
  for (const id of mains) {
    const h = exerciseHistory(sessions, id).slice(0, 3).map((x) => bestE1rm(x.log));
    if (h.length === 3 && h[0] < h[1] && h[1] < h[2]) out.push(id);
  }
  return out;
}

export function deloadStatus(
  profile: Profile, sessions: SessionLog[], deloadStart: string | undefined, now: Date, tired: boolean,
): DeloadStatus {
  const cfg = RULES.deload.value;
  if (deloadStart && now.getTime() - new Date(deloadStart).getTime() < cfg.lengthDays * DAY) {
    return { active: true, start: deloadStart };
  }
  if (tired && decliningLifts(sessions).length > 0) {
    return { active: true, start: now.toISOString(), reason: 'performance' };
  }
  const since = deloadStart ?? profile.createdAt;
  const strengthCount = sessions.filter((s) => s.strength && s.date > since).length;
  if (strengthCount >= 6 && now.getTime() - new Date(since).getTime() >= cfg.maxWeeks * 7 * DAY) {
    return { active: true, start: now.toISOString(), reason: 'interval' };
  }
  return { active: false };
}

export interface StrengthContext {
  profile: Profile;
  sessions: SessionLog[];
  block: BlockState;
  now: Date;
  location: Location;
  pain: Joint[];
  timeMin: number;
  readiness: Record<Muscle, number>;
  deficit: Record<Muscle, number>;
  deload: boolean;
}

export interface StrengthBuild {
  plan: StrengthPlan;
  skippedNotReady: Muscle[];
  substituted: string[];
  muscles: Muscle[];
}

function isBeginnerPhase(profile: Profile, now: Date): boolean {
  if (profile.level !== 'beginner') return false;
  const weeks = (now.getTime() - new Date(profile.createdAt).getTime()) / (7 * DAY);
  return weeks < RULES.rir.value.beginnerWeeks;
}

export function estimateMinutes(plan: Pick<StrengthPlan, 'exercises' | 'warmup' | 'supersets'>): number {
  const r = RULES.rest.value;
  const w = RULES.warmup.value;
  let sec = plan.warmup.generalMin * 60 + (plan.warmup.ramp.length ? w.rampMin * 60 : 0);
  for (const e of plan.exercises) {
    const rest = plan.supersets ? r.minSec : e.restSec;
    sec += e.sets * (r.workSec + rest);
  }
  return Math.ceil(sec / 60);
}

export function buildStrength(template: StrengthTemplate, ctx: StrengthContext): StrengthBuild | null {
  const { profile, sessions, block, location, pain, readiness: R, deficit, deload } = ctx;
  const equip = equipmentAt(profile, location);
  const rr = RULES.repRanges.value;
  const rirCfg = RULES.rir.value;
  const rest = RULES.rest.value;
  const ready = RULES.fatigue.value.readyHard;
  const cap = RULES.sessionCap.value.maxSetsPerMuscle;
  const beginnerExtra = isBeginnerPhase(profile, ctx.now) ? rirCfg.beginnerExtra : 0;

  const exercises: PlannedExercise[] = [];
  const skipped = new Set<Muscle>();
  const substituted: string[] = [];
  const sessionSets: Partial<Record<Muscle, number>> = {};

  for (const pattern of TEMPLATES[template].slots) {
    const { ex, substituted: sub } = pickExercise(block, location, pattern, equip, pain);
    if (!ex) continue;
    const notReady = ex.primary.filter((m) => R[m] < ready);
    if (notReady.length) { notReady.forEach((m) => skipped.add(m)); continue; }

    const isMain = MAIN_PATTERNS.includes(pattern);
    const unit = ex.unit ?? 'reps';
    const repRange: [number, number] = unit === 'sek' ? rr.coreSec
      : ex.compound ? (profile.level === 'beginner' ? rr.beginnerCompound : rr.compound) : rr.isolation;
    const lowDeficit = ex.primary.every((m) => (deficit[m] ?? 0) < 2);
    let sets = isMain ? 3 : lowDeficit ? 2 : 3;
    if (deload) sets = Math.max(1, Math.round(sets * RULES.deload.value.volumeFactor));
    const room = Math.min(...ex.primary.map((m) => cap - (sessionSets[m] ?? 0)));
    sets = Math.min(sets, room);
    if (sets <= 0) continue;
    ex.primary.forEach((m) => (sessionSets[m] = (sessionSets[m] ?? 0) + sets));

    const targetRir = (ex.compound ? rirCfg.compound : rirCfg.isolation) + beginnerExtra + (deload ? RULES.deload.value.rirExtra : 0);
    const load = nextLoad(ex, sessions, repRange);
    if (sub) substituted.push(ex.name);
    exercises.push({
      exerciseId: ex.id, name: ex.name, sets, repRange, unit, targetRir,
      kg: load.kg, prefillReps: load.reps, note: deload ? 'Lätt vecka: samma vikt, färre set, mer marginal.' : load.note,
      restSec: ex.compound ? rest.compoundSec : rest.isolationSec, isMain, bodyweight: ex.bodyweight, increment: ex.increment,
    });
  }

  if (template === 'full' && !exercises.some((e) => LEG_PATTERNS.includes(EXERCISE_BY_ID[e.exerciseId].pattern))) return null;
  if (template === 'lower' && !exercises.some((e) => LEG_PATTERNS.includes(EXERCISE_BY_ID[e.exerciseId].pattern))) return null;

  // Heavy compounds first.
  exercises.sort((a, b) => Number(b.isMain) - Number(a.isMain));

  const first = exercises[0];
  const plan: StrengthPlan = {
    kind: 'strength', template, deload, supersets: ctx.timeMin < rest.supersetBelowMin,
    warmup: {
      generalMin: RULES.warmup.value.generalMin,
      ramp: first && !first.bodyweight && first.isMain ? RULES.warmup.value.ramp : [],
    },
    exercises, minutes: 0,
  };

  // Trim until it fits: accessory sets → main sets → drop last exercise.
  let guard = 0;
  while (estimateMinutes(plan) > ctx.timeMin && guard++ < 60) {
    const acc = [...plan.exercises].reverse().find((e) => !e.isMain && e.sets > 2);
    if (acc) { acc.sets--; continue; }
    const lastAcc = [...plan.exercises].reverse().find((e) => !e.isMain);
    if (lastAcc && plan.exercises.length > 3) { plan.exercises.splice(plan.exercises.lastIndexOf(lastAcc), 1); continue; }
    const main = [...plan.exercises].reverse().find((e) => e.isMain && e.sets > 2);
    if (main) { main.sets--; continue; }
    if (plan.exercises.length > 2) { plan.exercises.pop(); continue; }
    if (plan.warmup.ramp.length) { plan.warmup.ramp = []; continue; }
    if (!plan.supersets) { plan.supersets = true; continue; }
    const any = [...plan.exercises].reverse().find((e) => e.sets > 1);
    if (any) { any.sets--; continue; }
    break;
  }
  plan.minutes = estimateMinutes(plan);
  if (plan.exercises.length < 2 || plan.minutes > ctx.timeMin) return null;
  if (plan.supersets) plan.exercises.forEach((e) => (e.restSec = rest.minSec));

  const muscles = Array.from(new Set(plan.exercises.flatMap((e) => EXERCISE_BY_ID[e.exerciseId].primary)));
  return { plan, skippedNotReady: [...skipped], substituted, muscles };
}

export function isHardLegSession(s: SessionLog): boolean {
  if (!s.strength || s.deload) return false;
  return s.strength.exercises.some((e) => {
    const ex = EXERCISE_BY_ID[e.exerciseId];
    return ex && LEG_PATTERNS.includes(ex.pattern) && e.sets.some((x) => x.done) && e.feel !== 'latt';
  });
}
