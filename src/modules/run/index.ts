import { Footprints } from 'lucide-react';
import { createElement } from 'react';
import type { LibraryItem, Metric, ProgramOption } from '../../core/types';
import { Field, NumberInput, QuickLog, parseNum } from '../../shared/ui/fields';
import { fmt1, thisWeek, weeklySeries } from '../common';
import { DISTANCE, distanceWeek, programWeek, slotsOf, type DistanceId } from './planner';
import type { LogFormProps, ModuleCtx, TrainingModule } from '../types';
import { RunPlayer } from './Player';
import { HARD_TYPES, STAGES, easy, easyShare, guard, km, next, runs, stage, strides, tempo, test5k } from './planner';

const PROGRAMS: ProgramOption[] = [
  { id: 'start', name: 'Dina första 5 km', weeks: 7, perWeek: 3,
    description: 'Från noll: gå-spring i 20 små steg tills du joggar 30 minuter utan paus – för de flesta ungefär 5 km. Tre pass i veckan med vilodag emellan, som NHS Couch to 5K men med mindre steg på slutet.' },
  { id: '10k', name: 'Dina första 10 km', weeks: 8, perWeek: 3,
    description: 'För dig som kan springa 30 minuter utan paus. Tre pass i veckan: ett lugnt, ett med lite fart och ett långpass som växer från 35 till 55 minuter. Vecka 8 springer du 10 km.' },
  { id: '15k', name: 'Dina första 15 km', weeks: 10, perWeek: 4,
    description: 'För dig som springer 10 km. Tre till fyra pass i veckan med ett långpass som växer från 55 till 90 minuter, en lättare vecka var fjärde vecka. Vecka 10 springer du 15 km.' },
  { id: '20k', name: 'Dina första 20 km', weeks: 12, perWeek: 4,
    description: 'För dig som springer 10 km bekvämt. Fyra pass i veckan med ett långpass som växer från 60 minuter till knappt två timmar, med lättare veckor emellan. Vecka 12 springer du 20 km.' },
  { id: '5k', name: 'Snabbare 5 km', weeks: 8, perWeek: 3, description: 'För dig som redan springer 5 km. Två lugna pass och ett intervallpass i veckan.' },
  { id: 'maintain', name: 'Underhåll', weeks: 4, perWeek: 2, description: 'Två lugna pass i veckan för att behålla formen.' },
];

const TYPES: LibraryItem[] = [
  { id: 'walkrun', name: 'Gå-spring', group: 'Grund', meta: 'Växla löpning och gång', tips: ['Gångpauserna är en del av passet', 'Spring så lugnt att du kan prata', 'Nästa steg låses upp när passet känns lagom'],
    extra: [{ label: 'Varför', value: 'Det säkraste sättet att börja: belastningen ökar gradvis, så att senor och leder hinner med.' }] },
  { id: 'easy', name: 'Lugnt pass', group: 'Grund', meta: 'Pratbart tempo · zon 2', tips: ['Du ska kunna prata i hela meningar', 'Ungefär 80 % av all löptid', 'Hellre för lugnt än för fort'],
    extra: [{ label: 'Varför', value: '80/20-fördelningen gav något bättre kondition än andra fördelningar (källa [17]).' }] },
  { id: 'long', name: 'Långpass', group: 'Grund', meta: 'Lugnt · veckans längsta pass', tips: ['Lugnt hela vägen', 'Ökar i små steg', 'Ta med vatten om det är långt'],
    extra: [{ label: 'Skadevakt', value: 'Aldrig mer än 10 % längre än ditt längsta pass senaste 30 dagarna (källa [19]).' }] },
  { id: 'intervals', name: 'Intervaller', group: 'Kvalitet', meta: 'Hårt · 90–95 % av maxpuls', tips: ['Ett pass i veckan räcker', 'Värm upp ordentligt', 'Jogga lugnt mellan intervallerna'],
    extra: [{ label: 'Varför', value: '4 × 4 min nära maxpuls höjde syreupptagningen mer än lika mycket måttlig löpning (källa [18]).' }] },
  { id: 'tempo', name: 'Tempopass', group: 'Kvalitet', meta: 'Kontrollerat ansträngt', tips: ['Ungefär 7 av 10 i ansträngning', 'Några ord, inte meningar', '15–25 minuter i tempo'] },
  { id: 'strides', name: 'Stegringar', group: 'Kvalitet', meta: 'Korta, snabba, avslappnade', tips: ['4–6 × 20 sekunder', 'Efter ett lugnt pass', 'Fokus på lätta steg'] },
  { id: 'test', name: 'Test: 5 km', group: 'Test', meta: 'Var sjätte till åttonde vecka', tips: ['Utvilad, på platt mark', 'Jämnt tempo hela vägen', 'Ange tiden under Framsteg'] },
  { id: 'cooper', name: 'Test: 12 minuter', group: 'Test', meta: 'Så långt du kan på 12 min', tips: ['Bana eller platt slinga', 'Jämnt, hårt tempo', 'Ange distansen i meter'] },
];

const fmtMin = (m: number) => `${Math.floor(m)}:${String(Math.round((m % 1) * 60)).padStart(2, '0')}`;

function LogForm({ onSave }: LogFormProps) {
  return createElement(QuickLog, {
    types: [{ value: 'easy', label: 'Lugnt' }, { value: 'long', label: 'Långpass' }, { value: 'intervals', label: 'Intervaller' }, { value: 'tempo', label: 'Tempo' }],
    extra: (set, vals) => createElement(Field, { label: 'Distans', children: createElement(NumberInput, { value: vals.km ?? '', onChange: (v: string) => set('km', v), unit: 'km', decimal: true, ariaLabel: 'Distans i km' }) }),
    onSave: (v) => onSave({ type: v.type, title: v.title, minutes: v.minutes, feel: v.feel, data: { kind: 'run', distanceKm: parseNum(v.vals.km ?? '') } }),
  });
}

const program = (ctx: ModuleCtx) => PROGRAMS.find((p) => p.id === ctx.profile.enrollments.run?.programId) ?? PROGRAMS[0];

export const run: TrainingModule = {
  id: 'run', slug: 'lopning', name: 'Löpning', noun: 'löppass', icon: Footprints,

  nextSession: next,
  candidates(ctx) {
    const n = next(ctx);
    const g = guard(ctx.profile, ctx.logs, ctx.now);
    const short = stage(ctx.profile, ctx.logs) === 'done' ? easy(20, g) : n;
    return n.id === short.id ? [n] : [n, { ...short, id: 'run:easy20' }];
  },
  quickStarts: (ctx) => {
    const g = guard(ctx.profile, ctx.logs, ctx.now);
    return [
      { id: 'easy20', label: 'Lugn runda', hint: '20 min · pratbart tempo', session: { ...easy(20, g), id: 'run:easy20' } },
      { id: 'strides', label: 'Lugnt + stegringar', hint: '25 min · lätta, snabba steg', session: strides() },
      { id: 'tempo', label: 'Tempopass', hint: '30 min · kontrollerat ansträngt', session: tempo() },
      { id: 'test', label: 'Test: 5 km', hint: 'Mät formen var sjätte vecka', session: test5k() },
      { id: 'log', label: 'Logga i efterhand', hint: 'Sprang du med klockan?', to: '/lopning/logga' },
    ];
  },
  weekly: (ctx) => ({ done: thisWeek(ctx, 'run').length, target: distanceWeek(ctx)?.week.runs ?? program(ctx).perWeek, unit: 'pass' }),

  programs: PROGRAMS,
  program(ctx) {
    const p = program(ctx);
    const started = new Date(ctx.profile.enrollments.run?.startedAt ?? ctx.now);
    const week = Math.min(p.weeks, Math.max(1, Math.floor((ctx.now.getTime() - started.getTime()) / (7 * 864e5)) + 1));
    const done = thisWeek(ctx, 'run').length;
    const st = stage(ctx.profile, ctx.logs);
    const dw = distanceWeek(ctx);
    if (dw) {
      const plan = DISTANCE[dw.id];
      const QN = { strides: 'Lugnt + stegringar', tempo: 'Tempopass', intervals: 'Intervaller' };
      const titles = slotsOf(dw.week).map((s) => (s === 'long' ? (dw.week.long === 'test' ? `${plan.km} km!` : `Långpass ${dw.week.long} min`) : s === 'quality' ? QN[dw.week.quality] : `Lugnt ${dw.week.easy} min`));
      const n = plan.weeks.length;
      const marks = [Math.round(n / 4), Math.round(n / 2), Math.round((3 * n) / 4), n];
      return {
        program: p, week: dw.index + 1, label: `Vecka ${dw.index + 1} av ${n}`,
        thisWeek: titles.map((title, k) => ({ title, done: k < slotsOf(dw.week).length - dw.left.length })),
        milestones: marks.map((m) => { const l = plan.weeks[m - 1].long; return { label: l === 'test' ? `${plan.km} km` : `${l} min`, done: dw.index + 1 > m }; }),
      };
    }
    if (p.id in DISTANCE && programWeek(ctx.profile, ctx.now) >= DISTANCE[p.id as DistanceId].weeks.length) {
      return { program: p, week: p.weeks, label: 'Programmet är klart – byt till nästa distans eller Underhåll',
        thisWeek: [{ title: 'Lugnt', done: done > 0 }, { title: 'Lugnt', done: done > 1 }], milestones: [{ label: 'Klart', done: true }] };
    }
    const titles = p.id === 'start' ? ['Gå-spring', 'Gå-spring', 'Gå-spring'] : p.id === 'maintain' ? ['Lugnt', 'Lugnt'] : ['Lugnt', 'Intervaller', 'Långpass'];
    return {
      program: p, week, label: p.id === 'start' && st !== 'done' ? `Steg ${st + 1} av ${STAGES.length}` : `Vecka ${week} av ${p.weeks}`,
      thisWeek: titles.map((title, i) => ({ title, done: i < done })),
      milestones: p.id === 'start'
        ? [5, 10, 15, 20].map((n) => ({ label: `${STAGES[n - 1].run} min`, done: st === 'done' || st >= n }))
        : [{ label: 'Bas', done: week > 2 }, { label: 'Volym', done: week > 4 }, { label: 'Fart', done: week > 6 }, { label: 'Test', done: week >= p.weeks }],
    };
  },

  metrics(ctx): Metric[] {
    const logs = runs(ctx.logs);
    const kmW = weeklySeries(logs, ctx.now, 6, km);
    const minW = weeklySeries(logs, ctx.now, 6, (l) => l.minutes);
    const g = guard(ctx.profile, ctx.logs, ctx.now);
    const share = easyShare(ctx.logs, ctx.now);
    const tests = ctx.tests.filter((t) => t.testId === '5k');
    const st = stage(ctx.profile, ctx.logs);
    return [
      st !== 'done'
        ? { id: 'stage', label: 'Gå-spring', value: `${st + 1}`, unit: `av ${STAGES.length}`, change: `${String(STAGES[st].run).replace('.', ',')} min löpning åt gången` }
        : { id: 'longest', label: 'Längsta pass, 30 dagar', value: g.assumed ? '–' : String(g.longestMin), unit: 'min', change: g.assumed ? undefined : `Nästa får vara högst ${g.maxMin} min` },
      { id: 'minutes', label: 'Löptid per vecka', value: String(minW[minW.length - 1]), unit: 'min', series: minW },
      { id: 'km', label: 'Km per vecka', value: fmt1(kmW[kmW.length - 1]), unit: 'km', series: kmW },
      { id: 'share', label: 'Lugn löpning, 4 veckor', value: share === null ? '–' : String(Math.round(share * 100)), unit: '%',
        bars: share === null ? undefined : [{ label: 'Lugnt', value: Math.round(share * 100), target: 80 }, { label: 'Hårt', value: Math.round((1 - share) * 100), target: 20 }] },
      { id: '5k', label: '5 km-test', value: tests.length ? fmtMin(tests[tests.length - 1].value) : '–', unit: 'min', series: tests.map((t) => t.value), invert: true },
    ];
  },
  tests: [
    { id: '5k', label: '5 km-test', unit: 'min', invert: true, how: 'Spring 5 km så jämnt du kan på platt mark och ange tiden i minuter (till exempel 28,5).' },
    { id: 'cooper', label: '12-minuterstest', unit: 'm', how: 'Spring så långt du kan på 12 minuter och ange distansen i meter.' },
  ],

  library: { title: 'Passtyper', groups: ['Grund', 'Kvalitet', 'Test'], items: TYPES },
  describe: (l) => (km(l) ? `${fmt1(km(l))} km · ${l.minutes} min` : `${l.minutes} min`),
  load: (l) => ({ legs: HARD_TYPES.includes(l.type) ? 0.8 : 0.4, hard: HARD_TYPES.includes(l.type) }),

  Player: RunPlayer,
  LogForm,
  records(prev, log) {
    if (log.module !== 'run') return [];
    const before = runs(prev);
    if (!before.length) return [];
    const out = [];
    if (log.minutes > Math.max(...before.map((l) => l.minutes))) out.push({ module: 'run' as const, date: log.startedAt, title: 'Längsta löppasset', detail: `${log.minutes} minuter` });
    if (km(log) > 0 && km(log) > Math.max(0, ...before.map(km))) out.push({ module: 'run' as const, date: log.startedAt, title: 'Längsta distansen', detail: `${fmt1(km(log))} km` });
    return out;
  },
};
