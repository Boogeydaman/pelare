import { describe, expect, it } from 'vitest';
import { EX } from '../modules/gym/exercises';
import { MODULE_LIST } from '../modules/registry';
import type { ModuleCtx } from '../modules/types';
import { coach, planLoad } from './coach';
import type { CheckIn, Feeling, Profile, SessionLog } from './types';

const NOW = new Date('2026-11-20T17:00:00'); // Friday
const ago = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();

const profile: Profile = {
  goals: { gym: 'stronger', run: '5k', mobility: 'general' }, daysPerWeek: 4, places: ['gym'], homeEquipment: [],
  enrollments: { gym: { programId: 'fullbody', startedAt: ago(24 * 40) }, run: { programId: '5k', startedAt: ago(24 * 40) }, mobility: { programId: 'general', startedAt: ago(24 * 40) } },
  createdAt: ago(24 * 60),
};
const checkin = (feeling: Feeling = 'okej', minutes = 60): CheckIn => ({ date: '2026-11-20', feeling, minutes, place: 'gym' });
const ctx = (logs: SessionLog[], c = checkin()): ModuleCtx => ({ profile, logs, tests: [], now: NOW, checkin: c });

let n = 0;
const gymLog = (h: number, ids: string[]): SessionLog => ({
  id: `g${n++}`, module: 'gym', type: 'full_a', title: 'Gym', startedAt: ago(h), minutes: 50, feel: 2,
  data: { kind: 'strength', exercises: ids.map((id) => ({ id, name: EX[id].name, sets: [{ kg: 60, reps: 8 }, { kg: 60, reps: 8 }, { kg: 60, reps: 8 }] })) },
});
const runLog = (h: number, type = 'easy', minutes = 30): SessionLog => ({ id: `r${n++}`, module: 'run', type, title: type, startedAt: ago(h), minutes, feel: 2, data: { kind: 'run', distanceKm: 5 } });
const mobLog = (h: number): SessionLog => ({ id: `m${n++}`, module: 'mobility', type: 'general', title: 'Stretch', startedAt: ago(h), minutes: 15, data: { kind: 'mobility', holdsDone: 8 } });

const all = (v: ReturnType<typeof coach>) => [v.primary, ...v.alternatives];
const hard = (s: ReturnType<typeof coach>['primary']) => s.effort === 'hårt' || !!planLoad(s, MODULE_LIST).hard;
const heavyLegs = (s: ReturnType<typeof coach>['primary']) => { const l = planLoad(s, MODULE_LIST); return !!l.hard && (l.legs ?? 0) >= 0.8; };

// Three easy runs in the last month so intervals are allowed.
const base = [runLog(24 * 12), runLog(24 * 15), runLog(24 * 18)];

describe('Coachen', () => {
  it('trött → inga hårda förslag', () => {
    const v = coach(ctx(base, checkin('trott')), MODULE_LIST);
    for (const s of all(v)) expect(hard(s), s.title).toBe(false);
    expect(v.notes.some((x) => x.text.includes('trött'))).toBe(true);
  });

  it('tunga ben i går → varken tunga benpass eller hård löpning', () => {
    const v = coach(ctx([...base, gymLog(20, ['squat', 'rdl', 'bulgarian'])]), MODULE_LIST);
    for (const s of all(v)) expect(heavyLegs(s), s.title).toBe(false);
  });

  it('hård löpning i går → inget tungt benpass i dag', () => {
    const v = coach(ctx([...base, runLog(20, 'intervals', 35)]), MODULE_LIST);
    for (const s of all(v)) expect(heavyLegs(s), s.title).toBe(false);
  });

  it('två hårda dagar i rad → bara lugnt', () => {
    const v = coach(ctx([...base, gymLog(24, ['bench', 'pullup']), runLog(48, 'intervals', 35)]), MODULE_LIST);
    for (const s of all(v)) expect(hard(s), s.title).toBe(false);
  });

  it('hårt pass redan i dag → resten av dagen lugn', () => {
    const v = coach(ctx([...base, gymLog(2, ['bench', 'pullup'])]), MODULE_LIST);
    for (const s of all(v)) expect(hard(s), s.title).toBe(false);
  });

  it('det som ligger efter med få dagar kvar prioriteras', () => {
    // Gym and mobility done for the week, no runs yet, Friday.
    const weekLogs = [gymLog(24 * 3, ['bench']), gymLog(24 * 2, ['squat']), gymLog(24 * 4, ['rdl']), mobLog(5), mobLog(30), mobLog(54), mobLog(78), mobLog(100)];
    const v = coach(ctx([...base, ...weekLogs]), MODULE_LIST);
    expect(v.primary.module).toBe('run');
    expect(v.primary.reasons[0].text).toMatch(/Löpning: 0 av/);
  });

  it('allt i mål → vila eller något lugnt', () => {
    const weekLogs = [gymLog(24 * 3, ['bench']), gymLog(24 * 2, ['lateral_cable']), gymLog(24 * 4, ['preacher_curl']), runLog(5), runLog(28), runLog(76), mobLog(6), mobLog(30), mobLog(54), mobLog(78), mobLog(100)];
    const v = coach(ctx([...base, ...weekLogs]), MODULE_LIST);
    expect(hard(v.primary)).toBe(false);
  });

  it('uppvärmning före och stretch efter föreslås alltid till gym och löpning', () => {
    for (const minutes of [30, 45, 90]) {
      const v = coach(ctx(base, checkin('pigg', minutes)), MODULE_LIST);
      if (v.primary.module !== 'gym' && v.primary.module !== 'run') continue;
      expect(v.addOns.map((a) => a.when)).toEqual(['före', 'efter']);
      const total = v.primary.minutes + v.addOns.filter((a) => a.fits).reduce((a, x) => a + x.session.minutes, 0);
      expect(total).toBeLessThanOrEqual(minutes);
    }
  });

  it('alla förslag ryms i tillgänglig tid', () => {
    for (const minutes of [20, 30, 45]) {
      const v = coach(ctx(base, checkin('okej', minutes)), MODULE_LIST);
      for (const s of all(v)) expect(s.minutes, `${s.title} ${minutes}`).toBeLessThanOrEqual(minutes);
    }
  });

  it('sjuk → vila, bara lätt stretch som alternativ och veckomålen pausas', () => {
    const v = coach(ctx(base, checkin('sjuk')), MODULE_LIST);
    expect(v.primary.type).toBe('sick');
    for (const s of v.alternatives) expect(hard(s)).toBe(false);
    expect(v.notes.some((x) => x.text.includes('inget behöver tas igen'))).toBe(true);
  });

  it('tillbaka efter uppehåll → ingen jakt på missade pass och inget hårt första passet', () => {
    const v = coach(ctx([runLog(24 * 8), gymLog(24 * 9, ['squat'])], checkin('pigg')), MODULE_LIST);
    expect(v.notes.some((x) => x.text.includes('Välkommen tillbaka'))).toBe(true);
    expect(hard(v.primary)).toBe(false);
  });

  it('tillbaka efter sjukdom (sjuk i förrgår) → välkommen tillbaka', () => {
    const c: ModuleCtx = { ...ctx(base, checkin('okej')), recentCheckins: [{ date: '2026-11-18', feeling: 'sjuk', minutes: 45, place: 'gym' }] };
    const v = coach(c, MODULE_LIST);
    expect(v.notes.some((x) => x.text.includes('efter sjukdomen'))).toBe(true);
  });
});
