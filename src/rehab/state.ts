// Entering and leaving rehab mode.
import { saveProfile } from '../core/db';
import type { HipRehab, Profile } from '../core/types';
import { gymProgramFor, rehabPhase } from '../modules/common';

export const inRehab = (p?: Profile | null, now = new Date()) => !!p && rehabPhase(p, now) !== null;

/** Back to the main app. Running stays as walking until the surgeon has cleared it. */
export function leaveRehab(p: Profile) {
  const now = new Date().toISOString();
  const r = p.rehab!;
  const run = r.cleared ? 'maintain' : 'walk';
  return saveProfile({
    ...p, rehab: { ...r, ended: true },
    goals: { ...p.goals, run: run === 'walk' ? 'walk' : 'start' },
    enrollments: { ...p.enrollments, gym: { programId: gymProgramFor(p.gymDays ?? 2, p.places, p.homeEquipment), startedAt: now }, run: { programId: run, startedAt: now } },
  });
}

/** Back into rehab mode, keeping the operation details and what you have read. */
export function resumeRehab(p: Profile, rehab?: HipRehab) {
  const now = new Date().toISOString();
  const r: HipRehab = { ...(rehab ?? p.rehab ?? { kind: 'hip', surgery: now.slice(0, 10), side: 'höger', approach: 'okand' }), ended: false };
  return saveProfile({ ...p, rehab: r, goals: { ...p.goals, run: 'walk' }, enrollments: { ...p.enrollments, gym: { programId: 'hip_rehab', startedAt: now }, run: { programId: 'walk', startedAt: now } } });
}

export const markRead = (p: Profile, id: string) =>
  p.rehab && !(p.rehab.read ?? []).includes(id) ? saveProfile({ ...p, rehab: { ...p.rehab, read: [...(p.rehab.read ?? []), id] } }) : Promise.resolve();
