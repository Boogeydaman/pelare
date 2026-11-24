// Rehab mode – I dag: you are in rehab mode, today's plan, the morning check and the road ahead.
import { BookOpen, Check, ChevronRight, Footprints, HeartPulse, LogOut, Play, Spline } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCtx } from '../core/ctx';
import { saveCheckin, useActive } from '../core/db';
import { fmtDayLong, isSameDay } from '../core/format';
import { useStart } from '../core/start';
import type { PlannedSession } from '../core/types';
import { REHAB_PHASES, rehabPhase, weeksSinceSurgery } from '../modules/common';
import { HipRehabCard } from '../modules/gym/HipRehab';
import { isHipSession } from '../modules/gym/hip';
import { MODULE } from '../modules/registry';
import { InstallCard } from '../shared/ui/InstallCard';
import { Primary, Sheet } from '../shared/ui/kit';
import { LESSONS, PHASE_INFO, REHAB, lessonsFor, rehabTint } from './content';
import { leaveRehab } from './state';

export function RehabHome() {
  const ctx = useCtx();
  const start = useStart();
  const active = useActive();
  const nav = useNavigate();
  const [leave, setLeave] = useState(false);
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
  const read = p.rehab?.read ?? [];
  const lesson = lessonsFor(ph).find((l) => !read.includes(l.id));
  const c = ctx.checkin;
  const surgery = new Date(`${p.rehab!.surgery}T12:00:00`);
  const early = ph <= 2;

  const items: { key: string; icon: typeof Play; title: string; sub: string; done: boolean; session?: PlannedSession; to?: string; optional?: boolean }[] = [
    { key: 'gym', icon: HeartPulse, title: plan.gym.title, sub: `${plan.gym.minutes} min · ${early ? 'gärna 2–3 gånger om dagen' : 'dagens rehabpass'}`, done: today.some(isHipSession), session: plan.gym },
    { key: 'walk', icon: Footprints, title: early ? 'Promenader under dagen' : plan.walk.title, sub: early ? 'Flera korta, med kryckor eller rollator' : `${plan.walk.minutes} min i lugn takt`, done: today.some((l) => l.type === 'walk'), session: plan.walk },
    ...(plan.stretch ? [{ key: 'stretch', icon: Spline, title: 'Lugn stretch', sub: `${plan.stretch.minutes} min · stretchar som passar din fas`, done: today.some((l) => l.module === 'mobility'), session: plan.stretch, optional: true }] : []),
    lesson
      ? { key: 'lesson', icon: BookOpen, title: `Läs: ${lesson.title}`, sub: `${lesson.minutes} min · dagens lektion`, done: false, to: `/rehab/las/${lesson.id}` }
      : { key: 'lesson', icon: BookOpen, title: 'Alla lektioner för din fas är lästa', sub: 'Nya låses upp i nästa fas', done: true, to: '/rehab/las' },
  ];

  return (
    <div className="pb-6">
      {/* You are in rehab mode */}
      <header className="flex items-center justify-between gap-3 pt-2">
        <span className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: rehabTint(0.14), color: REHAB }}>
          <HeartPulse size={15} aria-hidden="true" /> Du är i rehabläge
        </span>
        <button onClick={() => setLeave(true)} className="flex min-h-[40px] items-center gap-1.5 text-[14px] text-ink2 underline underline-offset-4">
          <LogOut size={15} aria-hidden="true" /> Lämna
        </button>
      </header>
      <div className="mt-4 text-[15px] text-ink2">{fmtDayLong(ctx.now)}</div>
      <h1 className="mt-1 font-serif text-display">Din dag</h1>

      <HipRehabCard />
      <div className="mt-4 empty:hidden"><InstallCard /></div>

      {/* Morning check: pain monitoring – the next morning should not be worse */}
      <section className="mt-4 rounded-[22px] border border-rule px-5 py-4">
        <div className="text-[15px] font-semibold">Hur känns höften i dag?</div>
        <div className="mt-1 text-[13px] text-ink2">Jämfört med i går kväll. Svaret styr hur tungt dagens pass blir.</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {([[0, 'Som vanligt'], [3, 'Lite ömmare'], [6, 'Klart ondare']] as const).map(([v, t]) => (
            <button key={v} onClick={() => saveCheckin({ ...c, hipPain: v })} aria-pressed={c.hipPain === v}
              className="h-12 rounded-xl text-[14px] font-semibold" style={c.hipPain === v ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { background: 'rgb(var(--ink) / 0.06)' }}>{t}</button>
          ))}
        </div>
        {c.hipPain === 6 && <p className="mt-2 text-[13px] leading-snug">Dagens pass blir lättare. Är det fortfarande ondare om några dagar – kontakta din fysioterapeut.</p>}
      </section>

      {/* Today's plan */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Dagens plan</h2>
          <span className="num text-[13px] text-ink2">{items.filter((x) => x.done && !x.optional).length} av {items.filter((x) => !x.optional).length}</span>
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
        </ol>
        {!today.some(isHipSession) && (
          <div className="mt-3"><Primary onClick={() => (active ? nav('/pass') : start(plan.gym))}><Play size={18} fill="currentColor" /> {active ? 'Fortsätt passet' : 'Starta rehabpasset'}</Primary></div>
        )}
      </section>

      {/* This phase */}
      <section className="mt-8 rounded-[22px] px-5 py-4" style={{ background: rehabTint(0.08) }}>
        <div className="text-[13px] font-medium" style={{ color: REHAB }}>Fokus just nu</div>
        <p className="mt-1 text-[15px] leading-snug">{PHASE_INFO[ph].focus}</p>
        <div className="mt-3 text-[13px] font-medium text-ink2">Mål innan nästa fas</div>
        <ul className="mt-1 space-y-1">
          {PHASE_INFO[ph].goals.map((g) => <li key={g} className="flex gap-2 text-[15px]"><span style={{ color: REHAB }}>•</span>{g}</li>)}
        </ul>
        <Link to="/rehab/plan" className="mt-3 flex min-h-[40px] items-center gap-1 text-[15px] font-medium" style={{ color: REHAB }}>Hela planen för fasen <ChevronRight size={16} /></Link>
      </section>

      {/* The road ahead */}
      <section className="mt-8">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Vägen framåt</h2>
        <ol className="mt-3">
          {REHAB_PHASES.map((x) => {
            const from = new Date(surgery.getTime() + x.weeks[0] * 7 * 864e5);
            const now = x.n === ph, past = x.n < ph;
            return (
              <li key={x.n} className="relative flex gap-4 pb-4 last:pb-0">
                <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
                  style={now ? { background: REHAB, color: 'rgb(var(--onpillar))' } : past ? { background: rehabTint(0.35), color: 'rgb(var(--onpillar))' } : { border: `2px solid ${rehabTint(0.35)}`, color: REHAB }}>{past ? '✓' : x.n}</span>
                <span>
                  <span className={`block text-[15px] ${now ? 'font-semibold' : ''}`}>{x.name}</span>
                  <span className="block text-[13px] text-ink2">{x.n === 1 ? 'Från operationen' : `Från ${from.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}`}{now ? ` · vecka ${Math.floor(weeksSinceSurgery(p, ctx.now)) + 1}` : ''}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <Sheet open={leave} onClose={() => setLeave(false)} title="Lämna rehabläget?">
        <div className="flex flex-col gap-4 pb-4">
          <p className="text-[16px] leading-snug">Du går till den vanliga appen med gym, löpning och rörlighet. Ditt rehabprogram och det du läst sparas.</p>
          {(ph < 5 || !p.rehab?.cleared) && (
            <p className="rounded-2xl px-4 py-3 text-[14px] leading-snug" style={{ background: rehabTint(0.12) }}>
              Du är i fas {ph}. Den vanliga appen anpassar inte övningarna efter din höft – lämna bara om din fysioterapeut eller kirurg säger att du kan träna fritt. Löpningen fortsätter som promenader tills du markerat klartecken.
            </p>
          )}
          <p className="text-[14px] text-ink2">Du kan gå tillbaka till rehabläget när du vill: Inställningar → Träning efter höftprotes → Gå tillbaka till rehabläget.</p>
          <Primary onClick={async () => { await leaveRehab(p); setLeave(false); nav('/idag', { replace: true }); }}>Lämna rehabläget</Primary>
          <button onClick={() => setLeave(false)} className="h-14 rounded-full border border-rule text-[17px] font-medium">Stanna kvar</button>
        </div>
      </Sheet>
    </div>
  );
}

export { LESSONS };
