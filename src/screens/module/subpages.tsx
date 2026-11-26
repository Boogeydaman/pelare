import { Check, Search, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { saveProfile, saveSession, saveTest, uid } from '../../core/db';
import { useCtx } from '../../core/ctx';
import { fmtDate, fmtNum } from '../../core/format';
import type { SessionLog } from '../../core/types';
import type { TestDef, TrainingModule } from '../../modules/types';
import { Empty, Page, Row, Section, Stat } from '../../shared/layout/page';
import { Figure } from '../../shared/ui/Figure';
import { TechniqueVideos } from '../../shared/ui/TechniqueVideos';
import { Field, NumberInput, parseNum } from '../../shared/ui/fields';
import { Primary, Sheet, color } from '../../shared/ui/kit';
import { gymDaysOf, runsPerWeekOf } from '../../modules/common';

// ---------------------------------------------------------------- Program

export function ProgramPage({ m }: { m: TrainingModule }) {
  const ctx = useCtx();
  const [pending, setPending] = useState<string | null>(null);
  if (!ctx) return null;
  const view = m.program(ctx);
  const current = ctx.profile.enrollments[m.id]?.programId ?? m.programs[0].id;
  const choose = (programId: string) => {
    if (programId === current) return;
    setPending(programId);
  };
  const confirmSwitch = (programId: string) => {
    setPending(null);
    const goals = m.id === 'run' && ['start', '5k', '10k', '15k', '20k'].includes(programId) ? { ...ctx.profile.goals, run: programId as typeof ctx.profile.goals.run } : ctx.profile.goals;
    const next = { ...ctx.profile, goals, enrollments: { ...ctx.profile.enrollments, [m.id]: { programId, startedAt: new Date().toISOString() } } };
    // Picking a gym program also sets the number of gym sessions to what it is built for.
    const perWeek = m.programs.find((x) => x.id === programId)?.perWeek;
    if (m.id === 'gym' && perWeek && programId !== 'rolling') next.gymDays = perWeek;
    saveProfile({ ...next, daysPerWeek: gymDaysOf(next) + runsPerWeekOf(next) });
  };

  return (
    <Page kicker={m.name} kind={m.id} title={view.program.name} back={`/${m.slug}`}>
      <p className="text-[17px] leading-snug text-ink2">{view.program.description}</p>
      <div className="num mt-3 text-[15px]">{view.label} · {m.id === 'gym' ? gymDaysOf(ctx.profile) : view.program.perWeek} {m.id === 'mobility' ? 'dagar' : 'pass'} i veckan</div>
      {m.ProgramExtra && <m.ProgramExtra />}

      <Section title="Den här veckan">
        {view.thisWeek.map((s, i) => s.about ? (
          <details key={i} className="group border-t border-rule">
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 py-3">
              <span className="text-[17px]">{s.title}</span>
              <span className="flex items-center gap-2 text-[14px] text-ink2">{s.done ? <Check size={18} style={{ color: color(m.id) }} aria-label="Klart" /> : 'Kvar'}<ChevronDown size={16} className="transition group-open:rotate-180" aria-hidden="true" /></span>
            </summary>
            <p className="pb-4 text-[15px] leading-snug text-ink2">{s.about}</p>
          </details>
        ) : (
          <Row key={i} title={s.title} right={s.done ? <Check size={18} style={{ color: color(m.id) }} aria-label="Klart" /> : <span className="text-[14px]">Kvar</span>} />
        ))}
        {view.thisWeek.some((s) => s.about) && <p className="pt-2 text-[13px] text-ink2">Tryck på ett pass för att se vad det innebär.</p>}
      </Section>

      {view.why && (
        <Section title="Varför veckan ser ut så här">
          <p className="border-t border-rule pt-3 text-[16px] leading-snug">{view.why}</p>
        </Section>
      )}

      <Section title="Milstolpar">
        <ol className="flex items-start border-t border-rule pt-5" aria-label="Milstolpar">
          {view.milestones.map((ms, i) => (
            <li key={i} className="relative flex flex-1 flex-col items-center gap-2 text-center">
              {i > 0 && <span className="absolute right-1/2 top-2.5 h-[2px] w-full" style={{ background: ms.done ? color(m.id) : 'rgb(var(--rule))' }} aria-hidden="true" />}
              <span className="relative z-10 h-5 w-5 rounded-full" style={ms.done ? { background: color(m.id) } : { background: 'rgb(var(--paper))', border: '2px solid rgb(var(--rule))' }} />
              <span className={`text-[12px] ${ms.done ? 'text-ink' : 'text-ink2'}`}>{ms.label}</span>
            </li>
          ))}
        </ol>
      </Section>

      {m.programs.length > 1 && <Section title="Byt program">
        {m.programs.map((p) => (
          <button key={p.id} onClick={() => choose(p.id)} aria-pressed={p.id === current}
            className="flex w-full items-center justify-between gap-4 border-t border-rule py-4 text-left">
            <span>
              <span className="block text-[17px] font-medium">{p.name}</span>
              <span className="block text-[14px] text-ink2">{p.description}</span>
              <span className="num block text-[13px] text-ink2">{p.weeks} veckor{m.id === 'gym' ? '' : ` · ${p.perWeek} pass/vecka`}</span>
            </span>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2" style={p.id === current ? { background: color(m.id), borderColor: color(m.id) } : { borderColor: 'rgb(var(--rule))' }}>
              {p.id === current && <Check size={14} strokeWidth={3} color="rgb(var(--onpillar))" />}
            </span>
          </button>
        ))}
      </Section>}

      <Sheet open={pending !== null} onClose={() => setPending(null)} title="Byta program?">
        {pending && (
          <div className="flex flex-col gap-4 pb-4">
            <p className="text-[16px] leading-snug">
              Du är i {view.label.toLowerCase()} av <span className="font-medium">{view.program.name}</span>. Byter du till <span className="font-medium">{m.programs.find((p) => p.id === pending)?.name}</span> börjar det nya programmet från vecka 1, och det du har kvar i det nuvarande nollställs.
            </p>
            <p className="text-[14px] text-ink2">Dina loggade pass, vikter, rekord och tester ligger kvar – nya programmet fortsätter från dina vikter.</p>
            <Primary kind={m.id} onClick={() => confirmSwitch(pending)}>Byt program</Primary>
            <button onClick={() => setPending(null)} className="h-14 rounded-full border border-rule text-[17px] font-medium">Behåll {view.program.name}</button>
          </div>
        )}
      </Sheet>
    </Page>
  );
}

// ---------------------------------------------------------------- Progress

export function ProgressPage({ m }: { m: TrainingModule }) {
  const ctx = useCtx();
  const [params, setParams] = useSearchParams();
  const testOpen = params.get('test') === '1';
  if (!ctx) return null;
  const metrics = m.metrics(ctx);
  const tests = ctx.tests.filter((t) => t.module === m.id && !t.testId.startsWith('hip_'));

  return (
    <Page kicker={m.name} kind={m.id} title="Framsteg" back={`/${m.slug}`}>
      <div className="flex flex-col">
        {metrics.map((x) => (
          <div key={x.id} className="border-t border-rule py-6"><Stat m={x} kind={m.id} big /></div>
        ))}
      </div>

      {m.ProgressExtra && <m.ProgressExtra />}

      {m.tests && (
        <Section title="Tester">
          {tests.length ? [...tests].reverse().slice(0, 10).map((t) => (
            <Row key={t.id} title={m.tests!.find((d) => d.id === t.testId)?.label ?? t.testId} sub={fmtDate(t.date)} right={<span className="num text-ink">{fmtNum(t.value)} {t.unit}</span>} />
          )) : <Empty>Inga tester än.</Empty>}
          <div className="pt-4"><Primary kind={m.id} onClick={() => setParams({ test: '1' })}>Nytt test</Primary></div>
        </Section>
      )}

      {m.tests && <TestSheet open={testOpen} defs={m.tests} module={m} onClose={() => setParams({}, { replace: true })} />}
    </Page>
  );
}

function TestSheet({ open, onClose, defs, module: m }: { open: boolean; onClose: () => void; defs: TestDef[]; module: TrainingModule }) {
  const [id, setId] = useState(defs[0].id);
  const [value, setValue] = useState('');
  const def = defs.find((d) => d.id === id)!;
  const v = parseNum(value);
  return (
    <Sheet open={open} onClose={onClose} title="Nytt test">
      <div className="pb-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {defs.map((d) => (
            <button key={d.id} onClick={() => setId(d.id)} aria-pressed={id === d.id}
              className={`h-11 rounded-full px-4 text-[15px] font-medium ${id === d.id ? 'bg-ink text-paper' : 'bg-ink/[0.06]'}`}>{d.label}</button>
          ))}
        </div>
        <p className="mb-2 text-[15px] leading-snug text-ink2">{def.how}</p>
        <Field label="Resultat"><NumberInput value={value} onChange={setValue} unit={def.unit} decimal ariaLabel="Resultat" /></Field>
        <div className="pt-4">
          <Primary kind={m.id} disabled={v === undefined} onClick={async () => {
            await saveTest({ id: uid(), module: m.id, testId: id, value: v!, unit: def.unit, date: new Date().toISOString() });
            setValue(''); onClose();
          }}>Spara</Primary>
        </div>
      </div>
    </Sheet>
  );
}

// ---------------------------------------------------------------- Library

export function LibraryPage({ m }: { m: TrainingModule }) {
  useCtx(); // re-render when your own exercises change
  const [q, setQ] = useState('');
  const items = m.library.items.filter((i) => `${i.name} ${i.meta}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page kicker={m.name} kind={m.id} title={m.library.title} back={`/${m.slug}`}>
      <label className="flex h-12 items-center gap-3 rounded-full bg-ink/[0.06] px-4">
        <Search size={18} strokeWidth={1.75} className="text-ink2" aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök" aria-label={`Sök ${m.library.title.toLowerCase()}`}
          className="h-full flex-1 bg-transparent text-[17px] outline-none placeholder:text-ink2" />
      </label>
      {m.LibraryActions && <m.LibraryActions />}
      {m.library.groups.map((g) => {
        const list = items.filter((i) => i.group === g);
        if (!list.length) return null;
        return (
          <Section key={g} title={g}>
            {list.map((i) => <Row key={i.id} title={i.name} sub={i.meta} to={`/${m.slug}/bibliotek/${i.id}`} />)}
          </Section>
        );
      })}
      {!items.length && <Empty>Inga träffar.</Empty>}
    </Page>
  );
}

export function LibraryDetail({ m }: { m: TrainingModule }) {
  const ctx = useCtx(); // re-render when your own exercises change
  const { id } = useParams();
  const item = m.library.items.find((i) => i.id === id);
  if (!ctx) return null;
  if (!item) return <Page title="Hittades inte" back={`/${m.slug}/bibliotek`}><Empty>Den här finns inte längre.</Empty></Page>;
  return (
    <Page kicker={item.group} kind={m.id} title={item.name} back={`/${m.slug}/bibliotek`}>
      <Figure anim={item.anim} kind={m.id} label={item.name} />
      <p className="mt-4 text-[15px] text-ink2">{item.meta}</p>
      <Section title="Så gör du">
        <ol>
          {(item.how ?? item.tips).map((t, i) => (
            <li key={i} className="flex gap-4 border-t border-rule py-3 text-[17px] leading-snug"><span className="num w-4 shrink-0 text-ink2">{i + 1}</span><span>{t}</span></li>
          ))}
        </ol>
      </Section>
      {(m.id === 'gym' || m.id === 'mobility') && <TechniqueVideos exercise={item.id} name={item.name} />}
      {item.how && item.tips.length > 0 && (
        <Section title="Tänk på">
          <ul>
            {item.tips.map((t, i) => <li key={i} className="border-t border-rule py-2.5 text-[15px] text-ink2">{t}</li>)}
          </ul>
        </Section>
      )}
      {item.extra && (
        <dl className="mt-8">
          {item.extra.map((x) => (
            <div key={x.label} className="grid grid-cols-[6.5rem_1fr] gap-3 border-t border-rule py-3 text-[15px]">
              <dt className="text-ink2">{x.label}</dt>
              <dd>{x.to ? <Link to={`/${m.slug}/bibliotek/${x.to}`} replace className="font-medium underline underline-offset-4">{x.value}</Link> : x.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {m.LibraryExtra && <m.LibraryExtra id={item.id} />}
    </Page>
  );
}

// ---------------------------------------------------------------- History

export function HistoryPage({ m }: { m?: TrainingModule }) {
  const ctx = useCtx();
  const groups = useMemo(() => {
    const logs = (ctx?.logs ?? []).filter((l) => !m || l.module === m.id);
    const out = new Map<string, SessionLog[]>();
    for (const l of logs) {
      const d = new Date(l.startedAt);
      const key = d.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
      out.set(key, [...(out.get(key) ?? []), l]);
    }
    return [...out.entries()];
  }, [ctx, m]);
  if (!ctx) return null;
  return (
    <Page kicker={m?.name ?? 'Alla moduler'} kind={m?.id} title="Historik" back={m ? `/${m.slug}` : '/du'}>
      {groups.length ? groups.map(([month, logs]) => (
        <Section key={month} title={month.charAt(0).toUpperCase() + month.slice(1)} className="first:mt-0">
          {logs.map((l) => <Row key={l.id} kind={m ? undefined : l.module} title={l.title} sub={`${fmtDate(l.startedAt)} · ${l.minutes} min`} to={`/logg/${l.id}`} />)}
        </Section>
      )) : <Empty>Inga pass än.</Empty>}
    </Page>
  );
}

// ---------------------------------------------------------------- Log afterwards

export function LogPage({ m }: { m: TrainingModule }) {
  const nav = useNavigate();
  const Form = m.LogForm;
  return (
    <Page kicker={m.name} kind={m.id} title="Logga i efterhand" back={`/${m.slug}`}>
      <Form onSave={async (v) => {
        const startedAt = new Date(Date.now() - v.minutes * 60000).toISOString();
        await saveSession({ id: uid(), module: m.id, startedAt, ...v });
        nav(`/${m.slug}`, { replace: true });
      }} />
    </Page>
  );
}
