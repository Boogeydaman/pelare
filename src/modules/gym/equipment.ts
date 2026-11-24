// Equipment at each place – kept apart from the planner so the hip programme can use it without an import cycle.
import type { Profile } from '../../core/types';
import type { Exercise, Need } from './exercises';

export const ALL_NEEDS: Need[] = ['barbell', 'machine', 'cable', 'dumbbell', 'bench', 'pullup_bar', 'dip_bars', 'band'];

export function equipmentAt(profile: Profile, place: 'gym' | 'home' | 'travel'): Set<Need> {
  if (place === 'gym') return new Set(ALL_NEEDS);
  if (place === 'travel') return new Set();
  const map: Record<string, Need> = { dumbbell: 'dumbbell', kettlebell: 'dumbbell', band: 'band', pullup_bar: 'pullup_bar', bench: 'bench' };
  return new Set(profile.homeEquipment.map((e) => map[e]).filter(Boolean));
}

export const canDo = (ex: Exercise, eq: Set<Need>) => ex.needs.every((n) => eq.has(n));
