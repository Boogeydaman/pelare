import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'se.pelare.app',
  appName: 'Pelare',
  webDir: 'dist',
  backgroundColor: '#f3efe6',
  // Keeps GPS updates flowing when a run lasts longer than 5 minutes with the screen off (background-geolocation).
  android: { useLegacyBridge: true },
};

export default config;
