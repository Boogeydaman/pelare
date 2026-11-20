# Pelare

Gym, löpning och rörlighet – tre program, en plan.

**Appen:** https://boogeydaman.github.io/pelare/ – öppna länken i Chrome på Android, tryck på ⋮ och välj **Installera app**. Varje push till `main` publiceras automatiskt.

- [docs/PLAN.md](docs/PLAN.md) – arkitektur, moduler och byggordning (fas A–F)
- [docs/KONCEPT.md](docs/KONCEPT.md) – designspråket
- [docs/SPEC.md](docs/SPEC.md) – ursprunglig specifikation med forskningsunderlag

## Status
- **Fas A (skelett): klar.** Alla flikar, modulsidor, undersidor och flöden fungerar och sparar data.
- **Fas B (gym): huvuddelen klar.** 74 övningar med kroppsviktsstegar, sex program, dubbelprogression, veckovolym per muskel och anpassning efter plats. Underlaget finns i [docs/kunskap/gym-transkript.md](docs/kunskap/gym-transkript.md).
- **Fas D (rörlighet): huvuddelen klar.** 44 stretchar och djurrörelser, rutinerna Hela kroppen 10 min, Snabbstretch och Djurrörelser, samt målprogram som bygger upp till 3 varv. Underlaget finns i [docs/kunskap/stretch-transkript.md](docs/kunskap/stretch-transkript.md).
- **Kunskap:** 8 artiklar om filosofin bakom träningen (`/las`), med källor och evidensnivå, plus avsnittet ”Därför i dag” på Idag. Källorna finns i `src/core/sources.ts`.
- **Fas C (löpning): huvuddelen klar.** Gå-spring i 11 steg, skadevakt, 80/20, intervaller, långpass och tester.
- **Fas E (coachen): klar.** Skyddsregler (högst två hårda dagar i rad, 24 h mellan tunga ben och hård löpning, lugnt vid trötthet), gemensam återhämtningsmodell, prioritering efter vad som är kvar av veckan, WHO:s hälsogolv, uppvärmning och stretch som tillägg, och allt förklarat under ”Hänsyn i dag” och ”Kvar av veckan”.

## Kom igång
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # PWA i dist/, fungerar offline
npm test         # tester för regelmotorn
```

## Struktur
```
src/
  core/        typer, databas (Dexie/IndexedDB), coachen för Idag, start av pass, tema, exempeldata
  modules/
    types.ts   modulkontraktet – det varje modul implementerar
    registry   listan över moduler; en ny modul läggs till här
    gym/ run/ mobility/   data, program, planering, mått, player och loggformulär
  shared/
    ui/        designsystemet: knappar, pelarstaplar, segmentväljare, sheet, kurva, timer, formulärfält
    layout/    flikar, sidmall, sektioner, rader och nyckeltal
    player/    byggstenar för passläget
  screens/     Idag, Du, modulens hem och undersidor, passläge, Klart, passdetalj, inställningar, onboarding
  engine/      regelmotorn från v1 (testad, kopplas in i fas B–E)
```

## Rutter (hash-routing, Androids bakåtknapp fungerar)
`/idag` · `/gym` · `/lopning` · `/rorlighet` · `/du`, och per modul `/program`, `/framsteg`, `/bibliotek`, `/bibliotek/:id`, `/historik` och `/logga`. Dessutom `/pass` och `/pass/klart`, `/logg/:id`, `/historik`, `/logga` och `/installningar`.
