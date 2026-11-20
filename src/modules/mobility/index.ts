import { Spline } from 'lucide-react';
import { createElement } from 'react';
import { weekStart } from '../../core/format';
import type { LibraryItem, Metric, PlannedSession, ProgramOption } from '../../core/types';
import { QuickLog } from '../../shared/ui/fields';
import { distinctDays, fmt1, logsOf, thisWeek, weeklySeries } from '../common';
import type { LogFormProps, ModuleCtx, TrainingModule } from '../types';
import { FocusPicker } from './FocusPicker';
import { FOCUS_AREAS, FOCUS_NAME, areaSeconds, build, focusOf, hold, minutesOf, sessionsDone, targets } from './planner';
import { STRETCH_HOW } from './howto';
import { MobilityPlayer } from './Player';
import { AREA_NAME, GROUPS, STRETCH, STRETCHES, STRETCH_ANIM, type Stretch } from './stretches';

const DAYS_TARGET = 5; // mobility.dose [22]: spread over at least five days a week

const PROGRAMS: ProgramOption[] = [
  { id: 'whole', name: 'Hela kroppen', weeks: 12, perWeek: 5,
    description: 'Alla områden får sin dos varje vecka. Passen byggs efter vad kroppen saknat mest, och dina fokusområden får dubbelt så mycket tid.' },
];

const plan = (type: string, title: string, ids: string[], reasons: string[], opts: { sec?: number; rounds?: number; effort?: PlannedSession['effort'] } = {}): PlannedSession => {
  const holds = ids.map((id) => hold(id, opts.sec ?? 30, opts.rounds ?? 1));
  const statics = holds.filter((h) => STRETCH[h.id].kind === 'statisk');
  return {
    id: `mobility:${type}`, module: 'mobility', type, title, minutes: minutesOf(holds), effort: opts.effort ?? 'lugnt',
    summary: statics.length ? `${holds.length} övningar · ${statics[0].rounds} × ${statics[0].seconds} s` : `${holds.length} rörelser`,
    reasons: reasons.map((text) => ({ text })), content: { kind: 'mobility', holds },
  };
};

// ---------------------------------------------------------------- Fixed routines from the transcripts

const fullBody10 = () => plan('full10', 'Hela kroppen 10 min',
  ['upper_trap', 'head_roll', 'chest_opener', 'cross_body', 'cat_cow', 'childs_pose', 'lumbar_rot', 'figure_four', 'supine_ham', 'flexor_glute'],
  ['Alla stora muskelgrupper på tio minuter.', 'Kort men regelbundet slår långt och sällan.']);

const quick = (rounds: number) => plan('quick', 'Snabbstretch', ['hip_flexor', 'elephant_walk', 'pancake', 'figure_four', 'lat_stretch', 'side_stretch', 'seated_twist'],
  ['Stretcharna nästan alla behöver efter mycket sittande.', `${rounds} varv ger 90 s per stretch – det som gör dig rörligare.`], { rounds });

const ANIMAL = ['cat_crawl', 'frog_hop', 'bear_walk', 'monkey', 'crab_walk', 'horse_walk', 'half_duck'];
const animalWarmup = () => plan('animal', 'Djurrörelser', ['finger_pushup', 'bear_squat', 'down_dog', ...ANIMAL],
  ['Väcker hela kroppen på några minuter – bra före gym eller löpning.', 'Dynamisk uppvärmning före pass har stöd i forskningen [24].'], { effort: 'medel' });
const animalConditioning = () => plan('animal_cond', 'Djurrörelser, kondition', ['finger_pushup', 'bear_squat', ...ANIMAL, ...ANIMAL],
  ['Två varv utan paus: styrka, rörlighet och puls i ett.'], { effort: 'hårt' });

// ---------------------------------------------------------------- Built sessions

const nextSession = (ctx: ModuleCtx) => build(ctx, { minutes: Math.min(ctx.checkin.minutes, 15) });
const micro = (ctx: ModuleCtx) => build(ctx, { minutes: 6, title: 'Mikropass', type: 'micro' });

function libraryItem(s: Stretch): LibraryItem {
  const extra: LibraryItem['extra'] = [
    { label: 'Typ', value: s.kind === 'statisk' ? `Statisk stretch, håll 30–45 s${s.sides === 2 ? ' per sida' : ''}` : s.kind === 'dynamisk' ? 'Dynamisk, 30–40 s i rörelse' : 'Rörelse, 10 steg fram och tillbaka' },
    { label: 'Område', value: s.areas.map((a) => AREA_NAME[a]).join(', ') },
  ];
  if (s.easier) extra.push({ label: 'Lättare', value: STRETCH[s.easier].name, to: s.easier });
  if (s.harder) extra.push({ label: 'Svårare', value: STRETCH[s.harder].name, to: s.harder });
  if (s.why) extra.push({ label: 'Varför', value: s.why });
  const timing = s.kind === 'statisk'
    ? `Håll 30–45 sekunder${s.sides === 2 ? ' per sida' : ''}. Det ska dra, aldrig göra ont – andas lugnt och sjunk lite djupare för varje utandning.`
    : s.kind === 'dynamisk' ? 'Rör dig lugnt och kontrollerat i 30–40 sekunder, lite större rörelse för varje repetition.'
    : 'Gå långsamt första varvet. Rör dig fortare när det känns stabilt.';
  const how = [...(STRETCH_HOW[s.id]?.how ?? [s.cue]), timing];
  return { id: s.id, name: s.name, group: s.group, meta: `${s.kind.charAt(0).toUpperCase() + s.kind.slice(1)} · ${s.areas.map((a) => AREA_NAME[a].toLowerCase()).join(', ')}`, tips: s.tips, extra, how, anim: STRETCH_ANIM[s.id] };
}

function LogForm({ onSave }: LogFormProps) {
  return createElement(QuickLog, {
    types: [{ value: 'stretch', label: 'Stretch' }, { value: 'yoga', label: 'Yoga' }, { value: 'animal', label: 'Djurrörelser' }, { value: 'mobility', label: 'Rörlighet' }],
    onSave: (v) => onSave({ type: v.type, title: v.title, minutes: v.minutes, feel: v.feel }),
  });
}

const testFor = (f: string) => (f === 'front_split' ? 'split_front' : f === 'side_split' ? 'split_side' : f === 'ankles' || f === 'hips' ? 'knee_wall' : f === 'shoulders' ? 'shoulder_wall' : null);

export const mobility: TrainingModule = {
  id: 'mobility', slug: 'rorlighet', name: 'Rörlighet', noun: 'stretchpass', icon: Spline,

  nextSession,
  candidates: (ctx) => [nextSession(ctx), micro(ctx)],
  quickStarts: (ctx) => [
    ...focusOf(ctx.profile).map((f) => ({
      id: `focus_${f}`, label: `Fokus: ${FOCUS_NAME[f].toLowerCase()}`, hint: '15 min · bara ditt fokusområde',
      session: build(ctx, { minutes: 15, only: FOCUS_AREAS[f], title: FOCUS_NAME[f], type: `focus_${f}` }),
    })),
    { id: 'full10', label: 'Hela kroppen 10 min', hint: 'Nacke till höft · 30 s per stretch', session: fullBody10() },
    { id: 'quick3', label: 'Snabbstretch × 3', hint: '90 s per stretch – för att bli rörligare', session: quick(3) },
    { id: 'animal', label: 'Djurrörelser', hint: 'Uppvärmning före gym eller löpning', session: animalWarmup() },
    { id: 'animal_cond', label: 'Djurrörelser, kondition', hint: 'Två varv utan paus', session: animalConditioning() },
    { id: 'micro', label: 'Mikropass', hint: '6 min · det som behövs mest', session: micro(ctx) },
    { id: 'test', label: 'Gör ett test', hint: 'Mät hur långt du har kommit', to: '/rorlighet/framsteg?test=1' },
    { id: 'log', label: 'Logga i efterhand', hint: 'Yoga eller egen stretch', to: '/rorlighet/logga' },
  ],
  weekly: (ctx) => ({ done: distinctDays(thisWeek(ctx, 'mobility')), target: DAYS_TARGET, unit: 'dagar' }),

  programs: PROGRAMS,
  program(ctx) {
    const started = new Date(ctx.profile.enrollments.mobility?.startedAt ?? ctx.now);
    const week = Math.max(1, Math.floor((ctx.now.getTime() - started.getTime()) / (7 * 864e5)) + 1);
    const days = distinctDays(thisWeek(ctx, 'mobility'));
    const level = Math.min(4, Math.floor(sessionsDone(ctx.logs) / 8) + 1);
    const focus = focusOf(ctx.profile);
    return {
      program: PROGRAMS[0], week,
      label: focus.length ? `Nivå ${level} · fokus på ${focus.map((f) => FOCUS_NAME[f].toLowerCase()).join(', ')}` : `Nivå ${level} av 4`,
      thisWeek: Array.from({ length: DAYS_TARGET }, (_, i) => ({ title: `Dag ${i + 1}`, done: i < days })),
      milestones: [1, 2, 3, 4].map((x) => ({ label: `Nivå ${x}`, done: x < level })),
    };
  },

  metrics(ctx): Metric[] {
    const t = targets(ctx.profile);
    const done = areaSeconds(ctx.logs, weekStart(ctx.now));
    const areas = Object.keys(t) as (keyof typeof t)[];
    const atTarget = areas.filter((a) => (done[a] ?? 0) >= t[a]).length;
    const days = weeklySeries(logsOf(ctx, 'mobility'), ctx.now, 6, () => 1);
    const ids = [...new Set(focusOf(ctx.profile).map(testFor).filter(Boolean) as string[])];
    const tests = (ids.length ? ids : ['knee_wall']).map((id): Metric => {
      const def = mobility.tests!.find((x) => x.id === id)!;
      const r = ctx.tests.filter((x) => x.testId === id);
      const last = r[r.length - 1];
      return {
        id, label: def.label, value: last ? fmt1(last.value) : '–', unit: def.unit, series: r.map((x) => x.value), invert: def.invert,
        change: r.length > 1 ? `${fmt1(Math.abs(r[0].value - last.value))} cm ${(def.invert ? last.value < r[0].value : last.value > r[0].value) ? 'bättre' : 'sämre'} sedan start` : undefined,
      };
    });
    return [
      { id: 'coverage', label: 'Områden i veckomålet', value: String(atTarget), unit: `av ${areas.length}`,
        bars: areas.map((a) => ({ label: AREA_NAME[a], value: Math.round((done[a] ?? 0) / 6) / 10, target: t[a] / 60 })) },
      ...tests,
      { id: 'days', label: 'Stretchpass per vecka', value: String(days[days.length - 1]), series: days },
    ];
  },
  tests: [
    { id: 'split_front', label: 'Splitt framåt', unit: 'cm', invert: true, how: 'Gå ner i splitt med stöd. Mät avståndet från grenen till golvet.' },
    { id: 'split_side', label: 'Sidosplitt', unit: 'cm', invert: true, how: 'Gå ner i sidosplitt med stöd. Mät avståndet från grenen till golvet.' },
    { id: 'knee_wall', label: 'Knä mot vägg', unit: 'cm', how: 'Hur långt från väggen kan tån stå när knät nuddar väggen med hälen i golvet?' },
    { id: 'shoulder_wall', label: 'Axlar mot vägg', unit: 'cm', invert: true, how: 'Ryggen mot väggen, för raka armar upp. Mät avståndet mellan tummarna och väggen.' },
  ],

  library: { title: 'Stretchar och rörelser', groups: GROUPS, items: STRETCHES.map(libraryItem) },
  describe: (l) => `${l.minutes} min`,
  load: (l) => (l.type === 'animal_cond' ? { legs: 0.4, hard: true } : {}),

  Player: MobilityPlayer,
  LogForm,
  ProgramExtra: FocusPicker,
};
