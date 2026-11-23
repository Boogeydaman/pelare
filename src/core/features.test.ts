import { describe, expect, it } from 'vitest';
import { EX } from '../modules/gym/exercises';
import { e1rm, plateauTip, similar, swapItem, type Done } from '../modules/gym/planner';
import { registerCustom, type CustomExercise } from '../modules/gym/custom';
import { paceZones, riegel, zonePosition } from '../modules/run/pace';
import type { ModuleCtx } from '../modules/types';
import { _test, wrappedWeek } from '../screens/Wrapped';
import type { Profile, SessionLog, StrengthItem } from './types';

const NOW = new Date('2026-11-22T19:00:00'); // Sunday evening
const profile: Profile = {
  goals: { gym: 'stronger', run: '5k', mobility: 'general' }, daysPerWeek: 5, gymDays: 2, places: ['gym'], homeEquipment: [],
  enrollments: { gym: { programId: 'fullbody', startedAt: '2026-10-01T10:00:00' }, run: { programId: '5k', startedAt: '2026-10-01T10:00:00' }, mobility: { programId: 'whole', startedAt: '2026-10-01T10:00:00' } },
  createdAt: '2026-10-01T10:00:00',
};
const ctx = (logs: SessionLog[] = [], tests: ModuleCtx['tests'] = []): ModuleCtx => ({ profile, logs, tests, now: NOW, checkin: { date: '2026-11-22', feeling: 'okej', minutes: 60, place: 'gym' } });
const done = (kg: number, reps: number[], date: string): Done => ({ date, result: { id: 'bench', name: 'Bänkpress', sets: reps.map((r) => ({ kg, reps: r })), feel: 2 } });

describe('Gym: progression, platå och byte', () => {
  it('beräknat max följer Epley', () => {
    expect(e1rm(100, 1)).toBe(100);
    expect(e1rm(100, 10)).toBeCloseTo(133.3, 0);
  });

  it('platåtips efter tre pass utan framsteg, inte när det går framåt', () => {
    const stuck = [done(80, [6, 6, 5], '2026-11-20'), done(80, [6, 6, 5], '2026-11-17'), done(80, [6, 6, 6], '2026-11-13')];
    expect(plateauTip(stuck, EX.bench)).toMatch(/Platå/);
    const moving = [done(82.5, [6, 6, 6], '2026-11-20'), done(80, [6, 6, 6], '2026-11-17'), done(77.5, [6, 6, 6], '2026-11-13')];
    expect(plateauTip(moving, EX.bench)).toBeUndefined();
  });

  it('liknande övningar tränar samma muskel och fungerar med utrustningen', () => {
    const home = similar('bench', new Set(['dumbbell', 'bench']));
    expect(home.length).toBeGreaterThan(0);
    for (const e of home) {
      expect(e.primary.some((m) => EX.bench.primary.includes(m)), e.id).toBe(true);
      expect(e.needs.every((n) => n === 'dumbbell' || n === 'bench'), e.id).toBe(true);
    }
    const item: StrengthItem = { id: 'bench', name: 'Bänkpress', sets: 3, reps: [6, 10], kg: 80, step: 2.5, restSec: 180, cue: '' };
    const swapped = swapItem(item, home[0].id, []);
    expect(swapped?.id).toBe(home[0].id);
    expect(swapped?.sets).toBe(3);
  });

  it('egna övningar läggs till, kan bytas till och tas bort', () => {
    const mine: CustomExercise = { id: 'c_test', custom: true, name: 'Landmine press', group: 'Axlar', primary: ['front_delt'], secondary: [], needs: ['barbell'], compound: true, reps: [8, 12], step: 2.5, rest: 90, cue: 'Pressa snett uppåt', tips: ['a', 'b', 'c'], how: ['Steg ett'] };
    registerCustom([mine]);
    expect(EX.c_test?.name).toBe('Landmine press');
    expect(similar('ohp', new Set(['barbell'])).some((e) => e.id === 'c_test')).toBe(true);
    registerCustom([]);
    expect(EX.c_test).toBeUndefined();
  });
});

describe('Löpning: tempo', () => {
  it('zoner från ett 5 km-test: lugnt långsammare än tempo, tempo långsammare än intervall', () => {
    const z = paceZones(ctx([], [{ id: 't', module: 'run', testId: '5k', value: 27.5, unit: 'min', date: '2026-11-10T10:00:00' }]))!;
    expect(z.p5).toBeCloseTo(330, 0); // 5:30 /km
    expect(z.easy[0]).toBeGreaterThan(z.tempo[1]);
    expect(z.tempo[0]).toBeGreaterThan(z.interval[1] - 5);
    expect(zonePosition((z.easy[0] + z.easy[1]) / 2, z.easy)).toBeCloseTo(0);
    expect(zonePosition(z.easy[0] - 30, z.easy)).toBeLessThan(-1); // faster than the zone
  });

  it('utan test eller GPS-rundor finns inga zoner, och Riegel räknar längre lopp långsammare per km', () => {
    expect(paceZones(ctx())).toBeNull();
    expect(riegel(1500, 5, 10) / 10).toBeGreaterThan(1500 / 5);
  });
});

describe('Din vecka i siffror', () => {
  it('visas söndag kväll och måndag förmiddag', () => {
    expect(wrappedWeek(NOW)).not.toBeNull();
    expect(wrappedWeek(new Date('2026-11-22T17:00:00'))).toBeNull();
    expect(wrappedWeek(new Date('2026-11-23T09:00:00'))?.getDate()).toBe(16);
    expect(wrappedWeek(new Date('2026-11-25T19:00:00'))).toBeNull();
  });

  it('räknar veckans pass, set och km', () => {
    const logs: SessionLog[] = [
      { id: 'a', module: 'gym', type: 'full_a', title: 'Gym', startedAt: '2026-11-17T18:00:00', minutes: 50, data: { kind: 'strength', exercises: [{ id: 'bench', name: 'Bänk', sets: [{ kg: 60, reps: 8 }, { kg: 60, reps: 8 }], feel: 2 }] } },
      { id: 'b', module: 'run', type: 'easy', title: 'Lugnt', startedAt: '2026-11-19T07:00:00', minutes: 32, data: { kind: 'run', distanceKm: 5.2 } },
    ];
    const s = _test.summarize(logs, new Date('2026-11-16T00:00:00'));
    expect(s[0].big).toBe('2');
    expect(s.find((x) => x.kind === 'gym')?.big).toBe('2');
    expect(s.find((x) => x.kind === 'run')?.big).toBe('5,2');
  });
});
