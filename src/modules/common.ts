import { weekStart } from '../core/format';
import type { ModuleId, ProgramOption, SessionLog } from '../core/types';
import type { ModuleCtx } from './types';

export const DAY = 864e5;

export const logsOf = (ctx: ModuleCtx, m: ModuleId) => ctx.logs.filter((l) => l.module === m);

export const thisWeek = (ctx: ModuleCtx, m: ModuleId) =>
  logsOf(ctx, m).filter((l) => new Date(l.startedAt) >= weekStart(ctx.now));

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
