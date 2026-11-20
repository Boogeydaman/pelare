import { describe, expect, it } from 'vitest';
import { MODULE_LIST } from '../modules/registry';
import type { ModuleCtx } from '../modules/types';
import { coach } from './coach';
import { planWeek, spread } from './week';
import type { CheckIn, Profile, SessionLog } from './types';

const at = (iso: string) => new Date(iso);
const profile = (extra: Partial<Profile> = {}): Profile => ({
  goals: { gym: 'stronger', run: '5k', mobility: 'general' }, daysPerWeek: 4, places: ['gym'], homeEquipment: [],
  enrollments: { gym: { programId: 'fullbody', startedAt: '2026-10-01T10:00:00' }, run: { programId: '5k', startedAt: '2026-10-01T10:00:00' }, mobility: { programId: 'whole', startedAt: '2026-10-01T10:00:00' } },
  createdAt: '2026-10-01T10:00:00', ...extra,
});
const ctx = (now: Date, logs: SessionLog[] = [], p = profile(), feeling: CheckIn['feeling'] = 'okej'): ModuleCtx =>
  ({ profile: p, logs, tests: [], now, checkin: { date: now.toISOString().slice(0, 10), feeling, minutes: 60, place: 'gym' } });
const plan = (c: ModuleCtx) => planWeek(c, MODULE_LIST, coach(c, MODULE_LIST));
const mains = (p: ReturnType<typeof plan>) => p.days.flatMap((d) => d.planned);
let n = 0;
const log = (module: 'gym' | 'run' | 'mobility', iso: string): SessionLog => ({ id: `l${n++}`, module, type: module === 'run' ? 'easy' : 'x', title: module, startedAt: iso, minutes: 40 });

describe('Din vecka', () => {
  it('sprider ut passen jämnt', () => {
    expect(spread([0, 1, 2, 3, 4, 5], 3)).toEqual([1, 3, 5]);
    expect(spread([0, 1, 2], 5)).toEqual([0, 1, 2]);
  });

  it('måndag utan pass: allt planeras in, aldrig två pass samma dag', () => {
    const c = ctx(at('2026-11-16T08:00:00'));
    const p = plan(c);
    const target = MODULE_LIST.filter((m) => m.id !== 'mobility').reduce((a, m) => a + m.weekly(c).target, 0);
    expect(mains(p)).toHaveLength(target);
    for (const d of p.days) expect(d.planned.length).toBeLessThanOrEqual(1);
    expect(p.tone).toBe('ok');
  });

  it('dagens plats är coachens förslag', () => {
    const c = ctx(at('2026-11-16T08:00:00'));
    const v = coach(c, MODULE_LIST);
    const p = planWeek(c, MODULE_LIST, v);
    const today = p.days.find((d) => d.today)!;
    if (v.primary.module === 'gym' || v.primary.module === 'run') expect(today.planned).toEqual([v.primary.module]);
  });

  it('lite tid kvar → "gör det i dag"', () => {
    // Friday, nothing done: more sessions left than days after today.
    const base = profile();
    const p = plan(ctx(at('2026-11-20T08:00:00'), [], profile({ gymDays: 1, enrollments: { ...base.enrollments, run: { programId: 'maintain', startedAt: base.createdAt } } }))); // 1 gym + 2 runs on Fri–Sun
    expect(p.tone).toBe('tight');
    expect(p.message).toMatch(/i dag/);
    expect(p.days.find((d) => d.today)!.planned).toHaveLength(1);
  });

  it('för många pass kvar → resten får vänta, inget trycks in', () => {
    const p = plan(ctx(at('2026-11-22T08:00:00'))); // Sunday
    expect(p.tone).toBe('over');
    expect(mains(p).length).toBeLessThanOrEqual(1);
  });

  it('allt klart → säger det', () => {
    const logs = [log('gym', '2026-11-16T10:00:00'), log('run', '2026-11-17T10:00:00'), log('gym', '2026-11-18T10:00:00'), log('run', '2026-11-19T10:00:00'), log('gym', '2026-11-19T18:00:00'), log('run', '2026-11-20T07:00:00')];
    const c = ctx(at('2026-11-20T12:00:00'), logs);
    const p = plan(c);
    const left = MODULE_LIST.filter((m) => m.id !== 'mobility').reduce((a, m) => a + Math.max(0, m.weekly(c).target - m.weekly(c).done), 0);
    if (left === 0) expect(p.tone).toBe('done');
    expect(p.days[0].done).toContain('gym');
  });

  it('valda träningsdagar används när de räcker', () => {
    const p = plan(ctx(at('2026-11-16T08:00:00'), [], profile({ gymDays: 1, trainingDays: [1, 3, 5, 6] })));
    for (const d of p.days.filter((x) => !x.today && x.planned.length)) expect([1, 3, 5, 6]).toContain(d.index);
  });

  it('coachen väljer lugnt på en dag som inte är vald när veckan ryms ändå', () => {
    const v = coach(ctx(at('2026-11-16T08:00:00'), [], profile({ trainingDays: [1, 2, 3, 4, 5, 6] })), MODULE_LIST);
    expect(['mobility', 'rest']).toContain(v.primary.module);
  });

  it('annan träning ersätter dagens pass och räknas i veckan', () => {
    const now = at('2026-11-18T18:00:00');
    const before = ctx(now);
    const gymBefore = MODULE_LIST.find((m) => m.id === 'gym')!.weekly(before).done;
    const other: SessionLog = { id: 'o1', module: 'other', type: 'sport', title: 'Fotboll', startedAt: '2026-11-18T17:00:00', minutes: 60, replaces: 'gym' };
    const c = ctx(now, [other]);
    expect(MODULE_LIST.find((m) => m.id === 'gym')!.weekly(c).done).toBe(gymBefore + 1);
    const v = coach(c, MODULE_LIST);
    expect(['mobility', 'rest']).toContain(v.primary.module);
    const p = planWeek(c, MODULE_LIST, v);
    expect(p.days.find((d) => d.today)!.planned).toHaveLength(0);
  });

  it('sjuk → pausat och inget planerat', () => {
    const p = plan(ctx(at('2026-11-18T08:00:00'), [], profile(), 'sjuk'));
    expect(p.tone).toBe('paused');
    expect(mains(p)).toHaveLength(0);
  });
});
