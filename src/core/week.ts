// Din vecka – spreads what is left of the week's gym and running over the remaining days,
// so the plan is visible and today's choice makes sense. Recomputed every day: a missed
// session simply moves to the next free day. Today's slot is always the coach's pick.
import type { ModuleCtx, TrainingModule } from '../modules/types';
import type { TodayView } from './coach';
import { isSameDay, weekStart } from './format';
import type { ModuleId } from './types';

export type MainId = 'gym' | 'run';
const MAIN: MainId[] = ['gym', 'run'];
export const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

export interface PlanDay {
  date: Date;
  label: string; // Mån, Tis …
  index: number; // 0 = Monday
  past: boolean;
  today: boolean;
  done: (ModuleId | 'other')[]; // what was logged that day
  planned: MainId[]; // gym or running planned that day (today: the coach's pick)
  mobility: 'done' | 'planned' | null;
  fixed: boolean; // one of the user's chosen training days
}

export interface WeekPlan {
  days: PlanDay[];
  tone: 'tight' | 'ok' | 'done' | 'over' | 'paused';
  message: string;
}

const NOUN: Record<MainId, string> = { gym: 'gympasset', run: 'löppasset' };
const pass = (n: number) => `${n} pass`;
const dagar = (n: number) => `${n} ${n === 1 ? 'dag' : 'dagar'}`;

/** Picks `n` of `pool` spread as evenly as possible, leaving the first day free when there is room. */
export function spread<T>(pool: T[], n: number): T[] {
  if (n <= 0) return [];
  if (n >= pool.length) return [...pool];
  return Array.from({ length: n }, (_, k) => pool[Math.min(pool.length - 1, Math.floor(((k + 0.5) * pool.length) / n))]);
}


export function planWeek(ctx: ModuleCtx, modules: TrainingModule[], view: TodayView): WeekPlan {
  const { now, logs, profile } = ctx;
  const start = weekStart(now);
  const fixedDays = profile.trainingDays ?? [];
  const days: PlanDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start); date.setDate(start.getDate() + i);
    const today = isSameDay(date, now);
    const past = !today && date < now;
    const dayLogs = logs.filter((l) => isSameDay(l.startedAt, date));
    const done = [...new Set(dayLogs.map((l) => l.module))];
    const mobDone = done.includes('mobility') || dayLogs.some((l) => l.replaces === 'mobility');
    return { date, label: WEEKDAYS[i], index: i, past, today, done, planned: [], mobility: mobDone ? 'done' : null, fixed: fixedDays.includes(i) };
  });
  const t = days.findIndex((d) => d.today);
  const week = Object.fromEntries(view.week.map((w) => [w.module, w])) as Record<ModuleId, TodayView['week'][number]>;
  const left: Record<MainId, number> = { gym: 0, run: 0 };
  for (const m of MAIN) if (week[m] && modules.some((x) => x.id === m)) left[m] = Math.max(0, week[m].target - week[m].done);

  const sick = view.primary.id === 'sick';
  const todayDay = days[t];
  const doneMainToday = logs.some((l) => isSameDay(l.startedAt, now) && (l.module === 'gym' || l.module === 'run' || !!l.replaces));

  // Today: the coach's pick, if it moves the week forward.
  const pick = view.primary.module;
  if (!sick && !doneMainToday && (pick === 'gym' || pick === 'run') && left[pick] > 0) { todayDay.planned = [pick]; left[pick]--; }
  if (!sick && pick === 'mobility' && !todayDay.mobility) todayDay.mobility = 'planned';

  // The rest: spread evenly over the days after today, on the chosen training days if they fit.
  const future = days.slice(t + 1);
  const n = left.gym + left.run;
  const preferred = future.filter((d) => d.fixed);
  const useFixed = fixedDays.length > 0 && preferred.length >= n;
  const pool = useFixed ? preferred : future;
  const slots = sick ? [] : spread(pool, n);
  // Assign gym and running to the chosen days so that runs never fall on consecutive days when it can
  // be avoided (rest day between runs), alternating with gym otherwise.
  const runOn = (k: number) => k >= 0 && k < 7 && (days[k].planned.includes('run') || days[k].done.includes('run'));
  const l2 = { ...left };
  slots.forEach((d, i) => {
    const remaining = slots.length - i;
    const canRun = l2.run > 0 && !runOn(d.index - 1);
    const mustRun = l2.run >= remaining;
    const pickRun = l2.run > 0 && (mustRun || (canRun && (l2.gym === 0 || l2.run >= l2.gym || days[d.index - 1]?.planned.includes('gym'))));
    const m: MainId = pickRun ? 'run' : l2.gym > 0 ? 'gym' : 'run';
    d.planned = [m]; l2[m]--;
  });
  const overflow = sick ? 0 : n - slots.length;

  // Mobility: short sessions, rest days first, then alongside the other sessions.
  const mob = week.mobility;
  if (mob && !sick) {
    let mobLeft = Math.max(0, mob.target - mob.done - (todayDay.mobility === 'planned' ? 1 : 0));
    const free = future.filter((d) => !d.planned.length);
    const busy = future.filter((d) => d.planned.length);
    for (const d of [...spread(free, Math.min(mobLeft, free.length))]) { d.mobility = 'planned'; mobLeft--; }
    for (const d of spread(busy, mobLeft)) d.mobility = 'planned';
  }

  // The message: why today matters (or doesn't).
  const total = n + todayDay.planned.length;
  const daysLeft = 7 - t;
  let tone: WeekPlan['tone'];
  let message: string;
  if (sick) {
    tone = 'paused'; message = 'Veckomålen är pausade medan du är sjuk. Planen fortsätter när du är frisk – inget behöver tas igen.';
  } else if (total === 0) {
    tone = 'done'; message = 'Veckans gym och löpning är klara. Resten av veckan är rörlighet, vila eller bonus.';
  } else if (overflow > 0) {
    tone = 'over';
    message = `${pass(total)} kvar men ${dagar(daysLeft)}. ${overflow === 1 ? 'Ett pass' : `${overflow} pass`} får vänta till nästa vecka – det är okej. Att trycka in allt på en gång ökar risken för skador mer än det hjälper.`;
  } else if (todayDay.planned.length && n >= future.length) {
    tone = 'tight';
    message = `Gör ${NOUN[todayDay.planned[0]]} i dag – annars hinner du inte alla ${pass(total)} före söndag.`;
  } else {
    tone = 'ok';
    message = total === 1 && !todayDay.planned.length
      ? `Ett pass kvar och ${dagar(daysLeft - 1)} på dig efter i dag. Ingen brådska.`
      : `${pass(total)} kvar på ${dagar(daysLeft)} – det finns marginal. Passar inte dagens pass kan du byta utan att veckan spricker.`;
  }
  if (fixedDays.length && !useFixed && n > 0 && !sick) message += ' Dina valda träningsdagar räcker inte till allt, så planen använder även andra dagar.';
  return { days, tone, message };
}
