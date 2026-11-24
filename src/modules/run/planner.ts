// Running planner. Rules (docs/SPEC.md section 6): running.distribution 80/20 [17], running.intervals [18],
// running.spike_guard [19] (hard), walk-run progression (H), strength support [20].
import { weekStart } from '../../core/format';
import type { PlannedSession, Profile, RunSegment, SessionLog } from '../../core/types';
import type { ModuleCtx } from '../types';
import { isDistanceProgram, rehabPhase, runProgramId, weeksSinceSurgery } from '../common';

const DAY = 864e5;
export const HARD_TYPES = ['intervals', 'tempo', 'long', 'test'];

/**
 * Walk-run stages: run minutes, walk minutes, repetitions. One step per session that did not feel heavy,
 * three sessions a week with a rest day between → about seven weeks to 30 minutes without a break.
 * Built from the 6-week Joggingguide [35] and NHS Couch to 5K (9 weeks) [34], with smaller steps at the end:
 * total running time grows gradually (novices: well under 30 % per two weeks [33]) and the longest continuous
 * run never jumps far past the last one [19].
 */
export const STAGES = [
  { run: 1, walk: 2, reps: 8 }, { run: 1.5, walk: 2, reps: 6 }, { run: 2, walk: 2, reps: 5 }, { run: 2, walk: 1.5, reps: 6 },
  { run: 3, walk: 2, reps: 4 }, { run: 3, walk: 1.5, reps: 5 }, { run: 4, walk: 2, reps: 4 }, { run: 5, walk: 2, reps: 3 },
  { run: 5, walk: 1.5, reps: 4 }, { run: 6, walk: 1.5, reps: 3 }, { run: 8, walk: 2, reps: 3 }, { run: 10, walk: 2, reps: 2 },
  { run: 12, walk: 2, reps: 2 }, { run: 15, walk: 2, reps: 2 }, { run: 18, walk: 0, reps: 1 }, { run: 20, walk: 0, reps: 1 },
  { run: 22, walk: 0, reps: 1 }, { run: 25, walk: 0, reps: 1 }, { run: 28, walk: 0, reps: 1 }, { run: 30, walk: 0, reps: 1 },
];
const minText = (m: number) => (Number.isInteger(m) ? String(m) : String(m).replace('.', ','));

export const runs = (logs: SessionLog[]) => logs.filter((l) => l.module === 'run');
export const km = (l: SessionLog) => (l.data?.kind === 'run' ? l.data.distanceKm ?? 0 : 0);

/** Walk-run stage: one step up per walk-run session that did not feel heavy. 'done' after the last stage. */
export function stage(profile: Profile, logs: SessionLog[]): number | 'done' {
  if (runProgramId(profile) !== 'start') return 'done';
  const started = new Date(profile.enrollments.run?.startedAt ?? 0);
  const done = runs(logs).filter((l) => l.type === 'walkrun' && new Date(l.startedAt) >= started && l.feel !== 3).length;
  return done >= STAGES.length ? 'done' : done;
}

export interface Guard { maxMin: number; longestMin: number; maxKm?: number; assumed: boolean }

/** running.spike_guard: never more than 10 % longer than the longest run in the last 30 days [19]. */
export function guard(profile: Profile, logs: SessionLog[], now: Date): Guard {
  const recent = runs(logs).filter((l) => now.getTime() - new Date(l.startedAt).getTime() <= 30 * DAY);
  if (!recent.length) {
    const id = runProgramId(profile);
    const assumed = id === 'start' ? 20 : id === '5k' ? 30 : id in DISTANCE ? (DISTANCE[id as DistanceId].weeks[0].long as number) : 45;
    return { maxMin: Math.round(assumed * 1.1), longestMin: assumed, assumed: true };
  }
  const longestMin = Math.max(...recent.map((l) => l.minutes));
  const longestKm = Math.max(0, ...recent.map(km));
  return { maxMin: Math.floor(longestMin * 1.1), longestMin, maxKm: longestKm ? Math.round(longestKm * 11) / 10 : undefined, assumed: false };
}

/** Share of running minutes in easy sessions over the last 4 weeks (80/20 target). */
export function easyShare(logs: SessionLog[], now: Date): number | null {
  const recent = runs(logs).filter((l) => now.getTime() - new Date(l.startedAt).getTime() <= 28 * DAY);
  const total = recent.reduce((a, l) => a + l.minutes, 0);
  if (!total) return null;
  const easy = recent.filter((l) => !['intervals', 'tempo', 'test'].includes(l.type)).reduce((a, l) => a + l.minutes, 0);
  return easy / total;
}

const seg = (label: string, min: number, effort: RunSegment['effort']): RunSegment => ({ label, seconds: Math.round(min * 60), effort });
const total = (s: RunSegment[]) => Math.round(s.reduce((a, x) => a + x.seconds, 0) / 60);

const plan = (type: string, title: string, segments: RunSegment[], summary: string, reasons: string[], effort: PlannedSession['effort'] = 'lugnt'): PlannedSession => ({
  id: `run:${type}`, module: 'run', type, title, effort, summary, minutes: total(segments),
  reasons: reasons.map((text) => ({ text })), content: { kind: 'run', segments },
});

export function walkRun(st: number): PlannedSession {
  const s = STAGES[st];
  const segs = [seg('Rask promenad', 5, 'gå'),
    ...Array.from({ length: s.reps }, (_, i) => [seg(s.reps > 1 ? `Spring ${i + 1} av ${s.reps}` : 'Spring utan paus', s.run, 'lugnt'), ...(s.walk && i < s.reps - 1 ? [seg('Gå', s.walk, 'gå')] : [])]).flat(),
    seg('Gå ner i varv', 3, 'gå')];
  return plan('walkrun', 'Gå-spring', segs, s.reps > 1 ? `${s.reps} × ${minText(s.run)} min löpning` : `${s.run} min utan paus`, [
    `Steg ${st + 1} av ${STAGES.length}. Nästa steg låses upp när passet känns lätt eller lagom – kändes det tungt kör du samma steg igen.`,
    'Jogga så lugnt att du kan prata. Gångpauserna är en del av passet, inte ett misslyckande.',
    'Tre pass i veckan med en vilodag emellan, så hinner kroppen anpassa sig [34].',
  ]);
}

export function easy(minutes: number, g: Guard): PlannedSession {
  const m = Math.max(15, Math.min(minutes, g.maxMin));
  return plan('easy', 'Lugn runda', [seg('Gå igång', 3, 'gå'), seg('Lugn löpning', m, 'lugnt'), seg('Gå ner i varv', 2, 'gå')], `${m} min i pratbart tempo`, [
    'Ungefär 80 % av löptiden ska vara pratbar – det bygger grunden utan att slita [17].',
    g.assumed ? `Högst ${g.maxMin} min tills appen har sett dina egna pass.` : `Högst ${g.maxMin} min: aldrig mer än 10 % längre än ditt längsta pass senaste 30 dagarna (${g.longestMin} min) [19].`,
  ]);
}

export function long(g: Guard, timeMin: number): PlannedSession | null {
  if (g.assumed) return null;
  const m = Math.min(g.maxMin, timeMin) - 5;
  if (m < 30) return null;
  return plan('long', 'Långpass', [seg('Gå igång', 3, 'gå'), seg('Långpass, lugnt', m, 'lugnt'), seg('Gå ner i varv', 2, 'gå')], `${m} min lugnt`, [
    'Veckans längsta pass bygger uthållighet – lugnt hela vägen.',
    `Ökar i små steg och stannar inom skadevakten: högst ${g.maxMin} min [19].`,
  ]);
}

export function intervals(beginner: boolean): PlannedSession {
  const work = beginner ? 2 : 4;
  const rest = beginner ? 2 : 3;
  const segs = [seg('Uppvärmning, lugn jogg', 10, 'lugnt'),
    ...Array.from({ length: 4 }, (_, i) => [seg(`Intervall ${i + 1} av 4`, work, 'hårt'), ...(i < 3 ? [seg('Jogga lugnt', rest, 'vila')] : [])]).flat(),
    seg('Nedjogg', 5, 'lugnt')];
  return plan('intervals', 'Intervaller', segs, `4 × ${work} min hårt`, [
    'Ett intervallpass i veckan höjer konditionen mest – 4 × 4 minuter nära maxpuls är väl studerat [18].',
    beginner ? 'Du börjar med 2-minutersintervaller. De blir längre när du har gjort några.' : 'Hårt men kontrollerat: du ska klara alla fyra i samma tempo.',
  ], 'hårt');
}

export function tempo(min = 15): PlannedSession {
  return plan('tempo', 'Tempopass', [seg('Uppvärmning', 10, 'lugnt'), seg('Tempo, kontrollerat ansträngt', min, 'hårt'), seg('Nedjogg', 5, 'lugnt')], `${min} min i tempo`, [
    'Kontrollerat ansträngt – du kan säga några ord, inte hela meningar.',
  ], 'hårt');
}

export function strides(): PlannedSession {
  return plan('strides', 'Lugnt + stegringar', [seg('Lugn löpning', 20, 'lugnt'), ...Array.from({ length: 5 }, (_, i) => [seg(`Stegring ${i + 1} av 5`, 1 / 3, 'hårt'), seg('Gå tillbaka', 1, 'gå')]).flat(), seg('Gå ner i varv', 3, 'gå')], '20 min + 5 stegringar', [
    'Korta, snabba och avslappnade lopp efter ett lugnt pass gör steget lättare utan att trötta ut dig.',
  ]);
}

export function test5k(): PlannedSession {
  return plan('test', 'Test: 5 km', [seg('Uppvärmning', 10, 'lugnt'), seg('5 km, jämnt tempo', 30, 'hårt'), seg('Nedjogg', 5, 'gå')], 'Spring 5 km så jämnt du kan', [
    'Ett test var sjätte till åttonde vecka visar att du blir bättre. Ange tiden efteråt under Framsteg.',
  ], 'hårt');
}

/** The next session for the week: walk-run for beginners, otherwise one interval session, one long run, the rest easy. */
export function next(ctx: ModuleCtx): PlannedSession {
  if (runProgramId(ctx.profile) === 'walk') return walkSession(ctx);
  const st = stage(ctx.profile, ctx.logs);
  const lastRun = runs(ctx.logs).reduce((m, l) => Math.max(m, new Date(l.startedAt).getTime()), 0);
  const gap = lastRun ? Math.floor((ctx.now.getTime() - lastRun) / DAY) : 0;
  if (st !== 'done') {
    // After two weeks off, repeat the previous walk-run step (H).
    const s = gap >= 14 ? Math.max(0, st - 1) : st;
    const p = walkRun(s);
    if (gap >= 14) return { ...p, reasons: [{ text: `${gap} dagar sedan senaste löppasset – du kör förra steget igen innan du går vidare.` }, ...p.reasons] };
    // A rest day between walk-run sessions: yesterday's session makes today's a weaker suggestion.
    const yesterday = lastRun && ctx.now.getTime() - lastRun < 1.5 * DAY && new Date(lastRun).toDateString() !== ctx.now.toDateString();
    if (yesterday) return { ...p, penalty: 0.35, reasons: [{ text: 'Du sprang i går. Helst en vilodag emellan – men det går bra i dag om det är enda chansen.' }, ...p.reasons] };
    return p;
  }
  if (gap >= 10) {
    const g0 = guard(ctx.profile, ctx.logs, ctx.now);
    const p = easy(Math.round(Math.max(15, g0.longestMin * 0.5)), g0);
    return { ...p, reasons: [{ text: `${gap} dagar sedan senaste löppasset: ett kortare lugnt pass först, sedan bygger vi upp igen.` }, ...p.reasons] };
  }
  const g = guard(ctx.profile, ctx.logs, ctx.now);
  const week = runs(ctx.logs).filter((l) => new Date(l.startedAt) >= weekStart(ctx.now));
  const base = runs(ctx.logs).filter((l) => ctx.now.getTime() - new Date(l.startedAt).getTime() <= 30 * DAY).length;
  const intervalsDone = runs(ctx.logs).filter((l) => l.type === 'intervals').length;
  const goal = runProgramId(ctx.profile);
  const dp = distanceSession(ctx, g);
  if (dp) return dp;
  if (goal !== 'start' && base >= 3 && week.length >= 1 && !week.some((l) => l.type === 'intervals')) return intervals(intervalsDone < 4);
  const lp = week.length >= 2 && !week.some((l) => l.type === 'long') ? long(g, ctx.checkin.minutes) : null;
  if (lp) return lp;
  return easy(Math.round(Math.max(20, g.longestMin * 0.7)), g);
}

// ---------------------------------------------------------------- First 10, 15 and 20 km

/**
 * Week-by-week programs for a first 10, 15 or 20 km. Shaped like popular free novice plans – Hal Higdon's
 * Novice 10K (8 weeks), 15K Novice (10 weeks) and Novice 1 half marathon (12 weeks), Nuffield Health's
 * 8-week 10K – but written for Pelare: three runs a week (four in the longer plans), one easy, one with
 * some speed and one long run that grows about 10 % a week [19], an easier week every fourth week, and
 * the distance itself in the last week. Mostly easy running [17], one quality session [18].
 */
export type DistanceId = '10k' | '15k' | '20k';
export interface PlanWeek { long: number | 'test'; easy: number; quality: 'strides' | 'tempo' | 'intervals'; runs: 3 | 4 }
const W = (long: number | 'test', easy: number, quality: PlanWeek['quality'], runs: 3 | 4 = 3): PlanWeek => ({ long, easy, quality, runs });

export const DISTANCE: Record<DistanceId, { km: number; name: string; weeks: PlanWeek[] }> = {
  '10k': { km: 10, name: 'Dina första 10 km', weeks: [
    W(35, 25, 'strides'), W(38, 25, 'strides'), W(42, 30, 'tempo'), W(35, 25, 'strides'),
    W(46, 30, 'intervals'), W(50, 30, 'tempo'), W(55, 30, 'intervals'), W('test', 25, 'strides'),
  ] },
  '15k': { km: 15, name: 'Dina första 15 km', weeks: [
    W(55, 30, 'strides'), W(60, 30, 'tempo'), W(66, 35, 'intervals'), W(55, 30, 'strides'),
    W(72, 35, 'tempo', 4), W(79, 35, 'intervals', 4), W(86, 40, 'tempo', 4), W(90, 40, 'intervals', 4),
    W(60, 30, 'strides'), W('test', 25, 'strides'),
  ] },
  '20k': { km: 20, name: 'Dina första 20 km', weeks: [
    W(60, 35, 'strides', 4), W(66, 35, 'tempo', 4), W(72, 40, 'intervals', 4), W(60, 35, 'strides', 4),
    W(79, 40, 'tempo', 4), W(86, 40, 'intervals', 4), W(94, 45, 'tempo', 4), W(75, 40, 'strides', 4),
    W(103, 45, 'intervals', 4), W(112, 45, 'tempo', 4), W(80, 35, 'strides'), W('test', 25, 'strides'),
  ] },
};

/** Calendar week of the program (0-based), counted in Mondays since the start. */
export function programWeek(profile: Profile, now: Date): number {
  const start = weekStart(new Date(profile.enrollments.run?.startedAt ?? now));
  return Math.max(0, Math.round((weekStart(now).getTime() - start.getTime()) / (7 * DAY)));
}

export type Slot = 'easy' | 'quality' | 'long';
export const slotsOf = (w: PlanWeek): Slot[] => (w.runs === 4 ? ['easy', 'quality', 'long', 'easy'] : ['easy', 'quality', 'long']);
const slotOfLog = (l: SessionLog): Slot => (l.type === 'long' || l.type === 'test' ? 'long' : ['intervals', 'tempo', 'strides'].includes(l.type) ? 'quality' : 'easy');

/** The program week and which of its sessions are still left. Null when not on a distance program or after it ends. */
export function distanceWeek(ctx: ModuleCtx): { id: DistanceId; index: number; week: PlanWeek; left: Slot[] } | null {
  const id = runProgramId(ctx.profile);
  if (!isDistanceProgram(id)) return null;
  const p = DISTANCE[id as DistanceId];
  const index = programWeek(ctx.profile, ctx.now);
  if (index >= p.weeks.length) return null;
  const week = p.weeks[index];
  const left = [...slotsOf(week)];
  for (const l of runs(ctx.logs).filter((x) => new Date(x.startedAt) >= weekStart(ctx.now))) {
    const k = left.indexOf(slotOfLog(l));
    if (k >= 0) left.splice(k, 1); else if (left.length) left.shift();
  }
  return { id: id as DistanceId, index, week, left };
}

export function testDistance(km: number): PlannedSession {
  const est = Math.round(km * 6.5);
  return plan('test', `Dina första ${km} km`, [seg('Gå igång', 5, 'gå'), seg(`${km} km i jämnt, lugnt tempo`, est, 'lugnt'), seg('Gå ner i varv', 5, 'gå')], `${km} km – tiden spelar ingen roll`, [
    `Veckans stora pass: du springer ${km} km för första gången. Börja lugnare än du tror att du behöver.`,
    'Tiden är inte viktig i dag – att ta dig runt i jämn fart är målet. Gå en bit om du behöver, det räknas ändå.',
  ], 'hårt');
}

function distanceSession(ctx: ModuleCtx, g: Guard): PlannedSession | null {
  const d = distanceWeek(ctx);
  if (!d) return null;
  const p = DISTANCE[d.id];
  const head = `Vecka ${d.index + 1} av ${p.weeks.length} i ${p.name}.`;
  const slot = d.left[0] ?? 'easy';
  const extra = d.left.length === 0;
  let s: PlannedSession;
  if (slot === 'long' && d.week.long === 'test') s = testDistance(p.km);
  else if (slot === 'long') {
    const target = d.week.long as number;
    const m = Math.max(20, Math.min(target, g.maxMin));
    s = plan('long', 'Långpass', [seg('Gå igång', 3, 'gå'), seg('Långpass, lugnt', m, 'lugnt'), seg('Gå ner i varv', 2, 'gå')], `${m} min lugnt`, [
      'Veckans viktigaste pass: långpasset bygger uthålligheten för distansen. Lugnt hela vägen – du ska kunna prata.',
      m < target ? `Programmet säger ${target} min, men skadevakten stoppar vid ${m}: aldrig mer än 10 % längre än ditt längsta pass senaste 30 dagarna [19].` : 'Ungefär 10 % längre än förra veckan – lagom för att kroppen ska hänga med [19].',
    ]);
  } else if (slot === 'quality') {
    s = d.week.quality === 'intervals' ? intervals(runs(ctx.logs).filter((l) => l.type === 'intervals').length < 4)
      : d.week.quality === 'tempo' ? tempo(d.index < 4 ? 12 : d.index < 8 ? 15 : 20) : strides();
  } else s = easy(d.week.easy, g);
  const prev = d.index > 0 ? p.weeks[d.index - 1].long : null;
  const lighter = typeof d.week.long === 'number' && typeof prev === 'number' && d.week.long < prev;
  const n = slotsOf(d.week).length;
  return { ...s, reasons: [
    { text: extra ? `${head} Veckans pass är gjorda – det här är extra, håll det lugnt.` : `${head} ${d.left.length === 1 ? 'Sista passet' : `Pass ${n - d.left.length + 1} av ${n}`} den här veckan.` },
    ...(lighter ? [{ text: 'Lättare vecka: kortare långpass så att kroppen hinner bygga upp sig inför nästa ökning.' }] : []),
    ...s.reasons,
  ] };
}

// ---------------------------------------------------------------- Walking and cycling (after a hip replacement)

/**
 * Walks that grow with the weeks after surgery. Walking and cycling are the recommended endurance
 * training after a hip replacement; jogging only after the surgeon's go-ahead, usually at the earliest
 * after 3–6 months (vårdförloppet, Region Dalarna, return-to-sport reviews).
 */
export function walkSession(ctx: ModuleCtx): PlannedSession {
  const ph = rehabPhase(ctx.profile, ctx.now) ?? 5;
  const w = weeksSinceSurgery(ctx.profile, ctx.now);
  const done = runs(ctx.logs).filter((l) => l.type === 'walk' && ctx.now.getTime() - new Date(l.startedAt).getTime() < 14 * DAY).length;
  // Research report: phase 2 walks of 5–15 min, phase 3 20–40 min, phase 4 cardio 20–45 min, phase 5 150–300 min a week.
  const base = ph === 0 ? 25 : ph <= 2 ? 10 : ph === 3 ? 20 + Math.min(10, Math.max(0, Math.floor((w - 3) * 3))) : ph === 4 ? 25 + Math.min(20, Math.max(0, Math.floor((w - 6) * 3))) : 45;
  const m = Math.round(Math.min(ctx.checkin.minutes, base + (done >= 6 ? 5 : 0)));
  return plan('walk', ph === 0 || ph >= 3 ? 'Promenad eller motionscykel' : 'Promenad', [seg('Promenad i lugn takt', 3, 'gå'), seg('Rask promenad', Math.max(5, m - 5), 'gå'), seg('Lugn takt hem', 2, 'gå')],
    `${m} min promenad – eller cykel`, [
      ph === 0 ? 'Före operationen: cykel och promenader håller konditionen uppe – cykel är ofta skonsammare vid artros.' : `Fas ${ph} efter höftoperationen: ${ph >= 4 ? 'cykel, crosstrainer, bassäng eller stavgång – 20–45 minuter, måttlig till hög intensitet.' : 'promenader och cykel är den bästa konditionsträningen nu.'}`,
      'Gå i en takt där du kan prata. Använd kryckor eller stav så länge du behöver dem – det ger en jämnare gång.',
      ph < 5 ? 'Löpning och hopp väntar. Lätt jogging efter samtal med kirurgen – tre av fyra kirurger tillåter det efter 6 månader.' : 'Har din kirurg gett klartecken kan du byta till ett löpprogram under Löpning → Program.',
    ]);
}
