import { fmtClock, fmtNum } from '../../core/format';
import type { Content, LogData, PlannedSession } from '../../core/types';
import { MODULE_NAME } from '../ui/kit';

/** What a planned session contains – exercises, segments or stretches. */
export function ContentList({ content }: { content: Content }) {
  return (
    <ol>
      {content.kind === 'strength' && content.items.map((it, i) => (
        <li key={it.id + i} className="flex items-baseline justify-between gap-4 border-t border-rule py-4">
          <span className="flex items-baseline gap-4">
            <span className="num w-5 text-[14px] text-ink2">{i + 1}</span>
            <span className="text-[17px] font-medium">{it.name}</span>
          </span>
          <span className="num shrink-0 text-[15px] text-ink2">{it.sets} × {it.reps[0]}–{it.reps[1]}</span>
        </li>
      ))}
      {content.kind === 'run' && content.segments.map((s, i) => (
        <li key={i} className="flex items-baseline justify-between gap-4 border-t border-rule py-3">
          <span className={`text-[17px] ${s.effort === 'hårt' ? 'font-semibold' : ''}`}>{s.label}</span>
          <span className="num text-[15px] text-ink2">{fmtClock(s.seconds)}</span>
        </li>
      ))}
      {content.kind === 'mobility' && content.holds.map((h) => (
        <li key={h.id} className="flex items-baseline justify-between gap-4 border-t border-rule py-4">
          <span className="text-[17px] font-medium">{h.name}</span>
          <span className="num shrink-0 text-[15px] text-ink2">{h.rounds > 1 ? `${h.rounds} × ` : ''}{h.seconds} s{h.sides === 2 ? ' / sida' : ''}</span>
        </li>
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
            <div className="num text-[15px] text-ink2">{e.sets.map((s) => (s.kg ? `${fmtNum(s.kg)} × ${s.reps}` : `${s.reps}`)).join('  ·  ')}</div>
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
