import { Check, ChevronRight, Play, Plus, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coach, type TodayView } from '../core/coach';
import { planWeek, type WeekPlan } from '../core/week';
import { useCtx } from '../core/ctx';
import { removeSampleData, saveCheckin, saveSession, uid, useActive } from '../core/db';
import { fmtDayLong, isSameDay } from '../core/format';
import { useStart } from '../core/start';
import type { CheckIn, Feeling, ModuleId, PlannedSession, SessionLog } from '../core/types';
import { MODULE_LIST } from '../modules/registry';
import { RUN_ABOUT } from '../modules/run';
import { ARTICLE, PRINCIPLE, articleFor } from '../core/articles';
import { ContentList, Meta } from '../shared/layout/content';
import { InstallCard } from '../shared/ui/InstallCard';
import { WrappedCard } from './Wrapped';
import { Row } from '../shared/layout/page';
import { IconButton, Kicker, MODULE_NAME, Pillars, Primary, Segmented, Sheet, color, type WeekProgress } from '../shared/ui/kit';

const FEELING: Record<Feeling, string> = { pigg: 'Pigg', okej: 'Okej', trott: 'Trött', sjuk: 'Sjuk' };
const greeting = (d: Date) => { const h = d.getHours(); return h < 5 ? 'God natt.' : h < 10 ? 'God morgon.' : h < 17 ? 'Hej.' : 'God kväll.'; };

export function Today() {
  const ctx = useCtx();
  const start = useStart();
  const active = useActive();
  const nav = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [otherOpen, setOtherOpen] = useState(false);

  const view = useMemo(() => {
    if (!ctx) return null;
    const today = coach(ctx, MODULE_LIST);
    return { today, plan: planWeek(ctx, MODULE_LIST, today), week: Object.fromEntries(MODULE_LIST.map((m) => [m.id, m.weekly(ctx)])) as WeekProgress };
  }, [ctx]);
  if (!ctx || !view) return null;

  const all = [view.today.primary, ...view.today.alternatives];
  const main = all.find((s) => s.id === pick) ?? view.today.primary;
  const others = all.filter((s) => s.id !== main.id);
  const c = ctx.checkin;
  const setCheckin = (patch: Partial<CheckIn>) => { saveCheckin({ ...c, ...patch }); setPick(null); };

  return (
    <div>
      <header className="flex items-center justify-between pt-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink2">{fmtDayLong(ctx.now)}</span>
        <IconButton ariaLabel="Inställningar" onClick={() => nav('/installningar')}><Settings2 size={22} strokeWidth={1.75} /></IconButton>
      </header>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="font-serif text-[40px] leading-[1.02]">{greeting(ctx.now)}<br /><span className="text-ink2">Dag {((ctx.now.getDay() + 6) % 7) + 1} av 7.</span></h1>
        <Link to="/du" aria-label="Veckan" className="shrink-0"><Pillars week={view.week} /></Link>
      </div>

      <button onClick={() => setFormOpen(true)} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-ink/[0.05] px-4 py-2.5 text-left">
        <span>
          <span className="block text-[13px] text-ink2">Dagsform</span>
          <span className="block text-[17px] font-medium">{FEELING[c.feeling]} · {c.minutes} min · {c.place === 'gym' ? 'gym' : c.place === 'home' ? 'hemma' : 'på resa'}</span>
        </span>
        <span className="text-[15px] text-ink2">Ändra</span>
      </button>

      <WrappedCard />
      <SampleBanner />
      <div className="mt-4 empty:hidden"><InstallCard /></div>

      {view.today.doneToday.length > 0 ? (
        <DoneCard logs={view.today.doneToday} plan={view.plan} more={main.module !== 'rest' ? main : null} onMore={() => start(main)} />
      ) : main.module === 'rest' ? (
        <RestCard s={main} plan={view.plan} />
      ) : (
      <section key={main.id} className="hero rise mt-6 rounded-[28px] px-5 pb-5 pt-5">
        <Kicker kind={main.module}>{main.id === view.today.primary.id ? 'Dagens pass' : 'Ditt val'} · {MODULE_NAME[main.module]}</Kicker>
        <h2 className="mt-2 font-serif text-[38px] leading-[1.02]">{main.title}</h2>
        <Meta s={main} className="mt-2" />
        <ul className="mt-4">
          {main.reasons.slice(0, 3).map((r, i) => <li key={i} className="border-t border-rule py-2 text-[15px] leading-snug">{r.text}</li>)}
        </ul>
        <button onClick={() => setPeek(true)} className="flex min-h-[44px] w-full items-center gap-1 border-t border-rule text-[15px] font-medium">
          Visa hela passet <ChevronRight size={18} strokeWidth={1.75} />
        </button>
        <div className="mt-3">
          {active
            ? <Primary onClick={() => nav('/pass')}><Play size={18} fill="currentColor" /> Fortsätt: {active.plan.title}</Primary>
            : <Primary onClick={() => start(main)}><Play size={18} fill="currentColor" /> Starta</Primary>}
        </div>
      </section>
      )}

      {(main.module === 'gym' || main.module === 'run') && view.today.addOns.length > 0 && (
        <section className="mt-3 rounded-2xl px-4 py-3" style={{ background: color('mobility', 0.1) }}>
          <div className="text-[13px] font-medium" style={{ color: color('mobility') }}>Gör det till en vana: före och efter</div>
          <ul className="mt-1">
            {view.today.addOns.map((a) => (
              <li key={a.label}>
                <button onClick={() => start(a.session)} className="flex min-h-[48px] w-full items-center justify-between gap-3 text-left">
                  <span className="min-w-0">
                    <span className="block text-[16px] font-medium">{a.when === 'före' ? 'Före' : 'Efter'}: {a.label}</span>
                    <span className="block text-[13px] text-ink2">{a.fits ? '' : '+'}{a.hint}</span>
                  </span>
                  <Play size={16} className="shrink-0" style={{ color: color('mobility') }} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {main.module !== 'rest' && view.today.doneToday.length === 0 && !ctx.logs.some((l) => isSameDay(l.startedAt, ctx.now) && (l.module === main.module || l.replaces)) && (
        <button onClick={() => setOtherOpen(true)} className="mt-3 flex min-h-[44px] w-full items-center justify-between rounded-2xl border border-rule px-4 text-left text-[15px]">
          <span>Jag tränade något annat i dag</span><ChevronRight size={18} strokeWidth={1.5} className="text-ink2" aria-hidden="true" />
        </button>
      )}

      <OtherSheet open={otherOpen} onClose={() => setOtherOpen(false)} replaces={main.module === 'rest' ? undefined : main.module} title={main.title} />

      <YourWeek plan={view.plan} />

      {view.today.notes.length > 0 && (
        <section className="mt-6 rounded-2xl bg-ink/[0.05] px-4 py-3">
          <div className="text-[13px] font-medium text-ink2">Hänsyn i dag</div>
          <ul className="mt-1">
            {view.today.notes.map((n, i) => <li key={i} className="py-1.5 text-[15px] leading-snug">{n.text}</li>)}
          </ul>
        </section>
      )}

      {view.today.doneToday.length === 0 && <WhyToday kind={main.module} walk={main.type === 'walk'} />}

      <WeekLeft view={view.today} />


      <section className="mt-8">
        <Kicker>Eller</Kicker>
        <div className="mt-2">
          {others.map((s: PlannedSession) => (
            <Row key={s.id} kind={s.module} serif title={s.title} sub={`${MODULE_NAME[s.module]} · ${s.minutes} min`}
              onClick={() => { setPick(s.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          ))}
          <Row title={<span className="flex items-center gap-2"><Plus size={18} strokeWidth={1.75} /> Logga något annat</span>} sub="Cykel, fotboll, promenad …" to="/logga" />
        </div>
      </section>

      <div className="h-8" />

      <Sheet open={peek} onClose={() => setPeek(false)} title={main.title}>
        <div className="max-h-[60vh] overflow-y-auto pb-4">
          <Meta s={main} className="mb-4" />
          {main.module === 'run' && RUN_ABOUT[main.type] && <p className="mb-4 rounded-2xl bg-ink/[0.05] px-4 py-3 text-[15px] leading-snug">{RUN_ABOUT[main.type]}</p>}
          <ContentList content={main.content} />
        </div>
      </Sheet>

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Dagsform">
        <div className="flex flex-col gap-6 pb-4">
          <div>
            <div className="mb-2 text-[14px] text-ink2">Hur känns kroppen?</div>
            <Segmented label="Känsla" value={c.feeling} onChange={(v) => setCheckin({ feeling: v })}
              options={[{ value: 'pigg', label: 'Pigg' }, { value: 'okej', label: 'Okej' }, { value: 'trott', label: 'Trött' }, { value: 'sjuk', label: 'Sjuk' }]} />
          </div>
          <div>
            <div className="mb-2 text-[14px] text-ink2">Hur mycket tid har du?</div>
            <Segmented label="Tid" value={c.minutes} onChange={(v) => setCheckin({ minutes: v })}
              options={[20, 30, 45, 60, 90].map((n) => ({ value: n, label: String(n) }))} />
          </div>
          <div>
            <div className="mb-2 text-[14px] text-ink2">Var tränar du i dag?</div>
            <Segmented label="Plats" value={c.place} onChange={(v) => setCheckin({ place: v })}
              options={[{ value: 'gym', label: 'Gym' }, { value: 'home', label: 'Hemma' }, { value: 'travel', label: 'På resa' }]} />
            <p className="mt-2 text-[13px] text-ink2">{c.place === 'travel' ? 'Inga redskap: dagens pass görs i kroppsvikt och räknas i programmet som vanligt.' : c.place === 'home' ? 'Passet anpassas efter utrustningen du har hemma.' : 'Hela gymmet.'}</p>
          </div>
          <Primary onClick={() => setFormOpen(false)}>Klar</Primary>
        </div>
      </Sheet>
    </div>
  );
}

/** Front-page section: the thinking behind today's session, with a way into the articles. */
function WhyToday({ kind, walk }: { kind: PlannedSession['module']; walk?: boolean }) {
  // A walk (after a hip replacement) is not a run: explain walking instead.
  const p = walk ? { title: 'Varför promenad i dag?', text: 'Promenader och cykel bygger kondition utan att belasta den nya höften med stötar. Längden ökar vecka för vecka – löpning väntar tills din kirurg har gett klartecken.' } : PRINCIPLE[kind];
  const a = walk ? ARTICLE.hoftprotes : articleFor(kind);
  return (
    <section className="mt-8 rounded-[24px] border border-rule px-5 py-5">
      <Kicker kind={kind}>Därför i dag</Kicker>
      <h2 className="mt-1 font-serif text-[26px] leading-[1.05]">{p.title}</h2>
      <p className="mt-2 text-[15px] leading-snug">{p.text}</p>
      <div className="mt-3 flex flex-col">
        <Link to={`/las/${a.id}`} className="flex min-h-[44px] items-center justify-between border-t border-rule text-[15px] font-medium">
          <span>Läs: {a.title}</span><ChevronRight size={18} strokeWidth={1.75} />
        </Link>
        <Link to={`/las/${ARTICLE['dagens-pass'].id}`} className="flex min-h-[44px] items-center justify-between border-t border-rule text-[14px] text-ink2">
          <span>Så väljs ditt pass</span><ChevronRight size={18} strokeWidth={1.5} />
        </Link>
        <Link to="/las" className="flex min-h-[44px] items-center justify-between border-t border-rule text-[14px] text-ink2">
          <span>Alla artiklar</span><ChevronRight size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}

const SHORT: Record<string, string> = { gym: 'Gym', run: 'Löp', other: 'Annat' };

/** Din vecka: done and planned sessions day by day, and why today matters. */
function YourWeek({ plan }: { plan: WeekPlan }) {
  return (
    <section className="mt-7">
      <div className="flex items-baseline justify-between">
        <Kicker>Din vecka</Kicker>
        <Link to="/installningar#dagar" className="text-[13px] text-ink2 underline underline-offset-4">Träningsdagar</Link>
      </div>
      <p className={`mt-2 text-[15px] leading-snug ${plan.tone === 'tight' || plan.tone === 'over' ? 'font-medium' : ''}`}>{plan.message}</p>
      <ol className="mt-3 grid grid-cols-7 gap-1" aria-label="Veckans plan">
        {plan.days.map((d) => {
          const main = [...d.done.filter((m) => m !== 'mobility').map((m) => ({ m, done: true })), ...d.planned.map((m) => ({ m, done: false }))];
          const words = [...main.map((x) => `${x.done ? 'gjort' : 'planerat'}: ${MODULE_NAME[x.m]}`), d.mobility ? `stretch ${d.mobility === 'done' ? 'gjord' : 'planerad'}` : ''].filter(Boolean).join(', ');
          return (
            <li key={d.index} aria-label={`${d.label}${d.today ? ' (i dag)' : ''}: ${words || (d.past ? 'inget' : 'vila')}`}
              className={`flex min-h-[78px] flex-col items-center gap-1.5 rounded-2xl px-0.5 py-2 ${d.today ? 'bg-ink/[0.07]' : ''}`}>
              <span className={`text-[12px] ${d.today ? 'font-semibold text-ink' : 'text-ink2'}`}>{d.today ? 'I dag' : d.label}</span>
              {main.map((x, i) => {
                const c = x.m === 'other' ? 'rgb(var(--ink2))' : color(x.m);
                return (
                  <span key={i} className="flex h-6 w-full items-center justify-center rounded-full text-[11px] font-semibold"
                    style={x.done ? { background: c, color: 'rgb(var(--onpillar))' } : { border: `1.5px solid ${c}`, color: c }}>
                    {SHORT[x.m] ?? '·'}
                  </span>
                );
              })}
              {!main.length && <span className="flex h-6 items-center text-[11px] text-ink2">{d.past ? '–' : 'Vila'}</span>}
              {d.mobility && (
                <span className="mt-auto h-2 w-2 rounded-full" aria-hidden="true"
                  style={d.mobility === 'done' ? { background: color('mobility') } : { border: `1.5px solid ${color('mobility')}` }} />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[12px] text-ink2">Fylld = gjort · ram = planerat · prick = stretch. Planen räknas om varje dag – missar du ett pass flyttas det.</p>
    </section>
  );
}

/** What is left of the week, per pillar, plus the WHO health floor for aerobic minutes. */
function WeekLeft({ view }: { view: TodayView }) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <Kicker>Kvar av veckan</Kicker>
        <span className="num text-[13px] text-ink2">{view.daysLeft} {view.daysLeft === 1 ? 'dag' : 'dagar'} kvar</span>
      </div>
      <ul className="mt-2">
        {view.week.map((w) => (
          <li key={w.module} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 border-t border-rule py-2 text-[14px]">
            <span>{w.name}</span>
            <span className="flex gap-1" aria-hidden="true">
              {Array.from({ length: w.target }, (_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < w.done ? color(w.module) : color(w.module, 0.15) }} />
              ))}
            </span>
            <span className="num text-ink2">{w.done}/{w.target} {w.unit}</span>
          </li>
        ))}
        <li className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 border-t border-rule py-2 text-[14px]">
          <span>Kondition</span>
          <span className="relative h-1.5 rounded-full bg-ink/10" aria-hidden="true">
            <span className="absolute inset-y-0 left-0 rounded-full bg-ink/60" style={{ width: `${Math.min(100, (view.aerobicMin / 150) * 100)}%` }} />
          </span>
          <span className="num text-ink2">{view.aerobicMin}/150 min</span>
        </li>
      </ul>
      <p className="mt-2 text-[13px] text-ink2">150 minuter kondition och styrka två dagar i veckan är WHO:s rekommendation för vuxna.</p>
    </section>
  );
}

const OTHER_TYPES = [
  { value: 'cardio', label: 'Kondition', hint: 'Cykel, simning, crosstrainer' },
  { value: 'sport', label: 'Sport', hint: 'Fotboll, padel, klättring' },
  { value: 'walk', label: 'Promenad', hint: 'Lång promenad eller vandring' },
  { value: 'other', label: 'Annat', hint: 'Gruppass, yoga, annan styrka' },
];

/** "Jag tränade något annat i dag": logs it and lets it replace today's session, after a confirm. */
function OtherSheet({ open, onClose, replaces, title }: { open: boolean; onClose: () => void; replaces?: ModuleId; title: string }) {
  const [type, setType] = useState('cardio');
  const [minutes, setMinutes] = useState(45);
  const [what, setWhat] = useState('');
  const label = OTHER_TYPES.find((x) => x.value === type)!;
  return (
    <Sheet open={open} onClose={onClose} title="Tränat något annat?">
      <div className="flex flex-col gap-5 pb-4">
        <p className="text-[15px] leading-snug text-ink2">
          Det räknas som dagens pass{replaces ? ` (${title})` : ''}, så du behöver inte klämma in två pass i dag. Planen för resten av veckan räknas om.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {OTHER_TYPES.map((o) => (
            <button key={o.value} aria-pressed={type === o.value} onClick={() => setType(o.value)}
              className={`rounded-2xl px-3 py-2.5 text-left ${type === o.value ? 'bg-ink text-paper' : 'bg-ink/[0.06]'}`}>
              <span className="block text-[15px] font-medium">{o.label}</span>
              <span className={`block text-[12px] ${type === o.value ? 'text-paper/70' : 'text-ink2'}`}>{o.hint}</span>
            </button>
          ))}
        </div>
        <label className="flex h-12 items-center rounded-2xl bg-ink/[0.06] px-4">
          <input value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Vad gjorde du? (valfritt)" aria-label="Vad gjorde du"
            className="h-full flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink2" />
        </label>
        <div>
          <div className="mb-2 text-[14px] text-ink2">Hur länge?</div>
          <Segmented label="Minuter" value={minutes} onChange={setMinutes} options={[20, 30, 45, 60, 90].map((n) => ({ value: n, label: String(n) }))} />
        </div>
        <Primary onClick={async () => {
          const name = what.trim() || label.label;
          await saveSession({ id: uid(), module: 'other', type, title: name, minutes, feel: 2, replaces,
            startedAt: new Date(Date.now() - minutes * 60000).toISOString(), data: { kind: 'other', activity: name } });
          setWhat(''); onClose();
        }}>Bekräfta – jag har tränat</Primary>
      </div>
    </Sheet>
  );
}

/** Shown while the seeded example history is still in the app. */
function SampleBanner() {
  const ctx = useCtx();
  if (!ctx?.logs.some((l) => l.sample)) return null;
  return (
    <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-rule px-5 py-4">
      <p className="text-[15px] leading-snug">Du ser exempeldata så att skärmarna har något att visa. Ta bort den när du börjar träna på riktigt.</p>
      <button onClick={() => removeSampleData()} className="h-11 shrink-0 rounded-full bg-ink px-4 text-[14px] font-semibold text-paper">Ta bort</button>
    </section>
  );
}

const DAYNAME = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag'];

/** The next day in the week plan with a planned gym or running session. */
function nextPlanned(plan: WeekPlan): string | null {
  const d = plan.days.find((x) => !x.past && !x.today && x.planned.length > 0);
  if (!d) return null;
  const what = d.planned.map((m) => MODULE_NAME[m].toLowerCase()).join(' och ');
  const tomorrow = plan.days.find((x) => x.today)?.index;
  return `${tomorrow !== undefined && d.index === tomorrow + 1 ? 'I morgon' : DAYNAME[d.index][0].toUpperCase() + DAYNAME[d.index].slice(1)}: ${what}`;
}

/** The day is done: a calm "well done" instead of another session. */
function DoneCard({ logs, plan, more, onMore }: { logs: SessionLog[]; plan: WeekPlan; more: PlannedSession | null; onMore: () => void }) {
  const next = nextPlanned(plan);
  return (
    <section className="rise mt-6 rounded-[28px] border border-rule bg-raised px-5 pb-5 pt-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: color('mobility', 0.18), color: color('mobility') }}><Check size={20} aria-hidden="true" /></span>
        <Kicker>Klart för i dag</Kicker>
      </div>
      <h2 className="mt-3 font-serif text-[38px] leading-[1.02]">Bra jobbat.</h2>
      <ul className="mt-3">
        {logs.map((l) => (
          <li key={l.id}>
            <Link to={`/logg/${l.id}`} className="flex min-h-[44px] items-center justify-between gap-3 border-t border-rule text-[15px]">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: color(l.module) }} aria-hidden="true" />{l.title}</span>
              <span className="num text-ink2">{l.minutes} min</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[15px] leading-snug text-ink2">Vila resten av dagen – det är mellan passen kroppen blir starkare. En lugn promenad eller lite stretch går bra om du vill.</p>
      {next && <p className="mt-2 text-[15px] font-medium">{next}</p>}
      {more && (
        <button onClick={onMore} className="mt-4 flex min-h-[48px] w-full items-center justify-between gap-3 rounded-2xl border border-rule px-4 text-left text-[15px]">
          <span>Vill du göra mer? <span className="font-medium">{more.title}</span> · {more.minutes} min</span>
          <ChevronRight size={18} className="shrink-0 text-ink2" aria-hidden="true" />
        </button>
      )}
    </section>
  );
}

/** A rest day before anything is done: calm, without a session to start. */
function RestCard({ s, plan }: { s: PlannedSession; plan: WeekPlan }) {
  const next = nextPlanned(plan);
  return (
    <section className="rise mt-6 rounded-[28px] border border-rule bg-raised px-5 pb-5 pt-5">
      <Kicker>Vilodag</Kicker>
      <h2 className="mt-2 font-serif text-[38px] leading-[1.02]">Vila i dag.</h2>
      <ul className="mt-3">{s.reasons.slice(0, 2).map((r, i) => <li key={i} className="border-t border-rule py-2 text-[15px] leading-snug">{r.text}</li>)}</ul>
      <p className="mt-2 text-[15px] leading-snug text-ink2">{s.content.kind === 'rest' ? s.content.text : ''}</p>
      {next && <p className="mt-2 text-[15px] font-medium">{next}</p>}
      <Link to="/logga" className="mt-4 flex min-h-[48px] items-center justify-between rounded-2xl border border-rule px-4 text-[15px]">
        <span>Logga en promenad</span><ChevronRight size={18} className="text-ink2" aria-hidden="true" />
      </Link>
    </section>
  );
}
