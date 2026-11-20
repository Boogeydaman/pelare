import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ARTICLE, ARTICLES, type Article } from '../core/articles';
import { SOURCE } from '../core/sources';
import { Empty, Page, Section } from '../shared/layout/page';
import { Kicker, type Kind } from '../shared/ui/kit';

const kindOf = (a: Article): Kind | undefined => (a.topic === 'all' ? undefined : a.topic);

export function ArticlesPage() {
  const groups = ['Grunden', 'Pelarna'] as const;
  return (
    <Page kicker="Kunskap" title="Så tänker vi" back="/du">
      <p className="text-[17px] leading-snug text-ink2">Varför passen ser ut som de gör, och hur du kan tänka kring träning och hälsa. Allt med källor.</p>
      {groups.map((g) => (
        <Section key={g} title={g}>
          {ARTICLES.filter((a) => a.group === g).map((a) => <ArticleRow key={a.id} a={a} />)}
        </Section>
      ))}
    </Page>
  );
}

export function ArticleRow({ a }: { a: Article }) {
  const k = kindOf(a);
  return (
    <Link to={`/las/${a.id}`} className="block border-t border-rule py-4">
      <Kicker kind={k}>{a.kicker} · {a.minutes} min</Kicker>
      <div className="mt-1 font-serif text-[26px] leading-tight">{a.title}</div>
      <p className="mt-1 line-clamp-2 text-[15px] text-ink2">{a.lead}</p>
    </Link>
  );
}

/** Renders "[12]" references as small superscript links to the source list. */
function withRefs(text: string) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((p, i) => {
    const m = p.match(/^\[(\d+)\]$/);
    if (!m) return <Fragment key={i}>{p}</Fragment>;
    // Consecutive refs ("[1][2]") are separated by an empty part – join them with a comma.
    const afterRef = i >= 2 && parts[i - 1] === '' && /^\[\d+\]$/.test(parts[i - 2]);
    return (
      <a key={i} href={`#kalla-${m[1]}`} className="num align-super text-[11px] font-semibold text-ink2 no-underline" aria-label={`Källa ${m[1]}`}>
        {afterRef ? ',' : ' '}{m[1]}
      </a>
    );
  });
}

export function ArticlePage() {
  const { id } = useParams();
  const a = id ? ARTICLE[id] : undefined;
  if (!a) return <Page title="Hittades inte" back="/las"><Empty>Artikeln finns inte.</Empty></Page>;
  const k = kindOf(a);
  const next = ARTICLES[(ARTICLES.indexOf(a) + 1) % ARTICLES.length];

  return (
    <Page kicker={`${a.kicker} · ${a.minutes} min läsning`} kind={k} title={a.title} back="/las">
      <article className="max-w-[60ch]">
        <p className="text-[20px] leading-snug">{a.lead}</p>
        {a.sections.map((s, i) => (
          <section key={i} className="mt-8">
            {s.h && <h2 className="mb-2 font-serif text-[26px] leading-tight">{s.h}</h2>}
            {s.p.map((p, j) => <p key={j} className="mt-3 text-[17px] leading-relaxed">{withRefs(p)}</p>)}
          </section>
        ))}
      </article>

      <Section title="Underlag">
        <ol>
          {a.sources.map((n) => {
            const s = SOURCE[n];
            if (!s) return null;
            return (
              <li key={n} id={`kalla-${n}`} className="flex gap-3 border-t border-rule py-3 text-[14px]">
                <span className="num w-6 shrink-0 text-ink2">{n}</span>
                <span className="flex-1">
                  {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{s.cite}</a> : s.cite}
                </span>
                <span title="Evidensnivå" className={`h-5 shrink-0 rounded border px-1.5 text-[11px] font-bold leading-[18px] ${s.level === 'H' ? 'border-dashed border-ink2 text-ink2' : 'border-rule'}`}>{s.level}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-[13px] text-ink2">A = sammanställning av många studier · B = kontrollerad studie · C = befolkningsstudie eller expertkonsensus · H = praxis.</p>
      </Section>

      <Section title="Läs vidare">
        <Link to={`/las/${next.id}`} replace className="block border-t border-rule py-4">
          <Kicker kind={kindOf(next)}>{next.kicker}</Kicker>
          <div className="mt-1 font-serif text-[24px] leading-tight">{next.title}</div>
        </Link>
      </Section>
    </Page>
  );
}
