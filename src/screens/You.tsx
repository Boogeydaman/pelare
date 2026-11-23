import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCtx } from '../core/ctx';
import { fmtDate, isSameDay, weekNumber, weekStart } from '../core/format';
import type { LogModule } from '../core/types';
import { recentRecords } from '../core/records';
import { MODULE, MODULE_LIST } from '../modules/registry';
import { Empty, Row, Section } from '../shared/layout/page';
import { IconButton, MODULE_NAME, Pillars, color, type WeekProgress } from '../shared/ui/kit';

const LETTERS = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

export function You() {
  const ctx = useCtx();
  const nav = useNavigate();
  const [offset, setOffset] = useState(0); // months back
  const week = useMemo(() => ctx && (Object.fromEntries(MODULE_LIST.map((m) => [m.id, m.weekly(ctx)])) as WeekProgress), [ctx]);
  const recs = useMemo(() => (ctx ? recentRecords(ctx.logs, MODULE_LIST, 30, ctx.now) : []), [ctx]);
  if (!ctx || !week) return null;

  const month = new Date(ctx.now.getFullYear(), ctx.now.getMonth() - offset, 1);
  const first = weekStart(month);
  const days = Array.from({ length: 42 }, (_, i) => new Date(first.getTime() + i * 864e5));
  const lastRow = days.findIndex((d, i) => i % 7 === 0 && d.getMonth() !== month.getMonth() && d > month);
  const cells = lastRow > 0 ? days.slice(0, lastRow) : days;
  const kindsOn = (d: Date) => [...new Set(ctx.logs.filter((l) => isSameDay(l.startedAt, d)).map((l) => l.module))] as LogModule[];
  const monthCount = ctx.logs.filter((l) => { const t = new Date(l.startedAt); return t.getMonth() === month.getMonth() && t.getFullYear() === month.getFullYear(); }).length;

  return (
    <div className="pb-6">
      <header className="flex items-start justify-between pt-2">
        <div>
          <div className="num text-[15px] text-ink2">Vecka {weekNumber(ctx.now)}</div>
          <h1 className="mt-1 font-serif text-display">Du</h1>
        </div>
        <IconButton ariaLabel="Inställningar" onClick={() => nav('/installningar')}><Settings2 size={22} strokeWidth={1.75} /></IconButton>
      </header>

      <section className="mt-8"><Pillars week={week} size="lg" /></section>

      <Section title="Kalender">
        <div className="border-t border-rule pt-3">
          <div className="mb-3 flex items-center justify-between">
            <IconButton ariaLabel="Föregående månad" onClick={() => setOffset(offset + 1)}><ChevronLeft size={20} /></IconButton>
            <div className="text-center">
              <div className="text-[17px] font-medium">{month.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}</div>
              <div className="num text-[13px] text-ink2">{monthCount} pass</div>
            </div>
            <IconButton ariaLabel="Nästa månad" onClick={() => setOffset(Math.max(0, offset - 1))} className={offset === 0 ? 'invisible' : ''}><ChevronRight size={20} /></IconButton>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {LETTERS.map((l, i) => <div key={i} className="pb-1 text-[12px] text-ink2">{l}</div>)}
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === month.getMonth();
              const kinds = inMonth ? kindsOn(d) : [];
              const today = isSameDay(d, ctx.now);
              return (
                <div key={i} className="flex flex-col items-center gap-1 py-1" aria-label={`${fmtDate(d)}${kinds.length ? ': ' + kinds.map((k) => MODULE_NAME[k]).join(', ') : ''}`}>
                  <span className={`num flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${!inMonth ? 'text-ink2/30' : today ? 'bg-ink text-paper' : ''}`}>{d.getDate()}</span>
                  <span className="flex h-1.5 gap-0.5">{kinds.map((k) => <span key={k} className="h-1.5 w-1.5 rounded-full" style={{ background: color(k) }} />)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section title="Mål">
        {MODULE_LIST.map((m) => {
          const metric = m.metrics(ctx)[0];
          return <Row key={m.id} kind={m.id} title={m.name} sub={metric.label} right={<span className="num text-ink">{metric.value}{metric.value !== '–' && metric.unit ? ` ${metric.unit}` : ''}</span>} to={`/${m.slug}/framsteg`} />;
        })}
      </Section>

      <Section title="Rekord senaste 30 dagarna">
        {recs.length ? recs.slice(0, 6).map((r, i) => (
          <Row key={i} kind={r.module} title={r.title} sub={`${r.detail} · ${fmtDate(r.date)}`} to={r.module === 'gym' ? '/gym/framsteg' : `/${MODULE[r.module].slug}/framsteg`} />
        )) : <Empty>Inga nya rekord än. De dyker upp här när du slår ditt bästa.</Empty>}
      </Section>

      <Section title="Veckan i siffror">
        <Row title="Din vecka i siffror" sub="Pass, set, km och rekord – som en kort berättelse" to="/veckan" />
      </Section>

      <Section title="Kunskap">
        <Row title="Så tänker vi" sub="Filosofin bakom träningen, med källor" to="/las" />
      </Section>

      <Section title="Senaste passen" to="/historik">
        {ctx.logs.length ? ctx.logs.slice(0, 5).map((l) => (
          <Row key={l.id} kind={l.module} title={l.title} sub={`${fmtDate(l.startedAt)} · ${MODULE_NAME[l.module]}`} right={<span className="num">{l.minutes} min</span>} to={`/logg/${l.id}`} />
        )) : <Empty>Inga pass än.</Empty>}
      </Section>
    </div>
  );
}
