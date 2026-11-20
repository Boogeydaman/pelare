import { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';
const KEY = 'pelare.theme';

function read(): Theme {
  try { return (localStorage.getItem(KEY) as Theme) || 'system'; } catch { return 'system'; }
}

function apply(t: Theme) {
  const root = document.documentElement;
  if (t === 'system') delete root.dataset.theme; else root.dataset.theme = t;
  const rgb = getComputedStyle(root).getPropertyValue('--paper').trim().split(/\s+/).join(',');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', `rgb(${rgb})`);
}

apply(read());

export function useTheme(): [Theme, (t: Theme) => void] {
  const [t, setT] = useState<Theme>(read);
  useEffect(() => { apply(t); try { localStorage.setItem(KEY, t); } catch { /* ignore */ } }, [t]);
  return [t, setT];
}
