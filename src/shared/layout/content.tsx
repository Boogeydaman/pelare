import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { fmtClock, fmtNum } from '../../core/format';
import { ExerciseHow } from '../ui/ExerciseHow';
import type { Content, LogData, PlannedSession } from '../../core/types';
import { MODULE_NAME } from '../ui/kit';

/** What a planned session contains – exercises, segments or stretches. */
export function ContentList({ content }: { content: Content }) {
  // Tap an exercise to see how it is done, without leaving the list.
  const [open, setOpen] = useState<number | null>(null);
  const row = (k: number, left: React.ReactNode, right: React.ReactNode, how: React.ReactNode) => (
    <li key={k} className="border-t border-rule">
      <button onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="flex w-full items-center justify-between gap-4 py-4 text-left">
        <span className="flex items-baseline gap-4">{left}</span>
        <span className="flex shrink-0 items-center gap-2">{right}<ChevronDown size={16} className={`text-ink2 transition ${open === k ? 'rotate-180' : ''}`} aria-hidden="true" /></span>
      </button>
      {open === k && how}
    </li>
  );
  return (
    <ol>
      {content.kind === 'strength' && content.items.map((it, i) => row(i,
        <><span className="num w-5 text-[14px] text-ink2">{i + 1}</span><span className="text-[17px] font-medium">{it.name}</span></>,
        <span className="num text-[15px] text-ink2">{it.sets} × {it.reps[0]}{it.reps[1] !== it.reps[0] ? `–${it.reps[1]}` : ''}{it.unit === 'sek' ? ' s' : ''}</span>,
        <ExerciseHow module="gym" id={it.id} name={it.name} compact />,
      ))}
      {content.kind === 'run' && content.segments.map((s, i) => (
        <li key={i} className="flex items-baseline justify-between gap-4 border-t border-rule py-3">
          <span className={`text-[17px] ${s.effort === 'hårt' ? 'font-semibold' : ''}`}>{s.label}</span>
          <span className="num text-[15px] text-ink2">{fmtClock(s.seconds)}</span>
        </li>
      ))}
      {content.kind === 'mobility' && content.holds.map((h, i) => row(i,
        <span className="text-[17px] font-medium">{h.name}</span>,
        <span className="num text-[15px] text-ink2">{h.rounds > 1 ? `${h.rounds} × ` : ''}{h.seconds} s{h.sides === 2 ? ' / sida' : ''}</span>,
        <ExerciseHow module="mobility" id={h.id} name={h.name} compact />,
      ))}
      {content.kind === 'rest' && <li className="border-t border-rule py-4 text-[17px]">{content.text}</li>}
    </ol>
  );
}

/** What was actually done in a logged session. */
export function ResultList({ data }: { data?: LogData }) {
  if (!data) return null;
  if (data.kind === 'strength') {
    return (
      <ul>
        {data.exercises.map((e) => (
          <li key={e.id} className="border-t border-rule py-3">
            <div className="text-[17px] font-medium">{e.name}</div>
            <div className="num text-[15px] text-ink2">{e.sets.map((s) => (s.kg ? `${fmtNum(s.kg)} × ${s.reps}` : `${s.reps}${e.unit === 'sek' ? ' s' : ''}`)).join('  ·  ')}</div>
          </li>
        ))}
      </ul>
    );
  }
  if (data.kind === 'run') return <p className="border-t border-rule py-3 text-[17px]">{data.distanceKm ? `${fmtNum(data.distanceKm)} km` : 'Ingen distans angiven'}</p>;
  if (data.kind === 'mobility') return <p className="border-t border-rule py-3 text-[17px]">{data.holdsDone} stretchar</p>;
  return <p className="border-t border-rule py-3 text-[17px]">{data.activity}</p>;
}

export function Meta({ s, className = '' }: { s: PlannedSession; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] text-ink2 ${className}`}>
      <span className="num font-medium text-ink">{s.minutes} min</span>
      <span aria-hidden="true">·</span><span>{s.summary}</span>
      <span aria-hidden="true">·</span><span>{s.module === 'rest' ? MODULE_NAME.rest.toLowerCase() : s.effort}</span>
    </div>
  );
}
