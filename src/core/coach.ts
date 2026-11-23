// Idag – the coach. Asks every module for candidates, removes what breaks a safety rule,
// and scores the rest against the week, recovery, day form and time. Rules: docs/SPEC.md section 7.
import type { Load, ModuleCtx, TrainingModule } from '../modules/types';
import { isSameDay, weekStart } from './format';
import { coreDue, coreSession, isCore } from '../modules/gym/core';
import type { LogData, ModuleId, PlannedSession, Reason, SessionLog } from './types';

const HOUR = 3600_000;
const DAY = 24 * HOUR;

export const REST: PlannedSession = {
  id: 'rest', module: 'rest', type: 'rest', title: 'Vila', minutes: 30, effort: 'lugnt',
  summary: 'Promenad eller helt ledigt',
  reasons: [{ text: 'Vila är en del av planen. Kroppen blir starkare mellan passen.' }],
  content: { kind: 'rest', text: 'Ta en lugn promenad, eller vila helt. Båda räknas.' },
};

export interface AddOn { when: 'före' | 'efter'; label: string; hint: string; session: PlannedSession; fits: boolean }
export interface WeekLine { module: ModuleId; name: string; done: number; target: number; unit: string }

export interface TodayView {
  primary: PlannedSession;
  alternatives: PlannedSession[];
  addOns: AddOn[];
  notes: Reason[]; // rules that shaped today, shown under "Hänsyn i dag"
  week: WeekLine[];
  daysLeft: number; // including today
  aerobicMin: number; // this week, towards the health floor
  note?: string;
}

// ---------------------------------------------------------------- Recovery (shared across modules)

/** Hours for fatigue to fall to ~37 %. Legs recover slower than the upper body (fatigue.model, H). */
const TAU = { legs: 48, upper: 36 };

export interface Body { legs: number; upper: number }

/** Accumulated fatigue per body region from every module's load, decaying over time. */
export function bodyFatigue(ctx: ModuleCtx, modules: TrainingModule[]): Body {
  const f: Body = { legs: 0, upper: 0 };
  for (const l of ctx.logs) {
    const dt = (ctx.now.getTime() - new Date(l.startedAt).getTime()) / HOUR;
    if (dt < 0 || dt > 120) continue;
    const load = modules.find((m) => m.id === l.module)?.load(l) ?? {};
    f.legs += (load.legs ?? 0) * Math.exp(-dt / TAU.legs);
    f.upper += (load.upper ?? 0) * Math.exp(-dt / TAU.upper);
  }
  return f;
}

/** What a planned session would put on the body – asks the module, using a log built from the plan. */
export function planLoad(s: PlannedSession, modules: TrainingModule[]): Load {
  if (s.module === 'rest') return {};
  const c = s.content;
  const data: LogData | undefined = c.kind === 'strength'
    ? { kind: 'strength', exercises: c.items.map((i) => ({ id: i.id, name: i.name, sets: Array.from({ length: i.sets }, () => ({ kg: i.kg ?? 0, reps: i.reps[0] })) })) }
    : c.kind === 'run' ? { kind: 'run' } : c.kind === 'mobility' ? { kind: 'mobility', holdsDone: 0 } : undefined;
  const log: SessionLog = { id: 'plan', module: s.module, type: s.type, title: s.title, startedAt: new Date().toISOString(), minutes: s.minutes, data };
  return modules.find((m) => m.id === s.module)?.load(log) ?? {};
}

const isHard = (l: SessionLog, modules: TrainingModule[]) => !isCore(l) && (l.replaces === 'gym' || l.replaces === 'run' || !!modules.find((m) => m.id === l.module)?.load(l).hard);

// ---------------------------------------------------------------- Coach

export function coach(ctx: ModuleCtx, modules: TrainingModule[]): TodayView {
  const { checkin, logs, now } = ctx;
  const notes: Reason[] = [];
  const todayLogs = logs.filter((l) => isSameDay(l.startedAt, now));
  const hardToday = todayLogs.some((l) => isHard(l, modules));
  const tired = checkin.feeling === 'trott';
  const sick = checkin.feeling === 'sjuk';

  // Sick today: rest. Weekly targets pause – nothing has to be made up.
  if (sick) return sickDay(ctx, modules);

  // Back after illness or a break: no catching up, and a gentler first session.
  const trainingLogs = logs.filter((l) => l.module !== 'other');
  const last = trainingLogs.reduce((m, l) => Math.max(m, new Date(l.startedAt).getTime()), 0);
  const gapDays = last ? Math.floor((now.getTime() - last) / DAY) : 0;
  const sickRecently = (ctx.recentCheckins ?? []).some((c) => c.feeling === 'sjuk' && c.date !== checkin.date && now.getTime() - new Date(c.date).getTime() <= 7 * DAY);
  const comeback = sickRecently || gapDays >= 5;

  // safety.hard_days: at most two hard days in a row.
  let streak = 0;
  for (let d = 1; d <= 2; d++) {
    const day = new Date(now.getTime() - d * DAY);
    if (logs.some((l) => isSameDay(l.startedAt, day) && isHard(l, modules))) streak++; else break;
  }
  const lightOnly = tired || hardToday || streak >= 2;
  const replacedToday = todayLogs.some((l) => l.replaces);
  if (replacedToday) notes.push({ text: 'Du har tränat något annat i dag och det räknas som dagens pass. Inget mer behövs – vill du göra något blir det lugnt.' });
  else if (hardToday) notes.push({ text: 'Du har redan kört ett hårt pass i dag, så resten av dagen blir lugn.' });
  else if (streak >= 2) notes.push({ text: 'Två hårda dagar i rad. I dag blir det något lugnt så att kroppen hinner bygga upp sig.' });
  else if (tired) notes.push({ text: 'Du känner dig trött, så förslagen är lugna i dag.' });
  if (comeback) {
    notes.push({ text: sickRecently
      ? 'Välkommen tillbaka efter sjukdomen. Du behöver inte ta igen något du missat – appen fortsätter från där du är, och de första passen blir lite lättare.'
      : `Välkommen tillbaka efter ${gapDays} dagar. Inget behöver tas igen – första passet blir lite lättare så att kroppen hinner vänja sig igen.` });
  }

  // concurrent.spacing [16]: hard legs and hard running at least 24 h apart.
  const recent = logs.filter((l) => { const dt = now.getTime() - new Date(l.startedAt).getTime(); return dt >= 0 && dt < DAY; });
  const recentHardLegs = recent.some((l) => { const ld = modules.find((m) => m.id === l.module)?.load(l); return !!ld?.hard && (ld.legs ?? 0) >= 0.8; });
  const body = bodyFatigue(ctx, modules);

  // Running on consecutive days: the tissues that take the impact (tendons, bone) adapt more slowly than
  // heart and lungs, so a rest day between runs lowers the injury risk – above all for newer runners.
  // Never three days in a row; the day after a run only an easy run, and only when the week needs it.
  const ranOn = (d: number) => logs.some((l) => l.module === 'run' && isSameDay(l.startedAt, new Date(now.getTime() - d * DAY)));
  const ranYesterday = ranOn(1);
  const ranTwoDays = ranYesterday && ranOn(2);

  // Week: urgency = sessions still needed / days left (including today).
  const daysLeft = 7 - Math.floor((now.getTime() - weekStart(now).getTime()) / DAY);
  const week: WeekLine[] = modules.map((m) => { const w = m.weekly(ctx); return { module: m.id, name: m.name, done: w.done, target: w.target, unit: w.unit }; });

  // health.floor [25]: 150 min aerobic activity and strength two days a week.
  const thisWeek = logs.filter((l) => new Date(l.startedAt) >= weekStart(now));
  const aerobicMin = thisWeek.filter((l) => l.module === 'run' || (l.module === 'other' && ['cardio', 'sport', 'walk'].includes(l.type)) || l.type === 'animal_cond').reduce((a, l) => a + l.minutes, 0);
  const aerobicBehind = aerobicMin < 150 && (150 - aerobicMin) / Math.max(1, daysLeft) > 25;

  // Chosen training days: gym and running move to those days when the week still fits.
  const fixed = ctx.profile.trainingDays ?? [];
  const todayIdx = (now.getDay() + 6) % 7;
  const mainLeft = week.filter((w) => w.module === 'gym' || w.module === 'run').reduce((a, w) => a + Math.max(0, w.target - w.done), 0);
  const fixedAfter = fixed.filter((d) => d > todayIdx).length;
  const offDay = fixed.length > 0 && !fixed.includes(todayIdx) && mainLeft <= fixedAfter;
  const onDay = fixed.length > 0 && fixed.includes(todayIdx);
  // No slack left in the week: gym and running go before stretching (which fits as an add-on).
  const noSlack = !comeback && mainLeft > 0 && mainLeft >= daysLeft;
  if (offDay && mainLeft > 0) notes.push({ text: 'I dag är ingen av dina valda träningsdagar. Veckans pass ryms ändå på dem, så i dag blir det lugnare.' });

  type Scored = { s: PlannedSession; score: number; blocked?: string };
  const scored: Scored[] = modules.flatMap((m) => {
    const w = m.weekly(ctx);
    const left = Math.max(0, w.target - w.done);
    const need = w.target ? left / w.target : 0;
    const urgency = Math.min(1, left / Math.max(1, daysLeft));
    const doneToday = todayLogs.some((l) => (l.module === m.id && !isCore(l)) || l.replaces === m.id);

    return m.candidates(ctx).map((s, i): Scored => {
      const load = planLoad(s, modules);
      const hard = s.effort === 'hårt' || !!load.hard;
      let blocked: string | undefined;
      if (lightOnly && hard) blocked = 'lugn dag';
      if (hard && (load.legs ?? 0) >= 0.8 && recentHardLegs) blocked = 'benen behöver 24 timmar mellan tunga ben och hård löpning';
      if (m.id === 'run' && ranTwoDays) blocked = 'löpning tre dagar i rad';
      else if (m.id === 'run' && ranYesterday && (hard || left < daysLeft)) blocked = 'löpning dag efter dag';

      const fatigue = (load.legs ?? 0) * Math.min(1, body.legs / 1.2) + (load.upper ?? 0) * Math.min(1, body.upper / 1.2);
      const fit = s.minutes <= checkin.minutes ? 0.1 : -0.4;
      // After a break, urgency is ignored: missed sessions are never crammed in.
      let score = 0.55 * need + (comeback ? 0 : 0.45 * urgency) + fit - 0.35 * fatigue - (s.penalty ?? 0) - i * 0.12;
      if (comeback && hard) score -= 0.3;
      if (doneToday) score -= 0.7;
      if (m.id === 'run' && aerobicBehind) score += 0.15;
      if (m.id === 'gym' || m.id === 'run') {
        if (offDay) score -= 0.5; else if (onDay && left > 0) score += 0.15;
        if (noSlack && left > 0) score += 0.5;
      }
      if (checkin.feeling === 'pigg' && hard) score += 0.08;
      return { s: { ...s, minutes: Math.min(s.minutes, checkin.minutes) }, score, blocked };
    });
  });

  const allMet = week.every((w) => w.done >= w.target);
  scored.push({ s: { ...REST, minutes: Math.min(REST.minutes, checkin.minutes) }, score: 0.05 + (tired ? 0.5 : 0) + (streak >= 2 ? 0.35 : 0) + (hardToday ? 0.3 : 0) + (allMet ? 0.3 : 0) });

  const ok = scored.filter((x) => !x.blocked).sort((a, b) => b.score - a.score);
  const blockedNotes = [...new Set(scored.filter((x) => x.blocked && x.blocked !== 'lugn dag').map((x) => x.blocked!))];
  for (const b of blockedNotes) {
    if (b === 'löpning tre dagar i rad') notes.push({ text: 'Ingen löpning i dag: du har sprungit två dagar i rad. Senor och skelett behöver en vilodag för att hinna anpassa sig – det är där löparskadorna uppstår.', source: '19' });
    else if (b === 'löpning dag efter dag') notes.push({ text: 'Du sprang i går, så ingen löpning i dag. En vilodag mellan löppassen låter senor och skelett återhämta sig och sänker skaderisken – veckans löppass hinns ändå.', source: '19' });
    else notes.push({ text: `Inga hårda benpass eller hårda löppass i dag: ${b}.`, source: '16' });
  }
  if (aerobicBehind) notes.push({ text: `Du har ${aerobicMin} av 150 minuters kondition den här veckan, så löpning väger lite tyngre i dag.`, source: '25' });

  const primary = withCoachReason(ok[0].s, week, daysLeft);
  const alternatives: PlannedSession[] = [];
  for (const { s } of ok.slice(1)) {
    if (alternatives.length >= 3) break;
    if (s.module !== primary.module && !alternatives.some((a) => a.module === s.module)) alternatives.push(s);
  }

  return {
    primary, alternatives, notes, week, daysLeft, aerobicMin,
    addOns: addOns(primary, ctx, modules),
    note: notes[0]?.text,
  };
}

/** Puts the coach's own reason first: why this pillar today. */
function withCoachReason(s: PlannedSession, week: WeekLine[], daysLeft: number): PlannedSession {
  if (s.module === 'rest') return s;
  const w = week.find((x) => x.module === s.module);
  if (!w) return s;
  const left = w.target - w.done;
  const text = left > 0
    ? `${w.name}: ${w.done} av ${w.target} ${w.unit} den här veckan, ${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagar'} kvar.`
    : `${w.name} är redan i mål den här veckan – det här är extra.`;
  return { ...s, reasons: [{ text }, ...s.reasons] };
}

/** Kombinationer (spec 7.4): warm-up before and a short stretch after, when the time allows. */
function addOns(primary: PlannedSession, ctx: ModuleCtx, modules: TrainingModule[]): AddOn[] {
  if (primary.module !== 'gym' && primary.module !== 'run') return [];
  const mob = modules.find((m) => m.id === 'mobility');
  if (!mob) return [];
  const qs = mob.quickStarts(ctx);
  const warm = qs.find((q) => q.id === 'animal')?.session;
  const after = qs.find((q) => q.id === 'micro')?.session;
  // Always recommended – the habit matters more than the minutes. `fits` says whether it fits today's time.
  let spare = ctx.checkin.minutes - primary.minutes;
  const out: AddOn[] = [];
  if (warm) {
    const fits = spare >= warm.minutes;
    out.push({ when: 'före', label: warm.title, hint: `${warm.minutes} min · väcker leder och puls`, session: warm, fits });
    if (fits) spare -= warm.minutes;
  }
  if (after) {
    const fits = spare >= after.minutes;
    out.push({ when: 'efter', label: after.title, hint: `${after.minutes} min · räknas mot rörlighetsmålet`, session: after, fits });
    if (fits) spare -= after.minutes;
  }
  // Core: after every other gym or running session.
  if (coreDue(ctx, primary)) {
    const core = coreSession(ctx);
    out.push({ when: 'efter', label: 'Bålpass', hint: `${core.minutes} min · mage och rygg, vartannat pass`, session: core, fits: spare >= core.minutes });
  }
  return out;
}

/** Sick day: rest first, at most a gentle stretch. Uses the "neck check" heuristic (H). */
function sickDay(ctx: ModuleCtx, modules: TrainingModule[]): TodayView {
  const rest: PlannedSession = {
    ...REST, id: 'sick', type: 'sick', title: 'Vila och bli frisk', minutes: Math.min(20, ctx.checkin.minutes), summary: 'Vila, drick och sov',
    reasons: [
      { text: 'Kroppen behöver energin till att bli frisk. Några dagars vila påverkar inte formen nämnvärt, men att träna hårt när du är sjuk kan förlänga sjukdomen.' },
      { text: 'Veckomålen pausas. När du är frisk igen fortsätter appen därifrån, utan att försöka ta igen något.' },
    ],
    content: { kind: 'rest', text: 'Vila. Vill du röra på dig: högst en lugn promenad, och bara om du saknar feber.' },
  };
  const micro = modules.find((m) => m.id === 'mobility')?.quickStarts(ctx).find((q) => q.id === 'micro')?.session;
  const alternatives = micro ? [{ ...micro, id: 'sick:stretch', title: 'Lätt stretch', reasons: [{ text: 'Bara om du känner för det och saknar feber.' }] }] : [];
  const week: WeekLine[] = modules.map((m) => { const w = m.weekly(ctx); return { module: m.id, name: m.name, done: w.done, target: w.target, unit: w.unit }; });
  return {
    primary: rest, alternatives, addOns: [], week,
    daysLeft: 7 - Math.floor((ctx.now.getTime() - weekStart(ctx.now).getTime()) / DAY),
    aerobicMin: 0,
    notes: [
      { text: 'Du är sjuk – i dag handlar det om vila. Veckomålen pausas och inget behöver tas igen.' },
      { text: 'Tumregel: bara snuva eller lite ont i halsen, ingen feber? En promenad eller lätt stretch går bra om du vill. Feber, hosta, värk i kroppen eller magsjuka: vila helt tills du är frisk, och ett par dagar till.' },
    ],
  };
}
