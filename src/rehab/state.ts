// Entering and leaving rehab mode.
import { saveProfile } from '../core/db';
import type { HipAid, HipRehab, Profile } from '../core/types';
import { RUN_PER_WEEK, gymProgramFor, rehabPhase, timePhase, weeksFromSurgery } from '../modules/common';
import { mobilityGoal, type Basics } from '../screens/Basics';

export const inRehab = (p?: Profile | null, now = new Date()) => !!p && rehabPhase(p, now) !== null;

/** What you answered in the basic questions when leaving rehab (the same as in the onboarding). */
export interface LeaveAnswers extends Basics { cleared?: boolean }

/** The answers from the onboarding (or defaults), as a starting point for the questions when leaving rehab. */
export function basicsFrom(p: Profile): Basics {
  return {
    goals: { ...p.goals, run: p.rehab?.cleared ? (p.goals.run === 'walk' ? 'start' : p.goals.run) : 'walk' },
    focus: p.mobilityFocus ?? [], gymDays: p.gymDays ?? 2, places: p.places.length ? p.places : ['gym'], equip: p.homeEquipment,
  };
}

/** The profile after leaving rehab with these answers: normal programmes, rehab saved (ended) for a return. */
export function leftRehab(p: Profile, a: LeaveAnswers, now = new Date()): Profile {
  const at = now.toISOString();
  const r = p.rehab!;
  const run = a.goals.run;
  return {
    ...p,
    rehab: { ...r, ended: true, cleared: r.cleared || (run !== 'walk' && a.cleared !== false) },
    goals: { ...a.goals, mobility: mobilityGoal(a.focus) },
    mobilityFocus: a.focus, gymDays: a.gymDays, daysPerWeek: a.gymDays + (RUN_PER_WEEK[run] ?? 3),
    places: a.places, homeEquipment: a.equip,
    enrollments: {
      ...p.enrollments,
      gym: { programId: gymProgramFor(a.gymDays, a.places, a.equip), startedAt: at },
      run: { programId: run, startedAt: at },
    },
  };
}

/** Back to the main app. Without answers: the onboarding's answers, walking until the surgeon has cleared running. */
export const leaveRehab = (p: Profile, a: LeaveAnswers = basicsFrom(p)) => saveProfile(leftRehab(p, a));

/** Back into rehab mode, keeping the operation details and what you have read. */
export function resumeRehab(p: Profile, rehab?: HipRehab) {
  const now = new Date().toISOString();
  const r: HipRehab = { ...(rehab ?? p.rehab ?? { kind: 'hip', surgery: now.slice(0, 10), side: 'höger', approach: 'okand' }), ended: false };
  return saveProfile({ ...p, rehab: r, goals: { ...p.goals, run: 'walk' }, enrollments: { ...p.enrollments, gym: { programId: 'hip_rehab', startedAt: now }, run: { programId: 'walk', startedAt: now } } });
}

export const markRead = (p: Profile, id: string) =>
  p.rehab && !(p.rehab.read ?? []).includes(id) ? saveProfile({ ...p, rehab: { ...p.rehab, read: [...(p.rehab.read ?? []), id] } }) : Promise.resolve();

const patch = (p: Profile, r: Partial<HipRehab>) => saveProfile({ ...p, rehab: { ...p.rehab!, ...r } });

/**
 * Profiles from before the criteria: keep the phase the calendar gave, and let the criteria decide from now on.
 * Returns null when nothing needs saving.
 */
export function migratedPassed(p: Profile, now = new Date()): Record<number, string> | null {
  const r = p.rehab;
  if (!r || r.passed) return null;
  const ph = timePhase(weeksFromSurgery(p, now));
  const passed: Record<number, string> = {};
  for (let n = 1; n < ph; n++) passed[n] = now.toISOString().slice(0, 10);
  return passed;
}
export const migrateRehab = (p: Profile, now = new Date()) => {
  const passed = migratedPassed(p, now);
  return passed ? patch(p, { passed }) : Promise.resolve();
};

/** You meet phase n's criteria. */
export const confirmPhase = (p: Profile, n: number) =>
  patch(p, { passed: { ...(p.rehab?.passed ?? {}), [n]: new Date().toISOString().slice(0, 10) }, holdPhase: undefined });
/** Back one phase: the last confirmed criteria are undone. */
export function undoPhase(p: Profile) {
  const passed = { ...(p.rehab?.passed ?? {}) };
  const last = Math.max(0, ...Object.keys(passed).map(Number));
  if (last) delete passed[last];
  return patch(p, { passed, holdPhase: undefined });
}
export const setAid = (p: Profile, aid: HipAid) => patch(p, { aid });
export const togglePrep = (p: Profile, id: string) => {
  const prep = p.rehab?.prep ?? [];
  return patch(p, { prep: prep.includes(id) ? prep.filter((x) => x !== id) : [...prep, id] });
};
export const setRehab = (p: Profile, r: Partial<HipRehab>) => patch(p, r);
