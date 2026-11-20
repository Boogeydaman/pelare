// Domain types for the engine. No UI dependencies.

export type Pillar = 'strength' | 'run' | 'mobility' | 'rest';

export type Muscle =
  | 'chest' | 'upper_back' | 'lats' | 'front_delt' | 'side_delt' | 'rear_delt'
  | 'biceps' | 'triceps' | 'forearms' | 'abs' | 'lower_back' | 'glutes'
  | 'quads' | 'hamstrings' | 'adductors' | 'calves';

export type Joint = 'shoulder' | 'elbow' | 'back' | 'hip' | 'knee' | 'foot';
export type Equip = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bench' | 'pullup_bar' | 'band';
export type Location = 'gym' | 'home';
export type Feeling = 'pigg' | 'okej' | 'trott';
export type Feel = 'latt' | 'lagom' | 'tungt';
export type Level = 'beginner' | 'intermediate';
export type RunLevel = 'none' | 'some' | 'regular';
export type Focus = 'balanced' | 'strength' | 'run' | 'mobility';
export type MobilityGoal = 'front_split' | 'side_split' | 'general';

export type Pattern =
  | 'squat' | 'hinge' | 'lunge' | 'knee_flexion' | 'calf' | 'glute'
  | 'hpush' | 'vpush' | 'hpull' | 'vpull' | 'chest_iso' | 'lateral'
  | 'rear_delt' | 'biceps' | 'triceps' | 'core';

export type StrengthTemplate = 'full' | 'upper' | 'lower';
export type RunKind = 'walk_run' | 'easy' | 'interval' | 'long';

export interface Profile {
  level: Level;
  runLevel: RunLevel;
  focus: Focus;
  daysPerWeek: number;
  mobilityGoals: MobilityGoal[];
  locations: Location[];
  homeEquipment: Equip[];
  createdAt: string; // ISO
}

export interface SetLog { kg: number; reps: number; done: boolean }

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
  repRange: [number, number];
  targetRir: number;
  feel?: Feel;
  isMain: boolean;
}

export interface RunLog {
  kind: RunKind;
  minutes: number;
  distanceKm?: number;
  feel?: Feel;
  stage?: number;
}

export interface MobilityLog {
  routineId: string;
  minutes: number;
  areas: string[];
  splitCm?: { front?: number; side?: number };
}

export interface SessionLog {
  id: string;
  date: string; // ISO, when the session was finished
  pillar: Pillar;
  title: string;
  minutes: number;
  hard: boolean;
  deload?: boolean;
  strength?: { template: StrengthTemplate; exercises: ExerciseLog[] };
  run?: RunLog;
  mobility?: MobilityLog; // standalone session or cooldown add-on
}

export interface CheckIn {
  date: string; // ISO
  feeling: Feeling;
  timeMin: number;
  location: Location;
  pain: Joint[];
}

export interface BlockState {
  startDate: string;
  index: number;
  picks: Record<string, string>; // `${location}:${pattern}` -> exerciseId
}

export interface Today {
  feeling: Feeling;
  timeMin: number;
  location: Location;
  pain: Joint[];
}

export interface EngineInput {
  profile: Profile;
  sessions: SessionLog[];
  checkins: CheckIn[];
  block?: BlockState;
  deloadStart?: string;
  now: Date;
  today: Today;
}

// ---------- Output ----------

export interface Reason { text: string; rules: string[] }

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  repRange: [number, number];
  unit: 'reps' | 'sek';
  targetRir: number;
  kg: number | null; // null = calibrate
  prefillReps: number;
  restSec: number;
  isMain: boolean;
  note?: string;
  bodyweight: boolean;
  increment: number;
}

export interface MobilityItem {
  exerciseId: string;
  name: string;
  sec: number;
  sets: number;
  perSide: boolean;
  cue: string;
}

export interface MobilityPlan {
  kind: 'mobility';
  routineId: string;
  title: string;
  items: MobilityItem[];
  minutes: number;
  areas: string[];
  measureSplit: ('front' | 'side')[];
}

export interface StrengthPlan {
  kind: 'strength';
  template: StrengthTemplate;
  deload: boolean;
  supersets: boolean;
  warmup: { generalMin: number; ramp: { pct: number; reps: number }[] };
  exercises: PlannedExercise[];
  minutes: number;
  cooldown?: MobilityPlan;
}

export interface RunStep { label: string; minutes: number; intensity: 'gå' | 'lätt' | 'hårt' | 'vila' }

export interface RunPlan {
  kind: 'run';
  runKind: RunKind;
  steps: RunStep[];
  minutes: number;
  estKm?: number;
  intensityText: string;
  stage?: number;
  cooldown?: MobilityPlan;
}

export interface RestPlan { kind: 'rest'; minutes: number; text: string; cooldown?: MobilityPlan }

export type Plan = StrengthPlan | RunPlan | MobilityPlan | RestPlan;

export interface Suggestion {
  id: string;
  pillar: Pillar;
  title: string;
  minutes: number;
  hard: boolean;
  score: number;
  reasons: Reason[];
  plan: Plan;
}

export interface EngineOutput {
  best: Suggestion;
  alternatives: Suggestion[];
  notes: Reason[]; // global notes: exclusions, care advice
  careAdvice: Joint[];
  block: BlockState;
  deloadStart?: string;
  ms: number;
}
