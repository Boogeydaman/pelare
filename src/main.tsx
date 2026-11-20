import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from "./App";
import './index.css';
import './core/install';
import { NATIVE } from './core/native';

// Check for a new version on start and every time the app comes back to the foreground,
// so an installed app on the phone never keeps running an old build.
// The Android app ships its files inside the APK, so it needs no service worker.
if (!NATIVE) import('virtual:pwa-register').then(({ registerSW }) => registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return;
    const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    setInterval(check, 60 * 60 * 1000);
  },
}));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
