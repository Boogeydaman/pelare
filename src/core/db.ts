import Dexie, { type Table } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import type { CheckIn, LogData, LogModule, PlannedSession, Profile, SessionLog, TestResult } from './types';

interface KV { key: string; value: unknown }

/** The session that is running right now, so a reload does not lose it. */
export interface ActiveSession { plan: PlannedSession; startedAt: number; from: string; result?: LogData; finishedAt?: number }

class PelareDB extends Dexie {
  kv!: Table<KV, string>;
  sessions!: Table<SessionLog, string>;
  tests!: Table<TestResult, string>;
  checkins!: Table<CheckIn, string>;

  constructor() {
    super('pelare');
    this.version(1).stores({
      kv: 'key',
      sessions: 'id, module, startedAt',
      tests: 'id, module, testId, date',
      checkins: 'date',
    });
  }
}

export const db = new PelareDB();

// Ask the browser to keep the data even under storage pressure.
try { navigator.storage?.persist?.(); } catch { /* ignore */ }

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

// ---------- Key/value ----------

async function getKV<T>(key: string): Promise<T | undefined> {
  return (await db.kv.get(key))?.value as T | undefined;
}
const setKV = (key: string, value: unknown) => db.kv.put({ key, value });

// ---------- Hooks ----------
// useLiveQuery returns undefined while loading; callers treat undefined as "not ready yet".

export const useProfile = () => useLiveQuery(async () => (await getKV<Profile>('profile')) ?? null, []);
export const useActive = () => useLiveQuery(async () => (await getKV<ActiveSession>('active')) ?? null, []);

export function useSessions(module?: LogModule) {
  return useLiveQuery(async () => {
    const rows = module ? await db.sessions.where('module').equals(module).toArray() : await db.sessions.toArray();
    return rows.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }, [module]);
}

export const useSession = (id?: string) => useLiveQuery(async () => (id ? (await db.sessions.get(id)) ?? null : null), [id]);

export const useTests = (module?: string) =>
  useLiveQuery(async () => {
    const rows = module ? await db.tests.where('module').equals(module).toArray() : await db.tests.toArray();
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [module]);

export const useRecentCheckins = (fromDate: string) => useLiveQuery(async () => db.checkins.where('date').aboveOrEqual(fromDate).toArray(), [fromDate]);

export const useCheckin = (date: string) => useLiveQuery(async () => (await db.checkins.get(date)) ?? null, [date]);

// ---------- Writes ----------

export const saveProfile = (p: Profile) => setKV('profile', p);
export const setActive = (a: ActiveSession | null) => (a ? setKV('active', a) : db.kv.delete('active'));
export const saveSession = (s: SessionLog) => db.sessions.put(s);
export const deleteSession = (id: string) => db.sessions.delete(id);
export const saveTest = (t: TestResult) => db.tests.put(t);
export const saveCheckin = (c: CheckIn) => db.checkins.put(c);

export async function removeSampleData() {
  await db.sessions.filter((s) => !!s.sample).delete();
  await db.tests.filter((t) => !!t.sample).delete();
}

export async function resetAll() {
  await Promise.all([db.kv.clear(), db.sessions.clear(), db.tests.clear(), db.checkins.clear()]);
  try { ['pelare.gymplayer', 'pelare.installHidden'].forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
}

export async function exportAll() {
  const data = {
    version: 1,
    profile: await getKV<Profile>('profile'),
    sessions: await db.sessions.toArray(),
    tests: await db.tests.toArray(),
    checkins: await db.checkins.toArray(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pelare-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importAll(file: File): Promise<boolean> {
  try {
    const d = JSON.parse(await file.text());
    if (!Array.isArray(d.sessions)) return false;
    await resetAll();
    if (d.profile) await saveProfile(d.profile);
    await db.sessions.bulkPut(d.sessions);
    await db.tests.bulkPut(d.tests ?? []);
    await db.checkins.bulkPut(d.checkins ?? []);
    return true;
  } catch {
    return false;
  }
}
