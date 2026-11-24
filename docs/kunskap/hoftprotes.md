# Träning efter höftprotes – underlag (uppdaterat 2026-11-24)

Rehabläget väljs i introt ("Råkar du heta Anders …") eller under Inställningar. Sedan 2026-11-24 bygger det på
användarens forskningsrapport *Rehabilitering efter total höftprotes: en evidensbaserad guide i fem faser*
(källa 49, med primärstudierna som källor 50–75 i `src/core/sources.ts`). Sjukhusets och kirurgens besked går alltid först.

## Faser – kriteriestyrda
Man går vidare när kriterierna för fasen är uppfyllda (bockas i på I dag, testresultat bockar i automatiskt),
inte efter kalendern. Läkningen sätter ett golv (`min`): fas 3 tidigast v 2, fas 4 tidigast v 6, fas 5 tidigast v 12.
Gamla profiler utan `passed` behåller kalenderns fas och migreras till kriterier vid första besöket.

| Fas | Normal tid | Pass/v | Kärna | Kriterier för att gå vidare |
|---|---|---|---|---|
| 0 Före operationen | datum framåt | 3 | BOA-liknande styrka, lär dig dag 1-övningar, kryckor, checklista (rökstopp, HbA1c, tänder, hud, kortison) | – |
| 1 Sjukhus | dag 0–3 | dagligt, 2–3 ggr/dag | fotpumpar varje vaken timme, isometri 10×5–10 s, hälglidning, benglidning åt sidan, uppresning från hög stol | utskrivningskriterierna |
| 2 Tidig hemfas | v 1–3 | dagligt, 1–2 ggr/dag | uppresning 3×8–12, stående abduktion/extension 3×10–15, brygga, tåhävning, miniknäböj ≤45°, lågt steg från v 2; 3–6 promenader à 5–15 min | läkt sår, ingen Trendelenburghalt med 1 krycka/käpp, minskande smärta |
| 3 Funktion och styrka | v 3–6 | 4 | benpress 3–4×8–12 (60–75 %, 2–3 RIR), abduktion med band/maskin, brygga→enbens, step-up 15–20 cm, knäböj till bänk, enbensstående 3×30 s; cykel 10–20 min, gång 20–40 min/dag | gång utan hjälpmedel och halt, enbensstående ≥10 s, växelvis trappa, 30-s chair stand nära åldersnorm |
| 4 Uppbyggnad | v 6–12 | 3 + 2–3 kondition | benpress enbens 4×5 (80–90 %), tung abduktion 4×5–8, höftsträckning, bulgarisk/utfall, reaktiv balans; kondition 20–45 min | abduktion LSI ≥80 %, 6MWT/40 m FPWT nära norm, ingen halt efter 30 min gång |
| 5 Full funktion | 3–12 mån+ | 2–3 | periodiserad styrka, explosiv benpress/step-ups (RFD), WHO 150–300 min | LSI ≥90 %, livslångt underhåll |

## Anpassningar (src/modules/gym/hip.ts)
- **Sidosnitt:** abduktion mot motstånd (band, kabel, sidliggande, sidoplanka) ersätts av stående abduktion utan motstånd tills `abdCleared`.
- **Partiell belastning:** enbensövningar ersätts av miniknäböj / knip sätet.
- **Tung styrka tidigt (`heavy`):** benpress och abduktion 4×5 redan i fas 3 (Husby 2009, Winther 2018).
- **Hemma utan maskiner:** benpress → goblet squat/knäböj till bänk, kabelabduktion → band/sidliggande, höftlyft med stång → enbens höftlyft.
- **Restriktioner:** text per snitt och om de är ordinerade (bakre: undvik djup böj + inåt + inåtvridning; sido: skydda abduktorsenan; främre: undvik sträckning + utåtvridning).
- **Smärtmonitorering:** ≤5/10 under passet, tillbaka till utgångsläget nästa morgon, ingen ökad svullnad. Ondare eller mer svullet på morgonen → ett set färre och lägsta reps.

## Övrigt i rehabläget
- **Tester** (fliken Tester): 30-s chair stand, enbensstående, TUG, 40 m FPWT, 6MWT, trapptest, Trendelenburg, abduktions-LSI, flexion, HOOS JR, Oxford Hip Score – med instruktioner, riktvärden per fas, trend och påminnelse var 14:e dag.
- **Gånghjälpmedel:** rollator → två kryckor → en → käpp → inget, steg för steg efter kriteriet "ingen halt".
- **Tidslinje** från operationsdatum: stygn, bil, fysioterapeut, profylax, samliv, bassäng, arbete, restriktioner, uppföljning, golf/tandvård, jogging, ett och två år.
- **Läroboken:** 23 kapitel i fem delar (grunderna, före och direkt efter, faserna, kroppen och vardagen, forskningen) med tabeller, "Det viktigaste" och källor. Testet kontrollerar att varje [n] i ett kapitel finns bland kapitlets källor.

## Viktigaste evidensen (se rapporten för detaljer)
- Restriktioner: Yadav 2026 (RCT 1 133 pat.), Korfitsen 2023 (8 835 pat.), Crompton 2020 – inga belägg för att rutinmässiga restriktioner minskar luxation.
- Belastning: Huang 2023 (17 studier) – omedelbar fullbelastning säker även ocementerat.
- Tung styrka: Husby 2009, Winther 2018 – mer styrka, säkert, likvärdig upplevd funktion.
- Ledd vs hemträning: Wijnen, Mikkelsen 2014, AAOS – likvärdigt.
- Kvarstående svaghet: Rasch 2009/2010 – abduktorer 15 % svagare efter 2 år.
- Idrott: EHS-enkät 2020, Klein 2007, J Clin Med 2023 – låg evidens, allt friare.
- Förbehåll: små styrkestudier, riktvärden ej validerade som fasgränser, gäller primärprotes vid artros.
