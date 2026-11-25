import { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';
const KEY = 'pelare.theme';

/** The theme you chose in Settings, or null if you never chose. */
function stored(): Theme | null {
  try { return (localStorage.getItem(KEY) as Theme) || null; } catch { return null; }
}

// Dark is the default look. Rehab mode keeps following the system unless you have chosen a theme.
let rehab = false;
const effective = (t: Theme | null): Theme => t ?? (rehab ? 'system' : 'dark');

function apply(t: Theme) {
  const root = document.documentElement;
  if (t === 'system') delete root.dataset.theme; else root.dataset.theme = t;
  const rgb = getComputedStyle(root).getPropertyValue('--paper').trim().split(/\s+/).join(',');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', `rgb(${rgb})`);
}

apply(effective(stored()));

/** Called by the layout when rehab mode turns on or off. */
export function setRehabTheme(on: boolean) {
  if (on === rehab) return;
  rehab = on;
  apply(effective(stored()));
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [t, setT] = useState<Theme>(() => effective(stored()));
  const choose = (v: Theme) => {
    try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
    setT(v);
  };
  useEffect(() => { apply(t); }, [t]);
  return [t, choose];
}
