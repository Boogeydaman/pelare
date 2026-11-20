import { describe, expect, it } from 'vitest';
import type { Feel, Profile, SessionLog } from '../../core/types';
import type { ModuleCtx } from '../types';
import { STAGES, easyShare, guard, next, stage } from './planner';

const NOW = new Date('2026-11-20T17:00:00');
const ago = (d: number) => new Date(NOW.getTime() - d * 864e5).toISOString();
const profile = (goal: Profile['goals']['run']): Profile => ({
  goals: { gym: 'stronger', run: goal, mobility: 'general' }, daysPerWeek: 4, places: ['gym'], homeEquipment: [],
  enrollments: { gym: { programId: 'fullbody', startedAt: ago(60) }, run: { programId: goal, startedAt: ago(60) }, mobility: { programId: 'general', startedAt: ago(60) } },
  createdAt: ago(90),
});
const run = (daysAgo: number, type: string, minutes: number, km?: number, feel: Feel = 2): SessionLog => ({
  id: Math.random().toString(36), module: 'run', type, title: type, startedAt: ago(daysAgo), minutes, feel, data: { kind: 'run', distanceKm: km },
});
const ctx = (goal: Profile['goals']['run'], logs: SessionLog[], minutes = 60): ModuleCtx => ({
  profile: profile(goal), logs, tests: [], now: NOW, checkin: { date: '2026-11-20', feeling: 'okej', minutes, place: 'gym' },
});

describe('Löpning', () => {
  it('skadevakt: längsta passet 8 km/48 min → inget förslag över 52 min', () => {
    const logs = [run(5, 'easy', 48, 8)];
    const g = guard(profile('10k'), logs, NOW);
    expect(g.maxMin).toBeLessThanOrEqual(52);
    expect(g.maxKm).toBe(8.8);
    for (let i = 0; i < 5; i++) {
      const s = next(ctx('10k', logs, 120));
      if (s.content.kind === 'run') {
        const running = s.content.segments.filter((x) => x.effort !== 'gå').reduce((a, x) => a + x.seconds, 0) / 60;
        expect(running).toBeLessThanOrEqual(52);
      }
    }
  });

  it('gå-spring: nästa steg bara när passet inte kändes tungt', () => {
    expect(stage(profile('start'), [])).toBe(0);
    expect(stage(profile('start'), [run(3, 'walkrun', 25, undefined, 2)])).toBe(1);
    expect(stage(profile('start'), [run(3, 'walkrun', 25, undefined, 3)])).toBe(0);
    const all = Array.from({ length: STAGES.length }, (_, i) => run(i + 1, 'walkrun', 30));
    expect(stage(profile('start'), all)).toBe('done');
  });

  it('ett intervallpass i veckan, inte två', () => {
    const base = [run(10, 'easy', 30), run(12, 'easy', 30), run(14, 'easy', 30)];
    const weekStart = new Date(NOW); weekStart.setDate(NOW.getDate() - ((NOW.getDay() + 6) % 7));
    const dayInWeek = Math.max(0, Math.floor((NOW.getTime() - weekStart.getTime()) / 864e5) - 1);
    const withEasy = [...base, run(dayInWeek, 'easy', 30)];
    expect(next(ctx('5k', withEasy)).type).toBe('intervals');
    const withIntervals = [...withEasy, run(Math.max(0, dayInWeek - 1), 'intervals', 35)];
    expect(next(ctx('5k', withIntervals)).type).not.toBe('intervals');
  });

  it('räknar andelen lugn löpning', () => {
    expect(easyShare([run(2, 'easy', 80), run(5, 'intervals', 20)], NOW)).toBeCloseTo(0.8);
    expect(easyShare([], NOW)).toBeNull();
  });
});
