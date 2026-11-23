import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ModuleCtx } from '../modules/types';
import { useCheckin, useCustomExercises, useProfile, useRecentCheckins, useSessions, useTests } from './db';
import { registerCustom } from '../modules/gym/custom';
import type { CheckIn } from './types';

export const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const Ctx = createContext<ModuleCtx | undefined>(undefined);

/** Loads profile, logs, tests and today's check-in once, live, for the whole app. */
/**
 * The current time, refreshed every minute and whenever the app comes back to the foreground –
 * an app left open (or in the background) overnight moves on to the new day by itself.
 */
function useClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 60_000);
    const vis = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('focus', tick);
    window.addEventListener('pageshow', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', vis); window.removeEventListener('focus', tick); window.removeEventListener('pageshow', tick); };
  }, []);
  return now;
}

export function CtxProvider({ children }: { children: ReactNode }) {
  const clock = useClock();
  const profile = useProfile();
  const custom = useCustomExercises();
  const logs = useSessions();
  const tests = useTests();
  const key = todayKey(clock);
  const minute = Math.floor(clock.getTime() / 60_000);
  const stored = useCheckin(key);
  const recent = useRecentCheckins(todayKey(new Date(clock.getTime() - 14 * 864e5)));
  const value = useMemo(() => {
    if (!profile || !logs || !tests || stored === undefined || !recent || !custom) return undefined;
    registerCustom(custom);
    // New day: start from the time and place used last time (not the feeling – that is today's).
    const lastUsed = [...recent].sort((a, b) => b.date.localeCompare(a.date))[0];
    const checkin: CheckIn = stored ?? { date: key, feeling: 'okej', minutes: lastUsed?.minutes ?? 45, place: lastUsed?.place ?? profile.places[0] };
    return { profile, logs, tests, checkin, now: new Date(minute * 60_000), recentCheckins: recent };
  }, [profile, logs, tests, stored, key, recent, minute, custom]);
  return createElement(Ctx.Provider, { value }, children);
}

/** Live context for modules. Undefined only during the first load. */
export const useCtx = () => useContext(Ctx);
