// Rehab mode – I dag: you are in rehab mode, today's plan, the morning check, the criteria for the next
// phase, walking and gait aids – or, before the operation, the prehab plan and checklist.
import { BookOpen, Check, ChevronRight, ClipboardCheck, Footprints, Gauge, HeartPulse, LogOut, Play, Plus, Spline } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCtx } from '../core/ctx';
import { saveCheckin, saveSession, uid, useActive } from '../core/db';
import { fmtDayLong, isSameDay } from '../core/format';
import { useStart } from '../core/start';
import type { PlannedSession, Profile, SessionLog, TestResult } from '../core/types';
import { REHAB_PHASES, phaseOf, rehabPhase, timePhase, waitingFor, weeksFromSurgery } from '../modules/common';
import { HipRehabCard } from '../modules/gym/HipRehab';
import { isHipSession } from '../modules/gym/hip';
import { MODULE } from '../modules/registry';
import { InstallCard } from '../shared/ui/InstallCard';
import { Primary, Sheet } from '../shared/ui/kit';
import { CHAPTERS, PHASE_INFO, REHAB, chaptersFor, rehabTint } from './content';
import { AIDS, CRITERIA, PREP, criterionByTest, latestTests, nextAid, testDue } from './criteria';
import { confirmPhase, migrateRehab, setAid, togglePrep } from './state';

const DAY = 864e5;

/** Walking target for today by phase (report: phase 2 = 3–6 walks of 5–15 min, phase 3 = 20–40 min a day). */
export function walkTarget(ph: number): { count?: number; minutes?: number; text: string } {
  if (ph === 1) return { count: 3, text: 'Korta promenader med hjälpmedel – öka efter förmåga' };
  if (ph === 2) return { count: 3, text: '3–6 promenader på 5–15 minuter' };
  if (ph === 3) return { minutes: 20, text: '20–40 minuter promenad, tempo och backar' };
  return { text: '' };
}

export function RehabHome() {
  const ctx = useCtx();
  const start = useStart();
  const active = useActive();
  const nav = useNavigate();
  const [leave, setLeave] = useState(false);
  useEffect(() => { if (ctx?.profile.rehab && !ctx.profile.rehab.passed) migrateRehab(ctx.profile, ctx.now); }, [ctx?.profile, ctx?.now]);
  const plan = useMemo(() => {
    if (!ctx) return null;
    const gym = MODULE.gym.nextSession(ctx);
    const walk = MODULE.run.nextSession(ctx);
    const stretch = MODULE.mobility.quickStarts(ctx).find((q) => q.id === 'micro')?.session;
    return { gym, walk, stretch };
  }, [ctx]);
  if (!ctx || !plan) return null;
  const p = ctx.profile;
  const ph = rehabPhase(p, ctx.now) ?? 5;
  const today = ctx.logs.filter((l) => isSameDay(l.startedAt, ctx.now));
  const walksToday = today.filter((l) => l.type === 'walk');
  const walkMin = walksToday.reduce((a, l) => a + l.minutes, 0);
  const read = p.rehab?.read ?? [];
  const chapter = chaptersFor(ph).find((c) => !read.includes(c.id));
  const c = ctx.checkin;
  const daily = ph >= 1 && ph <= 3;
  const wt = walkTarget(ph);
  const walkDone = wt.count ? walksToday.length >= wt.count : wt.minutes ? walkMin >= wt.minutes : today.some((l) => l.type === 'walk');
  const due = testDue(ph, ctx.tests, ctx.now);

  const items: { key: string; icon: typeof Play; title: string; sub: string; done: boolean; session?: PlannedSession; to?: string; optional?: boolean }[] = [
    { key: 'gym', icon: HeartPulse, title: plan.gym.title, sub: `${plan.gym.minutes} min · ${ph === 1 ? '2–3 gånger om dagen' : ph === 2 ? '1–2 gånger om dagen' : ph === 0 ? '2–3 gånger i veckan' : 'dagens styrkepass'}`, done: today.some(isHipSession), session: plan.gym },
    ...(!daily ? [{ key: 'walk', icon: Footprints, title: plan.walk.title, sub: `${plan.walk.minutes} min · ${ph === 0 ? 'cykel eller promenad' : ph === 4 ? 'cykel, crosstrainer, bassäng eller stavgång' : 'kondition'}`, done: walkDone, session: plan.walk }] : []),
    ...(due ? [{ key: 'test', icon: Gauge, title: 'Testa dig', sub: 'Uppresning 30 s och enbensstående – 3 minuter', done: false, to: '/rehab/tester' }] : []),
    ...(plan.stretch && ph >= 2 ? [{ key: 'stretch', icon: Spline, title: 'Lugn stretch', sub: `${plan.stretch.minutes} min · stretchar som passar din fas`, done: today.some((l) => l.module === 'mobility'), session: plan.stretch, optional: true }] : []),
    chapter
      ? { key: 'lesson', icon: BookOpen, title: `Läs: ${chapter.title}`, sub: `${chapter.minutes} min · läroboken`, done: false, to: `/rehab/las/${chapter.id}` }
      : { key: 'lesson', icon: BookOpen, title: 'Allt för din fas är läst', sub: 'Läroboken finns kvar under Lär dig', done: true, to: '/rehab/las' },
  ];

  return (
    <div className="pb-6">
      <header className="flex items-center justify-between gap-3 pt-2">
        <span className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: rehabTint(0.14), color: REHAB }}>
          <HeartPulse size={15} aria-hidden="true" /> Du är i rehabläge
        </span>
        <button onClick={() => setLeave(true)} className="flex min-h-[40px] items-center gap-1.5 text-[14px] text-ink2 underline underline-offset-4">
          <LogOut size={15} aria-hidden="true" /> Lämna
        </button>
      </header>
      <div className="mt-4 text-[15px] text-ink2">{fmtDayLong(ctx.now)}</div>
      <h1 className="mt-1 font-serif text-display">{ph === 0 ? 'Inför operationen' : 'Din dag'}</h1>

      <HipRehabCard />
      <div className="mt-4 empty:hidden"><InstallCard /></div>

      {ph === 0 && <PrepCard p={p} now={ctx.now} />}

      {ph >= 1 && <NextPhase p={p} ph={ph} now={ctx.now} tests={ctx.tests} />}

      {ph >= 1 && (
        <section className="mt-4 rounded-[22px] border border-rule px-5 py-4">
          <div className="text-[15px] font-semibold">Hur känns höften i dag?</div>
          <div className="mt-1 text-[13px] text-ink2">Jämfört med före gårdagens träning. Svaret styr hur tungt dagens pass blir.</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {([[0, 'Som vanligt'], [3, 'Lite ömmare'], [6, 'Klart ondare']] as const).map(([v, t]) => (
              <button key={v} onClick={() => saveCheckin({ ...c, hipPain: v })} aria-pressed={c.hipPain === v}
                className="h-12 rounded-xl text-[14px] font-semibold" style={c.hipPain === v ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { background: 'rgb(var(--ink) / 0.06)' }}>{t}</button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[14px]">Mer svullet än i går?</span>
            <span className="flex gap-2">
              {([[false, 'Nej'], [true, 'Ja']] as const).map(([v, t]) => (
                <button key={t} onClick={() => saveCheckin({ ...c, swelling: v })} aria-pressed={c.swelling === v}
                  className="h-10 min-w-[64px] rounded-xl px-3 text-[14px] font-semibold" style={c.swelling === v ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { background: 'rgb(var(--ink) / 0.06)' }}>{t}</button>
              ))}
            </span>
          </div>
          {(c.hipPain === 6 || c.swelling) && <p className="mt-2 text-[13px] leading-snug">Dagens pass blir lättare. Kyla 15–20 minuter och högläge hjälper. Är det fortfarande sämre om några dagar – kontakta din fysioterapeut.</p>}
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Dagens plan</h2>
          <span className="num text-[13px] text-ink2">{items.filter((x) => x.done && !x.optional).length + (daily && walkDone ? 1 : 0)} av {items.filter((x) => !x.optional).length + (daily ? 1 : 0)}</span>
        </div>
        <ol className="mt-2">
          {items.map((it) => {
            const Icon = it.icon;
            const go = () => (it.session ? (active ? nav('/pass') : start(it.session)) : it.to && nav(it.to));
            return (
              <li key={it.key}>
                <button onClick={go} className="flex min-h-[68px] w-full items-center gap-4 border-t border-rule py-3 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={it.done ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { background: rehabTint(0.12), color: REHAB }}>
                    {it.done ? <Check size={18} aria-label="Klart" /> : <Icon size={18} aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[16px] font-medium ${it.done ? 'text-ink2 line-through decoration-1' : ''}`}>{it.title}</span>
                    <span className="block text-[13px] text-ink2">{it.optional ? 'Valfritt · ' : ''}{it.sub}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-ink2" aria-hidden="true" />
                </button>
              </li>
            );
          })}
          {daily && <WalkRow p={p} done={walkDone} count={walksToday.length} minutes={walkMin} target={wt} now={ctx.now} />}
        </ol>
        {!today.some(isHipSession) && (
          <div className="mt-3"><Primary onClick={() => (active ? nav('/pass') : start(plan.gym))}><Play size={18} fill="currentColor" /> {active ? 'Fortsätt passet' : ph === 0 ? 'Starta dagens pass' : 'Starta rehabpasset'}</Primary></div>
        )}
      </section>

      {ph >= 1 && ph <= 4 && p.rehab?.aid !== 'ingen' && <AidCard p={p} />}

      <section className="mt-8 rounded-[22px] px-5 py-4" style={{ background: rehabTint(0.08) }}>
        <div className="text-[13px] font-medium" style={{ color: REHAB }}>Fokus just nu</div>
        <p className="mt-1 text-[15px] leading-snug">{PHASE_INFO[ph].focus}</p>
        <Link to="/rehab/plan" className="mt-3 flex min-h-[40px] items-center gap-1 text-[15px] font-medium" style={{ color: REHAB }}>Hela planen och tidslinjen <ChevronRight size={16} /></Link>
      </section>

      <Road p={p} ph={ph} now={ctx.now} />

      <Sheet open={leave} onClose={() => setLeave(false)} title="Lämna rehabläget?">
        <div className="flex flex-col gap-4 pb-4">
          <p className="text-[16px] leading-snug">Du går till den vanliga appen med gym, löpning och rörlighet. Först får du svara på samma frågor som alla får första gången, så att programmen passar dig. Ditt rehabprogram, dina tester och det du läst sparas.</p>
          {(ph < 5 || !p.rehab?.cleared) && (
            <p className="rounded-2xl px-4 py-3 text-[14px] leading-snug" style={{ background: rehabTint(0.12) }}>
              Du är i fas {ph}. Den vanliga appen anpassar inte övningarna efter din höft – lämna bara om din fysioterapeut eller kirurg säger att du kan träna fritt. Löpningen fortsätter som promenader tills du markerat klartecken.
            </p>
          )}
          <p className="text-[14px] text-ink2">Du kan gå tillbaka till rehabläget när du vill: Inställningar → Träning efter höftprotes → Gå tillbaka till rehabläget.</p>
          <Primary onClick={() => { setLeave(false); nav('/lamna-rehab'); }}>Fortsätt till frågorna</Primary>
          <button onClick={() => setLeave(false)} className="h-14 rounded-full border border-rule text-[17px] font-medium">Stanna kvar</button>
        </div>
      </Sheet>
    </div>
  );
}

/** Criteria for the next phase – prominent when the calendar says it is time, otherwise a quiet checklist. */
function NextPhase({ p, ph, now, tests }: { p: Profile; ph: number; now: Date; tests: TestResult[] }) {
  const crit = CRITERIA[ph];
  const latest = latestTests(tests);
  const [checked, setChecked] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { setChecked([]); setOpen(false); }, [ph]);
  if (!crit) return null;
  const waiting = waitingFor(p, now);
  if (waiting) {
    const at = new Date(new Date(`${p.rehab!.surgery}T12:00:00`).getTime() + waiting.week * 7 * DAY);
    return (
      <section className="mt-4 rounded-[22px] px-5 py-4" style={{ background: rehabTint(0.1) }}>
        <div className="text-[13px] font-medium" style={{ color: REHAB }}>Redo för fas {waiting.phase}</div>
        <p className="mt-1 text-[15px] leading-snug">Du klarar kriterierna. Fas {waiting.phase} börjar {at.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })} – vecka {waiting.week} är det tidigaste, för att vävnaderna ska hinna läka.</p>
      </section>
    );
  }
  const suggest = timePhase(weeksFromSurgery(p, now)) > ph;
  const isOn = (id: string) => checked.includes(id) || criterionByTest(crit.find((x) => x.id === id)!, latest) === true;
  const all = crit.every((x) => isOn(x.id));
  const next = phaseOf(ph + 1);
  if (!suggest && !open) {
    return (
      <section className="mt-4 rounded-[22px] border border-rule px-5 py-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-ink2"><ClipboardCheck size={15} aria-hidden="true" /> Gå vidare till fas {ph + 1} när du klarar</div>
        <ul className="mt-2 space-y-1">{crit.map((x) => <li key={x.id} className="flex gap-2 text-[14px] leading-snug"><span style={{ color: REHAB }}>•</span>{x.text}</li>)}</ul>
        <button onClick={() => setOpen(true)} className="mt-2 min-h-[40px] text-[14px] font-medium underline underline-offset-4">Jag tror att jag är redo – kolla</button>
      </section>
    );
  }
  return (
    <section className="mt-4 rounded-[22px] px-5 py-4" style={{ background: rehabTint(0.12) }}>
      <div className="text-[13px] font-semibold" style={{ color: REHAB }}>{suggest ? `Dags att se om du är redo för fas ${ph + 1}?` : `Redo för fas ${ph + 1}?`}</div>
      <div className="mt-1 text-[18px] font-semibold">{next.name}</div>
      <p className="mt-1 text-[13px] text-ink2">Kriterierna avgör, inte kalendern. Bocka i det du klarar.</p>
      <ul className="mt-3">
        {crit.map((x) => {
          const byTest = criterionByTest(x, latest);
          const t = x.test ? latest[x.test.id] : undefined;
          const on = isOn(x.id);
          return (
            <li key={x.id}>
              <button onClick={() => setChecked((cur) => (cur.includes(x.id) ? cur.filter((y) => y !== x.id) : [...cur, x.id]))} aria-pressed={on}
                className="flex min-h-[52px] w-full items-start gap-3 border-t border-rule py-2.5 text-left">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={on ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { border: `2px solid ${rehabTint(0.4)}` }}>{on && <Check size={15} aria-hidden="true" />}</span>
                <span className="text-[15px] leading-snug">{x.text}{t && <span className="block text-[12px] text-ink2">Senaste test: {String(t.value).replace('.', ',')} {t.unit}{byTest === false ? ' – inte riktigt än' : ''}</span>}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3"><Primary disabled={!all} onClick={() => confirmPhase(p, ph)}>{all ? `Gå vidare till fas ${ph + 1}` : 'Bocka i alla för att gå vidare'}</Primary></div>
      <div className="mt-2 flex gap-4 text-[14px]">
        <Link to="/rehab/tester" className="underline underline-offset-4">Gör testerna</Link>
        {!suggest && <button onClick={() => setOpen(false)} className="text-ink2 underline underline-offset-4">Inte än</button>}
      </div>
      {suggest && <p className="mt-2 text-[13px] text-ink2">Klarar du inte allt än är det helt normalt – stanna i fas {ph} så länge du behöver.</p>}
    </section>
  );
}

/** Walks spread over the day (phase 1–3): tap to log one. */
function WalkRow({ p, done, count, minutes, target, now }: { p: Profile; done: boolean; count: number; minutes: number; target: ReturnType<typeof walkTarget>; now: Date }) {
  const [pick, setPick] = useState(false);
  const log = (m: number) => {
    const l: SessionLog = { id: uid(), module: 'run', type: 'walk', title: 'Promenad', startedAt: new Date(now.getTime() - m * 60000).toISOString(), minutes: m, data: { kind: 'run' } };
    setPick(false);
    return saveSession(l);
  };
  void p;
  return (
    <li className="border-t border-rule py-3">
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={done ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { background: rehabTint(0.12), color: REHAB }}>
          {done ? <Check size={18} aria-label="Klart" /> : <Footprints size={18} aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-medium">Promenader under dagen</span>
          <span className="block text-[13px] text-ink2">{target.text} · i dag {count} st, {minutes} min</span>
        </span>
        <button onClick={() => setPick(!pick)} aria-expanded={pick} aria-label="Lägg till promenad" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: rehabTint(0.14), color: REHAB }}><Plus size={18} /></button>
      </div>
      {pick && (
        <div className="mt-3 flex flex-wrap gap-2 pl-14">
          {[5, 10, 15, 20, 30, 40].map((m) => (
            <button key={m} onClick={() => log(m)} className="h-10 rounded-full px-4 text-[14px] font-semibold" style={{ background: 'rgb(var(--ink) / 0.06)' }}>{m} min</button>
          ))}
        </div>
      )}
    </li>
  );
}

/** Step the gait aid down – by the criterion "no limp", not by the date. */
function AidCard({ p }: { p: Profile }) {
  const cur = AIDS.find((a) => a.id === (p.rehab?.aid ?? 'tva'))!;
  const nx = nextAid(cur.id);
  const nxt = AIDS.find((a) => a.id === nx);
  return (
    <section className="mt-8 rounded-[22px] border border-rule px-5 py-4">
      <div className="text-[13px] font-medium text-ink2">Gånghjälpmedel</div>
      <div className="mt-1 flex gap-1.5" aria-hidden="true">
        {AIDS.map((a) => <span key={a.id} className="h-1.5 flex-1 rounded-full" style={{ background: AIDS.indexOf(a) <= AIDS.indexOf(cur) ? REHAB : rehabTint(0.18) }} />)}
      </div>
      <div className="mt-2 text-[17px] font-semibold">{cur.name}</div>
      <p className="mt-1 text-[14px] leading-snug">{cur.tip}</p>
      {nxt && (
        <>
          <p className="mt-2 text-[13px] text-ink2">Trappa ner när du går utan att halta och utan mer smärta med det du har nu.</p>
          <button onClick={() => setAid(p, nxt.id)} className="mt-2 min-h-[44px] rounded-full px-4 text-[15px] font-semibold" style={{ background: rehabTint(0.14), color: REHAB }}>Nästa steg: {nxt.name.toLowerCase()}</button>
        </>
      )}
    </section>
  );
}

/** Before the operation: countdown and checklist (report part 2). */
function PrepCard({ p, now }: { p: Profile; now: Date }) {
  const days = Math.ceil(-weeksFromSurgery(p, now) * 7);
  const done = p.rehab?.prep ?? [];
  const groups = [...new Set(PREP.map((x) => x.group))];
  return (
    <section className="mt-4 rounded-[22px] px-5 py-4" style={{ background: rehabTint(0.08) }}>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium" style={{ color: REHAB }}>Förberedelser</span>
        <span className="num text-[13px] text-ink2">{done.filter((d) => PREP.some((x) => x.id === d)).length} av {PREP.length}</span>
      </div>
      <div className="mt-1 text-[22px] font-semibold">{days === 1 ? 'I morgon' : `${days} dagar kvar`}</div>
      <p className="mt-1 text-[14px] leading-snug">Bättre funktion före operationen ger snabbare återhämtning, och du lär dig övningarna innan du har ont.</p>
      {groups.map((g) => (
        <div key={g} className="mt-3">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-ink2">{g}</div>
          <ul>
            {PREP.filter((x) => x.group === g).map((x) => {
              const on = done.includes(x.id);
              return (
                <li key={x.id}>
                  <button onClick={() => togglePrep(p, x.id)} aria-pressed={on} className="flex min-h-[48px] w-full items-start gap-3 border-t border-rule py-2.5 text-left">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={on ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { border: `2px solid ${rehabTint(0.4)}` }}>{on && <Check size={15} aria-hidden="true" />}</span>
                    <span className={`text-[15px] leading-snug ${on ? 'text-ink2' : ''}`}>{x.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}

/** The road ahead: phases with the usual timing and where you are. */
function Road({ p, ph, now }: { p: Profile; ph: number; now: Date }) {
  const surgery = new Date(`${p.rehab!.surgery}T12:00:00`);
  const w = weeksFromSurgery(p, now);
  return (
    <section className="mt-8">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Vägen framåt</h2>
      <ol className="mt-3">
        {[...(ph === 0 ? [phaseOf(0)] : []), ...REHAB_PHASES].map((x) => {
          const isNow = x.n === ph, past = x.n < ph;
          const from = new Date(surgery.getTime() + Math.max(0, x.weeks[0]) * 7 * DAY);
          const when = x.n === 0 ? `Operationen ${surgery.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}`
            : x.n === 1 ? 'Dag 0–3' : x.weeks[1] === Infinity ? `Från cirka ${from.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })} (3 mån) och framåt` : `Vecka ${Math.round(x.weeks[0]) || 1}–${x.weeks[1]} · cirka ${from.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}`;
          return (
            <li key={x.n} className="relative flex gap-4 pb-4 last:pb-0">
              <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
                style={isNow ? { background: REHAB, color: 'rgb(var(--onpillar))' } : past ? { background: rehabTint(0.35), color: 'rgb(var(--onpillar))' } : { border: `2px solid ${rehabTint(0.35)}`, color: REHAB }}>{past ? '✓' : x.n}</span>
              <span>
                <span className={`block text-[15px] ${isNow ? 'font-semibold' : ''}`}>{x.name}</span>
                <span className="block text-[13px] text-ink2">{when}{isNow && x.n > 0 ? ` · du är i vecka ${Math.floor(w) + 1}` : ''}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[13px] text-ink2">Tiderna är ungefärliga. Du går vidare när du klarar kriterierna – räkna med att träningen behöver pågå minst ett år för att benen ska bli lika starka.</p>
    </section>
  );
}

export { CHAPTERS };
