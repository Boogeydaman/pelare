// Rehab mode – Lär dig: the textbook. Five parts, chapters with tables, key points and sources.
// Everything is open; the chapters for your phase are marked "Läs nu".
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCtx } from '../core/ctx';
import { SOURCE } from '../core/sources';
import { rehabPhase } from '../modules/common';
import { Empty, Page, Section as PageSection } from '../shared/layout/page';
import { Primary } from '../shared/ui/kit';
import { withRefs } from '../screens/Articles';
import { CHAPTERS, PARTS, REHAB, rehabTint, type Section } from './content';
import { markRead } from './state';

export function RehabCourse() {
  const ctx = useCtx();
  if (!ctx) return null;
  const ph = rehabPhase(ctx.profile, ctx.now) ?? 5;
  const read = ctx.profile.rehab?.read ?? [];
  const nRead = CHAPTERS.filter((c) => read.includes(c.id)).length;
  const minutes = CHAPTERS.reduce((a, c) => a + c.minutes, 0);
  const next = CHAPTERS.find((c) => c.phase <= ph && !read.includes(c.id));
  return (
    <div className="pb-6 pt-4">
      <div className="text-[13px] font-semibold" style={{ color: REHAB }}>Rehabläge</div>
      <h1 className="mt-1 font-serif text-display">Läroboken</h1>
      <p className="mt-2 text-[16px] leading-snug text-ink2">Rehabilitering efter total höftprotes – från förberedelserna till idrott och livet efteråt. {CHAPTERS.length} kapitel, cirka {Math.round(minutes / 5) * 5} minuters läsning.</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full" style={{ background: rehabTint(0.15) }} aria-label={`${nRead} av ${CHAPTERS.length} kapitel lästa`}>
        <div className="h-full rounded-full" style={{ width: `${(nRead / CHAPTERS.length) * 100}%`, background: REHAB }} />
      </div>
      <div className="mt-1 text-[13px] text-ink2">{nRead} av {CHAPTERS.length} lästa</div>

      {next && (
        <Link to={`/rehab/las/${next.id}`} className="mt-5 block rounded-[22px] px-5 py-4" style={{ background: rehabTint(0.1) }}>
          <div className="text-[13px] font-medium" style={{ color: REHAB }}>Fortsätt läsa</div>
          <div className="mt-1 text-[18px] font-semibold leading-snug">{next.title}</div>
          <div className="mt-1 text-[14px] text-ink2">{next.minutes} min · Del {next.part}: {PARTS[next.part - 1]}</div>
        </Link>
      )}

      {PARTS.map((name, i) => {
        const list = CHAPTERS.filter((c) => c.part === i + 1);
        return (
          <section key={name} className="mt-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Del {i + 1} · {name}</h2>
            <ul className="mt-2">
              {list.map((c) => {
                const done = read.includes(c.id);
                const now = !done && c.phase <= ph;
                return (
                  <li key={c.id}>
                    <Link to={`/rehab/las/${c.id}`} className="flex min-h-[64px] items-center gap-4 border-t border-rule py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={done ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { background: rehabTint(now ? 0.16 : 0.07), color: REHAB }}>
                        {done ? <Check size={16} aria-label="Läst" /> : <span className="num text-[13px] font-bold">{CHAPTERS.indexOf(c) + 1}</span>}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-medium leading-snug">{c.title}</span>
                        <span className="block text-[13px] text-ink2">{c.minutes} min{now ? ' · läs nu' : c.phase > ph ? ` · för fas ${c.phase}` : ''}</span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-ink2" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Block({ s }: { s: Section }) {
  return (
    <section className="mt-8">
      {s.h && <h2 className="mb-1 font-serif text-[24px] leading-tight">{s.h}</h2>}
      {s.p?.map((p, j) => <p key={j} className="mt-2 text-[17px] leading-relaxed">{withRefs(p)}</p>)}
      {s.list && (
        <ul className="mt-3 space-y-2">
          {s.list.map((x, j) => <li key={j} className="flex gap-3 text-[17px] leading-relaxed"><span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: REHAB }} /><span>{withRefs(x)}</span></li>)}
        </ul>
      )}
      {s.table && (
        <div className="-mx-6 mt-4 overflow-x-auto px-6">
          <table className="w-full min-w-[480px] border-collapse text-left text-[14px] leading-snug">
            <thead>
              <tr>{s.table.head.map((h) => <th key={h} className="border-b-2 py-2 pr-3 align-bottom font-semibold" style={{ borderColor: REHAB }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {s.table.rows.map((r, j) => (
                <tr key={j} className="border-b border-rule">
                  {r.map((c, k) => <td key={k} className={`py-2.5 pr-3 align-top ${k === 0 ? 'font-medium' : ''}`}>{withRefs(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {s.after?.map((p, j) => <p key={`a${j}`} className="mt-3 text-[17px] leading-relaxed">{withRefs(p)}</p>)}
      {s.box && (
        <aside className="mt-4 rounded-2xl px-5 py-4" style={{ background: rehabTint(0.1) }}>
          <div className="text-[14px] font-semibold" style={{ color: REHAB }}>{s.box.title}</div>
          <p className="mt-1 text-[16px] leading-snug">{withRefs(s.box.text)}</p>
        </aside>
      )}
    </section>
  );
}

export function RehabLesson() {
  const ctx = useCtx();
  const { id } = useParams();
  const nav = useNavigate();
  const i = CHAPTERS.findIndex((x) => x.id === id);
  const c = CHAPTERS[i];
  if (!ctx) return null;
  if (!c) return <Page title="Hittades inte" back="/rehab/las"><Empty>Kapitlet finns inte.</Empty></Page>;
  const read = ctx.profile.rehab?.read ?? [];
  const prev = CHAPTERS[i - 1], next = CHAPTERS[i + 1];
  return (
    <Page kicker={`Del ${c.part} · Kapitel ${i + 1} · ${c.minutes} min`} title={c.title} back="/rehab/las">
      <article className="max-w-[62ch]">
        <p className="text-[19px] leading-snug">{withRefs(c.lead)}</p>
        <aside className="mt-6 rounded-[22px] border-l-4 px-5 py-4" style={{ borderColor: REHAB, background: rehabTint(0.06) }}>
          <div className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: REHAB }}>Det viktigaste</div>
          <ul className="mt-2 space-y-1.5">{c.key.map((k) => <li key={k} className="flex gap-2 text-[16px] leading-snug"><span style={{ color: REHAB }}>•</span>{k}</li>)}</ul>
        </aside>
        {c.sections.map((s, j) => <Block key={j} s={s} />)}
      </article>
      <div className="mt-10">
        <Primary onClick={async () => { await markRead(ctx.profile, c.id); nav(next ? `/rehab/las/${next.id}` : '/rehab/las'); }}>
          {read.includes(c.id) ? (next ? 'Nästa kapitel' : 'Till innehållet') : next ? 'Läst – nästa kapitel' : 'Läst'}
        </Primary>
      </div>
      <nav className="mt-4 flex justify-between gap-4 text-[14px]" aria-label="Kapitel">
        {prev ? <Link to={`/rehab/las/${prev.id}`} className="flex min-h-[44px] items-center gap-1 text-ink2"><ChevronLeft size={16} aria-hidden="true" /> {prev.title}</Link> : <span />}
        <Link to="/rehab/las" className="flex min-h-[44px] items-center text-ink2 underline underline-offset-4">Innehåll</Link>
      </nav>
      <PageSection title="Källor">
        <ol>
          {c.sources.map((n) => {
            const s = SOURCE[n];
            return s ? (
              <li key={n} id={`kalla-${n}`} className="flex gap-3 border-t border-rule py-3 text-[14px]">
                <span className="num w-6 shrink-0 text-ink2">{n}</span>
                <span className="flex-1">{s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{s.cite}</a> : s.cite}</span>
                <span className="h-5 shrink-0 rounded border border-rule px-1.5 text-[11px] font-bold leading-[18px]" title="Evidensnivå">{s.level}</span>
              </li>
            ) : null;
          })}
        </ol>
      </PageSection>
    </Page>
  );
}
