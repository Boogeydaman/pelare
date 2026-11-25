import { Dumbbell } from 'lucide-react';
import { createElement } from 'react';
import type { LibraryItem, Metric, SessionLog } from '../../core/types';
import { QuickLog } from '../../shared/ui/fields';
import { fmt1, gymDaysOf, logsOf, thisWeek, weeklySeries } from '../common';
import type { LogFormProps, ModuleCtx, TrainingModule } from '../types';
import { EX, EXERCISES, GROUPS, MUSCLES, MUSCLE_NAME, type Exercise, type Need } from './exercises';
import { PROGRAMS, PROGRAM_BY_ID } from './programs';
import { build, history, nextTemplate, programOf, weekVolume, weeklyTarget } from './planner';
import { HOWTO } from './howto';
import { GymDiary, GymProgramExtra, GymSplitNotice } from './diary';
import { coreSession, nextAbWorkout } from './core';
import { AB_WORKOUTS, abSession } from './abs';
import { GymOrCircuit } from './GymOrCircuit';
import { hipAdjust } from './hip';
import { GymLibraryActions, isCustom } from './custom';
import { Link } from 'react-router-dom';
import { ExerciseProgress, GymExerciseList, gymRecords } from './progress';

const NEED_NAME: Record<Need, string> = {
  barbell: 'Skivstång', machine: 'Maskin', cable: 'Kabel', dumbbell: 'Hantlar', bench: 'Bänk',
  pullup_bar: 'Chinsstång', dip_bars: 'Dipsställning', band: 'Gummiband',
};

function libraryItem(e: Exercise): LibraryItem {
  const link = (id?: string) => (id && EX[id] ? EX[id].name : undefined);
  const extra: LibraryItem['extra'] = [
    { label: 'Muskler', value: [...e.primary, ...e.secondary].map((m) => MUSCLE_NAME[m]).join(', ') },
    { label: 'Reps', value: `${e.reps[0]}–${e.reps[1]}${e.unit === 'sek' ? ' s' : ''} · vila ${String(Math.round(e.rest / 30) / 2).replace('.', ',')} min` },
  ];
  if (e.easier) extra.push({ label: 'Lättare', value: link(e.easier)!, to: e.easier });
  if (e.harder) extra.push({ label: 'Svårare', value: link(e.harder)!, to: e.harder });
  if (e.alt?.length) extra.push({ label: 'Ersätts av', value: e.alt.map(link).filter(Boolean).join(', ') });
  if (e.why) extra.push({ label: 'Varför', value: e.why });
  return {
    id: e.id, name: e.name, group: e.group, tips: e.tips, extra, anim: HOWTO[e.id]?.anim, how: HOWTO[e.id]?.how,
    meta: `${e.needs.length ? e.needs.map((n) => NEED_NAME[n]).join(' + ') : 'Kroppsvikt'} · ${e.primary.map((m) => MUSCLE_NAME[m].toLowerCase()).join(', ')}`,
  };
}

function nextSession(ctx: ModuleCtx) {
  if (programOf(ctx.profile).id === 'hip_rehab') return hipAdjust(ctx, build(ctx, nextTemplate(ctx, programOf(ctx.profile)).tpl, { reasons: [''] }));
  const program = programOf(ctx.profile);
  const { tpl } = nextTemplate(ctx, program);
  const done = thisWeek(ctx, 'gym').length;
  const target = gymDaysOf(ctx.profile);
  return build(ctx, tpl, {
    reasons: [done < target ? `Pass ${done + 1} av ${target} den här veckan i ${program.name}.` : `Veckans ${target} pass är gjorda – det här är extra i ${program.name}.`],
  });
}

const e1rm = (kg: number, reps: number) => kg * (1 + reps / 30);

function liftSeries(logs: SessionLog[], id: string): number[] {
  return history(logs, id).reverse().map((h) => Math.max(...h.result.sets.map((s) => e1rm(s.kg, s.reps)))).filter((v) => v > 0);
}

function LogForm({ onSave }: LogFormProps) {
  return createElement(QuickLog, {
    types: [{ value: 'strength', label: 'Styrka' }, { value: 'bodyweight', label: 'Kroppsvikt' }, { value: 'circuit', label: 'Cirkel' }, { value: 'other', label: 'Annat' }],
    onSave: (v) => onSave({ type: v.type, title: v.title, minutes: v.minutes, feel: v.feel }),
  });
}

function GymLibraryExtra({ id }: { id: string }) {
  return createElement('div', null,
    isCustom(id) ? createElement(Link, { to: `/gym/egen-ovning/${id}`, className: 'mt-6 flex min-h-[48px] items-center justify-center rounded-full border border-rule text-[15px] font-medium' }, 'Ändra din övning') : null,
    createElement(ExerciseProgress, { id }));
}

export const gym: TrainingModule = {
  id: 'gym', slug: 'gym', name: 'Gym', noun: 'gympass', icon: Dumbbell,

  nextSession,
  candidates(ctx) {
    const next = nextSession(ctx);
    const short = build(ctx, PROGRAM_BY_ID.minimal.sessions[0], { minutes: 25, reasons: ['Kort om tid? Få set nära failure räcker långt.'] });
    return [next, { ...short, id: 'gym:short', title: 'Kort helkropp' }];
  },
  quickStarts: (ctx) => [
    { id: 'short', label: 'Kort pass', hint: '25 min · få set nära failure', session: { ...build(ctx, PROGRAM_BY_ID.minimal.sessions[0], { minutes: 25 }), id: 'gym:short', title: 'Kort helkropp' } },
    { id: 'travel', label: 'Dagens pass utan utrustning', hint: 'Samma pass i kroppsvikt – räknas i programmet', session: (() => {
      const t = { ...ctx, checkin: { ...ctx.checkin, place: 'travel' as const } };
      return build(t, nextTemplate(t, programOf(ctx.profile)).tpl, { reasons: ['Dagens programpass med kroppsviktsövningar, för resor eller när gymmet inte passar.'] });
    })() },
    { id: 'bw', label: 'Kort hemmapass', hint: '20 min · 40 s arbete, 20 s vila', session: build({ ...ctx, checkin: { ...ctx.checkin, place: 'travel' } }, PROGRAM_BY_ID.home20.sessions[0]) },
    { id: 'core', label: 'Bålpass', hint: '6–10 min · mage och rygg', session: coreSession(ctx) },
    { id: 'abs', label: 'Bålpass – följ med', hint: `${nextAbWorkout(ctx).minutes} min · på tid, utan redskap`, session: abSession(nextAbWorkout(ctx)) },
    { id: 'abs20', label: 'Hela magen', hint: '20 min · 20 övningar, 45 s arbete och 15 s vila', session: abSession(AB_WORKOUTS[3]) },
    { id: 'log', label: 'Logga i efterhand', hint: 'Ett pass du redan har gjort', to: '/gym/logga' },
  ],
  weekly: (ctx) => ({ done: thisWeek(ctx, 'gym').length, target: gymDaysOf(ctx.profile), unit: 'pass' }),

  programs: PROGRAMS,
  program(ctx) {
    const program = programOf(ctx.profile);
    const started = new Date(ctx.profile.enrollments.gym?.startedAt ?? ctx.now);
    const week = Math.min(program.weeks, Math.max(1, Math.floor((ctx.now.getTime() - started.getTime()) / (7 * 864e5)) + 1));
    const done = thisWeek(ctx, 'gym').length;
    const { index } = nextTemplate(ctx, program);
    const first = index - Math.min(done, index);
    return {
      program, week, label: `Vecka ${week} av ${program.weeks}`,
      thisWeek: Array.from({ length: gymDaysOf(ctx.profile) }, (_, i) => ({
        title: program.id === 'rolling' ? (i === done ? `Nästa: ${nextTemplate(ctx, program).tpl.title}` : `Pass ${i + 1}`) : program.sessions[(first + i) % program.sessions.length].title,
        done: i < done,
      })),
      milestones: Array.from({ length: program.weeks }, (_, i) => ({ label: `V${i + 1}`, done: i + 1 < week })),
    };
  },

  metrics(ctx): Metric[] {
    const logs = logsOf(ctx, 'gym');
    const program = programOf(ctx.profile);
    // The two loaded main lifts from the program that have history.
    const mains = [...new Set(program.sessions.flatMap((s) => s.slots.map((x) => x.ex)))]
      .filter((id) => EX[id]?.compound && EX[id].step > 0)
      .map((id) => ({ id, s: liftSeries(logs, id) }))
      .filter((x) => x.s.length)
      .slice(0, 2);
    const lifts: Metric[] = mains.map(({ id, s }) => ({
      id, label: `${EX[id].name}, beräknat max`, value: fmt1(s[s.length - 1]), unit: 'kg', series: s,
      change: s.length > 1 && Math.abs(s[s.length - 1] - s[0]) >= 0.5 ? `${s[s.length - 1] >= s[0] ? '+' : ''}${fmt1(s[s.length - 1] - s[0])} kg sedan start` : undefined,
    }));
    const goal = weeklyTarget(ctx.profile.goals.gym, gymDaysOf(ctx.profile));
    const v = weekVolume(ctx);
    const atGoal = MUSCLES.filter((m) => v[m] >= goal).length;
    const sets = weeklySeries(logs, ctx.now, 6, (l) => (l.data?.kind === 'strength' ? l.data.exercises.reduce((a, e) => a + e.sets.length, 0) : 0));
    return [
      ...lifts,
      { id: 'volume', label: 'Muskler i veckomålet', value: `${atGoal}`, unit: `av ${MUSCLES.length}`,
        bars: MUSCLES.map((m) => ({ label: MUSCLE_NAME[m], value: Math.round(v[m] * 2) / 2, target: goal })) },
      { id: 'sets', label: 'Set per vecka', value: String(sets[sets.length - 1]), series: sets },
    ];
  },

  // A getter: your own exercises are added to EXERCISES at runtime.
  get library() { return { title: 'Övningar', groups: GROUPS, items: EXERCISES.map(libraryItem) }; },
  describe: (l) => (l.data?.kind === 'strength' ? `${l.data.exercises.length} övningar · ${l.data.exercises.reduce((a, e) => a + e.sets.length, 0)} set` : `${l.minutes} min`),
  load(l) {
    if (l.type.startsWith('core')) return { upper: 0.1 }; // short core session: not a hard day
    if (/^hip[1-3]_/.test(l.type)) return { legs: 0.3 }; // early hip rehab: gentle, not a hard day
    if (l.data?.kind === 'circuit') return {}; // follow-along abs: light, quick recovery
    if (l.data?.kind !== 'strength') return { hard: true };
    const m = l.data.exercises.flatMap((e) => EX[e.id]?.primary ?? []);
    return { legs: m.some((x) => ['quads', 'hamstrings', 'glutes'].includes(x)) ? 0.8 : 0.1, upper: m.some((x) => ['chest', 'lats', 'upper_back'].includes(x)) ? 0.8 : 0.1, hard: true };
  },

  Player: GymOrCircuit,
  LogForm,
  ProgressExtra: GymExerciseList,
  LibraryExtra: GymLibraryExtra,
  LibraryActions: GymLibraryActions,
  Diary: { label: 'Dagbok', Component: GymDiary },
  ProgramExtra: GymProgramExtra,
  Notice: GymSplitNotice,
  records: gymRecords,
};
