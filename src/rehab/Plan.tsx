// Rehab mode – Plan: each phase's sessions, goals and walking, with the exercises' how-to inline.
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCtx } from '../core/ctx';
import { REHAB_PHASES, rehabPhase } from '../modules/common';
import { EX } from '../modules/gym/exercises';
import { HIP_PHASES } from '../modules/gym/hip';
import { ExerciseHow } from '../shared/ui/ExerciseHow';
import { PHASE_INFO, REHAB, rehabTint } from './content';

export function RehabPlan() {
  const ctx = useCtx();
  const current = ctx ? rehabPhase(ctx.profile, ctx.now) ?? 5 : 1;
  const [n, setN] = useState(current);
  const [open, setOpen] = useState<string | null>(null);
  if (!ctx) return null;
  const phase = REHAB_PHASES[n - 1];
  const info = PHASE_INFO[n];
  const surgery = new Date(`${ctx.profile.rehab!.surgery}T12:00:00`);
  const from = new Date(surgery.getTime() + phase.weeks[0] * 7 * 864e5);
  return (
    <div className="pb-6 pt-4">
      <div className="text-[13px] font-semibold" style={{ color: REHAB }}>Rehabläge</div>
      <h1 className="mt-1 font-serif text-display">Planen</h1>

      <div className="mt-5 grid grid-cols-5 gap-1.5" role="tablist" aria-label="Faser">
        {REHAB_PHASES.map((x) => (
          <button key={x.n} role="tab" aria-selected={n === x.n} onClick={() => { setN(x.n); setOpen(null); }}
            className="flex h-14 flex-col items-center justify-center rounded-2xl text-[12px] font-semibold"
            style={n === x.n ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { background: rehabTint(x.n <= current ? 0.14 : 0.06), color: x.n <= current ? REHAB : 'rgb(var(--ink2))' }}>
            <span className="text-[17px]">{x.n}</span>{x.n === current ? 'nu' : ''}
          </button>
        ))}
      </div>

      <section className="mt-6">
        <div className="text-[13px] text-ink2">
          {phase.weeks[1] === Infinity ? `Från vecka ${phase.weeks[0]}` : `Vecka ${phase.weeks[0]}–${phase.weeks[1]}`} · {n === 1 ? 'från operationen' : `från ${from.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}`}
        </div>
        <h2 className="mt-1 font-serif text-[32px] leading-tight">Fas {n}: {phase.name}</h2>
        <p className="mt-2 text-[16px] leading-snug">{info.focus}</p>
        <div className="mt-2 text-[14px] text-ink2">{phase.gym ? `${phase.gym} rehabpass i veckan` : 'Styrka 2–3 gånger i veckan'} · promenader {phase.walks ? `${phase.walks} gånger i veckan` : 'flera gånger om dagen'}</div>
      </section>

      <section className="mt-6 rounded-[22px] px-5 py-4" style={{ background: rehabTint(0.08) }}>
        <div className="text-[13px] font-medium" style={{ color: REHAB }}>Mål innan nästa fas</div>
        <ul className="mt-1 space-y-1">{info.goals.map((g) => <li key={g} className="flex gap-2 text-[15px]"><span style={{ color: REHAB }}>•</span>{g}</li>)}</ul>
        <p className="mt-3 text-[13px] text-ink2">Tiderna är riktmärken. Känns det för tidigt kan du stanna kvar i en fas under Inställningar.</p>
      </section>

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
                      <span className="num block text-[13px] text-ink2">{sl.sets} × {(sl.reps ?? ex.reps).join('–')}{ex.unit === 'sek' ? ' s' : ''}{sl.note ? ` · ${sl.note}` : ''}</span>
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

      <section className="mt-8">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Gång och kondition</h3>
        <p className="mt-2 border-t border-rule pt-3 text-[15px] leading-snug">{info.walking}</p>
      </section>
      <section className="mt-6">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Sedan</h3>
        <p className="mt-2 border-t border-rule pt-3 text-[15px] leading-snug">{info.next}</p>
      </section>
    </div>
  );
}
