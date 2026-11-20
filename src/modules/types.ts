import type { LucideIcon } from 'lucide-react';
import type { FC } from 'react';
import type {
  CheckIn, LibraryItem, LogData, Metric, ModuleId, PlannedSession, Profile, ProgramOption, ProgramView,
  QuickStart, SessionLog, TestResult, WeeklyTarget,
} from '../core/types';

/** Everything a module may look at when it plans or summarises. */
export interface ModuleCtx {
  profile: Profile;
  logs: SessionLog[]; // all modules, newest first
  tests: TestResult[]; // all modules, oldest first
  checkin: CheckIn;
  now: Date;
}

export interface PlayerProps {
  plan: PlannedSession;
  onProgress: (p: number) => void;
  onFinish: (data?: LogData) => void;
}

export interface LogFormProps {
  onSave: (log: Pick<SessionLog, 'type' | 'title' | 'minutes' | 'feel' | 'data' | 'note'>) => void;
}

export interface TestDef { id: string; label: string; unit: string; invert?: boolean; how: string }

/** Load a session puts on the body, used by the shared recovery model (0–1 per region). */
export interface Load { legs?: number; upper?: number; hard?: boolean }

/**
 * The contract every training module implements. Idag, Du, the calendar and recovery
 * only talk to modules through this interface, so a new module plugs in without changes elsewhere.
 */
export interface TrainingModule {
  id: ModuleId;
  slug: string; // URL segment
  name: string;
  noun: string; // "gympass", "löppass", "stretchpass"
  icon: LucideIcon;

  // Planning
  nextSession(ctx: ModuleCtx): PlannedSession;
  candidates(ctx: ModuleCtx): PlannedSession[];
  quickStarts(ctx: ModuleCtx): QuickStart[];
  weekly(ctx: ModuleCtx): WeeklyTarget;

  // Programs
  programs: ProgramOption[];
  program(ctx: ModuleCtx): ProgramView;

  // Progress
  metrics(ctx: ModuleCtx): Metric[];
  tests?: TestDef[];

  // Content
  library: { title: string; groups: string[]; items: LibraryItem[] };
  describe(log: SessionLog): string;
  load(log: SessionLog): Load;

  // UI pieces rendered inside shared frames
  Player: FC<PlayerProps>;
  LogForm: FC<LogFormProps>;
  /** Optional extra settings shown on the module's program page (e.g. mobility focus areas). */
  ProgramExtra?: FC;
}
