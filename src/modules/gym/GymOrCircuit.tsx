// The gym module's player: sets and reps, or a follow-along workout on the clock.
import type { PlayerProps } from '../types';
import { CircuitPlayer } from './CircuitPlayer';
import { GymPlayer } from './Player';

export function GymOrCircuit(props: PlayerProps) {
  return props.plan.content.kind === 'circuit' ? <CircuitPlayer {...props} /> : <GymPlayer {...props} />;
}
