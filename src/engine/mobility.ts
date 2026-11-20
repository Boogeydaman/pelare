import { RULES } from './rules';
import type { Joint, MobilityGoal, MobilityItem, MobilityPlan, SessionLog } from './types';

export type Area = 'hamstrings' | 'hip_flexors' | 'adductors' | 'glutes' | 'calves' | 'shoulders' | 'thoracic';

export const AREA_NAMES: Record<Area, string> = {
  hamstrings: 'Baksida lår', hip_flexors: 'Höftböjare', adductors: 'Insida lår', glutes: 'Säte/höft',
  calves: 'Vader/fotled', shoulders: 'Axlar', thoracic: 'Bröstrygg',
};

export interface Stretch {
  id: string;
  name: string;
  areas: Area[];
  perSide: boolean;
  dynamic?: boolean; // dynamic drills use a fixed 40 s
  load: Partial<Record<Joint, 0 | 1 | 2>>;
  cue: string;
}

export const STRETCHES: Stretch[] = [
  // Front split
  { id: 'couch', name: 'Soffstretch', areas: ['hip_flexors'], perSide: true, load: { knee: 1 }, cue: 'Bakre knät mot väggen, spänn sätet och res överkroppen.' },
  { id: 'low_lunge', name: 'Lågt utfall', areas: ['hip_flexors'], perSide: true, load: { knee: 1 }, cue: 'Skjut höften framåt, bakre knät på en kudde.' },
  { id: 'half_split', name: 'Halv splitt', areas: ['hamstrings'], perSide: true, load: {}, cue: 'Främre benet rakt, tårna upp, fäll framåt med rak rygg.' },
  { id: 'split_slide', name: 'Splittglid med stöd', areas: ['hamstrings', 'hip_flexors'], perSide: true, load: { hip: 1 }, cue: 'Block eller stolar under händerna. Glid ner tills det drar – inte smärtar.' },
  { id: 'pigeon', name: 'Duvan', areas: ['glutes'], perSide: true, load: { knee: 1, hip: 1 }, cue: 'Främre smalbenet snett framför dig, sjunk ner med höften i våg.' },
  { id: 'forward_fold', name: 'Stående framåtfällning', areas: ['hamstrings'], perSide: false, load: { back: 1 }, cue: 'Mjuka knän, låt överkroppen hänga tungt.' },
  // Side split
  { id: 'frog', name: 'Grodan', areas: ['adductors'], perSide: false, load: { knee: 1, hip: 1 }, cue: 'Knäna brett isär på mjukt underlag, gunga försiktigt bakåt.' },
  { id: 'butterfly', name: 'Fjärilen', areas: ['adductors'], perSide: false, load: {}, cue: 'Fotsulorna ihop, rak rygg, luta framåt från höften.' },
  { id: 'straddle', name: 'Sittande bred fällning', areas: ['adductors', 'hamstrings'], perSide: false, load: { back: 1 }, cue: 'Benen brett, tårna upp, gå fram med händerna.' },
  { id: 'side_lunge', name: 'Sidoutfall, håll', areas: ['adductors'], perSide: true, load: { knee: 1 }, cue: 'Raka benet sträckt, sätet bakåt och ner.' },
  { id: 'cossack', name: 'Kosackböj', areas: ['adductors', 'hip_flexors'], perSide: false, dynamic: true, load: { knee: 1 }, cue: 'Byt sida långsamt, så djupt det går med hälen i golvet.' },
  { id: 'horse_stance', name: 'Ryttarställning', areas: ['adductors', 'glutes'], perSide: false, load: { knee: 1 }, cue: 'Bred knäböj, tryck knäna utåt, håll.' },
  // General
  { id: 'worlds_greatest', name: 'Världens bästa stretch', areas: ['hip_flexors', 'thoracic', 'hamstrings'], perSide: false, dynamic: true, load: {}, cue: 'Utfall, armbågen mot golvet, rotera upp mot taket. Byt sida.' },
  { id: 'ninety_ninety', name: '90/90-höftbyte', areas: ['glutes'], perSide: false, dynamic: true, load: { hip: 1 }, cue: 'Sitt med båda knäna i 90°, vrid över till andra sidan.' },
  { id: 'knee_wall', name: 'Knä mot vägg', areas: ['calves'], perSide: true, load: { foot: 1 }, cue: 'Hälen i golvet, för knät mot väggen.' },
  { id: 'calf_wall', name: 'Vadstretch mot vägg', areas: ['calves'], perSide: true, load: { foot: 1 }, cue: 'Bakre benet rakt, hälen i golvet.' },
  { id: 'open_book', name: 'Öppna boken', areas: ['thoracic', 'shoulders'], perSide: true, load: {}, cue: 'Ligg på sidan, öppna övre armen över till andra sidan.' },
  { id: 'wall_slide', name: 'Axelflexion mot vägg', areas: ['shoulders'], perSide: false, load: { shoulder: 1 }, cue: 'Ryggen mot väggen, för armarna upp utan att svanka.' },
  { id: 'doorway', name: 'Bröststretch i dörröppning', areas: ['shoulders'], perSide: true, load: { shoulder: 1 }, cue: 'Underarmen mot karmen, vrid bort kroppen.' },
  { id: 'childs_pose', name: 'Barnets position', areas: ['thoracic', 'shoulders'], perSide: false, load: { knee: 1 }, cue: 'Sätet mot hälarna, sträck armarna långt fram.' },
];

export const STRETCH_BY_ID: Record<string, Stretch> = Object.fromEntries(STRETCHES.map((s) => [s.id, s]));

export interface Routine { id: string; title: string; goal: MobilityGoal; stretches: string[]; measure: ('front' | 'side')[] }

export const ROUTINES: Routine[] = [
  { id: 'front_split', title: 'Splitt framåt', goal: 'front_split', stretches: ['worlds_greatest', 'couch', 'half_split', 'low_lunge', 'pigeon', 'split_slide', 'forward_fold'], measure: ['front'] },
  { id: 'side_split', title: 'Sidosplitt', goal: 'side_split', stretches: ['cossack', 'butterfly', 'frog', 'side_lunge', 'horse_stance', 'straddle'], measure: ['side'] },
  { id: 'general', title: 'Rörlighet hela kroppen', goal: 'general', stretches: ['worlds_greatest', 'ninety_ninety', 'knee_wall', 'open_book', 'wall_slide', 'calf_wall', 'doorway', 'childs_pose'], measure: [] },
];

export const ROUTINE_BY_ID: Record<string, Routine> = Object.fromEntries(ROUTINES.map((r) => [r.id, r]));

export const GOAL_AREAS: Record<MobilityGoal, Area[]> = {
  front_split: ['hamstrings', 'hip_flexors'],
  side_split: ['adductors'],
  general: ['glutes', 'calves', 'thoracic', 'shoulders'],
};

const TRANSITION_SEC = 15;

function itemSeconds(i: MobilityItem): number {
  return i.sets * (i.sec * (i.perSide ? 2 : 1) + TRANSITION_SEC);
}

export function mobilityMinutes(items: MobilityItem[]): number {
  return Math.round(items.reduce((s, i) => s + itemSeconds(i), 0) / 60);
}

/** Hold time and sets grow with the number of sessions done for this routine. */
export function holdFor(sessionsDone: number): { sec: number; sets: number } {
  const p = RULES.mobilityProgression.value;
  const step = Math.min(p.holdSteps.length - 1, Math.floor(sessionsDone / p.sessionsPerStep));
  return { sec: p.holdSteps[step], sets: sessionsDone >= p.extraSetAfter ? 3 : 2 };
}

export function routineCount(sessions: SessionLog[], routineId: string): number {
  return sessions.filter((s) => s.mobility?.routineId === routineId).length;
}

function painBlocked(s: Stretch, pain: Joint[]): boolean {
  return pain.some((j) => (s.load[j] ?? 0) >= 1);
}

/**
 * Builds a stretch session for a routine that fits within `targetMin`.
 * `kind` 'cooldown' and 'micro' use only static holds from the routine, fewer sets.
 */
export function buildMobility(
  routineId: string,
  targetMin: number,
  sessions: SessionLog[],
  pain: Joint[],
  kind: 'full' | 'micro' | 'cooldown' = 'full',
): MobilityPlan | null {
  const routine = ROUTINE_BY_ID[routineId];
  if (!routine) return null;
  const done = routineCount(sessions, routineId);
  const { sec, sets } = holdFor(done);
  const candidates = routine.stretches
    .map((id) => STRETCH_BY_ID[id])
    .filter((s) => !painBlocked(s, pain))
    .filter((s) => (kind === 'full' ? true : !s.dynamic));
  if (candidates.length === 0) return null;

  const items: MobilityItem[] = [];
  const baseSets = kind === 'full' ? sets : 1;
  for (const s of candidates) {
    const item: MobilityItem = {
      exerciseId: s.id, name: s.name, sec: s.dynamic ? 40 : sec, sets: s.dynamic ? 1 : baseSets,
      perSide: s.perSide, cue: s.cue,
    };
    if (mobilityMinutes([...items, item]) > targetMin && items.length >= 2) break;
    items.push(item);
  }
  // Fill remaining time with extra rounds of the static holds (max 3 sets).
  let guard = 0;
  while (guard++ < 20) {
    const next = items.find((i) => !STRETCH_BY_ID[i.exerciseId].dynamic && i.sets < 3);
    if (!next) break;
    next.sets++;
    if (mobilityMinutes(items) > targetMin) { next.sets--; break; }
  }
  const areas = Array.from(new Set(items.flatMap((i) => STRETCH_BY_ID[i.exerciseId].areas)));
  const titlePrefix = kind === 'micro' ? 'Mikropass: ' : kind === 'cooldown' ? 'Avslutning: ' : '';
  return {
    kind: 'mobility', routineId, title: titlePrefix + routine.title.toLowerCase().replace(/^./, (c) => c.toUpperCase()),
    items, minutes: Math.max(1, mobilityMinutes(items)), areas,
    measureSplit: kind === 'full' ? routine.measure : [],
  };
}
