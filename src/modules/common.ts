import { weekStart } from '../core/format';
import type { ModuleId, Profile, ProgramOption, SessionLog } from '../core/types';
import type { ModuleCtx } from './types';

export const DAY = 864e5;

export const logsOf = (ctx: ModuleCtx, m: ModuleId) => ctx.logs.filter((l) => l.module === m);

/** This week's sessions for a pillar, including other training logged in its place. */
export const thisWeek = (ctx: ModuleCtx, m: ModuleId) =>
  ctx.logs.filter((l) => (l.module === m || l.replaces === m) && new Date(l.startedAt) >= weekStart(ctx.now));

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

/** Runs a week in each running program (the distance programs vary a little by week). */
export const RUN_PER_WEEK: Record<string, number> = { start: 3, '5k': 3, '10k': 3, '15k': 4, '20k': 4, maintain: 2 };
export const runsPerWeekOf = (profile: Profile) => RUN_PER_WEEK[runProgramId(profile)] ?? 3;

/** Gym sessions a week: the user's own choice. Older profiles without it get what their total used to give. */
export function gymDaysOf(profile: Profile): number {
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
