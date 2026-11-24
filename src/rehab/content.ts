// Rehab mode content: what each phase is about, its goals, and the course ("Lär dig").
// Sources: see src/core/sources.ts 38–48 and docs/kunskap/hoftprotes.md.

export const REHAB = 'rgb(var(--rehab))';
export const rehabTint = (a: number) => `rgb(var(--rehab) / ${a})`;

export interface PhaseInfo { focus: string; goals: string[]; walking: string; next: string }

export const PHASE_INFO: Record<number, PhaseInfo> = {
  1: {
    focus: 'Läka, minska svullnaden och komma igång med gången. Små övningar ofta – flera gånger om dagen.',
    goals: ['Gå säkert inomhus med kryckor eller rollator', 'Klara fotpumpar och lårspänningar flera gånger om dagen', 'Ta dig i och ur säng och stol på egen hand'],
    walking: 'Flera korta promenader om dagen, med kryckor eller rollator. Öka lite i taget.',
    next: 'Stående övningar och uppresning från stol – du börjar använda höften mer.',
  },
  2: {
    focus: 'En jämnare gång och mer rörlighet i vardagen. Du börjar stå och belasta i övningarna.',
    goals: ['Gå 10–15 minuter utan att halta mycket', 'Resa dig från en vanlig stol med lite hjälp av händerna', 'Gå i trappa med räcke'],
    walking: 'Längre promenader, 10–20 minuter. Gå från två kryckor till en när det känns stadigt.',
    next: 'Mer styrka, step-ups och motionscykel – och hjälpmedlen kan börja släppas.',
  },
  3: {
    focus: 'Bygga styrka i höft och lår och släppa hjälpmedlen. Övningarna blir svårare i takt med att du blir starkare.',
    goals: ['Gå utan hjälpmedel och utan att halta', 'Klara step-up på ett 15–20 cm högt steg', 'Cykla 15–20 minuter på motionscykel'],
    walking: 'Promenader 20–30 minuter, och gärna motionscykel – skonsam och bra för höften.',
    next: 'Styrketräning med vikter: knäböj, utfallsböj och marklyft i lätta varianter.',
  },
  4: {
    focus: 'Tillbaka till riktig styrketräning, med vikter och svårare varianter – och överkroppen får också vara med.',
    goals: ['Knäböj mot bänk med vikt', 'Utfallsböj med kontroll på båda benen', 'Promenera 30–45 minuter i rask takt'],
    walking: 'Längre promenader, vandring och cykel. Löpning först efter klartecken från din kirurg.',
    next: 'Långsiktig styrka – höften för livet. Mer frihet att välja övningar och aktiviteter.',
  },
  5: {
    focus: 'Höften för livet: styrka 2–3 gånger i veckan, daglig rörelse och aktiviteter du tycker om.',
    goals: ['Styrketräna 2–3 gånger i veckan', 'Röra dig minst 30 minuter om dagen', 'Löpning och hopp bara efter klartecken'],
    walking: 'Promenader, cykel, simning eller vandring. Prata med din kirurg innan löpning och hopp.',
    next: 'Du kan när som helst lämna rehabläget och använda hela appen.',
  },
};

export interface Lesson { id: string; phase: number; title: string; minutes: number; lead: string; sections: { h?: string; p: string[] }[]; sources: number[] }

export const LESSONS: Lesson[] = [
  {
    id: 'valkommen', phase: 1, minutes: 2, title: 'Välkommen till rehabläget',
    lead: 'Här finns allt du behöver efter din höftoperation – en plan för varje dag, program som växer med dig och kunskap att förstå varför.',
    sections: [
      { h: 'Så fungerar det', p: ['Appen räknar veckorna sedan din operation och delar in rehabiliteringen i fem faser. Varje dag får du en plan: ett rehabpass, en promenad och en kort lektion. Öppna appen och följ planen – resten sköter den.', 'Varje morgon frågar appen hur höften känns, och efter varje pass hur ont det gjorde. Svaren styr hur tungt nästa pass blir.'] },
      { h: 'Din kirurg och fysioterapeut först', p: ['Följ alltid det program och de restriktioner du fått vid operationen. Appen hjälper dig att hålla igång och bygga vidare – den ersätter inte deras bedömning [38][39].'] },
      { h: 'Den vanliga appen', p: ['Rehabläget är en egen del av Pelare. När du är klar, eller om din fysioterapeut säger att du kan träna fritt, trycker du på "Lämna" överst på I dag. Du kan alltid komma tillbaka via Inställningar.'] },
    ],
    sources: [38, 39],
  },
  {
    id: 'forsta-dagarna', phase: 1, minutes: 3, title: 'De första dagarna hemma',
    lead: 'Kroppen har varit med om en stor operation. De första veckorna handlar om att läka, hålla blodet i rörelse och komma igång lugnt.',
    sections: [
      { h: 'Rör på dig – lite och ofta', p: ['Gå korta sträckor flera gånger om dagen och gör fotpumparna ofta. Det håller igång blodcirkulationen och minskar risken för blodpropp [39].', 'De flesta får blodförtunnande läkemedel i ungefär fyra veckor. Ta dem som du fått ordinerat.'] },
      { h: 'Svullnad och smärta', p: ['Svullnad är vanligt. Vila gärna med benet i högläge. Ta smärtlindring enligt ordination – det gör att du orkar röra dig, vilket i sin tur hjälper läkningen.'] },
      { h: 'Såret', p: ['Följ klinikens råd om förband och dusch. Den nya leden är känslig för infektion – hör av dig om såret blir rött, varmt eller vätskar, eller om du får feber [39].'] },
      { h: 'Sömn', p: ['Många sover sämre de första veckorna. Det blir bättre. Kudde mellan knäna kan göra sidoläge skönare – fråga din fysioterapeut vilka lägen som är okej för dig.'] },
    ],
    sources: [39],
  },
  {
    id: 'restriktioner', phase: 1, minutes: 3, title: 'Restriktioner – och varför de är tillfälliga',
    lead: 'De första veckorna brukar man få råd om rörelser att undvika. De är tillfälliga.',
    sections: [
      { h: 'Vanliga råd', p: ['Bakre snitt: böj inte höften mer än 90°, korsa inte benen och vrid inte benet inåt. Sidosnitt: inga aktiva benlyft åt sidan. Främre snitt: undvik att sträcka benet bakåt och samtidigt vrida ut foten. Råden varierar mellan sjukhus – följ dina [40][47].'] },
      { h: 'Vad forskningen säger', p: ['Studier har inte kunnat visa att restriktionerna minskar risken att höften hoppar ur led [41][42]. Många sjukhus använder därför färre restriktioner i dag. Men din kirurg känner din operation – följ deras råd.'] },
      { h: 'De har ett slutdatum', p: ['Oftast gäller de ungefär 6 veckor. Sedan handlar det om att gradvis använda höften fullt ut igen – utan att tvinga in den i lägen som gör ont [48].'] },
    ],
    sources: [40, 41, 42, 47, 48],
  },
  {
    id: 'smarta', phase: 1, minutes: 2, title: 'Smärta: vad är okej?',
    lead: 'Det är normalt att det gör lite ont när du tränar efter en operation. Frågan är hur mycket.',
    sections: [
      { h: 'Upp till 5 av 10', p: ['Pelare använder smärtmonitoreringsmodellen: smärta upp till 5 på en skala 0–10 under passet är okej, om den har lagt sig till nästa morgon [45]. Därför frågar appen efter varje pass och varje morgon.'] },
      { h: 'När appen tar det lugnare', p: ['Gjorde det mer ont än 5, eller är höften klart ömmare på morgonen, blir nästa pass lättare: ett set färre och färre reps. Blir det inte bättre efter några dagar – prata med din fysioterapeut.'] },
      { h: 'Smärtfri är inte alltid målet', p: ['Fysioterapeuten med egen höftprotes beskriver det bra: han undviker det som ger rejäla besvär, men accepterar lätt obehag – så länge det inte stör sömnen eller vardagen [48].'] },
    ],
    sources: [45, 48],
  },
  {
    id: 'kryckor', phase: 1, minutes: 2, title: 'Gå med kryckor – och sluta i rätt takt',
    lead: 'Kryckorna är inte ett tecken på att det går dåligt. De gör att du går jämnare och läker bättre.',
    sections: [
      { h: 'Ungefärlig takt', p: ['Många går med två kryckor de första veckorna, med en krycka från ungefär vecka 3 och utan från ungefär vecka 6 – men det är individuellt [38]. Med en krycka håller du den i handen på den friska sidan.'] },
      { h: 'Trappor', p: ['Uppför: först det friska benet, sedan det opererade och kryckan. Nedför: först kryckan och det opererade benet, sedan det friska. "Upp med det friska, ner med det onda."'] },
      { h: 'Ha inte bråttom', p: ['Att släppa kryckorna för tidigt är det vanligaste misstaget – det kan ge en haltande gång som sitter kvar. Använd dem så länge du behöver [48].'] },
    ],
    sources: [38, 48],
  },
  {
    id: 'vardagen', phase: 2, minutes: 3, title: 'Vardagen: stol, säng, bil och strumpor',
    lead: 'Små knep gör vardagen enklare medan höften läker.',
    sections: [
      { h: 'Sitta och resa sig', p: ['Välj en stol med armstöd och lagom hög sits. Flytta dig fram till kanten, ha det opererade benet lite framför och res dig med hjälp av armstöden. Övningen "uppresning från stol" tränar precis detta.'] },
      { h: 'Bil', p: ['Ställ sätet bakåt. Sätt dig först med rumpan, och lyft sedan in benen tillsammans. Kliv ur i omvänd ordning. Fråga din kirurg när du får köra själv.'] },
      { h: 'Strumpor och skor', p: ['Strumppådragare, griptång och skohorn med långt skaft gör det lättare så länge du har restriktioner. Arbetsterapeuten på sjukhuset visar hur.'] },
    ],
    sources: [39, 40],
  },
  {
    id: 'styrka', phase: 2, minutes: 2, title: 'Därför är styrketräning nyckeln',
    lead: 'Musklerna runt höften har tagit stryk – både av operationen och ofta av år med artros innan.',
    sections: [
      { h: 'Starka muskler, bättre funktion', p: ['Starkare säte och lår gör gång, trappor och att resa sig lättare, och minskar risken att falla. Progressiv styrketräning har i flera studier förbättrat styrka och funktion, men forskningen om exakt vilket program som är bäst är fortfarande osäker [43].'] },
      { h: 'Sätet först', p: ['Höftlyft och benlyft åt sidan tränar sätets muskler, som påverkas mest av ingreppet – särskilt vid bakre och sidosnitt [48].'] },
      { h: 'Båda benen', p: ['Träna båda sidorna. Det är helt normalt att det opererade benet är svagare länge – målet är små framsteg på båda [48].'] },
    ],
    sources: [43, 48],
  },
  {
    id: 'progression', phase: 3, minutes: 2, title: 'Så ökar du: 5 till 20 reps',
    lead: 'En enkel tumregel håller dig på rätt nivå hela vägen.',
    sections: [
      { h: 'Regeln', p: ['Du ska klara minst 5 reps med god kontroll – annars gör övningen lättare. Klarar du fler än 20 – gör den svårare: en svårare variant, en vikt eller ett band [48].'] },
      { h: 'Så gör appen', p: ['När du når toppen av repintervallet i alla set föreslår appen nästa steg. Gjorde det ont mer än 5 av 10 står appen kvar på samma nivå.'] },
      { h: 'Upplägg', p: ['3–5 övningar, 2–3 gånger i veckan, 2–3 set per övning. Det räcker långt [48].'] },
    ],
    sources: [48],
  },
  {
    id: 'kondition', phase: 3, minutes: 2, title: 'Kondition: cykel och promenad',
    lead: 'Hjärta och lungor behöver träning också – och höften gillar cykel.',
    sections: [
      { h: 'Motionscykel', p: ['Motionscykel brukar kunna börja runt vecka 3 om du har lov – sätt sadeln högt så att höften inte böjs för mycket [46]. Den är skonsam och bygger både kondition och rörlighet.'] },
      { h: 'Promenader', p: ['Öka gradvis mot 30 minuter om dagen. Det får ta tid – ett år eller två är helt okej [48].'] },
      { h: 'Senare', p: ['Simning, roddmaskin och crosstrainer fungerar bra längre fram. Efter ungefär 3 månader brukar mer krävande träning kunna börja, enligt flera regioners patientinformation [47].'] },
    ],
    sources: [46, 47, 48],
  },
  {
    id: 'gymmet', phase: 4, minutes: 3, title: 'Tillbaka till gymmet',
    lead: 'Nu kan du träna som andra – med några smarta val.',
    sections: [
      { h: 'Övningar som brukar fungera', p: ['Utfallsböj med hantlar, rumänsk marklyft, step-ups, höftlyft och benspark i maskin. Benspark tolereras av de flesta och gör trappor och knäböj lättare [48].'] },
      { h: 'Knäböj', p: ['Gör det obehagligt i botten: ställ hälarna på en liten upphöjning så att överkroppen blir mer upprätt, eller välj utfallsböj i stället – det ger samma resultat för många [48].'] },
      { h: 'Glöm inte resten', p: ['Överkropp, vader och bål ingår också. Och träna båda sidorna – det opererade benet får vara svagare länge.'] },
    ],
    sources: [48],
  },
  {
    id: 'sport', phase: 4, minutes: 3, title: 'Sport, löpning och hopp',
    lead: 'Många kommer tillbaka till sina aktiviteter – men takten och valen spelar roll.',
    sections: [
      { h: 'Det vanliga', p: ['De flesta är tillbaka på gång, vandring och andra lugnare aktiviteter efter 7–12 månader [44]. Cykel, golf och simning är vanliga val.'] },
      { h: 'Löpning', p: ['Det finns ingen samsyn bland kirurger om löpning efter höftprotes, och rekommendationerna har blivit mindre restriktiva i takt med bättre proteser [44]. Prata alltid med din kirurg först.'] },
      { h: 'I appen', p: ['När du har fått klartecken markerar du det under Inställningar. Då blir löpprogrammen och de djupare höftstretcharna tillgängliga i fas 5.'] },
    ],
    sources: [44],
  },
  {
    id: 'for-livet', phase: 5, minutes: 2, title: 'Höften för livet',
    lead: 'En ny höft ska ge ett bättre liv – och du är troligen mer kapabel än du tror.',
    sections: [
      { h: 'Fortsätt träna', p: ['Styrka 2–3 gånger i veckan och daglig rörelse håller dig stark, rörlig och minskar fallrisken – viktigare ju äldre man blir [48].'] },
      { h: 'Jämför inte', p: ['Alla har sin egen resa och sin egen takt. Jämför dig inte med andra, och inte heller med hur det var innan [48].'] },
      { h: 'Hör av dig om', p: ['Höften plötsligt gör ont, svullnar eller känns instabil – även flera år senare. Den nya leden är alltid känslig för infektion [39].'] },
    ],
    sources: [39, 48],
  },
];

export const lessonsFor = (phase: number) => LESSONS.filter((l) => l.phase <= phase);
