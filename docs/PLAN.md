# Pelare – plan v3: tre moduler, ett nav

## 1. Grundidén
Pelare är **tre fullvärdiga träningsappar i en**, plus en coach som håller ihop dem:

- **Gym** – styrka med skivstång och maskiner, kroppsvikt, hemmaträning med hantlar och band, och senare cirkel/kondition.
- **Löpning** – från gå-spring till 10 km: lugna pass, intervaller, tempo, långpass och tester.
- **Rörlighet** – målprogram (splitt, höfter, axlar), mikropass, uppvärmning, nedvarvning och tester.
- **Idag** – coachen. Den väger modulerna mot varandra och säger vad som är smartast i dag.

Varje modul ska fungera på egen hand. Vill du bara köra gym använder du Gym-fliken och struntar i resten. Idag är en genväg, inte ett tvång.

## 2. Navigering
Fem flikar i bottenmenyn. Varje modul har sin egen flik, så du är aldrig mer än ett tryck från den.

```
┌──────┬──────┬─────────┬───────────┬──────┐
│ Idag │ Gym  │ Löpning │ Rörlighet │  Du  │
└──────┴──────┴─────────┴───────────┴──────┘
```

| Flik | Svarar på | Innehåll |
|---|---|---|
| **Idag** | Vad ska jag göra nu? | Dagens förslag från alla moduler, veckoremsa, dagsform, ”Logga något annat” |
| **Gym** | Hur går det med styrkan? | Modulens hem (se 3) |
| **Löpning** | Hur går det med löpningen? | Modulens hem |
| **Rörlighet** | Hur går det med rörligheten? | Modulens hem |
| **Du** | Hur går det totalt? | Veckans pelare, månadskalender, alla mål, rekordflöde, inställningar, data |

Regler som gör appen intuitiv:
- **Androids bakåtknapp fungerar överallt.** Riktig routing med webbläsarhistorik, inte dolda overlays.
- **Varje modul har sin färg** – tegel, djupblå, salvia – i fliken, rubriken och passläget. Du ser direkt var du är.
- **Ett pass kan startas varifrån som helst** (Idag, modulens hem, biblioteket, historiken via ”Kör igen”) och öppnas alltid i samma passläge.
- **Modulerna ser likadana ut inuti.** Lär du dig en, kan du alla.

## 3. Modulens hem – samma mall för alla tre

```
GYM                                   ⚙ (modulens inställningar)
──────────────────────────────────────
NÄSTA PASS                       [hero]
Överkropp · 45 min · 5 övningar
[ Starta ]          Byt pass ›
──────────────────────────────────────
PROGRAM
Över/under 4×/v · Block 2 · vecka 3 av 6   ›
▮▮▮▯▯▯  (veckans pass i programmet)
──────────────────────────────────────
FRAMSTEG                                  ›
[nyckeltal 1]  [nyckeltal 2]  [kurva]
──────────────────────────────────────
SNABBSTART
Fritt pass · Kort pass (20 min) · Logga i efterhand
──────────────────────────────────────
BIBLIOTEK                                 ›
Övningar / Passtyper / Stretchar
──────────────────────────────────────
HISTORIK                                  ›
Senaste 3 passen
```

Undersidor per modul (samma uppsättning i alla tre):
- **Program** – välj eller byt program, se hela blocket, vilken vecka du är i.
- **Framsteg** – alla mått och kurvor för modulen.
- **Bibliotek** – bläddra, sök, se detaljer och starta en enskild övning eller ett pass.
- **Historik** – alla pass, med ”Kör igen” och redigering.
- **Passdetalj** – vad du gjorde, set för set eller segment för segment.

## 4. Modulerna i detalj

### Gym
| Del | Innehåll |
|---|---|
| Träningsformer | **Styrka** (gymutrustning), **Kroppsvikt** (progressionsstegar), **Hemma** (hantlar och band), senare **Kondition/cirkel** |
| Program | Helkropp 2–3×/v · Över/under 4×/v · Kroppsvikt grund · Hemma med hantlar |
| Passbyggare | Programmets nästa pass, eller ett fritt pass där du väljer muskelgrupper och tid |
| Progression | Vikt: dubbelprogression. Kroppsvikt: **stegar** (knäböj → bulgarisk → pistol, armhävning → … → enarms). Lätt vecka vid behov |
| Framsteg | Beräknat max per huvudlyft, personliga rekord, set per muskelgrupp och vecka (kroppskarta), nivå i kroppsviktsstegarna |
| Passläge | Set för set, stora siffror, vilotimer, byt eller hoppa över övning, ”samma som förra gången” |
| Bibliotek | Övningar med muskler, utrustning, varianter, tekniktips och din historik per övning |

### Löpning
| Del | Innehåll |
|---|---|
| Program | Från noll till 30 min (gå-spring) · 5 km · 10 km · Underhåll |
| Passtyper | Lugnt, långpass, intervaller, tempo, stegringar, test (5 km eller 12 min) |
| Säkerhet | Skadevakt: aldrig mer än 10 % längre än längsta passet senaste 30 dagarna |
| Passläge | Segmenttimer med signal och vibration, ljud för intervallbyten. GPS kommer senare |
| Logga | Från timern, manuellt (tid, distans, känsla), senare import från Strava eller Health Connect |
| Framsteg | Km och tid per vecka, längsta pass, testresultat, tempo vid lugn ansträngning, var du är i programmet |

### Rörlighet
| Del | Innehåll |
|---|---|
| Program | Splitt framåt · Sidosplitt · Höfter · Axlar och bröstrygg · Allmän rörlighet |
| Passtyper | Programpass (15–25 min), mikropass (5–10 min), uppvärmning före gym/löpning, nedvarvning efter |
| Progression | Hålltid 30 → 45 → 60 s, fler varv, svårare varianter, nivåer per program |
| Tester | Var fjärde vecka: splittmått i cm, knä mot vägg, framåtfällning, axelflexion och djup knäböj |
| Passläge | Hålltimer med byte av sida, nedräkning till nästa stretch, bild/figur per stretch |
| Framsteg | Testresultat över tid (till exempel ”28 cm kvar till golvet”), dagar per vecka, nivå i programmet |

**Kopplingar mellan modulerna:** Gym och Löpning kan be Rörlighet om uppvärmning och nedvarvning, som läggs automatiskt före och efter passet. Trötthet från alla moduler går in i samma återhämtningsmodell.

## 5. Idag – coachen
- Frågar varje modul: *vad vill du att användaren gör i dag?* Varje modul svarar med 1–3 kandidater.
- Väger kandidaterna mot veckomål, återhämtning (benen efter löpning, hårda dagar i rad), dagsform och tid.
- Visar **ett** förslag stort och ett alternativ per övrig modul. Allt startas med ett tryck.
- Kombinerar pass när det passar: gympass plus 10 min stretch, lugn löpning plus mikropass.
- Har ”Logga något annat” för det som gjorts utanför appen (fotboll, cykel, promenad).

## 6. Skelettets arkitektur

### Modulkontrakt
Allt hänger på ett gemensamt gränssnitt som varje modul implementerar:

```ts
interface TrainingModule {
  id: 'gym' | 'run' | 'mobility';
  name: string; color: string;

  // Planering
  nextSession(ctx): PlannedSession | null;   // modulens eget ”nästa pass”
  candidates(ctx): PlannedSession[];          // förslag till Idag
  weeklyTarget(profile): WeeklyTarget;

  // Effekter
  load(log: SessionLog): LoadContribution;    // trötthet per kroppsdel
  metrics(logs, tests): Metric[];             // framsteg

  // UI (modulens egna delar, inne i gemensamma ramar)
  Player: Component;     // passläge
  Library: Component;
  ProgramPage: Component;
}
```

Modulerna registreras i ett register. Idag, Du, kalendern och återhämtningsmodellen läser alla därifrån. Vill vi lägga till en fjärde modul senare (till exempel cykel eller simning) räcker det att implementera kontraktet.

### Mappstruktur
```
src/
  core/            profil, veckan, återhämtning, coach (Idag), lagring, export
  modules/
    gym/           data, program, planerare, progression, player, skärmar
    run/
    mobility/
  shared/
    ui/            designsystemet (knappar, staplar, sheet, kurvor, timer)
    player/        passlägets ram: header, progress, avsluta, Klart-skärm
    layout/        flikar, sidmall för modulens hem, undersidor
  app/             routing och start
```

### Datamodell (IndexedDB via Dexie – klarar år av data offline)
| Tabell | Innehåll |
|---|---|
| `profile` | Mål per modul, dagar och minuter per vecka, platser och utrustning, nivå per modul |
| `enrollments` | Valt program per modul: program, start, aktuell vecka, inställningar |
| `sessions` | Gemensamt huvud (id, modul, typ, start, längd, känsla, anteckning) plus en modulspecifik del (set, segment, stretchar) |
| `tests` | Mätningar: modul, test, värde, datum |
| `checkins` | Dagsform per dag |
| `prs` | Härledda rekord, cachade för snabb visning |

### Routing
| Väg | Skärm |
|---|---|
| `/idag`, `/du` | Flikar |
| `/gym`, `/lopning`, `/rorlighet` | Modulens hem |
| `/:modul/program`, `/framsteg`, `/bibliotek`, `/historik` | Undersidor |
| `/:modul/bibliotek/:id`, `/:modul/historik/:id` | Detaljsidor |
| `/pass/:id` | Passläget (helskärm) |
| `/pass/:id/klart` | Klart-skärmen |
| `/installningar/...` | Inställningar |

## 7. Design – vad som behålls och vad som skärps
**Behålls:** papperston och bläck, serif för rubriker, stora siffror, tunna linjer, de tre staplarna och passläget i modulens färg.

**Skärps:**
- **Modulidentitet.** Varje modulhem får ett färgat huvud och en egen ikon. Tegel för gym, djupblått för löpning, salvia för rörlighet.
- **Täthet efter sammanhang.** Luftigt på Idag, informationsrikt men ordnat i modulens hem, stort och enkelt i passläget.
- **Riktiga datavisualiseringar.** Kroppskarta för muskler, veckostaplar för löpvolym, mätkurvor för rörlighet och en månadskalender i Du.
- **Figurer för övningar och stretchar.** Enkla, enhetliga linjeillustrationer. Platshållare i skelettet, riktiga bilder senare.
- **Mikrointeraktioner.** Haptik när ett set loggas, signal när ett segment byts och en animation när ett rekord slås.

## 8. Byggordning
| Fas | Innehåll | Klart när |
|---|---|---|
| **A. Skelett** | Routing med bakåtknapp, modulregister och kontrakt, Dexie-lagring, fem flikar, modulhem-mallen med alla sektioner, alla undersidor som skal, passlägets ram plus en player per modul, logga och redigera, Du-fliken, inställningar. Exempeldata via modulerna | Allt går att klicka igenom, data sparas, bakåtknappen fungerar |
| **B. Gym** | Övningsdatabas (~80), träningsformer, program, passbyggare, progression inklusive kroppsviktsstegar, kroppskarta | Ett riktigt gymprogram går att följa i veckor |
| **C. Löpning** | Program, passtyper, skadevakt, timer med ljud, manuell loggning, tester | Gå-spring till 5 km går att följa |
| **D. Rörlighet** | Stretchbibliotek, program med nivåer, tester, uppvärmning och nedvarvning åt de andra modulerna | Splittprogrammet går att följa och mäta |
| **E. Coachen** | Idag väger modulerna, gemensam återhämtning och kombinerade pass | Idag föreslår rimligt över en simulerad månad |
| **F. Ut i världen** | Publicering (installera på Android), ikoner och splash, säkerhetskopiering, senare import från Strava och Health Connect | Appen ligger på hemskärmen och används |

Den befintliga regelmotorn (`src/engine/`) återanvänds i B–E. Reglerna, testerna och logiken för progression, skadevakt och deload flyttas in i respektive modul.
