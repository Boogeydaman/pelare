// Stretch and movement library. Sources: docs/kunskap/stretch-transkript.md (level D) and rules [21][22][23][24].

export type Area = 'neck' | 'shoulders' | 'chest' | 'spine' | 'hip_flexors' | 'glutes' | 'hamstrings' | 'adductors' | 'calves' | 'wrists';

export const AREA_NAME: Record<Area, string> = {
  neck: 'Nacke', shoulders: 'Axlar', chest: 'Bröst', spine: 'Rygg', hip_flexors: 'Höftböjare', glutes: 'Säte/höft',
  hamstrings: 'Baksida lår', adductors: 'Insida lår', calves: 'Vader/fotled', wrists: 'Handleder',
};

export type Group = 'Nacke och axlar' | 'Rygg' | 'Höft' | 'Baksida lår' | 'Insida lår' | 'Fotled' | 'Djurrörelser';
export const GROUPS: Group[] = ['Nacke och axlar', 'Rygg', 'Höft', 'Baksida lår', 'Insida lår', 'Fotled', 'Djurrörelser'];

export interface Stretch {
  id: string;
  name: string;
  group: Group;
  areas: Area[];
  kind: 'statisk' | 'dynamisk' | 'rörelse';
  sides: 1 | 2;
  cue: string;
  tips: [string, string, string];
  easier?: string;
  harder?: string;
  why?: string;
}

const S = (s: Stretch) => s;

export const STRETCHES: Stretch[] = [
  // Nacke och axlar
  S({ id: 'upper_trap', name: 'Nackstretch', group: 'Nacke och axlar', areas: ['neck'], kind: 'statisk', sides: 2, cue: 'Örat mot axeln, handen drar lätt över huvudet.', tips: ['Axeln på andra sidan sjunker ner', 'Bara lätt drag med handen', 'Andas lugnt'] }),
  S({ id: 'head_roll', name: 'Huvudrullningar', group: 'Nacke och axlar', areas: ['neck'], kind: 'dynamisk', sides: 1, cue: 'Stora, långsamma cirklar med huvudet åt båda hållen.', tips: ['Långsamt', 'Byt håll halvvägs', 'Stanna om det känns obehagligt'] }),
  S({ id: 'chest_opener', name: 'Bröstöppnare', group: 'Nacke och axlar', areas: ['chest', 'shoulders'], kind: 'statisk', sides: 1, cue: 'Knäpp händerna bakom ryggen, bröstet mot taket.', tips: ['Lyft armarna lite bakåt', 'Skulderbladen ihop', 'Bra efter mycket sittande'] }),
  S({ id: 'cross_body', name: 'Bakre axel', group: 'Nacke och axlar', areas: ['shoulders'], kind: 'statisk', sides: 2, cue: 'Armen över kroppen, andra handen drar armbågen.', tips: ['Axeln nere', 'Drag i armbågen, inte handleden', 'Vrid inte överkroppen'] }),
  S({ id: 'lat_stretch', name: 'Latsstretch på alla fyra', group: 'Nacke och axlar', areas: ['shoulders', 'spine'], kind: 'statisk', sides: 1, cue: 'Händerna fram, tummarna upp, sjunk bröstet mot golvet.', tips: ['Känns bak i armhålan', 'Knäpp händerna för mer', 'Lyft huvudet ur vägen'], why: 'Latsen används nästan aldrig i fullt omfång i vardagen (snabbstretch-videon).' }),
  S({ id: 'wall_slide', name: 'Armar upp mot vägg', group: 'Nacke och axlar', areas: ['shoulders'], kind: 'dynamisk', sides: 1, cue: 'Ryggen mot väggen, för armarna upp utan att svanka.', tips: ['Ländryggen mot väggen', 'Långsamt', 'Tummarna mot väggen'] }),
  S({ id: 'open_book', name: 'Öppna boken', group: 'Nacke och axlar', areas: ['spine', 'chest'], kind: 'dynamisk', sides: 2, cue: 'Ligg på sidan, öppna övre armen bakåt.', tips: ['Knäna ihop', 'Följ handen med blicken', 'Andas ut när du öppnar'] }),

  // Rygg
  S({ id: 'cat_cow', name: 'Katt och ko', group: 'Rygg', areas: ['spine'], kind: 'dynamisk', sides: 1, cue: 'På alla fyra: skjut upp ryggen, sänk sedan magen.', tips: ['Följ andningen', 'Hela ryggen rör sig', 'Långsamt'] }),
  S({ id: 'childs_pose', name: 'Barnets position', group: 'Rygg', areas: ['spine', 'shoulders'], kind: 'statisk', sides: 1, cue: 'Knäna brett, sätet mot hälarna, armarna långt fram.', tips: ['Sjunk ner i höften', 'Pannan mot golvet', 'Andas in i ryggen'] }),
  S({ id: 'lumbar_rot', name: 'Ländryggsrotation', group: 'Rygg', areas: ['spine', 'glutes'], kind: 'statisk', sides: 2, cue: 'Rygg, dra ena knät över kroppen åt andra sidan.', tips: ['Axlarna kvar i golvet', 'Titta åt motsatt håll', 'Låt benet bli tungt'] }),
  S({ id: 'side_stretch', name: 'Sidostretch', group: 'Rygg', areas: ['spine'], kind: 'statisk', sides: 2, cue: 'Armen upp och över åt sidan, höften kvar.', tips: ['Lyft inte höften', 'Tänk en båge från lillfingret till sittbenet', 'Sjunk lite djupare med tiden'] }),
  S({ id: 'seated_twist', name: 'Sittande vridning', group: 'Rygg', areas: ['spine'], kind: 'dynamisk', sides: 1, cue: 'Vrid till ena sidan, håll 3 s, byt.', tips: ['Rak rygg', 'Lugna växlingar', 'Bra avslutning'] }),
  S({ id: 'worlds_greatest', name: 'Världens bästa stretch', group: 'Rygg', areas: ['hip_flexors', 'spine', 'hamstrings'], kind: 'dynamisk', sides: 1, cue: 'Utfall, armbågen mot golvet, rotera upp mot taket.', tips: ['Byt sida varje rep', 'Långsamt', 'Perfekt uppvärmning'] }),

  // Höft
  S({ id: 'hip_flexor', name: 'Höftböjarstretch', group: 'Höft', areas: ['hip_flexors'], kind: 'statisk', sides: 2, cue: 'Utfall, bakre knät i golvet, skjut höften framåt.', tips: ['Spänn sätet på bakre sidan', 'Ta tag i bakre foten för mer', 'Kudde under knät'], harder: 'couch', why: 'Höftböjarna blir strama av allt sittande (snabbstretch-videon).' }),
  S({ id: 'couch', name: 'Soffstretch', group: 'Höft', areas: ['hip_flexors'], kind: 'statisk', sides: 2, cue: 'Bakre knät mot väggen, spänn sätet och res överkroppen.', tips: ['Kudde under knät', 'Res dig gradvis', 'Intensiv – börja kort'], easier: 'hip_flexor' }),
  S({ id: 'flexor_glute', name: 'Höftböjare + säte-kombo', group: 'Höft', areas: ['hip_flexors', 'hamstrings', 'glutes'], kind: 'statisk', sides: 2, cue: 'Utfall framåt, sätt dig sedan bakåt på hälen med främre benet rakt.', tips: ['Två stretchar i ett flöde', 'Luta fram mot tårna', 'Byt sida'], why: 'Favoritkombon från 10-minutersrutinen.' }),
  S({ id: 'figure_four', name: 'Figur 4', group: 'Höft', areas: ['glutes'], kind: 'statisk', sides: 2, cue: 'Rygg, fotleden över knät, dra benet mot dig.', tips: ['Sänk svanskotan mot golvet', 'Håll stramare sidan 10 s längre', 'Bra för djup knäböj'], harder: 'pigeon' }),
  S({ id: 'pigeon', name: 'Duvan', group: 'Höft', areas: ['glutes'], kind: 'statisk', sides: 2, cue: 'Främre smalbenet snett framför dig, sjunk ner med höften i våg.', tips: ['Kudde under sätet vid behov', 'Höften i våg', 'Andas lugnt'], easier: 'figure_four' }),
  S({ id: 'ninety_ninety', name: '90/90-höftbyte', group: 'Höft', areas: ['glutes'], kind: 'dynamisk', sides: 1, cue: 'Båda knäna i 90°, vrid över till andra sidan.', tips: ['Rak rygg', 'Långsamma byten', 'Händerna bakom som stöd'] }),
  S({ id: 'frog', name: 'Grodan', group: 'Höft', areas: ['adductors', 'glutes'], kind: 'statisk', sides: 1, cue: 'Knäna brett på mjukt underlag, gunga försiktigt bakåt.', tips: ['Fötterna i linje med knäna', 'Små gungningar', 'Mjukt underlag'] }),

  // Baksida lår
  S({ id: 'supine_ham', name: 'Liggande baksida lår', group: 'Baksida lår', areas: ['hamstrings'], kind: 'statisk', sides: 2, cue: 'Rygg, håll bakom knät och sträck benet uppåt.', tips: ['Andra benet rakt i golvet', 'Sträck tills det drar', 'Bekvämt – inget våld'], harder: 'half_split' }),
  S({ id: 'half_split', name: 'Halv splitt', group: 'Baksida lår', areas: ['hamstrings'], kind: 'statisk', sides: 2, cue: 'Främre benet rakt, tårna upp, fäll framåt med rak rygg.', tips: ['Fäll från höften', 'Rak rygg', 'Block under händerna'], easier: 'supine_ham', harder: 'split_slide' }),
  S({ id: 'split_slide', name: 'Splittglid med stöd', group: 'Baksida lår', areas: ['hamstrings', 'hip_flexors'], kind: 'statisk', sides: 2, cue: 'Stöd under händerna, glid ner tills det drar – inte smärtar.', tips: ['Block eller stolar', 'Bakre benet rakt', 'Mät avståndet till golvet'], easier: 'half_split' }),
  S({ id: 'elephant_walk', name: 'Elefantgång', group: 'Baksida lår', areas: ['hamstrings', 'calves'], kind: 'dynamisk', sides: 1, cue: 'Händerna mot golvet, sträck ett knä i taget.', tips: ['Händerna där du når', 'Mix av nervglidning och stretch', 'Avsluta med båda raka'] }),
  S({ id: 'forward_fold', name: 'Framåtfällning', group: 'Baksida lår', areas: ['hamstrings', 'spine'], kind: 'statisk', sides: 1, cue: 'Mjuka knän, låt överkroppen hänga tungt.', tips: ['Låt huvudet hänga', 'Andas ut neråt', 'Böj knäna om ryggen drar'] }),

  // Insida lår
  S({ id: 'pancake', name: 'Bred fällning (pancake)', group: 'Insida lår', areas: ['adductors', 'hamstrings'], kind: 'statisk', sides: 1, cue: 'Benen brett, raka knän, gå fram med händerna.', tips: ['Spänn låren för raka knän', 'Väggen bakom ryggen om det är svårt', 'Gunga lätt sida till sida'], why: 'Bästa stretchen för sidosplitt – på toppnivå är det samma rörelse (snabbstretch-videon).' }),
  S({ id: 'butterfly', name: 'Fjärilen', group: 'Insida lår', areas: ['adductors'], kind: 'statisk', sides: 1, cue: 'Fotsulorna ihop, rak rygg, luta framåt från höften.', tips: ['Armbågarna trycker knäna ner', 'Rak rygg', 'Andas lugnt'] }),
  S({ id: 'side_lunge', name: 'Sidoutfall, håll', group: 'Insida lår', areas: ['adductors'], kind: 'statisk', sides: 2, cue: 'Raka benet sträckt, sätet bakåt och ner.', tips: ['Hälen i golvet', 'Böjda knät utåt', 'Byt sida'] }),
  S({ id: 'cossack', name: 'Kosackböj', group: 'Insida lår', areas: ['adductors', 'hip_flexors'], kind: 'dynamisk', sides: 1, cue: 'Byt sida långsamt, så djupt det går med hälen i golvet.', tips: ['Raka benet låst', 'Bara så djupt det känns bra', 'Djupare för varje varv'] }),

  // Fotled
  S({ id: 'knee_wall', name: 'Knä mot vägg', group: 'Fotled', areas: ['calves'], kind: 'statisk', sides: 2, cue: 'Hälen i golvet, för knät mot väggen.', tips: ['Flytta foten bakåt gradvis', 'Knät över tårna', 'Mät avståndet'] }),
  S({ id: 'calf_wall', name: 'Vadstretch mot vägg', group: 'Fotled', areas: ['calves'], kind: 'statisk', sides: 2, cue: 'Bakre benet rakt, hälen i golvet.', tips: ['Tårna rakt fram', 'Luta mot väggen', 'Böj knät för djupare vad'] }),
  S({ id: 'down_dog', name: 'Nedåtgående hund', group: 'Fotled', areas: ['calves', 'hamstrings', 'shoulders'], kind: 'statisk', sides: 1, cue: 'Höften högt, hälarna mot golvet, armarna raka.', tips: ['Böjda knän är okej', 'Tryck golvet ifrån dig', 'Trampa växelvis'] }),

  // Djurrörelser (rörelse, 10 steg fram och tillbaka)
  S({ id: 'finger_pushup', name: 'Fingerarmhävningar', group: 'Djurrörelser', areas: ['wrists'], kind: 'dynamisk', sides: 1, cue: 'På alla fyra: tryck genom fingrarna så handflatan lyfter.', tips: ['Mer vikt på händerna efterhand', 'Förbereder handlederna', 'Kör före djurrörelserna'] }),
  S({ id: 'bear_squat', name: 'Björnknäböj', group: 'Djurrörelser', areas: ['calves', 'hip_flexors'], kind: 'dynamisk', sides: 1, cue: 'På alla fyra: gunga höften mot hälarna med tårna böjda.', tips: ['Känn stortån sträckas', 'Tryck knäna fram', 'Förbereder för ankgång'] }),
  S({ id: 'cat_crawl', name: 'Kattkrypning', group: 'Djurrörelser', areas: ['shoulders', 'wrists'], kind: 'rörelse', sides: 1, cue: '10 steg framåt och bakåt, motsatt arm och ben samtidigt.', tips: ['Stabil men mjuk', 'Bakåt är svårare', 'Knäna nära golvet'] }),
  S({ id: 'frog_hop', name: 'Grodhopp', group: 'Djurrörelser', areas: ['adductors', 'wrists', 'calves'], kind: 'rörelse', sides: 1, cue: 'Händerna fram, vikten på axlarna, fötterna hoppar till händerna.', tips: ['Djup knäböj i landningen', 'Stark tryck från händerna', 'Högre höft om det är tungt'] }),
  S({ id: 'bear_walk', name: 'Björngång', group: 'Djurrörelser', areas: ['hamstrings', 'calves', 'shoulders'], kind: 'rörelse', sides: 1, cue: 'Som kattkrypning men med höften högt.', tips: ['Skjut bröstet bakåt för stretch', 'Bra för stel baksida', 'Även bakåt'] }),
  S({ id: 'monkey', name: 'Apan', group: 'Djurrörelser', areas: ['adductors', 'spine'], kind: 'rörelse', sides: 1, cue: 'Djup knäböj, händerna åt sidan, hoppa sidledes.', tips: ['Högre höft om du inte når djupt', 'Vrid och sträck', 'Båda hållen'] }),
  S({ id: 'crab_walk', name: 'Krabbgång', group: 'Djurrörelser', areas: ['chest', 'shoulders', 'wrists'], kind: 'rörelse', sides: 1, cue: 'Händerna bakom dig, höften upp, gå framåt och bakåt.', tips: ['Öppnar bröst och axlar', 'Fingrarna utåt om handlederna tar emot', 'Underskattad'] }),
  S({ id: 'horse_walk', name: 'Hästgång', group: 'Djurrörelser', areas: ['adductors', 'glutes'], kind: 'rörelse', sides: 1, cue: 'Bred låg ställning, knäna ut, gå framåt med höften i samma höjd.', tips: ['Bröstet upp', 'Känns i insida lår', 'Bakåt är svårast'] }),
  S({ id: 'half_duck', name: 'Halv ankgång', group: 'Djurrörelser', areas: ['calves', 'hip_flexors'], kind: 'rörelse', sides: 1, cue: 'Halv knäböj och gå framåt.', tips: ['Funkar för nästan alla', 'Håll höjden', 'Steget före anklunge'], harder: 'duck_lunge' }),
  S({ id: 'duck_lunge', name: 'Anklunge', group: 'Djurrörelser', areas: ['calves', 'hip_flexors'], kind: 'rörelse', sides: 1, cue: 'Gående utfall med fötterna nära varandra så knäna böjs helt.', tips: ['Tryck dig upp ur botten', 'Fötterna tätt', 'Långsamt'], easier: 'half_duck', harder: 'duck_walk' }),
  S({ id: 'duck_walk', name: 'Ankgång', group: 'Djurrörelser', areas: ['calves', 'hip_flexors'], kind: 'rörelse', sides: 1, cue: 'Hela vägen ner, gå framåt med höften låg.', tips: ['Skjut främre knät fram', 'Stor stretch i bakre höften', 'Kräver förberedda knän'], easier: 'duck_lunge', why: 'Slutmålet i djurrörelserna – bygger upp knän och fötter (djurrörelse-videon).' }),
];

export const STRETCH: Record<string, Stretch> = Object.fromEntries(STRETCHES.map((s) => [s.id, s]));
