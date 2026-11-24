// Rehab mode – Plan: each phase's goals, what happens in the body, the sessions with the exercises'
// how-to inline, what to avoid, the criteria for moving on – and the timeline from the operation.
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCtx } from '../core/ctx';
import type { Profile } from '../core/types';
import { PREHAB, REHAB_PHASES, phaseOf, rehabPhase, weeksFromSurgery } from '../modules/common';
import { EX } from '../modules/gym/exercises';
import { DOSE, HIP_PHASES, precautions } from '../modules/gym/hip';
import { ExerciseHow } from '../shared/ui/ExerciseHow';
import { PHASE_INFO, REHAB, rehabTint } from './content';
import { CRITERIA, MILESTONES } from './criteria';

const DAY = 864e5;

export function RehabPlan() {
  const ctx = useCtx();
  const current = ctx ? rehabPhase(ctx.profile, ctx.now) ?? 5 : 1;
  const [n, setN] = useState(current);
  const [open, setOpen] = useState<string | null>(null);
  if (!ctx) return null;
  const phases = current === 0 ? [PREHAB, ...REHAB_PHASES] : REHAB_PHASES;
  const phase = phaseOf(n);
  const info = PHASE_INFO[n];
  const surgery = new Date(`${ctx.profile.rehab!.surgery}T12:00:00`);
  const from = new Date(surgery.getTime() + Math.max(0, phase.weeks[0]) * 7 * DAY);
  const restrict = n <= 3 ? precautions(ctx.profile, ctx.now) : null;
  return (
    <div className="pb-6 pt-4">
      <div className="text-[13px] font-semibold" style={{ color: REHAB }}>Rehabläge</div>
      <h1 className="mt-1 font-serif text-display">Planen</h1>

      <div className={`mt-5 grid gap-1.5 ${phases.length === 6 ? 'grid-cols-6' : 'grid-cols-5'}`} role="tablist" aria-label="Faser">
        {phases.map((x) => (
          <button key={x.n} role="tab" aria-selected={n === x.n} onClick={() => { setN(x.n); setOpen(null); }}
            className="flex h-14 flex-col items-center justify-center rounded-2xl text-[12px] font-semibold"
            style={n === x.n ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { background: rehabTint(x.n <= current ? 0.14 : 0.06), color: x.n <= current ? REHAB : 'rgb(var(--ink2))' }}>
            <span className="text-[17px]">{x.n === 0 ? 'Före' : x.n}</span>{x.n === current ? 'nu' : ''}
          </button>
        ))}
      </div>

      <section className="mt-6">
        <div className="text-[13px] text-ink2">
          {n === 0 ? `Operationen ${surgery.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}` : n === 1 ? 'Dag 0–3 · på sjukhuset' : phase.weeks[1] === Infinity ? `3–12 månader och framåt · från cirka ${from.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}` : `Cirka vecka ${Math.max(1, Math.round(phase.weeks[0]))}–${phase.weeks[1]} · från ${from.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}`}
        </div>
        <h2 className="mt-1 font-serif text-[32px] leading-tight">{n === 0 ? 'Före operationen' : `Fas ${n}: ${phase.name}`}</h2>
        <p className="mt-2 text-[16px] leading-snug">{info.focus}</p>
      </section>

      <section className="mt-6 rounded-[22px] px-5 py-4" style={{ background: rehabTint(0.08) }}>
        <div className="text-[13px] font-medium" style={{ color: REHAB }}>Mål</div>
        <ul className="mt-1 space-y-1">{info.goals.map((g) => <li key={g} className="flex gap-2 text-[15px]"><span style={{ color: REHAB }}>•</span>{g}</li>)}</ul>
        <div className="mt-3 text-[13px] font-medium" style={{ color: REHAB }}>Hur mycket</div>
        <p className="mt-1 text-[15px] leading-snug">{DOSE[n]}</p>
      </section>

      <Fold title="Vad som händer i kroppen">
        <ul className="space-y-2">{info.body.map((b) => <li key={b} className="text-[15px] leading-snug">{b}</li>)}</ul>
      </Fold>

      {HIP_PHASES[n].map((tpl) => (
        <section key={tpl.type} className="mt-8">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">{tpl.title}</h3>
          <ol className="mt-2">
            {tpl.slots.map((sl, i) => {
              const ex = EX[sl.ex];
              const key = `${tpl.type}-${i}`;
              if (!ex) return null;
              return (
                <li key={key} className="border-t border-rule">
                  <button onClick={() => setOpen(open === key ? null : key)} aria-expanded={open === key} className="flex w-full items-center justify-between gap-3 py-3 text-left">
                    <span>
                      <span className="block text-[16px] font-medium">{ex.name}</span>
                      <span className="num block text-[13px] text-ink2">{sl.sets} × {[...new Set(sl.reps ?? ex.reps)].join('–')}{ex.unit === 'sek' ? ' s' : ''}{sl.note ? ` · ${sl.note}` : ''}</span>
                    </span>
                    <ChevronDown size={16} className={`shrink-0 text-ink2 transition ${open === key ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {open === key && <ExerciseHow module="gym" id={ex.id} name={ex.name} compact />}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <p className="mt-3 text-[13px] text-ink2">Appen anpassar passen efter ditt snitt, belastning och utrustning – det du ser här är grundprogrammet.</p>

      <section className="mt-8">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Gång och kondition</h3>
        <p className="mt-2 border-t border-rule pt-3 text-[15px] leading-snug">{info.walking}</p>
      </section>

      <section className="mt-6">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Undvik</h3>
        <ul className="mt-2 border-t border-rule pt-3">{info.avoid.map((a) => <li key={a} className="flex gap-2 py-0.5 text-[15px] leading-snug"><span className="text-ink2">–</span>{a}</li>)}</ul>
        {restrict && <p className="mt-2 rounded-2xl px-4 py-3 text-[14px] leading-snug" style={{ background: rehabTint(0.08) }}>{restrict}</p>}
      </section>

      {CRITERIA[n] && (
        <section className="mt-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Gå vidare till fas {n + 1} när du klarar</h3>
          <ul className="mt-2 border-t border-rule pt-3">{CRITERIA[n].map((c) => <li key={c.id} className="flex gap-2 py-0.5 text-[15px] leading-snug"><span style={{ color: REHAB }}>✓</span>{c.text}</li>)}</ul>
          {n === current && <p className="mt-2 text-[13px] text-ink2">Bocka i kriterierna på I dag när du klarar dem. <Link to="/rehab/tester" className="underline underline-offset-4">Testerna</Link> hjälper dig att veta.</p>}
        </section>
      )}

      <section className="mt-6">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Sedan</h3>
        <p className="mt-2 border-t border-rule pt-3 text-[15px] leading-snug">{info.next}</p>
      </section>

      <Timeline p={ctx.profile} now={ctx.now} />
    </div>
  );
}

function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-4 rounded-[22px] border border-rule px-5">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-[52px] w-full items-center justify-between text-left text-[15px] font-medium">
        {title} <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </section>
  );
}

/** Milestones from the operation date: what usually happens when (report parts 2, 4, 8). */
function Timeline({ p, now }: { p: Profile; now: Date }) {
  const surgery = new Date(`${p.rehab!.surgery}T12:00:00`);
  const days = weeksFromSurgery(p, now) * 7;
  const nextIdx = MILESTONES.findIndex((m) => m.day > days);
  return (
    <section className="mt-10">
      <h2 className="font-serif text-[26px] leading-tight">Tidslinjen</h2>
      <p className="mt-1 text-[14px] text-ink2">Ungefär när saker brukar hända, räknat från din operation. Ditt sjukhus besked går före.</p>
      <ol className="mt-4">
        {MILESTONES.map((m, i) => {
          const at = new Date(surgery.getTime() + m.day * DAY);
          const past = m.day <= days;
          const isNext = i === nextIdx;
          return (
            <li key={`${m.day}-${m.title}`} className="flex gap-4 border-t border-rule py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={past ? { background: rehabTint(0.35), color: 'rgb(var(--onpillar))' } : isNext ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { border: `2px solid ${rehabTint(0.35)}` }}>
                {past && <Check size={13} aria-label="Passerat" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="num block text-[12px] text-ink2">{m.day === 0 ? 'Dag 0' : m.day < 60 ? `Dag ${m.day}` : m.day < 365 ? `${Math.round(m.day / 30)} månader` : `${Math.round(m.day / 365)} år`} · {at.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', ...(at.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) })}</span>
                <span className={`block text-[15px] ${isNext ? 'font-semibold' : 'font-medium'} ${past ? 'text-ink2' : ''}`}>{m.title}</span>
                <span className="block text-[14px] leading-snug text-ink2">{m.text}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
