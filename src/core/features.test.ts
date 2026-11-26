import { describe, expect, it } from 'vitest';
import { EX } from '../modules/gym/exercises';
import { e1rm, plateauTip, similar, swapItem, weeklyTarget, type Done } from '../modules/gym/planner';
import { splitWarning } from '../modules/gym/diary';
import { hipTemplate, hipAdjust } from '../modules/gym/hip';
import { gymDaysOf, rehabCautious, rehabPhase, runsPerWeekOf, waitingFor } from '../modules/common';
import { stretchOk } from '../modules/mobility/rehab';
import { CHAPTERS, PHASE_INFO, chaptersFor } from '../rehab/content';
import { CRITERIA, HIP_TESTS, criterionByTest, latestTests, testDue } from '../rehab/criteria';
import { basicsFrom, inRehab, leftRehab, migratedPassed } from '../rehab/state';
import { SOURCE } from './sources';
import { build } from '../modules/gym/planner';
import { registerCustom, type CustomExercise } from '../modules/gym/custom';
import { paceZones, riegel, zonePosition } from '../modules/run/pace';
import { summarizeRun } from '../modules/run/summary';
import { run as runModule } from '../modules/run';
import type { ModuleCtx } from '../modules/types';
import { _test, wrappedWeek } from '../screens/Wrapped';
import { coach } from './coach';
import { MODULE_LIST } from '../modules/registry';
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

describe('Bålpass', () => {
  const gymLog = (date: string, type = 'full_a'): SessionLog => ({ id: `${type}${date}`, module: 'gym', type, title: type, startedAt: date, minutes: 10,
    data: { kind: 'strength', exercises: [{ id: type.startsWith('core') ? 'dead_bug' : 'bench', name: 'x', sets: [{ kg: 0, reps: 10 }], feel: 2 }] } });
  const mon = new Date('2026-11-23T09:00:00');
  const c = (logs: SessionLog[]): ModuleCtx => ({ ...ctx(logs), now: mon, checkin: { date: '2026-11-23', feeling: 'okej', minutes: 60, place: 'gym' } });
  const core = (v: ReturnType<typeof coach>) => v.addOns.some((a) => a.label === 'Bålpass');

  it('föreslås efter passet när ingen bål tränats på ett par dagar', () => {
    const v = coach(c([]), MODULE_LIST);
    if (v.primary.module === 'gym' || v.primary.module === 'run') expect(core(v)).toBe(true);
  });

  it('inte dagen efter ett bålpass, och räknas inte som ett gympass i veckan', () => {
    const logs = [gymLog('2026-11-23T07:00:00', 'core_a')];
    const v = coach(c(logs), MODULE_LIST);
    expect(core(v)).toBe(false);
    const gym = MODULE_LIST.find((m) => m.id === 'gym')!;
    expect(gym.weekly(c(logs)).done).toBe(0);
  });
});

describe('Få gympass i veckan', () => {
  it('veckomålet per muskel följer antalet pass, aldrig under minsta dosen', () => {
    expect(weeklyTarget('muscle', 2)).toBe(6);
    expect(weeklyTarget('stronger', 2)).toBe(6);
    expect(weeklyTarget('muscle', 4)).toBe(12);
    expect(weeklyTarget('muscle', 5)).toBe(14);
    expect(weeklyTarget('maintain', 1)).toBe(4);
  });

  it('varnar när ett 4-dagarsprogram körs två dagar och föreslår helkropp', () => {
    const p = (programId: string, gymDays: number): Profile => ({ ...profile, gymDays, enrollments: { ...profile.enrollments, gym: { programId, startedAt: '2026-11-01T10:00:00' } } });
    expect(splitWarning(p('allmuscles', 2))?.to).toBe('minimal');
    expect(splitWarning(p('upperlower', 2))?.to).toBe('minimal');
    expect(splitWarning(p('allmuscles', 4))).toBeNull();
    expect(splitWarning(p('minimal', 2))).toBeNull();
    expect(splitWarning({ ...p('allmuscles', 2), places: ['home'], homeEquipment: ['dumbbell'] })?.to).toBe('home_db');
  });
});

describe('Efter höftprotes', () => {
  const hip = (surgery: string, extra: Partial<NonNullable<Profile['rehab']>> = {}): Profile => ({
    ...profile, goals: { ...profile.goals, run: 'walk' }, rehab: { kind: 'hip', surgery, side: 'höger', approach: 'bakre', ...extra },
    enrollments: { ...profile.enrollments, gym: { programId: 'hip_rehab', startedAt: surgery }, run: { programId: 'walk', startedAt: surgery } },
  });
  const at = (p: Profile, logs: SessionLog[] = []): ModuleCtx => ({ ...ctx(logs), profile: p });

  it('utan kriterier följer fasen kalendern (gamla profiler), före operationen är det prehab', () => {
    expect(rehabPhase(hip('2026-11-21'), NOW)).toBe(1);
    expect(rehabPhase(hip('2026-11-15'), NOW)).toBe(2);
    expect(rehabPhase(hip('2026-10-20'), NOW)).toBe(3);
    expect(rehabPhase(hip('2026-09-20'), NOW)).toBe(4);
    expect(rehabPhase(hip('2026-07-01'), NOW)).toBe(5);
    expect(rehabPhase(hip('2026-07-01', { holdPhase: 3 }), NOW)).toBe(3);
    expect(rehabPhase(hip('2026-07-01', { ended: true }), NOW)).toBeNull();
    expect(rehabPhase(hip('2026-12-10'), NOW)).toBe(0);
  });

  it('kriterierna styr fasen, och läkningen sätter ett golv', () => {
    const d = '2026-11-01';
    expect(rehabPhase(hip('2026-09-20', { passed: {} }), NOW)).toBe(1);
    expect(rehabPhase(hip('2026-09-20', { passed: { 1: d } }), NOW)).toBe(2);
    expect(rehabPhase(hip('2026-09-20', { passed: { 1: d, 2: d, 3: d } }), NOW)).toBe(4);
    // 3 weeks after surgery: criteria for phase 3 met, but phase 4 not before week 6
    const early = hip('2026-11-01', { passed: { 1: d, 2: d, 3: d } });
    expect(rehabPhase(early, NOW)).toBe(3);
    expect(waitingFor(early, NOW)).toEqual({ phase: 4, week: 6 });
    // a gap in the criteria stops there
    expect(rehabPhase(hip('2026-07-01', { passed: { 1: d, 3: d } }), NOW)).toBe(2);
  });

  it('gamla profiler behåller sin fas när kriterierna införs', () => {
    const old = hip('2026-09-20');
    const passed = migratedPassed(old, NOW)!;
    expect(Object.keys(passed).map(Number)).toEqual([1, 2, 3]);
    expect(rehabPhase({ ...old, rehab: { ...old.rehab!, passed } }, NOW)).toBe(4);
    expect(migratedPassed(hip('2026-09-20', { passed: {} }), NOW)).toBeNull();
  });

  it('före operationen: prehab 3 gånger i veckan och fria stretchar', () => {
    const p = hip('2026-12-20');
    const { tpl } = hipTemplate(at(p));
    expect(tpl.type.startsWith('hip0_')).toBe(true);
    expect(gymDaysOf(p)).toBe(3);
    expect(runsPerWeekOf(p)).toBe(3);
    expect(rehabCautious(p, NOW)).toBe(false);
  });

  it('fas 1 är ett kort program flera gånger om dagen, och inga löppass', () => {
    const p = hip('2026-11-21');
    const { tpl } = hipTemplate(at(p));
    expect(tpl.slots.map((x) => x.ex)).toContain('ankle_pumps');
    expect(tpl.slots.map((x) => x.ex)).toContain('supine_abd_slide');
    expect(gymDaysOf(p)).toBe(7);
    expect(runsPerWeekOf(p)).toBe(0);
  });

  const both = (p: Profile, type: string) => [0, 1].flatMap((k) => hipTemplate(at(p, Array.from({ length: k }, (_, i) => ({ id: `h${i}`, module: 'gym' as const, type, title: '', startedAt: '2026-11-20T10:00:00', minutes: 20 })))).tpl.slots.map((x) => x.ex));

  it('sidosnitt: abduktion utan motstånd tills kirurgen gett klartecken', () => {
    const all = both(hip('2026-10-20', { approach: 'sido' }), 'hip3_a');
    for (const ex of ['band_abd', 'sidelying_abd', 'cable_hip_abd']) expect(all).not.toContain(ex);
    expect(all).toContain('standing_hip_abd');
    expect(both(hip('2026-10-20', { approach: 'sido', abdCleared: true }), 'hip3_a')).toContain('sidelying_abd');
  });

  it('partiell belastning: övningar på två ben', () => {
    const all = both(hip('2026-10-20', { weightBearing: 'partiell' }), 'hip3_a');
    for (const ex of ['lateral_step_up', 'single_leg_stance', 'glute_bridge']) if (ex !== 'glute_bridge') expect(all).not.toContain(ex);
    expect(all).toContain('mini_squat');
  });

  it('tung styrka tidigt: 4 × 5 i fas 3', () => {
    const { tpl } = hipTemplate(at(hip('2026-10-20', { heavy: true })));
    const lp = tpl.slots.find((x) => x.ex === 'leg_press');
    expect(lp?.sets).toBe(4);
    expect(lp?.reps).toEqual([5, 5]);
  });

  it('hemma utan maskiner byts benpress mot knäböj', () => {
    const p = { ...hip('2026-10-20'), places: ['home' as const] };
    const c: ModuleCtx = { ...at(p), checkin: { date: '2026-11-22', feeling: 'okej', minutes: 60, place: 'home' } };
    const ex = hipTemplate(c).tpl.slots.map((x) => x.ex);
    expect(ex).not.toContain('leg_press');
    expect(ex).toContain('box_squat');
  });

  it('kriterier med test bockas i av testresultatet', () => {
    const t = (testId: string, value: number, date: string) => ({ id: testId + date, module: 'gym' as const, testId, value, unit: '', date });
    const latest = latestTests([t('hip_stance', 6, '2026-11-01'), t('hip_stance', 14, '2026-11-20')]);
    const c = CRITERIA[3].find((x) => x.id === 'enben')!;
    expect(criterionByTest(c, latest)).toBe(true);
    expect(criterionByTest(CRITERIA[3].find((x) => x.id === 'uppres')!, latest)).toBeUndefined();
    expect(testDue(3, [t('hip_stance', 14, '2026-11-20')], NOW)).toBe(false);
    expect(testDue(3, [t('hip_stance', 14, '2026-10-20')], NOW)).toBe(true);
    expect(testDue(1, [], NOW)).toBe(false);
    for (const x of Object.values(CRITERIA).flat()) if (x.test) expect(HIP_TESTS.some((h) => h.id === x.test!.id), x.id).toBe(true);
  });

  it('smärta över 5 förra passet ger ett lättare pass', () => {
    const p = hip('2026-09-20');
    const logs: SessionLog[] = [{ id: 'x', module: 'gym', type: 'hip3_a', title: '', startedAt: '2026-11-21T10:00:00', minutes: 30, pain: 7 }];
    const c = at(p, logs);
    const plan = hipAdjust(c, build(c, hipTemplate(c).tpl, { reasons: [''] }));
    expect(plan.reasons[0].text).toMatch(/ont/);
  });

  it('djupa höftstretchar väntar, överkroppen går bra direkt', () => {
    const early = hip('2026-11-15');
    expect(stretchOk(early, 'doorway', NOW)).toBe(true);
    expect(stretchOk(early, 'pigeon', NOW)).toBe(false);
    expect(stretchOk(early, 'hip_flexor', NOW)).toBe(false);
    expect(stretchOk(hip('2026-09-20'), 'hip_flexor', NOW)).toBe(true);
    expect(stretchOk(hip('2026-03-01'), 'pigeon', NOW)).toBe(false);
    expect(stretchOk(hip('2026-03-01', { cleared: true }), 'pigeon', NOW)).toBe(true);
  });

  it('coachen föreslår promenad i stället för löpning, och inga djurrörelser', () => {
    const v = coach(at(hip('2026-09-20')), MODULE_LIST);
    for (const s of [v.primary, ...v.alternatives]) if (s.module === 'run') expect(s.type).toBe('walk');
    expect(v.addOns.some((a) => a.label === 'Djurrörelser')).toBe(false);
  });

  it('läroboken: alla källor finns, tabellerna är hela och kapitlen följer faserna', () => {
    expect(chaptersFor(0).every((c) => c.phase === 0)).toBe(true);
    expect(chaptersFor(5).length).toBe(CHAPTERS.length);
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(CHAPTERS.length);
    expect(CHAPTERS.length).toBeGreaterThanOrEqual(20);
    for (const c of CHAPTERS) {
      for (const n of c.sources) expect(SOURCE[n], `${c.id} → ${n}`).toBeDefined();
      const text = JSON.stringify(c.sections) + c.lead;
      for (const m of text.matchAll(/\[(\d+)\]/g)) expect(c.sources, `${c.id} citerar [${m[1]}]`).toContain(Number(m[1]));
      for (const s of c.sections) if (s.table) for (const r of s.table.rows) expect(r.length, `${c.id}: ${r[0]}`).toBe(s.table.head.length);
      expect(c.key.length).toBeGreaterThanOrEqual(2);
    }
    for (let ph = 0; ph <= 5; ph++) expect(PHASE_INFO[ph].goals.length).toBeGreaterThanOrEqual(3);
    expect(inRehab(hip('2026-11-15'), NOW)).toBe(true);
    expect(inRehab(hip('2026-12-15'), NOW)).toBe(true);
    expect(inRehab(hip('2026-11-15', { ended: true }), NOW)).toBe(false);
  });

  it('lämna rehabläget: svaren på startfrågorna ger de vanliga programmen', () => {
    const p = { ...hip('2026-03-01'), gymDays: 3, mobilityFocus: [] };
    const start = basicsFrom(p);
    expect(start.goals.run).toBe('walk'); // no go-ahead for running yet
    const out = leftRehab(p, { goals: { gym: 'muscle', run: 'walk', mobility: 'general' }, focus: ['hips'], gymDays: 2, places: ['gym'], equip: [] }, NOW);
    expect(out.rehab?.ended).toBe(true);
    expect(out.rehab?.cleared).toBeFalsy();
    expect(out.goals.gym).toBe('muscle');
    expect(out.goals.mobility).toBe('hips');
    expect(out.mobilityFocus).toEqual(['hips']);
    expect(out.gymDays).toBe(2);
    expect(out.enrollments.gym.programId).toBe('minimal');
    expect(out.enrollments.run.programId).toBe('walk');
    expect(inRehab(out, NOW)).toBe(false);
    // choosing a running goal records the go-ahead
    const run = leftRehab(p, { ...start, goals: { ...start.goals, run: '5k' }, cleared: true }, NOW);
    expect(run.rehab?.cleared).toBe(true);
    expect(run.enrollments.run.programId).toBe('5k');
    expect(basicsFrom(run).goals.run).toBe('5k');
    // ticked the go-ahead but chose walking after all: not recorded
    expect(leftRehab(p, { ...start, cleared: true }, NOW).rehab?.cleared).toBeFalsy();
  });

  it('mer svullet på morgonen ger ett lättare pass', () => {
    const p = hip('2026-10-20');
    const c: ModuleCtx = { ...at(p), checkin: { date: '2026-11-22', feeling: 'okej', minutes: 60, place: 'gym', swelling: true } };
    const plan = hipAdjust(c, build(c, hipTemplate(c).tpl, { reasons: [''] }));
    expect(plan.reasons[0].text).toMatch(/svullen/);
  });

  it('höften ondare på morgonen ger ett lättare pass', () => {
    const p = hip('2026-09-20');
    const c: ModuleCtx = { ...at(p), checkin: { date: '2026-11-22', feeling: 'okej', minutes: 60, place: 'gym', hipPain: 6 } };
    const plan = hipAdjust(c, build(c, hipTemplate(c).tpl, { reasons: [''] }));
    expect(plan.reasons[0].text).toMatch(/ömmare/);
  });
});

describe('Sammanfattning efter löprundan', () => {
  const r = (id: string, day: number, minutes: number, distanceKm?: number, extra: object = {}): SessionLog => ({
    id, module: 'run', type: 'easy', title: 'Lugn', startedAt: new Date(2026, 10, day, 8).toISOString(), minutes,
    data: { kind: 'run', ...(distanceKm ? { distanceKm } : {}), ...extra },
  } as SessionLog);

  it('första rundan', () => {
    expect(summarizeRun(r('a', 10, 30, 4), []).headline).toBe('Första rundan är gjord!');
  });
  it('rekord för distans, tempo och km', () => {
    const prev = [r('a', 5, 30, 4, { splits: [420, 430] }), r('b', 7, 30, 4.2)];
    const s = summarizeRun(r('c', 10, 32, 5, { splits: [380, 390, 385, 384, 381] }), prev);
    expect(s.headline).toBe('4 nya rekord!');
    const recs = runModule.records!(prev, r('c', 10, 32, 5, { splits: [380, 390, 385, 384, 381] }));
    expect(recs.map((x) => x.title)).toContain('Snabbaste kilometern');
    expect(recs.map((x) => x.title)).toContain('Snabbaste rundan (3 km+)');
  });
  it('tid i målzonen och för fort', () => {
    const good = summarizeRun(r('c', 10, 30, 4, { zone: { green: 1500, fast: 150, slow: 150 } }), [r('a', 1, 30, 4)]);
    expect(good.zone?.pct).toBe(83);
    expect(good.headline).toBe('Perfekt tempo!');
    const fast = summarizeRun(r('c', 10, 30, 4, { zone: { green: 600, fast: 1000, slow: 200 } }), [r('a', 1, 30, 4)]);
    expect(fast.lines.join(' ')).toMatch(/för fort.*lugna/i);
  });
  it('jämför med förra rundan (nyaste först)', () => {
    const s = summarizeRun(r('c', 10, 30, 4), [r('b', 8, 28, 4), r('a', 1, 40, 4)]);
    expect(s.lines.join(' ')).toMatch(/30 s\/km långsammare än förra rundan/);
  });
});

describe('Efter dagens pass och intervaller', () => {
  it('dagen är klar efter ett hårt löppass – och 24-timmarsregeln visas inte om dagens eget pass', () => {
    const today: SessionLog = { id: 'r', module: 'run', type: 'intervals', title: 'Intervaller', startedAt: '2026-11-22T08:00:00', minutes: 40, data: { kind: 'run' } };
    const v = coach(ctx([today]), MODULE_LIST);
    expect(v.doneToday.map((l) => l.id)).toEqual(['r']);
    expect(v.notes.some((n) => /24 timmar/.test(n.text))).toBe(false);
    expect(v.notes[0].text).toMatch(/gjort/);
  });

  it('intervallpass visar intervalltider i stället för kilometertider', () => {
    const l = (id: string, day: number, ints: [number, number][]): SessionLog => ({ id, module: 'run', type: 'intervals', title: 'Intervaller', startedAt: new Date(2026, 10, day, 8).toISOString(), minutes: 40,
      data: { kind: 'run', distanceKm: 6, splits: [330, 300, 320], intervals: ints.map(([seconds, meters]) => ({ seconds, meters })) } });
    const s = summarizeRun(l('b', 20, [[180, 750], [180, 760], [180, 755]]), [l('a', 13, [[180, 720], [180, 720], [180, 720]])]);
    expect(s.reps?.length).toBe(3);
    expect(s.splits).toBeUndefined();
    expect(s.lines.join(' ')).toMatch(/Snitt i intervallerna/);
    expect(s.lines.join(' ')).toMatch(/Jämna intervaller/);
    expect(s.lines.join(' ')).toMatch(/snabbare i de hårda delarna/);
  });
});
