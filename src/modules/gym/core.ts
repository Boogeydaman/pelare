// Bålpass: a short core session suggested after every other gym or running session.
// Core muscles recover quickly and respond well to short, frequent work, so 6–10 minutes
// two to three times a week is enough. The three sessions rotate front, sides and back,
// following McGill's "big three" (curl-up/dead bug, side plank, bird dog) plus anti-rotation (H).
import type { PlannedSession, SessionLog } from '../../core/types';
import type { ModuleCtx } from '../types';
import { EX } from './exercises';
import type { SessionTemplate } from './programs';
import { build } from './planner';
import { AB_WORKOUTS, abSession } from './abs';

export const isCore = (l: Pick<SessionLog, 'module' | 'type'>) => l.module === 'gym' && l.type.startsWith('core');

const s = (ex: string, sets = 2, note?: string) => ({ ex, sets, note });
export const CORE: SessionTemplate[] = [
  { type: 'core_a', title: 'Bålpass: framsida och sidor', slots: [s('dead_bug', 2, 'Per sida.'), s('side_plank', 2, 'Per sida.'), s('plank', 2)] },
  { type: 'core_b', title: 'Bålpass: stabilitet', slots: [s('bird_dog', 2, 'Per sida.'), s('pallof_press', 2, 'Per sida.'), s('cable_crunch', 2)] },
  { type: 'core_c', title: 'Bålpass: hela bålen', slots: [s('hanging_knee', 2), s('side_plank', 2, 'Per sida.'), s('dead_bug', 2, 'Per sida.')] },
];

/** The short follow-along ab workouts, in turn (the 20-minute one is a quick start of its own). */
const SHORT_ABS = AB_WORKOUTS.filter((w) => w.minutes <= 10);
export function nextAbWorkout(ctx: ModuleCtx) {
  return SHORT_ABS[ctx.logs.filter((l) => l.module === 'gym' && l.type.startsWith('core_abs')).length % SHORT_ABS.length];
}

/**
 * Next core session in the rotation: sets and reps (front/sides, stability, whole core) take turns with a
 * follow-along workout on the clock – variety, and both strength and endurance for the abs.
 */
export function coreSession(ctx: ModuleCtx): PlannedSession {
  const done = ctx.logs.filter(isCore).length;
  if (done % 2 === 1) return abSession(nextAbWorkout(ctx));
  const tpl = CORE[Math.floor(done / 2) % CORE.length];
  const p = build(ctx, tpl, { minutes: 10, reasons: [
    'Kort bålpass efter vartannat pass – magmusklerna återhämtar sig snabbt och svarar bäst på korta, täta doser.',
    'Roterar mellan framsida, sidor och stabilitet, så hela bålen får sitt varje vecka.',
  ] });
  return { ...p, effort: 'lugnt' };
}

/**
 * Suggest the core session after today's main session when no core work was done in the last ~44 hours
 * (≈ every other session) and the session itself doesn't already train the abs.
 */
export function coreDue(ctx: ModuleCtx, primary: PlannedSession): boolean {
  if (primary.module !== 'gym' && primary.module !== 'run') return false;
  if (primary.module === 'gym' && primary.type.startsWith('core')) return false;
  if (primary.content.kind === 'strength' && primary.content.items.some((i) => EX[i.id]?.primary.includes('abs'))) return false;
  const recent = ctx.logs.some((l) => {
    const dt = ctx.now.getTime() - new Date(l.startedAt).getTime();
    if (dt < 0 || dt > 44 * 3600_000) return false;
    if (isCore(l)) return true;
    return l.data?.kind === 'strength' && l.data.exercises.some((e) => EX[e.id]?.primary.includes('abs'));
  });
  return !recent;
}
