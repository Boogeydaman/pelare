// Idag: asks every module for candidates and weighs them against the week, recovery and day form.
// Skeleton version – simple weighting. The full rule engine replaces `score` in phase E.
import type { ModuleCtx, TrainingModule } from '../modules/types';
import { isSameDay } from './format';
import type { PlannedSession } from './types';

export interface TodayView { primary: PlannedSession; alternatives: PlannedSession[]; note?: string }

export const REST: PlannedSession = {
  id: 'rest', module: 'rest', type: 'rest', title: 'Vila', minutes: 30, effort: 'lugnt',
  summary: 'Promenad eller helt ledigt',
  reasons: [{ text: 'Vila är en del av planen. Kroppen blir starkare mellan passen.' }],
  content: { kind: 'rest', text: 'Ta en lugn promenad, eller vila helt. Båda räknas.' },
};

export function coach(ctx: ModuleCtx, modules: TrainingModule[]): TodayView {
  const { checkin, logs, now } = ctx;
  const todayLogs = logs.filter((l) => isSameDay(l.startedAt, now));
  const hardToday = todayLogs.some((l) => modules.find((m) => m.id === l.module)?.load(l).hard);
  const tired = checkin.feeling === 'trott';
  const lightOnly = tired || hardToday;

  const scored = modules.flatMap((m) => {
    const w = m.weekly(ctx);
    const need = Math.max(0, 1 - w.done / Math.max(1, w.target));
    return m.candidates(ctx).map((s, i) => {
      let score = need - i * 0.15 - (s.penalty ?? 0);
      if (s.minutes > checkin.minutes) score -= 0.5;
      if (lightOnly && s.effort === 'hårt') score -= 2;
      if (checkin.feeling === 'pigg' && s.effort === 'hårt') score += 0.1;
      if (todayLogs.some((l) => l.module === m.id)) score -= 0.6;
      return { s: { ...s, minutes: Math.min(s.minutes, checkin.minutes) }, score };
    });
  });
  scored.push({ s: REST, score: (tired ? 0.6 : 0) + (hardToday ? 0.4 : 0) + 0.05 });
  scored.sort((a, b) => b.score - a.score);

  const primary = scored[0].s;
  const alternatives: PlannedSession[] = [];
  for (const { s } of scored.slice(1)) {
    if (alternatives.length >= 3) break;
    if (s.module !== primary.module && !alternatives.some((a) => a.module === s.module)) alternatives.push(s);
  }
  const note = hardToday ? 'Du har redan kört ett hårt pass i dag – resten blir lugnt.' : tired ? 'Du känner dig trött, så förslagen är lugna i dag.' : undefined;
  return { primary, alternatives, note };
}
