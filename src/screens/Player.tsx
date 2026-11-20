import { Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCtx } from '../core/ctx';
import { saveSession, setActive, uid, useActive } from '../core/db';
import { fmtClock } from '../core/format';
import type { Feel, LogData, SessionLog } from '../core/types';
import { MODULE, MODULE_LIST } from '../modules/registry';
import { Dim, ON, OnButton } from '../shared/player/parts';
import { useTick, useWakeLock } from '../shared/ui/hooks';
import { Kicker, MODULE_NAME, Pillars, Primary, Segmented, Sheet, color, type WeekProgress } from '../shared/ui/kit';

/** Full-screen session in the module's colour. The module supplies the body. */
export function PlayerPage() {
  const active = useActive();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [progress, setProgress] = useState(0);
  useWakeLock();

  const finish = useCallback(async (result?: LogData) => {
    if (!active) return;
    await setActive({ ...active, result, finishedAt: Date.now() });
    nav('/pass/klart', { replace: true });
  }, [active, nav]);

  if (active === undefined) return null;
  if (active === null) return <Navigate to="/idag" replace />;
  const { plan } = active;
  const Body = plan.module === 'rest' ? null : MODULE[plan.module].Player;

  return (
    <div className="fixed inset-0 flex flex-col overflow-y-auto" style={{ background: color(plan.module), color: ON }}>
      <div className="safe-top safe-bottom mx-auto flex w-full max-w-lg flex-1 flex-col px-6">
        <header className="flex items-center justify-between py-2">
          <button onClick={() => setConfirm(true)} aria-label="Avsluta passet" className="-m-2 flex h-12 w-12 items-center justify-center"><X size={24} strokeWidth={1.75} /></button>
          <div className="text-[15px] font-medium">{plan.title}</div>
          <Elapsed since={active.startedAt} />
        </header>
        <div className="mt-2 h-[3px] overflow-hidden rounded-full" style={{ background: 'rgb(var(--onpillar) / 0.25)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress * 100}%`, background: ON }} />
        </div>
        <main className="flex flex-1 flex-col pt-8">
          {Body ? <Body plan={plan} storageKey={`${plan.id}:${active.startedAt}`} onProgress={setProgress} onFinish={finish} /> : (
            <div className="flex flex-1 flex-col">
              <h1 className="font-serif text-display">Vila</h1>
              <Dim className="mt-4 text-[19px] leading-snug">{plan.content.kind === 'rest' ? plan.content.text : ''}</Dim>
              <div className="mt-auto"><OnButton onClick={() => finish()}>Klart för i dag</OnButton></div>
            </div>
          )}
        </main>
      </div>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Avsluta passet?">
        <div className="flex flex-col gap-3 pb-4 text-ink">
          <Primary onClick={() => { setConfirm(false); finish(); }}>Spara det jag har gjort</Primary>
          <button onClick={async () => { await setActive(null); nav(active.from || '/idag', { replace: true }); }}
            className="h-14 rounded-full border border-rule text-[17px] font-medium">Avbryt utan att spara</button>
        </div>
      </Sheet>
    </div>
  );
}

function Elapsed({ since }: { since: number }) {
  const now = useTick(true, 1000);
  return <div className="num w-12 text-right text-[15px]" style={{ color: 'rgb(var(--onpillar) / 0.72)' }}>{fmtClock((now - since) / 1000)}</div>;
}

export function DonePage() {
  const active = useActive();
  const ctx = useCtx();
  const nav = useNavigate();
  const [feel, setFeel] = useState<Feel>(2);
  const [km, setKm] = useState('');

  const log = useMemo<SessionLog | null>(() => {
    if (!active) return null;
    const { plan, startedAt, finishedAt, result } = active;
    return {
      id: uid(), module: plan.module === 'rest' ? 'other' : plan.module, type: plan.type, title: plan.title,
      startedAt: new Date(startedAt).toISOString(), minutes: Math.max(1, Math.round(((finishedAt ?? Date.now()) - startedAt) / 60000)),
      data: result ?? (plan.module === 'rest' ? { kind: 'other', activity: 'Vila eller promenad' } : undefined), plan,
    };
  }, [active]);

  const weeks = useMemo(() => {
    if (!ctx || !log) return null;
    const w = (logs: SessionLog[]) => Object.fromEntries(MODULE_LIST.map((m) => [m.id, m.weekly({ ...ctx, logs })])) as WeekProgress;
    return { before: w(ctx.logs), after: w([log, ...ctx.logs]) };
  }, [ctx, log]);

  const records = useMemo(() => {
    if (!ctx || !log || log.module === 'other') return [];
    return MODULE[log.module].records?.(ctx.logs, log) ?? [];
  }, [ctx, log]);

  useEffect(() => { if (active === null) nav('/idag', { replace: true }); }, [active, nav]);
  if (!active || !log || !weeks) return null;

  const save = async () => {
    const d = Number(km.replace(',', '.'));
    const data = log.module === 'run' && km.trim() && !Number.isNaN(d) ? { kind: 'run' as const, ...(log.data?.kind === 'run' ? log.data : {}), distanceKm: d } : log.data;
    await saveSession({ ...log, feel, data });
    await setActive(null);
    nav(active.from || '/idag', { replace: true });
  };

  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-lg flex-col px-6">
      <div className="flex flex-1 flex-col pt-14">
        <Kicker kind={active.plan.module} className="rise">{MODULE_NAME[active.plan.module]}</Kicker>
        <h1 className="rise mt-3 font-serif text-[76px] leading-[0.9]" style={{ animationDelay: '60ms' }}>Klart.</h1>
        <p className="rise mt-3 text-[18px] text-ink2" style={{ animationDelay: '120ms' }}>
          {log.title} · <span className="num">{log.minutes}</span> min
        </p>
        {records.length > 0 && (
          <div className="rise mt-8 rounded-[24px] px-5 py-4" style={{ background: color(active.plan.module, 0.12), animationDelay: '150ms' }}>
            <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: color(active.plan.module) }}><Trophy size={16} aria-hidden="true" /> {records.length === 1 ? 'Nytt rekord' : `${records.length} nya rekord`}</div>
            <ul className="mt-1">
              {records.map((r, i) => <li key={i} className="py-1 text-[16px]"><span className="font-medium">{r.title}</span> · {r.detail.replace(/^Nytt rekord: /, '')}</li>)}
            </ul>
          </div>
        )}
        <div className="rise mt-12" style={{ animationDelay: '180ms' }}>
          <Pillars week={weeks.after} animateFrom={weeks.before} size="lg" />
        </div>
        <div className="rise mt-12" style={{ animationDelay: '240ms' }}>
          <div className="mb-2 text-[14px] text-ink2">Hur kändes passet?</div>
          <Segmented label="Känsla" value={feel} onChange={setFeel} options={[{ value: 1, label: 'Lätt' }, { value: 2, label: 'Lagom' }, { value: 3, label: 'Tungt' }]} />
          {log.module === 'run' && log.type === 'walkrun' && <p className="mt-2 text-[14px] text-ink2">Lätt eller lagom låser upp nästa steg. Tungt betyder samma steg igen.</p>}
        </div>
        {log.module === 'run' && (
          <label className="rise mt-6 flex items-center justify-between gap-4 border-t border-rule pt-4" style={{ animationDelay: '280ms' }}>
            <span className="text-[16px]">Distans (valfritt)</span>
            <span className="flex items-baseline gap-2">
              <input value={km} onChange={(e) => setKm(e.target.value)} inputMode="decimal" aria-label="Distans i km"
                className="num h-12 w-24 rounded-xl bg-ink/[0.06] px-3 text-right text-[20px] font-semibold outline-none focus:ring-2 focus:ring-ink" />
              <span className="text-[15px] text-ink2">km</span>
            </span>
          </label>
        )}
      </div>
      <div className="pt-8"><Primary onClick={save}>Spara</Primary></div>
    </div>
  );
}

