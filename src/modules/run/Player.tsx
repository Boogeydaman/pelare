import { MapPin, Pause, Play, SkipForward, Volume2 } from 'lucide-react';
import { beep, sayPace, speak, unlockAudio } from '../../shared/ui/sound';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fmtClock, vibrate } from '../../core/format';
import { NATIVE } from '../../core/native';
import type { RunSegment } from '../../core/types';
import { Dim, ON, OnButton, RoundButton, useHold } from '../../shared/player/parts';
import { useTick } from '../../shared/ui/hooks';
import type { PlayerProps } from '../types';
import { fmtKm, fmtPace, useGps, type GpsStatus } from './gps';
import { useCtx } from '../../core/ctx';
import { fmtPaceS, paceZones, zonePosition, type Zone } from './pace';

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

const readPref = (k = 'pelare.gps') => { try { return localStorage.getItem(k) !== '0'; } catch { return true; } };

const sayMin = (sec: number) => (sec >= 90 ? `${Math.round(sec / 60)} minuter` : sec >= 60 ? '1 minut' : `${Math.round(sec)} sekunder`);

export function RunPlayer({ plan, onProgress, onFinish, storageKey }: PlayerProps) {
  const segments: RunSegment[] = useMemo(() => (plan.content.kind === 'run' ? plan.content.segments : []), [plan]);
  const ends = useMemo(() => segments.reduce<number[]>((a, s) => [...a, (a[a.length - 1] ?? 0) + s.seconds * 1000], []), [segments]);
  const total = ends[ends.length - 1] ?? 0;
  const key = `pelare.runplayer:${storageKey}`;
  const [clock, setClockState] = useState<Clock>(() => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(key) ?? '{}') }; } catch { return EMPTY; } });
  const setClock = (c: Clock) => { setClockState(c); try { localStorage.setItem(key, JSON.stringify(c)); } catch { /* ignore */ } };
  const [gpsOn, setGpsOn] = useState(() => readPref());
  const [voiceOn, setVoiceOn] = useState(() => readPref('pelare.voice'));
  const ctx = useCtx();
  const zones = useMemo(() => (ctx ? paceZones(ctx) : null), [ctx]);

  const started = clock.startedAt !== null;
  const paused = clock.pausedAt !== null;
  const now = useTick(started && !paused, 250);
  useWorkerTick(started && !paused);
  const elapsed = started ? (clock.pausedAt ?? now) - clock.startedAt! - clock.pausedMs + clock.skipMs : 0;
  const idx = ends.findIndex((e) => elapsed < e);
  const i = idx === -1 ? segments.length - 1 : idx;
  const seg = segments[i];
  const left = Math.max(0, ((ends[i] ?? 0) - elapsed) / 1000);
  const gps = useGps(gpsOn, started && !paused, storageKey);

  const finished = useRef(false);
  // For the summary afterwards: seconds in, over and under the target pace, and each kilometre's time.
  const statsKey = `pelare.runstats:${storageKey}`;
  type Stats = { green: number; fast: number; slow: number; last: number; splits: number[]; intervals: { seconds: number; meters: number }[]; seg: { i: number; m: number; t?: number } };
  const stats = useRef<Stats>((() => {
    const empty: Stats = { green: 0, fast: 0, slow: 0, last: 0, splits: [], intervals: [], seg: { i: -1, m: 0 } };
    try { return { ...empty, ...JSON.parse(localStorage.getItem(statsKey) ?? '{}') }; } catch { return empty; }
  })());
  const saveStats = () => { try { localStorage.setItem(statsKey, JSON.stringify(stats.current)); } catch { /* ignore */ } };

  const finish = useCallback((done: number) => {
    if (finished.current) return;
    finished.current = true;
    try { localStorage.removeItem(key); localStorage.removeItem(statsKey); } catch { /* ignore */ }
    gps.clear();
    const distanceKm = gps.meters >= 50 ? Math.round(gps.meters / 10) / 100 : undefined;
    const st = stats.current;
    const zoneSec = st.green + st.fast + st.slow;
    onFinish({ kind: 'run', segmentsDone: done, ...(distanceKm ? { distanceKm } : {}),
      ...(zoneSec >= 60 ? { zone: { green: Math.round(st.green), fast: Math.round(st.fast), slow: Math.round(st.slow) } } : {}),
      ...(st.splits.length ? { splits: st.splits.map(Math.round) } : {}),
      ...(st.intervals.length ? { intervals: st.intervals.map((x) => ({ seconds: Math.round(x.seconds), meters: Math.round(x.meters) })) } : {}) });
  }, [key, statsKey, gps, onFinish]);

  // Segment changes: vibrate, and finish at the end.
  const lastIdx = useRef(i);
  useEffect(() => {
    if (!started) return;
    if (idx === -1) {
      vibrate([250, 120, 250, 120, 250]);
      if (voiceOn) speak(`Passet är klart${gps.meters >= 50 ? `. ${(gps.meters / 1000).toFixed(1).replace('.', ',')} kilometer` : ''}. Bra jobbat!`);
      finish(segments.length); return;
    }
    if (idx !== lastIdx.current) {
      vibrate([250, 120, 250]);
      lastIdx.current = idx;
      if (voiceOn) announce(idx);
    }
  }, [idx, started, finish, segments.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------- Voice cues in the headphones
  const announce = (k: number) => {
    const sg = segments[k];
    if (!sg) return;
    // Only speak while it is still true: if the app was paused in the background and catches up later,
    // don't read out a backlog of old segment changes.
    const segStart = k > 0 ? ends[k - 1] : 0;
    if (elapsed - segStart > 20000) return;
    const z = gpsOn ? zoneFor(plan.type, sg, zones) : null;
    beep(2, 880, 120);
    speak(`${sg.label}, ${sayMin(sg.seconds)}.${z ? ` Sikta på ${sayPace(z[0])} till ${sayPace(z[1])} per kilometer.` : sg.effort === 'gå' ? '' : sg.effort === 'hårt' ? ' Hårt nu.' : ' Pratbart tempo.'}`);
    zoneState.current = { status: 'unknown', since: Date.now(), said: Date.now() };
  };
  // Pace zone: say it when you drift out of the green (and stay out ~20 s), and confirm now and then when you are in it.
  const zoneState = useRef<{ status: string; since: number; said: number }>({ status: 'unknown', since: 0, said: 0 });
  const zone = seg && gpsOn ? zoneFor(plan.type, seg, zones) : null;
  // Time in the target zone (for the summary), counted on every update while a paced part is running.
  useEffect(() => {
    const st = stats.current;
    const t = Date.now();
    const fresh = gps.lastFix !== null && t - gps.lastFix < 20000;
    if (started && !paused && zone && gps.pace !== null && fresh && st.last) {
      const dt = Math.min(5, (t - st.last) / 1000);
      const x = zonePosition(gps.pace, zone);
      if (Math.abs(x) <= 1) st.green += dt; else if (x < 0) st.fast += dt; else st.slow += dt;
    }
    st.last = started && !paused ? t : 0;
  });
  useEffect(() => {
    const id = setInterval(saveStats, 10000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!voiceOn || !started || paused || !zone || gps.pace === null) return;
    if (gps.lastFix && Date.now() - gps.lastFix > 20000) return; // stale – the app was asleep
    const x = zonePosition(gps.pace, zone);
    const z = zoneState.current;
    const status = Math.abs(x) <= 1 ? 'green' : x < -1.3 ? 'fast' : x > 1.3 ? 'slow' : z.status;
    const now = Date.now();
    if (status !== z.status) { z.status = status; z.since = now; return; }
    const held = now - z.since, quiet = now - z.said;
    if (status === 'fast' && held > 20000 && quiet > 45000) { z.said = now; speak(`Lite för fort. Sakta ner till ${sayPace(zone[1])}.`); }
    else if (status === 'slow' && held > 20000 && quiet > 45000) { z.said = now; speak(`Lite för lugnt. Öka mot ${sayPace(zone[0])}.`); }
    else if (status === 'green' && held > 20000 && quiet > 180000) { z.said = now; speak('Bra tempo, du ligger i det gröna.'); }
  }, [gps.pace, voiceOn, started, paused, zone?.[0], zone?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  // Each hard interval: its distance over its planned time, for the interval breakdown afterwards.
  useEffect(() => {
    if (!started) return;
    const st = stats.current;
    if (st.seg.i === i) return;
    const prev = segments[st.seg.i];
    if (st.seg.i >= 0 && prev?.effort === 'hårt' && gpsOn) {
      const m = gps.meters - st.seg.m;
      // Actual time, so a skipped or cut interval still gets the right pace.
      const sec = st.seg.t !== undefined ? Math.min(prev.seconds, (elapsed - st.seg.t) / 1000) : prev.seconds;
      if (m > 20 && sec > 10) st.intervals.push({ seconds: sec, meters: m });
    }
    st.seg = { i, m: gps.meters, t: elapsed };
    saveStats();
  }, [i, started]); // eslint-disable-line react-hooks/exhaustive-deps
  // Every kilometre: distance and the time for the last one.
  const kmMark = useRef<{ km: number; at: number }>({ km: Math.floor(gps.meters / 1000), at: Date.now() });
  useEffect(() => {
    const k = Math.floor(gps.meters / 1000);
    if (!started || k <= kmMark.current.km) return;
    // Use the GPS fix's own time, so the split is right even if the app handled the fix late.
    const at = gps.lastFix ?? Date.now();
    const split = (at - kmMark.current.at) / 1000;
    kmMark.current = { km: k, at };
    if (split > 60 && split < 1800) { stats.current.splits.push(split); saveStats(); }
    if (voiceOn && Date.now() - at < 20000) { beep(1, 988, 160); speak(`${k} kilometer. Senaste kilometern ${sayPace(split)}.`); }
  }, [gps.meters, started, voiceOn]);
  // Ten seconds left of a hard interval.
  const tenLeft = useRef(-1);
  useEffect(() => {
    if (!voiceOn || !started || paused || !seg || seg.effort !== 'hårt' || seg.seconds < 60) return;
    if (left <= 10 && left > 8 && tenLeft.current !== i) { tenLeft.current = i; speak('Tio sekunder kvar.'); }
  }, [left, voiceOn, started, paused, seg, i]);

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
    unlockAudio();
    setClock({ ...EMPTY, startedAt: Date.now() });
    kmMark.current = { km: 0, at: Date.now() };
    if (voiceOn) setTimeout(() => announce(0), 300);
  };
  const pause = () => setClock({ ...clock, pausedAt: Date.now() });
  const resume = () => setClock({ ...clock, pausedAt: null, pausedMs: clock.pausedMs + (Date.now() - (clock.pausedAt ?? Date.now())) });
  const skip = () => {
    if (i + 1 >= segments.length) { finish(segments.length); return; }
    setClock({ ...clock, skipMs: clock.skipMs + (ends[i] - elapsed) });
  };
  const toggleVoice = () => { const v = !voiceOn; setVoiceOn(v); try { localStorage.setItem('pelare.voice', v ? '1' : '0'); } catch { /* ignore */ } if (v) speak('Rösten är på.'); };
  const toggleGps = () => { const v = !gpsOn; setGpsOn(v); try { localStorage.setItem('pelare.gps', v ? '1' : '0'); } catch { /* ignore */ } };
  const end = useHold(() => finish(i), started);

  if (!seg) return null;
  const next = segments[i + 1];

  return (
    <div className="flex flex-1 flex-col">
      <Dim>{EFFORT_TEXT[seg.effort]}</Dim>
      <h1 className="mt-2 font-serif text-title">{seg.label}</h1>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className={`num font-semibold leading-none tracking-tight ${gpsOn && started ? 'text-[80px]' : 'text-[112px]'}`} aria-live="off">{fmtClock(left)}</div>
        {gpsOn && (
          <div className="mt-3 flex items-baseline gap-5">
            <div className="text-center"><div className="num text-[34px] font-semibold leading-none">{fmtKm(gps.meters)}</div><Dim className="text-[13px]">km</Dim></div>
            <div className="text-center"><div className="num text-[34px] font-semibold leading-none">{fmtPace(gps.pace)}</div><Dim className="text-[13px]">min/km</Dim></div>
          </div>
        )}
        {gpsOn && GPS_TEXT[gps.status] && <Dim className="mt-3 max-w-[18rem] text-center text-[14px]">{GPS_TEXT[gps.status]}</Dim>}
        {gpsOn && started && <PaceGauge zone={zoneFor(plan.type, seg, zones)} pace={gps.pace} hasZones={!!zones} walk={seg.effort === 'gå' || seg.effort === 'vila' || plan.type === 'walkrun'} />}
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
          <button onClick={toggleVoice} aria-pressed={voiceOn} className="mb-3 flex min-h-[48px] items-center justify-between rounded-2xl px-4 text-left text-[15px]" style={{ background: 'rgb(var(--onpillar) / 0.12)' }}>
            <span className="flex items-center gap-2"><Volume2 size={18} aria-hidden="true" /> Röst i hörlurarna</span>
            <span className="font-semibold">{voiceOn ? 'På' : 'Av'}</span>
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

/** Target pace for this part of the session, from your own zones. */
function zoneFor(type: string, seg: RunSegment, z: ReturnType<typeof paceZones>): Zone | null {
  if (!z || seg.seconds < 60) return null;
  if (seg.effort === 'lugnt') return type === 'test' ? [z.easy[0] * 0.97, z.easy[1]] : z.easy;
  if (seg.effort === 'hårt') return type === 'tempo' ? z.tempo : type === 'test' ? [z.p5 * 0.98, z.p5 * 1.04] : z.interval;
  return null;
}

/**
 * Pace gauge: keep the needle in the green. Left = slower than planned, right = faster.
 * Green is the target zone, yellow a little off, red clearly off.
 */
function PaceGauge({ zone, pace, hasZones, walk }: { zone: Zone | null; pace: number | null; hasZones: boolean; walk: boolean }) {
  if (walk) return <Dim className="mt-3 text-center text-[14px]">Gå i lugn takt – ingen fart att hålla nu.</Dim>;
  if (!zone) return <Dim className="mt-3 max-w-[18rem] text-center text-[14px]">{hasZones ? 'Korta snabba lopp – känn efter i stället för att titta på klockan.' : 'Spring så att du kan prata i hela meningar. Efter några rundor med GPS, eller ett 5 km-test, visar appen ditt eget tempo här.'}</Dim>;
  const x = pace === null ? null : -zonePosition(pace, zone); // positive = faster than the zone
  const ang = x === null ? 0 : Math.max(-88, Math.min(88, x * 30));
  const R = 90, cx = 110, cy = 104;
  const pt = (deg: number, r = R) => { const a = ((deg - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const arc = (a0: number, a1: number) => { const [x0, y0] = pt(a0), [x1, y1] = pt(a1); return `M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}`; };
  const [nx, ny] = pt(ang, R - 16);
  const msg = x === null ? 'Väntar på tempo …' : Math.abs(x) <= 1 ? 'Perfekt – håll det här' : x > 0 ? (x > 2 ? 'För fort – sakta ner' : 'Lite fort – lugna ner') : (x < -2 ? 'För lugnt – öka' : 'Lite lugnt – öka lite');
  return (
    <div className="mt-3 flex flex-col items-center" role="img" aria-label={`Tempomätare. ${msg}. Mål ${fmtPaceS(zone[0])} till ${fmtPaceS(zone[1])} minuter per kilometer.`}>
      <svg viewBox="0 0 220 118" className="w-56" aria-hidden="true">
        <path d={arc(-90, -60)} stroke="#d9534f" strokeWidth="14" fill="none" />
        <path d={arc(-60, -30)} stroke="#f0ad4e" strokeWidth="14" fill="none" />
        <path d={arc(-30, 30)} stroke="#5cb85c" strokeWidth="14" fill="none" />
        <path d={arc(30, 60)} stroke="#f0ad4e" strokeWidth="14" fill="none" />
        <path d={arc(60, 90)} stroke="#d9534f" strokeWidth="14" fill="none" />
        {x !== null && <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={ON} strokeWidth="4" strokeLinecap="round" style={{ transition: 'all 0.6s ease' }} />}
        <circle cx={cx} cy={cy} r="6" fill={ON} />
        <text x="14" y="116" fontSize="11" fill="currentColor" opacity="0.7">Lugnare</text>
        <text x="206" y="116" fontSize="11" fill="currentColor" opacity="0.7" textAnchor="end">Fortare</text>
      </svg>
      <div className="text-[16px] font-semibold">{msg}</div>
      <Dim className="num text-[13px]">Mål {fmtPaceS(zone[0])}–{fmtPaceS(zone[1])} min/km</Dim>
    </div>
  );
}

/**
 * With the screen off, ordinary timers run about once a minute; a dedicated worker's timer is not
 * throttled that hard. Its messages re-render the player every second, so segment changes and voice
 * cues come on time even without GPS.
 */
function useWorkerTick(active: boolean) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active || typeof Worker === 'undefined') return;
    let w: Worker | null = null;
    let url = '';
    try {
      url = URL.createObjectURL(new Blob(['setInterval(function(){postMessage(0)},1000)'], { type: 'text/javascript' }));
      w = new Worker(url);
      w.onmessage = () => { if (document.visibilityState === 'hidden') force((n) => n + 1); };
    } catch { /* not available */ }
    return () => { w?.terminate(); if (url) URL.revokeObjectURL(url); };
  }, [active]);
}
