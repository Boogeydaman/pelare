// Shared domain types. Modules add their own detail inside `content` (plans) and `data` (logs).

export type ModuleId = 'gym' | 'run' | 'mobility';
export type LogModule = ModuleId | 'other';
export const MODULES: ModuleId[] = ['gym', 'run', 'mobility'];

export type Feeling = 'pigg' | 'okej' | 'trott' | 'sjuk';
export type Place = 'gym' | 'home';
/** Where you train today: a profile place, or travelling with no equipment at all. */
export type Where = Place | 'travel';
export type Effort = 'lugnt' | 'medel' | 'hårt';
export type Feel = 1 | 2 | 3; // lätt, lagom, tungt
export type Equip = 'dumbbell' | 'band' | 'pullup_bar' | 'bench' | 'kettlebell';

export interface Goals {
  gym: 'stronger' | 'muscle' | 'maintain';
  run: 'start' | '5k' | '10k' | '15k' | '20k';
  mobility: 'front_split' | 'side_split' | 'hips' | 'general';
}

/** Extra mobility focus on top of the whole-body base. Empty = whole body only. */
export type MobilityFocus = 'front_split' | 'side_split' | 'hips' | 'shoulders' | 'back' | 'ankles';

export interface Enrollment { programId: string; startedAt: string }

export interface Profile {
  goals: Goals;
  daysPerWeek: number; // total sessions a week (gym + running), kept in step with gymDays and the running program
  /** Gym sessions a week, chosen by the user. Running follows the running program. */
  gymDays?: number;
  places: Place[];
  homeEquipment: Equip[];
  enrollments: Record<ModuleId, Enrollment>;
  mobilityFocus?: MobilityFocus[];
  /** Preferred days for gym and running, 0 = Monday. Empty = spread automatically. */
  trainingDays?: number[];
  /** Start screen: shown when the app starts. Off = skip it; text = your own line, e.g. a goal. */
  splash?: { off?: boolean; text?: string };
  createdAt: string;
}

export interface CheckIn { date: string; feeling: Feeling; minutes: number; place: Where }

// ---------- Plans ----------

export interface Reason { text: string; source?: string }

export interface StrengthItem {
  id: string; name: string; sets: number; reps: [number, number]; kg: number | null;
  step: number; restSec: number; cue: string; bodyweight?: boolean;
  unit?: 'reps' | 'sek'; note?: string; target?: number; // planned reps for the first set
  last?: string; // what was done last time, e.g. "tis 17 nov · 60 kg × 8, 8, 7"
  aim?: string; // what to aim for today, e.g. "62,5 kg × 6–8"
  plateau?: string; // a tip when the exercise has stalled
  warmup?: { kg: number; reps: number }[]; // ramp-up sets before the first working set
}
export interface RunSegment { label: string; seconds: number; effort: 'gå' | 'lugnt' | 'hårt' | 'vila' }
export interface HoldItem { id: string; name: string; seconds: number; sides: 1 | 2; rounds: number; cue: string }

export type Content =
  | { kind: 'strength'; items: StrengthItem[] }
  | { kind: 'run'; segments: RunSegment[] }
  | { kind: 'mobility'; holds: HoldItem[] }
  | { kind: 'rest'; text: string };

export interface PlannedSession {
  id: string;
  module: ModuleId | 'rest';
  type: string; // module-specific, e.g. 'upper', 'easy', 'front_split'
  title: string;
  minutes: number;
  effort: Effort;
  summary: string;
  reasons: Reason[];
  content: Content;
  penalty?: number; // 0–1, lowers the coach's score (e.g. muscles not recovered)
}

// ---------- Logs ----------

export interface SetResult { kg: number; reps: number }
export interface ExerciseResult { id: string; name: string; sets: SetResult[]; feel?: Feel; unit?: 'sek' }

export type LogData =
  | { kind: 'strength'; exercises: ExerciseResult[] }
  | { kind: 'run'; distanceKm?: number; segmentsDone?: number }
  | { kind: 'mobility'; holdsDone: number }
  | { kind: 'other'; activity: string };

export interface SessionLog {
  id: string;
  module: LogModule;
  type: string;
  title: string;
  startedAt: string; // ISO
  minutes: number;
  feel?: Feel;
  note?: string;
  data?: LogData;
  plan?: PlannedSession; // snapshot, for "Kör igen"
  replaces?: ModuleId; // "Jag tränade något annat i dag": counts as that pillar's session
  sample?: boolean; // seeded example data
}

export interface TestResult {
  id: string; module: ModuleId; testId: string; value: number; unit: string; date: string; sample?: boolean;
}

// ---------- Views ----------

export interface Metric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  change?: string;
  series?: number[];
  invert?: boolean; // lower is better
  bars?: { label: string; value: number; target: number }[];
}

export interface Milestone { label: string; done: boolean }

export interface ProgramOption { id: string; name: string; description: string; weeks: number; perWeek: number }

export interface ProgramView {
  program: ProgramOption;
  week: number; // 1-based
  label: string; // "Block 2 · vecka 3 av 6"
  thisWeek: { title: string; done: boolean }[];
  milestones: Milestone[];
}

export interface LibraryItem {
  id: string;
  name: string;
  group: string;
  meta: string; // short line, e.g. "Bröst · skivstång"
  tips: string[];
  extra?: { label: string; value: string; to?: string }[];
  anim?: string; // stick-figure animation key
  how?: string[]; // step-by-step instructions
}

export interface QuickStart { id: string; label: string; hint: string; session?: PlannedSession; to?: string }

export interface WeeklyTarget { done: number; target: number; unit: 'pass' | 'dagar' }
