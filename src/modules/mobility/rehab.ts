// Which stretches are suitable after a hip replacement, phase by phase. Mobility returns mainly through
// time and strengthening through a large range of motion; forcing deep hip positions early adds risk
// (dislocation precautions the first ~6 weeks) without clear benefit. Deep rotation and split positions
// wait until the surgeon/physio has cleared free training.
import type { Profile } from '../../core/types';
import { rehabCautious, rehabPhase } from '../common';

const ALWAYS = ['upper_trap', 'head_roll', 'chest_opener', 'doorway', 'cross_body', 'wall_slide', 'side_stretch', 'calf_wall'];
const FROM_PHASE: Record<string, number> = {
  supine_ham: 3, cat_cow: 3, hip_flexor: 3, knee_wall: 3, lat_stretch: 3,
  forward_fold: 4, childs_pose: 4, open_book: 4, worlds_greatest: 4, half_split: 4, elephant_walk: 4, down_dog: 4, seated_twist: 4,
};

export function stretchOk(profile: Profile, id: string, now = new Date()): boolean {
  if (!rehabCautious(profile, now)) return true;
  if (ALWAYS.includes(id)) return true;
  const ph = rehabPhase(profile, now) ?? 5;
  return FROM_PHASE[id] !== undefined && ph >= FROM_PHASE[id];
}
