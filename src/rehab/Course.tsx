// Rehab mode – Lär dig: a short course, lessons unlocked phase by phase.
import { Check, Lock } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCtx } from '../core/ctx';
import { SOURCE } from '../core/sources';
import { REHAB_PHASES, rehabPhase } from '../modules/common';
import { Empty, Page, Section } from '../shared/layout/page';
import { Primary } from '../shared/ui/kit';
import { withRefs } from '../screens/Articles';
import { LESSONS, REHAB, rehabTint } from './content';
import { markRead } from './state';

export function RehabCourse() {
  const ctx = useCtx();
  if (!ctx) return null;
  const ph = rehabPhase(ctx.profile, ctx.now) ?? 5;
  const read = ctx.profile.rehab?.read ?? [];
  const open = LESSONS.filter((l) => l.phase <= ph);
  return (
    <div className="pb-6 pt-4">
      <div className="text-[13px] font-semibold" style={{ color: REHAB }}>Rehabläge</div>
      <h1 className="mt-1 font-serif text-display">Lär dig</h1>
      <p className="mt-2 text-[16px] leading-snug text-ink2">Korta lektioner om din nya höft – nya låses upp i takt med att du går vidare. {read.filter((id) => open.some((l) => l.id === id)).length} av {open.length} lästa.</p>
      {REHAB_PHASES.map((x) => {
        const list = LESSONS.filter((l) => l.phase === x.n);
        if (!list.length) return null;
        const locked = x.n > ph;
        return (
          <section key={x.n} className="mt-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Fas {x.n} · {x.name}</h2>
            <ul className="mt-2">
              {list.map((l) => {
                const done = read.includes(l.id);
                const inner = (
                  <span className="flex min-h-[64px] items-center gap-4 border-t border-rule py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={done ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { background: rehabTint(locked ? 0.06 : 0.12), color: REHAB }}>
                      {done ? <Check size={16} aria-label="Läst" /> : locked ? <Lock size={15} aria-label="Låst" /> : <span className="text-[13px] font-bold">{LESSONS.indexOf(l) + 1}</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[16px] font-medium ${locked ? 'text-ink2' : ''}`}>{l.title}</span>
                      <span className="block text-[13px] text-ink2">{locked ? `Låses upp i fas ${x.n}` : `${l.minutes} min`}</span>
                    </span>
                  </span>
                );
                return <li key={l.id}>{locked ? inner : <Link to={`/rehab/las/${l.id}`}>{inner}</Link>}</li>;
              })}
            </ul>
          </section>
        );
      })}
      <section className="mt-8 rounded-[22px] border border-rule px-5 py-4">
        <div className="text-[15px] font-semibold">Fördjupning</div>
        <Link to="/las/hoftprotes" className="mt-1 block text-[15px] underline underline-offset-4">Träning efter höftprotes – hela artikeln med källor</Link>
      </section>
    </div>
  );
}

export function RehabLesson() {
  const ctx = useCtx();
  const { id } = useParams();
  const nav = useNavigate();
  const l = LESSONS.find((x) => x.id === id);
  if (!ctx) return null;
  if (!l) return <Page title="Hittades inte" back="/rehab/las"><Empty>Lektionen finns inte.</Empty></Page>;
  const ph = rehabPhase(ctx.profile, ctx.now) ?? 5;
  const read = ctx.profile.rehab?.read ?? [];
  const next = LESSONS.find((x) => x.phase <= ph && !read.includes(x.id) && x.id !== l.id);
  return (
    <Page kicker={`Lektion ${LESSONS.indexOf(l) + 1} · ${l.minutes} min`} title={l.title} back="/rehab/las">
      <article className="max-w-[60ch]">
        <p className="text-[19px] leading-snug">{l.lead}</p>
        {l.sections.map((s, i) => (
          <section key={i} className="mt-7">
            {s.h && <h2 className="mb-1 font-serif text-[24px] leading-tight">{s.h}</h2>}
            {s.p.map((p, j) => <p key={j} className="mt-2 text-[17px] leading-relaxed">{withRefs(p)}</p>)}
          </section>
        ))}
      </article>
      <div className="mt-8">
        <Primary onClick={async () => { await markRead(ctx.profile, l.id); nav(next ? `/rehab/las/${next.id}` : '/idag', { replace: true }); }}>
          {read.includes(l.id) ? (next ? 'Nästa lektion' : 'Tillbaka till dagen') : next ? 'Klar – nästa lektion' : 'Klar'}
        </Primary>
      </div>
      <Section title="Underlag">
        <ol>
          {l.sources.map((n) => {
            const s = SOURCE[n];
            return s ? (
              <li key={n} id={`kalla-${n}`} className="flex gap-3 border-t border-rule py-3 text-[14px]">
                <span className="num w-6 shrink-0 text-ink2">{n}</span>
                <span className="flex-1">{s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{s.cite}</a> : s.cite}</span>
              </li>
            ) : null;
          })}
        </ol>
      </Section>
    </Page>
  );
}
