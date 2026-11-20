import { ChevronRight, Play, Plus, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coach } from '../core/coach';
import { useCtx } from '../core/ctx';
import { saveCheckin } from '../core/db';
import { fmtDayLong } from '../core/format';
import { useStart } from '../core/start';
import type { CheckIn, Feeling, PlannedSession } from '../core/types';
import { MODULE_LIST } from '../modules/registry';
import { ARTICLE, PRINCIPLE, articleFor } from '../core/articles';
import { ContentList, Meta } from '../shared/layout/content';
import { Row } from '../shared/layout/page';
import { IconButton, Kicker, MODULE_NAME, Pillars, Primary, Segmented, Sheet, type WeekProgress } from '../shared/ui/kit';

const FEELING: Record<Feeling, string> = { pigg: 'Pigg', okej: 'Okej', trott: 'Trött' };

export function Today() {
  const ctx = useCtx();
  const start = useStart();
  const nav = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [pick, setPick] = useState<string | null>(null);

  const view = useMemo(() => ctx && {
    today: coach(ctx, MODULE_LIST),
    week: Object.fromEntries(MODULE_LIST.map((m) => [m.id, m.weekly(ctx)])) as WeekProgress,
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

      <section key={main.id} className="rise mt-12">
        <Kicker kind={main.module}>{main.id === view.today.primary.id ? 'Dagens pass' : 'Ditt val'} · {MODULE_NAME[main.module]}</Kicker>
        <h1 className="mt-3 font-serif text-display">{main.title}</h1>
        <Meta s={main} className="mt-3" />
        <ul className="mt-7">
          {main.reasons.slice(0, 3).map((r, i) => <li key={i} className="border-t border-rule py-3 text-[16px] leading-snug">{r.text}</li>)}
        </ul>
        <button onClick={() => setPeek(true)} className="flex min-h-[48px] w-full items-center gap-1 border-t border-rule text-[16px] font-medium">
          Visa hela passet <ChevronRight size={18} strokeWidth={1.75} />
        </button>
      </section>

      {view.today.note && <p className="mt-5 text-[15px] text-ink2">{view.today.note}</p>}

      <WhyToday kind={main.module} />

      <button onClick={() => setFormOpen(true)} className="mt-8 flex w-full items-center justify-between rounded-2xl bg-ink/[0.05] px-5 py-4 text-left">
        <span>
          <span className="block text-[13px] text-ink2">Dagsform</span>
          <span className="block text-[17px] font-medium">{FEELING[c.feeling]} · {c.minutes} min{ctx.profile.places.length > 1 ? ` · ${c.place === 'gym' ? 'gym' : 'hemma'}` : ''}</span>
        </span>
        <span className="text-[15px] text-ink2">Ändra</span>
      </button>

      <section className="mt-10">
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
        <Primary kind={main.module} onClick={() => start(main)}><Play size={18} fill="currentColor" /> Starta</Primary>
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
              options={[{ value: 'pigg', label: 'Pigg' }, { value: 'okej', label: 'Okej' }, { value: 'trott', label: 'Trött' }]} />
          </div>
          <div>
            <div className="mb-2 text-[14px] text-ink2">Hur mycket tid har du?</div>
            <Segmented label="Tid" value={c.minutes} onChange={(v) => setCheckin({ minutes: v })}
              options={[20, 30, 45, 60, 90].map((n) => ({ value: n, label: String(n) }))} />
          </div>
          {ctx.profile.places.length > 1 && (
            <div>
              <div className="mb-2 text-[14px] text-ink2">Var?</div>
              <Segmented label="Plats" value={c.place} onChange={(v) => setCheckin({ place: v })}
                options={[{ value: 'gym', label: 'Gym' }, { value: 'home', label: 'Hemma' }]} />
            </div>
          )}
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
    <section className="mt-10 rounded-[28px] border border-rule px-6 py-6">
      <Kicker kind={kind}>Därför i dag</Kicker>
      <h2 className="mt-2 font-serif text-[30px] leading-[1.05]">{p.title}</h2>
      <p className="mt-3 text-[16px] leading-relaxed">{p.text}</p>
      <div className="mt-5 flex flex-col">
        <Link to={`/las/${a.id}`} className="flex min-h-[48px] items-center justify-between border-t border-rule text-[16px] font-medium">
          <span>Läs: {a.title}</span><ChevronRight size={18} strokeWidth={1.75} />
        </Link>
        <Link to={`/las/${ARTICLE['dagens-pass'].id}`} className="flex min-h-[48px] items-center justify-between border-t border-rule text-[15px] text-ink2">
          <span>Så väljs ditt pass</span><ChevronRight size={18} strokeWidth={1.5} />
        </Link>
        <Link to="/las" className="flex min-h-[48px] items-center justify-between border-t border-rule text-[15px] text-ink2">
          <span>Alla artiklar</span><ChevronRight size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
