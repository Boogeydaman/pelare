import { weekStart } from '../core/format';
import type { ModuleId, Profile, ProgramOption, SessionLog } from '../core/types';
import type { ModuleCtx } from './types';

export const DAY = 864e5;

export const logsOf = (ctx: ModuleCtx, m: ModuleId) => ctx.logs.filter((l) => l.module === m);

/** This week's sessions for a pillar, including other training logged in its place. */
export const thisWeek = (ctx: ModuleCtx, m: ModuleId) =>
  ctx.logs.filter((l) => (l.module === m || l.replaces === m) && !(l.module === 'gym' && l.type.startsWith('core')) && new Date(l.startedAt) >= weekStart(ctx.now));

export const distinctDays = (logs: SessionLog[]) => new Set(logs.map((l) => l.startedAt.slice(0, 10))).size;

export function enrollment(ctx: ModuleCtx, m: ModuleId, programs: ProgramOption[]) {
  const e = ctx.profile.enrollments[m];
  const program = programs.find((p) => p.id === e?.programId) ?? programs[0];
  const started = e ? new Date(e.startedAt) : ctx.now;
  const week = Math.min(program.weeks, Math.max(1, Math.floor((ctx.now.getTime() - started.getTime()) / (7 * DAY)) + 1));
  const sinceStart = logsOf(ctx, m).filter((l) => new Date(l.startedAt) >= started).length;
  return { program, week, started, sinceStart };
}

/** Sum per ISO week for the last `weeks` weeks, oldest first. */
export function weeklySeries(logs: SessionLog[], now: Date, weeks: number, value: (l: SessionLog) => number): number[] {
  const start = weekStart(now).getTime();
  return Array.from({ length: weeks }, (_, i) => {
    const from = start - (weeks - 1 - i) * 7 * DAY;
    const to = from + 7 * DAY;
    return logs.filter((l) => { const t = new Date(l.startedAt).getTime(); return t >= from && t < to; }).reduce((a, l) => a + value(l), 0);
  });
}

export const fmt1 = (n: number) => (Math.round(n * 10) / 10).toString().replace('.', ',');

/**
 * Split the user's training days between gym and running so the week adds up.
 * Running gets about half the days (at least 1), gym the rest but always ≥2 (health.floor [25]).
 * Each is capped by what the chosen program asks for.
 */
/** The running program the user follows (enrollment first, the onboarding goal as fallback). */
export const runProgramId = (profile: Profile) => profile.enrollments.run?.programId ?? profile.goals.run;
/** Distance programs (first 10/15/20 km) need at least three runs a week to work. */
export const isDistanceProgram = (id: string) => id === '10k' || id === '15k' || id === '20k';

// ---------------------------------------------------------------- Hip replacement rehab

/**
 * The five phases after a hip replacement (research report, part 3): they follow the healing –
 * inflammation (day 0–5), proliferation (week 1–6), remodelling (6 weeks to 12–18 months) – and the
 * points where practice changes (stitches ~2 weeks, restrictions 6 weeks, bone ingrowth ~12 weeks).
 * `weeks` = the usual time, `min` = the earliest week you can enter even if you meet the criteria
 * (tissue healing sets the floor). You move on when you meet the criteria, not when the calendar says.
 * `gym` = rehab sessions a week (7 = daily home programme), `walks` = planned walks/cardio a week
 * (0 = walking spread over the day instead).
 */
export const REHAB_PHASES = [
  { n: 1, name: 'Sjukhus och första dagarna', short: 'Akutfas', weeks: [0, 0.5], min: 0, gym: 7, walks: 0 },
  { n: 2, name: 'Tidig hemfas', short: 'Hemfas', weeks: [0.5, 3], min: 0, gym: 7, walks: 0 },
  { n: 3, name: 'Funktion och styrka', short: 'Styrka', weeks: [3, 6], min: 2, gym: 4, walks: 0 },
  { n: 4, name: 'Uppbyggnad', short: 'Uppbyggnad', weeks: [6, 12], min: 6, gym: 3, walks: 3 },
  { n: 5, name: 'Full funktion, idrott och arbete', short: 'Full funktion', weeks: [12, Infinity], min: 12, gym: 0, walks: 3 },
] as const;
/** Before the operation (surgery date in the future): prehab, phase 0. */
export const PREHAB = { n: 0, name: 'Före operationen', short: 'Prehab', weeks: [-Infinity, 0], min: -Infinity, gym: 3, walks: 3 } as const;
export const phaseOf = (n: number) => (n === 0 ? PREHAB : REHAB_PHASES[Math.max(1, Math.min(5, n)) - 1]);

/** Weeks since the operation – negative before it. */
export const weeksFromSurgery = (profile: Profile, now = new Date()) =>
  profile.rehab ? (now.getTime() - new Date(`${profile.rehab.surgery}T12:00:00`).getTime()) / (7 * 864e5) : 0;
export const weeksSinceSurgery = (profile: Profile, now = new Date()) => Math.max(0, weeksFromSurgery(profile, now));

/** The phase the calendar alone would give (used to suggest a criteria check, and for old profiles). */
export const timePhase = (w: number): number => (w < 0 ? 0 : REHAB_PHASES.find((p) => w >= p.weeks[0] && w < p.weeks[1])?.n ?? 5);

/**
 * Rehab phase from the criteria you have confirmed: 0 before the operation, then 1–5. You enter the next
 * phase when the current phase's criteria are met and the healing floor (`min` weeks) has passed.
 * Profiles from before the criteria existed follow the calendar until their first check. null = not in rehab.
 */
export function rehabPhase(profile: Profile, now = new Date()): number | null {
  const r = profile.rehab;
  if (!r || r.ended || r.kind !== 'hip') return null;
  const w = weeksFromSurgery(profile, now);
  if (w < 0) return 0;
  let p: number;
  if (!r.passed) p = timePhase(w);
  else {
    p = 1;
    while (p < 5 && r.passed[p] && w >= REHAB_PHASES[p].min) p++;
  }
  return r.holdPhase && r.holdPhase < p ? r.holdPhase : p;
}
/** The criteria are met but the healing floor stops you: the phase and the week you can move on. */
export function waitingFor(profile: Profile, now = new Date()): { phase: number; week: number } | null {
  const ph = rehabPhase(profile, now);
  if (!ph || ph >= 5 || !profile.rehab?.passed?.[ph]) return null;
  return { phase: ph + 1, week: REHAB_PHASES[ph].min };
}
/** In rehab and not yet cleared for free training: deep hip stretches, running and jumps are left out. */
export const rehabCautious = (profile: Profile, now = new Date()) => {
  const ph = rehabPhase(profile, now);
  return ph !== null && ph !== 0 && (ph < 5 || !profile.rehab?.cleared);
};

/** Runs a week in each running program (the distance programs vary a little by week). */
export const RUN_PER_WEEK: Record<string, number> = { start: 3, '5k': 3, '10k': 3, '15k': 4, '20k': 4, maintain: 2, walk: 4 };
export const runsPerWeekOf = (profile: Profile) => {
  const id = runProgramId(profile);
  const ph = rehabPhase(profile);
  if (id === 'walk' && ph !== null) return phaseOf(ph).walks;
  return RUN_PER_WEEK[id] ?? 3;
};

/** Gym sessions a week: the user's own choice. Older profiles without it get what their total used to give. */
export function gymDaysOf(profile: Profile): number {
  // In hip rehab the phase decides how often (short daily sessions early on).
  const ph = rehabPhase(profile);
  if (ph !== null && ph < 5) return phaseOf(ph).gym;
  if (profile.gymDays !== undefined) return profile.gymDays;
  const D = profile.daysPerWeek;
  return Math.max(2, Math.min(4, D - Math.max(1, Math.min(3, Math.floor(D / 2)))));
}

/** Matching gym program for a number of gym days (gym), or the home program. */
export function gymProgramFor(days: number, places: Profile['places'], equip: Profile['homeEquipment']): string {
  if (!places.includes('gym')) return equip.includes('dumbbell') ? 'home_db' : 'bodyweight';
  return days <= 2 ? 'minimal' : days >= 4 ? 'upperlower' : 'fullbody';
}

/**
 * Weekly targets: gym = the user's gym days, running = what the running program asks for.
 * The total (shown in Settings) is simply the sum – choosing a longer running program adds running days
 * instead of taking them from the gym.
 */
export function weeklySplit(profile: Profile, _gymPerWeek: number, runPerWeek: number): { gym: number; run: number } {
  return { gym: gymDaysOf(profile), run: runPerWeek };
}
