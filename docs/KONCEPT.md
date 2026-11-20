# Pelare – koncept v2

## Varför om
Version 1 såg ut som de flesta AI-genererade appar: mörkgrå kort med färgad kant, chips överallt, små versala etiketter och för mycket förklarande text. Den krävde dessutom att man fyllde i saker innan man fick något. Den här versionen börjar från frågan: *vad behöver jag när jag öppnar appen?*

## Kärnan
**Öppna appen – svaret står redan där.** Ingen knapp att trycka på för att få ett förslag. Dagens pass räknas fram direkt utifrån det appen vet. Dagsform och tid är valfria justeringar, inte ett formulär.

Appen gör tre saker och inget annat:
1. **Säger vad du ska göra i dag** (Idag)
2. **Leder dig genom passet** (Passläge)
3. **Visar att du blir bättre** (Vecka och Mål)

## Tre pelare – appens signatur
Namnet är grafiken. Tre stående staplar – styrka, löpning, rörlighet – fylls på under veckan. De syns litet överst på Idag, stort på Vecka och animeras när ett pass är klart. Inga ringar, inga streaks, inga poäng.

| Pelare | Färg | Mål-exempel |
|---|---|---|
| Styrka | Tegel `#B9502F` | Bli starkare i grundlyften |
| Löpning | Djupblå `#2E4F86` | Springa 5 km utan att gå |
| Rörlighet | Salvia `#5E8A64` | Gå ner i splitt |

## Designspråk
- **Redaktionellt, inte dashboard.** Stor typografi och mycket luft. Tunna linjer i stället för kort med kanter. Det ska kännas som en välgjord träningsdagbok, inte som en adminpanel.
- **Typografi:** *Instrument Serif* för rubriker (passets namn, skärmtitlar) och *Inter Tight* för allt annat. Siffror skrivs alltid med tabulära siffror, och under pass är de enorma (72–120 px).
- **Färg:** varmt pappersvitt med bläcksvart text i ljust läge, varmt nästan-svart med papperston i mörkt läge. Pelarfärgerna används sparsamt: i staplarna, som tunn markering och som fyllnad i passläget.
- **Passläget är en egen värld:** helskärm i pelarens färg, en sak i taget, knappar i tumzonen och skärmen alltid tänd.
- **Rörelse:** korta, mjuka övergångar (200 ms). Staplarna fylls med en fjäderrörelse när ett pass är klart. Inställningen ”reducera rörelse” respekteras.
- **Ton:** kort, saklig och varm. Ingen skuld och inga utropstecken.

## Struktur
```
Onboarding (4 steg, en fråga per skärm)
  Mål per pelare → Dagar per vecka → Var du tränar → Hälsa

Flikar
  Idag     – dagens pass, dagsform, två alternativ, staplar i miniatyr
  Vecka    – stora staplar, veckoremsa, veckans pass, tidigare veckor
  Mål      – en sektion per pelare: mål, nuläge, milstolpar, kurva

Överlägg
  Passöversikt – innehåll och ”Varför?” innan start
  Passläge     – styrka (set för set), löpning (intervalltimer), rörlighet (hålltimer)
  Klart        – känsla, sammanfattning, staplarna fylls
  Inställningar – profil, mål, utrustning, data, tema
```

## Skal kontra innehåll
Skalet innehåller alla skärmar, flöden, komponenter och designsystemet, och det körs på exempeldata (`src/app/mock.ts`) via vymodeller (`src/app/model.ts`). Innehållet fylls på senare:
- Regelmotorn som väljer pass. En första version finns i `src/engine/` och kopplas in via vymodellerna.
- Övningsbibliotek, stretchrutiner och löpprogram.
- Riktiga beräkningar för progression och mål.
