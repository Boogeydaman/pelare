// Training after a hip replacement: five phases from the weeks since surgery. Built from the Swedish
// care pathway for hip replacement (vårdförlopp) and 1177, institutional protocols (Mass General
// Brigham), and the long-term programme of a physical therapist with his own hip replacement (level D).
// The surgeon's and physical therapist's instructions always come first.
import type { HipApproach, PlannedSession, Profile, SessionLog } from '../../core/types';
import { REHAB_PHASES, rehabPhase, weeksSinceSurgery } from '../common';
import type { ModuleCtx } from '../types';
import type { SessionTemplate, Slot } from './programs';

const s = (ex: string, sets: number, reps?: [number, number], note?: string): Slot => ({ ex, sets, reps, note });
const PER_SIDE = 'Gör båda sidorna.';

/** Two sessions per phase (A/B), alternating. Phase 1 is a short daily programme. */
export const HIP_PHASES: Record<number, SessionTemplate[]> = {
  1: [
    { type: 'hip1_a', title: 'Höftrehab: dagligt program', slots: [s('ankle_pumps', 3, [15, 25]), s('quad_set', 2, [8, 12], 'Håll 5 s.'), s('glute_squeeze', 2, [8, 12], 'Håll 5 s.'), s('heel_slide', 2, [8, 12]), s('short_arc_quad', 2, [10, 15])] },
  ],
  2: [
    { type: 'hip2_a', title: 'Höftrehab: rörelse och gång A', slots: [s('bridge_bw', 3, [8, 12]), s('sit_to_stand', 3, [8, 12], 'Hög stol, ta hjälp av händerna om det behövs.'), s('standing_hip_flex', 2, [8, 12], PER_SIDE), s('standing_hip_ext', 2, [8, 12], PER_SIDE), s('calf_bw', 2, [10, 15], 'Håll i något, på plant golv till att börja med.')] },
    { type: 'hip2_b', title: 'Höftrehab: rörelse och gång B', slots: [s('heel_slide', 2, [10, 12]), s('short_arc_quad', 2, [12, 15]), s('bridge_bw', 3, [8, 12]), s('step_up_low', 2, [6, 10], 'Lågt steg, håll i räcket.'), s('standing_hip_abd', 2, [8, 12], PER_SIDE)] },
  ],
  3: [
    { type: 'hip3_a', title: 'Höftrehab: bygga styrka A', slots: [s('staggered_bridge', 3, [8, 12], PER_SIDE), s('sit_to_stand', 3, [8, 15], 'Lägre stol eller en vikt mot bröstet när det blir lätt.'), s('step_up_low', 2, [8, 12]), s('sidelying_abd', 2, [10, 15], PER_SIDE), s('straight_leg_raise', 2, [8, 12], PER_SIDE), s('calf_bw', 2, [12, 20])] },
    { type: 'hip3_b', title: 'Höftrehab: bygga styrka B', slots: [s('bridge_bw', 3, [12, 15]), s('lateral_step_down', 2, [6, 10], PER_SIDE), s('band_walk', 2, [10, 15]), s('standing_hip_flex', 2, [10, 15], 'Med gummiband eller viktmanschett när det blir lätt.'), s('short_side_plank', 2, [15, 30], PER_SIDE)] },
  ],
  4: [
    { type: 'hip4_a', title: 'Höftrehab: styrka A', slots: [s('glute_bridge', 3, [8, 12], PER_SIDE), s('goblet_squat', 3, [8, 12], 'Sätt dig mot en bänk eller stol de första gångerna.'), s('step_up', 2, [8, 10]), s('standing_hip_abd', 2, [10, 15], 'Med gummiband eller kabel.'), s('leg_ext', 2, [10, 15]), s('calf', 2, [10, 15]), s('db_row', 2, [8, 12])] },
    { type: 'hip4_b', title: 'Höftrehab: styrka B', slots: [s('hip_thrust', 3, [8, 12]), s('split_squat', 2, [8, 12], 'Kort steg och hand på något för balansen.'), s('db_rdl', 2, [8, 12], 'Börja med vikten från en upphöjd yta.'), s('lateral_step_down', 2, [8, 12], PER_SIDE), s('leg_curl', 2, [10, 15]), s('short_side_plank', 2, [20, 40], PER_SIDE), s('db_press', 2, [8, 12])] },
  ],
  5: [
    { type: 'hip5_a', title: 'Höftstyrka A', slots: [s('split_squat', 3, [6, 12], 'Med hantlar när kroppsvikt blir lätt.'), s('db_rdl', 3, [6, 12]), s('lateral_step_down', 3, [8, 15], PER_SIDE), s('standing_hip_flex', 2, [10, 15], 'Med vikt eller band.'), s('calf', 3, [8, 15]), s('db_row', 2, [8, 12])] },
    { type: 'hip5_b', title: 'Höftstyrka B', slots: [s('goblet_squat', 3, [6, 12], 'Hälarna på en liten upphöjning ger en mer upprätt överkropp.'), s('hip_thrust', 3, [6, 12], 'Enbens när två ben blir lätt.'), s('leg_ext', 2, [8, 15]), s('leg_curl', 2, [8, 15]), s('side_plank', 2, [20, 45], PER_SIDE), s('db_press', 2, [8, 12])] },
  ],
};

export const ALL_HIP_SESSIONS: SessionTemplate[] = Object.values(HIP_PHASES).flat();
export const isHipSession = (l: Pick<SessionLog, 'type'>) => /^hip\d_/.test(l.type);

/** Movements to leave out while restrictions apply (first 6 weeks or until your surgeon says otherwise). */
function blockedFor(approach: HipApproach, weeks: number): Set<string> {
  if (weeks >= 6) return new Set();
  if (approach === 'sido') return new Set(['standing_hip_abd', 'sidelying_abd']); // gluteus medius is detached and reattached
  return new Set();
}

/** Today's rehab session: the phase's A/B in turn, adapted to approach and to how the last session hurt. */
export function hipTemplate(ctx: ModuleCtx): { tpl: SessionTemplate; index: number } {
  const ph = rehabPhase(ctx.profile, ctx.now) ?? 5;
  const list = HIP_PHASES[ph];
  const done = ctx.logs.filter((l) => l.module === 'gym' && l.type.startsWith(`hip${ph}_`)).length;
  const base = list[done % list.length];
  const blocked = blockedFor(ctx.profile.rehab?.approach ?? 'okand', weeksSinceSurgery(ctx.profile, ctx.now));
  const slots = base.slots.map((sl) => (blocked.has(sl.ex) ? s('glute_squeeze', sl.sets, [8, 12], 'Ersätter benlyft åt sidan – vänta med dem de första 6 veckorna efter sidosnitt.') : sl));
  return { tpl: { ...base, slots }, index: done };
}

/** The last rehab session's pain (0–10), if any. */
export const lastPain = (logs: SessionLog[]) => logs.find((l) => isHipSession(l) && l.pain !== undefined)?.pain;

/** Reasons and adjustments for a rehab session (pain-monitoring model: up to 5/10 is acceptable). */
export function hipAdjust(ctx: ModuleCtx, p: PlannedSession): PlannedSession {
  const ph = rehabPhase(ctx.profile, ctx.now) ?? 5;
  const w = Math.floor(weeksSinceSurgery(ctx.profile, ctx.now));
  const info = REHAB_PHASES[ph - 1];
  const pain = lastPain(ctx.logs);
  const reasons = [
    `Vecka ${w + 1} efter operationen · fas ${ph}: ${info.name.toLowerCase()}.`,
    ph <= 2 ? 'Gå också flera korta promenader under dagen, med kryckor eller rollator så länge du behöver dem.' : ph === 3 ? 'Motionscykel och promenader är bra kondition nu – se löpningsfliken, där finns promenadpassen.' : 'Lägg till vikt eller en svårare variant när du klarar toppen av repintervallet med god kontroll.',
    'Smärta upp till 5 av 10 under passet är okej om den har lagt sig till nästa morgon. Följ alltid din kirurgs och fysioterapeuts råd.',
  ];
  let content = p.content;
  if (pain !== undefined && pain > 5 && content.kind === 'strength') {
    reasons.unshift(`Förra passet gjorde ont (${pain} av 10). I dag ett set färre och lägsta antalet reps – blir det inte bättre, kontakta din fysioterapeut.`);
    content = { ...content, items: content.items.map((i) => ({ ...i, sets: Math.max(1, i.sets - 1), target: i.reps[0] })) };
  }
  return { ...p, content, effort: ph <= 3 ? 'lugnt' : 'medel', reasons: [...reasons.map((text) => ({ text })), ...p.reasons.slice(1)] };
}

/** Restrictions text for the safety card, by approach. */
export function precautions(profile: Profile): string | null {
  const r = profile.rehab;
  if (!r) return null;
  const general = 'Följ de restriktioner du fick vid operationen – de varierar mellan sjukhus och gäller oftast de första 6 veckorna.';
  if (r.approach === 'bakre') return `${general} Vid bakre snitt brukar det vara: böj inte höften mer än 90°, korsa inte benen och vrid inte benet inåt.`;
  if (r.approach === 'sido') return `${general} Vid sidosnitt brukar det vara: inga aktiva benlyft åt sidan och gå med kryckor eller rollator i minst 6 veckor.`;
  if (r.approach === 'framre') return `${general} Vid främre snitt brukar det vara: undvik att sträcka benet bakåt och samtidigt vrida foten utåt.`;
  return general;
}
