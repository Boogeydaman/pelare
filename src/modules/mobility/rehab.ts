// Which stretches are suitable after a hip replacement, phase by phase. Mobility returns mainly through
// time and strengthening through a large range of motion; forcing deep hip positions early adds risk
// (dislocation precautions the first ~6 weeks) without clear benefit. Deep rotation and split positions
// wait until the surgeon/physio has cleared free training.
import type { Profile } from '../../core/types';
import { rehabCautious, rehabPhase } from '../common';

const ALWAYS = ['upper_trap', 'head_roll', 'chest_opener', 'doorway', 'cross_body', 'wall_slide', 'side_stretch', 'calf_wall'];
// Phase 4 starts after ~6 weeks (restrictions usually end), phase 5 after ~3 months.
const FROM_PHASE: Record<string, number> = {
  supine_ham: 4, cat_cow: 4, hip_flexor: 4, knee_wall: 4, lat_stretch: 4,
  forward_fold: 5, childs_pose: 5, open_book: 5, worlds_greatest: 5, half_split: 5, elephant_walk: 5, down_dog: 5, seated_twist: 5,
};

export function stretchOk(profile: Profile, id: string, now = new Date()): boolean {
  if (!rehabCautious(profile, now)) return true;
  if (ALWAYS.includes(id)) return true;
  const ph = rehabPhase(profile, now) ?? 5;
  return FROM_PHASE[id] !== undefined && ph >= FROM_PHASE[id];
}
