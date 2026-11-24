// Rehab mode: criteria for moving on, the test battery, the timeline, gait aids, the before-surgery
// checklist and the warning signs. From the user's research report (parts 3, 4, 6, 8, 11) – the target
// values are approximate, from norm data and clinical practice, not validated phase boundaries.
import type { HipAid, Profile, TestResult } from '../core/types';

// ---------------------------------------------------------------- Criteria for the next phase

export interface Criterion { id: string; text: string; test?: { id: string; min?: number; max?: number } }

/** What you should manage before leaving phase n (the report's phase table, "kriterier för att gå vidare"). */
export const CRITERIA: Record<number, Criterion[]> = {
  1: [
    { id: 'hemma', text: 'Du är hemma från sjukhuset (eller skulle klara dig hemma)' },
    { id: 'forflyttning', text: 'Du tar dig själv i och ur säng och upp från en stol' },
    { id: 'gang', text: 'Du går säkert med rollator eller kryckor, och klarar trappa om du behöver' },
    { id: 'sar', text: 'Såret läcker inte och smärtlindringen fungerar' },
  ],
  2: [
    { id: 'lakt', text: 'Såret är torrt och läkt – stygnen är tagna' },
    { id: 'halt', text: 'Du går utan att halta (ingen Trendelenburghalt) med en krycka eller käpp' },
    { id: 'smarta', text: 'Smärtan minskar från vecka till vecka' },
  ],
  3: [
    { id: 'utan', text: 'Du går utan hjälpmedel och utan att halta' },
    { id: 'enben', text: 'Du står minst 10 sekunder på det opererade benet', test: { id: 'hip_stance', min: 10 } },
    { id: 'trappa', text: 'Du går växelvis i trappa, ett steg per trappsteg' },
    { id: 'uppres', text: '30 sekunders uppresning nära din åldersnorm (60–69 år: cirka 12–17)', test: { id: 'hip_chair30', min: 12 } },
  ],
  4: [
    { id: 'abd', text: 'Abduktionsstyrkan är minst 80 % av andra sidan', test: { id: 'hip_lsi', min: 80 } },
    { id: 'gangtest', text: '6 minuters gångtest eller 40 m snabbgång nära normen' },
    { id: 'lang', text: 'Du haltar inte efter 30 minuters promenad' },
  ],
};

/** The latest result per test. */
export function latestTests(tests: TestResult[]): Record<string, TestResult> {
  const out: Record<string, TestResult> = {};
  for (const t of [...tests].sort((a, b) => a.date.localeCompare(b.date))) out[t.testId] = t;
  return out;
}
/** A criterion with a test: met by the latest result? undefined = no result yet. */
export function criterionByTest(c: Criterion, latest: Record<string, TestResult>): boolean | undefined {
  if (!c.test) return undefined;
  const t = latest[c.test.id];
  if (!t) return undefined;
  return (c.test.min === undefined || t.value >= c.test.min) && (c.test.max === undefined || t.value <= c.test.max);
}

// ---------------------------------------------------------------- Test battery (report part 11)

export interface HipTest {
  id: string; name: string; short: string; unit: string; measures: string;
  higher: boolean; // higher is better
  step: number; min: number; max: number;
  how: string[];
  /** Approximate target by phase, or a reference line. */
  target: (phase: number) => { value?: number; text: string };
  fromPhase: number; // when it makes sense to start testing
  yesNo?: boolean;
}

export const HIP_TESTS: HipTest[] = [
  {
    id: 'hip_chair30', name: '30 sekunders uppresning', short: 'Uppresning 30 s', unit: 'st', measures: 'Benstyrka och funktion', higher: true, step: 1, min: 0, max: 40, fromPhase: 2,
    how: ['En stol utan armstöd, cirka 43–45 cm hög, mot en vägg.', 'Sitt i mitten med armarna korsade över bröstet och fötterna i golvet.', 'Res dig helt upp och sätt dig helt ner så många gånger du kan på 30 sekunder. Räkna hela uppresningar.'],
    target: (ph) => (ph >= 4 ? { value: 12, text: 'Mål i fas 4: din åldersnorm – 60–69 år cirka 12–17' } : { value: 12, text: 'Kriterium för fas 4: nära åldersnormen (60–69 år cirka 12–17)' }),
  },
  {
    id: 'hip_stance', name: 'Enbensstående', short: 'Enbensstående', unit: 's', measures: 'Balans och abduktorkontroll', higher: true, step: 1, min: 0, max: 60, fromPhase: 2,
    how: ['Stå bredvid något att ta tag i, händerna på höfterna.', 'Lyft den friska foten och stå på det opererade benet. Starta klockan när foten lämnar golvet.', 'Stoppa när foten nuddar golvet, du tar tag eller bäckenet sjunker kraftigt. Högst 60 sekunder. Gör gärna båda sidorna och jämför.'],
    target: (ph) => (ph >= 5 ? { value: 30, text: 'Mål i fas 5: minst 30 s med öppna ögon' } : { value: 10, text: 'Kriterium för fas 4: minst 10 s' }),
  },
  {
    id: 'hip_tug', name: 'Timed Up and Go', short: 'TUG', unit: 's', measures: 'Rörlighet och fallrisk', higher: false, step: 0.1, min: 3, max: 60, fromPhase: 1,
    how: ['Sitt i en stol med armstöd. Markera en linje 3 meter bort.', 'På "gå": res dig, gå i vanlig takt till linjen, vänd, gå tillbaka och sätt dig.', 'Ta tid från "gå" tills ryggen är mot ryggstödet. Använd hjälpmedel om du behöver – skriv det i så fall i huvudet.'],
    target: () => ({ value: 10, text: 'Under cirka 10 s är normalt. Över cirka 13,5 s talar för ökad fallrisk' }),
  },
  {
    id: 'hip_fpwt', name: '40 meter snabbgång', short: '40 m snabbgång', unit: 's', measures: 'Gånghastighet (OARSI:s kärntest)', higher: false, step: 0.1, min: 5, max: 120, fromPhase: 2,
    how: ['Mät upp 10 meter i en korridor eller på en gångväg.', 'Gå fram och tillbaka två gånger (4 × 10 m) så snabbt du kan utan att springa och utan risk.', 'Ta tid för hela sträckan inklusive vändningarna.'],
    target: () => ({ text: 'Följ förbättringen över tid – kortare tid är bättre' }),
  },
  {
    id: 'hip_6mwt', name: '6 minuters gångtest', short: '6 min gång', unit: 'm', measures: 'Uthållighet', higher: true, step: 5, min: 0, max: 1000, fromPhase: 3,
    how: ['Gå fram och tillbaka på en uppmätt sträcka (helst 20–30 m), eller använd en löparbana.', 'Gå så långt du kan på 6 minuter i jämn takt. Du får sakta in och stanna om du behöver.', 'Skriv in hur många meter du gick.'],
    target: (ph) => (ph >= 5 ? { value: 500, text: 'Mål i fas 5: över 500 m är rimligt för de flesta 60–70-åringar' } : { text: 'Kriterium för fas 5: nära normen – över 500 m för de flesta 60–70-åringar' }),
  },
  {
    id: 'hip_stairs', name: 'Trapptest', short: 'Trappa', unit: 's', measures: 'Trappfunktion', higher: false, step: 0.1, min: 2, max: 120, fromPhase: 3,
    how: ['En trappa med 9–12 steg.', 'Gå upp och ner så snabbt du kan på ett säkert sätt. Använd räcket om du behöver.', 'Ta tid för hela vägen upp och ner. Notera om du gick växelvis.'],
    target: () => ({ text: 'Mål i fas 3–4: växelvis utan räcke. Kortare tid är bättre' }),
  },
  {
    id: 'hip_trendelenburg', name: 'Trendelenburgs test', short: 'Trendelenburg', unit: '', measures: 'Abduktorfunktion', higher: false, step: 1, min: 0, max: 1, fromPhase: 2, yesNo: true,
    how: ['Stå framför en spegel, eller be någon titta bakifrån.', 'Lyft den friska foten och stå 30 sekunder på det opererade benet.', 'Negativt (bra): bäckenet hålls i våg eller lyfts lite på den fria sidan. Positivt: bäckenet sjunker på den fria sidan, eller du lutar överkroppen över det opererade benet.'],
    target: () => ({ value: 0, text: 'Mål i fas 3–4: negativt test' }),
  },
  {
    id: 'hip_lsi', name: 'Abduktionsstyrka, andel av friska sidan', short: 'Abduktion (LSI)', unit: '%', measures: 'Styrka – jämfört med friska benet', higher: true, step: 1, min: 0, max: 150, fromPhase: 3,
    how: ['Bäst med handdynamometer hos fysioterapeuten: tre försök per sida, bästa värdet. Opererad delat med frisk × 100.', 'Utan dynamometer: sidliggande benlyft till trötthet med samma tempo på båda sidorna – antal på opererade sidan delat med friska × 100 ger ett grovt mått.', 'Kom ihåg: ett underskott på 15 % efter två år är vanligt utan riktad träning.'],
    target: (ph) => (ph >= 5 ? { value: 90, text: 'Mål i fas 5: minst 90 %' } : { value: 80, text: 'Kriterium för fas 5: minst 80 %' }),
  },
  {
    id: 'hip_flex', name: 'Höftflexion', short: 'Flexion', unit: '°', measures: 'Rörlighet (goniometer)', higher: true, step: 1, min: 0, max: 140, fromPhase: 2,
    how: ['Mäts med goniometer, helst av fysioterapeut, i ryggliggande.', 'Böj höften så långt det går utan att bäckenet följer med.', 'Har du restriktioner: mät inte förbi 90° förrän de har upphört.'],
    target: (ph) => (ph >= 5 ? { value: 100, text: 'Cirka 100–110° vid 3 månader. Cirka 110–120° behövs för att knyta skor och ta på strumpor' } : { value: 90, text: 'Minst 90° vid 6 veckor' }),
  },
  {
    id: 'hip_hoosjr', name: 'HOOS JR', short: 'HOOS JR', unit: 'p', measures: 'Din egen skattning av funktionen (0–100)', higher: true, step: 1, min: 0, max: 100, fromPhase: 1,
    how: ['Ett kort frågeformulär om smärta och funktion – fysioterapeuten eller sjukhuset brukar ha det.', 'Skriv in totalpoängen (0–100, högre är bättre).'],
    target: (ph) => (ph >= 5 ? { value: 80, text: 'Omkring 80–85 vid 3–6 månader (nivåer från Rush-studien)' } : { value: 75, text: 'Omkring 75 vid 6 veckor' }),
  },
  {
    id: 'hip_ohs', name: 'Oxford Hip Score', short: 'Oxford', unit: 'p', measures: 'Din egen skattning av funktionen (0–48)', higher: true, step: 1, min: 0, max: 48, fromPhase: 1,
    how: ['Tolv frågor om smärta och funktion den senaste månaden – finns hos sjukhuset eller fysioterapeuten.', 'Skriv in totalpoängen (0–48, högre är bättre).'],
    target: () => ({ value: 40, text: 'Över 40 vid ett år räknas som ett bra resultat' }),
  },
];
export const HIP_TEST: Record<string, HipTest> = Object.fromEntries(HIP_TESTS.map((t) => [t.id, t]));

/** Tests worth doing now, in order. */
export const testsFor = (phase: number) => HIP_TESTS.filter((t) => t.fromPhase <= Math.max(1, phase));
/** Suggest a test round when the core tests are older than two weeks (from phase 2). */
export function testDue(phase: number, tests: TestResult[], now = new Date()): boolean {
  if (phase < 2) return false;
  const last = Math.max(0, ...tests.filter((t) => t.testId.startsWith('hip_')).map((t) => new Date(t.date).getTime()));
  return now.getTime() - last > 14 * 864e5;
}

// ---------------------------------------------------------------- Gait aids

export const AIDS: { id: HipAid; name: string; tip: string }[] = [
  { id: 'rollator', name: 'Rollator', tip: 'Gå med rollatorn tills du står stadigt och kan gå utan att halta med den.' },
  { id: 'tva', name: 'Två kryckor', tip: 'Fullbelastning om inget annat är sagt. Gå jämnt: krycka och opererat ben samtidigt.' },
  { id: 'en', name: 'En krycka', tip: 'Kryckan i handen på den friska sidan. Spara den ute, på hala underlag och långa sträckor.' },
  { id: 'kapp', name: 'Käpp', tip: 'Käppen i handen på den friska sidan. Många går utan hjälpmedel inomhus efter 2–3 veckor.' },
  { id: 'ingen', name: 'Inga hjälpmedel', tip: 'Ta fram kryckan igen om du börjar halta – en halt som sätter sig är svår att träna bort.' },
];
export const nextAid = (a: HipAid | undefined): HipAid | null => {
  const i = AIDS.findIndex((x) => x.id === (a ?? 'tva'));
  return i >= 0 && i < AIDS.length - 1 ? AIDS[i + 1].id : null;
};

// ---------------------------------------------------------------- Timeline from the operation

export interface Milestone { day: number; title: string; text: string; only?: (p: Profile) => boolean }

/** Days after the operation when practice usually changes (report parts 2, 4, 8 and the care pathway). */
export const MILESTONES: Milestone[] = [
  { day: 0, title: 'Operationen – rehaben börjar samma dag', text: 'Upp och stå samma dag eller dagen efter. Fullbelastning om inget annat sagts, för både cementerad och ocementerad protes.' },
  { day: 1, title: 'Hem efter 1–2 dygn', text: 'När du klarar förflyttningar, gång med hjälpmedel och trappa, och såret är torrt.' },
  { day: 12, title: 'Stygntagning och sårkontroll', text: 'Oftast efter 10–14 dagar, via telefon eller besök. Bad och bassäng väntar tills såret är helt läkt.' },
  { day: 14, title: 'Bilkörning tidigast – om du klarar kraven', text: 'Utan opioider, klarar en nödbromsning utan tvekan och tar dig i och ur bilen. Efter vänster höft och automatväxlad bil påverkas inte bromsfoten.' },
  { day: 28, title: 'Senast nu: första kontakten med fysioterapeut', text: 'Inom 4 veckor enligt vårdförloppet – inom en vecka om egenträningen känns osäker. En utomstående blick på gång och abduktorer är värdefull.' },
  { day: 28, title: 'Trombosprofylaxen brukar ta slut', text: 'Vårdförloppet rekommenderar 4 veckor. Följ din ordination och avbryt inte i förtid.' },
  { day: 28, title: 'Samliv', text: 'Många kirurger anser att cirka en månad är rimligt. Den opererade parten ligger gärna underst i ryggläge till att börja med.' },
  { day: 30, title: 'Bassäng när såret är läkt', text: 'Oftast efter 3–6 veckor. Crawlspark är skonsammare än bröstsimmets grodspark.' },
  { day: 30, title: 'Stillasittande arbete', text: 'Kan ofta återupptas efter 2–6 veckor.' },
  { day: 42, title: 'Restriktionerna brukar upphöra', text: 'Kapsel och senor tål de flesta vardagsrörelser efter cirka 6 veckor. Vid sidosnitt brukar abduktion mot motstånd få börja.' },
  { day: 49, title: 'Gradvis åter till fysiskt arbete', text: 'Vid måttlig belastning, till exempel 50 % vid 6–8 veckor.' },
  { day: 84, title: 'Uppföljning på sjukhuset', text: 'Med läkare eller fysioterapeut efter cirka 3 månader. Benet runt en ocementerad protes anses nu i huvudsak inväxt.' },
  { day: 90, title: 'Golf och planerad tandvård', text: 'Golf kan ofta återupptas efter cirka 3 månader. Planerad tandbehandling väntar till efter 3 månader.' },
  { day: 120, title: 'Full arbetsförmåga vid måttlig belastning', text: 'Socialstyrelsens beslutsstöd anger upp till 4 månader.' },
  { day: 182, title: 'Lätt jogging – efter samtal med kirurgen', text: 'Tre av fyra kirurger i European Hip Societys enkät tillåter jogging efter 6 månader. Kontaktidrotter avråds.' },
  { day: 365, title: 'Ett år: registrets enkät', text: 'Ledprotesregistret frågar om smärta, livskvalitet och nöjdhet. Målet är symmetrisk styrka – fortsätt med abduktorerna.' },
  { day: 730, title: 'Två år', text: 'Remodelleringen runt protesen är klar. Abduktorerna är ofta fortfarande svagare – fortsätt träna dem.' },
];

// ---------------------------------------------------------------- Before the operation (report part 2)

export const PREP: { id: string; group: string; text: string }[] = [
  { id: 'trana', group: 'Träna', text: 'Styrka för säte, lår och vad 2–3 gånger i veckan, plus cykel eller promenader' },
  { id: 'lara', group: 'Träna', text: 'Lär dig övningarna för de första dagarna: fotpumpar, lårspänning, hälglidning' },
  { id: 'kryckor', group: 'Träna', text: 'Prova ut kryckor och öva gång och trappa med dem' },
  { id: 'hemmet', group: 'Hemmet', text: 'Ta bort lösa mattor och sladdar, skapa fria gångar' },
  { id: 'stol', group: 'Hemmet', text: 'En stol med armstöd och lagom hög sits, och det du behöver i midjehöjd' },
  { id: 'hjalp', group: 'Hemmet', text: 'Ordna hjälp med handling och tunga lyft de första veckorna' },
  { id: 'rok', group: 'Hälsa', text: 'Rökstopp minst 4 och helst 8 veckor före och efter, och inget riskbruk av alkohol' },
  { id: 'socker', group: 'Hälsa', text: 'Har du diabetes: blodsockret stabilt (HbA1c under cirka 53–64 mmol/mol)' },
  { id: 'tander', group: 'Hälsa', text: 'Gå till tandläkaren om tänderna behöver åtgärdas – före operationen' },
  { id: 'hud', group: 'Hälsa', text: 'Hel hud kring höften – sår eller eksem kan göra att operationen ställs in' },
  { id: 'kortison', group: 'Hälsa', text: 'Ingen kortisoninjektion i höften de sista 3 månaderna' },
  { id: 'fraga', group: 'Fråga kirurgen', text: 'Vilket snitt, vilken fixation, kapselreparation – och gäller några restriktioner för just mig?' },
];

// ---------------------------------------------------------------- Warning signs (report part 6)

export interface Warning { title: string; signs: string; act: string; urgent?: boolean }
export const WARNINGS: Warning[] = [
  { title: 'Luxation – höften har hoppat ur led', signs: 'Plötslig kraftig smärta, ofta med ett klick. Du kan inte stå på benet, som ser kortare och vridet ut.', act: 'Akut till sjukhus – ring 112. Försök inte dra den på plats själv.', urgent: true },
  { title: 'Lungemboli', signs: 'Plötslig andnöd, smärta i bröstet när du andas, hjärtklappning, blodiga upphostningar.', act: 'Ring 112.', urgent: true },
  { title: 'Blodpropp i benet', signs: 'Ensidig svullnad i vaden, värme och ömhet, smärta som ökar när du går.', act: 'Akut bedömning samma dag – ring 1177 eller åk in.', urgent: true },
  { title: 'Fraktur kring protesen', signs: 'Plötslig smärta efter ett fall eller en vridning, och du kan inte belasta.', act: 'Akut röntgen – åk in.', urgent: true },
  { title: 'Djup infektion', signs: 'Feber, värk i vila som ökar efter att det först blivit bättre, eller läckage från såret mer än 72 timmar efter operationen.', act: 'Kontakta kliniken där du opererades direkt. Antibiotika ska inte startas på chans innan odling tagits.', urgent: true },
  { title: 'Ytlig sårinfektion', signs: 'Rodnad, värme, ökande smärta eller vätska från såret.', act: 'Kontakta den opererande enheten samma dag.' },
  { title: 'Nervpåverkan', signs: 'Droppfot eller domning på fotryggen, knät viker sig, eller domning och sveda på lårets utsida (vanligast efter främre snitt).', act: 'Svaghet i musklerna: kontakta kirurgen. Domning på lårets utsida går ofta över på månader.' },
  { title: 'Ökande stelhet', signs: 'Rörligheten minskar gradvis efter 4–12 veckor, ibland med smärta (heterotop ossifikation).', act: 'Ta upp det med kirurgen – röntgen avgör.' },
  { title: 'Smärta på höftens utsida', signs: 'Ömt över den yttre höftknölen, ont att ligga på sidan.', act: 'Belastningsanpassad abduktorträning, undvik att stå med korsade ben. Fråga fysioterapeuten.' },
  { title: 'Benet känns längre', signs: 'Vanligt de första veckorna på grund av spända muskler och sned bäckenställning.', act: 'Minskar ofta inom 3–6 månader. Låt mäta verklig benlängd innan du skaffar inlägg.' },
  { title: 'Halt som sitter kvar', signs: 'Du haltar fortfarande efter 3–6 månader trots träning.', act: 'Låt mäta abduktionsstyrkan. Ökar den inte bör abduktorerna och nerven undersökas.' },
];
