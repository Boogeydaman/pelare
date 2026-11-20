// Example history so every screen has something to show in the shell. Marked `sample` so it can be removed.
import { db, uid } from './db';
import type { ExerciseResult, Profile, SessionLog, TestResult } from './types';

const ago = (days: number, hour = 17) => {
  const d = new Date(Date.now() - days * 864e5);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const lift = (id: string, name: string, kg: number, reps: number, sets = 3): ExerciseResult => ({ id, name, sets: Array.from({ length: sets }, () => ({ kg, reps })), feel: 2 });

export async function seedSamples(profile: Profile) {
  const sessions: SessionLog[] = [];
  const tests: TestResult[] = [];
  // Six weeks of a steady routine with gentle progression.
  for (let w = 5; w >= 0; w--) {
    const base = w * 7;
    const sq = 60 + (5 - w) * 2.5;
    const be = 45 + (5 - w) * 2.5;
    sessions.push(
      { id: uid(), module: 'gym', type: 'full_a', title: 'Helkropp A', startedAt: ago(base + 6), minutes: 48, feel: 2, sample: true,
        data: { kind: 'strength', exercises: [lift('squat', 'Knäböj med skivstång', sq, 8), lift('incline_bench', 'Lutande bänkpress', be, 8), lift('cs_row', 'Bröststödd rodd', 40, 12), lift('lateral_cable', 'Sidolyft i kabel', 7.5, 15, 2)] } },
      { id: uid(), module: 'run', type: profile.goals.run === 'start' ? 'walkrun' : 'easy', title: profile.goals.run === 'start' ? 'Gå-spring' : 'Lugn runda', startedAt: ago(base + 5), minutes: 24 + (5 - w) * 2, feel: 2, sample: true,
        data: { kind: 'run', distanceKm: 3 + (5 - w) * 0.3 } },
      { id: uid(), module: 'mobility', type: profile.goals.mobility, title: 'Stretch', startedAt: ago(base + 4, 20), minutes: 15, feel: 1, sample: true, data: { kind: 'mobility', holdsDone: 12 } },
      { id: uid(), module: 'gym', type: 'full_b', title: 'Helkropp B', startedAt: ago(base + 3), minutes: 46, feel: 2, sample: true,
        data: { kind: 'strength', exercises: [lift('rdl', 'Rumänsk marklyft', 55 + (5 - w) * 2.5, 8), lift('dips', 'Dips', 0, 8 + Math.floor((5 - w) / 2)), lift('pullup', 'Pull-ups', 0, 4 + Math.floor((5 - w) / 2)), lift('preacher_curl', 'Preachercurl', 20, 10, 2)] } },
      { id: uid(), module: 'mobility', type: profile.goals.mobility, title: 'Stretch', startedAt: ago(base + 2, 20), minutes: 12, feel: 1, sample: true, data: { kind: 'mobility', holdsDone: 9 } },
    );
    if (w % 2 === 0) {
      const testId = profile.goals.mobility === 'side_split' ? 'split_side' : profile.goals.mobility === 'front_split' ? 'split_front' : 'knee_wall';
      tests.push({ id: uid(), module: 'mobility', testId, value: testId === 'knee_wall' ? 8 + (5 - w) : 34 - (5 - w) * 1.5, unit: 'cm', date: ago(base + 1), sample: true });
    }
  }
  // Drop anything that would land in the future (early in the week).
  const now = Date.now();
  await db.sessions.bulkPut(sessions.filter((s) => new Date(s.startedAt).getTime() < now));
  await db.tests.bulkPut(tests.filter((t) => new Date(t.date).getTime() < now));
}
