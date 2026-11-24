// Training after a hip replacement: prehab before the operation and five criteria-based phases after it.
// Doses and exercises from the user's research report (src/core/sources.ts 49–75): weight-bearing as
// tolerated from day 0, progressive strength early with extra focus on the abductors (they can stay
// ~15 % weaker for 2 years), heavy 4×5 leg press and abduction from about week 3–6 (Husby, Winther), and
// the pain-monitoring model. Adapted to the approach: lateral = no abduction against resistance until
// the surgeon clears it; partial weight-bearing = two-leg exercises. The hospital's instructions come first.
import type { HipApproach, PlannedSession, Profile, SessionLog } from '../../core/types';
import { phaseOf, rehabPhase, weeksFromSurgery, weeksSinceSurgery } from '../common';
import type { ModuleCtx } from '../types';
import { EX } from './exercises';
import { canDo, equipmentAt } from './equipment';
import type { SessionTemplate, Slot } from './programs';

const s = (ex: string, sets: number, reps?: [number, number], note?: string): Slot => ({ ex, sets, reps, note });
const PER_SIDE = 'Gör båda sidorna.';

/** Two sessions per phase (A/B), alternating. Phase 1 is a short programme done 2–3 times a day. 0 = before the operation. */
export const HIP_PHASES: Record<number, SessionTemplate[]> = {
  0: [
    { type: 'hip0_a', title: 'Före operationen A', slots: [s('sit_to_stand', 3, [8, 12]), s('bridge_bw', 2, [10, 12]), s('standing_hip_abd', 3, [10, 15], PER_SIDE), s('step_up_low', 2, [8, 12]), s('straight_leg_raise', 2, [8, 12], PER_SIDE), s('calf_bw', 2, [12, 15])] },
    { type: 'hip0_b', title: 'Före operationen B', slots: [s('box_squat', 3, [8, 12]), s('sidelying_abd', 3, [10, 15], PER_SIDE), s('standing_hip_ext', 2, [10, 15], PER_SIDE), s('single_leg_stance', 2, [20, 30], PER_SIDE), s('heel_slide', 1, [10, 15], 'Lär dig den nu – du gör den dag 1.')] },
  ],
  1: [
    { type: 'hip1_a', title: 'Höftrehab: dagligt program', slots: [s('ankle_pumps', 2, [20, 30], 'Gör dem också varje vaken timme.'), s('quad_set', 1, [10, 10], 'Håll 5–10 s.'), s('glute_squeeze', 1, [10, 10], 'Håll 5–10 s.'), s('heel_slide', 1, [10, 15]), s('supine_abd_slide', 1, [10, 15], 'Utan motstånd.'), s('sit_to_stand', 1, [5, 10], 'Från hög stol.')] },
  ],
  2: [
    { type: 'hip2_a', title: 'Höftrehab: hemprogram A', slots: [s('sit_to_stand', 3, [8, 12], 'Sänk stolen successivt. Lika mycket vikt på båda benen.'), s('standing_hip_abd', 3, [10, 15], PER_SIDE), s('standing_hip_ext', 2, [10, 15], 'Bålen stilla, ingen svank.'), s('bridge_bw', 2, [10, 10]), s('calf_bw', 3, [15, 15], 'Vadpump och balans.')] },
    { type: 'hip2_b', title: 'Höftrehab: hemprogram B', slots: [s('mini_squat', 3, [10, 10], 'Knäna högst 45°.'), s('step_up_low', 2, [10, 10], '10–15 cm. Från ungefär vecka 2.'), s('standing_hip_abd', 3, [10, 15], PER_SIDE), s('standing_hip_ext', 2, [10, 15], PER_SIDE), s('calf_bw', 2, [15, 15])] },
  ],
  3: [
    { type: 'hip3_a', title: 'Höftrehab: styrka A', slots: [s('leg_press', 3, [8, 12], 'Cirka 60–75 % av max – 2–3 reps kvar i reserv. Öka när du klarar 12.'), s('band_abd', 3, [10, 15], PER_SIDE), s('staggered_bridge', 2, [10, 12], PER_SIDE), s('single_leg_stance', 2, [30, 30], 'Per sida. Svårare: blunda eller stå på en kudde.')] },
    { type: 'hip3_b', title: 'Höftrehab: styrka B', slots: [s('box_squat', 3, [10, 10]), s('lateral_step_up', 2, [10, 10], '15–20 cm. Växla mellan framåt och åt sidan, öka höjden.'), s('sidelying_abd', 3, [10, 15], PER_SIDE), s('glute_bridge', 2, [10, 12], 'Enbens – båda sidorna.')] },
  ],
  4: [
    { type: 'hip4_a', title: 'Höftrehab: uppbyggnad A', slots: [s('leg_press', 4, [5, 8], 'Ett ben i taget, tungt: 80–90 % av max (4×5).'), s('cable_hip_abd', 4, [5, 8], 'Tungt.'), s('bulgarian', 2, [8, 10], PER_SIDE), s('calf', 2, [10, 15]), s('db_row', 2, [8, 12])] },
    { type: 'hip4_b', title: 'Höftrehab: uppbyggnad B', slots: [s('hip_thrust', 3, [6, 10]), s('cable_hip_abd', 3, [5, 8], 'Tungt.'), s('split_squat', 2, [8, 10], 'Kort steg, hand på något för balansen.'), s('single_leg_stance', 2, [30, 30], 'Reaktiv: kasta och fånga en boll, eller blunda.'), s('leg_ext', 2, [10, 15]), s('db_press', 2, [8, 12])] },
  ],
  5: [
    { type: 'hip5_a', title: 'Höftstyrka A', slots: [s('leg_press', 4, [5, 8], 'Explosivt upp, kontrollerat ner – kraftutvecklingen kommer tillbaka sist.'), s('cable_hip_abd', 3, [6, 10]), s('bulgarian', 3, [6, 10], PER_SIDE), s('calf', 2, [8, 15]), s('db_row', 2, [8, 12])] },
    { type: 'hip5_b', title: 'Höftstyrka B', slots: [s('step_up', 3, [5, 8], 'Högt tempo upp, kontrollerat ner.'), s('goblet_squat', 2, [6, 10]), s('db_rdl', 2, [6, 10]), s('cable_hip_abd', 3, [6, 10]), s('db_press', 2, [8, 12])] },
  ],
};

export const ALL_HIP_SESSIONS: SessionTemplate[] = Object.values(HIP_PHASES).flat();
export const isHipSession = (l: Pick<SessionLog, 'type'>) => /^hip\d_/.test(l.type);

/** Rehab-friendly substitutes when the equipment is missing (home training), in order. */
const HOME: Record<string, string[]> = {
  leg_press: ['goblet_squat', 'box_squat'],
  cable_hip_abd: ['band_abd', 'sidelying_abd'],
  band_abd: ['standing_hip_abd'],
  hip_thrust: ['glute_bridge'],
  bulgarian: ['split_squat'],
  goblet_squat: ['box_squat'],
  db_rdl: ['sl_rdl'],
  step_up: ['lateral_step_up'],
  calf: ['calf_bw'],
};

/** Abduction against resistance – waits after a lateral approach until the surgeon clears it. */
const RESISTED_ABD = new Set(['band_abd', 'cable_hip_abd', 'sidelying_abd', 'band_walk', 'short_side_plank', 'side_plank']);
/** Standing on one leg – waits while you may only partly bear weight. */
const SINGLE_LEG = new Set(['step_up_low', 'lateral_step_up', 'lateral_step_down', 'single_leg_stance', 'bulgarian', 'split_squat', 'step_up', 'sl_rdl']);

/** Whether resisted abduction is off for now (lateral approach, not yet cleared). */
export const abdBlocked = (profile: Profile) => profile.rehab?.approach === 'sido' && !profile.rehab.abdCleared;

/** Today's rehab session: the phase's A/B in turn, adapted to approach, weight-bearing, equipment and the heavy option. */
export function hipTemplate(ctx: ModuleCtx): { tpl: SessionTemplate; index: number } {
  const ph = rehabPhase(ctx.profile, ctx.now) ?? 5;
  const r = ctx.profile.rehab;
  const list = HIP_PHASES[ph];
  const done = ctx.logs.filter((l) => l.module === 'gym' && l.type.startsWith(`hip${ph}_`)).length;
  const base = list[done % list.length];
  const eq = equipmentAt(ctx.profile, ctx.checkin.place);
  const partial = r?.weightBearing === 'partiell' && ph >= 1;
  const noAbd = abdBlocked(ctx.profile);
  const out: Slot[] = [];
  for (const sl0 of base.slots) {
    let sl = sl0;
    if (noAbd && RESISTED_ABD.has(sl.ex)) {
      sl = s('standing_hip_abd', sl.sets, [10, 15], 'Utan motstånd – sidosnitt: vänta med motstånd tills kirurgen gett klartecken.');
    }
    if (partial && SINGLE_LEG.has(sl.ex)) {
      sl = s(sl.ex === 'single_leg_stance' ? 'glute_squeeze' : 'mini_squat', sl.sets, [8, 12], 'Partiell belastning: på två ben tills kirurgen säger annat.');
    }
    if (EX[sl.ex] && !canDo(EX[sl.ex], eq)) {
      const alt = (HOME[sl.ex] ?? []).find((id) => EX[id] && canDo(EX[id], eq));
      if (alt) sl = { ...sl, ex: alt, reps: undefined, note: sl.ex === 'leg_press' ? 'I stället för benpress. Håll en vikt mot bröstet när det blir lätt.' : sl.note };
    }
    // Heavy strength early (Husby 2009, Winther 2018): 4×5 close to max in leg press and abduction.
    if (r?.heavy && ph === 3 && (sl.ex === 'leg_press' || (sl.ex === 'band_abd' && !noAbd))) {
      sl = sl.ex === 'band_abd' && canDo(EX.cable_hip_abd, eq)
        ? s('cable_hip_abd', 4, [5, 5], 'Tungt: 4×5 nära max. Smärta högst 5 av 10.')
        : { ...sl, sets: 4, reps: [5, 5], note: 'Tungt: 4×5 nära max. Smärta högst 5 av 10.' };
    }
    if (out.some((x) => x.ex === sl.ex)) continue; // a substitute already in the session
    out.push(sl);
  }
  return { tpl: { ...base, slots: out }, index: done };
}

/** The last rehab session's pain (0–10), if any. */
export const lastPain = (logs: SessionLog[]) => logs.find((l) => isHipSession(l) && l.pain !== undefined)?.pain;

/** How much, how often – per phase (research report, part 4). */
export const DOSE: Record<number, string> = {
  0: 'Två–tre pass i veckan före operationen. Starkare före ger snabbare återhämtning efteråt, och du lär dig övningarna innan du har ont.',
  1: 'Gör det korta programmet 2–3 gånger om dagen. Fotpumpar 20–30 gånger varje vaken timme. Gå korta sträckor med rollator eller kryckor och öka efter förmåga.',
  2: 'Hemprogrammet 1–2 gånger om dagen, plus 3–6 promenader på 5–15 minuter. Öka promenaderna med 10–20 % i veckan.',
  3: '3–5 styrkepass i veckan med 2–3 reps kvar i reserv. Öka vikten när du klarar 12 reps med god teknik. Gå 20–40 minuter om dagen och cykla gärna 10–20 minuter.',
  4: 'Tre tunga pass i veckan: 4×5–8 vid 80–90 % av max i benpress och abduktion. Plus 2–3 konditionspass på 20–45 minuter – cykel, crosstrainer, bassäng eller stavgång.',
  5: '2–3 styrkepass i veckan med abduktorer, sätesmuskler och lår i fokus – i 12–24 månader. Lägg till explosiva reps. Kondition 150–300 minuter i veckan.',
};

/** Reasons and adjustments for a rehab session (pain-monitoring model: up to 5/10 is acceptable). */
export function hipAdjust(ctx: ModuleCtx, p: PlannedSession): PlannedSession {
  const ph = rehabPhase(ctx.profile, ctx.now) ?? 5;
  const w = weeksFromSurgery(ctx.profile, ctx.now);
  const info = phaseOf(ph);
  const pain = lastPain(ctx.logs);
  const reasons = [
    ph === 0 ? `${Math.max(1, Math.ceil(-w))} veckor kvar till operationen · förberedelser.` : `Vecka ${Math.floor(w) + 1} efter operationen · fas ${ph}: ${info.name.toLowerCase()}.`,
    DOSE[ph],
    ph === 0 ? 'Gör det som går – artrossmärta upp till 5 av 10 under passet är okej om den lagt sig till nästa dag.' : 'Smärta upp till 5 av 10 under passet är okej om den är tillbaka på din vanliga nivå nästa morgon och svullnaden inte ökar. Följ alltid ditt sjukhus råd.',
  ];
  if (abdBlocked(ctx.profile) && ph >= 1) reasons.splice(2, 0, 'Sidosnitt: abduktion utan motstånd tills din kirurg gett klartecken – markera det under Inställningar när du fått det.');
  let content = p.content;
  const morning = ctx.checkin.hipPain;
  const swollen = ctx.checkin.swelling === true;
  if (((pain !== undefined && pain > 5) || (morning !== undefined && morning >= 6) || swollen) && content.kind === 'strength') {
    reasons.unshift(swollen
      ? 'Höften är mer svullen än i går. I dag ett set färre och lägsta antalet reps, och kyla 15–20 minuter efteråt. Ökar svullnaden flera dagar i rad – kontakta din fysioterapeut.'
      : morning !== undefined && morning >= 6
        ? 'Höften är ömmare i dag än i går kväll. I dag ett set färre och lägsta antalet reps – blir det inte bättre på några dagar, kontakta din fysioterapeut.'
        : `Förra passet gjorde ont (${pain} av 10). I dag ett set färre och lägsta antalet reps – blir det inte bättre, kontakta din fysioterapeut.`);
    content = { ...content, items: content.items.map((i) => ({ ...i, sets: Math.max(1, i.sets - 1), target: i.reps[0] })) };
  }
  return { ...p, content, effort: ph <= 3 ? 'lugnt' : 'medel', reasons: [...reasons.map((text) => ({ text })), ...p.reasons.slice(1)] };
}

/** What the restrictions (if any) mean, by approach – research report part 5. */
export function precautions(profile: Profile, now = new Date()): string | null {
  const r = profile.rehab;
  if (!r || weeksSinceSurgery(profile, now) >= 6 || weeksFromSurgery(profile, now) < 0) return null;
  const ordered = r.restrictions === 'ordinerade';
  const byApproach: Record<HipApproach, string> = {
    bakre: ordered
      ? 'Dina restriktioner (bakre snitt) brukar vara: böj inte höften över 90°, för inte benet förbi mittlinjen och vrid det inte inåt – oftast i 6 veckor.'
      : 'Bakre snitt: undvik extrema kombinationer de första 6 veckorna – djup böj + benet inåt + vridning inåt, som att sitta lågt och vrida dig mot det opererade benet.',
    sido: 'Sidosnitt: skydda abduktorernas sena – ingen abduktion mot motstånd förrän kirurgen gett klartecken (ofta efter 6 veckor), och ingen kraftig bakåtsträckning med utåtvridning.',
    framre: 'Främre snitt: undvik att sträcka benet långt bakåt och samtidigt vrida det utåt, till exempel ett långt kliv bakåt med foten utåt.',
    okand: 'Vet du inte vilket snitt du har? Det står i operationsberättelsen i 1177 Journalen – sök efter "bakre", "posterior", "Hardinge", "lateral" eller "anterior".',
  };
  const lead = ordered ? 'Följ restriktionerna du fick. ' : r.restrictions === 'inga' ? 'Du har inga ordinerade restriktioner. ' : 'Följ ditt sjukhus besked om restriktioner. ';
  return lead + byApproach[r.approach];
}
