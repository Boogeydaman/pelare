// GPS distance for running sessions. In the Android app a foreground service keeps measuring with the
// screen off (@capacitor-community/background-geolocation); on the website it works while the screen is on.
import { registerPlugin } from '@capacitor/core';
import { useEffect, useRef, useState } from 'react';
import { NATIVE } from '../../core/native';

export interface Fix { lat: number; lon: number; acc: number; t: number }

const R = 6371000;
const rad = (d: number) => (d * Math.PI) / 180;
/** Great-circle distance in metres. */
export function haversine(a: Fix, b: Fix): number {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Adds up distance from GPS fixes, skipping inaccurate fixes, jitter and impossible jumps. */
export class Track {
  meters = 0;
  last?: Fix;
  private recent: { t: number; m: number }[] = [];

  constructor(meters = 0) { this.meters = meters; }

  /** Returns true when the fix counted. `active` = the session is running (not paused). */
  add(f: Fix, active: boolean): boolean {
    if (f.acc > 35) return false; // too vague to use
    const last = this.last;
    if (!last || !active) { this.last = f; return false; }
    const dt = (f.t - last.t) / 1000;
    if (dt <= 0) return false;
    const d = haversine(last, f);
    if (d / dt > 8) { // faster than 29 km/h: a glitch, unless the last good fix is old
      if (dt > 20) this.last = f;
      return false;
    }
    if (d < Math.max(3, Math.min(f.acc, last.acc) * 0.4)) return false; // standing still / jitter
    this.meters += d;
    this.last = f;
    this.recent.push({ t: f.t, m: this.meters });
    this.recent = this.recent.filter((x) => f.t - x.t <= 45000);
    return true;
  }

  /** Current pace in seconds per km over the last ~30–45 s, or null. */
  pace(now: number): number | null {
    const r = this.recent.filter((x) => now - x.t <= 45000);
    if (r.length < 2) return null;
    const m = r[r.length - 1].m - r[0].m, s = (r[r.length - 1].t - r[0].t) / 1000;
    if (m < 20 || s < 10) return null;
    return (s / m) * 1000;
  }
}

type Location = { latitude: number; longitude: number; accuracy: number; time: number | null };
interface BgGeo {
  addWatcher(o: Record<string, unknown>, cb: (l?: Location, e?: { code?: string }) => void): Promise<string>;
  removeWatcher(o: { id: string }): Promise<void>;
  openSettings(): Promise<void>;
}
const BackgroundGeolocation = NATIVE ? registerPlugin<BgGeo>('BackgroundGeolocation') : null;

export type GpsStatus = 'off' | 'searching' | 'on' | 'denied' | 'unavailable';

/** Measures distance while `enabled`; only adds distance while `active`. Survives reloads via storageKey. */
export function useGps(enabled: boolean, active: boolean, storageKey: string) {
  const key = `pelare.gps:${storageKey}`;
  const track = useRef<Track | null>(null);
  if (!track.current) {
    let m = 0;
    try { m = Number(localStorage.getItem(key)) || 0; } catch { /* ignore */ }
    track.current = new Track(m);
  }
  const activeRef = useRef(active);
  activeRef.current = active;
  const [status, setStatus] = useState<GpsStatus>('off');
  const [, force] = useState(0);

  useEffect(() => {
    if (!enabled) { setStatus('off'); return; }
    let stop = () => {};
    let gone = false;
    setStatus('searching');
    const onFix = (f: Fix) => {
      const t = track.current!;
      if (t.add(f, activeRef.current)) { try { localStorage.setItem(key, String(Math.round(t.meters))); } catch { /* ignore */ } }
      setStatus(f.acc <= 35 ? 'on' : 'searching');
      force((n) => n + 1);
    };
    if (BackgroundGeolocation) {
      BackgroundGeolocation.addWatcher({
        backgroundTitle: 'Löppass pågår',
        backgroundMessage: 'Pelare mäter din runda. Avsluta passet i appen för att stänga av.',
        requestPermissions: true, stale: false, distanceFilter: 0,
      }, (l, e) => {
        if (e) { setStatus(e.code === 'NOT_AUTHORIZED' ? 'denied' : 'unavailable'); return; }
        if (l) onFix({ lat: l.latitude, lon: l.longitude, acc: l.accuracy, t: l.time ?? Date.now() });
      }).then((id) => { if (gone) BackgroundGeolocation.removeWatcher({ id }); else stop = () => { BackgroundGeolocation.removeWatcher({ id }); }; })
        .catch(() => setStatus('unavailable'));
    } else if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (p) => onFix({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, t: p.timestamp }),
        (e) => setStatus(e.code === e.PERMISSION_DENIED ? 'denied' : 'searching'),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
      );
      stop = () => navigator.geolocation.clearWatch(id);
    } else setStatus('unavailable');
    return () => { gone = true; stop(); };
  }, [enabled, key]);

  return {
    status,
    meters: track.current.meters,
    pace: track.current.pace(Date.now()),
    lastFix: track.current.last?.t ?? null, // time of the latest GPS fix (ms)
    clear: () => { try { localStorage.removeItem(key); } catch { /* ignore */ } },
  };
}

export const fmtKm = (m: number) => (m / 1000).toFixed(2).replace('.', ',');
export const fmtPace = (s: number | null) => (s === null || !Number.isFinite(s) || s > 1800 ? '–' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);
