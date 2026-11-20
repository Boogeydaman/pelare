import { ChevronRight, Play, Plus, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coach, type TodayView } from '../core/coach';
import { planWeek, type WeekPlan } from '../core/week';
import { useCtx } from '../core/ctx';
import { removeSampleData, saveCheckin, useActive } from '../core/db';
import { fmtDayLong } from '../core/format';
import { useStart } from '../core/start';
import type { CheckIn, Feeling, PlannedSession } from '../core/types';
import { MODULE_LIST } from '../modules/registry';
import { ARTICLE, PRINCIPLE, articleFor } from '../core/articles';
import { ContentList, Meta } from '../shared/layout/content';
import { InstallCard } from '../shared/ui/InstallCard';
import { Row } from '../shared/layout/page';
import { IconButton, Kicker, MODULE_NAME, Pillars, Primary, Segmented, Sheet, color, type WeekProgress } from '../shared/ui/kit';

const FEELING: Record<Feeling, string> = { pigg: 'Pigg', okej: 'Okej', trott: 'Trött', sjuk: 'Sjuk' };

export function Today() {
  const ctx = useCtx();
  const start = useStart();
  const active = useActive();
  const nav = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [pick, setPick] = useState<string | null>(null);

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
      <header className="flex items-start justify-between pt-2">
        <Link to="/du" className="flex items-end gap-4" aria-label="Veckan">
          <Pillars week={view.week} />
          <span className="pb-0.5 text-[15px] text-ink2">{fmtDayLong(ctx.now)}</span>
        </Link>
        <IconButton ariaLabel="Inställningar" onClick={() => nav('/installningar')}><Settings2 size={22} strokeWidth={1.75} /></IconButton>
      </header>

      <button onClick={() => setFormOpen(true)} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-ink/[0.05] px-4 py-2.5 text-left">
        <span>
          <span className="block text-[13px] text-ink2">Dagsform</span>
          <span className="block text-[17px] font-medium">{FEELING[c.feeling]} · {c.minutes} min · {c.place === 'gym' ? 'gym' : c.place === 'home' ? 'hemma' : 'på resa'}</span>
        </span>
        <span className="text-[15px] text-ink2">Ändra</span>
      </button>

      <SampleBanner />
      <div className="mt-4 empty:hidden"><InstallCard /></div>

      <section key={main.id} className="rise mt-7">
        <Kicker kind={main.module}>{main.id === view.today.primary.id ? 'Dagens pass' : 'Ditt val'} · {MODULE_NAME[main.module]}</Kicker>
        <h1 className="mt-2 font-serif text-[40px] leading-[1.02]">{main.title}</h1>
        <Meta s={main} className="mt-2" />
        <ul className="mt-4">
          {main.reasons.slice(0, 3).map((r, i) => <li key={i} className="border-t border-rule py-2 text-[15px] leading-snug">{r.text}</li>)}
        </ul>
        <button onClick={() => setPeek(true)} className="flex min-h-[44px] w-full items-center gap-1 border-t border-rule text-[15px] font-medium">
          Visa hela passet <ChevronRight size={18} strokeWidth={1.75} />
        </button>
      </section>

      {(main.module === 'gym' || main.module === 'run') && view.today.addOns.length > 0 && (
        <section className="mt-3 rounded-2xl px-4 py-3" style={{ background: color('mobility', 0.1) }}>
          <div className="text-[13px] font-medium" style={{ color: color('mobility') }}>Gör det till en vana: före och efter</div>
          <ul className="mt-1">
            {view.today.addOns.map((a) => (
              <li key={a.when}>
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

      <YourWeek plan={view.plan} />

      {view.today.notes.length > 0 && (
        <section className="mt-6 rounded-2xl bg-ink/[0.05] px-4 py-3">
          <div className="text-[13px] font-medium text-ink2">Hänsyn i dag</div>
          <ul className="mt-1">
            {view.today.notes.map((n, i) => <li key={i} className="py-1.5 text-[15px] leading-snug">{n.text}</li>)}
          </ul>
        </section>
      )}

      <WhyToday kind={main.module} />

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

      <div className="h-24" />
      <div className="safe-bottom fixed inset-x-0 bottom-[58px] z-20 mx-auto max-w-lg bg-gradient-to-t from-paper via-paper/95 to-transparent px-6 pb-3 pt-8">
        {active
          ? <Primary kind={active.plan.module === 'rest' ? 'rest' : active.plan.module} onClick={() => nav('/pass')}><Play size={18} fill="currentColor" /> Fortsätt: {active.plan.title}</Primary>
          : <Primary kind={main.module} onClick={() => start(main)}><Play size={18} fill="currentColor" /> Starta</Primary>}
      </div>

      <Sheet open={peek} onClose={() => setPeek(false)} title={main.title}>
        <div className="max-h-[60vh] overflow-y-auto pb-4">
          <Meta s={main} className="mb-4" />
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
function WhyToday({ kind }: { kind: PlannedSession['module'] }) {
  const p = PRINCIPLE[kind];
  const a = articleFor(kind);
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
