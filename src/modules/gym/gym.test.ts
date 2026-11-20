import { describe, expect, it } from 'vitest';
import type { ExerciseResult, Feel, Profile, SessionLog } from '../../core/types';
import type { ModuleCtx } from '../types';
import { EX, EXERCISES, type Muscle } from './exercises';
import { weeklySplit } from '../common';
import { build, equipmentAt, nextTemplate, resolve, target, volume, weeklyTarget } from './planner';
import { PROGRAMS } from './programs';
import { gymRecords } from './progress';
import { HOWTO } from './howto';
import { ANIMS } from '../../shared/ui/poses';
import { placed } from '../../shared/ui/skeleton';
import { frameAt } from '../../shared/ui/Figure';
import { STRETCH_HOW } from '../mobility/howto';
import { STRETCHES, STRETCH_ANIM } from '../mobility/stretches';

const NOW = new Date('2026-11-20T17:00:00');
const ago = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();

const profile = (p: Partial<Profile> = {}): Profile => ({
  goals: { gym: 'stronger', run: '5k', mobility: 'front_split' }, daysPerWeek: 4, places: ['gym', 'home'], homeEquipment: [],
  enrollments: { gym: { programId: 'fullbody', startedAt: ago(24 * 30) }, run: { programId: '5k', startedAt: ago(24 * 30) }, mobility: { programId: 'front_split', startedAt: ago(24 * 30) } },
  createdAt: ago(24 * 60), ...p,
});
const ctx = (p: Partial<ModuleCtx> = {}): ModuleCtx => ({
  profile: profile(), logs: [], tests: [], now: NOW,
  checkin: { date: '2026-11-20', feeling: 'okej', minutes: 60, place: 'gym' }, ...p,
});
const log = (h: number, results: [id: string, kg: number, reps: number[], feel?: Feel][]): SessionLog => ({
  id: Math.random().toString(36), module: 'gym', type: 'full_a', title: 'Pass', startedAt: ago(h), minutes: 50,
  data: { kind: 'strength', exercises: results.map(([id, kg, reps, feel]): ExerciseResult => ({ id, name: EX[id].name, sets: reps.map((r) => ({ kg, reps: r })), feel: feel ?? 2 })) },
});

describe('Övningsbiblioteket', () => {
  it('alla länkar (lättare, svårare, ersättare) pekar på övningar som finns', () => {
    for (const e of EXERCISES) {
      for (const id of [e.easier, e.harder, ...(e.alt ?? [])].filter(Boolean) as string[]) {
        expect(EX[id], `${e.id} → ${id}`).toBeDefined();
      }
      if (e.harder) expect(EX[e.harder].easier, `${e.harder} ska peka tillbaka på ${e.id}`).toBe(e.id);
    }
  });

  it('har minst 60 övningar och en kroppsviktsvariant för varje grundrörelse', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(60);
    const home = equipmentAt(profile(), 'home');
    for (const id of ['squat', 'bench', 'pullup', 'ohp', 'rdl', 'oh_triceps', 'preacher_curl', 'cable_crunch']) {
      const r = resolve(id, home);
      expect(r, id).not.toBeNull();
      expect(r!.needs).toEqual([]);
    }
  });
});

describe('Programmen', () => {
  const groups: Record<string, Muscle[]> = { bröst: ['chest'], rygg: ['lats', 'upper_back'], framsida: ['quads'], baksida: ['hamstrings', 'glutes'] };

  it('träffar bröst, rygg och ben minst två gånger i veckan', () => {
    for (const p of PROGRAMS) {
      const week = Array.from({ length: p.perWeek }, (_, i) => p.sessions[i % p.sessions.length]);
      for (const [name, muscles] of Object.entries(groups)) {
        const times = week.filter((s) => s.slots.some((x) => EX[x.ex].primary.some((m) => muscles.includes(m)))).length;
        expect(times, `${p.name}: ${name}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('håller sig under taket på cirka 10 set per muskel och pass', () => {
    for (const p of PROGRAMS) for (const s of p.sessions) {
      const v: Record<string, number> = {};
      for (const x of s.slots) {
        EX[x.ex].primary.forEach((m) => (v[m] = (v[m] ?? 0) + x.sets));
        EX[x.ex].secondary.forEach((m) => (v[m] = (v[m] ?? 0) + x.sets * 0.5));
      }
      for (const [m, n] of Object.entries(v)) expect(n, `${s.title}: ${m}`).toBeLessThanOrEqual(10);
    }
  });
});

describe('Progression', () => {
  it('alla set på toppen av intervallet → minsta viktökningen', () => {
    const t = target(EX.squat, [log(72, [['squat', 80, [10, 10, 10]]])]);
    expect(t.kg).toBe(82.5);
    expect(t.reps).toBe(6);
  });

  it('inte på toppen → samma vikt, en rep till', () => {
    const t = target(EX.squat, [log(72, [['squat', 80, [8, 8, 7]]])]);
    expect(t.kg).toBe(80);
    expect(t.reps).toBe(8);
  });

  it('två tunga pass i rad → vikten sänks 7,5 %', () => {
    const t = target(EX.squat, [log(72, [['squat', 80, [5, 5, 4], 3]]), log(168, [['squat', 80, [6, 5, 5], 3]])]);
    expect(t.kg).toBe(75);
  });

  it('kroppsvikt: toppen nådd → nästa steg i stegen', () => {
    const t = target(EX.pushup, [log(72, [['pushup', 0, [20, 20, 20]]])]);
    expect(t.ex.id).toBe('decline_pushup');
  });

  it('kroppsvikt: fortsätter på den svåraste varianten du har gjort', () => {
    const t = target(EX.pushup, [log(72, [['decline_pushup', 0, [10, 9, 9]]]), log(168, [['pushup', 0, [20, 20, 20]]])]);
    expect(t.ex.id).toBe('decline_pushup');
    expect(t.reps).toBe(10);
  });

  it('ingen historik → kalibrering', () => {
    expect(target(EX.squat, []).kg).toBeNull();
    expect(target(EX.pushup, []).kg).toBe(0);
  });
});

describe('Passbyggaren', () => {
  it('hemma utan utrustning blir allt kroppsvikt', () => {
    const s = build(ctx({ checkin: { date: '2026-11-20', feeling: 'okej', minutes: 60, place: 'home' } }), PROGRAMS[0].sessions[0]);
    expect(s.content.kind).toBe('strength');
    if (s.content.kind === 'strength') for (const i of s.content.items) expect(EX[i.id].needs, i.id).toEqual([]);
  });

  it('ryms i tillgänglig tid', () => {
    for (const minutes of [25, 35, 45]) {
      const s = build(ctx({ checkin: { date: '2026-11-20', feeling: 'okej', minutes, place: 'gym' } }), PROGRAMS[1].sessions[0]);
      expect(s.minutes, `${minutes} min`).toBeLessThanOrEqual(minutes);
    }
  });

  it('räknar veckovolym med sekundära muskler som halva set', () => {
    const v = volume([log(10, [['bench', 60, [8, 8, 8]]])], new Date(NOW.getTime() - 7 * 864e5));
    expect(v.chest).toBe(3);
    expect(v.triceps).toBe(1.5);
  });

  it('nedprioriterar passet när musklerna tränades hårt nyss', () => {
    const recent = log(20, [['squat', 80, [8, 8, 8]], ['incline_bench', 60, [8, 8, 8]], ['cs_row', 50, [10, 10, 10]]]);
    const s = build(ctx({ logs: [recent] }), PROGRAMS[0].sessions[0]);
    expect(s.penalty).toBeGreaterThan(0);
  });

  it('veckomålet följer målet', () => {
    expect(weeklyTarget('muscle')).toBeGreaterThan(weeklyTarget('stronger'));
    expect(weeklyTarget('maintain')).toBeGreaterThanOrEqual(4);
  });

  it('efter tio dagars uppehåll: 10 % lättare och ett set färre', () => {
    const old = log(24 * 12, [['squat', 100, [10, 10, 10]]]);
    const s = build(ctx({ logs: [old] }), PROGRAMS[0].sessions[0]);
    if (s.content.kind !== 'strength') throw new Error();
    const sq = s.content.items.find((i) => i.id === 'squat')!;
    expect(sq.kg).toBe(92.5); // 100 + 2.5 progression, then −10 % → 92.25 → 92.5
    expect(sq.sets).toBe(2);
    expect(s.reasons.some((r) => r.text.includes('dagar sedan senaste gympasset'))).toBe(true);
  });

  it('visar vad du gjorde förra gången', () => {
    const s = build(ctx({ logs: [log(72, [['squat', 80, [8, 8, 7]]])] }), PROGRAMS[0].sessions[0]);
    if (s.content.kind !== 'strength') throw new Error();
    expect(s.content.items.find((i) => i.id === 'squat')!.last).toMatch(/80 kg × 8, 8, 7/);
  });
});

describe('Rekord', () => {
  it('tyngre vikt än tidigare är ett rekord, första gången är det inte', () => {
    const first = log(200, [['squat', 80, [8, 8, 8]]]);
    expect(gymRecords([], first)).toEqual([]);
    const heavier = log(10, [['squat', 85, [6, 6, 6]]]);
    expect(gymRecords([first], heavier)[0].detail).toMatch(/85 kg/);
  });

  it('fler reps på samma vikt är ett rekord, och kroppsvikt räknar reps', () => {
    const a = log(200, [['squat', 80, [8, 8, 8]], ['pullup', 0, [6, 6, 5]]]);
    const b = log(10, [['squat', 80, [10, 9, 9]], ['pullup', 0, [8, 7, 6]]]);
    const r = gymRecords([a], b);
    expect(r.some((x) => x.detail.includes('80 kg × 10'))).toBe(true);
    expect(r.some((x) => x.detail.includes('8'))).toBe(true);
  });
});

describe('På resa och veckans fördelning', () => {
  it('på resa: dagens programpass i kroppsvikt, med samma typ så att det räknas i programmet', () => {
    const c = ctx({ checkin: { date: '2026-11-20', feeling: 'okej', minutes: 60, place: 'travel' } });
    const { tpl } = nextTemplate(c, PROGRAMS[0]);
    const s = build(c, tpl);
    expect(s.type).toBe(tpl.type);
    if (s.content.kind === 'strength') for (const i of s.content.items) expect(EX[i.id].needs, i.id).toEqual([]);
    // After logging it, the program moves on to the next session.
    const logged: SessionLog = { id: 'x', module: 'gym', type: s.type, title: s.title, startedAt: ago(1), minutes: 40 };
    expect(nextTemplate(ctx({ logs: [logged] }), PROGRAMS[0]).tpl.type).not.toBe(tpl.type);
  });

  it('gym och löpning ryms i dina träningsdagar och gym är alltid minst två', () => {
    for (const d of [2, 3, 4, 5, 6]) {
      const { gym, run } = weeklySplit(profile({ daysPerWeek: d }), 4, 3);
      expect(gym, `${d} dagar`).toBeGreaterThanOrEqual(2);
      expect(run, `${d} dagar`).toBeGreaterThanOrEqual(1);
      if (d >= 3) expect(gym + run, `${d} dagar`).toBeLessThanOrEqual(d);
    }
  });
});

describe('Instruktioner och figurer', () => {
  it('varje gymövning har tre steg och en figur som finns', () => {
    for (const e of EXERCISES) {
      expect(HOWTO[e.id], e.id).toBeDefined();
      expect(HOWTO[e.id].how.length, e.id).toBe(3);
      expect(ANIMS[HOWTO[e.id].anim], `${e.id} → ${HOWTO[e.id].anim}`).toBeDefined();
    }
  });

  it('varje stretch har en egen figur och steg-för-steg-instruktioner', () => {
    for (const s of STRETCHES) {
      expect(ANIMS[STRETCH_ANIM[s.id]], `${s.id} → ${STRETCH_ANIM[s.id]}`).toBeDefined();
      expect(STRETCH_HOW[s.id]?.how.length ?? 0, s.id).toBeGreaterThanOrEqual(3);
      expect(s.cue, s.id).toBe(STRETCH_HOW[s.id].cue);
    }
  });

  it('negativ eller ogiltig fas kraschar inte (animationens första bildruta)', () => {
    for (const a of Object.values(ANIMS)) for (const ph of [-0.001, -0.5, 1, 1.2, NaN]) {
      const { i, j } = frameAt(a, ph);
      expect(a.frames[i] && a.frames[j]).toBeTruthy();
    }
  });

  it('alla figurer går att rita i varje läge och håller sig i bild', () => {
    for (const [k, a] of Object.entries(ANIMS)) {
      for (let ph = 0; ph < 1; ph += 0.05) {
        const { i, j, t } = frameAt(a, ph);
        const { pose } = placed(a, i, j, t);
        for (const [joint, [x, y]] of Object.entries(pose)) {
          expect(Number.isFinite(x) && Number.isFinite(y), `${k} ${joint}`).toBe(true);
          expect(x > -10 && x < 130 && y > -14 && y < 116, `${k} ${joint} (${x.toFixed(0)}, ${y.toFixed(0)}) @${ph.toFixed(2)}`).toBe(true);
        }
      }
    }
  });
});
