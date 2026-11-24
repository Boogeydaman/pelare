// Rehab mode content: what each phase is about, and the textbook ("Lär dig").
// Built from the user's research report on rehab after a total hip replacement (src/core/sources.ts 49–75)
// together with the care pathway [38], 1177 [39] and the pain-monitoring model [45].

export const REHAB = 'rgb(var(--rehab))';
export const rehabTint = (a: number) => `rgb(var(--rehab) / ${a})`;

export interface PhaseInfo {
  focus: string; // one line for I dag
  goals: string[]; // main goals of the phase
  body: string[]; // what happens in the body
  avoid: string[];
  walking: string; // walking and cardio
  next: string;
}

export const PHASE_INFO: Record<number, PhaseInfo> = {
  0: {
    focus: 'Bli så stark och förberedd som möjligt: styrka 2–3 gånger i veckan, lär dig övningarna för de första dagarna och gör i ordning hemmet.',
    goals: ['Styrketräna säte, lår och vad 2–3 gånger i veckan', 'Kunna övningarna för dag 1 och gå med kryckor', 'Hemmet förberett och riskfaktorerna åtgärdade'],
    body: ['Bättre funktion före operationen förutsäger en snabbare återhämtning efteråt, även om prehab i sig har liten mätbar effekt efter höftprotes.', 'Artrosen har ofta gjort musklerna kring höften svagare under flera år – varje kilo styrka du bygger nu är en tillgång efteråt.'],
    avoid: ['Kortisoninjektion i höften de sista 3 månaderna', 'Rökning och riskbruk av alkohol – minst 4, helst 8 veckor före', 'Sår och eksem kring höften'],
    walking: 'Cykel och promenader 2–3 gånger i veckan, i den mån höften tillåter. Cykel är ofta skonsammare än gång vid artros.',
    next: 'Operationen – och rehaben börjar redan samma dag.',
  },
  1: {
    focus: 'Säker mobilisering och smärtkontroll: upp och gå samma dag eller dagen efter, och klara förflyttningarna själv.',
    goals: ['Stå och gå samma dag eller dagen efter', 'Smärta under 4 av 10 i vila', 'Klara förflyttningar på egen hand och bli utskriven'],
    body: ['Operationen startar en inflammation: svullnad, och CRP som toppar dag 2–3. Blåmärken som sjunker mot knä och fot syns ofta först dag 3–7 – det är normalt.', 'Svullnad och smärta bromsar signalerna till lår och säte (artrogen muskelhämning). Därför känns benet tungt och "dött" – och därför ska du aktivera musklerna tidigt.', 'En cementerad protes sitter fast direkt. En ocementerad sitter med press-fit, och benet har ännu inte börjat växa in.'],
    avoid: ['Ordinerade restriktioner', 'Gång utan hjälpmedel för tidigt', 'Långvarigt sängliggande', 'Kudde under knät länge – höft och knä kan bli stela i böjt läge', 'Att resa dig ensam första gången'],
    walking: 'Korta promenader med rollator eller två kryckor, fullbelastning om inget annat sagts. Öka efter förmåga. Fotpumpar 20–30 gånger varje vaken timme.',
    next: 'Hemma: ett daglig hemprogram och flera promenader om dagen.',
  },
  2: {
    focus: 'Sårläkning, mindre svullnad och en jämnare gång. Hemprogrammet 1–2 gånger om dagen och flera korta promenader.',
    goals: ['Läkt sår och tagna stygn (oftast efter 10–14 dagar)', 'Gång utan att halta med en krycka eller käpp – sedan utan hjälpmedel inomhus', 'Minskande smärta och svullnad'],
    body: ['Kroppen bygger ny vävnad (proliferationsfasen). Huden är läkt efter 1–2 veckor, men sår, kapsel och senor är fortfarande svaga och blir starkare under månader.', 'Kapselreparationen efter bakre snitt och abduktorsenan efter sidosnitt är mest sårbara de första 6 veckorna.', 'Vid ocementerad protes börjar benet växa in i protesytan.', 'Typiska kompensationer i gången: kortare steg med det opererade benet, mindre sträckning i höften och att överkroppen lutar åt den opererade sidan.'],
    avoid: ['Bad, bubbelpool och bassäng tills såret är helt läkt', 'Att sitta stilla mer än 45–60 minuter i taget', 'Överbelastning som ger klart ökad smärta eller svullnad nästa dag', 'Restriktionsrörelser om du har restriktioner'],
    walking: '3–6 promenader om dagen på 5–15 minuter. Öka med cirka 10–20 % i veckan och fokusera på steglängd, hälisättning och att sträcka höften.',
    next: 'Progressiv styrketräning med motstånd, balans och kondition – och hjälpmedlen släpps.',
  },
  3: {
    focus: 'Gå utan hjälpmedel och utan att halta, och börja med riktig progressiv styrketräning – 3–5 pass i veckan.',
    goals: ['Gå utan hjälpmedel och utan halt', 'Gå växelvis i trappa', 'Stå minst 10 sekunder på det opererade benet', '30 sekunders uppresning nära din åldersnorm'],
    body: ['Kollagenet mognar och lägger sig efter belastningen – belastning är själva signalen för ombyggnaden. Senor och kapsel tål progressiv belastning, men inte plötsliga ytterlägen.', 'Muskelhämningen minskar när svullnaden går ner, men förmågan att snabbt utveckla kraft är fortfarande nedsatt.', 'Kapselns känselkroppar är delvis borta – därför blir muskulär kontroll och balansträning viktigare.'],
    avoid: ['Plötsliga rotationer i ytterlägen för ditt snitt', 'Abduktion mot motstånd efter sidosnitt utan klartecken', 'Restriktionsrörelser fram till 6 veckor om du har sådana', 'Bilkörning innan du klarar en nödbromsning och slutat med opioider'],
    walking: 'Gå 20–40 minuter om dagen, gärna i tempo och backar. Motionscykel 10–20 minuter med hög sadel först.',
    next: 'Tung styrketräning mot symmetri, och mer kondition.',
  },
  4: {
    focus: 'Systematisk tung styrketräning mot symmetri i abduktion, sträckning och benpress – och uthållighet.',
    goals: ['Abduktionsstyrka minst 80 % av andra sidan', '6 minuters gångtest och 40 m snabbgång nära normen', 'Ingen halt efter 30 minuters promenad'],
    body: ['Kapsel och senor tål de flesta vardagsrörelser efter cirka 6 veckor – därför tar de flesta sjukhus bort restriktionerna då.', 'Vid ocementerad protes anses benet i huvudsak inväxt efter 6–12 veckor.', 'Muskeltillväxt märks först efter 6–8 veckors progressiv belastning – styrkeökningen dittills har mest varit nervsystemet som lärt sig.', 'Fettinlagring och muskelförtvining kring höften kan finnas kvar i 2 år eller mer, och förklarar varför symmetri tar tid.'],
    avoid: ['Löpning, hopp och snabba riktningsförändringar', 'Kontaktidrott', 'Bröstsimmets grodspark de första 6–12 veckorna efter främre och sidosnitt'],
    walking: '2–3 konditionspass i veckan på 20–45 minuter: cykel, crosstrainer, bassäng eller stavgång.',
    next: 'Full funktion: idrott, arbete och styrka för livet.',
  },
  5: {
    focus: 'Symmetrisk styrka – minst 90 % av friska sidan, särskilt abduktorerna – och tillbaka till idrott och arbete.',
    goals: ['Styrka minst 90 % av friska sidan, särskilt abduktorerna', 'Ingen halt, inte heller efter lång gång', 'Styrketräning 2–3 gånger i veckan och 150–300 minuter kondition'],
    body: ['Ombyggnaden av kapsel, senor och ben kring protesen pågår i 12–18 månader.', 'Kvarstående svaghet är regel, inte undantag: i en svensk studie var abduktorerna 15 % svagare efter två år.', 'Snabb kraftutveckling återhämtar sig långsammast – därför explosiva övningar nu.'],
    avoid: ['Högimpaktidrott utan erfarenhet och utan att ha pratat med kirurgen', 'Att sluta med abduktorträningen när det känns bra'],
    walking: 'Kondition enligt WHO: 150–300 minuter i veckan på måttlig intensitet. Lätt jogging efter samtal med kirurgen, ofta efter 6 månader.',
    next: 'Du kan när som helst lämna rehabläget och använda hela appen.',
  },
};

// ---------------------------------------------------------------- The textbook

export interface Section {
  h?: string;
  p?: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
  box?: { title: string; text: string };
  after?: string[]; // paragraphs after the list/table
}
export interface Chapter {
  id: string; part: number; title: string; minutes: number;
  phase: number; // when it is most relevant (0 = before the operation)
  lead: string;
  key: string[]; // "Det viktigaste"
  sections: Section[];
  sources: number[];
}

export const PARTS = ['Grunderna', 'Före och direkt efter operationen', 'Faserna i detalj', 'Kroppen och vardagen', 'Forskningen'];

export const CHAPTERS: Chapter[] = [
  // ======================================================== Del 1 – Grunderna
  {
    id: 'valkommen', part: 1, phase: 0, minutes: 3, title: 'Så använder du rehabläget och boken',
    lead: 'Rehabläget är en egen del av Pelare för tiden kring en höftprotes: en plan för varje dag, program som följer din läkning, tester som visar framstegen – och den här boken, som förklarar varför.',
    key: ['Du går vidare till nästa fas när du klarar kriterierna, inte när kalendern säger det.', 'Ditt sjukhus och din kirurg går alltid före – snitt, protes och hur operationen gick avgör vad som gäller för dig.', 'Räkna med minst ett års träning för att det opererade benet ska bli lika starkt som det andra.'],
    sections: [
      { h: 'Varje dag', p: ['På I dag finns dagens plan: ett rehabpass, promenader eller kondition, ibland ett test, och ett kapitel att läsa. Varje morgon svarar du på hur höften känns och om den är mer svullen, och efter varje pass hur ont det gjorde. Svaren styr hur tungt nästa pass blir.'] },
      { h: 'Faser och kriterier', p: ['Rehabiliteringen är indelad i fem faser som följer kroppens läkning, plus en förberedande fas före operationen. Varje fas har mål och kriterier. När du klarar dem bockar du i dem och går vidare. Läkningen sätter ett golv: du kan inte gå in i uppbyggnadsfasen före vecka 6, även om du känner dig redo [49].', 'Tiderna i appen är riktmärken. Många går fortare, en del långsammare – båda är normalt.'] },
      { h: 'Boken', p: ['Boken är skriven för att du ska förstå din höft, inte bara följa ett program. Den bygger på en genomgång av forskningen och svensk praxis [49] och är indelad i fem delar: grunderna, tiden kring operationen, faserna i detalj, kroppen och vardagen, och till sist en forskningsöversikt. Läs i den ordning appen föreslår, eller hoppa till det du undrar över.', 'Siffror inom hakparentes hänvisar till källorna längst ner i varje kapitel.'] },
      { box: { title: 'Viktigt', text: 'Appen ersätter inte din kirurg eller fysioterapeut. Får du andra besked från dem – följ dem. Vid varningstecken: se kapitlet Varningssignaler.' } },
    ],
    sources: [49, 38, 39],
  },
  {
    id: 'protesen', part: 1, phase: 0, minutes: 6, title: 'Din nya höftled',
    lead: 'En total höftprotes ersätter både lårbenets ledhuvud och ledskålen i bäckenet. Hur protesen är förankrad och vilka material den har påverkar rehaben mindre än man kan tro – men det är bra att veta.',
    key: ['Både cementerade och ocementerade proteser tål oftast full belastning från första dagen.', 'Benet växer in i en ocementerad protes under cirka 6–12 veckor.', 'Moderna proteser håller hos de flesta i 20–25 år eller längre.'],
    sections: [
      { h: 'Delarna', p: ['Stammen förankras i lårbenets märghåla och bär en ledkula av metall eller keramik. Cupen fästs i bäckenet och har oftast en ledyta av högkorsbunden plast (polyeten), som är förstahandsvalet i Sverige [49][38].'] },
      { h: 'Fixation – hur protesen sitter fast', table: { head: ['Typ', 'Princip', 'Betydelse för rehaben'], rows: [
        ['Cementerad', 'Bencement ger full stabilitet direkt', 'Fullbelastning direkt. Lägre risk för tidig fraktur kring protesen – förstahandsval hos äldre'],
        ['Ocementerad', 'Pressas in och har en porös eller belagd yta som benet växer in i under 6–12 veckor', 'Fullbelastning är oftast tillåten. Något högre risk för tidig fraktur, särskilt efter 75 års ålder'],
        ['Hybrid', 'Ocementerad cup, cementerad stam', 'Som cementerad'],
        ['Omvänd hybrid', 'Cementerad cup, ocementerad stam', 'Högre risk för omoperation i registren – används inte som standard'],
      ] }, after: ['Under 2024 var knappt hälften av proteserna i Sverige helt cementerade och en dryg tredjedel helt ocementerade [62]. Ocementerade proteser bör användas sparsamt efter 70 års ålder [38].'] },
      { h: 'Dual mobility', p: ['Vid hög risk för att höften hoppar ur led – vid omoperation, neuromuskulär sjukdom eller fraktur – används ibland en dual mobility-protes, där ett rörligt plastinlägg sitter mellan kulan och cupen. Det ger större marginal innan leden hoppar ur. I en svensk-brittisk frakturstudie luxerade 2,4 % med dual mobility mot 7,0 % med standardprotes [74]. Har du en sådan har du större skydd, men fråga kirurgen om eventuella restriktioner.'] },
      { h: 'Så länge håller den', p: ['Standardproteser i Sverige ska ha minst 95 % tioårsöverlevnad i registret, och de flesta moderna proteser håller i 20–25 år eller längre [38][49]. Den största långsiktiga risken är slitage och lossning – och vikten är den viktigaste faktorn du själv påverkar.'] },
      { h: 'Ta reda på vad du har', p: ['Operationsberättelsen i 1177 Journalen beskriver snitt, fixation, kulstorlek och om kapseln reparerades. Det styr hela rehaben – och du kan skriva in det under Inställningar så anpassar appen programmet.'] },
    ],
    sources: [49, 38, 62, 74],
  },
  {
    id: 'snitten', part: 1, phase: 0, minutes: 6, title: 'Snitten – och vad de betyder för dig',
    lead: 'Kirurgen når leden bakifrån, från sidan eller framifrån. Snittet avgör vilka vävnader som har lossats och sytts ihop igen, åt vilket håll leden är mest instabil tidigt – och därmed vad du ska vara försiktig med.',
    key: ['I Sverige dominerar bakre snitt (67 %) och direkt lateralt snitt (cirka 32 %).', 'Främre snitt ger en snabbare start men samma resultat efter 6 månader.', 'Efter sidosnitt är det abduktorsenan som ska skyddas – inte luxationen.'],
    sections: [
      { h: 'De tre snitten', table: { head: ['Snitt', 'Vad som påverkas', 'Instabil vid', 'Vanliga problem'], rows: [
        ['Bakre (posterolateralt)', 'Stora sätesmuskeln delas, korta utåtrotatorer och bakre kapseln lossas och sys oftast tillbaka', 'Böj + inåt + inåtvridning', 'Historiskt högre luxationsrisk, som minskar med kapselreparation och större kulor'],
        ['Direkt lateralt (Hardinge)', 'Främre delen av gluteus medius och vastus lateralis lossas från trokantern och sys tillbaka', 'Sträck + inåt + utåtvridning', 'Abduktorsvaghet, Trendelenburghalt, smärta över trokantern'],
        ['Främre (DAA)', 'Mellan musklerna på framsidan. Främre kapseln öppnas', 'Sträck + utåtvridning', 'Domning på lårets utsida, sårproblem vid övervikt, lång inlärningskurva för kirurgen'],
      ] } },
      { h: 'Vad forskningen säger', p: ['En sammanställning av 24 randomiserade studier med drygt 2 000 patienter visade bättre funktion vid 6 veckor med främre snitt jämfört med bakre, och kortare vårdtid. Mot sidosnitt var skillnaden liten vid 12 veckor, och efter 6 månader fanns inga säkra skillnader alls. Luxation, frakturer och blodproppar skilde sig inte [61].', 'Främre snitt ger däremot kraftigt ökad risk att skada känselnerven på lårets utsida – oftast övergående, men ibland långvarigt [49].', 'Det svenska vårdförloppet konstaterar att inget snitt har visat sig ha fler fördelar, och rekommenderar bakre eller direkt lateralt snitt utifrån operatörens erfarenhet, med kapselreparation vid bakre snitt [38].'] },
      { h: 'I Sverige', p: ['Under 2024 opererades 67 % med bakre snitt och cirka 32 % med direkt lateralt snitt av drygt 21 000 planerade totalproteser. Främre snitt är ovanligt [62].'] },
      { box: { title: 'Om du inte vet', text: 'Sök i operationsberättelsen efter "bakre snitt", "posterior", "Hardinge", "direkt lateral" eller "anterior/DAA" – och efter kapselreparation, kulstorlek och fixation.' } },
    ],
    sources: [49, 61, 62, 38],
  },
  {
    id: 'lakning', part: 1, phase: 1, minutes: 6, title: 'Läkningen – kroppens tidtabell',
    lead: 'Faserna i rehaben är inte påhittade. De följer de tre stegen i all vävnadsläkning – och de tidpunkter där vården brukar ändra sina råd.',
    key: ['Inflammation dag 0–5, nybildning vecka 1–6, ombyggnad från 6 veckor till 12–18 månader.', 'Belastning är signalen som styr ombyggnaden – vävnaden blir stark av att användas.', 'Musklerna är som svagast den första veckan, och artrosen har ofta gjort dem svaga redan före.'],
    sections: [
      { h: 'Tre steg', table: { head: ['Steg', 'Tid', 'Vad som händer'], rows: [
        ['Inflammation', 'Dag 0–5', 'Kroppen reagerar på det kirurgiska ingreppet: svullnad, värme, CRP som toppar dag 2–3'],
        ['Nybildning (proliferation)', 'Vecka 1–6', 'Ny vävnad och kollagen bildas. Huden läker på 1–2 veckor, men sår, kapsel och senor är fortfarande svaga'],
        ['Ombyggnad (remodellering)', '6 veckor–18 månader', 'Kollagenet mognar och lägger sig efter belastningen. Benet kring protesen anpassar sig'],
      ] } },
      { h: 'Varför benet känns dött', p: ['Svullnad, smärta och skadade känselkroppar i ledkapseln minskar nervsystemets förmåga att aktivera framför allt lårets framsida och sätet. Det kallas artrogen muskelhämning. Därför känns benet tungt de första dagarna – och därför är tidig aktivering och god smärtlindring så viktigt [49].', 'Styrkan sjunker ytterligare den första veckan jämfört med före operationen [54], och utgångsläget är ofta redan svagt efter flera år med artros.'] },
      { h: 'Brytpunkterna', list: ['Cirka 2 veckor: stygnen tas och såret är läkt – bad och bassäng blir möjligt något senare.', 'Cirka 6 veckor: kapsel och senor tål de flesta vardagsrörelser. Restriktioner brukar tas bort.', 'Cirka 12 veckor: benet anses i huvudsak inväxt i en ocementerad protes. Uppföljning på sjukhuset.', '12–18 månader: ombyggnaden är klar.'] },
      { h: 'Belastning är medicin', p: ['Kollagen och ben byggs om efter de krafter de utsätts för (mekanotransduktion). Vila skyddar inte vävnaden – den gör den svagare. Det som skadar är plötsliga ytterlägen och för stor ökning för fort. Därför ökar programmet gradvis, och därför används kriterier i stället för datum [49].'] },
    ],
    sources: [49, 54],
  },
  {
    id: 'principer', part: 1, phase: 1, minutes: 5, title: 'Principerna bakom programmet',
    lead: 'Den bästa evidensen pekar på en snabb och kriteriestyrd rehab: belasta så mycket smärtan tillåter från första dagen, och börja tidigt med progressiv styrketräning – med extra fokus på abduktorerna.',
    key: ['Fullbelastning från dag 0 om inget annat sagts.', 'Dosen betyder mer än om träningen är ledd eller görs hemma.', 'Abduktorerna – sätets sidomuskler – ska prioriteras i 12–24 månader.'],
    sections: [
      { h: 'Sex principer', list: [
        'Kriterier före kalender. Gå vidare när du klarar målen – fastabellen och testerna i appen visar vad som krävs.',
        'Belasta efter förmåga. Full belastning är standard för både cementerade och ocementerade proteser [60].',
        'Progressiv styrketräning tidigt. Tung benpress och abduktion från de första veckorna gav mer styrka än vanlig sjukgymnastik, utan fler komplikationer [53][54].',
        'Abduktorerna först. De är ofta svagare i flera år – i en svensk studie fanns ett underskott på 15 % kvar efter två år [55].',
        'Dosen räknas. Ledd träning och hemträning ger likvärdiga resultat för de flesta [58][59] – det viktiga är att träningen blir av och att den ökar.',
        'Smärtmonitorering. Smärta upp till 5 av 10 är okej om den är tillbaka på din vanliga nivå nästa morgon och svullnaden inte ökar [45].',
      ] },
      { h: 'Ett år, minst', p: ['Förbättringen är störst de första tre månaderna och planar sedan ut under ett till två år. För att det opererade benet ska bli lika starkt som det andra behöver träningen pågå minst ett år [49]. Det är därför fas 5 inte har något slutdatum.'] },
      { box: { title: 'Om du är fysioterapeut själv', text: 'Din kunskap hjälper – men din blick på din egen gång är partisk. En utomstående bedömning av gång och abduktorfunktion är värdefull [49].' } },
    ],
    sources: [49, 45, 53, 54, 55, 58, 59, 60],
  },

  // ======================================================== Del 2 – Före och direkt efter
  {
    id: 'prehab', part: 2, phase: 0, minutes: 5, title: 'Före operationen',
    lead: 'Det du gör före operationen påverkar hur fort du kommer igång efter. Inte för att prehab har stora effekter i studierna – utan för att du kommer starkare, kunnigare och mer förberedd.',
    key: ['Fortsätt med styrketräning och cykel så länge höften tillåter.', 'Lär dig övningarna och kryckgången innan du har ont.', 'Rökstopp, blodsocker, tänder och hel hud kan avgöra om operationen blir av.'],
    sections: [
      { h: 'Vad forskningen visar', p: ['Evidensen för prehab före höftprotes är svagare än före knäprotes. En sammanställning från 2023 fann kortare vårdtid efter knäprotes, men ingen säker skillnad efter höftprotes, och små effekter på smärta och funktion efteråt [64].'] },
      { h: 'Varför det ändå är värt det', p: ['Bättre funktion före operationen förutsäger en snabbare återhämtning. Och du lär dig övningarna, gången med kryckor och trappteknik medan du fortfarande kan fokusera på dem – i stället för dag 1 med ont och trött [49].'] },
      { h: 'Träna', list: ['Fortsätt med BOA-programmet eller motsvarande: progressiv styrka för sätets sidomuskler, höftsträckare och lårets framsida.', 'Cykel – ofta skonsammare än gång vid artros.', 'Prova ut kryckor och öva gång och trappa.'] },
      { h: 'Optimera riskfaktorerna', p: ['Vårdförloppet listar det som minskar risken för komplikationer [38]:'], list: ['Rökstopp minst 4 och helst 8 veckor före och efter operationen. Avstå från alkohol lika länge vid riskbruk.', 'Vid diabetes: HbA1c under cirka 53–64 mmol/mol.', 'Behandla blodbrist.', 'Åtgärda tänderna om de behöver det.', 'Ingen kortisoninjektion i höften de sista 3 månaderna.', 'Hel hud – ett sår eller eksem i operationsområdet kan göra att operationen ställs in.'] },
      { h: 'Frågor till kirurgen', list: ['Vilket snitt, vilken fixation, och repareras kapseln?', 'Får jag belasta fullt?', 'Gäller några rörelserestriktioner för mig – och behövs de verkligen i mitt fall? (Se kapitlet om restriktioner.)'] },
    ],
    sources: [49, 64, 38],
  },
  {
    id: 'sjukhuset', part: 2, phase: 1, minutes: 7, title: 'Sjukhusdagarna (fas 1, dag 0–3)',
    lead: 'Svensk höftprotesvård är byggd för snabb återhämtning. Rehaben börjar på operationsdagen, och de flesta åker hem efter ett eller två dygn.',
    key: ['Upp och gå samma dag eller dagen efter, med fullbelastning om inget annat sagts.', 'Fotpumpar 20–30 gånger varje vaken timme.', 'Trappa: upp med den friska, ner med den opererade.'],
    sections: [
      { h: 'Snabbspår – ERAS', p: ['Vården bygger på ERAS-konsensus [63]: ryggbedövning eller narkos, och smärtlindring med paracetamol och NSAID som bas. Ett kortisonpreparat ges ofta vid operationen och minskar vilovärk, illamående och opioidbehov. Opioider används i lägsta effektiva dos så kort tid som möjligt. Nervblockader används inte rutinmässigt eftersom de kan försena mobiliseringen.', 'Rehaben ska börja på operationsdagen och senast inom 24 timmar: förflyttningar, uppresning, gång med hjälpmedel, trappa vid behov, muskel- och rörlighetsträning och ett egenträningsprogram [63][38].'] },
      { h: 'Träning flera gånger om dagen', table: { head: ['Övning', 'Dos'], rows: [
        ['Fotpumpar', '20–30 gånger varje vaken timme – mot blodpropp och svullnad'],
        ['Lårspänning och knip sätet', '10 × 5–10 sekunder, 3–5 gånger om dagen'],
        ['Hälglidning', '10–15 gånger, 3 gånger om dagen, inom tillåtet rörelseomfång'],
        ['Benglidning åt sidan', '10–15 gånger, 2–3 gånger om dagen. Efter sidosnitt utan motstånd'],
        ['Uppresning från hög stol', '5–10 gånger, 3 gånger om dagen'],
        ['Gång med rollator eller kryckor', 'Korta pass som ökas efter förmåga'],
      ] } },
      { h: 'Trappan', p: ['Uppför: först det friska benet, sedan det opererade och kryckan på samma steg. Nedför: först kryckan och det opererade benet, sedan det friska. Kom ihåg: upp med den friska, ner med den opererade.'] },
      { h: 'Undvik', list: ['Kudde under knät under längre tid – risk för stelhet i böjt läge i höft och knä.', 'Att resa dig ensam första gången – risken för yrsel och fall är störst då.', 'De restriktioner du eventuellt fått.'] },
      { h: 'Smärta och svullnad', p: ['Smärtlindring enligt ordination, med laxermedel samtidigt som opioider. Kyla 15–20 minuter med skydd mot huden flera gånger om dagen, och högläge.'] },
      { h: 'Påklädning och hjälpmedel', p: ['Arbetsterapeut eller fysioterapeut visar påklädning – opererade benet först i byxorna – och vid restriktioner strumppådragare, griptång och toalettförhöjning.'] },
      { h: 'Hem när du klarar', list: ['Inga tecken på komplikationer och inget läckage från såret', 'Godkänd röntgen och fungerande smärtlindring', 'Hygien, påklädning, i och ur säng, uppresning från stol, gång med hjälpmedel – och trappa om du behöver'], after: ['Det är också kriterierna för att gå vidare till fas 2 i appen.'] },
    ],
    sources: [49, 63, 38],
  },

  // ======================================================== Del 3 – Faserna i detalj
  {
    id: 'fas2', part: 3, phase: 2, minutes: 7, title: 'Fas 2: Tidig hemfas (vecka 1–3)',
    lead: 'Hemma handlar det om att låta såret läka, få ner svullnaden, gå jämnare för varje dag – och göra hemprogrammet varje dag.',
    key: ['Hemprogram 1–2 gånger om dagen plus 3–6 korta promenader.', 'Trappa ner hjälpmedlen när du går utan att halta – inte efter datum.', 'Ingen bassäng förrän såret är helt läkt.'],
    sections: [
      { h: 'Mål', list: ['Läkt sår och tagna stygn, oftast efter 10–14 dagar', 'Minskande svullnad och smärta', 'Gång med en krycka eller käpp, sedan utan hjälpmedel inomhus', 'Ett normaliserat gångmönster'] },
      { h: 'Vad som händer i kroppen', p: ['Nybildningsfasen: ny vävnad och kollagen bildas. Huden är läkt efter 1–2 veckor, men hållfastheten i sår, kapsel och senreparationer är fortfarande låg och ökar under månader. Kapselreparationen efter bakre snitt och abduktorsenan efter sidosnitt är som mest sårbara de första 6 veckorna – därför har restriktionerna traditionellt gällt så länge.', 'Vid ocementerad protes börjar nytt ben växa in de första veckorna och mognar under 6–12 veckor.', 'Smärtan är främst inflammatorisk och minskar. Nattlig värk och morgonstelhet är vanligt.', 'I gången syns ofta kortare steg med det opererade benet, mindre sträckning i höften i slutet av steget och att överkroppen lutar åt den opererade sidan för att avlasta svaga abduktorer.'] },
      { h: 'Hemprogrammet', table: { head: ['Övning', 'Dos', 'Tänk på'], rows: [
        ['Uppresning från stol', '3 × 8–12, dagligen', 'Sänk stolen successivt. Lika mycket vikt på båda benen'],
        ['Stående abduktion med stöd', '3 × 10–15', 'Efter sidosnitt utan motstånd tills kirurgen ger klartecken'],
        ['Stående höftsträckning', '3 × 10–15', 'Bålen stilla, ingen svank'],
        ['Höftlyft på två ben', '3 × 10', 'De flesta protokoll tillåter det'],
        ['Tåhävningar', '3 × 15', 'Vadpump och balans'],
        ['Miniknäböj med stöd', '3 × 10', 'Knäna högst 45°'],
        ['Step-up på lågt steg', '2–3 × 10', '10–15 cm, från ungefär vecka 2'],
        ['Promenader', '3–6 pass om dagen, 5–15 min', 'Öka 10–20 % i veckan. Steglängd, hälisättning, sträckning'],
      ] }, after: ['Appen delar upp övningarna i två pass som växlar, så att varje pass går fort.'] },
      { h: 'Smärta som verktyg', p: ['Smärta upp till cirka 5 av 10 under träningen är acceptabel om den har gått tillbaka till utgångsläget före nästa morgon och svullnaden inte ökar [45]. Tung styrketräning efter höftprotes gav högst måttlig smärta under och efter träningen i studierna [54].'] },
      { h: 'Gånghjälpmedel', p: ['Rollator, två kryckor, en krycka i motsatt hand eller käpp, och sedan inget. Trappa ner när du går utan halt och utan ökad smärta med det du har. Många går utan hjälpmedel inomhus efter 2–3 veckor. Spara kryckan ute, på hala underlag och vid långa sträckor. Ett hjälpmedel som tas bort för tidigt ger en invand halt som är svår att träna bort [49].'] },
      { h: 'Undvik', list: ['Bad, bubbelpool och bassäng tills såret är helt läkt. Dusch går oftast bra med vattentätt förband.', 'Att sitta stilla mer än 45–60 minuter utan att resa dig – det ökar stelhet och risk för blodpropp.', 'Restriktionsrörelser om du har restriktioner.'] },
      { h: 'Vårdkontakter', p: ['Sårkontroll via telefon eller besök efter 1–2 veckor. Första kontakten med fysioterapeut inom 4 veckor, eller inom en vecka om egenträningen känns osäker [38].'] },
      { h: 'Sömn', p: ['Ryggläge är säkrast de första veckorna. Sidoläge på den friska sidan med kudde mellan knäna är ett traditionellt råd efter bakre snitt – men i en holländsk studie upplevde de som fick sova fritt mindre besvär, utan fler luxationer [65]. Du kan ligga på den opererade sidan när det inte gör ont, ofta efter 2–6 veckor.'] },
    ],
    sources: [49, 45, 54, 38, 65],
  },
  {
    id: 'fas3', part: 3, phase: 3, minutes: 7, title: 'Fas 3: Funktion och styrka (vecka 3–6)',
    lead: 'Nu börjar den riktiga styrketräningen. Målet är att gå utan hjälpmedel och utan att halta – och att få tillbaka balansen.',
    key: ['3–5 styrkepass i veckan med 2–3 reps kvar i reserv.', 'Tung styrketräning så här tidigt är säker och ger mer styrka.', 'Efter sidosnitt: abduktion mot motstånd först efter klartecken.'],
    sections: [
      { h: 'Mål', list: ['Gå utan hjälpmedel och utan halt', 'Progressiv styrketräning med yttre motstånd', 'Gå växelvis i trappa', 'Komma igång med konditionsträning'] },
      { h: 'Vad som händer i kroppen', p: ['Kollagenet mognar och lägger sig efter de krafter det utsätts för. Senor och kapsel tål progressiv belastning, men inte plötsliga ytterlägen.', 'Muskelhämningen minskar när svullnaden avtar, men den frivilliga aktiveringen och förmågan att snabbt utveckla kraft är fortfarande nedsatt.', 'Kapselns känselkroppar är delvis borta efter operationen. Därför får muskulär kontroll och balansträning större betydelse.'] },
      { h: 'Träningen', table: { head: ['Övning', 'Dos', 'Progression'], rows: [
        ['Benpress', '3–4 × 8–12 vid cirka 60–75 % av max, eller 2–3 reps kvar', 'Öka när du klarar 12 med god teknik'],
        ['Abduktion med gummiband eller maskin', '3 × 10–15', 'Efter sidosnitt: först efter klartecken'],
        ['Höftlyft, sedan enbens höftlyft', '3 × 10–12', ''],
        ['Step-up framåt och åt sidan', '3 × 10 på 15–20 cm', 'Öka höjden'],
        ['Knäböj till bänk', '3 × 10', 'Djupet styrs av eventuella restriktioner'],
        ['Enbensstående och tandemgång', '3 × 30 s', 'Blunda, stå på mjukt underlag'],
        ['Motionscykel', '10–20 min, låg till måttlig intensitet', 'Hög sadel först, sänk när rörligheten tillåter'],
        ['Promenad', '20–40 min om dagen', 'Tempo och backar'],
      ] }, after: ['Har du inte tillgång till gym byter appen benpress mot knäböj till bänk eller goblet squat, och maskinen mot gummiband.'] },
      { h: 'Tung styrketräning så här tidigt?', p: ['Ja. I en norsk studie fick 24 patienter antingen maximal styrketräning – 4 set × 5 reps nära max i benpress och abduktion – från ungefär en vecka efter operationen, eller vanlig träning. Maxstyrkegruppen blev klart starkare, och skillnaden höll i sig efter 6–12 månader [53]. När samma princip prövades i vanlig klinisk vardag med 60 patienter ökade styrkan mer än med lätt sjukgymnastik i upp till 6 månader, utan fler komplikationer – men patienternas egen skattning av funktionen, gångtest och smärta blev likvärdig [54].', 'Slutsatsen: tung belastning är säker och ger mer styrka. Du kan börja med tung benpress tidigt om smärtan tillåter – slå på "Tung styrka" under Inställningar. Efter sidosnitt avgör kirurgen när abduktion mot motstånd får börja.'] },
      { h: 'Undvik', list: ['Restriktionsrörelser fram till 6 veckor om du har sådana.', 'Att köra bil innan du klarar en nödbromsning och har slutat med opioider.'] },
    ],
    sources: [49, 53, 54],
  },
  {
    id: 'fas4', part: 3, phase: 4, minutes: 7, title: 'Fas 4: Uppbyggnad (vecka 6–12)',
    lead: 'Läkningen har kommit så långt att du kan träna systematiskt tungt. Nu handlar det om symmetri – att det opererade benet ska komma ikapp.',
    key: ['Tre tunga pass i veckan: 4 × 5–8 vid 80–90 % av max.', 'Musklerna växer först efter 6–8 veckors belastning – styrkan hittills har mest varit nervsystemet.', 'Vänta med löpning, hopp och kontaktidrott.'],
    sections: [
      { h: 'Mål', list: ['Systematisk tung styrketräning', 'Mot symmetri i abduktion, höftsträckning och benpress', 'Uthållighet', 'Tillbaka till arbete, ofta lättare arbete först', 'Eventuella restriktioner avslutas'] },
      { h: 'Vad som händer i kroppen', p: ['Kapsel och senor tål de flesta vardagsrörelser efter cirka 6 veckor. Därför tar de flesta sjukhus bort restriktionerna då.', 'Vid ocementerad protes anses benet i huvudsak inväxt efter 6–12 veckor. Om stammen sjunker något sker det oftast de första 6 veckorna [60].', 'Muskeltillväxt märks först efter 6–8 veckors progressiv belastning. Styrkeökningen dittills har främst varit neural – nervsystemet har lärt sig att använda musklerna igen.', 'Fettinlagring och förtvining i höftmusklerna kan finnas kvar i 2 år eller mer [56], vilket förklarar varför symmetri tar tid.'] },
      { h: 'Träningen', table: { head: ['Övning', 'Dos'], rows: [
        ['Benpress på ett ben', '3–4 × 5–8 vid cirka 80–90 % av max (Husby/Winther-modellen: 4 × 5)'],
        ['Höftabduktion i maskin eller kabel', '3–4 × 5–8, tungt'],
        ['Höftsträckning – kabel eller höftlyft med stång', '3 × 6–10'],
        ['Bulgarisk utfallsböj, utfall', '3 × 8–10'],
        ['Balans och reaktiv kontroll', '2–3 gånger i veckan'],
        ['Kondition: cykel, crosstrainer, bassäng, stavgång', '20–45 min, måttlig till hög intensitet'],
      ] } },
      { h: 'Bassäng och simning', p: ['Börja när såret är helt läkt, oftast efter 3–6 veckor. Bröstsimmets grodspark för benet utåt och vrider det i ytterlägen, och vissa avråder från den de första 6–12 veckorna efter främre och sidosnitt. Crawlspark är skonsammare [49].'] },
      { h: 'Undvik', list: ['Löpning, hopp och snabba riktningsförändringar.', 'Kvarvarande restriktioner om sjukhuset har gett sådana.'] },
      { h: 'Uppföljning', p: ['Det opererande sjukhuset följer upp med läkare eller fysioterapeut efter cirka 3 månader [38]. Ta gärna med dina testresultat från appen.'] },
    ],
    sources: [49, 53, 54, 56, 60, 38],
  },
  {
    id: 'fas5', part: 3, phase: 5, minutes: 7, title: 'Fas 5: Full funktion, idrott och arbete (3–12 månader och framåt)',
    lead: 'Nu ska höften fungera i hela ditt liv – i arbete, idrott och vardag. Och styrkan ska bli lika på båda sidorna, vilket tar längre tid än de flesta tror.',
    key: ['Sikta på minst 90 % av friska sidans styrka, särskilt i abduktorerna.', 'Kvarstående svaghet efter två år är regel, inte undantag – utan riktad träning.', 'Explosiva övningar: kraftutvecklingen kommer tillbaka sist.'],
    sections: [
      { h: 'Mål', list: ['Symmetrisk styrka, minst 90 % av friska sidan, särskilt abduktorerna', 'Ingen halt, inte heller efter lång gång', 'Tillbaka till idrott enligt plan', 'Livslång träning'] },
      { h: 'Vad som händer i kroppen', p: ['Ombyggnaden av kapsel, senor och ben kring protesen pågår i 12–18 månader. Benet runt stammen anpassar sig efter den nya lastfördelningen, och lite ben försvinner högst upp (stress shielding).', 'I en svensk studie följdes 20 patienter i två år. Höftmusklerna var 18 % svagare än friska sidan före operationen, 12 % efter 6 månader och 6 % efter två år – men abduktorerna låg fortfarande 15 % efter [55]. Författarna drog slutsatsen att träningen efter operationen borde vara intensivare och rikta sig mot abduktorerna. Liknande skillnader finns beskrivna 4–5 år efter operationen.', 'Gång och balans blir oftast normala, men en skev belastning mellan benen kan finnas kvar i ett och ett halvt år eller mer.'] },
      { h: 'Träningen', list: ['Periodiserad styrketräning 2–3 gånger i veckan med abduktorer, höftsträckare och lårets framsida i fokus.', 'Kraft och snabbhet: explosiv benpress och step-ups i högt tempo – förmågan att snabbt utveckla kraft återhämtar sig långsammast.', 'Kondition enligt WHO: 150–300 minuter i veckan på måttlig intensitet [73].', 'Idrottsspecifik träning för det du vill tillbaka till.'] },
      { h: 'Klartecken och resten av appen', p: ['När din kirurg eller fysioterapeut har gett klartecken för fri träning markerar du det under Inställningar. Då blir löpprogrammen och de djupare höftstretcharna tillgängliga, och du kan lämna rehabläget när du vill. Fortsätt gärna med abduktorövningarna även i den vanliga appen.'] },
    ],
    sources: [49, 55, 73],
  },

  // ======================================================== Del 4 – Kroppen och vardagen
  {
    id: 'belastning', part: 4, phase: 1, minutes: 5, title: 'Belastning och gånghjälpmedel',
    lead: 'Får jag stå på benet? Ja – nästan alltid fullt, från första dagen. Hjälpmedlen är till för att du ska gå jämnt, inte för att skydda protesen.',
    key: ['Fullbelastning eller belastning efter förmåga gäller för både cementerade och ocementerade proteser.', 'Undantag: sprickor eller frakturer under operationen, omoperation eller mycket dålig benkvalitet.', 'Släpp hjälpmedlen när du inte haltar – en invand halt är svår att träna bort.'],
    sections: [
      { h: 'Vad studierna visar', p: ['En svensk studie som lottade patienter med en ocementerad stam till omedelbar fullbelastning fann ingen negativ effekt på hur protesen satt [49]. En sammanställning av 17 studier fann ingen säker extra risk med omedelbar obegränsad belastning efter ocementerad protes jämfört med delvis belastning [60].', 'Undantag är spricka eller fraktur under operationen, osteotomi, omoperation eller mycket dålig benkvalitet. Då kan kirurgen ordinera delvis belastning – markera det under Inställningar så blir övningarna tvåbensövningar tills vidare.'] },
      { h: 'Stegen', table: { head: ['Hjälpmedel', 'Tänk på'], rows: [
        ['Rollator', 'De första dagarna, tills du står stadigt'],
        ['Två kryckor', 'Krycka och opererat ben samtidigt, sedan det friska benet'],
        ['En krycka', 'I handen på den friska sidan – den avlastar abduktorerna på den opererade'],
        ['Käpp', 'Också i handen på den friska sidan'],
        ['Inget', 'Inomhus först, ofta efter 2–3 veckor. Kryckan kvar ute och på hala underlag'],
      ] } },
      { h: 'Kriteriet: ingen halt', p: ['Trappa ner när du går utan halt och utan ökad smärta med det hjälpmedel du har. Den typiska halten efter höftprotes kallas Trendelenburghalt: abduktorerna orkar inte hålla bäckenet i våg när du står på det opererade benet, så bäckenet sjunker på andra sidan – eller så lutar du överkroppen över det opererade benet för att kompensera. Be någon titta bakifrån, eller filma dig.'] },
    ],
    sources: [49, 60],
  },
  {
    id: 'smarta', part: 4, phase: 1, minutes: 5, title: 'Smärta, svullnad och sömn',
    lead: 'Det ska få göra lite ont att träna efter en operation. Frågan är hur mycket – och hur du vet att det är okej.',
    key: ['Smärta upp till 5 av 10 under träning är okej om den är borta till nästa morgon och svullnaden inte ökar.', 'Ta smärtlindringen – den gör att du orkar röra dig.', 'Sömnen är ofta störd i 2–6 veckor och blir bättre.'],
    sections: [
      { h: 'Smärtmonitoreringsmodellen', p: ['Modellen kommer från idrottsmedicinen och används i hela appen [45]:'], list: ['Under träningen: smärta upp till 5 på en skala 0–10 är acceptabel.', 'Nästa morgon: smärtan ska vara tillbaka på din vanliga nivå.', 'Svullnaden ska inte öka från dag till dag.'], after: ['Därför frågar appen efter varje pass hur ont det gjorde, och varje morgon hur höften känns och om den är mer svullen. Gjorde det mer ont än 5, eller är den ömmare eller mer svullen på morgonen, blir nästa pass lättare: ett set färre och färre reps. Blir det inte bättre efter några dagar – kontakta din fysioterapeut.'] },
      { h: 'Smärtlindring', p: ['Paracetamol och NSAID enligt ordination är basen. NSAID under en kort tid efter operationen har inte visat ökad risk för komplikationer [38]. Opioider i lägsta effektiva dos under så kort tid som möjligt, med en plan för nedtrappning och laxermedel samtidigt.'] },
      { h: 'Svullnad och blåmärken', p: ['Svullnad i låret och blåmärken som sjunker mot knä och fot – ibland ända ner – är normalt och syns ofta först dag 3–7. Kyla 15–20 minuter flera gånger om dagen, särskilt efter träning, och högläge. Effekten av kyla är måttlig, men den är billig och ofarlig.'] },
      { h: 'Sömn', p: ['Sömnen är ofta störd i 2–6 veckor. Ta smärtlindring före sänggåendet och använd kudde mellan knäna i sidoläge. Sömnbrist förstärker smärtupplevelsen – så sömnen är en del av rehaben.'] },
    ],
    sources: [45, 38, 49],
  },
  {
    id: 'restriktioner', part: 4, phase: 1, minutes: 7, title: 'Rörelserestriktioner – vad forskningen visar',
    lead: 'Länge fick alla med höftprotes samma regler: inte böja över 90°, inte korsa benen, inte vrida inåt, i sex veckor. Forskningen har inte kunnat visa att de skyddar – men ditt sjukhus kan ha skäl för just dig.',
    key: ['Ingen randomiserad studie har visat att standardrestriktionerna minskar luxationer efter en vanlig protes.', 'Den största studien, med 1 133 patienter efter bakre snitt med kapselreparation, fann ingen skillnad – och bättre funktion utan restriktioner.', 'Följ ditt sjukhus besked. Vill du avvika: prata med kirurgen och ta med referenserna.'],
    sections: [
      { h: 'Studierna', table: { head: ['Studie', 'Upplägg', 'Resultat'], rows: [
        ['Yadav m.fl. 2026 [50]', '1 133 patienter, bakre snitt med kapselreparation, lottade till restriktioner i 6 veckor eller inga', '10 luxationer totalt (0,88 %): 6 med restriktioner, 4 utan – ingen säker skillnad. Bättre funktion utan restriktioner vid 6 veckor och 3–6 månader'],
        ['Korfitsen m.fl. 2023 [51]', 'Systematisk översikt, 8 835 patienter – underlag för danska riktlinjer', 'Försumbar eller ingen skillnad i tidig luxation. Bättre tidig funktion utan restriktioner'],
        ['Crompton m.fl. 2020 [41]', '7 studier, 6 900 patienter efter bakre snitt', '2,2 % luxation med restriktioner, 2,0 % utan'],
        ['Dansk registerstudie 2024 [52]', 'En region slopade restriktionerna 2012', '2,9 % luxation inom 3 månader före, 3,5 % efter – liten skillnad i en studie där tidstrender kan störa'],
      ] }, after: ['Restriktionerna kan dessutom försena funktionen: i en studie klarade 33 % med restriktioner trappa tidigt, mot 51 % utan [51].'] },
      { h: 'Tolkning per snitt', list: [
        'Bakre snitt med kapselreparation: starkast evidens för att restriktioner kan slopas. Rimligt att undvika extrema kombinationer de första 6 veckorna – djup böj, benet inåt och vridning inåt, som att sitta lågt och vrida sig mot det opererade benet – men utan formella 90°-regler.',
        'Direkt lateralt snitt: låg luxationsrisk, och restriktioner tillför inget för luxationen. Det viktiga är att skydda abduktorsenan – ingen abduktion mot motstånd för tidigt. Det är en regel för senläkningen, inte för luxationen.',
        'Främre snitt: låg luxationsrisk. Kombinationen sträckning bakåt och utåtvridning är den teoretiska riskrörelsen.',
      ] },
      { h: 'När restriktioner kan vara motiverade', p: ['Omoperation, tidigare luxation, ingen eller osäker kapselreparation, fraktur, neuromuskulär sjukdom, kognitiv svikt, steloperation i ländryggen, eller instabilitet under operationen. Har du något av detta har kirurgen sannolikt ett skäl [49].'] },
      { h: 'Svensk praxis', p: ['Den varierar mellan sjukhus. Vårdförloppet säger bara att patienten ska informeras om eventuella rörelserestriktioner [38]. Många enheter har minimerat eller tagit bort dem, särskilt efter bakre snitt med kapselreparation, men det finns inga nationella riktlinjer. Restriktioner är dock fortfarande vanliga.'] },
      { box: { title: 'Tänk så här', text: 'Har du restriktioner: se dem som tillfälliga regler för en viss tid – inte som ett tecken på att höften är skör. Efter 6 veckor handlar det om att gradvis använda höften fullt ut igen.' } },
    ],
    sources: [50, 51, 41, 52, 38, 49],
  },
  {
    id: 'styrka', part: 4, phase: 2, minutes: 6, title: 'Styrketräning efter höftprotes',
    lead: 'Musklerna kring höften har tagit stryk – av operationen, och ofta av flera år med artros. Styrketräning är det som ger dem tillbaka, och det får vara tungt.',
    key: ['Tung styrketräning är säker och ger mer styrka än lätt träning.', 'Abduktorerna ska prioriteras – de är ofta svagast längst.', 'Ledd träning och hemträning ger likvärdiga resultat – dosen avgör.'],
    sections: [
      { h: 'Hur tungt är tungt?', p: ['Styrka doseras med två mått. Procent av max (1RM): 80–90 % är ungefär den vikt du klarar 5–8 gånger. Reps i reserv: hur många fler du hade klarat. "2–3 reps i reserv" betyder att du slutar när du hade orkat två–tre till med god teknik. I fas 3 tränar du med 2–3 i reserv, i fas 4 tungt med 4 × 5–8.'] },
      { h: 'Studierna', p: ['Maximal styrketräning – 4 × 5 nära max i benpress och abduktion – från cirka en vecka efter operationen gav större ökning av maxstyrkan i abduktion, som höll i sig efter 6–12 månader [53]. I klinisk vardag ökade styrkan mer än med lätt sjukgymnastik i upp till 6 månader, utan fler komplikationer [54]. Patienternas egen skattning av funktionen blev likvärdig – så tung träning ger mer styrka, inte nödvändigtvis bättre upplevd funktion på kort sikt.', 'Två ledda pass i veckan utöver hemträning gav inte mer benkraft än enbart hemträning [57], och en sammanställning fann ingen säker skillnad mellan ledd träning och hemträning [58]. Den amerikanska ortopedföreningen skriver att både formell sjukgymnastik och hemträning stöds av evidens av hög kvalitet [59].'] },
      { h: 'Varför abduktorerna', p: ['Sätets sidomuskler håller bäckenet i våg när du står på ett ben – i varje steg. När de är svaga haltar man. Efter höftprotes är de ofta svagare än friska sidan i flera år [55][56]. Därför har varje pass i appen en abduktionsövning, och därför följer appen abduktionsstyrkan som test.'] },
      { h: 'Så ökar appen', p: ['När du klarar toppen av repintervallet i alla set föreslår appen mer vikt eller en svårare variant. Gjorde det mer ont än 5 av 10 står den kvar. Svarar du att höften är ömmare eller mer svullen på morgonen blir passet lättare.'] },
    ],
    sources: [53, 54, 55, 56, 57, 58, 59],
  },
  {
    id: 'vardagen', part: 4, phase: 2, minutes: 7, title: 'Vardagen: påklädning, bil, samliv och resor',
    lead: 'Det mesta i vardagen kommer tillbaka fort. Här är vad studierna och vården säger om det folk brukar undra över.',
    key: ['Bilkörning när du slutat med opioider, klarar en nödbromsning och tar dig i och ur bilen – ofta efter 2–6 veckor.', 'Samliv: många kirurger anser att ungefär en månad är rimligt.', 'Planerad tandvård väntar till efter 3 månader.'],
    sections: [
      { h: 'Påklädning', p: ['Opererade benet först i byxorna och sist ur. Med restriktioner mot djup böj hjälper strumppådragare och griptång. Utan restriktioner klarar många att ta på strumpor med benet i "fyrställning" efter ett par veckor.'] },
      { h: 'Toalett och sittande', p: ['Toalettförhöjning och förhöjda stolar ordineras vid restriktioner. Utan restriktioner fungerar de som komfort de första veckorna.'] },
      { h: 'Bilkörning', p: ['En sammanställning av studier på bromsreaktionstid visade att den var i nivå med före operationen vid 1–4 veckor och bättre från 6 veckor; litteraturen rekommenderade i genomsnitt 4,5 veckor [70]. Nyare studier visar att reaktionstiden efter höger höftprotes är tillbaka efter cirka 2 veckor. Efter vänster höft med automatväxlad bil påverkas inte bromsfoten.'], list: ['Du har slutat med opioider', 'Du klarar en nödbromsning utan tvekan', 'Du tar dig i och ur bilen', 'Kontrollera villkoren i din bilförsäkring'], after: ['Som passagerare kan du åka direkt – men gör pauser och rör på dig.'] },
      { h: 'Samliv', p: ['Patienter återupptar sexuell aktivitet i genomsnitt efter cirka 4 månader, men många kirurger anser att ungefär en månad är rimligt. En rörelseanalys fann att vissa ställningar med djup böj kunde ge protesinklämning efter bakre snitt, och kraftig utåtvridning med sträckning efter främre [71]. I praktiken: den opererade parten ligger gärna underst i ryggläge till att börja med. En senare studie gav delvis motstridiga resultat, så evidensen är osäker.'] },
      { h: 'Resor och metallbågar', p: ['Moderna proteser kan ge utslag i metallbågen. Intyg behövs sällan – säg till personalen. Längre flygresor de första veckorna ökar risken för blodpropp: rör dig, drick och gör fotpumpar.'] },
      { h: 'Tandvård', p: ['Antibiotika vid tandvård behövs inte rutinmässigt för personer med ledprotes [72]. Det kan övervägas inom cirka 3 månader efter operationen om flera andra riskfaktorer finns, vid tandutdragning eller annan kirurgi i munnen. Undvik planerad tandbehandling de första 3 månaderna [38].'] },
    ],
    sources: [70, 71, 72, 38],
  },
  {
    id: 'arbete', part: 4, phase: 3, minutes: 3, title: 'Tillbaka till arbetet',
    lead: 'När du kan arbeta igen beror mest på vad du arbetar med.',
    key: ['Stillasittande arbete: ofta efter 2–6 veckor.', 'Måttligt fysiskt arbete: upp till 4 månader innan full arbetsförmåga.', 'Planera en gradvis återgång, till exempel halvtid vid 6–8 veckor.'],
    sections: [
      { h: 'Socialstyrelsens beslutsstöd', p: ['Vid arbete med måttlig fysisk belastning kan arbetsförmågan vara nedsatt i upp till 4 månader på heltid, följt av deltidssjukskrivning [69]. Stillasittande arbete kan ofta återupptas efter 2–6 veckor.'] },
      { h: 'Exempel', p: ['Arbete med förflyttningar av patienter, knästående och långa dagar på fötterna – som inom vård och fysioterapi – motsvarar ungefär måttlig belastning. En gradvis återgång, till exempel 50 % vid 6–8 veckor, ger tid att bygga upp uthålligheten [49].'] },
    ],
    sources: [69, 49],
  },
  {
    id: 'idrott', part: 4, phase: 4, minutes: 6, title: 'Idrott och aktivitet',
    lead: 'De flesta kommer tillbaka till det de tycker om. Rekommendationerna har blivit allt friare – men de bygger mest på vad kirurger tycker, inte på studier av utfall.',
    key: ['Promenad, cykel, simning, golf, styrketräning och dans rekommenderas.', 'Lätt jogging tillåts efter 6 månader av tre av fyra kirurger – prata med din.', 'Fall är den största risken – därför kräver vissa idrotter god styrka och kontroll.'],
    sections: [
      { h: 'Vad kirurgerna säger', p: ['I European Hip Societys enkät till 150 kirurger var de eniga om 5 aktiviteter de första 6 veckorna, 10 aktiviteter vid 6–12 veckor, 26 vid 3–6 månader och 37 av 47 aktiviteter efter 6 månader. Majoriteten tillät löpning efter 6 månader – jogging 75 %. Kontaktidrott, de flesta bollsporter och kampsporter rekommenderades inte [66].', 'Äldre amerikanska riktlinjer delade in idrotter i tillåtet, tillåtet med erfarenhet och inte tillåtet [67]. Trenden över tid är tydligt friare.'] },
      { h: 'Ökar aktivitet risken?', p: ['En studie med över 4 000 höfter fann att hög aktivitet två år efter operationen – inklusive jogging flera gånger i veckan – inte ökade risken för omoperation [68].'] },
      { h: 'Kategorier', table: { head: ['Kategori', 'Exempel', 'Kommentar'], rows: [
        ['Rekommenderas', 'Promenad, stavgång, cykel, simning, vattengympa, golf, styrketräning, crosstrainer, dans', 'Golf kan ofta återupptas efter cirka 3 månader'],
        ['Tillåtet med erfarenhet', 'Klassisk längdskidåkning, utförsåkning, dubbeltennis, padel, terrängvandring, lätt jogging', 'Kräver god styrka och kontroll – fall är den största risken'],
        ['Avråds eller diskuteras', 'Fotboll, innebandy, handboll, kampsport, squash, singeltennis på hög nivå, löpning med stor volym', 'Risk för luxation, fraktur och slitage'],
      ] } },
      { box: { title: 'Evidensnivå', text: 'Idrottsråden bygger främst på enkäter till kirurger, inte på randomiserade studier. Ta beslutet tillsammans med din kirurg.' } },
    ],
    sources: [66, 67, 68, 49],
  },
  {
    id: 'varning', part: 4, phase: 1, minutes: 5, title: 'Varningssignaler – när du ska söka vård',
    lead: 'Komplikationer är ovanliga, men några kräver snabb vård. Känn igen dem.',
    key: ['Plötslig kraftig smärta och ett felställt ben: åk akut, försök inte dra den på plats.', 'Andnöd eller bröstsmärta: ring 112.', 'Läckage från såret mer än 72 timmar efter operationen eller feber: kontakta kliniken direkt.'],
    sections: [
      { h: 'Akut', table: { head: ['Tillstånd', 'Symtom', 'Gör så här'], rows: [
        ['Luxation', 'Plötslig kraftig smärta, ofta med ett klick. Kan inte belasta. Benet förkortat och felvridet', 'Akut till sjukhus. Försök inte dra den på plats'],
        ['Lungemboli', 'Plötslig andnöd, smärta vid andning, hjärtklappning, blodiga upphostningar', 'Ring 112'],
        ['Blodpropp i benet', 'Ensidig svullnad i vaden, värme och ömhet, smärta som ökar vid gång', 'Akut bedömning samma dag'],
        ['Fraktur kring protesen', 'Plötslig smärta efter fall eller vridning, kan inte belasta', 'Akut röntgen'],
        ['Djup infektion', 'Feber, ökande vilovärk efter en första förbättring, läckage mer än 72 timmar efter operationen', 'Kontakta opererande enhet direkt. Antibiotika ska inte startas på chans innan odling'],
        ['Ytlig sårinfektion', 'Rodnad, värme, ökande smärta, läckage', 'Kontakta opererande enhet samma dag'],
      ] }, after: ['Läckage i mer än 72 timmar räknas som en läkningsstörning och ska följas. Läckage i mer än 5–7 dagar bör leda till ny operation utan dröjsmål enligt vårdförloppet [38].'] },
      { h: 'Ta upp med vården', table: { head: ['Tillstånd', 'Symtom', 'Gör så här'], rows: [
        ['Nervpåverkan', 'Droppfot och domning på fotryggen; knät viker sig; domning och sveda på lårets utsida (främre snitt); uttalad halt (sidosnitt)', 'Svaghet: kontakta kirurgen. Domning på lårets utsida går ofta över på månader'],
        ['Heterotop ossifikation', 'Gradvis ökande stelhet efter 4–12 veckor, ibland smärta', 'Röntgen. Vanligare efter sidosnitt och hos män'],
        ['Benet känns längre', 'Vanligt de första veckorna av spända muskler och sned bäckenställning', 'Minskar ofta inom 3–6 månader. Mät verklig benlängd före inlägg'],
        ['Smärta på höftens utsida', 'Ömt över trokantern, ont att ligga på sidan', 'Anpassad abduktorträning, undvik korsade ben i stående'],
        ['Halt som sitter kvar', 'Halt efter 3–6 månader trots träning', 'Mät abduktionsstyrkan, utred om den inte ökar'],
      ] } },
      { h: 'Hur vanligt?', p: ['Region Norrbottens patientinformation anger att cirka 2 % drabbas av luxation och 0,5–1 % av djup infektion [49]. Luxationsrisken är störst de första två åren, och den nya leden är känslig för infektion hela livet – hör av dig om höften plötsligt gör ont eller svullnar, även flera år senare.'] },
    ],
    sources: [38, 49],
  },
  {
    id: 'tester', part: 4, phase: 2, minutes: 5, title: 'Mät dina framsteg',
    lead: 'Objektiva tester visar framsteg som du inte märker från dag till dag – och de är kriterierna för att gå vidare.',
    key: ['Testa var 2–4:e vecka – appen påminner.', 'Riktvärdena är ungefärliga, inte exakta gränser.', 'Ett underskott på 15 % i abduktion efter två år är vanligt utan riktad träning.'],
    sections: [
      { h: 'Testbatteriet', table: { head: ['Test', 'Mäter', 'Riktvärde'], rows: [
        ['30 sekunders uppresning', 'Benstyrka och funktion', '60–69 år: cirka 12–17. Mål: åldersnorm i fas 4'],
        ['Timed Up and Go', 'Rörlighet', 'Under cirka 10 s normalt; över 13,5 s talar för ökad fallrisk'],
        ['40 m snabbgång', 'Gånghastighet', 'Följ förbättringen'],
        ['Trapptest', 'Trappfunktion', 'Växelvis utan räcke i fas 3–4'],
        ['6 minuters gångtest', 'Uthållighet', 'Över 500 m för de flesta 60–70-åringar i fas 5'],
        ['Enbensstående', 'Balans och abduktorkontroll', 'Minst 10 s i fas 3, minst 30 s i fas 5'],
        ['Trendelenburgs test', 'Abduktorfunktion', 'Negativt i fas 3–4'],
        ['Abduktionsstyrka (LSI)', 'Opererad som andel av frisk', 'Minst 80 % i fas 4, minst 90 % i fas 5'],
        ['Höftflexion', 'Rörlighet', 'Minst 90° vid 6 veckor, 100–110° vid 3 månader; 110–120° för strumpor och skor'],
        ['HOOS JR', 'Egen skattning 0–100', 'Omkring 75 vid 6 veckor, 80–85 vid 3–6 månader'],
        ['Oxford Hip Score', 'Egen skattning 0–48', 'Över 40 vid ett år är ett bra resultat'],
      ] }, after: ['Testerna finns under fliken Tester, med instruktioner. 30 s uppresning, 40 m snabbgång, trapptest, TUG och 6 minuters gång är de prestationstester som OARSI rekommenderar vid höftartros [75].'] },
      { h: 'Så använder du dem', p: ['Gör testerna under liknande förhållanden varje gång – samma stol, samma sträcka, samma tid på dagen. Jämför med dig själv först och riktvärdet sedan. Ta med resultaten till fysioterapeuten och till uppföljningen efter 3 månader.'] },
      { box: { title: 'Kom ihåg', text: 'Riktvärdena bygger på normdata och klinisk praxis. De är inte validerade gränser mellan faserna [49].' } },
    ],
    sources: [49, 75],
  },
  {
    id: 'kost', part: 4, phase: 1, minutes: 4, title: 'Kost, läkning och blodpropp',
    lead: 'Läkning och muskeltillväxt kräver byggstenar – och några vanor påverkar risken för infektion mer än man tror.',
    key: ['Protein 1,2–1,6 g per kilo kroppsvikt och dag, 25–40 g per måltid.', 'Rökning och högriskbruk av alkohol ökar infektionsrisken tydligt.', 'Ta trombosprofylaxen som ordinerat och avbryt inte i förtid.'],
    sections: [
      { h: 'Protein', p: ['1,2–1,6 gram protein per kilo kroppsvikt och dag stöder både muskelproteinsyntes och sårläkning, särskilt tillsammans med styrketräning. 25–40 gram per måltid är en praktisk tumregel [49].'] },
      { h: 'Det som påverkar läkningen', list: ['D-vitamin: kontrollera nivån vid misstänkt brist – viktigt för ben och muskelfunktion.', 'Rökning och snus försämrar sårläkningen och ökar risken för protesinfektion. Avstå minst 4–8 veckor före och efter.', 'Högriskkonsumtion av alkohol fördubblar infektionsrisken [38].', 'Diabetes: håll blodsockret stabilt – högt HbA1c ökar infektionsrisken.', 'Vikt: infektionsrisken ökar gradvis över BMI 25 och tydligt över 35. Vikten är också den viktigaste faktorn för mindre slitage på sikt.', 'Benhälsa: utred benskörhet om du haft en lågenergifraktur. Belastande styrketräning är bra för benet runt protesen.'] },
      { h: 'Blodproppsförebyggande', p: ['Det saknas nationella riktlinjer. Vårdförloppet rekommenderar lågmolekylärt heparin eller nyare blodförtunnande tabletter i 4 veckor, och i praktiken planeras profylax i minst 15 dagar vid 69 % av operationerna [62][38]. Följ din ordination och avbryt inte i förtid. Tidig mobilisering och fotpumpar är en central del av skyddet.'] },
    ],
    sources: [49, 38, 62],
  },
  {
    id: 'mentalt', part: 4, phase: 2, minutes: 4, title: 'Det mentala: rädsla, förväntningar och motivation',
    lead: 'Rehab är inte bara muskler. Rädsla för att höften ska gå ur led, och tålamodet när det går långsamt, påverkar lika mycket.',
    key: ['Rädsla för rörelse är vanlig – och förstärks av restriktioner.', 'Förbättringen är störst de första 3 månaderna, sedan långsammare i 1–2 år.', 'Dåliga dagar är normala, även efter 2–3 månader.'],
    sections: [
      { h: 'Rörelserädsla', p: ['Rädsla för luxation är vanlig, och restriktioner kan förstärka den. Kunskap skyddar inte helt när det gäller den egna kroppen. Se eventuella restriktioner som tillfälliga regler i en viss situation – inte som ett tecken på att höften är skör – och utsätt dig gradvis för de rörelser du är rädd för [49].'] },
      { h: 'Förväntningar', p: ['Förbättringen är störst de första tre månaderna och planar sedan långsamt ut under ett till två år. Det betyder att framstegen känns mindre efter ett tag – fast du fortfarande blir bättre. Dåliga dagar är normala, även efter två–tre månader.', 'Ett år efter operationen har cirka 76 % i Sverige ingen eller mycket lindrig smärta, och 88–89 % är nöjda eller mycket nöjda [62].'] },
      { h: 'Motivation', p: ['För logg över dina tester. Objektiva framsteg motverkar känslan av att stå still – det är därför appen påminner om testerna och visar dem som kurvor. Jämför dig med dig själv, inte med andra.'] },
    ],
    sources: [49, 62],
  },
  {
    id: 'langsikt', part: 4, phase: 5, minutes: 4, title: 'Särskilda situationer och lång sikt',
    lead: 'Alla höftproteser är inte likadana, och livet efter rehaben ser olika ut.',
    key: ['Båda höfterna opererade: fullbelastning, men hjälpmedel längre.', 'Över 75: cementerad stam, och fallprevention först.', 'Ung och aktiv: slitage och lossning är den största långsiktiga risken.'],
    sections: [
      { h: 'Situationer', list: [
        'Dubbelsidig operation: fullbelastning på båda benen är oftast tillåten, men gånghjälpmedel behövs längre.',
        'Artros i andra leder: byt ut en del gång mot cykel och bassäng.',
        'Äldre än 75: cementerad stam är standard. Prioritera balans och fallprevention.',
        'Ung och aktiv: ofta ocementerad protes. Den största långsiktiga risken är slitage och lossning – håll vikten och välj aktiviteter med eftertanke.',
      ] },
      { h: 'Resultaten i Sverige', p: ['Livskvaliteten (EQ-5D) steg i genomsnitt från 0,64 före operationen till 0,87 efter ett år. Cirka 76 % hade ingen eller mycket lindrig smärta, och omkring 88–89 % var nöjda eller mycket nöjda [62]. Vårdförloppets mål är över 85 % nöjda och över 80 % med ingen eller mycket lindrig smärta vid ett år [38].'] },
      { h: 'Livet med protesen', p: ['Styrketräning 2–3 gånger i veckan och daglig rörelse håller dig stark och minskar fallrisken. Fortsätt med abduktorerna i 12–24 månader – och gärna längre. Hör av dig om höften plötsligt gör ont, svullnar eller känns instabil, även flera år senare.'] },
    ],
    sources: [62, 38, 49],
  },

  // ======================================================== Del 5 – Forskningen
  {
    id: 'forskning', part: 5, phase: 5, minutes: 6, title: 'Forskningsöversikt',
    lead: 'Vad vet vi säkert, och vad är osäkert? Här är de viktigaste frågorna och hur stark evidensen är.',
    key: ['Ledd träning och hemträning: likvärdigt – hög evidens.', 'Tung styrketräning: säker och ger styrka – måttlig evidens.', 'Idrottsråd: kirurgenkäter – låg evidens.'],
    sections: [
      { h: 'Frågorna', table: { head: ['Fråga', 'Viktigaste evidensen', 'Slutsats'], rows: [
        ['Ledd träning eller hemträning', 'Sammanställning: ingen säker skillnad [58]. AAOS: båda stöds [59]. Två ledda pass i veckan gav inte mer kraft än hemträning [57]', 'Likvärdigt för de flesta. Hög evidens'],
        ['Tung styrketräning', 'Husby 2009 (24 patienter) [53], Winther 2018 (60 patienter) [54]: mer styrka, säkert, samma upplevda funktion', 'Säker och ger styrka. Måttlig evidens'],
        ['Restriktioner', 'Yadav 2026 [50], Korfitsen 2023 [51], Crompton 2020 [41]', 'Rutinmässiga restriktioner stöds inte. Måttlig till hög evidens vid bakre snitt med kapselreparation'],
        ['Belastning vid ocementerad protes', 'Sammanställning av 17 studier [60] och svenska röntgenstudier', 'Omedelbar fullbelastning är säker för de flesta. Måttlig evidens'],
        ['Prehab', 'Flera sammanställningar [64]', 'Liten eller osäker effekt efter höftprotes. Låg evidens'],
        ['Snitt', 'Sammanställning av 24 RCT [61]', 'Främre snitt ger snabbare start i 6–12 veckor, ingen skillnad på sikt. Måttlig evidens'],
        ['Kvarstående svaghet', 'Rasch 2009 och 2010 [55][56]', 'Abduktorer och höftböjare svaga i 1–2 år eller mer. Observationsstudier'],
        ['Idrott', 'Kirurgenkäter [66][67], registerstudie [68]', 'Allt friare. Låg evidens'],
      ] } },
      { h: 'Förbehåll', list: [
        'Följ alltid ditt sjukhus och din kirurg. Instabilitet under operationen, valet av protes, frakturer och kapselreparation kan motivera avvikelser från allt i boken.',
        'Evidensen om restriktioner gäller vanliga proteser vid artros – inte omoperationer, frakturer eller högriskpatienter.',
        'Styrketräningsstudierna är små, och patienterna var relativt unga och friska.',
        'Riktvärdena för testerna är ungefärliga och inte validerade som gränser mellan faserna.',
        'Siffrorna från Ledprotesregistret kommer från rapporterna 2022–2025.',
      ] },
      { h: 'Underlaget', p: ['Boken bygger på en forskningsrapport om rehabilitering efter total höftprotes [49], det nationella vårdförloppet för höftledsartros [38] och de studier som citeras i varje kapitel. Alla källor finns också under Du → Källor.'] },
    ],
    sources: [49, 38, 41, 50, 51, 53, 54, 55, 56, 57, 58, 59, 60, 61, 64, 66, 67, 68],
  },
];

/** Chapters worth reading now (up to and including this phase), in book order. */
export const chaptersFor = (phase: number) => CHAPTERS.filter((c) => c.phase <= phase);
