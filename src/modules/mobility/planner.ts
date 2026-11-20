// Mobility planner: the whole body every week, extra time on chosen focus areas.
// Rule mobility.dose [22]: ≥5 min static stretch per area per week, spread over ≥5 days.
// Transcripts (level D): ~30 s holds, 90–120 s total per stretch per session → up to 3 rounds.
import { weekStart } from '../../core/format';
import type { HoldItem, MobilityFocus, PlannedSession, Profile, SessionLog } from '../../core/types';
import type { ModuleCtx } from '../types';
import { AREA_NAME, STRETCH, STRETCHES, type Area, type Stretch } from './stretches';

/** Areas every week must cover (whole-body base). */
export const BASE_AREAS: Area[] = ['shoulders', 'chest', 'spine', 'hip_flexors', 'glutes', 'hamstrings', 'adductors', 'calves'];

export const FOCUS_NAME: Record<MobilityFocus, string> = {
  front_split: 'Splitt framåt', side_split: 'Sidosplitt', hips: 'Höfter', shoulders: 'Axlar och bröst', back: 'Rygg', ankles: 'Fotleder',
};
export const FOCUS_HINT: Record<MobilityFocus, string> = {
  front_split: 'Baksida lår och höftböjare', side_split: 'Insida lår och baksida lår', hips: 'Höftböjare, säte och insida lår',
  shoulders: 'För press över huvudet och hållning', back: 'Rörlig rygg, bra efter mycket sittande', ankles: 'För djup knäböj och löpning',
};
export const FOCUS_AREAS: Record<MobilityFocus, Area[]> = {
  front_split: ['hamstrings', 'hip_flexors'], side_split: ['adductors', 'hamstrings'], hips: ['hip_flexors', 'glutes', 'adductors'],
  shoulders: ['shoulders', 'chest'], back: ['spine'], ankles: ['calves'],
};

/** Weekly target per area in seconds: 5 min base [22], twice that for focus areas. */
export const BASE_SEC = 300;
export const FOCUS_SEC = 600;

/** Focus areas from the profile (older profiles stored a single goal). */
export function focusOf(profile: Profile): MobilityFocus[] {
  if (profile.mobilityFocus) return profile.mobilityFocus;
  const g = profile.goals.mobility;
  return g === 'general' ? [] : [g as MobilityFocus];
}

export function targets(profile: Profile): Record<Area, number> {
  const t = Object.fromEntries(BASE_AREAS.map((a) => [a, BASE_SEC])) as Record<Area, number>;
  for (const f of focusOf(profile)) for (const a of FOCUS_AREAS[f]) t[a] = FOCUS_SEC;
  return t;
}

const holdSeconds = (h: HoldItem) => h.seconds * h.sides * h.rounds;

/** Seconds of stretching per area since `from`, from the plan stored with each mobility log. */
export function areaSeconds(logs: SessionLog[], from: Date): Record<Area, number> {
  const out = {} as Record<Area, number>;
  const add = (a: Area, s: number) => (out[a] = (out[a] ?? 0) + s);
  for (const l of logs) {
    if (l.module !== 'mobility' || new Date(l.startedAt) < from) continue;
    const c = l.plan?.content;
    if (c?.kind === 'mobility') {
      for (const h of c.holds) for (const a of STRETCH[h.id]?.areas ?? []) add(a, holdSeconds(h));
    } else {
      // Logged without a plan (manual or sample): spread the time over the whole body.
      for (const a of BASE_AREAS) add(a, (l.minutes * 60) / BASE_AREAS.length);
    }
  }
  return out;
}

export function sessionsDone(logs: SessionLog[]): number {
  return logs.filter((l) => l.module === 'mobility').length;
}

/** Hold time and rounds grow with practice (mobility.progression, H). */
export function dose(done: number): { sec: number; rounds: number } {
  return { sec: done < 6 ? 30 : 45, rounds: done < 4 ? 2 : 3 };
}

/** Step up a stretch ladder (e.g. supine hamstring → half split → split slide) with practice: one step per 8 sessions. */
function level(s: Stretch, done: number): Stretch {
  let cur = s;
  for (let i = 0; i < Math.floor(done / 8) && cur.harder; i++) cur = STRETCH[cur.harder];
  return cur;
}

export function hold(id: string, sec: number, rounds = 1): HoldItem {
  const s = STRETCH[id];
  const moving = s.kind !== 'statisk';
  return { id, name: s.name, seconds: moving ? 40 : sec, sides: moving ? 1 : s.sides, rounds: moving ? 1 : rounds, cue: s.cue };
}

export const minutesOf = (holds: HoldItem[]) => Math.max(3, Math.round(holds.reduce((a, h) => a + h.rounds * (h.seconds * h.sides + 10), 0) / 60));

const WARMUPS = ['worlds_greatest', 'cat_cow', 'ninety_ninety', 'cossack'];
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export interface BuildOpts { minutes: number; only?: Area[]; title?: string; type?: string }

/**
 * Builds a stretch session: a dynamic warm-up move, then static stretches chosen for the areas
 * that have had the least time this week relative to their target. Focus areas win ties.
 */
export function build(ctx: ModuleCtx, opts: BuildOpts): PlannedSession {
  const t = targets(ctx.profile);
  const done = areaSeconds(ctx.logs, weekStart(ctx.now));
  const n = sessionsDone(ctx.logs);
  const { sec, rounds } = dose(n);
  const focus = new Set(focusOf(ctx.profile).flatMap((f) => FOCUS_AREAS[f]));
  const pool = (opts.only ?? (Object.keys(t) as Area[]));
  const need = (a: Area) => Math.max(0, (t[a] ?? BASE_SEC) - (done[a] ?? 0)) / (t[a] ?? BASE_SEC) + (focus.has(a) ? 0.05 : 0);
  const order = [...pool].sort((a, b) => need(b) - need(a));

  const holds: HoldItem[] = [];
  const day = Math.floor(ctx.now.getTime() / 864e5);
  if (opts.minutes >= 8) holds.push(hold(WARMUPS[day % WARMUPS.length], 40));

  const covered = new Map<Area, number>();
  const statics = STRETCHES.filter((s) => s.kind === 'statisk' && s.group !== 'Djurrörelser');
  for (let pass = 0; pass < 3; pass++) {
    for (const area of order) {
      if ((covered.get(area) ?? 0) > pass) continue;
      // Best stretch for this area: covers it, not used yet, and covers the most other needy areas.
      const cands = statics.filter((s) => s.areas.includes(area) && !holds.some((h) => h.id === level(s, n).id) && !s.easier);
      if (!cands.length) continue;
      cands.sort((a, b) => b.areas.filter((x) => pool.includes(x)).reduce((v, x) => v + need(x), 0) - a.areas.filter((x) => pool.includes(x)).reduce((v, x) => v + need(x), 0));
      const pick = level(cands[0], focus.has(area) ? n : Math.min(n, 7));
      const next = [...holds, hold(pick.id, sec, focus.has(area) ? rounds : Math.max(1, rounds - 1))];
      if (minutesOf(next) > opts.minutes && holds.length >= 2) break;
      holds.splice(0, holds.length, ...next);
      for (const a of pick.areas) covered.set(a, (covered.get(a) ?? 0) + 1);
    }
  }

  const hit = order.filter((a) => covered.has(a));
  const lowest = order.filter((a) => need(a) > 0.05).slice(0, 2);
  const title = opts.title ?? (hit.length >= 6 ? 'Hela kroppen' : `Rörlighet: ${hit.slice(0, 2).map((a) => lower(AREA_NAME[a])).join(' och ')}`);
  const reasons = [
    lowest.length ? `${lowest.map((a, i) => (i ? lower(AREA_NAME[a]) : AREA_NAME[a])).join(' och ')} har fått minst tid den här veckan.` : 'Alla områden har fått sin dos den här veckan – det här håller rörligheten vid liv.',
    `${hit.length} av ${pool.length} områden i dag. Hela kroppen får minst 5 minuter i veckan${focus.size ? ', dina fokusområden dubbelt så mycket' : ''} [22].`,
    `${rounds} varv × ${sec} s${rounds * sec >= 90 ? ' på fokusområdena – dosen som gör dig rörligare' : '. Ökar när du stretchat några gånger'}.`,
  ];
  const statHolds = holds.filter((h) => STRETCH[h.id].kind === 'statisk');
  return {
    id: `mobility:${opts.type ?? 'build'}`, module: 'mobility', type: opts.type ?? 'build', title, minutes: minutesOf(holds), effort: 'lugnt',
    summary: `${holds.length} övningar · ${statHolds[0] ? `${Math.max(...statHolds.map((h) => h.rounds))} × ${sec} s` : 'rörelse'}`,
    reasons: reasons.map((text) => ({ text })), content: { kind: 'mobility', holds },
  };
}
