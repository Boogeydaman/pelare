const DAYS = ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'];
const DAYS_LONG = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** "tis 19 nov" */
export const fmtDate = (d: Date | string) => {
  const x = new Date(d);
  return `${DAYS[x.getDay()]} ${x.getDate()} ${MONTHS[x.getMonth()]}`;
};

/** "Fredag 20 november" style, short month. */
export const fmtDayLong = (d: Date | string) => {
  const x = new Date(d);
  const s = `${DAYS_LONG[x.getDay()]} ${x.getDate()} ${MONTHS[x.getMonth()]}`;
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const fmtNum = (n: number) => (Math.round(n * 100) / 100).toString().replace('.', ',');

export const fmtClock = (sec: number) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const isSameDay = (a: Date | string, b: Date | string) => new Date(a).toDateString() === new Date(b).toDateString();

/** Monday 00:00 of the week containing d. */
export function weekStart(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export const isThisWeek = (iso: string) => new Date(iso) >= weekStart();

/** ISO week number. */
export function weekNumber(d: Date = new Date()): number {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil(((x.getTime() - y.getTime()) / 864e5 + 1) / 7);
}

export function vibrate(p: number | number[]) {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    navigator.vibrate?.(p);
  } catch { /* unsupported */ }
}
