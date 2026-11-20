// "Install as app" support. Chrome on Android fires `beforeinstallprompt` when the PWA can be installed;
// we keep the event so a button in the app can open the install dialog.
import { useSyncExternalStore } from 'react';

interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

let deferred: InstallEvent | null = null;
let installed = typeof window !== 'undefined' && (matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

if (typeof window !== 'undefined') {
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as InstallEvent; emit(); });
  addEventListener('appinstalled', () => { installed = true; deferred = null; emit(); });
}

export interface InstallState { installed: boolean; canPrompt: boolean; samsung: boolean; ios: boolean }

let snapshot: InstallState | null = null;
function read(): InstallState {
  const ua = navigator.userAgent;
  const next = { installed, canPrompt: !!deferred, samsung: /SamsungBrowser/i.test(ua), ios: /iPhone|iPad/i.test(ua) };
  if (!snapshot || JSON.stringify(snapshot) !== JSON.stringify(next)) snapshot = next;
  return snapshot;
}

export function useInstall(): InstallState & { install: () => Promise<boolean> } {
  const s = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, read);
  return {
    ...s,
    install: async () => {
      if (!deferred) return false;
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      emit();
      return outcome === 'accepted';
    },
  };
}
