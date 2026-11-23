// "Din vecka i siffror": a short story of the week, every Sunday evening after 18:00.
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCtx } from '../core/ctx';
import { weekStart } from '../core/format';
import type { ModuleId, SessionLog } from '../core/types';
import { recentRecords } from '../modules/gym/progress';
import { EX, MUSCLE_NAME, type Muscle } from '../modules/gym/exercises';
import { km } from '../modules/run/planner';
import { color } from '../shared/ui/kit';

const DAY = 864e5;
const KEY = 'pelare.wrappedSeen';

/** Sunday from 18:00, and Monday morning for anyone who missed it. Returns the Monday the summary is about. */
export function wrappedWeek(now: Date): Date | null {
  const d = now.getDay(), h = now.getHours();
  if (d === 0 && h >= 18) return weekStart(now);
  if (d === 1 && h < 12) return weekStart(new Date(now.getTime() - DAY));
  return null;
}

const seenKey = (monday: Date) => monday.toISOString().slice(0, 10);
export const wrappedSeen = (monday: Date) => { try { return localStorage.getItem(KEY) === seenKey(monday); } catch { return false; } };

/** Card on Idag while the summary is available. */
export function WrappedCard() {
  const ctx = useCtx();
  const [hidden, setHidden] = useState(false);
  if (!ctx || hidden) return null;
  const monday = wrappedWeek(ctx.now);
  if (!monday || wrappedSeen(monday)) return null;
  const n = ctx.logs.filter((l) => new Date(l.startedAt) >= monday && new Date(l.startedAt) < new Date(monday.getTime() + 7 * DAY)).length;
  if (!n) return null;
  return (
    <section className="rise mt-4 overflow-hidden rounded-[24px] p-5" style={{ background: `linear-gradient(135deg, ${color('gym')}, ${color('run')} 55%, ${color('mobility')})`, color: 'rgb(var(--onpillar))' }}>
      <div className="text-[13px] font-medium opacity-80">Veckan som gick</div>
      <div className="mt-1 font-serif text-[34px] leading-tight">Din vecka i siffror</div>
      <p className="mt-1 text-[15px] opacity-90">{n} pass, dina rekord och hur veckan blev – på en minut.</p>
      <div className="mt-4 flex gap-3">
        <Link to="/veckan" className="flex h-12 flex-1 items-center justify-center rounded-full text-[16px] font-semibold" style={{ background: 'rgb(var(--onpillar))', color: 'rgb(var(--ink))' }}>Visa</Link>
        <button onClick={() => { try { localStorage.setItem(KEY, seenKey(monday)); } catch { /* ignore */ } setHidden(true); }} className="h-12 px-4 text-[15px] font-medium opacity-90">Inte nu</button>
      </div>
    </section>
  );
}

interface Slide { kind: ModuleId | 'all'; kicker: string; big: string; unit?: string; lines: string[] }

function summarize(logs: SessionLog[], monday: Date): Slide[] {
  const end = new Date(monday.getTime() + 7 * DAY);
  const inWeek = (l: SessionLog, from: Date, to: Date) => { const t = new Date(l.startedAt); return t >= from && t < to; };
  const week = logs.filter((l) => inWeek(l, monday, end));
  const prev = logs.filter((l) => inWeek(l, new Date(monday.getTime() - 7 * DAY), monday));
  const min = week.reduce((a, l) => a + l.minutes, 0);
  const days = new Set(week.map((l) => new Date(l.startedAt).getDay())).size;
  const of = (m: string, list = week) => list.filter((l) => l.module === m);

  const slides: Slide[] = [{
    kind: 'all', kicker: `Veckan ${monday.getDate()}/${monday.getMonth() + 1}–${new Date(monday.getTime() + 6 * DAY).getDate()}/${new Date(monday.getTime() + 6 * DAY).getMonth() + 1}`, big: String(week.length), unit: week.length === 1 ? 'pass' : 'pass',
    lines: [`${min} minuters träning fördelat på ${days} ${days === 1 ? 'dag' : 'dagar'}.`,
      prev.length ? (week.length >= prev.length ? `${week.length - prev.length === 0 ? 'Lika många' : `${week.length - prev.length} fler`} pass än förra veckan.` : `${prev.length - week.length} färre pass än förra veckan – helt okej, det är regelbundenheten över tid som räknas.`) : 'Första veckan med Pelare – bra start.'],
  }];

  const gym = of('gym');
  if (gym.length) {
    const sets = gym.reduce((a, l) => a + (l.data?.kind === 'strength' ? l.data.exercises.reduce((b, e) => b + e.sets.length, 0) : 0), 0);
    const tonnes = gym.reduce((a, l) => a + (l.data?.kind === 'strength' ? l.data.exercises.reduce((b, e) => b + e.sets.reduce((c, s) => c + s.kg * s.reps, 0), 0) : 0), 0);
    const muscles: Record<string, number> = {};
    for (const l of gym) if (l.data?.kind === 'strength') for (const e of l.data.exercises) for (const m of EX[e.id]?.primary ?? []) muscles[m] = (muscles[m] ?? 0) + e.sets.length;
    const top = Object.entries(muscles).sort((a, b) => b[1] - a[1])[0];
    const recs = recentRecords(logs, 400).filter((r) => inWeek({ startedAt: r.date } as SessionLog, monday, end));
    slides.push({ kind: 'gym', kicker: 'Gym', big: String(sets), unit: 'set',
      lines: [`${gym.length} gympass${tonnes ? `, totalt ${Math.round(tonnes).toLocaleString('sv-SE')} kg lyfta` : ''}.`,
        ...(top ? [`Mest tränat: ${MUSCLE_NAME[top[0] as Muscle].toLowerCase()} med ${top[1]} set.`] : []),
        ...(recs.length ? [`${recs.length === 1 ? 'Nytt rekord' : `${recs.length} nya rekord`}: ${recs.slice(0, 2).map((r) => `${r.title} (${r.detail.replace(/^Nytt rekord: /, '')})`).join(', ')}.`] : [])] });
  }

  const run = of('run');
  if (run.length) {
    const k = run.reduce((a, l) => a + km(l), 0);
    const longest = run.reduce((a, l) => Math.max(a, l.minutes), 0);
    const prevKm = of('run', prev).reduce((a, l) => a + km(l), 0);
    slides.push({ kind: 'run', kicker: 'Löpning', big: k ? k.toFixed(1).replace('.', ',') : String(run.reduce((a, l) => a + l.minutes, 0)), unit: k ? 'km' : 'minuter',
      lines: [`${run.length} löppass, längsta ${longest} minuter.`,
        ...(k && prevKm ? [k >= prevKm ? `${(k - prevKm).toFixed(1).replace('.', ',')} km mer än förra veckan.` : 'Lite kortare än förra veckan – bra att variera.'] : []),
        'Skadevakten höll koll: inget pass sprang iväg för långt.'] });
  }

  const mob = of('mobility');
  if (mob.length) {
    const mDays = new Set(mob.map((l) => new Date(l.startedAt).getDay())).size;
    slides.push({ kind: 'mobility', kicker: 'Rörlighet', big: String(mDays), unit: mDays === 1 ? 'dag' : 'dagar',
      lines: [`${mob.reduce((a, l) => a + l.minutes, 0)} minuter stretch och rörlighet.`, mDays >= 5 ? 'Veckomålet nått – det är regelbundenheten som gör dig rörligare.' : `Målet är fem dagar – ${5 - mDays} till nästa vecka gör skillnad.`] });
  }

  slides.push({ kind: 'all', kicker: 'Nästa vecka', big: '→', lines: [
    'Ny vecka, nya mål. Appen planerar den åt dig i morgon bitti.',
    days >= 4 ? 'Du var aktiv de flesta dagarna – fortsätt så.' : 'Ett pass till nästa vecka än den här är ett bra mål.',
  ] });
  return slides;
}

export function WrappedPage() {
  const ctx = useCtx();
  const nav = useNavigate();
  const [i, setI] = useState(0);
  // Outside Sunday evening: this week so far, or last week if nothing has happened yet this week.
  const monday = ctx ? wrappedWeek(ctx.now) ?? (ctx.logs.some((l) => new Date(l.startedAt) >= weekStart(ctx.now)) ? weekStart(ctx.now) : weekStart(new Date(weekStart(ctx.now).getTime() - DAY))) : null;
  const slides = useMemo(() => (ctx && monday ? summarize(ctx.logs, monday) : []), [ctx, monday?.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ctx || !monday || !slides.length) return null;
  const s = slides[i];
  const close = () => { try { localStorage.setItem(KEY, seenKey(monday)); } catch { /* ignore */ } nav('/idag', { replace: true }); };
  const bg = s.kind === 'all' ? `linear-gradient(160deg, ${color('gym')}, ${color('run')} 60%, ${color('mobility')})` : color(s.kind as ModuleId);
  return (
    <div className="fixed inset-0 flex select-none flex-col" style={{ background: bg, color: 'rgb(var(--onpillar))' }}>
      <div className="safe-top mx-auto flex w-full max-w-lg flex-1 flex-col px-6">
        <div className="flex gap-1.5 pt-3" aria-hidden="true">
          {slides.map((_, k) => <span key={k} className="h-1 flex-1 rounded-full" style={{ background: `rgb(var(--onpillar) / ${k <= i ? 0.95 : 0.3})` }} />)}
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={close} aria-label="Stäng" className="-mr-2 flex h-12 w-12 items-center justify-center"><X size={24} /></button>
        </div>
        <div key={i} className="rise flex flex-1 flex-col justify-center pb-24">
          <div className="text-[15px] font-medium opacity-80">{s.kicker}</div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="num font-serif text-[120px] leading-none">{s.big}</span>
            {s.unit && <span className="text-[24px] opacity-90">{s.unit}</span>}
          </div>
          <ul className="mt-6 space-y-3">
            {s.lines.map((t, k) => <li key={k} className="text-[19px] leading-snug">{t}</li>)}
          </ul>
        </div>
      </div>
      {/* Tap left to go back, right to go on */}
      <button className="absolute inset-y-24 left-0 w-1/3" aria-label="Föregående" onClick={() => setI(Math.max(0, i - 1))} />
      <button className="absolute inset-y-24 right-0 w-2/3" aria-label={i + 1 < slides.length ? 'Nästa' : 'Klar'} onClick={() => (i + 1 < slides.length ? setI(i + 1) : close())} />
      <div className="safe-bottom pointer-events-none mx-auto w-full max-w-lg px-6 pb-6 text-center text-[13px] opacity-75">{i + 1 < slides.length ? 'Tryck för nästa' : 'Tryck för att stänga'}</div>
    </div>
  );
}

export type { Slide };
export const _test = { summarize };
