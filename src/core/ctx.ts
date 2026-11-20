import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';
import type { ModuleCtx } from '../modules/types';
import { useCheckin, useProfile, useRecentCheckins, useSessions, useTests } from './db';
import type { CheckIn } from './types';

export const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const Ctx = createContext<ModuleCtx | undefined>(undefined);

/** Loads profile, logs, tests and today's check-in once, live, for the whole app. */
export function CtxProvider({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const logs = useSessions();
  const tests = useTests();
  const key = todayKey();
  const stored = useCheckin(key);
  const recent = useRecentCheckins(todayKey(new Date(Date.now() - 14 * 864e5)));
  const value = useMemo(() => {
    if (!profile || !logs || !tests || stored === undefined || !recent) return undefined;
    // New day: start from the time and place used last time (not the feeling – that is today's).
    const lastUsed = [...recent].sort((a, b) => b.date.localeCompare(a.date))[0];
    const checkin: CheckIn = stored ?? { date: key, feeling: 'okej', minutes: lastUsed?.minutes ?? 45, place: lastUsed?.place ?? profile.places[0] };
    return { profile, logs, tests, checkin, now: new Date(), recentCheckins: recent };
  }, [profile, logs, tests, stored, key, recent]);
  return createElement(Ctx.Provider, { value }, children);
}

/** Live context for modules. Undefined only during the first load. */
export const useCtx = () => useContext(Ctx);
