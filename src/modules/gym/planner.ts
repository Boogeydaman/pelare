// Gym planner: picks exercises for the place, sets loads with double progression,
// climbs bodyweight ladders and tracks weekly volume per muscle.
import { fmtDate, weekStart } from '../../core/format';
import type { ExerciseResult, Goals, PlannedSession, Profile, SessionLog, StrengthItem } from '../../core/types';
import type { ModuleCtx } from '../types';
import { EX, MUSCLES, MUSCLE_NAME, type Exercise, type Muscle, type Need } from './exercises';
import { PROGRAMS, PROGRAM_BY_ID, type GymProgram, type SessionTemplate, type Slot } from './programs';

const ALL_NEEDS: Need[] = ['barbell', 'machine', 'cable', 'dumbbell', 'bench', 'pullup_bar', 'dip_bars', 'band'];

// ---------------------------------------------------------------- Rules used here (see docs/SPEC.md section 6)

/** strength.weekly_sets: 10–20 hard sets per muscle and week [1][2]; minimum dose 4–6 [11]. */
export function weeklyTarget(goal: Goals['gym']): number {
  return goal === 'muscle' ? 14 : goal === 'stronger' ? 10 : 6;
}
/** strength.session_cap: about 10 hard sets per muscle and session (H, [14]; Dr Mike: 10–12). */
export const SESSION_CAP = 10;
/** strength.progression: double progression, drop 7.5 % after two failed sessions (H). */
const DROP_PCT = 0.075;
/** Hours a muscle needs after a hard session before it is trained hard again (H; Dr Mike: never train sore muscles). */
const RECOVERY_H = 44;

// ---------------------------------------------------------------- Equipment

export function equipmentAt(profile: Profile, place: 'gym' | 'home' | 'travel'): Set<Need> {
  if (place === 'gym') return new Set(ALL_NEEDS);
  if (place === 'travel') return new Set();
  const map: Record<string, Need> = { dumbbell: 'dumbbell', kettlebell: 'dumbbell', band: 'band', pullup_bar: 'pullup_bar', bench: 'bench' };
  return new Set(profile.homeEquipment.map((e) => map[e]).filter(Boolean));
}

export const canDo = (ex: Exercise, eq: Set<Need>) => ex.needs.every((n) => eq.has(n));

/** The exercise itself if possible, otherwise the first substitute that fits the equipment. */
export function resolve(id: string, eq: Set<Need>, seen = new Set<string>()): Exercise | null {
  const ex = EX[id];
  if (!ex || seen.has(id)) return null;
  seen.add(id);
  if (canDo(ex, eq)) return ex;
  for (const a of ex.alt ?? []) {
    const r = resolve(a, eq, seen);
    if (r) return r;
  }
  if (ex.easier) return resolve(ex.easier, eq, seen);
  return null;
}

// ---------------------------------------------------------------- History

export interface Done { date: string; result: ExerciseResult }

/** Logged results for an exercise, newest first. */
export function history(logs: SessionLog[], id: string): Done[] {
  return logs.flatMap((l) => {
    if (l.data?.kind !== 'strength') return [];
    const r = l.data.exercises.find((e) => e.id === id);
    return r && r.sets.length ? [{ date: l.startedAt, result: r }] : [];
  });
}

/** Walk up a bodyweight ladder to the hardest variant that has been done before. */
export function currentVariant(base: Exercise, logs: SessionLog[]): Exercise {
  let cur = base;
  let guard = 0;
  while (cur.harder && guard++ < 6) {
    const h = EX[cur.harder];
    if (!h || history(logs, h.id).length === 0) break;
    cur = h;
  }
  return cur;
}

const failed = (r: ExerciseResult, lo: number) => r.feel === 3 || r.sets.some((s) => s.reps < lo);
const round = (v: number, step: number) => Math.max(step, Math.round(v / step) * step);

export interface Target { ex: Exercise; kg: number | null; reps: number; note?: string; progressed?: boolean }

/** Double progression for loaded exercises; ladder steps for bodyweight. */
export function target(base: Exercise, logs: SessionLog[], range?: [number, number]): Target {
  const ex = currentVariant(base, logs);
  const [lo, hi] = range ?? ex.reps;
  const hist = history(logs, ex.id);

  // Stepped up but could not reach the bottom of the range – go back one step.
  if (ex !== base && hist[0] && hist[0].result.sets.every((s) => s.reps < lo) && ex.easier) {
    const back = EX[ex.easier];
    return { ex: back, kg: 0, reps: (range ?? back.reps)[1], note: `Tillbaka till ${back.name.toLowerCase()} en vecka till.` };
  }

  if (!hist.length) {
    const bodyweight = ex.step === 0 || ex.needs.length === 0 || ex.needs.every((n) => n === 'pullup_bar' || n === 'dip_bars');
    return {
      ex, kg: bodyweight ? 0 : null, reps: lo,
      note: bodyweight ? 'Första gången: hitta en nivå där du har 2–3 reps kvar.' : `Första gången: välj en vikt du klarar ungefär ${hi} gånger med 2–3 reps kvar.`,
    };
  }

  const last = hist[0].result;
  const kg = Math.max(...last.sets.map((s) => s.kg));
  const minReps = Math.min(...last.sets.map((s) => s.reps));
  const allTop = last.sets.every((s) => s.reps >= hi) && last.feel !== 3;

  if (allTop) {
    if (ex.harder && kg === 0) {
      const h = EX[ex.harder];
      return { ex: h, kg: 0, reps: (range ?? h.reps)[0], note: `Nästa steg: ${h.name.toLowerCase()}. Du klarade ${hi} reps i alla set.`, progressed: true };
    }
    if (ex.step > 0) {
      return { ex, kg: kg + ex.step, reps: lo, note: kg === 0 ? `Lägg på ${String(ex.step).replace('.', ',')} kg extra.` : `+${String(ex.step).replace('.', ',')} kg – alla set nådde ${hi} reps.`, progressed: true };
    }
    return { ex, kg: 0, reps: hi, note: 'Toppen nådd – gör det svårare med långsammare tempo eller paus i botten.' };
  }
  if (failed(last, lo) && hist[1] && failed(hist[1].result, lo) && ex.step > 0 && kg > 0) {
    return { ex, kg: round(kg * (1 - DROP_PCT), ex.step), reps: lo, note: 'Två tunga pass i rad – vikten sänks lite så att du kan bygga upp igen.' };
  }
  if (failed(last, lo)) return { ex, kg, reps: Math.max(lo, minReps), note: 'Samma vikt som förra gången.' };
  return { ex, kg, reps: Math.min(hi, minReps + 1), note: `Sikta på ${Math.min(hi, minReps + 1)} reps.` };
}

// ---------------------------------------------------------------- Volume and recovery

/** Hard sets per muscle (primary 1, secondary 0.5) since `from`. */
export function volume(logs: SessionLog[], from: Date): Record<Muscle, number> {
  const v = Object.fromEntries(MUSCLES.map((m) => [m, 0])) as Record<Muscle, number>;
  for (const l of logs) {
    if (l.data?.kind !== 'strength' || new Date(l.startedAt) < from) continue;
    for (const r of l.data.exercises) {
      const ex = EX[r.id];
      if (!ex) continue;
      ex.primary.forEach((m) => (v[m] += r.sets.length));
      ex.secondary.forEach((m) => (v[m] += r.sets.length * 0.5));
    }
  }
  return v;
}

export const weekVolume = (ctx: ModuleCtx) => volume(ctx.logs, weekStart(ctx.now));

/** Muscles trained with at least 3 sets in the last RECOVERY_H hours. */
export function notRecovered(ctx: ModuleCtx): Muscle[] {
  const v = volume(ctx.logs, new Date(ctx.now.getTime() - RECOVERY_H * 3600_000));
  return MUSCLES.filter((m) => v[m] >= 3);
}

// ---------------------------------------------------------------- Programs and sessions

export function programOf(profile: Profile): GymProgram {
  return PROGRAM_BY_ID[profile.enrollments.gym?.programId] ?? PROGRAMS[0];
}

export function nextTemplate(ctx: ModuleCtx, program: GymProgram): { tpl: SessionTemplate; index: number } {
  const started = new Date(ctx.profile.enrollments.gym?.startedAt ?? 0);
  const types = new Set(program.sessions.map((s) => s.type));
  const done = ctx.logs.filter((l) => l.module === 'gym' && new Date(l.startedAt) >= started && types.has(l.type)).length;
  return { tpl: program.sessions[done % program.sessions.length], index: done };
}

const fmtKg = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

export function estimateMinutes(items: StrengthItem[]): number {
  return Math.round(5 + items.reduce((a, i) => a + i.sets * ((i.unit === 'sek' ? i.reps[0] : 40) + i.restSec), 0) / 60);
}

/** Builds a planned session from a template: substitutes for the place, sets loads, fits the time. */
export function build(ctx: ModuleCtx, tpl: SessionTemplate, opts: { minutes?: number; reasons?: string[] } = {}): PlannedSession {
  const place = ctx.checkin.place;
  const eq = equipmentAt(ctx.profile, place);
  const swapped: string[] = [];
  const items: StrengthItem[] = [];
  const progress: string[] = [];

  for (const slot of tpl.slots) {
    const base = resolve(slot.ex, eq);
    if (!base) continue;
    if (base.id !== slot.ex) swapped.push(base.name);
    const t = target(base, ctx.logs, slot.reps);
    if (t.progressed && progress.length < 1) progress.push(`${t.ex.name}: ${t.note?.replace(/\.$/, '')}.`);
    items.push(toItem(t, slot, history(ctx.logs, t.ex.id)[0]));
  }

  // Back after a break (illness, holiday): 10 % lighter and one set fewer the first session (H).
  const lastGym = ctx.logs.filter((l) => l.module === 'gym').reduce((m, l) => Math.max(m, new Date(l.startedAt).getTime()), 0);
  const gymGap = lastGym ? Math.floor((ctx.now.getTime() - lastGym) / 864e5) : 0;
  if (gymGap >= 10) {
    for (const i of items) {
      if (i.kg && i.kg > 0) i.kg = round(i.kg * 0.9, i.step);
      i.sets = Math.max(2, i.sets - 1);
    }
    progress.splice(0, progress.length, `${gymGap} dagar sedan senaste gympasset: 10 % lättare och ett set färre i dag, så att kroppen hinner vänja sig igen.`);
  }

  // Fit the time: trim sets on the last exercises, then drop exercises (keep at least 3).
  const limit = opts.minutes ?? ctx.checkin.minutes;
  let guard = 0;
  while (estimateMinutes(items) > limit && guard++ < 40) {
    const trim = [...items].reverse().find((i) => i.sets > 2) ?? [...items].reverse().find((i) => i.sets > 1);
    if (trim && items.indexOf(trim) >= 2) { trim.sets--; continue; }
    if (items.length > 3) { items.pop(); continue; }
    if (trim) { trim.sets--; continue; }
    break;
  }

  const week = weekVolume(ctx);
  const goal = weeklyTarget(ctx.profile.goals.gym);
  const hit = [...new Set(items.flatMap((i) => EX[i.id]?.primary ?? []))];
  const low = hit.filter((m) => week[m] < goal).sort((a, b) => week[a] - week[b]).slice(0, 2);
  const tired = notRecovered(ctx).filter((m) => hit.includes(m));

  const reasons = [
    ...(opts.reasons ?? []),
    ...(low.length ? [`${low.map((m) => MUSCLE_NAME[m]).join(' och ')}: ${low.map((m) => fmtKg(week[m])).join(' och ')} av ${goal} set den här veckan.`] : []),
    ...progress,
    ...(swapped.length ? [`Anpassat ${place === 'travel' ? 'utan utrustning' : place === 'home' ? 'för hemma' : 'för gymmet'}: ${swapped.slice(0, 3).join(', ').toLowerCase()} i stället för programmets övningar. Passet räknas i programmet som vanligt.`] : []),
    ...(tired.length >= 2 ? [`${tired.slice(0, 2).map((m) => MUSCLE_NAME[m]).join(' och ')} tränades hårt nyss – vänta gärna en dag.`] : []),
  ];

  return {
    id: `gym:${tpl.type}`, module: 'gym', type: tpl.type, title: tpl.title + (swapped.length ? (place === 'travel' ? ' utan utrustning' : place === 'home' ? ' hemma' : '') : ''),
    minutes: estimateMinutes(items), effort: 'hårt',
    summary: `${items.length} övningar · ${items.reduce((a, i) => a + i.sets, 0)} set`,
    reasons: reasons.map((text) => ({ text })),
    content: { kind: 'strength', items },
    penalty: tired.length >= 2 ? 0.6 : 0,
  };
}

export function lastText(d?: Done): string | undefined {
  if (!d) return undefined;
  const sets = d.result.sets;
  const kg = Math.max(...sets.map((x) => x.kg));
  const u = d.result.unit === 'sek' ? ' s' : '';
  return `${fmtDate(d.date)} · ${kg > 0 ? `${fmtKg(kg)} kg × ` : ''}${sets.map((x) => x.reps + u).join(', ')}`;
}

function toItem(t: Target, slot: Slot, last?: Done): StrengthItem {
  const range = slot.reps ?? t.ex.reps;
  const bodyweight = t.kg === 0;
  return {
    id: t.ex.id, name: t.ex.name, sets: slot.sets, reps: range, kg: t.kg, step: t.ex.step || 2.5,
    restSec: slot.rest ?? t.ex.rest, cue: t.ex.cue, bodyweight, unit: slot.unit ?? t.ex.unit,
    note: [slot.note, t.note].filter(Boolean).join(' '),
    target: t.reps,
    last: lastText(last),
  };
}
