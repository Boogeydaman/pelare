import { useEffect, useRef, useState } from 'react';

/** Re-renders every `ms` while active and returns the current time. */
export function useTick(active: boolean, ms = 250): number {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => force((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return Date.now();
}

/** Keeps the screen on while mounted, where the browser supports it. */
export function useWakeLock() {
  const lock = useRef<{ release: () => Promise<void> } | null>(null);
  useEffect(() => {
    type WL = { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> };
    const wl = (navigator as Navigator & { wakeLock?: WL }).wakeLock;
    let off = false;
    const req = async () => {
      try {
        if (!wl || document.visibilityState !== 'visible') return;
        const l = await wl.request('screen');
        if (off) l.release(); else lock.current = l;
      } catch { /* denied */ }
    };
    req();
    const vis = () => document.visibilityState === 'visible' && req();
    document.addEventListener('visibilitychange', vis);
    return () => { off = true; document.removeEventListener('visibilitychange', vis); lock.current?.release().catch(() => {}); };
  }, []);
}

/** Countdown with pause/resume. `left` in seconds. */
export function useCountdown(onEnd?: () => void) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [paused, setPaused] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const now = useTick(endsAt !== null);
  const left = endsAt !== null ? Math.max(0, (endsAt - now) / 1000) : paused ?? 0;
  const ended = useRef(false);

  useEffect(() => {
    if (endsAt !== null && now >= endsAt && !ended.current) {
      ended.current = true;
      setEndsAt(null);
      setPaused(null);
      onEnd?.();
    }
  }, [now, endsAt, onEnd]);

  return {
    left, total, running: endsAt !== null, paused: paused !== null,
    start: (sec: number) => { ended.current = false; setTotal(sec); setPaused(null); setEndsAt(Date.now() + sec * 1000); },
    pause: () => { if (endsAt !== null) { setPaused(Math.max(0, (endsAt - Date.now()) / 1000)); setEndsAt(null); } },
    resume: () => { if (paused !== null) { setEndsAt(Date.now() + paused * 1000); setPaused(null); } },
    add: (sec: number) => { setTotal((t) => t + sec); if (endsAt !== null) setEndsAt(endsAt + sec * 1000); },
    stop: () => { ended.current = true; setEndsAt(null); setPaused(null); },
  };
}
