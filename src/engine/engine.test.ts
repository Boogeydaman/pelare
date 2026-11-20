import { describe, expect, it } from 'vitest';
import { EXERCISE_BY_ID } from './exercises';
import { buildRun, walkRunStage } from './running';
import { LEG_PATTERNS, nextLoad } from './strength';
import { suggest } from './suggest';
import type {
  CheckIn, EngineInput, EngineOutput, ExerciseLog, Feel, Profile, RunKind, SessionLog, StrengthPlan, Suggestion, Today,
} from './types';

const NOW = new Date('2026-11-19T17:00:00');
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();
let seq = 0;

const profile = (p: Partial<Profile> = {}): Profile => ({
  level: 'intermediate', runLevel: 'some', focus: 'balanced', daysPerWeek: 4,
  mobilityGoals: ['front_split'], locations: ['gym', 'home'], homeEquipment: ['dumbbell', 'band'],
  createdAt: hoursAgo(24 * 120), ...p,
});

type Ex = [id: string, sets: number, reps: number, kg: number, feel?: Feel, isMain?: boolean];
const strength = (h: number, exs: Ex[], extra: Partial<SessionLog> = {}): SessionLog => ({
  id: `s${seq++}`, date: hoursAgo(h), pillar: 'strength', title: 'Styrka', minutes: 50, hard: true,
  strength: {
    template: 'full',
    exercises: exs.map(([exerciseId, sets, reps, kg, feel, isMain]): ExerciseLog => ({
      exerciseId, sets: Array.from({ length: sets }, () => ({ kg, reps, done: true })),
      repRange: EXERCISE_BY_ID[exerciseId].compound ? [6, 10] : [10, 20], targetRir: 2, feel: feel ?? 'lagom',
      isMain: isMain ?? EXERCISE_BY_ID[exerciseId].compound,
    })),
  },
  ...extra,
});
const run = (h: number, kind: RunKind, minutes: number, km?: number, feel: Feel = 'lagom', stage?: number): SessionLog => ({
  id: `r${seq++}`, date: hoursAgo(h), pillar: 'run', title: 'Löpning', minutes,
  hard: kind === 'interval' || kind === 'long', run: { kind, minutes, distanceKm: km, feel, stage },
});
const mob = (h: number, routineId = 'front_split', areas = ['hamstrings', 'hip_flexors']): SessionLog => ({
  id: `m${seq++}`, date: hoursAgo(h), pillar: 'mobility', title: 'Stretch', minutes: 15, hard: false,
  mobility: { routineId, minutes: 15, areas },
});
const today = (t: Partial<Today> = {}): Today => ({ feeling: 'okej', timeMin: 45, location: 'gym', pain: [], ...t });
const input = (p: Partial<EngineInput>): EngineInput => ({
  profile: profile(), sessions: [], checkins: [], now: NOW, today: today(), ...p,
});
const all = (o: EngineOutput): Suggestion[] => [o.best, ...o.alternatives];
const exercisesOf = (s: Suggestion) => (s.plan.kind === 'strength' ? s.plan.exercises.map((e) => EXERCISE_BY_ID[e.exerciseId]) : []);

// Five mobility days this week: mobility need is met.
const mobWeek = () => [mob(20), mob(44), mob(68), mob(92), mob(116)];

describe('Dagens pass – motorn', () => {
  it('1. Tunga ben i går → varken benpass, intervaller eller långpass', () => {
    const sessions = [
      strength(20, [['squat_bb', 4, 8, 80, 'tungt'], ['rdl_bb', 3, 8, 70, 'tungt'], ['bulgarian_db', 3, 10, 16, 'tungt']]),
      run(24 * 4, 'easy', 40, 7),
      ...mobWeek(),
    ];
    const out = suggest(input({ profile: profile({ runLevel: 'regular', focus: 'run' }), sessions, today: today({ timeMin: 60, feeling: 'pigg' }) }));
    for (const s of all(out)) {
      expect(exercisesOf(s).some((e) => LEG_PATTERNS.includes(e.pattern))).toBe(false);
      if (s.plan.kind === 'run') expect(['interval', 'long']).not.toContain(s.plan.runKind);
    }
    expect(out.notes.some((n) => n.rules.includes('concurrent.spacing'))).toBe(true);
  });

  it('2. Längsta passet 8 km senaste 30 dagarna → inget förslag över 8,8 km', () => {
    const sessions = [run(24 * 5, 'easy', 48, 8)];
    const p = profile({ runLevel: 'regular', focus: 'run' });
    for (const k of ['easy', 'long', 'interval'] as RunKind[]) {
      const plan = buildRun(k, p, sessions, NOW, 120);
      if (!plan) continue;
      expect(plan.minutes).toBeLessThanOrEqual(48 * 1.1);
      if (plan.estKm !== undefined) expect(plan.estKm).toBeLessThanOrEqual(8.8);
    }
    expect(buildRun('long', p, sessions, NOW, 120)).not.toBeNull();
    const out = suggest(input({ profile: p, sessions, today: today({ timeMin: 120, feeling: 'pigg' }) }));
    for (const s of all(out)) if (s.plan.kind === 'run' && s.plan.estKm) expect(s.plan.estKm).toBeLessThanOrEqual(8.8);
  });

  it('3. Bröst under veckomålet, återhämtat, 45 min → förslaget innehåller bröstövningar', () => {
    const sessions = [
      strength(72, [['bench_bb', 4, 8, 60], ['chest_press', 4, 10, 50], ['cable_row', 4, 10, 50], ['lat_pulldown', 4, 10, 50], ['ohp_bb', 3, 8, 35], ['db_lateral', 4, 15, 8], ['overhead_cable_ext', 4, 12, 20], ['incline_curl', 4, 12, 10], ['face_pull', 4, 15, 15], ['cable_crunch', 4, 15, 30]]),
      strength(20, [['squat_bb', 4, 8, 80, 'tungt'], ['rdl_bb', 4, 8, 70, 'tungt'], ['bulgarian_db', 4, 10, 16, 'tungt'], ['leg_curl', 4, 12, 40], ['calf_machine', 4, 12, 60], ['hip_thrust_bb', 4, 10, 80]]),
      run(48, 'easy', 30, 5),
      run(96, 'easy', 30, 5),
      ...mobWeek(),
    ];
    const out = suggest(input({ sessions, today: today({ timeMin: 45 }) }));
    expect(out.best.pillar).toBe('strength');
    expect(exercisesOf(out.best).some((e) => e.primary.includes('chest'))).toBe(true);
  });

  it('4. Ont i knät → inga övningar med hög knäbelastning och ingen löpning', () => {
    const out = suggest(input({ today: today({ pain: ['knee'], timeMin: 60, feeling: 'pigg' }) }));
    for (const s of all(out)) {
      expect(exercisesOf(s).some((e) => (e.load.knee ?? 0) >= 2)).toBe(false);
      expect(s.pillar).not.toBe('run');
    }
  });

  it('5. Trött → bara lugn löpning, rörlighet eller vila', () => {
    const out = suggest(input({ today: today({ feeling: 'trott', timeMin: 60 }) }));
    for (const s of all(out)) {
      expect(s.pillar).not.toBe('strength');
      expect(s.hard).toBe(false);
      if (s.plan.kind === 'run') expect(['easy', 'walk_run']).toContain(s.plan.runKind);
    }
  });

  it('6. 20 min tillgängligt → alla förslag ryms inom 20 min', () => {
    const sessions = [strength(24 * 4, [['squat_bb', 3, 8, 80], ['bench_bb', 3, 8, 60]]), run(24 * 3, 'easy', 30, 5)];
    const out = suggest(input({ sessions, today: today({ timeMin: 20, feeling: 'pigg' }) }));
    for (const s of all(out)) expect(s.minutes).toBeLessThanOrEqual(20);
    // A strength session should still be possible in 20 minutes.
    const strengthOnly = suggest(input({ sessions, profile: profile({ focus: 'strength' }), today: today({ timeMin: 20, feeling: 'pigg' }) }));
    const st = all(strengthOnly).find((s) => s.pillar === 'strength');
    expect(st).toBeDefined();
    expect(st!.minutes).toBeLessThanOrEqual(20);
  });

  it('7. Alla set på övre repgränsen → minsta viktökningen', () => {
    const ex = EXERCISE_BY_ID.squat_bb;
    const sessions = [strength(72, [['squat_bb', 3, 10, 60, 'lagom']])];
    expect(nextLoad(ex, sessions, [6, 10]).kg).toBe(62.5);
    // Not at the top → same weight.
    expect(nextLoad(ex, [strength(72, [['squat_bb', 3, 8, 60, 'lagom']])], [6, 10]).kg).toBe(60);
    // Two failed sessions in a row → drop 7.5 % (rounded to the increment).
    const failed = [strength(72, [['squat_bb', 3, 5, 60, 'tungt']]), strength(144, [['squat_bb', 3, 5, 60, 'tungt']])];
    expect(nextLoad(ex, failed, [6, 10]).kg).toBe(55);
    // No history → calibration.
    expect(nextLoad(ex, [], [6, 10]).kg).toBeNull();
  });

  it('8. Prestationen ner två pass i rad och trött → deload; nästa pass har halverad volym', () => {
    const sessions = [
      strength(24 * 2, [['squat_bb', 3, 6, 80, 'tungt', true]]),
      strength(24 * 5, [['squat_bb', 3, 7, 80, 'lagom', true]]),
      strength(24 * 8, [['squat_bb', 3, 8, 80, 'lagom', true]]),
    ];
    const out = suggest(input({ sessions, today: today({ feeling: 'trott' }) }));
    expect(out.deloadStart).toBeDefined();
    expect(out.notes.some((n) => n.rules.includes('strength.deload'))).toBe(true);

    const nextDay = new Date(NOW.getTime() + 24 * 3600_000);
    const out2 = suggest(input({ sessions, now: nextDay, deloadStart: out.deloadStart, profile: profile({ focus: 'strength' }), today: today({ feeling: 'pigg', timeMin: 60 }) }));
    const st = all(out2).find((s) => s.pillar === 'strength');
    expect(st).toBeDefined();
    const plan = st!.plan as StrengthPlan;
    expect(plan.deload).toBe(true);
    expect(Math.max(...plan.exercises.map((e) => e.sets))).toBeLessThanOrEqual(2);
  });

  it('9. Ont i axeln → inga övningar med hög axelbelastning; efter 14 dagar visas vårdrådet', () => {
    const pIn = input({ profile: profile({ focus: 'strength' }), today: today({ pain: ['shoulder'], timeMin: 60, feeling: 'pigg' }) });
    const out = suggest(pIn);
    for (const s of all(out)) expect(exercisesOf(s).some((e) => (e.load.shoulder ?? 0) >= 2)).toBe(false);
    expect(out.careAdvice).toEqual([]);

    const checkins: CheckIn[] = [
      { date: hoursAgo(24 * 15), feeling: 'okej', timeMin: 45, location: 'gym', pain: ['shoulder'] },
      { date: hoursAgo(24 * 7), feeling: 'okej', timeMin: 45, location: 'gym', pain: ['shoulder'] },
    ];
    const out2 = suggest({ ...pIn, checkins });
    expect(out2.careAdvice).toContain('shoulder');
    expect(out2.notes.some((n) => n.text.includes('fysioterapeut'))).toBe(true);
  });

  it('10. Samma huvudövningar genom hela blocket, systematiskt byte efter blocket', () => {
    let block = undefined as EngineOutput['block'] | undefined;
    const p = profile({ focus: 'strength' });
    const squatPicks: string[] = [];
    for (const day of [0, 3, 7, 14, 21, 35]) {
      const now = new Date(NOW.getTime() + day * 24 * 3600_000);
      const out = suggest(input({ profile: p, now, block, today: today({ timeMin: 60, feeling: 'pigg' }) }));
      block = out.block;
      squatPicks.push(block.picks['gym:squat'] ?? '');
    }
    expect(new Set(squatPicks).size).toBe(1);
    const later = suggest(input({ profile: p, now: new Date(NOW.getTime() + 43 * 24 * 3600_000), block, today: today({ timeMin: 60 }) }));
    expect(later.block.index).toBe(1);
  });
});

describe('Övriga regler', () => {
  it('Två hårda dagar i rad → bara lugna alternativ', () => {
    const sessions = [strength(20, [['bench_bb', 3, 8, 60]]), run(44, 'interval', 40, 7)];
    const out = suggest(input({ sessions, today: today({ feeling: 'pigg', timeMin: 60 }) }));
    for (const s of all(out)) expect(s.hard).toBe(false);
  });

  it('Hårt pass redan gjort i dag → bara lugna alternativ', () => {
    const sessions = [strength(2, [['bench_bb', 3, 8, 60], ['squat_bb', 3, 8, 80]])];
    const out = suggest(input({ sessions, today: today({ feeling: 'pigg', timeMin: 60 }) }));
    for (const s of all(out)) expect(s.hard).toBe(false);
  });

  it('Gå-spring trappas upp när passet inte kändes tungt', () => {
    const p = profile({ runLevel: 'none' });
    expect(walkRunStage(p, [])).toBe(0);
    expect(walkRunStage(p, [run(48, 'walk_run', 24, undefined, 'lagom', 0)])).toBe(1);
    expect(walkRunStage(p, [run(48, 'walk_run', 24, undefined, 'tungt', 2)])).toBe(2);
  });

  it('Hemma utan utrustning ger ett kroppsviktspass', () => {
    const out = suggest(input({ profile: profile({ focus: 'strength', homeEquipment: [] }), today: today({ location: 'home', feeling: 'pigg' }) }));
    const st = all(out).find((s) => s.pillar === 'strength');
    expect(st).toBeDefined();
    expect(exercisesOf(st!).every((e) => e.needs.length === 0)).toBe(true);
  });

  it('Beräknas på under 300 ms med åtta veckors historik', () => {
    const sessions: SessionLog[] = [];
    for (let d = 1; d <= 56; d++) {
      if (d % 7 === 1 || d % 7 === 4) sessions.push(strength(d * 24, [['squat_bb', 3, 8, 80], ['bench_bb', 3, 8, 60], ['cable_row', 3, 10, 50], ['db_lateral', 3, 15, 8]]));
      if (d % 7 === 2 || d % 7 === 5) sessions.push(run(d * 24, 'easy', 35, 6));
      if (d % 2 === 0) sessions.push(mob(d * 24));
    }
    const out = suggest(input({ sessions, today: today({ timeMin: 60 }) }));
    expect(out.ms).toBeLessThan(300);
  });
});
