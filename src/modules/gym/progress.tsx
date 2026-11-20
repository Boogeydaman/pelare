// Gym progress: personal records, per-exercise history and the list of exercises you have done.
import { ArrowDownRight, ArrowRight, ArrowUpRight, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCtx } from '../../core/ctx';
import { fmtDate, fmtNum } from '../../core/format';
import type { SessionLog } from '../../core/types';
import { Empty, Row, Section } from '../../shared/layout/page';
import { Line, color } from '../../shared/ui/kit';
import type { RecordItem } from '../types';
import { EX } from './exercises';
import { history, type Done } from './planner';

export const e1rm = (kg: number, reps: number) => (kg > 0 ? kg * (1 + reps / 30) : 0);
const best = (d: Done) => Math.max(...d.result.sets.map((s) => e1rm(s.kg, s.reps)));
const heaviest = (d: Done) => Math.max(...d.result.sets.map((s) => s.kg));
const mostReps = (d: Done) => Math.max(...d.result.sets.map((s) => s.reps));
const setsText = (d: Done) => {
  const kg = heaviest(d);
  const u = d.result.unit === 'sek' ? ' s' : '';
  return `${kg > 0 ? `${fmtNum(kg)} kg × ` : ''}${d.result.sets.map((s) => s.reps + u).join(', ')}`;
};

/** Records set by `log` compared with everything before it. First time doing an exercise is not a record. */
export function gymRecords(prev: SessionLog[], log: SessionLog): RecordItem[] {
  if (log.data?.kind !== 'strength') return [];
  const out: RecordItem[] = [];
  for (const r of log.data.exercises) {
    const before = history(prev, r.id);
    if (!before.length || !r.sets.length) continue;
    const now: Done = { date: log.startedAt, result: r };
    const name = EX[r.id]?.name ?? r.name;
    if (heaviest(now) > 0) {
      if (heaviest(now) > Math.max(...before.map(heaviest))) out.push({ module: 'gym', date: log.startedAt, title: name, detail: `Tyngsta vikten hittills: ${fmtNum(heaviest(now))} kg` });
      else if (best(now) > Math.max(...before.map(best)) + 0.01) {
        const top = r.sets.reduce((a, s) => (e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) ? s : a));
        out.push({ module: 'gym', date: log.startedAt, title: name, detail: `Nytt rekord: ${fmtNum(top.kg)} kg × ${top.reps}` });
      }
    } else if (mostReps(now) > Math.max(...before.map(mostReps))) {
      out.push({ module: 'gym', date: log.startedAt, title: name, detail: r.unit === 'sek' ? `Längsta tiden hittills: ${mostReps(now)} s` : `Flest reps hittills: ${mostReps(now)}` });
    }
  }
  return out;
}

/** Shown on an exercise's library page: last time, best set, estimated max and every session. */
export function ExerciseProgress({ id }: { id: string }) {
  const ctx = useCtx();
  if (!ctx) return null;
  const h = history(ctx.logs, id);
  if (!h.length) return <Section title="Dina framsteg"><Empty>Du har inte gjort den här än. När du har loggat ett pass syns vikter, reps och rekord här.</Empty></Section>;
  const last = h[0];
  const series = [...h].reverse().map(best).filter((v) => v > 0);
  const bestSet = h.reduce((a, d) => (best(d) > best(a) ? d : a));
  const bw = heaviest(last) === 0;
  const repsSeries = [...h].reverse().map(mostReps);

  return (
    <>
      <Section title="Dina framsteg">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-rule pt-4">
          <div>
            <div className="text-[13px] text-ink2">Senast · {fmtDate(last.date)}</div>
            <div className="num mt-1 text-[22px] font-semibold leading-tight">{setsText(last)}</div>
          </div>
          <div>
            <div className="text-[13px] text-ink2">{bw ? 'Flest reps' : 'Bästa set'}</div>
            <div className="num mt-1 text-[22px] font-semibold leading-tight">
              {bw ? `${Math.max(...h.map(mostReps))} reps` : (() => { const t = bestSet.result.sets.reduce((a, s) => (e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) ? s : a)); return `${fmtNum(t.kg)} kg × ${t.reps}`; })()}
            </div>
            <div className="text-[13px] text-ink2">{fmtDate(bw ? h.reduce((a, d) => (mostReps(d) > mostReps(a) ? d : a)).date : bestSet.date)}</div>
          </div>
        </div>
        {(bw ? repsSeries : series).length > 1 && (
          <div className="mt-6">
            <div className="text-[13px] text-ink2">{bw ? 'Reps per pass' : 'Beräknat max per pass'}</div>
            <div className="num text-[15px]" style={{ color: color('gym') }}>
              {bw ? `${repsSeries[0]} → ${repsSeries[repsSeries.length - 1]} reps` : `${fmtNum(Math.round(series[0]))} → ${fmtNum(Math.round(series[series.length - 1]))} kg`}
            </div>
            <div className="mt-2"><Line series={bw ? repsSeries : series} kind="gym" /></div>
          </div>
        )}
      </Section>
      <Section title={`Alla pass (${h.length})`}>
        <ul>
          {h.map((d, i) => (
            <li key={d.date + i}>
              <Link to={`/logg/${ctx.logs.find((l) => l.startedAt === d.date)?.id ?? ''}`} className="flex items-center justify-between gap-4 border-t border-rule py-3">
                <span className="text-[15px] text-ink2">{fmtDate(d.date)}</span>
                <span className="num text-[16px] font-medium">{setsText(d)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

/** Shown on Gym → Framsteg: every exercise you have done, newest first, with the trend since last time. */
export function GymExerciseList() {
  const ctx = useCtx();
  if (!ctx) return null;
  const ids = [...new Set(ctx.logs.flatMap((l) => (l.module === 'gym' && l.data?.kind === 'strength' ? l.data.exercises.filter((e) => e.sets.length).map((e) => e.id) : [])))].filter((id) => EX[id]);
  const recs = recentRecords(ctx.logs, 30);
  return (
    <>
      {recs.length > 0 && (
        <Section title="Rekord senaste 30 dagarna">
          {recs.slice(0, 5).map((r, i) => (
            <Row key={i} title={<span className="flex items-center gap-2"><Trophy size={16} style={{ color: color('gym') }} aria-hidden="true" />{r.title}</span>} sub={`${r.detail} · ${fmtDate(r.date)}`} />
          ))}
        </Section>
      )}
      <Section title="Dina övningar">
        {ids.length ? ids.map((id) => {
          const h = history(ctx.logs, id);
          const [a, b] = h;
          const score = (d: Done) => (heaviest(d) > 0 ? best(d) : mostReps(d));
          const trend = b ? Math.sign(Math.round((score(a) - score(b)) * 10)) : 0;
          const Icon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : ArrowRight;
          return (
            <Row key={id} to={`/gym/bibliotek/${id}`} title={EX[id].name} sub={`${fmtDate(a.date)} · ${h.length} pass`}
              right={<span className="flex items-center gap-1.5"><span className="num text-ink">{setsText(a)}</span>{b && <Icon size={16} style={{ color: trend > 0 ? color('gym') : undefined }} aria-label={trend > 0 ? 'Bättre än förra gången' : trend < 0 ? 'Sämre än förra gången' : 'Samma som förra gången'} />}</span>} />
          );
        }) : <Empty>Inga gympass loggade än.</Empty>}
      </Section>
    </>
  );
}

/** Records across all gym sessions within `days`, newest first. */
export function recentRecords(logs: SessionLog[], days: number): RecordItem[] {
  const chrono = logs.filter((l) => l.module === 'gym').sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const from = Date.now() - days * 864e5;
  const out: RecordItem[] = [];
  chrono.forEach((l, i) => { if (new Date(l.startedAt).getTime() >= from) out.push(...gymRecords(chrono.slice(0, i), l)); });
  return out.reverse();
}
