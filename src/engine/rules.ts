// Rulebase v1. Every training number the engine uses lives here, with level and sources.
// Levels: A = systematic review/meta-analysis, B = RCT, C = cohort/consensus/narrative review,
// H = heuristic (practice without direct support).

export type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'H';

export interface Rule<T = unknown> {
  key: string;
  title: string;
  text: string;
  level: EvidenceLevel;
  levelNote?: string;
  sources: number[];
  hard?: boolean;
  value: T;
}

function rule<T>(r: Rule<T>): Rule<T> {
  return r;
}

export const RULES_VERSION = 1;

export const RULES = {
  weeklySets: rule({
    key: 'strength.weekly_sets',
    title: 'Set per muskelgrupp och vecka',
    text: '10–20 hårda set per muskelgrupp och vecka. Nybörjare börjar lägre. Set där muskeln arbetar sekundärt räknas som ett halvt.',
    level: 'A', levelNote: 'Startnivån är heuristik', sources: [1, 2],
    value: { beginner: 9, intermediate: 12, secondaryFactor: 0.5 },
  }),
  minimumDose: rule({
    key: 'strength.minimum_dose',
    title: 'Minsta dos',
    text: 'Vid tidsbrist räcker minst 4 set per muskelgrupp och vecka för att behålla och bygga styrka.',
    level: 'C', sources: [11],
    value: { sets: 4 },
  }),
  frequency: rule({
    key: 'strength.frequency',
    title: 'Frekvens',
    text: 'Varje muskelgrupp tränas helst minst två gånger i veckan.',
    level: 'A', sources: [1],
    value: { perWeek: 2 },
  }),
  rir: rule({
    key: 'strength.rir',
    title: 'Hur nära failure',
    text: 'Isolering 0–2 reps kvar, flerledsövningar 1–3 reps kvar. Nybörjare har en rep extra marginal de första fyra veckorna.',
    level: 'A', levelNote: 'Nybörjartillägget är heuristik', sources: [3],
    value: { compound: 2, isolation: 1, beginnerExtra: 1, beginnerWeeks: 4 },
  }),
  repRanges: rule({
    key: 'strength.rep_ranges',
    title: 'Repintervall',
    text: 'Flerledsövningar 6–10 reps, isolering 10–20 reps. Muskler växer över ett brett intervall så länge seten är nära failure.',
    level: 'C', sources: [4],
    value: { compound: [6, 10] as [number, number], beginnerCompound: [8, 12] as [number, number], isolation: [10, 20] as [number, number], coreSec: [30, 60] as [number, number] },
  }),
  rest: rule({
    key: 'strength.rest',
    title: 'Vila mellan set',
    text: 'Flerled 2–3 min, isolering 1,5–2 min, aldrig under 60 s. Vid tidsbrist körs övningar i par (supersets).',
    level: 'A', levelNote: 'Låg säkerhet', sources: [5, 11],
    value: { compoundSec: 150, isolationSec: 90, minSec: 60, workSec: 45, supersetBelowMin: 30 },
  }),
  rom: rule({
    key: 'strength.rom',
    title: 'Rörelseomfång',
    text: 'Fullt rörelseomfång med betoning på sträckt läge.',
    level: 'A', sources: [6, 7, 8],
    value: {},
  }),
  order: rule({
    key: 'strength.order',
    title: 'Ordning',
    text: 'Tunga flerledsövningar först – de blir starkast när de görs tidigt i passet.',
    level: 'A', sources: [9],
    value: {},
  }),
  variation: rule({
    key: 'strength.variation',
    title: 'Fasta huvudövningar',
    text: 'Huvudövningarna ligger fast i block om 6 veckor så att framstegen går att mäta. Byte sker systematiskt mellan block.',
    level: 'A', sources: [10],
    value: { blockWeeks: 6, rotateAmong: 2 },
  }),
  progression: rule({
    key: 'strength.progression',
    title: 'Dubbelprogression',
    text: 'När alla set når övre repgränsen utan att kännas tunga höjs vikten med minsta steget. Två missade pass i rad sänker vikten 7,5 %.',
    level: 'H', sources: [],
    value: { dropPct: 0.075 },
  }),
  deload: rule({
    key: 'strength.deload',
    title: 'Lätt vecka (deload)',
    text: 'När prestationen sjunker två pass i rad och du känner dig trött, eller senast var åttonde vecka: en vecka med halva volymen, samma vikter och mer marginal.',
    level: 'B', levelNote: 'Intervallet är praxis', sources: [12, 13],
    value: { maxWeeks: 8, volumeFactor: 0.5, rirExtra: 2, lengthDays: 7 },
  }),
  sessionCap: rule({
    key: 'strength.session_cap',
    title: 'Tak per pass',
    text: 'Högst cirka 9 hårda set per muskelgrupp och pass – resten sprids ut över veckan.',
    level: 'H', sources: [14],
    value: { maxSetsPerMuscle: 9 },
  }),
  warmup: rule({
    key: 'strength.warmup',
    title: 'Uppvärmning',
    text: '5 min allmän uppvärmning, sedan stegrande set inför första tunga övningen (50 % × 8, 70 % × 4, 85 % × 2).',
    level: 'H', sources: [24],
    value: { generalMin: 5, rampMin: 3, ramp: [{ pct: 50, reps: 8 }, { pct: 70, reps: 4 }, { pct: 85, reps: 2 }] },
  }),
  interference: rule({
    key: 'concurrent.interference',
    title: 'Löpning och styrka går ihop',
    text: 'Löpning hindrar inte muskeltillväxt eller maxstyrka nämnvärt.',
    level: 'A', sources: [15],
    value: {},
  }),
  spacing: rule({
    key: 'concurrent.spacing',
    title: 'Avstånd mellan tunga ben och hård löpning',
    text: 'Tunga benpass och hård löpning (intervaller, långpass) läggs minst 24 timmar isär.',
    level: 'B', sources: [16, 15], hard: true,
    value: { hours: 24 },
  }),
  distribution: rule({
    key: 'running.distribution',
    title: '80/20',
    text: 'Ungefär 80 % av löptiden i lugnt, pratbart tempo och 20 % hårdare.',
    level: 'A', sources: [17],
    value: { easyShare: 0.8 },
  }),
  intervals: rule({
    key: 'running.intervals',
    title: 'Intervaller',
    text: 'Ett intervallpass i veckan: 4 × 4 min hårt (90–95 % av maxpuls) med 3 min lugn jogg. Nybörjare börjar med 4 × 2 min, och intervaller kommer först efter tre lugna pass.',
    level: 'B', levelNote: 'Nybörjarversionen är heuristik', sources: [18],
    value: { perWeek: 1, baseRuns: 3, reps: 4, workMin: 4, restMin: 3, beginnerWorkMin: 2, beginnerRestMin: 2, warmupMin: 10, cooldownMin: 5 },
  }),
  spikeGuard: rule({
    key: 'running.spike_guard',
    title: 'Skadevakt',
    text: 'Inget löppass får vara mer än 10 % längre än det längsta passet de senaste 30 dagarna.',
    level: 'C', sources: [19], hard: true,
    value: { factor: 1.1, days: 30, assumedLongest: { none: 20, some: 30, regular: 45 } as Record<string, number> },
  }),
  walkRun: rule({
    key: 'running.walk_run',
    title: 'Gå-spring',
    text: 'Nybörjare växlar löpning och gång. Nästa steg låses upp när passet inte kändes tungt.',
    level: 'H', sources: [],
    value: {
      stages: [
        { run: 1, walk: 2, reps: 8 }, { run: 2, walk: 2, reps: 6 }, { run: 3, walk: 2, reps: 5 },
        { run: 5, walk: 2, reps: 4 }, { run: 7, walk: 2, reps: 3 }, { run: 10, walk: 2, reps: 2 },
        { run: 12, walk: 1, reps: 2 }, { run: 15, walk: 1, reps: 2 }, { run: 20, walk: 0, reps: 1 },
        { run: 25, walk: 0, reps: 1 }, { run: 30, walk: 0, reps: 1 },
      ],
      warmupWalkMin: 5,
    },
  }),
  easyRun: rule({
    key: 'running.easy',
    title: 'Lugnt pass',
    text: 'Lugna pass i pratbart tempo bygger grunden. Minst två löppass i veckan, och längden ökar gradvis inom skadevakten.',
    level: 'H', sources: [17],
    value: { shareOfLongest: 0.7, minMin: 20, longVsEasy: 1.3, minRunsPerWeek: 2 },
  }),
  strengthSupport: rule({
    key: 'running.strength_support',
    title: 'Styrka stöttar löpningen',
    text: 'Minst två styrkepass i veckan även när löpning prioriteras – det förbättrar löpekonomin.',
    level: 'A', sources: [20],
    value: { minStrength: 2 },
  }),
  injuryPrevention: rule({
    key: 'injury.prevention',
    title: 'Skadeförebyggande',
    text: 'Styrketräning är den viktigaste skadeförebyggande delen. Stretching används för rörlighet, inte som skadeskydd.',
    level: 'A', sources: [21],
    value: {},
  }),
  mobilityDose: rule({
    key: 'mobility.dose',
    title: 'Stretchdos',
    text: 'Statisk stretch minst 5 minuter i veckan per prioriterat område, fördelat på minst 5 dagar.',
    level: 'A', sources: [22],
    value: { daysPerWeek: 5, minPerAreaWeek: 5 },
  }),
  mobilityProgression: rule({
    key: 'mobility.progression',
    title: 'Längre håll över tid',
    text: 'Hålltiden ökar från 30 till 60 sekunder och antalet varv från 2 till 3 när du har stretchat regelbundet ett tag.',
    level: 'H', sources: [22],
    value: { holdSteps: [30, 45, 60], sessionsPerStep: 4, extraSetAfter: 8 },
  }),
  strengthCounts: rule({
    key: 'mobility.strength_counts',
    title: 'Styrka ger rörlighet',
    text: 'Styrketräning med fullt rörelseomfång ökar rörligheten ungefär lika mycket som stretching.',
    level: 'A', sources: [23],
    value: {},
  }),
  mobilityWarmup: rule({
    key: 'mobility.warmup',
    title: 'Uppvärmning före pass',
    text: 'Dynamisk uppvärmning före pass. Kort statisk stretch (under 60 s per muskel) är okej.',
    level: 'A', sources: [24],
    value: {},
  }),
  healthFloor: rule({
    key: 'health.floor',
    title: 'Hälsogolv',
    text: 'Veckan siktar på minst 150 min måttlig aerob aktivitet och styrka minst två dagar.',
    level: 'A', sources: [25],
    value: { aerobicMin: 150, strengthDays: 2 },
  }),
  fatigue: rule({
    key: 'fatigue.model',
    title: 'Återhämtningsmodell',
    text: 'Trötthet per muskelgrupp räknas från set och löpning och klingar av över 1–2 dygn. Redo för hårt pass vid minst 70 % återhämtning.',
    level: 'H', sources: [],
    value: {
      tauH: {
        biceps: 24, triceps: 24, forearms: 24, calves: 24, abs: 24, side_delt: 24,
        chest: 36, upper_back: 36, lats: 36, front_delt: 36, rear_delt: 36, lower_back: 36,
        quads: 48, hamstrings: 48, glutes: 48, adductors: 48,
      } as Record<string, number>,
      fMax: 10,
      readyHard: 0.7,
      readyLight: 0.4,
      proximity: { tungt: 1.0, lagom: 0.8, latt: 0.5, unknown: 0.8 } as Record<string, number>,
      runPer15: { easy: 0.5, hard: 1.0, longFactor: 1.3 },
    },
  }),
  hardDays: rule({
    key: 'safety.hard_days',
    title: 'Högst två hårda dagar i rad',
    text: 'Efter två hårda dagar i rad blir det ett lätt pass, rörlighet eller vila.',
    level: 'H', sources: [], hard: true,
    value: { maxInRow: 2 },
  }),
  lowReadiness: rule({
    key: 'safety.low_readiness',
    title: 'Trött i dag',
    text: 'När du känner dig trött blir det bara lugn löpning, rörlighet eller vila.',
    level: 'H', sources: [], hard: true,
    value: {},
  }),
  pain: rule({
    key: 'safety.pain',
    title: 'Smärta',
    text: 'Övningar som belastar ett område som gör ont tas bort. Har det gjort ont i mer än 14 dagar: kontakta fysioterapeut eller läkare.',
    level: 'H', sources: [], hard: true,
    value: { careDays: 14, excludeLoadAtLeast: 2, runBlockedBy: ['knee', 'foot', 'hip'] as string[] },
  }),
  scoring: rule({
    key: 'engine.scoring',
    title: 'Poängsättning',
    text: 'Passen poängsätts efter hur mycket de fyller veckans behov, hur väl de passar tiden, variation, trötthet och risk.',
    level: 'H', sources: [],
    value: {
      time: 0.15, variety: 0.05, fatigue: 0.2, risk: 0.3,
      focus: {
        balanced: { strength: 0.45, run: 0.3, mobility: 0.25 },
        strength: { strength: 0.6, run: 0.2, mobility: 0.2 },
        run: { strength: 0.3, run: 0.5, mobility: 0.2 },
        mobility: { strength: 0.35, run: 0.25, mobility: 0.4 },
      } as Record<string, { strength: number; run: number; mobility: number }>,
    },
  }),
} as const;

export type RuleId = keyof typeof RULES;

export const RULE_BY_KEY: Record<string, Rule> = Object.fromEntries(
  Object.values(RULES).map((r) => [r.key, r as Rule]),
);

export interface Source { id: number; cite: string; year: number; level: EvidenceLevel; url?: string }

const doi = (d: string) => `https://doi.org/${d}`;

// Seeded from the spec, section 12. Not yet checked against PubMed/Crossref inside the app.
export const SOURCES: Source[] = [
  { id: 1, year: 2026, level: 'A', cite: 'Pelland m.fl. The resistance training dose response: meta-regressions on weekly volume and frequency. Sports Med. 2026', url: doi('10.1007/s40279-025-02344-w') },
  { id: 2, year: 2017, level: 'A', cite: 'Schoenfeld, Ogborn, Krieger. Dose-response relationship between weekly resistance training volume and muscle mass. J Sports Sci. 2017', url: doi('10.1080/02640414.2016.1210197') },
  { id: 3, year: 2024, level: 'A', cite: 'Robinson m.fl. Proximity to failure, strength gain and muscle hypertrophy: meta-regressions. Sports Med. 2024', url: doi('10.1007/s40279-024-02069-2') },
  { id: 4, year: 2021, level: 'C', cite: 'Schoenfeld m.fl. Loading recommendations for muscle strength, hypertrophy and local endurance. Sports. 2021', url: doi('10.3390/sports9020032') },
  { id: 5, year: 2024, level: 'A', cite: 'Singer m.fl. Give it a rest: inter-set rest interval duration and hypertrophy. Front Sports Act Living. 2024', url: doi('10.3389/fspor.2024.1429789') },
  { id: 6, year: 2023, level: 'A', cite: 'Wolf m.fl. Partial vs full range of motion resistance training: meta-analysis. Int J Strength Cond. 2023', url: doi('10.47206/ijsc.v3i1.182') },
  { id: 7, year: 2025, level: 'B', cite: 'Wolf m.fl. Lengthened partial repetitions vs full range of motion in trained individuals. PeerJ. 2025', url: doi('10.7717/peerj.18904') },
  { id: 8, year: 2023, level: 'B', cite: 'Maeo m.fl. Triceps hypertrophy after overhead vs neutral arm position elbow extension. Eur J Sport Sci. 2023' },
  { id: 9, year: 2021, level: 'A', cite: 'Nunes m.fl. Resistance exercise order and strength and hypertrophy: meta-analysis. Eur J Sport Sci. 2021', url: doi('10.1080/17461391.2020.1733672') },
  { id: 10, year: 2022, level: 'A', cite: 'Kassiano m.fl. Does varying resistance exercises promote superior hypertrophy and strength? J Strength Cond Res. 2022', url: doi('10.1519/JSC.0000000000004258') },
  { id: 11, year: 2021, level: 'C', cite: 'Iversen m.fl. No time to lift? Time-efficient training programs: narrative review. Sports Med. 2021', url: doi('10.1007/s40279-021-01490-1') },
  { id: 12, year: 2023, level: 'C', cite: 'Bell m.fl. Integrating deloading into strength and physique sports: Delphi consensus. Sports Med Open. 2023', url: doi('10.1186/s40798-023-00633-0') },
  { id: 13, year: 2024, level: 'B', cite: 'Coleman m.fl. Effects of a one-week deload during resistance training. PeerJ. 2024', url: doi('10.7717/peerj.16777') },
  { id: 14, year: 2025, level: 'H', cite: 'Remmert m.fl. Per-session volume, hypertrophy and strength (preprint, ej granskad). SportRxiv. 2025', url: doi('10.51224/SRXIV.537') },
  { id: 15, year: 2022, level: 'A', cite: 'Schumann m.fl. Compatibility of concurrent aerobic and strength training: meta-analysis. Sports Med. 2022', url: doi('10.1007/s40279-021-01587-7') },
  { id: 16, year: 2016, level: 'B', cite: 'Robineau m.fl. Concurrent training effects depend on recovery duration. J Strength Cond Res. 2016', url: doi('10.1519/JSC.0000000000000798') },
  { id: 17, year: 2024, level: 'A', cite: 'Silva Oliveira m.fl. Polarized vs other endurance training intensity distributions: meta-analysis. Sports Med. 2024', url: doi('10.1007/s40279-024-02034-z') },
  { id: 18, year: 2007, level: 'B', cite: 'Helgerud m.fl. Aerobic high-intensity intervals improve VO2max more than moderate training. Med Sci Sports Exerc. 2007', url: doi('10.1249/mss.0b013e3180304570') },
  { id: 19, year: 2025, level: 'C', cite: 'Frandsen m.fl. How much running is too much? High-risk running sessions in a 5200-person cohort. Br J Sports Med. 2025', url: doi('10.1136/bjsports-2024-109380') },
  { id: 20, year: 2018, level: 'A', cite: 'Blagrove m.fl. Strength training and determinants of distance running performance. Sports Med. 2018', url: doi('10.1007/s40279-017-0835-7') },
  { id: 21, year: 2014, level: 'A', cite: 'Lauersen m.fl. Exercise interventions to prevent sports injuries: meta-analysis of RCTs. Br J Sports Med. 2014' },
  { id: 22, year: 2018, level: 'A', cite: 'Thomas m.fl. Stretching typology and duration: effects on range of motion. Int J Sports Med. 2018', url: doi('10.1055/s-0044-101146') },
  { id: 23, year: 2021, level: 'A', cite: 'Afonso m.fl. Strength training versus stretching for improving range of motion: meta-analysis. Healthcare. 2021', url: doi('10.3390/healthcare9040427') },
  { id: 24, year: 2016, level: 'A', cite: 'Behm m.fl. Acute effects of muscle stretching on performance, ROM and injury. Appl Physiol Nutr Metab. 2016' },
  { id: 25, year: 2020, level: 'A', cite: 'Bull m.fl. WHO 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020', url: doi('10.1136/bjsports-2020-102955') },
  { id: 26, year: 2021, level: 'A', cite: 'Manresa-Rocamora m.fl. HRV-guided training: meta-analysis. Int J Environ Res Public Health. 2021', url: doi('10.3390/ijerph181910299') },
];

export const SOURCE_BY_ID: Record<number, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));
