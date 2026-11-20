/** True in the Android app (APK) built with `npm run build:android`, false on the website. */
export const NATIVE = import.meta.env.VITE_NATIVE === '1';
