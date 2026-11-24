// The basic questions – goals for gym, running and mobility, gym days and where you train. Asked in the
// onboarding, and again when you leave the rehab mode (those who chose rehab skipped them).
import type { ReactNode } from 'react';
import type { Equip, Goals, MobilityFocus, ModuleId, Place } from '../core/types';
import { RUN_PER_WEEK } from '../modules/common';
import { FOCUS_OPTIONS } from '../modules/mobility/FocusPicker';
import { Kicker, OptionList } from '../shared/ui/kit';

export const GOAL_OPTIONS: { [K in ModuleId]: { value: Goals[K]; label: string; hint: string }[] } = {
  gym: [
    { value: 'stronger', label: 'Bli starkare', hint: 'Tyngre vikter i grundlyften' },
    { value: 'muscle', label: 'Bygga muskler', hint: 'Mer volym, fler set' },
    { value: 'maintain', label: 'Hålla mig stark', hint: 'Minsta effektiva dos' },
  ],
  run: [
    { value: 'start', label: 'Dina första 5 km', hint: 'Från noll, med gå-spring · 7 veckor' },
    { value: '10k', label: 'Dina första 10 km', hint: 'Jag kan springa 30 min utan paus · 8 veckor' },
    { value: '15k', label: 'Dina första 15 km', hint: 'Jag springer redan 10 km · 10 veckor' },
    { value: '20k', label: 'Dina första 20 km', hint: 'Jag springer 10 km bekvämt · 12 veckor' },
    { value: '5k', label: 'Snabbare 5 km', hint: 'Jag springer redan 5 km' },
  ],
  mobility: [
    { value: 'front_split', label: 'Splitt framåt', hint: 'Baksida lår och höftböjare' },
    { value: 'side_split', label: 'Sidosplitt', hint: 'Insida lår och höfter' },
    { value: 'hips', label: 'Rörligare höfter', hint: 'För knäböj, löpning och vardag' },
    { value: 'general', label: 'Rörligare överlag', hint: 'Höfter, axlar och fotleder' },
  ],
};
export const WALK_OPTION = { value: 'walk' as const, label: 'Promenader och cykel', hint: 'Kondition utan löpning – tills kirurgen gett klartecken · 4 pass i veckan' };

export type BasicStep = 'gym' | 'run' | 'mobility' | 'days' | 'place';
export interface Basics { goals: Goals; focus: MobilityFocus[]; gymDays: number; places: Place[]; equip: Equip[] }

const TITLE: Record<ModuleId, [string, string]> = {
  gym: ['Gym', 'Vad vill du få ut av styrketräningen?'],
  run: ['Löpning', 'Vad är ditt löpmål?'],
  mobility: ['Rörlighet', 'Vill du lägga extra fokus på något?'],
};

/** The old single mobility goal, derived from the focus areas. */
export const mobilityGoal = (focus: MobilityFocus[]): Goals['mobility'] =>
  focus.find((f): f is 'front_split' | 'side_split' | 'hips' => f === 'front_split' || f === 'side_split' || f === 'hips') ?? 'general';

export function Q({ kicker, kind, title, children }: { kicker?: string; kind?: ModuleId; title: string; children: ReactNode }) {
  return (
    <div>
      {kicker && <Kicker kind={kind} className="mb-3">{kicker}</Kicker>}
      <h1 className="mb-8 font-serif text-title">{title}</h1>
      {children}
    </div>
  );
}

/** One basic question. `walk` adds walking as a running choice (after a hip replacement), `runNote` goes under it. */
export function BasicQuestion({ step, b, set, walk, runNote }: { step: BasicStep; b: Basics; set: (b: Basics) => void; walk?: boolean; runNote?: ReactNode }) {
  if (step === 'gym') {
    return (
      <Q kicker={TITLE.gym[0]} kind="gym" title={TITLE.gym[1]}>
        <OptionList value={b.goals.gym} options={GOAL_OPTIONS.gym} onChange={(v) => set({ ...b, goals: { ...b.goals, gym: v } })} />
      </Q>
    );
  }
  if (step === 'run') {
    return (
      <Q kicker={TITLE.run[0]} kind="run" title={TITLE.run[1]}>
        <OptionList value={b.goals.run} options={walk ? [WALK_OPTION, ...GOAL_OPTIONS.run] : GOAL_OPTIONS.run} onChange={(v) => set({ ...b, goals: { ...b.goals, run: v } })} />
        {runNote}
      </Q>
    );
  }
  if (step === 'mobility') {
    return (
      <Q kicker={TITLE.mobility[0]} kind="mobility" title={TITLE.mobility[1]}>
        <p className="-mt-4 mb-4 text-[16px] text-ink2">Hela kroppen ingår alltid – axlar, rygg, höfter, ben och fotleder varje vecka. Välj gärna ett eller flera områden som ska få extra tid, eller inget alls.</p>
        <OptionList multi value={b.focus} options={FOCUS_OPTIONS} onChange={(v) => set({ ...b, focus: b.focus.includes(v) ? b.focus.filter((x) => x !== v) : [...b.focus, v] })} />
      </Q>
    );
  }
  if (step === 'days') {
    const run = RUN_PER_WEEK[b.goals.run] ?? 3;
    return (
      <Q kicker="Gym" kind="gym" title="Hur många gympass i veckan?">
        <OptionList value={b.gymDays} onChange={(v) => set({ ...b, gymDays: v })} options={[
          { value: 1, label: '1 pass', hint: 'Bättre än inget – men två ger mer' },
          { value: 2, label: '2 pass', hint: 'Minsta effektiva dosen, och WHO:s rekommendation' },
          { value: 3, label: '3 pass', hint: 'Helkropp tre gånger i veckan' },
          { value: 4, label: '4 pass', hint: 'Över- och underkropp varannan gång' },
        ]} />
        <p className="mt-6 text-[16px] leading-snug text-ink2">
          {b.goals.run === 'walk' ? 'Promenaderna' : 'Löpningen'} följer ditt program: <span className="font-medium text-ink">{run} pass i veckan</span>.
          Totalt blir det <span className="font-medium text-ink">{b.gymDays + run} pass i veckan</span>. Korta stretchpass räknas inte – de görs de flesta dagar.
        </p>
      </Q>
    );
  }
  return (
    <Q title="Var tränar du?">
      <OptionList multi value={b.places} onChange={(v) => set({ ...b, places: b.places.includes(v) ? b.places.filter((x) => x !== v) : [...b.places, v] })}
        options={[{ value: 'gym', label: 'På gym', hint: 'Skivstång, hantlar och maskiner' }, { value: 'home', label: 'Hemma', hint: 'Kroppsvikt, eller det du har' }]} />
      {b.places.includes('home') && (
        <div className="mt-8">
          <div className="mb-1 text-[14px] text-ink2">Vad har du hemma?</div>
          <OptionList multi value={b.equip} onChange={(v) => set({ ...b, equip: b.equip.includes(v) ? b.equip.filter((x) => x !== v) : [...b.equip, v] })}
            options={[{ value: 'dumbbell', label: 'Hantlar' }, { value: 'band', label: 'Gummiband' }, { value: 'pullup_bar', label: 'Chinsstång' }]} />
        </div>
      )}
    </Q>
  );
}
