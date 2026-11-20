# Byggspecifikation: Pelare – en forskningsstyrd träningsapp med tre pelare

## 0. Så ska du arbeta
- Du är en senior fullstack-utvecklare med goda kunskaper i träningsfysiologi. Du bygger en app för en enda användare: mig. Gränssnittet är på svenska.
- Läs hela specifikationen innan du skriver kod. Sammanfatta sedan arkitektur, datamodell och antaganden på högst 20 rader och lista oklarheter. Kan du ställa frågor, ställ högst fem. Annars väljer du den rimligaste tolkningen och skriver ner den.
- Bygg i faser (avsnitt 11) och bara den fas jag ber om. Avsluta varje fas med vad som byggts, hur jag testar det och kända brister.
- **Gyllene regeln:** alla träningsbeslut – val av pass, övningar, set, reps, vikter, löpdistanser och intensitet – fattas av en deterministisk regelmotor i TypeScript. En språkmodell får aldrig hitta på dem. Den får tolka, förklara, sammanfatta och föreslå regeländringar som jag godkänner.
- Alla träningsparametrar ligger i en versionerad regelbas (avsnitt 6) där varje parameter har motivering, källa och evidensnivå. Hårdkoda inga träningssiffror i UI-koden.
- Hitta aldrig på studier, DOI:er eller siffror. Saknas underlag märks parametern som heuristik.
- Skriv enhetstester för motorn (avsnitt 10) innan du bygger UI:t för samma del. Kan verktyget inte köra tester, bygg en testsida som kör scenarierna och visar grönt eller rött.

## 1. Om mig (fyll i)
- Ålder, kön, längd och vikt: [ ]
- Träningsbakgrund: [nybörjare / tränat av och till / tränat regelbundet i mer än ett år]
- Huvudmål: [t.ex. komma i form, bygga muskler, springa 10 km, bli rörligare]
- Pelarvikter (summa 100): styrka [50], löpning [35], rörlighet [15]
- Träningsdagar per vecka: [ ]. Vanlig tid per pass: [ ] min
- Utrustning: [t.ex. gym med fria vikter och maskiner; hemma justerbara hantlar och gummiband]
- Löpning i dag: [t.ex. springer inte / 2 × 5 km i veckan]. Senaste 5 km-tid: [ ]
- Skador och begränsningar: [ ]
- Klocka och appar: [t.ex. Apple Watch, Garmin, Strava, ingen]
- Telefon: [iPhone / Android]

## 2. Produktidé
En app med tre pelare – styrka (gym, hemma, kroppsvikt), löpning och rörlighet – som varje dag föreslår det enskilt bästa passet för att jag ska komma i form. Det finns inget fast schema. I stället finns veckomål per pelare och en motor som väljer dagens pass utifrån veckomål, återhämtning, senaste passen, dagsform, tid och plats. Varje förslag har en ”Varför?”-förklaring med källor. En kunskapsbank med evidensgradering låter mig mata in forskning och YouTube-transkriptioner. Bara väl underbyggd kunskap får ändra motorns regler, och bara efter mitt godkännande.

## 3. Principer
1. Evidens först: varje rekommendation går att spåra till en regel, en källa och en evidensnivå.
2. Deterministisk kärna, AI i kanten (se gyllene regeln).
3. Säkerhet före optimering: skyddsregler är hårda och kan aldrig övertrumfas av poäng eller AI.
4. Snabb loggning: ett set loggas med högst två tryck, och loggning fungerar offline.
5. Konsekvens före variation: huvudövningar ligger fast i block om 4–8 veckor så att progressionen går att mäta.
6. Svenska, metriska enheter, kg och km, datum som ”tis 19 nov”.
7. Integritet: hälsodata stannar hos mig, och allt kan exporteras som CSV och JSON.

## 4. Funktioner

### 4.1 Styrka
- Övningsbibliotek med minst 80 övningar och fälten: namn (sv/en), primära och sekundära muskler, rörelsemönster, utrustning, betoning i sträckt läge (0–2), svårighetsgrad, ledbelastning (knä, axel, ländrygg), uni- eller bilateral, standardintervall för reps, minsta viktsteg i kg, ersättningsgrupp och tre tekniktips.
- Muskelgrupper: bröst, övre rygg, lats, främre axel, sidoaxel, bakre axel, biceps, triceps, underarmar, mage, ländrygg, säte, framsida lår, baksida lår, adduktorer och vader.
- Loggning per set: vikt, reps och RIR (reps i reserv, 0–5). Uppvärmningsset loggas separat. Vilotimern startar automatiskt. Knapp för ”samma som förra gången”, viktskivekalkylator och anteckning.
- Kalibrering: utan historik används de första passen per övning för att hitta arbetsvikten via RIR.
- Statistik: beräknat maxlyft (e1RM, Epley med reps + RIR) per övning och hårda set per muskelgrupp och vecka.

### 4.2 Löpning
- Passtyper: lätt, långpass, intervall, tempo, stegringar, återhämtning, gå-spring och test.
- Intensitet styrs med pulszoner från maxpuls eller tröskeltest, med tempo eller med ansträngning (RPE) och prattest när puls saknas.
- Manuell loggning i fas 2 (tid, distans, snittpuls, RPE) och import i fas 4.
- Nybörjarläge med gå-spring-intervaller som trappas upp.
- Test var 6–8:e vecka (5 km eller 12 minuter).

### 4.3 Rörlighet
- Uppvärmning genereras till varje pass: 5 minuter allmänt plus dynamiska övningar för passets rörelser.
- Mikropass på 5–10 minuter och riktade pass på 15–30 minuter.
- Prioritering utifrån områden tränade senaste 24 timmarna, svagaste testresultat, mina rörlighetsmål och löpning (höft, vad, fotled).
- Tester var fjärde vecka: knä mot vägg (fotled), stående framåtfällning, axelflexion mot vägg, Thomas-test (höftböjare) och djup knäböj graderad 0–3.

### 4.4 Gemensamt
- Dagsformsincheckning på under tio sekunder: sömn (timmar), sömnkvalitet 1–5, energi 1–5, stress 1–5, ömhet per kroppsdel 0–3 och smärta (plats). Valfritt: vilopuls och HRV från klocka, jämfört med en sjudagars baslinje.
- Tid i dag (snabbval 20/30/45/60/90 minuter) och plats (platsprofil med utrustning).
- Veckovy med plan och utfall, tre pelarringar och en kroppskarta över återhämtning per muskelgrupp.

## 5. Design och skärmar

### 5.1 Känsla och principer
Appen ska kännas som en lugn och kunnig coach som visar sitt underlag – inte som ett spel som tjatar. Tonen är saklig, varm och kort, aldrig skuldbeläggande.
1. Ett beslut per skärm: Idag-skärmen svarar bara på ”vad ska jag göra i dag?”.
2. Siffror först, text sist: stora siffror för kg, reps, minuter och tempo, korta etiketter.
3. Förklaring på begäran: ”Varför?” finns alltid ett tryck bort men tar aldrig plats från passet.
4. Gjord för gymgolvet: tryckytor på minst 48 × 48 px, viktiga knappar i tumzonen längst ner, inga små kryssrutor under pass, och vikt och reps läsbara på en armlängds avstånd.
5. Vila är en del av planen: vilodagar visas som planerade, aldrig som brutna kedjor.
6. Ärligheten syns: regler och förklaringar har ett diskret märke för evidensnivå (A/B/C/D/H).

### 5.2 Visuellt språk
- Mörkt läge som standard och ljust läge som alternativ, med en neutral bas i gråskala.
- En färg per pelare, använd konsekvent i ringar, taggar och grafer: styrka varm orange, löpning blå och rörlighet grön (lätt att byta). Återhämtning visas med en egen skala i tre steg – redo, delvis, behöver vila – som inte krockar med pelarfärgerna, och färg kompletteras alltid med text eller ikon.
- Typografi: ett sans-serif-typsnitt med tabulära siffror (t.ex. Inter eller systemets typsnitt) i två vikter. Under pass visas vikt och reps i minst 40 px.
- Kort med rundade hörn (12–16 px) och tunn kant i stället för skuggor, och en konsekvent uppsättning linjeikoner (t.ex. Lucide).
- Rörelse: korta, funktionella animationer (150–250 ms), haptisk återkoppling när ett set loggas och när vilan är slut, och respekt för inställningen ”reducera rörelse”.
- Kroppskartan är en enkel siluett framifrån och bakifrån där muskelgrupperna färgas efter återhämtning; tryck för detaljer.
- Referenser för känslan, inte för kopiering: ringarna i Apple Fitness, loggningstempot i Hevy och Strong, datadjupet i Strava.

### 5.3 Skärmar
1. **Idag:** överst incheckningen (snabba skalor, klar på tio sekunder) om den inte är gjord. Sedan ett stort kort med dagens pass: titel, längd, pelarfärg, tre korta skäl och en stor Starta-knapp. Under det två alternativ som mindre kort och ”Ändra förutsättningar” för tid och plats.
2. **Pågående pass:** helskärm med en övning i taget. Vikt och reps är stora och förifyllda, och RIR väljs med fem stora knappar (0, 1, 2, 3, 4+). En stor Klart-knapp loggar setet och startar vilotimern. Svep för nästa övning; byt övning och hoppa över ligger i en meny. Skärmen hålls tänd under passet.
3. **Vecka:** tre pelarringar överst, sedan dag för dag med plan mot utfall, och kroppskartan.
4. **Framsteg:** ett kort per mått – e1RM-kurvor, volym per muskelgrupp, löptempo vid given puls och rörlighetstester – med en mening som tolkar trenden.
5. **Kunskap** (fas 3): inkorg med påståenden att godkänna, källor och regler med versionshistorik och diff.
6. **Inställningar:** profil, pelarvikter (tre reglage som alltid summerar till 100), platsprofiler, mål och export.

Navigering: en bottenmeny med fyra flikar – Idag, Vecka, Framsteg och Mer (Kunskap och Inställningar ligger under Mer). Mobil först; på större skärmar centreras innehållet.

### 5.4 Tillgänglighet
- WCAG AA-kontrast, stöd för större systemtext, etiketter för skärmläsare och aldrig information enbart via färg.

### 5.5 Undvik
- Topplistor, sociala flöden, skuldbeläggande notiser, slumpade motivationscitat, mörka mönster som ska öka användningen och tät text under pass.

## 6. Regelbas v1 (seed-data)
Lägg in varje rad som en regel i tabellen `rules`, kopplad till källor i `evidence_sources` (avsnitt 12). Nivåer: A = systematisk översikt eller metaanalys, B = randomiserad studie, C = kohortstudie, konsensus eller narrativ översikt, H = heuristik (praxis utan direkt stöd – märks tydligt i UI:t).

| Regelnyckel | Startvärde i appen | Underlag | Nivå |
|---|---|---|---|
| strength.weekly_sets | 10–20 hårda set per muskelgrupp och vecka; nybörjare startar på 8–12; set där muskeln arbetar sekundärt räknas som 0,5 | [1] fler set ger mer tillväxt med avtagande effekt, och fraktionell räkning förutsäger bäst; [2] | A (startnivån H) |
| strength.minimum_dose | Vid tidsbrist minst 4 set per muskelgrupp och vecka med 6–15 RM | [11] | C |
| strength.frequency | Varje muskelgrupp minst två gånger i veckan; huvudlyft oftare om styrka prioriteras | [1] frekvens påverkar styrka men knappt tillväxt vid samma volym | A |
| strength.rir | Isolering 0–2 RIR, flerledsövningar 1–3 RIR; nybörjare +1 RIR de första fyra veckorna | [3] tillväxt gynnas nära failure, styrka påverkas lite | A (tillägget H) |
| strength.rep_ranges | Flerled 6–10 reps, isolering 10–20; styrkefokus 3–6 på huvudlyft | [4] tillväxt sker över ett brett repintervall nära failure, tyngre vikter ger mer maxstyrka | C |
| strength.rest | Flerled 2–3 min, isolering 1,5–2 min, aldrig under 60 s; antagonist-supersets vid tidsbrist | [5] liten fördel med mer än 60 s; [11] | A (låg säkerhet) |
| strength.rom | Fullt rörelseomfång med betoning på sträckt läge; ”lengthened partials” som valbar teknik i isoleringsövningar | [6] [7] [8] | A/B |
| strength.order | Prioriterade och tunga flerledsövningar först | [9] störst styrkeökning i övningar som görs först | A |
| strength.variation | Huvudövningar fasta i block om 4–8 veckor; byt systematiskt mellan block, aldrig slumpmässigt | [10] | A |
| strength.progression | Dubbelprogression: när alla set når övre repgränsen vid mål-RIR ökas vikten med minsta steget; två missade pass i rad → behåll eller sänk 5–10 % | Praxis | H |
| strength.deload | Behovsstyrd: prestation ner två pass i rad plus låg dagsform, annars senast var åttonde vecka; en vecka med ungefär halv volym, samma vikter och +2 RIR – inte helt uppehåll | [12] definition; [13] helt uppehåll gav sämre styrka; intervallet är praxis | B/C/H |
| strength.session_cap | Högst 8–10 hårda set per muskelgrupp och pass; resten sprids över veckan | [14] avtagande effekt per pass (preprint) | H |
| concurrent.interference | Löpning hindrar inte muskeltillväxt eller maxstyrka nämnvärt; explosiv styrka påverkas mest, särskilt i samma pass | [15] | A |
| concurrent.spacing | Hårda benpass och hård löpning helst 24 h isär, minst 6 h; i samma pass görs den prioriterade pelaren först | [16] [15] | B |
| running.distribution | Ungefär 80 % av löptiden lätt (pratbart) och 20 % kvalitet | [17] polariserad fördelning gav något mer VO2peak, främst i kortare studier och hos vältränade | A |
| running.intervals | Ett intervallpass i veckan, t.ex. 4 × 4 min på 90–95 % av maxpuls med 3 min aktiv vila; nybörjare börjar med 4 × 2 min | [18] (nybörjarversionen H) | B |
| running.spike_guard (HÅRD) | Inget enskilt pass får vara mer än 10 % längre (distans, annars tid) än det längsta passet de senaste 30 dagarna | [19] skaderisken ökade över den gränsen | C |
| running.strength_support | Minst två styrkepass i veckan även när löpning prioriteras | [20] styrketräning förbättrar löpekonomin | A |
| injury.prevention | Styrketräning är den viktigaste skadeförebyggande delen; stretching används för rörlighet, inte som skadeskydd | [21] | A |
| mobility.dose | Statisk stretch minst 5 min i veckan per prioriterat område, fördelat på minst 5 dagar | [22] | A |
| mobility.strength_counts | Styrketräning med fullt rörelseomfång räknas in i rörlighetsmålet | [23] lika stor rörlighetsökning som stretching | A |
| mobility.warmup | Dynamisk uppvärmning före pass; statisk stretch kortare än 60 s per muskel är okej i uppvärmningen | [24] | A |
| health.floor | Veckoplanen siktar alltid på minst 150 min måttlig eller 75 min hög aerob aktivitet plus styrka minst två dagar | [25] | A |
| readiness.hrv | HRV och vilopuls får bara justera intensiteten ett steg, aldrig ensamma avgöra | [26] liten och osäker fördel | A (låg säkerhet) |

## 7. Motorn ”Dagens pass”

### 7.1 Indata
Pass de senaste åtta veckorna, veckomål (rullande sju dagar), dagens incheckning, tid och plats, kommande planerade pass, pelarvikter och mål.

### 7.2 Trötthetsmodell (heuristik – startvärden som kalibreras mot min data)
- För varje muskelgrupp: trötthet F = summan av setvikt × närhetsfaktor × e^(−Δt/τ). Setvikten är 1 för primär muskel och 0,5 för sekundär. Närhetsfaktorn är 1,0 vid 0–1 RIR, 0,8 vid 2–3 och 0,5 vid 4 eller mer.
- τ är 24 h för armar, vader, mage och sidoaxel, 36 h för bröst, rygg och övriga axlar, och 48 h för framsida lår, baksida lår och säte.
- Löpning ger trötthet i framsida lår, baksida lår, vader och säte: 0,5 set-ekvivalenter per 15 min lätt löpning, 1,0 per 15 min intervall eller tempo, ×1,3 för långpass och ×1,5 för mycket nedförsbacke.
- Ömhet 2–3 i en kroppsdel gör muskeln ”ej redo” oavsett modell.
- Återhämtningsgrad R = 1 − min(1, F / F_max). Redo för hårt pass vid R ≥ 0,7 och för lätt teknikpass vid R ≥ 0,4.

### 7.3 Hårda regler (filter som aldrig övertrumfas)
1. Skadevakten för löpning (running.spike_guard).
2. Inga hårda benpass (≤ 2 RIR i knäböj, marklyft, utfall eller benpress) inom 24 h före långpass eller intervaller, och inga intervaller inom 24 h efter hårda benpass. Går det inte att undvika: minst 6 h och den prioriterade pelaren först.
3. En muskelgrupp som inte är redo tränas inte hårt.
4. Rapporterad smärta i en kroppsdel utesluter övningar som belastar den. Har smärtan funnits i mer än 14 dagar, eller är den skarp, visas rådet att kontakta fysioterapeut eller läkare.
5. Högst två hårda dagar i rad och minst en vilodag eller lätt dag per vecka (heuristik).
6. Mycket låg dagsform, t.ex. sömn under 5 h och energi 1–2, ger bara lätt pass, rörlighet eller vila.

### 7.4 Kandidater
- Styrka: helkropp, överkropp, underkropp, press, drag, ben, armar och axlar, minimipass (20 min) och hemmapass.
- Löpning: lätt, långpass, intervall, tempo, stegringar, återhämtning och gå-spring.
- Rörlighet: riktat pass och mikropass.
- Kombinationer: styrka plus kort lätt löpning. Alla pass får 5–10 min riktad rörlighet om tiden räcker.
- Vila eller promenad.

### 7.5 Poängsättning (för kandidater som klarat filtret)
Poäng = Σ(pelarvikt × täckning) + 0,15 × tidspassning + 0,10 × schemapassning + 0,05 × variation − 0,20 × trötthetskostnad − 0,30 × risk
- Täckning: hur mycket passet minskar veckounderskottet i pelaren, viktat efter brådska (underskottet delat med återstående möjliga pass i veckan). För styrka viktas varje muskelgrupp också med sin återhämtningsgrad.
- Tidspassning: hur väl passets beräknade längd stämmer med tillgänglig tid.
- Schemapassning: hänsyn till kommande planerade pass, t.ex. lätt dag före långpass.
- Koefficienterna är startvärden i regelbasen (H) och kan justeras.
- Visa den bästa kandidaten och två alternativ.

### 7.6 Passbyggaren
**Styrka**
1. Välj muskelgrupper med störst underskott gånger återhämtningsgrad.
2. Ta blockets fasta huvudövningar först. Komplettera från biblioteket, rankat efter utrustning, betoning i sträckt läge, ledbelastning mot mina begränsningar och min historik.
3. Sätt set per muskelgrupp (enligt strength.session_cap och underskottet), repintervall och mål-RIR enligt regelbasen.
4. Sätt vikter från senaste prestation med dubbelprogression, eller via kalibrering.
5. Ordna övningarna enligt strength.order.
6. Uppvärmning: 5 min allmänt plus rampset inför första tunga övningen, t.ex. 50 % × 8, 70 % × 4 och 85 % × 2.
7. Tidsberäkning: cirka 45 s arbete plus vila per set. Ta bort de lägst prioriterade seten tills passet ryms. Under 30 min används antagonist-supersets.

**Löpning**
- Lätt: längd från veckoplanen, begränsad av skadevakten, i zon 2 eller pratbart tempo.
- Intervall enligt running.intervals.
- Långpass: ökar gradvis och stannar alltid inom skadevakten.
- Gå-spring för nybörjare, t.ex. 8 × (1 min löpning + 2 min gång), som trappas upp när RPE är högst 5 (heuristik).

**Rörlighet**
3–6 övningar för de prioriterade områdena. Minuterna räknas mot veckomålet per område.

### 7.7 Förklaringen ”Varför?”
Motorn returnerar ett strukturerat skäl: vilka regler som avgjorde, siffrorna och källnycklarna. I fas 1–2 skrivs texten med mallar. Från fas 3 formulerar språkmodellen den på högst tre meningar och får bara använda dessa fakta. Exempel: ”Överkropp i dag: benen fick 14 set i går och är inte återhämtade, och du har intervaller i morgon [16]. Bröst och rygg ligger 6 set under veckomålet.”

### 7.8 Efter passet
Loggen uppdaterar trötthet, progression och veckounderskott, och nästa förslag räknas om. Missade pass planeras inte in i efterhand – motorn fattar bara nästa bästa beslut.

## 8. Kunskapsbank
- Tabeller: `evidence_sources` (typ, titel, författare, år, tidskrift, DOI/PMID/URL, nivå A/B/C/D/H, verifierad), `evidence_claims` (källa, ämne, påstående, villkor och population, effekt, tidsstämpel, status väntande/godkänd/avvisad, embedding), `rules` (nyckel, värde som JSON, enhet, gäller för, motivering, källor, version, aktiv) och `rule_change_proposals` (regel, nytt värde, skäl, stödjande påståenden, status). Nivå D = YouTube, poddar, böcker och coacher.
- Inläsning: jag klistrar in en transkription (från ”Visa transkription” på YouTube), en DOI eller PMID, eller fri text. Hämta inte YouTube-textning automatiskt med inofficiella verktyg.
- Flöde: (1) språkmodellen extraherar påståenden som JSON enligt ett schema som valideras med Zod; (2) studier som nämns verifieras via PubMed E-utilities och Crossref, och overifierade markeras; (3) semantisk jämförelse mot befintliga påståenden med pgvector: stöder, motsäger eller nytt; (4) jag granskar i en inkorg; (5) ett godkänt påstående som berör en regel skapar ett ändringsförslag med diff; (6) ett godkänt förslag ger en ny regelversion, och den gamla sparas.
- Behörighet: nivå D kan aldrig ensam ändra en regel, bara övningsval och tips. Nivå C kan ändra skyddsregler. Kärnparametrar kräver A eller B. Att gå emot ett A-underlag kräver A-underlag.
- Kör källkontrollen även på referenserna i avsnitt 12 när databasen fylls.
- Coach-chatt (fas 3): RAG över min data och kunskapsbanken. Den kan anropa motorn (”räkna om dagens pass för 30 minuter”) men aldrig ge siffror som strider mot regelbasen. Vid smärta eller sjukdom hänvisar den till vården.

## 9. Teknik
Standardstack – byt om verktyget kräver det, men behåll arkitekturen:
- Frontend: React, TypeScript, Vite och Tailwind. En PWA som kan läggas på hemskärmen och fungerar offline, med en kö i IndexedDB som synkar loggningar.
- Backend: Supabase (Postgres, Auth, Row Level Security, Storage, Edge Functions och pgvector).
- Motor: en ren TypeScript-modul utan UI-beroenden i `/engine`, testad med Vitest.
- AI: anrop via en Edge Function så att API-nyckeln aldrig finns i klienten. Modellen ska gå att byta, och alla strukturerade svar valideras med Zod.
- Fas 4: Strava API för löppass (täcker även Garmin, Polar med flera via deras synk till Strava), Apple Hälsa via ett native-skal (Capacitor och HealthKit) eller export, och Health Connect på Android.

## 10. Kvalitetskrav och tester
Enhetstester för motorn, minst dessa:
1. Tunga ben i går och intervaller planerade i morgon → förslaget är varken benpass eller intervaller.
2. Längsta löppasset senaste 30 dagarna är 8 km → inget förslag över 8,8 km.
3. Bröst 4 set under veckomålet, återhämtat, 45 min tillgängligt → förslaget innehåller bröstövningar.
4. Ömhet 3 i baksida lår → inga övningar med baksida lår som primär muskel.
5. Sömn 4 h och energi 1 → bara lätt pass, rörlighet eller vila.
6. 20 min tillgängligt → passet ryms inom 20 min.
7. Alla set på övre repgränsen vid mål-RIR → nästa pass föreslår minsta viktökningen.
8. Prestation ner två pass i rad och låg dagsform → deload föreslås.
9. Smärta i axeln → inga övningar med hög axelbelastning; efter 14 dagar visas vårdrådet.
10. Samma huvudövningar genom hela blocket.

Dessutom: varje regel visar nivå och källa i UI:t, ingen AI-utdata får skriva direkt till `rules`, och ”Dagens pass” beräknas lokalt på under 300 ms.

## 11. Faser och när de är klara
- **Fas 1 – Styrkekärnan:** designgrunden enligt avsnitt 5 (färger, typografi, komponenter, navigering), onboarding med hälsofrågor enligt PAR-Q+ (vid ja-svar: rådfråga läkare först), övningsbibliotek, platsprofiler, loggning, regelbas v1, motorn för styrka och vila, incheckning, ”Dagens pass” med mallbaserad förklaring, progression och deload, historik och export. Klar när jag kan få ett förslag, logga passet offline och se att nästa förslag ändras rimligt, och när test 3–10 går igenom.
- **Fas 2 – Alla tre pelarna:** löpning (loggning, zoner, skadevakt, nybörjarläge, tester), rörlighet (uppvärmning, mikropass, tester), samträningsregler, gemensam trötthetsmodell, kroppskarta, pelarringar och målläge. Klar när test 1 och 2 går igenom och veckovyn visar alla tre pelarna.
- **Fas 3 – Kunskapsbank och AI:** inläsning, källkontroll, inkorg, ändringsförslag med versioner, AI-formulerade förklaringar och coach-chatt. Klar när en inklistrad transkription ger granskningsbara påståenden och ett godkänt A-påstående kan ändra en regel med synlig diff.
- **Fas 4 – Integrationer och lärande:** import från Strava och Hälsa, HRV och vilopuls, personlig responsmodell (justera set per muskelgrupp med ±2 i veckan efter progression och återhämtning över 3–4 veckor), månatlig forskningsbevakning via PubMed som skapar förslag, och röstloggning.

## 12. Referenser (seed till evidence_sources)
[1] Pelland JC, Remmert JF, Robinson ZP, Hinson SR, Zourdos MC. The resistance training dose response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gains. Sports Med. 2026;56(2):481–505. doi:10.1007/s40279-025-02344-w
[2] Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis. J Sports Sci. 2017;35(11):1073–1082. doi:10.1080/02640414.2016.1210197
[3] Robinson ZP, Pelland JC, Remmert JF, et al. Exploring the dose–response relationship between estimated resistance training proximity to failure, strength gain, and muscle hypertrophy: a series of meta-regressions. Sports Med. 2024;54(9):2209–2231. doi:10.1007/s40279-024-02069-2
[4] Schoenfeld BJ, Grgic J, Van Every DW, Plotkin DL. Loading recommendations for muscle strength, hypertrophy, and local endurance: a re-examination of the repetition continuum. Sports. 2021;9(2):32. doi:10.3390/sports9020032
[5] Singer A, Wolf M, Generoso L, et al. Give it a rest: a systematic review with Bayesian meta-analysis on the effect of inter-set rest interval duration on muscle hypertrophy. Front Sports Act Living. 2024;6:1429789. doi:10.3389/fspor.2024.1429789
[6] Wolf M, Androulakis-Korakakis P, Fisher J, Schoenfeld B, Steele J. Partial vs full range of motion resistance training: a systematic review and meta-analysis. Int J Strength Cond. 2023;3(1). doi:10.47206/ijsc.v3i1.182
[7] Wolf M, Androulakis Korakakis P, Piñero A, et al. Lengthened partial repetitions elicit similar muscular adaptations as full range of motion repetitions during resistance training in trained individuals. PeerJ. 2025;13:e18904. doi:10.7717/peerj.18904
[8] Maeo S, et al. Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position. Eur J Sport Sci. 2023.
[9] Nunes JP, Grgic J, Cunha PM, et al. What influence does resistance exercise order have on muscular strength gains and muscle hypertrophy? A systematic review and meta-analysis. Eur J Sport Sci. 2021;21(2):149–157. doi:10.1080/17461391.2020.1733672
[10] Kassiano W, Nunes JP, Costa B, Ribeiro AS, Schoenfeld BJ, Cyrino ES. Does varying resistance exercises promote superior muscle hypertrophy and strength gains? A systematic review. J Strength Cond Res. 2022;36(6):1753–1762. doi:10.1519/JSC.0000000000004258
[11] Iversen VM, Norum M, Schoenfeld BJ, Fimland MS. No time to lift? Designing time-efficient training programs for strength and hypertrophy: a narrative review. Sports Med. 2021;51(10):2079–2095. doi:10.1007/s40279-021-01490-1
[12] Bell L, Strafford BW, Coleman M, Androulakis Korakakis P, Nolan D. Integrating deloading into strength and physique sports training programmes: an international Delphi consensus approach. Sports Med Open. 2023;9:87. doi:10.1186/s40798-023-00633-0
[13] Coleman M, Burke R, Augustin F, et al. Gaining more from doing less? The effects of a one-week deload period during supervised resistance training on muscular adaptations. PeerJ. 2024;12:e16777. doi:10.7717/peerj.16777
[14] Remmert JF, Pelland JC, Robinson ZP, Hinson SR, Zourdos MC. Is there too much of a good thing? Meta-regressions of the effect of per-session volume on hypertrophy and strength. SportRxiv (preprint, ej granskad). 2025. doi:10.51224/SRXIV.537
[15] Schumann M, Feuerbacher JF, Sünkeler M, et al. Compatibility of concurrent aerobic and strength training for skeletal muscle size and function: an updated systematic review and meta-analysis. Sports Med. 2022;52(3):601–612. doi:10.1007/s40279-021-01587-7
[16] Robineau J, Babault N, Piscione J, Lacome M, Bigard AX. Specific training effects of concurrent aerobic and strength exercises depend on recovery duration. J Strength Cond Res. 2016;30(3):672–683. doi:10.1519/JSC.0000000000000798
[17] Silva Oliveira P, Boppre G, Fonseca H. Comparison of polarized versus other types of endurance training intensity distribution on athletes’ endurance performance: a systematic review with meta-analysis. Sports Med. 2024;54(8):2071–2095. doi:10.1007/s40279-024-02034-z
[18] Helgerud J, Høydal K, Wang E, et al. Aerobic high-intensity intervals improve VO2max more than moderate training. Med Sci Sports Exerc. 2007;39(4):665–671. doi:10.1249/mss.0b013e3180304570
[19] Schuster Brandt Frandsen J, Hulme A, Parner ET, et al. How much running is too much? Identifying high-risk running sessions in a 5200-person cohort study. Br J Sports Med. 2025;59(17). doi:10.1136/bjsports-2024-109380
[20] Blagrove RC, Howatson G, Hayes PR. Effects of strength training on the physiological determinants of middle- and long-distance running performance: a systematic review. Sports Med. 2018;48(5):1117–1149. doi:10.1007/s40279-017-0835-7
[21] Lauersen JB, Bertelsen DM, Andersen LB. The effectiveness of exercise interventions to prevent sports injuries: a systematic review and meta-analysis of randomised controlled trials. Br J Sports Med. 2014;48(11):871–877.
[22] Thomas E, Bianco A, Paoli A, Palma A. The relation between stretching typology and stretching duration: the effects on range of motion. Int J Sports Med. 2018;39(4):243–254. doi:10.1055/s-0044-101146
[23] Afonso J, Ramirez-Campillo R, Moscão J, et al. Strength training versus stretching for improving range of motion: a systematic review and meta-analysis. Healthcare. 2021;9(4):427. doi:10.3390/healthcare9040427
[24] Behm DG, Blazevich AJ, Kay AD, McHugh M. Acute effects of muscle stretching on physical performance, range of motion, and injury incidence in healthy active individuals: a systematic review. Appl Physiol Nutr Metab. 2016;41(1):1–11.
[25] Bull FC, Al-Ansari SS, Biddle S, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54(24):1451–1462. doi:10.1136/bjsports-2020-102955
[26] Manresa-Rocamora A, Sarabia JM, Javaloyes A, Flatt AA, Moya-Ramón M. Heart rate variability-guided training for enhancing cardiac-vagal modulation, aerobic fitness, and endurance performance: a methodological systematic review with meta-analysis. Int J Environ Res Public Health. 2021;18(19):10299. doi:10.3390/ijerph181910299
