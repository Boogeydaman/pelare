import { JOINT_NAMES, MUSCLE_NAMES } from './exercises';
import { LEG_MUSCLES, readiness, weeklySets } from './fatigue';
import { GOAL_AREAS, ROUTINE_BY_ID, buildMobility, holdFor, routineCount, type Area } from './mobility';
import { RULES } from './rules';
import { RUN_TITLES, buildRun, isHardRun, spikeGuard, walkRunStage } from './running';
import {
  TARGET_MUSCLES, TEMPLATES, buildStrength, deloadStatus, ensureBlock, isHardLegSession, weeklyTarget,
} from './strength';
import type {
  EngineInput, EngineOutput, Joint, MobilityGoal, MobilityPlan, Muscle, Pillar, Plan, Profile, Reason,
  RunKind, StrengthTemplate, Suggestion,
} from './types';
import { DAY, clamp, dayKey, hoursSince, sortByDateDesc, within } from './util';

interface Candidate {
  id: string;
  pillar: Pillar;
  title: string;
  hard: boolean;
  plan: Plan;
  quality: number;
  fatigueCost: number;
  reasons: Reason[];
}

const fmtList = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} och ${xs[xs.length - 1]}`);
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function planMinutes(p: Plan): number {
  return p.minutes + ('cooldown' in p && p.cooldown ? p.cooldown.minutes : 0);
}

/** Sessions per week per pillar (strength, run) and stretch days for the mobility goal. */
export function weeklyTargets(profile: Profile): { strength: number; run: number; mobilityDays: number } {
  const w = RULES.scoring.value.focus[profile.focus];
  const D = profile.daysPerWeek;
  return {
    strength: Math.max(RULES.healthFloor.value.strengthDays, Math.round(D * w.strength)),
    run: Math.max(RULES.easyRun.value.minRunsPerWeek, Math.round(D * w.run)),
    mobilityDays: RULES.mobilityDose.value.daysPerWeek,
  };
}

export function suggest(input: EngineInput): EngineOutput {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const { profile, now, today } = input;
  const sessions = input.sessions.filter((s) => new Date(s.date).getTime() <= now.getTime());
  const block = ensureBlock(input.block ? { ...input.block, picks: { ...input.block.picks } } : undefined, now);
  const notes: Reason[] = [];
  const pain = today.pain;
  const time = today.timeMin;
  const tired = today.feeling === 'trott';

  // ---- State ----
  const R = readiness(sessions, now);
  const target = weeklyTarget(profile);
  const done = weeklySets(sessions, now);
  const deficit = Object.fromEntries(TARGET_MUSCLES.map((m) => [m, Math.max(0, target - done[m])])) as Record<Muscle, number>;
  const last7 = within(sessions, now, 7);
  const sorted = sortByDateDesc(sessions);

  const lastHardLegs = sorted.find(isHardLegSession);
  const hLegs = lastHardLegs ? hoursSince(lastHardLegs.date, now) : Infinity;
  const lastHardRun = sorted.find((s) => s.run && isHardRun(s.run.kind));
  const hRun = lastHardRun ? hoursSince(lastHardRun.date, now) : Infinity;
  const spacingH = RULES.spacing.value.hours;

  // Hard days in a row, counting back from yesterday.
  let hardStreak = 0;
  for (let d = 1; d <= RULES.hardDays.value.maxInRow; d++) {
    const key = dayKey(new Date(now.getTime() - d * DAY));
    if (sessions.some((s) => s.hard && dayKey(s.date) === key)) hardStreak++;
    else break;
  }
  const hardToday = sessions.some((s) => s.hard && dayKey(s.date) === dayKey(now));
  const lightOnly = tired || hardToday || hardStreak >= RULES.hardDays.value.maxInRow;
  if (hardToday) notes.push({ text: 'Du har redan kört ett hårt pass i dag – nu blir det något lugnt.', rules: ['safety.hard_days'] });
  else if (tired) notes.push({ text: 'Du känner dig trött – i dag blir det något lugnt.', rules: ['safety.low_readiness'] });
  else if (hardStreak >= 2) notes.push({ text: 'Två hårda dagar i rad – i dag blir det något lugnt.', rules: ['safety.hard_days'] });

  // Pain and care advice.
  const painCfg = RULES.pain.value;
  const runBlocked = pain.some((j) => painCfg.runBlockedBy.includes(j));
  if (pain.length) notes.push({ text: `Övningar som belastar ${fmtList(pain.map((j) => lower(JOINT_NAMES[j])))} hoppas över i dag.`, rules: ['safety.pain'] });
  if (runBlocked) notes.push({ text: 'Ingen löpning i dag på grund av smärtan.', rules: ['safety.pain'] });
  const careAdvice: Joint[] = pain.filter((j) => {
    const first = input.checkins
      .filter((c) => c.pain.includes(j) && now.getTime() - new Date(c.date).getTime() <= 60 * DAY)
      .map((c) => new Date(c.date).getTime());
    return first.length > 0 && now.getTime() - Math.min(...first) >= painCfg.careDays * DAY;
  });
  if (careAdvice.length) {
    notes.push({ text: `Det har gjort ont i ${fmtList(careAdvice.map((j) => lower(JOINT_NAMES[j])))} i mer än ${painCfg.careDays} dagar. Kontakta en fysioterapeut eller läkare.`, rules: ['safety.pain'] });
  }

  // Deload.
  const deload = deloadStatus(profile, sessions, input.deloadStart, now, tired);
  if (deload.reason === 'performance') notes.push({ text: 'Styrkan har gått ner två pass i rad och du är trött. Kommande vecka blir en lätt styrkevecka.', rules: ['strength.deload'] });
  if (deload.reason === 'interval') notes.push({ text: 'Det är länge sedan en lätt vecka. Kommande vecka blir en lätt styrkevecka.', rules: ['strength.deload'] });

  // ---- Weekly needs per pillar ----
  const w = RULES.scoring.value.focus[profile.focus];
  const { strength: strengthTarget, run: runTarget } = weeklyTargets(profile);
  const strengthDone = last7.filter((s) => s.strength).length;
  const runDone = last7.filter((s) => s.run).length;
  const deficitNeed = TARGET_MUSCLES.reduce((a, m) => a + Math.min(1, deficit[m] / target), 0) / TARGET_MUSCLES.length;
  const sessionNeedStrength = clamp((strengthTarget - strengthDone) / strengthTarget, 0, 1);
  const needStrength = Math.max(sessionNeedStrength, deficitNeed);
  const needRun = clamp((runTarget - runDone) / runTarget, 0, 1);

  const goals: MobilityGoal[] = profile.mobilityGoals.length ? profile.mobilityGoals : ['general'];
  const mobDays = RULES.mobilityDose.value.daysPerWeek;
  const goalDays = (g: MobilityGoal) => new Set(
    last7.filter((s) => s.mobility && s.mobility.areas.some((a) => GOAL_AREAS[g].includes(a as Area))).map((s) => dayKey(s.date)),
  ).size;
  const goalNeed = (g: MobilityGoal) => clamp((mobDays - goalDays(g)) / mobDays, 0, 1);
  const goalsByNeed = [...goals].sort((a, b) => goalNeed(b) - goalNeed(a));
  const needMob = goalNeed(goalsByNeed[0]);

  // ---- Candidates ----
  const cands: Candidate[] = [];
  const legsR = LEG_MUSCLES.reduce((a, m) => a + R[m], 0) / LEG_MUSCLES.length;
  const blockWeek = Math.floor((now.getTime() - new Date(block.startDate).getTime()) / (7 * DAY)) + 1;

  // Strength
  if (!lightOnly && time >= 15) {
    const templates: StrengthTemplate[] = ['full', 'upper', 'lower'];
    let spacingNoted = false;
    for (const t of templates) {
      if (t !== 'upper' && hRun < spacingH) {
        if (!spacingNoted) notes.push({ text: `Inga tunga benpass i dag – hård löpning för ${Math.round(hRun)} timmar sedan.`, rules: ['concurrent.spacing'] });
        spacingNoted = true;
        continue;
      }
      const built = buildStrength(t, {
        profile, sessions, block, now, location: today.location, pain, timeMin: time,
        readiness: R, deficit, deload: deload.active,
      });
      if (!built) continue;
      const tm = built.muscles.filter((m) => TARGET_MUSCLES.includes(m));
      const quality = tm.reduce((a, m) => a + Math.min(1, deficit[m] / target) * R[m], 0) / Math.max(1, tm.length)
        + (profile.level === 'beginner' && t === 'full' ? 0.1 : 0);
      const fatigueCost = 1 - tm.reduce((a, m) => a + R[m], 0) / Math.max(1, tm.length);
      const reasons: Reason[] = [];
      const top = [...tm].sort((a, b) => deficit[b] - deficit[a]).filter((m) => deficit[m] >= 1).slice(0, 2);
      if (top.length) reasons.push({ text: `${fmtList(top.map((m, i) => (i === 0 ? MUSCLE_NAMES[m] : lower(MUSCLE_NAMES[m]))))} ligger ${fmtList(top.map((m) => String(Math.round(deficit[m]))))} set under veckomålet (${target} set).`, rules: ['strength.weekly_sets'] });
      if (built.skippedNotReady.length) reasons.push({ text: `${fmtList(built.skippedNotReady.map((m, i) => (i === 0 ? MUSCLE_NAMES[m] : lower(MUSCLE_NAMES[m]))))} är inte återhämtade och hoppas över.`, rules: ['fatigue.model'] });
      if (strengthDone < strengthTarget) reasons.push({ text: `${strengthDone} av ${strengthTarget} styrkepass gjorda senaste 7 dagarna.`, rules: ['health.floor', 'running.strength_support'] });
      if (deload.active) reasons.push({ text: 'Lätt vecka: halva volymen, samma vikter och mer marginal.', rules: ['strength.deload'] });
      else reasons.push({ text: `Samma huvudövningar som resten av blocket (vecka ${Math.min(blockWeek, RULES.variation.value.blockWeeks)} av ${RULES.variation.value.blockWeeks}).`, rules: ['strength.variation'] });
      if (built.plan.supersets) reasons.push({ text: 'Kort om tid – övningarna körs i par med kortare vila.', rules: ['strength.rest'] });
      if (built.substituted.length) reasons.push({ text: `${fmtList(built.substituted)} ersätter ordinarie övning på grund av smärta.`, rules: ['safety.pain'] });
      const where = today.location === 'home' ? ' hemma' : '';
      cands.push({
        id: `strength:${t}`, pillar: 'strength', hard: !deload.active,
        title: `${deload.active ? 'Lätt ' : ''}${deload.active ? lower(TEMPLATES[t].title) : TEMPLATES[t].title}${where}`,
        plan: built.plan, quality, fatigueCost, reasons,
      });
    }
  }

  // Running
  if (!runBlocked && time >= 15) {
    const stage = walkRunStage(profile, sessions);
    const kinds: RunKind[] = stage === 'done' ? ['easy', 'interval', 'long'] : ['walk_run'];
    const guard = spikeGuard(profile, sessions, now);
    const intervalThisWeek = last7.some((s) => s.run?.kind === 'interval');
    const runs30 = within(sessions, now, 30).filter((s) => s.run).length;
    const longThisWeek = last7.some((s) => s.run?.kind === 'long');
    let spacingNoted = false;
    for (const k of kinds) {
      const hard = isHardRun(k);
      if (hard && lightOnly) continue;
      if (hard && hLegs < spacingH) {
        if (!spacingNoted) notes.push({ text: `Inga intervaller eller långpass i dag – tunga ben för ${Math.round(hLegs)} timmar sedan.`, rules: ['concurrent.spacing'] });
        spacingNoted = true;
        continue;
      }
      if (k === 'interval' && (intervalThisWeek || runs30 < RULES.intervals.value.baseRuns)) continue;
      if (k === 'long' && (longThisWeek || runDone === 0)) continue;
      const plan = buildRun(k, profile, sessions, now, time);
      if (!plan) continue;
      const reasons: Reason[] = [];
      let quality = 0.8;
      if (k === 'walk_run') {
        reasons.push({ text: `Steg ${plan.stage! + 1} av ${RULES.walkRun.value.stages.length} i gå-spring-programmet.`, rules: ['running.walk_run'] });
      } else if (k === 'easy') {
        reasons.push({ text: 'Lugn löpning bygger grunden – ungefär 80 % av löpningen ska vara pratbar.', rules: ['running.distribution'] });
      } else if (k === 'interval') {
        quality = 1;
        reasons.push({ text: 'Inget intervallpass än den här veckan – ett i veckan höjer konditionen mest.', rules: ['running.intervals'] });
      } else {
        quality = 0.9;
        reasons.push({ text: 'Inget långpass än den här veckan.', rules: ['running.distribution'] });
      }
      if (k !== 'walk_run') {
        reasons.push({ text: guard.assumed
          ? `Högst ${Math.floor(guard.maxMin)} min tills appen har sett dina egna pass.`
          : `Högst ${Math.floor(guard.maxMin)} min${guard.maxKm ? ` / ${guard.maxKm.toFixed(1).replace('.', ',')} km` : ''} – längsta passet senaste 30 dagarna var ${Math.round(guard.longestMin)} min.`, rules: ['running.spike_guard'] });
      }
      reasons.push({ text: `${runDone} av ${runTarget} löppass gjorda senaste 7 dagarna.`, rules: ['health.floor'] });
      cands.push({
        id: `run:${k}`, pillar: 'run', hard, title: RUN_TITLES[k], plan, quality,
        fatigueCost: (hard ? 1 : 0.5) * (1 - legsR), reasons,
      });
    }
  }

  // Mobility
  for (const g of goalsByNeed) {
    const routine = ROUTINE_BY_ID[g];
    const daysDone = goalDays(g);
    for (const kind of ['full', 'micro'] as const) {
      const minutes = kind === 'full' ? Math.min(time, 25) : Math.min(time, 8);
      if (kind === 'full' && time < 12) continue;
      const plan = buildMobility(routine.id, minutes, sessions, pain, kind);
      if (!plan) continue;
      const hold = holdFor(routineCount(sessions, routine.id));
      cands.push({
        id: `mobility:${g}:${kind}`, pillar: 'mobility', hard: false, title: plan.title, plan,
        quality: goalNeed(g) * (kind === 'micro' ? 0.6 : 1), fatigueCost: 0,
        reasons: [
          { text: `${routine.title}: stretchat ${daysDone} av ${mobDays} dagar senaste veckan.`, rules: ['mobility.dose'] },
          { text: `Hålltid nu: ${hold.sec} s, ${hold.sets} varv. Den ökar när du stretchar regelbundet.`, rules: ['mobility.progression'] },
          ...(kind === 'micro' ? [{ text: 'Korta pass ofta ger lika mycket som långa pass sällan.', rules: ['mobility.dose'] }] : []),
        ],
      });
    }
  }

  // Rest
  const restReasons: Reason[] = [{ text: 'Vila är en del av planen – kroppen blir starkare mellan passen.', rules: ['fatigue.model'] }];
  if (tired) restReasons.unshift({ text: 'Du känner dig trött i dag.', rules: ['safety.low_readiness'] });
  if (hardStreak >= 2) restReasons.unshift({ text: 'Två hårda dagar i rad.', rules: ['safety.hard_days'] });
  const restMinutes = Math.min(30, time);
  cands.push({
    id: 'rest', pillar: 'rest', hard: false, title: 'Vila eller promenad',
    plan: { kind: 'rest', minutes: restMinutes, text: `Ta en lugn promenad på ${restMinutes} minuter, eller vila helt.` },
    quality: 0, fatigueCost: 0, reasons: restReasons,
  });

  // Cooldown stretch on strength/run sessions when time allows.
  const coolGoal = goalsByNeed[0];
  for (const c of cands) {
    if (c.plan.kind !== 'strength' && c.plan.kind !== 'run' && c.plan.kind !== 'rest') continue;
    const spare = time - c.plan.minutes;
    if (spare < 6) continue;
    const cd: MobilityPlan | null = buildMobility(ROUTINE_BY_ID[coolGoal].id, Math.min(10, spare), sessions, pain, 'cooldown');
    if (cd && cd.minutes <= spare) {
      c.plan.cooldown = cd;
      c.reasons.push({ text: `Avslutas med ${cd.minutes} min stretch för ${lower(ROUTINE_BY_ID[coolGoal].title)}.`, rules: ['mobility.dose', 'mobility.warmup'] });
    }
  }

  // ---- Scoring ----
  const sc = RULES.scoring.value;
  const lastPillar = sorted[0]?.pillar;
  // Coverage: how much the session reduces this week's deficit in its pillar (0–1).
  const coverageFor = (c: Candidate) =>
    c.pillar === 'strength' ? Math.max(c.quality, sessionNeedStrength * 0.8)
      : c.pillar === 'run' ? needRun * c.quality
        : c.quality; // mobility quality already holds the goal's need
  const weightFor = (p: Pillar) => (p === 'strength' ? w.strength : p === 'run' ? w.run : p === 'mobility' ? w.mobility : 0);
  const allMet = needStrength < 0.15 && needRun < 0.15 && needMob < 0.15;

  const scored: Suggestion[] = cands.map((c) => {
    const minutes = planMinutes(c.plan);
    let score: number;
    if (c.pillar === 'rest') {
      score = 0.05 + (tired ? 0.25 : 0) + (hardStreak >= 2 ? 0.2 : 0) + (allMet ? 0.15 : 0);
    } else {
      const timeFit = minutes <= time ? minutes / time : 0;
      const variety = lastPillar && lastPillar !== c.pillar ? 1 : 0;
      const risk = c.hard && hardStreak === 1 ? 0.3 : 0;
      const cooldownBonus = 'cooldown' in c.plan && c.plan.cooldown ? w.mobility * needMob * 0.5 : 0;
      const coverage = coverageFor(c);
      const gate = coverage > 0.05 ? 1 : 0.3; // an unneeded session gets little credit for fitting the time
      score = weightFor(c.pillar) * coverage
        + gate * (sc.time * timeFit + sc.variety * variety) - sc.fatigue * c.fatigueCost - sc.risk * risk + cooldownBonus;
    }
    return { id: c.id, pillar: c.pillar, title: c.title, minutes, hard: c.hard, score: Math.round(score * 1000) / 1000, reasons: c.reasons, plan: c.plan };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const alternatives: Suggestion[] = [];
  for (const s of scored.slice(1)) {
    if (alternatives.length >= 2) break;
    if (s.pillar !== best.pillar && !alternatives.some((a) => a.pillar === s.pillar)) alternatives.push(s);
  }
  for (const s of scored.slice(1)) {
    if (alternatives.length >= 2) break;
    if (!alternatives.includes(s)) alternatives.push(s);
  }

  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    best, alternatives: alternatives.slice(0, 2), notes, careAdvice, block,
    deloadStart: deload.active ? deload.start : undefined, ms: Math.round((t1 - t0) * 10) / 10,
  };
}

