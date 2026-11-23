import { Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { articleFor } from '../../core/articles';
import { useCtx } from '../../core/ctx';
import { fmtDate } from '../../core/format';
import { useStart } from '../../core/start';
import type { PlannedSession } from '../../core/types';
import type { TrainingModule } from '../../modules/types';
import { ContentList, Meta } from '../../shared/layout/content';
import { Empty, Row, Section, Stat } from '../../shared/layout/page';
import { Primary, Segmented, Sheet, color } from '../../shared/ui/kit';

export function ModuleHome({ m }: { m: TrainingModule }) {
  const ctx = useCtx();
  const start = useStart();
  const nav = useNavigate();
  const [peek, setPeek] = useState<PlannedSession | null>(null);
  const [params, setParams] = useSearchParams();
  const diary = !!m.Diary && params.get('vy') === 'dagbok';
  const data = useMemo(() => ctx && {
    next: m.nextSession(ctx), weekly: m.weekly(ctx), program: m.program(ctx), metrics: m.metrics(ctx),
    quick: m.quickStarts(ctx), history: ctx.logs.filter((l) => l.module === m.id).slice(0, 3),
  }, [ctx, m]);
  if (!data) return null;
  const { next, weekly, program, metrics, quick, history } = data;
  const Icon = m.icon;

  return (
    <div className="pb-6">
      {/* Header: identity and this week */}
      <header className="pt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: color(m.id), color: 'rgb(var(--onpillar))' }}>
            <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
          </span>
          <h1 className="font-serif text-display">{m.name}</h1>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" aria-hidden="true">
            {Array.from({ length: weekly.target }, (_, i) => (
              <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < weekly.done ? color(m.id) : color(m.id, 0.15) }} />
            ))}
          </div>
          <span className="num text-[14px] text-ink2">{weekly.done} av {weekly.target} {weekly.unit} i veckan</span>
        </div>
      </header>

      {m.Diary && (
        <div className="mt-6">
          <Segmented label="Vy" value={diary ? 'diary' : 'overview'} onChange={(v) => setParams(v === 'diary' ? { vy: 'dagbok' } : {}, { replace: true })}
            options={[{ value: 'overview', label: 'Översikt' }, { value: 'diary', label: m.Diary.label }]} />
        </div>
      )}
      {diary && m.Diary ? <m.Diary.Component /> : <>
      {/* Next session */}
      <section className="mt-8 rounded-[28px] p-6" style={{ background: color(m.id, 0.1) }}>
        <div className="text-[13px] font-medium" style={{ color: color(m.id) }}>Nästa pass</div>
        <h2 className="mt-2 font-serif text-[40px] leading-[0.95]">{next.title}</h2>
        <Meta s={next} className="mt-2" />
        <p className="mt-4 text-[15px] leading-snug">{next.reasons[0]?.text}</p>
        <div className="mt-5 flex items-center gap-4">
          <Primary kind={m.id} onClick={() => start(next)} className="flex-1"><Play size={18} fill="currentColor" /> Starta</Primary>
          <button onClick={() => setPeek(next)} className="min-h-[48px] px-2 text-[15px] font-medium">Visa passet</button>
        </div>
      </section>

      {/* Program */}
      <Section title="Program" to={`/${m.slug}/program`} linkLabel="Ändra">
        <Link to={`/${m.slug}/program`} className="block border-t border-rule py-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-serif text-[26px] leading-tight">{program.program.name}</span>
            <span className="num shrink-0 text-[14px] text-ink2">{program.label}</span>
          </div>
          <div className="mt-3 flex gap-2">
            {program.thisWeek.map((s, i) => (
              <div key={i} className="flex-1">
                <div className="h-1 rounded-full" style={{ background: s.done ? color(m.id) : 'rgb(var(--rule))' }} />
                <div className={`mt-1.5 truncate text-[12px] ${s.done ? 'text-ink' : 'text-ink2'}`}>{s.title}</div>
              </div>
            ))}
          </div>
        </Link>
      </Section>

      {/* Progress */}
      <Section title="Framsteg" to={`/${m.slug}/framsteg`}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-rule pt-4">
          {metrics.slice(0, 2).map((x) => <Stat key={x.id} m={x} kind={m.id} />)}
        </div>
      </Section>

      {/* Quick start */}
      <Section title="Snabbstart">
        {quick.map((q) => (
          <Row key={q.id} title={q.label} sub={q.hint} onClick={() => (q.session ? start(q.session) : q.to && nav(q.to))} />
        ))}
      </Section>

      {/* Thinking behind the module */}
      <Section title="Så tänker vi">
        <Row title={articleFor(m.id).title} sub={articleFor(m.id).lead} to={`/las/${articleFor(m.id).id}`} />
      </Section>

      {/* Library */}
      <Section title="Bibliotek">
        <Row title={m.library.title} sub={m.library.groups.slice(0, 4).join(' · ')} right={<span className="num">{m.library.items.length}</span>} to={`/${m.slug}/bibliotek`} />
      </Section>

      {/* History */}
      <Section title="Historik" to={`/${m.slug}/historik`}>
        {history.length ? history.map((l) => (
          <Row key={l.id} title={l.title} sub={`${fmtDate(l.startedAt)} · ${m.describe(l)}`} to={`/logg/${l.id}`} />
        )) : <Empty>Inga {m.noun} än.</Empty>}
      </Section>
      </>}

      <Sheet open={!!peek} onClose={() => setPeek(null)} title={peek?.title ?? ''}>
        {peek && (
          <div className="max-h-[60vh] overflow-y-auto pb-4">
            <Meta s={peek} className="mb-4" />
            <ContentList content={peek.content} />
            <div className="pt-5"><Primary kind={m.id} onClick={() => { setPeek(null); start(peek); }}>Starta</Primary></div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
