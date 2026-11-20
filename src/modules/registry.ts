import type { ModuleId } from '../core/types';
import { gym } from './gym';
import { mobility } from './mobility';
import { run } from './run';
import type { TrainingModule } from './types';

/** All modules, in tab order. Add a module here and it appears everywhere. */
export const MODULE_LIST: TrainingModule[] = [gym, run, mobility];

export const MODULE: Record<ModuleId, TrainingModule> = { gym, run, mobility };

export const bySlug = (slug?: string) => MODULE_LIST.find((m) => m.slug === slug);
