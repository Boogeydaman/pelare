// Gym diary: per exercise what you did last, estimated max and what to aim for next time.
// Plus "Så valdes veckans pass": the parameters behind this week's gym sessions.
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCtx } from '../../core/ctx';
import { fmtDate } from '../../core/format';
import { Empty, Section } from '../../shared/layout/page';
import { color } from '../../shared/ui/kit';
import { gymDaysOf, runsPerWeekOf, thisWeek } from '../common';
import type { ModuleCtx } from '../types';
import { EX, MUSCLES, MUSCLE_NAME } from './exercises';
import { e1rm, equipmentAt, history, nextTemplate, notRecovered, programOf, target, weekVolume, weeklyTarget } from './planner';

const kgText = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

export function GymDiary() {
  const ctx = useCtx();
  if (!ctx) return null;
  const ids = [...new Set(ctx.logs.flatMap((l) => (l.module === 'gym' && l.data?.kind === 'strength' ? l.data.exercises.filter((e) => e.sets.length).map((e) => e.id) : [])))].filter((id) => EX[id]);
  return (
    <>
      <WeekExplain ctx={ctx} />
      <Section title="Träningsdagbok">
        <p className="-mt-1 mb-3 text-[14px] text-ink2">Senaste passet, beräknat max (1RM) och vad appen föreslår nästa gång. Tryck för att se hela utvecklingen.</p>
        {ids.length ? ids.map((id) => <DiaryRow key={id} id={id} ctx={ctx} />) : <Empty>När du har loggat ett gympass syns varje övning här med vikter, maxlyft och nästa mål.</Empty>}
      </Section>
    </>
  );
}

function DiaryRow({ id, ctx }: { id: string; ctx: ModuleCtx }) {
  const ex = EX[id];
  const h = history(ctx.logs, id);
  const [a, b] = h;
  const best = (r: typeof a) => Math.max(0, ...r.result.sets.map((s) => e1rm(s.kg, s.reps)));
  const reps = (r: typeof a) => r.result.sets.reduce((x, s) => x + s.reps, 0);
  const loaded = a.result.sets.some((s) => s.kg > 0);
  const now = loaded ? best(a) : reps(a);
  const before = b ? (loaded ? best(b) : reps(b)) : now;
  const trend = Math.sign(Math.round((now - before) * 10));
  const Icon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : ArrowRight;
  const t = target(ex, ctx.logs);
  const top = Math.max(...a.result.sets.map((s) => s.kg));
  const u = a.result.unit === 'sek' ? ' s' : '';
  const next = t.kg ? `${kgText(t.kg)} kg × ${t.reps}` : `${t.ex.id !== id ? `${t.ex.name}, ` : ''}${t.reps}${u || ' reps'}`;
  const allTime = Math.max(...h.map(best));
  return (
    <Link to={`/gym/bibliotek/${id}`} className="block border-t border-rule py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[17px] font-medium">{ex.name}</span>
        <span className="num shrink-0 text-[13px] text-ink2">{fmtDate(a.date)} · {h.length} pass</span>
      </div>
      <div className="num mt-2 grid grid-cols-3 gap-2 text-[13px]">
        <div><div className="text-ink2">Senast</div><div className="font-semibold text-ink">{top > 0 ? `${kgText(top)} kg × ` : ''}{a.result.sets.map((s) => s.reps).join(', ')}{u}</div></div>
        <div><div className="text-ink2">{loaded ? 'Beräknat max' : 'Totalt reps'}</div><div className="flex items-center gap-1 font-semibold text-ink">{loaded ? `${kgText(now)} kg` : now}<Icon size={14} style={{ color: trend > 0 ? color('gym') : undefined }} aria-label={trend > 0 ? 'upp' : trend < 0 ? 'ner' : 'samma'} /></div></div>
        <div><div className="text-ink2">Nästa gång</div><div className="font-semibold" style={{ color: color('gym') }}>{next}</div></div>
      </div>
      {loaded && allTime > now * 1.01 && <div className="mt-1 text-[12px] text-ink2">Bästa hittills: {kgText(allTime)} kg beräknat max.</div>}
    </Link>
  );
}

/** The parameters behind this week's gym sessions, in plain words. */
export function WeekExplain({ ctx }: { ctx: ModuleCtx }) {
  const [open, setOpen] = useState(false);
  const program = programOf(ctx.profile);
  const next = nextTemplate(ctx, program).tpl;
  const goal = weeklyTarget(ctx.profile.goals.gym);
  const v = weekVolume(ctx);
  const under = MUSCLES.filter((m) => v[m] < goal);
  const tired = notRecovered(ctx);
  const done = thisWeek(ctx, 'gym').length;
  const days = gymDaysOf(ctx.profile);
  const eq = equipmentAt(ctx.profile, ctx.checkin.place);
  const place = ctx.checkin.place === 'gym' ? 'på gymmet' : ctx.checkin.place === 'home' ? 'hemma' : 'på resa (utan redskap)';
  const lines: [string, string][] = [
    ['Program', program.id === 'rolling'
      ? `Rullande: av alla ${program.sessions.length} gympass väljs det som fyller veckans luckor bäst – muskler under veckomålet räknas upp, trötta muskler och pass du nyss kört räknas ner. Nästa: ${next.title}.`
      : `${program.name}: passen roterar i ordning (${program.sessions.map((s) => s.title).join(' → ')}). Nästa: ${next.title}.`],
    ['Antal pass', `${days} gympass i veckan (ditt val), ${done} gjorda. Löpningen har ${runsPerWeekOf(ctx.profile)} pass, så veckan blir ${days + runsPerWeekOf(ctx.profile)} pass totalt.`],
    ['Volym per muskel', `Målet är ungefär ${goal} hårda set per muskel och vecka för ditt mål. ${under.length ? `Under målet just nu: ${under.slice(0, 6).map((m) => MUSCLE_NAME[m].toLowerCase()).join(', ')}${under.length > 6 ? ' med flera' : ''}.` : 'Alla muskler har nått målet den här veckan.'}`],
    ['Återhämtning', tired.length ? `Tränade senaste dygnen och fortfarande trötta: ${tired.map((m) => MUSCLE_NAME[m].toLowerCase()).join(', ')}. Coachen undviker tunga pass för dem och håller tunga ben och hård löpning minst ett dygn isär.` : 'Inga muskler är tränade hårt de senaste dygnen – inget hindrar ett tungt pass.'],
    ['Plats och utrustning', `Du tränar ${place}. Övningar som kräver något du inte har där byts automatiskt mot en som tränar samma muskler${eq.size ? '' : ' i kroppsvikt'}.`],
    ['Vikter', 'Dubbel progression: när alla set når toppen av repintervallet ökar vikten ett steg. Två tunga pass i rad sänker vikten 7,5 %, och tre pass utan framsteg ger ett platåtips.'],
    ['Tid', `Passet kortas till din tid i dagsformen (${ctx.checkin.minutes} min): först set på de sista övningarna, sedan hela övningar – de tunga basövningarna behålls.`],
  ];
  return (
    <section className="mt-6 rounded-[24px] px-5 py-4" style={{ background: color('gym', 0.08) }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between text-left">
        <span>
          <span className="block text-[13px] font-medium" style={{ color: color('gym') }}>Så valdes veckans pass</span>
          <span className="block text-[16px] font-medium">{program.name} · nästa: {next.title}</span>
        </span>
        <ChevronDown size={20} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <dl className="mt-3">
          {lines.map(([k, t]) => (
            <div key={k} className="border-t border-rule py-2.5">
              <dt className="text-[13px] font-medium text-ink2">{k}</dt>
              <dd className="text-[15px] leading-snug">{t}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** On the gym program page. */
export function GymProgramExtra() {
  const ctx = useCtx();
  return ctx ? <WeekExplain ctx={ctx} /> : null;
}
