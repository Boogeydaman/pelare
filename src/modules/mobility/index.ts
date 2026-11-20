import { Spline } from 'lucide-react';
import { createElement } from 'react';
import type { HoldItem, LibraryItem, Metric, PlannedSession, ProgramOption } from '../../core/types';
import { QuickLog } from '../../shared/ui/fields';
import { distinctDays, enrollment, fmt1, logsOf, thisWeek, weeklySeries } from '../common';
import type { LogFormProps, ModuleCtx, TrainingModule } from '../types';
import { MobilityPlayer } from './Player';
import { AREA_NAME, GROUPS, STRETCH, STRETCHES, type Stretch } from './stretches';

// ---------------------------------------------------------------- Rules (docs/SPEC.md section 6)
// mobility.dose [22]: ≥5 min per prioritised area per week over ≥5 days → weekly target in days.
// Transcript (level D): ~30 s holds, 90–120 s total per stretch → build towards 3 rounds.
const DAYS_TARGET = 5;
/** Hold time and rounds grow with sessions done in the programme (mobility.progression, H). */
function dose(sessions: number): { sec: number; rounds: number } {
  return { sec: sessions < 6 ? 30 : 45, rounds: sessions < 4 ? 2 : 3 };
}

const hold = (id: string, sec: number, rounds = 1): HoldItem => {
  const s = STRETCH[id];
  const moving = s.kind !== 'statisk';
  return { id, name: s.name, seconds: moving ? 40 : sec, sides: moving ? 1 : s.sides, rounds: moving ? 1 : rounds, cue: s.cue };
};

const PROGRAMS: (ProgramOption & { warm: string[]; holds: string[] })[] = [
  { id: 'front_split', name: 'Splitt framåt', description: 'Baksida lår och höftböjare. Från halv splitt till splittglid, med mätning var fjärde vecka.', weeks: 12, perWeek: 5,
    warm: ['worlds_greatest'], holds: ['hip_flexor', 'half_split', 'figure_four', 'split_slide', 'forward_fold'] },
  { id: 'side_split', name: 'Sidosplitt', description: 'Insida lår och höfter. Bred fällning är huvudövningen.', weeks: 12, perWeek: 5,
    warm: ['cossack'], holds: ['butterfly', 'frog', 'side_lunge', 'pancake', 'figure_four'] },
  { id: 'hips', name: 'Höfter', description: 'Rörliga höfter för knäböj, löpning och vardag.', weeks: 8, perWeek: 4,
    warm: ['ninety_ninety'], holds: ['hip_flexor', 'figure_four', 'frog', 'flexor_glute'] },
  { id: 'general', name: 'Hela kroppen', description: 'Nacke, axlar, rygg, höft och baksida lår på tio minuter.', weeks: 8, perWeek: 4,
    warm: ['cat_cow'], holds: ['upper_trap', 'chest_opener', 'cross_body', 'childs_pose', 'lumbar_rot', 'figure_four', 'supine_ham', 'flexor_glute'] },
];

const plan = (type: string, title: string, holds: HoldItem[], reasons: string[], effort: PlannedSession['effort'] = 'lugnt'): PlannedSession => {
  const sec = holds.reduce((a, h) => a + h.rounds * (h.seconds * h.sides + 10), 0);
  const static_ = holds.filter((h) => STRETCH[h.id].kind === 'statisk');
  return {
    id: `mobility:${type}`, module: 'mobility', type, title, minutes: Math.max(5, Math.round(sec / 60)), effort,
    summary: static_.length ? `${holds.length} övningar · ${static_[0].rounds} × ${static_[0].seconds} s` : `${holds.length} rörelser`,
    reasons: reasons.map((text) => ({ text })), content: { kind: 'mobility', holds },
  };
};

// ---------------------------------------------------------------- Routines from the transcripts

/** 10 min full body (video 1): neck to hips, 30 s per side. */
const fullBody10 = () => plan('full10', 'Hela kroppen 10 min', ['upper_trap', 'head_roll', 'chest_opener', 'cross_body', 'cat_cow', 'childs_pose', 'lumbar_rot', 'figure_four', 'supine_ham', 'flexor_glute'].map((id) => hold(id, 30)),
  ['Alla stora muskelgrupper på tio minuter.', 'Kort men regelbundet slår långt och sällan.']);

/** Quick stretch (video 3): hold ~30 s, repeat the round for 90–120 s per stretch. */
const quick = (rounds = 1) => plan('quick', 'Snabbstretch', ['hip_flexor', 'elephant_walk', 'pancake', 'figure_four', 'lat_stretch', 'side_stretch', 'seated_twist'].map((id) => hold(id, 30, rounds)),
  ['Stretcharna nästan alla behöver efter mycket sittande.', rounds > 1 ? `${rounds} varv ger 90 s per stretch – det som gör dig rörligare.` : 'Kör rundan tre gånger om du vill bli rörligare.']);

/** Animal movements (video 2): prep, then 10 steps forward and back per movement. */
const ANIMAL = ['cat_crawl', 'frog_hop', 'bear_walk', 'monkey', 'crab_walk', 'horse_walk', 'half_duck'];
const animalWarmup = () => plan('animal', 'Djurrörelser', ['finger_pushup', 'bear_squat', 'down_dog', ...ANIMAL].map((id) => hold(id, 30)),
  ['Väcker hela kroppen på sex minuter – perfekt före gym eller löpning.', 'Dynamisk uppvärmning före pass har stöd i forskningen [24].'], 'medel');
const animalConditioning = () => {
  const p = plan('animal_cond', 'Djurrörelser, kondition', ['finger_pushup', 'bear_squat', ...ANIMAL, ...ANIMAL].map((id) => hold(id, 30)),
    ['Två varv utan paus: styrka, rörlighet och puls i ett.', 'Andra varvet går fortare.'], 'hårt');
  return p;
};

function nextSession(ctx: ModuleCtx): PlannedSession {
  const { program, sinceStart } = enrollment(ctx, 'mobility', PROGRAMS);
  const p = PROGRAMS.find((x) => x.id === program.id)!;
  const { sec, rounds } = dose(sinceStart);
  const days = distinctDays(thisWeek(ctx, 'mobility'));
  return plan(p.id, p.name, [...p.warm.map((id) => hold(id, 40)), ...p.holds.map((id) => hold(id, sec, rounds))], [
    `Stretchat ${days} av ${DAYS_TARGET} dagar den här veckan – det är regelbundenheten som gör dig rörligare.`,
    `${rounds} varv × ${sec} s per stretch${rounds * sec >= 90 ? ' – lika mycket som rekommenderas för att öka rörligheten' : '. Ökar när du stretchat några gånger'}.`,
  ]);
}

const micro = () => plan('micro', 'Mikropass', [hold('hip_flexor', 45), hold('half_split', 45), hold('figure_four', 45)], ['Fem minuter om dagen tar dig längre än en timme i veckan.']);

function libraryItem(s: Stretch): LibraryItem {
  const extra: LibraryItem['extra'] = [
    { label: 'Typ', value: s.kind === 'statisk' ? `Statisk stretch, håll 30–45 s${s.sides === 2 ? ' per sida' : ''}` : s.kind === 'dynamisk' ? 'Dynamisk, 30–40 s i rörelse' : 'Rörelse, 10 steg fram och tillbaka' },
    { label: 'Område', value: s.areas.map((a) => AREA_NAME[a]).join(', ') },
  ];
  if (s.easier) extra.push({ label: 'Lättare', value: STRETCH[s.easier].name, to: s.easier });
  if (s.harder) extra.push({ label: 'Svårare', value: STRETCH[s.harder].name, to: s.harder });
  if (s.why) extra.push({ label: 'Varför', value: s.why });
  return { id: s.id, name: s.name, group: s.group, meta: `${s.kind.charAt(0).toUpperCase() + s.kind.slice(1)} · ${s.areas.map((a) => AREA_NAME[a].toLowerCase()).join(', ')}`, tips: [s.cue, ...s.tips], extra };
}

function LogForm({ onSave }: LogFormProps) {
  return createElement(QuickLog, {
    types: [{ value: 'stretch', label: 'Stretch' }, { value: 'yoga', label: 'Yoga' }, { value: 'animal', label: 'Djurrörelser' }, { value: 'mobility', label: 'Rörlighet' }],
    onSave: (v) => onSave({ type: v.type, title: v.title, minutes: v.minutes, feel: v.feel }),
  });
}

export const mobility: TrainingModule = {
  id: 'mobility', slug: 'rorlighet', name: 'Rörlighet', noun: 'stretchpass', icon: Spline,

  nextSession,
  candidates: (ctx) => [nextSession(ctx), micro(), fullBody10()],
  quickStarts: () => [
    { id: 'full10', label: 'Hela kroppen 10 min', hint: 'Nacke till höft · 30 s per stretch', session: fullBody10() },
    { id: 'quick3', label: 'Snabbstretch × 3', hint: '90 s per stretch – för att bli rörligare', session: quick(3) },
    { id: 'animal', label: 'Djurrörelser', hint: '6 min · uppvärmning före gym eller löpning', session: animalWarmup() },
    { id: 'animal_cond', label: 'Djurrörelser, kondition', hint: '9 min utan paus', session: animalConditioning() },
    { id: 'micro', label: 'Mikropass', hint: '5 min · tre stretchar', session: micro() },
    { id: 'test', label: 'Gör ett test', hint: 'Mät hur långt du har kommit', to: '/rorlighet/framsteg?test=1' },
    { id: 'log', label: 'Logga i efterhand', hint: 'Yoga eller egen stretch', to: '/rorlighet/logga' },
  ],
  weekly: (ctx) => ({ done: distinctDays(thisWeek(ctx, 'mobility')), target: DAYS_TARGET, unit: 'dagar' }),

  programs: PROGRAMS,
  program(ctx) {
    const { program, week } = enrollment(ctx, 'mobility', PROGRAMS);
    const days = distinctDays(thisWeek(ctx, 'mobility'));
    const level = Math.min(4, Math.floor((week - 1) / 3) + 1);
    return {
      program, week, label: `Nivå ${level} av 4 · vecka ${week}`,
      thisWeek: Array.from({ length: DAYS_TARGET }, (_, i) => ({ title: `Dag ${i + 1}`, done: i < days })),
      milestones: [1, 2, 3, 4].map((n) => ({ label: `Nivå ${n}`, done: n < level })),
    };
  },

  metrics(ctx): Metric[] {
    const goal = ctx.profile.goals.mobility;
    const testId = goal === 'side_split' ? 'split_side' : goal === 'front_split' ? 'split_front' : 'knee_wall';
    const def = mobility.tests!.find((t) => t.id === testId)!;
    const t = ctx.tests.filter((x) => x.testId === testId);
    const last = t[t.length - 1];
    const days = weeklySeries(logsOf(ctx, 'mobility'), ctx.now, 6, () => 1);
    return [
      { id: testId, label: def.label, value: last ? fmt1(last.value) : '–', unit: def.unit, series: t.map((x) => x.value), invert: def.invert,
        change: t.length > 1 ? `${fmt1(Math.abs(t[0].value - last.value))} cm ${(def.invert ? last.value < t[0].value : last.value > t[0].value) ? 'bättre' : 'sämre'} sedan start` : undefined },
      { id: 'days', label: 'Stretchpass per vecka', value: String(days[days.length - 1]), series: days },
    ];
  },
  tests: [
    { id: 'split_front', label: 'Splitt framåt', unit: 'cm', invert: true, how: 'Gå ner i splitt med stöd. Mät avståndet från grenen till golvet.' },
    { id: 'split_side', label: 'Sidosplitt', unit: 'cm', invert: true, how: 'Gå ner i sidosplitt med stöd. Mät avståndet från grenen till golvet.' },
    { id: 'knee_wall', label: 'Knä mot vägg', unit: 'cm', how: 'Hur långt från väggen kan tån stå när knät nuddar väggen med hälen i golvet?' },
  ],

  library: { title: 'Stretchar och rörelser', groups: GROUPS, items: STRETCHES.map(libraryItem) },
  describe: (l) => `${l.minutes} min`,
  load: (l) => (l.type === 'animal_cond' ? { legs: 0.4, hard: true } : {}),

  Player: MobilityPlayer,
  LogForm,
};
