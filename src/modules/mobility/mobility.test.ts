import { describe, expect, it } from 'vitest';
import { weekStart } from '../../core/format';
import type { MobilityFocus, Profile, SessionLog } from '../../core/types';
import type { ModuleCtx } from '../types';
import { BASE_AREAS, FOCUS_AREAS, areaSeconds, build, targets } from './planner';
import { STRETCH } from './stretches';

const MONDAY = new Date('2026-11-16T18:00:00');

const profile = (focus: MobilityFocus[]): Profile => ({
  goals: { gym: 'stronger', run: '5k', mobility: 'general' }, daysPerWeek: 4, places: ['gym'], homeEquipment: [], mobilityFocus: focus,
  enrollments: { gym: { programId: 'fullbody', startedAt: '2026-10-01' }, run: { programId: '5k', startedAt: '2026-10-01' }, mobility: { programId: 'whole', startedAt: '2026-10-01' } },
  createdAt: '2026-10-01',
});

/** Follow the planner for `days` days (one 15-min session per day) and return the logs. */
function simulate(focus: MobilityFocus[], days: number, minutes = 15): { logs: SessionLog[]; p: Profile } {
  const p = profile(focus);
  const logs: SessionLog[] = [];
  for (let d = 0; d < days; d++) {
    const now = new Date(MONDAY.getTime() + d * 864e5);
    const ctx: ModuleCtx = { profile: p, logs, tests: [], now, checkin: { date: '', feeling: 'okej', minutes, place: 'gym' } };
    const plan = build(ctx, { minutes });
    logs.unshift({ id: String(d), module: 'mobility', type: plan.type, title: plan.title, startedAt: now.toISOString(), minutes: plan.minutes, plan });
  }
  return { logs, p };
}

describe('Rörlighet – hela kroppen', () => {
  it('fem pass på en vecka utan fokus ger alla områden minst 5 minuter', () => {
    const { logs } = simulate([], 5);
    const sec = areaSeconds(logs, weekStart(MONDAY));
    for (const a of BASE_AREAS) expect(sec[a] ?? 0, a).toBeGreaterThanOrEqual(300);
  });

  it('med fokus på splitt får baksida lår och höftböjare mer tid – och resten av kroppen ändå sin dos', () => {
    const { logs, p } = simulate(['front_split'], 5);
    const sec = areaSeconds(logs, weekStart(MONDAY));
    const t = targets(p);
    for (const a of FOCUS_AREAS.front_split) expect(sec[a], a).toBeGreaterThan(sec.shoulders ?? 0);
    for (const a of BASE_AREAS) expect(sec[a] ?? 0, a).toBeGreaterThanOrEqual(Math.min(t[a], 300));
  });

  it('flera fokusområden samtidigt fungerar', () => {
    const { logs } = simulate(['side_split', 'shoulders'], 5);
    const sec = areaSeconds(logs, weekStart(MONDAY));
    expect(sec.adductors).toBeGreaterThan(sec.calves ?? 0);
    expect(sec.shoulders).toBeGreaterThan(sec.calves ?? 0);
  });

  it('nästa pass prioriterar det som fått minst tid', () => {
    const p = profile([]);
    const now = new Date(MONDAY.getTime() + 864e5);
    const ham = build({ profile: p, logs: [], tests: [], now: MONDAY, checkin: { date: '', feeling: 'okej', minutes: 15, place: 'gym' } }, { minutes: 15, only: ['hamstrings'] });
    const logs: SessionLog[] = [{ id: 'h', module: 'mobility', type: 'x', title: 'x', startedAt: MONDAY.toISOString(), minutes: 15, plan: ham }];
    const next = build({ profile: p, logs, tests: [], now, checkin: { date: '', feeling: 'okej', minutes: 10, place: 'gym' } }, { minutes: 10 });
    const statics = next.content.kind === 'mobility' ? next.content.holds.filter((h) => STRETCH[h.id].kind === 'statisk') : [];
    // No stretch that is only for the area that already had its dose.
    for (const h of statics) expect(STRETCH[h.id].areas, h.id).not.toEqual(['hamstrings']);
    expect(STRETCH[statics[0].id].areas.some((a) => a !== 'hamstrings')).toBe(true);
  });

  it('ryms i tiden', () => {
    for (const minutes of [6, 10, 15, 25]) {
      const { logs, p } = simulate([], 1, minutes);
      const plan = build({ profile: p, logs, tests: [], now: MONDAY, checkin: { date: '', feeling: 'okej', minutes, place: 'gym' } }, { minutes });
      expect(plan.minutes, `${minutes} min`).toBeLessThanOrEqual(minutes + 1);
    }
  });
});
