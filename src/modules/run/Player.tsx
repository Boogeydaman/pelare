import { MapPin, Pause, Play, SkipForward } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fmtClock, vibrate } from '../../core/format';
import { NATIVE } from '../../core/native';
import type { RunSegment } from '../../core/types';
import { Dim, ON, OnButton, RoundButton, useHold } from '../../shared/player/parts';
import { useTick } from '../../shared/ui/hooks';
import type { PlayerProps } from '../types';
import { fmtKm, fmtPace, useGps, type GpsStatus } from './gps';

const EFFORT_TEXT: Record<RunSegment['effort'], string> = {
  'hårt': 'Hårt – ungefär 8 av 10', 'gå': 'Gå', 'vila': 'Lugnt, återhämta dig', 'lugnt': 'Pratbart tempo',
};
const GPS_TEXT: Record<GpsStatus, string> = {
  off: '', searching: 'Söker GPS …', on: '', denied: 'Platsen är nekad – tillåt den i telefonens inställningar för att mäta distans.',
  unavailable: 'GPS är inte tillgänglig just nu.',
};

/** The session runs on a fixed timeline (start time, pauses, skips), so it is right even after the screen was off. */
interface Clock { startedAt: number | null; pausedAt: number | null; pausedMs: number; skipMs: number }
const EMPTY: Clock = { startedAt: null, pausedAt: null, pausedMs: 0, skipMs: 0 };

const readPref = () => { try { return localStorage.getItem('pelare.gps') !== '0'; } catch { return true; } };

export function RunPlayer({ plan, onProgress, onFinish, storageKey }: PlayerProps) {
  const segments: RunSegment[] = useMemo(() => (plan.content.kind === 'run' ? plan.content.segments : []), [plan]);
  const ends = useMemo(() => segments.reduce<number[]>((a, s) => [...a, (a[a.length - 1] ?? 0) + s.seconds * 1000], []), [segments]);
  const total = ends[ends.length - 1] ?? 0;
  const key = `pelare.runplayer:${storageKey}`;
  const [clock, setClockState] = useState<Clock>(() => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(key) ?? '{}') }; } catch { return EMPTY; } });
  const setClock = (c: Clock) => { setClockState(c); try { localStorage.setItem(key, JSON.stringify(c)); } catch { /* ignore */ } };
  const [gpsOn, setGpsOn] = useState(readPref);

  const started = clock.startedAt !== null;
  const paused = clock.pausedAt !== null;
  const now = useTick(started && !paused, 250);
  const elapsed = started ? (clock.pausedAt ?? now) - clock.startedAt! - clock.pausedMs + clock.skipMs : 0;
  const idx = ends.findIndex((e) => elapsed < e);
  const i = idx === -1 ? segments.length - 1 : idx;
  const seg = segments[i];
  const left = Math.max(0, ((ends[i] ?? 0) - elapsed) / 1000);
  const gps = useGps(gpsOn, started && !paused, storageKey);

  const finished = useRef(false);
  const finish = useCallback((done: number) => {
    if (finished.current) return;
    finished.current = true;
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    gps.clear();
    const distanceKm = gps.meters >= 50 ? Math.round(gps.meters / 10) / 100 : undefined;
    onFinish({ kind: 'run', segmentsDone: done, ...(distanceKm ? { distanceKm } : {}) });
  }, [key, gps, onFinish]);

  // Segment changes: vibrate, and finish at the end.
  const lastIdx = useRef(i);
  useEffect(() => {
    if (!started) return;
    if (idx === -1) { vibrate([250, 120, 250, 120, 250]); finish(segments.length); return; }
    if (idx !== lastIdx.current) { vibrate([250, 120, 250]); lastIdx.current = idx; }
  }, [idx, started, finish, segments.length]);

  const p = Math.round((Math.min(elapsed, total) / Math.max(1, total)) * 200) / 200;
  useEffect(() => onProgress(p), [p, onProgress]);

  // In the Android app: notifications for each segment change while the app is in the background.
  useEffect(() => {
    if (!NATIVE || !started || paused) return;
    let cancelled = false;
    const ids = segments.map((_, k) => ({ id: 4100 + k }));
    const schedule = async () => {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: ids }).catch(() => {});
      if (cancelled || document.visibilityState === 'visible') return;
      const base = Date.now() - elapsedAt();
      const list = segments.map((_, k) => k).filter((k) => base + ends[k] > Date.now()).map((k) => ({
        id: 4100 + k,
        title: k + 1 < segments.length ? `Nu: ${segments[k + 1].label}` : 'Passet är klart',
        body: k + 1 < segments.length ? `${EFFORT_TEXT[segments[k + 1].effort]} · ${fmtClock(segments[k + 1].seconds)}` : 'Bra jobbat! Öppna appen för att spara passet.',
        schedule: { at: new Date(base + ends[k]), allowWhileIdle: true },
      }));
      if (list.length) await LocalNotifications.schedule({ notifications: list }).catch(() => {});
    };
    const elapsedAt = () => Date.now() - clock.startedAt! - clock.pausedMs + clock.skipMs;
    const onVis = () => { schedule(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      import('@capacitor/local-notifications').then(({ LocalNotifications }) => LocalNotifications.cancel({ notifications: ids }).catch(() => {}));
    };
  }, [started, paused, clock, segments, ends]);

  const start = async () => {
    if (NATIVE) {
      // Android 13+: needed for segment alerts and the "measuring your run" notification.
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.requestPermissions().catch(() => {});
    }
    setClock({ ...EMPTY, startedAt: Date.now() });
  };
  const pause = () => setClock({ ...clock, pausedAt: Date.now() });
  const resume = () => setClock({ ...clock, pausedAt: null, pausedMs: clock.pausedMs + (Date.now() - (clock.pausedAt ?? Date.now())) });
  const skip = () => {
    if (i + 1 >= segments.length) { finish(segments.length); return; }
    setClock({ ...clock, skipMs: clock.skipMs + (ends[i] - elapsed) });
  };
  const toggleGps = () => { const v = !gpsOn; setGpsOn(v); try { localStorage.setItem('pelare.gps', v ? '1' : '0'); } catch { /* ignore */ } };
  const end = useHold(() => finish(i), started);

  if (!seg) return null;
  const next = segments[i + 1];

  return (
    <div className="flex flex-1 flex-col">
      <Dim>{EFFORT_TEXT[seg.effort]}</Dim>
      <h1 className="mt-2 font-serif text-title">{seg.label}</h1>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="num text-[112px] font-semibold leading-none tracking-tight" aria-live="off">{fmtClock(left)}</div>
        {gpsOn && (
          <div className="mt-4 flex items-baseline gap-5">
            <div className="text-center"><div className="num text-[34px] font-semibold leading-none">{fmtKm(gps.meters)}</div><Dim className="text-[13px]">km</Dim></div>
            <div className="text-center"><div className="num text-[34px] font-semibold leading-none">{fmtPace(gps.pace)}</div><Dim className="text-[13px]">min/km</Dim></div>
          </div>
        )}
        {gpsOn && GPS_TEXT[gps.status] && <Dim className="mt-3 max-w-[18rem] text-center text-[14px]">{GPS_TEXT[gps.status]}</Dim>}
      </div>

      <div className="mb-6 flex h-8 items-end gap-[3px]" aria-hidden="true">
        {segments.map((sg, k) => (
          <div key={k} className="rounded-sm transition-all" style={{
            flex: sg.seconds, height: sg.effort === 'hårt' ? '100%' : sg.effort === 'gå' ? '35%' : '60%',
            background: k < i ? 'rgb(var(--onpillar) / 0.35)' : k === i ? ON : 'rgb(var(--onpillar) / 0.2)',
          }} />
        ))}
      </div>
      {next && <Dim className="mb-4">Sedan: {next.label} · {fmtClock(next.seconds)}</Dim>}

      {!started ? (
        <>
          <button onClick={toggleGps} aria-pressed={gpsOn} className="mb-3 flex min-h-[48px] items-center justify-between rounded-2xl px-4 text-left text-[15px]" style={{ background: 'rgb(var(--onpillar) / 0.12)' }}>
            <span className="flex items-center gap-2"><MapPin size={18} aria-hidden="true" /> Mät distans med GPS</span>
            <span className="font-semibold">{gpsOn ? 'På' : 'Av'}</span>
          </button>
          <OnButton onClick={start}><Play size={22} /> Starta</OnButton>
        </>
      ) : (
        <>
          <div className="flex gap-3">
            {paused
              ? <OnButton onClick={resume}><Play size={22} /> Fortsätt</OnButton>
              : <OnButton hold onClick={pause}><Pause size={22} /> Håll för paus</OnButton>}
            <RoundButton hold size={64} label="Nästa del" onClick={skip}><SkipForward size={22} /></RoundButton>
          </div>
          <button {...end.handlers} className="relative mt-3 min-h-[44px] touch-none select-none overflow-hidden rounded-full text-[15px] underline underline-offset-4" style={{ color: 'rgb(var(--onpillar) / 0.72)' }}>
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${end.progress * 100}%`, background: 'rgb(var(--onpillar) / 0.18)' }} aria-hidden="true" />
            <span className="relative">Håll inne för att avsluta och logga</span>
          </button>
          <Dim className="mt-1 text-center text-[12px]">Knapparna kräver att du håller inne en sekund – så trycks inget av misstag i fickan.</Dim>
        </>
      )}
    </div>
  );
}
