# Kunskapsbank: gymtranskript (GYM.pdf)

Inläst 2026-11-20. Källa: transkript av åtta YouTube-videor om styrketräning, kroppsviktsträning och programupplägg. Videorna kommer från Dr Mike Israetel (Renaissance Periodization), Calisthenics Family, en 20-minuters följ-med-video, Jeff Nippard och några andra tränare.

**Nivå: D** (video eller coach). Enligt specens regler får D aldrig ensam ändra en regel, bara övningsval och tips. Påståenden som stämmer med befintliga A- och B-källor stärker reglerna men ändrar dem inte.

| Påstående (sammanfattat) | Från | Stämmer med | Används till |
|---|---|---|---|
| 6–20 hårda set per muskel och vecka. 3 är för lite, 36 för mycket | Dr Mike | `strength.weekly_sets` 10–20 [1][2] (A) | Regeln är oförändrad. Veckovolymen visas per muskel |
| Varje muskel minst 2 gånger i veckan. 1×/v fungerar men 2×/v är klart bättre | Dr Mike | `strength.frequency` [1] (A) | Alla program träffar varje muskel minst 2×/v |
| Träna inte en muskel som fortfarande är öm eller svag, men vila inte heller längre än nödvändigt | Dr Mike | Trötthetsmodellen (H) | Passbyggaren hoppar över muskler som tränats hårt de senaste 48 h |
| Efter 10–12 set per muskel och pass blir det ”skräpvolym” | Dr Mike | `strength.session_cap` 8–10 [14] (H, preprint) | Taket är max 10 set per muskel och pass |
| 1–3 övningar per muskel och pass. Färre när muskeln tränas oftare | Dr Mike | – | Programdesign |
| Undvik överflödiga övningar, till exempel fyra sorters rodd i samma pass | Dr Mike | – | Programdesign: en rodd plus ett vertikalt drag, inte fyra rodder |
| Huvudlyft 3 × 6–10 med 2–3 min vila. Assistansövningar 8–15 reps med cirka 90 s vila | Natural 3×/v | `strength.rep_ranges` [4], `strength.rest` [5] | Standardintervallen i programmen |
| Behåll huvudlyften i 12 veckor och rotera var 12–16:e vecka | Natural 3×/v | `strength.variation` 4–8 v [10] (A) | **Används inte.** Regeln behålls: block om 6 veckor |
| Deload behövs inte vid 3 pass i veckan | Natural 3×/v | `strength.deload` [12][13] (B/C) | **Används inte.** Strider mot B-underlag |
| Triceps över huvudet gav cirka 40 % mer tillväxt än pressdowns | Nippard, minimalist | Maeo 2023 [8] (B) | Triceps över huvudet är förstaval |
| Sittande bencurl gav mer tillväxt än liggande | Nippard, effective reps | **Verifierad:** Maeo 2021 [31] (B): +14 % mot +9 % på 12 v. Videornas ”50 %” är överdrivet | Övningsval: sittande bencurl är förstaval |
| Stående vadpress (raka ben) är bättre än sittande | Nippard | **Verifierad:** Kinoshita 2023 [32] (B) | Övningsval: stående vadpress |
| Lutande bänkpress ger både övre bröst och axlar | Nippard, minimalist | – | Övningsval i program med få övningar |
| Hantlar i stället för skivstång sparar tid och ger större rörelseomfång | Minimalist | `strength.rom` [6] | Övningsval i minimalistprogrammet |
| Dropset och myo-reps ger mycket stimulans på kort tid | Minimalist, effective reps | – | Valbar teknik i minimalistprogrammet, märkt D |
| ”Effektiva reps” i rest-pause, 20 per övning | Effective reps | – | Används inte som standard. Kan bli en valbar teknik senare |
| Nybörjare: helkropp 3 gånger i veckan | Calisthenics Family | `strength.frequency` [1] | Programmen Helkropp och Kroppsvikt |
| Progressionsstegar i kroppsvikt: knäarmhävning → armhävning → nedåtlutande → arkerarmhävning, och motsvarande för pike, chins, dips, pistol, hollow och L-sit | Calisthenics-videorna | – | Kroppsviktsstegar i biblioteket. Svårare variant föreslås när toppen av repintervallet nås |
| 20 minuter hemma utan utrustning: 5 övningar, 40 s arbete och 20 s vila, 3 varv | 20-min-videon | – | Programmet Hemma 20 min. Videon saknar ryggövning, så Y-lyft på golvet är tillagt (rygg ≥ 2×/v) |
| Kost (1 g protein per pound kroppsvikt), sömn 7–8 h, magnesium | Natural 3×/v | – | Utanför appens område. Används inte |
| Nackträning | Nippard | – | Används inte |

## Följdändringar i appen
- Övningsbiblioteket byggt om med cirka 60 övningar, inklusive kroppsviktsstegar (lättare och svårare variant per övning).
- Sex gymprogram: Helkropp 3×, Över/under 4×, Minimalist 2×, Kroppsvikt 3×, Hemma med hantlar och Hemma 20 min.
- Passbyggaren väljer övning efter plats och utrustning, sätter vikt eller variant med dubbelprogression och visar veckovolym per muskel.

## Kompletterande källor (sökta 2026-11-20)
[27] Paluch 2022 steg per dag · [28] Momma 2022 styrketräning och dödlighet · [29] Watson 2015 sömn · [30] Morton 2018 protein · [31] Maeo 2021 sittande bencurl · [32] Kinoshita 2023 stående vadpress. Se `src/core/sources.ts`.
