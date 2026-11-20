import { useLocation, useNavigate } from 'react-router-dom';
import { setActive } from './db';
import type { PlannedSession } from './types';

/** Start a session from anywhere: it is stored (survives reload) and opened in the player. */
export function useStart() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return async (plan: PlannedSession) => {
    await setActive({ plan, startedAt: Date.now(), from: pathname });
    nav('/pass');
  };
}
