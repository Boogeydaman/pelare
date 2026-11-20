// Step-by-step instructions for every stretch and movement: how to get into position,
// what to do, and what you should feel. Shown under "Så gör du" and in the session player.

export interface StretchHow { cue: string; how: string[] }

export const STRETCH_HOW: Record<string, StretchHow> = {
  // ---------------- Nacke och axlar
  upper_trap: { cue: 'Luta örat mot axeln och låt handen vila på huvudet.', how: [
    'Sitt eller stå rakt. Låt axlarna sjunka ner.',
    'Luta huvudet åt sidan så att örat går mot axeln. Lägg handen på samma sida över huvudet, ovanför andra örat.',
    'Låt handen vila – den ska bara väga, inte dra. Du känner det på sidan av halsen ner mot axeln.',
    'Håll axeln på andra sidan nere hela tiden, gärna genom att hålla i stolsitsen.',
  ] },
  head_roll: { cue: 'Rulla huvudet långsamt i stora cirklar, byt håll halvvägs.', how: [
    'Sitt eller stå rakt med avslappnade axlar.',
    'Släpp hakan mot bröstet. Rulla sedan huvudet långsamt mot ena axeln, bakåt och vidare mot andra axeln.',
    'Gör stora, långsamma cirklar. Byt håll efter halva tiden.',
    'Är det obehagligt bakåt: gör bara halvcirklar framför kroppen, från axel till axel.',
  ] },
  chest_opener: { cue: 'Knäpp händerna bakom ryggen och lyft bröstet.', how: [
    'Stå rakt och knäpp händerna bakom ryggen, armarna raka.',
    'Dra skulderbladen bakåt och ihop, och lyft bröstet mot taket.',
    'Lyft armarna en bit bakåt-uppåt från ryggen. Du känner det över bröstet och framsidan av axlarna.',
  ] },
  doorway: { cue: 'Underarmen mot dörrkarmen i axelhöjd – kliv framåt tills det drar i bröstet.', how: [
    'Ställ dig i en dörröppning. Lägg underarmen lodrätt mot karmen med armbågen i axelhöjd.',
    'Ta ett litet kliv framåt med foten på samma sida och luta kroppen förbi karmen.',
    'Vrid bröstet lätt bort från armen. Du känner det i bröstet och framsidan av axeln.',
    'Byt sida. Armbågen lite högre än axeln når övre delen av bröstet.',
  ] },
  cross_body: { cue: 'För armen över bröstet och dra armbågen mot dig med andra handen.', how: [
    'Stå eller sitt rakt.',
    'För ena armen rakt över bröstet. Ta tag ovanför armbågen med andra handen.',
    'Dra armen mot bröstet. Håll axeln nere – den ska inte åka upp mot örat.',
    'Du känner det bak på axeln. Byt sida.',
  ] },
  lat_stretch: { cue: 'På knä: armarna långt fram i golvet, sätet bakåt och bröstet ner.', how: [
    'Stå på knä. Lägg händerna i golvet långt framför dig med tummarna uppåt.',
    'Skjut sätet bakåt mot hälarna och låt bröstet sjunka mot golvet.',
    'Du känner det längs sidan av ryggen och bak i armhålan. Låt huvudet hänga mellan armarna.',
    'Mer: lägg händerna på en stol eller soffa och sjunk djupare.',
  ] },
  wall_slide: { cue: 'Ryggen mot väggen, för armarna upp utan att svanka.', how: [
    'Stå med rygg, bakhuvud och sätet mot en vägg, fötterna en fotlängd ut.',
    'Lyft armarna till ett "W": armbågarna i axelhöjd, underarmarna uppåt, händerna mot väggen.',
    'Glid armarna uppåt mot ett "Y" utan att ländryggen lämnar väggen. Sänk tillbaka.',
    'Gå bara så högt som du kan med händerna nära väggen.',
  ] },
  open_book: { cue: 'Ligg på sidan med böjda knän, öppna övre armen bakåt mot golvet.', how: [
    'Ligg på sidan med höfter och knän böjda i 90 grader. Armarna raka framför dig, handflatorna ihop.',
    'Lyft övre armen i en båge upp över kroppen och ner mot golvet på andra sidan. Följ handen med blicken.',
    'Knäna ligger kvar ihop i golvet. Du känner det i bröstet och mellan skulderbladen.',
    'Andas ut när du öppnar, för tillbaka armen långsamt. Byt sida.',
  ] },

  // ---------------- Rygg
  cat_cow: { cue: 'På alla fyra: skjut upp ryggen som en katt, sänk sedan magen och lyft blicken.', how: [
    'Stå på alla fyra: händerna under axlarna, knäna under höfterna.',
    'Katt: andas ut, skjut upp ryggen mot taket och släpp huvudet mot golvet.',
    'Ko: andas in, låt magen sjunka mot golvet och lyft bröstet och blicken.',
    'Växla lugnt i takt med andningen. Hela ryggen ska röra sig, kota för kota.',
  ] },
  childs_pose: { cue: 'Knäna brett, sätet mot hälarna och armarna långt fram.', how: [
    'Stå på knä med stortårna ihop och knäna isär.',
    'Sätt dig bakåt på hälarna och fäll överkroppen framåt mellan knäna.',
    'Sträck armarna långt fram i golvet och vila pannan mot golvet eller en kudde.',
    'Andas lugnt in i ryggen. Du känner det i ländryggen, längs sidorna och i höften.',
  ] },
  lumbar_rot: { cue: 'Ligg på rygg, dra ena knät över kroppen åt andra sidan.', how: [
    'Ligg på rygg med armarna rakt ut åt sidorna.',
    'Böj ena knät och för det över kroppen mot golvet på andra sidan. Andra benet ligger rakt.',
    'Titta åt motsatt håll mot knät. Båda axlarna ska ligga kvar i golvet.',
    'Låt benet bli tungt. Du känner det i ländryggen och på utsidan av höften. Byt sida.',
  ] },
  side_stretch: { cue: 'Ena armen upp och luta överkroppen åt sidan.', how: [
    'Stå med fötterna höftbrett.',
    'Sträck ena armen rakt upp mot taket.',
    'Luta överkroppen åt motsatt sida, som en båge från handen ner till höften. Höften flyttar sig inte.',
    'Du känner det längs sidan av kroppen. Byt sida.',
  ] },
  seated_twist: { cue: 'Sitt rakt och vrid överkroppen till ena sidan, håll 3 sekunder, byt.', how: [
    'Sitt i skräddarställning eller på en stol med rak rygg.',
    'Vrid överkroppen åt ena hållet. Ena handen på knät framför, andra handen i golvet bakom dig.',
    'Håll i tre sekunder och vrid över till andra sidan.',
    'Väx på höjden när du andas in, vrid lite längre när du andas ut.',
  ] },
  worlds_greatest: { cue: 'Utfall, armbågen ner mot foten, vrid sedan armen upp mot taket.', how: [
    'Ta ett långt kliv fram till ett utfall. Bakre benet rakt, båda händerna i golvet innanför främre foten.',
    'Sänk armbågen på samma sida som främre benet ner mot foten.',
    'Vrid upp och sträck samma arm mot taket. Följ handen med blicken.',
    'Sätt tillbaka handen, kliv tillbaka och byt ben. Varje rep tar ungefär fem sekunder.',
  ] },

  // ---------------- Höft
  hip_flexor: { cue: 'Halvt knästående: bakre knät i golvet, spänn sätet och skjut höften fram.', how: [
    'Stå på ett knä med andra foten i golvet framför dig, båda knäna i ungefär 90 grader. Kudde under knät.',
    'Spänn sätet på det bakre benet och tippa bäckenet lätt bakåt, som om du drar in svanskotan.',
    'Skjut höften långsamt framåt med rak överkropp. Du känner det på framsidan av höften och låret på det bakre benet.',
    'Svanka inte. Mer: sträck armen på samma sida som bakre benet upp mot taket.',
  ] },
  couch: { cue: 'Bakre knät mot väggen och foten upp längs väggen, res överkroppen.', how: [
    'Sätt dig på knä med ryggen mot en vägg eller soffa. Kudde under knät.',
    'Ställ ena knät nära väggen och låt smalbenet gå rakt upp längs väggen. Andra foten i golvet framför dig.',
    'Börja med händerna på främre knät. Spänn sätet och res överkroppen gradvis upp mot rak.',
    'Den känns starkt i framsida lår och höft. Börja kort och gå närmare väggen med tiden.',
  ] },
  flexor_glute: { cue: 'Utfall med bakre knät i golvet, sätt dig sedan bakåt med främre benet rakt.', how: [
    'Börja halvt knästående med bakre knät i golvet. Skjut höften framåt – det drar i bakre höften.',
    'Sätt dig sedan bakåt mot bakre hälen och sträck det främre benet, tårna uppåt.',
    'Fäll framåt med rak rygg mot främre foten – nu drar det i baksida lår.',
    'Växla lugnt mellan lägena, eller håll varje läge en stund. Byt sida.',
  ] },
  figure_four: { cue: 'Ligg på rygg, lägg fotleden över andra knät och dra benen mot dig.', how: [
    'Ligg på rygg med böjda knän och fötterna i golvet.',
    'Lägg högra fotleden över vänstra knät, så att benen bildar en fyra.',
    'Ta tag bakom vänstra låret och dra benen mot bröstet. Du känner det i högra sätet.',
    'Håll huvudet och axlarna i golvet. Byt sida.',
  ] },
  pigeon: { cue: 'Främre smalbenet snett framför dig, bakre benet rakt bakåt, sjunk ner.', how: [
    'Börja på alla fyra. För höger knä fram bakom höger hand och lägg smalbenet snett framför dig.',
    'Sträck vänster ben rakt bakåt längs golvet.',
    'Håll höften rak (båda höftbenen pekar framåt) och sänk dig. Kudde under sätet om det inte når golvet.',
    'Fäll gärna framåt över benet. Du känner det djupt i sätet. Byt sida.',
  ] },
  ninety_ninety: { cue: 'Sitt med båda knäna i 90 grader åt samma håll, vrid över till andra sidan.', how: [
    'Sitt på golvet. Det främre benet ligger framför dig med knät i 90 grader, det bakre åt sidan, också i 90 grader.',
    'Sätt händerna bakom dig som stöd och sitt så rakt du kan.',
    'Lyft knäna och vrid över till samma form åt andra hållet. Fötterna står kvar på samma ställe.',
    'Gör det långsamt fram och tillbaka. Du känner det i höfterna.',
  ] },
  frog: { cue: 'På underarmarna med knäna brett isär, gunga höften försiktigt bakåt.', how: [
    'Börja på alla fyra på mjukt underlag och vila på underarmarna.',
    'Glid isär knäna så brett det går. Smalbenen pekar rakt bakåt, med fötterna i linje med knäna.',
    'Gunga höften långsamt bakåt mot hälarna och fram igen.',
    'Du känner det på insida lår. Gå bara så brett det känns bra.',
  ] },

  // ---------------- Baksida lår
  supine_ham: { cue: 'Ligg på rygg, håll bakom knät och sträck benet mot taket.', how: [
    'Ligg på rygg med båda benen raka.',
    'Lyft ena benet och ta tag bakom låret, med händerna eller ett band runt foten.',
    'Sträck benet mot taket tills det drar bak i låret. Andra benet ligger kvar rakt i golvet.',
    'Andas ut och låt benet komma lite närmare. Byt sida.',
  ] },
  half_split: { cue: 'På knä, främre benet rakt med tårna upp, fäll framåt med rak rygg.', how: [
    'Stå på knä. Sträck ena benet rakt fram med hälen i golvet och tårna uppåt.',
    'Bakre knät är under höften. Händerna i golvet bredvid främre benet, eller på block.',
    'Fäll framåt från höften med rak rygg. Du känner det bak i låret på det främre benet.',
    'Tänk naveln mot knät, inte näsan mot knät. Byt sida.',
  ] },
  split_slide: { cue: 'Glid isär benen till splitt med händerna på block, bara tills det drar.', how: [
    'Ställ ett block eller en stol på var sida om dig. Ena benet fram, andra bak.',
    'Glid långsamt isär benen. Främre benet rakt med tårna upp, bakre knät pekar ner i golvet.',
    'Ta stöd med händerna och stanna där det drar – inte där det gör ont.',
    'Höften pekar rakt fram. Mät gärna avståndet från grenen till golvet varje vecka.',
  ] },
  elephant_walk: { cue: 'Händerna i golvet, böj och sträck ett knä i taget.', how: [
    'Stå och fäll framåt. Sätt händerna i golvet framför fötterna – böj knäna så mycket som behövs.',
    'Sträck ena knät och böj det andra. Byt, som om du går på stället.',
    'Händerna ligger kvar. Du känner det bak i låret på det raka benet.',
    'Avsluta med att sträcka båda knäna samtidigt en stund.',
  ] },
  forward_fold: { cue: 'Fäll framåt med mjuka knän och låt överkroppen hänga tungt.', how: [
    'Stå med fötterna höftbrett och mjuka knän.',
    'Fäll framåt från höften och låt överkroppen hänga mot golvet.',
    'Låt huvud och armar hänga tungt. Ta tag i motsatta armbågar om du vill.',
    'Andas ut och sjunk lite djupare. Rulla upp långsamt, kota för kota.',
  ] },

  // ---------------- Insida lår
  pancake: { cue: 'Sitt med benen brett och raka knän, gå fram med händerna.', how: [
    'Sitt på golvet med benen brett isär, raka knän och tårna uppåt.',
    'Sätt händerna i golvet framför dig och res dig rak i ryggen.',
    'Gå långsamt framåt med händerna och fäll från höften, inte från ryggen.',
    'Spänn låren så att knäna hålls raka. Svårt att sitta rakt: luta ryggen mot en vägg först.',
  ] },
  butterfly: { cue: 'Fotsulorna ihop, rak rygg, tryck knäna mot golvet.', how: [
    'Sitt på golvet och sätt ihop fotsulorna. Dra in hälarna mot kroppen.',
    'Håll i fötterna och sitt rak i ryggen.',
    'Låt knäna sjunka mot golvet. Tryck lätt med armbågarna eller gunga knäna upp och ner.',
    'Mer: fäll framåt med rak rygg. Du känner det på insida lår.',
  ] },
  side_lunge: { cue: 'Benen brett, böj ena knät och sätt dig åt sidan – andra benet rakt.', how: [
    'Stå med fötterna brett isär, tårna lite utåt.',
    'Böj ena knät och för sätet bakåt och ner åt samma sida. Andra benet hålls rakt.',
    'Båda hälarna ligger kvar i golvet. Du känner det på insida lår på det raka benet.',
    'Håll en stund och byt sida.',
  ] },
  cossack: { cue: 'Benen brett, sätt dig ner över ena benet och byt sida långsamt.', how: [
    'Stå med fötterna brett isär, tårna lite utåt.',
    'Sätt dig ner över ena benet så djupt du kan med hälen i golvet. Andra benet blir rakt med tårna uppåt.',
    'Flytta dig långsamt över till andra sidan, så lågt du klarar.',
    'Håll i något framför dig för balans. Lite djupare för varje varv.',
  ] },

  // ---------------- Fotled
  knee_wall: { cue: 'Foten en bit från väggen, hälen i golvet, för knät fram mot väggen.', how: [
    'Ställ dig på ett knä framför en vägg med främre foten en handbredd från väggen.',
    'Lägg händerna på väggen. För knät rakt fram mot väggen, över tårna.',
    'Hälen måste ligga kvar i golvet. Du känner det i vaden och fotleden.',
    'Når knät väggen lätt: flytta foten lite längre bak. Avståndet är också ett test du kan mäta.',
  ] },
  calf_wall: { cue: 'Händerna mot väggen, bakre benet rakt med hälen i golvet, luta fram.', how: [
    'Ställ dig en armlängd från en vägg med händerna mot den.',
    'Ta ett kliv bakåt med ena benet. Bakre benet rakt, hälen i golvet och tårna rakt fram.',
    'Luta kroppen mot väggen tills det drar i vaden på det bakre benet.',
    'Böj bakre knät lite för att nå den nedre delen av vaden. Byt sida.',
  ] },
  down_dog: { cue: 'Händer och fötter i golvet, höften högt – som ett upp-och-nedvänt V.', how: [
    'Börja på alla fyra med tårna böjda mot golvet.',
    'Tryck upp höften mot taket så att kroppen bildar ett upp-och-nedvänt V. Armarna raka.',
    'Tryck golvet ifrån dig och för bröstet mot låren. Böj knäna om ryggen blir rund.',
    'Trampa: böj ena knät och pressa ner andra hälen, växelvis. Du känner det i vader, baksida lår och axlar.',
  ] },

  // ---------------- Djurrörelser
  finger_pushup: { cue: 'På alla fyra: tryck upp på fingrarna så att handflatorna lyfter från golvet.', how: [
    'Stå på alla fyra med händerna under axlarna och fingrarna spretade.',
    'Tryck ner med fingertopparna så att handflatorna lyfter från golvet. Sänk igen.',
    'Gör 10–15 långsamma tryck. Luta dig fram lite för att lägga mer vikt på händerna.',
    'Det värmer upp handleder och fingrar inför djurrörelserna.',
  ] },
  bear_squat: { cue: 'På alla fyra med tårna böjda: sätt dig bakåt mot hälarna och tillbaka.', how: [
    'Stå på alla fyra med tårna böjda mot golvet (inte fotryggen i golvet).',
    'Sätt dig bakåt så att sätet går mot hälarna. Händerna ligger kvar.',
    'Gunga tillbaka fram över händerna. Gör det lugnt fram och tillbaka.',
    'Du känner det under fötterna och i tårna. Förbereder fötterna för ankgång.',
  ] },
  cat_crawl: { cue: 'Kryp framåt på händer och fötter med knäna nära golvet – motsatt arm och ben samtidigt.', how: [
    'Börja på alla fyra och lyft knäna några centimeter från golvet. Ryggen platt.',
    'Kryp framåt med motsatt arm och ben samtidigt: höger hand och vänster fot, sedan tvärtom.',
    'Ta små steg och håll knäna låga. Ryggen ska vara så still att ett glas vatten skulle kunna stå på den.',
    '10 steg framåt och 10 steg bakåt. Bakåt är svårare.',
  ] },
  frog_hop: { cue: 'Djup knäböj, händerna fram i golvet, lägg vikten på händerna och hoppa fram fötterna.', how: [
    'Sätt dig i en djup knäböj med fötterna lite brett och händerna i golvet framför dig.',
    'Flytta händerna en bit framåt, ungefär en armlängd. Axlarna hamnar över händerna.',
    'Lägg vikten på händerna och gör ett litet hopp med fötterna fram till händerna – som en groda.',
    'Landa mjukt tillbaka i djup knäböj och upprepa. Gör 10 hopp framåt. Tungt: håll höften högre och hoppa kortare.',
  ] },
  bear_walk: { cue: 'Gå på händer och fötter med höften högt och raka ben.', how: [
    'Ställ dig på händer och fötter med höften högt, som i ett upp-och-nedvänt V. Knäna nästan raka.',
    'Gå framåt med motsatt hand och fot samtidigt.',
    'Håll höften hög hela tiden. Tryck bröstet bakåt mot benen för mer stretch i baksida lår.',
    '10 steg framåt och 10 bakåt.',
  ] },
  monkey: { cue: 'Djup knäböj, båda händerna i golvet åt ena sidan – hoppa över dem i sidled.', how: [
    'Sätt dig i en djup knäböj med fötterna lite brett.',
    'Vrid överkroppen och sätt båda händerna i golvet till vänster om dig.',
    'Lägg vikten på händerna och hoppa med fötterna åt vänster, förbi händerna. Landa i knäböj.',
    'Gör det 5 gånger åt vänster och 5 tillbaka åt höger. Svårt: håll höften högre.',
  ] },
  crab_walk: { cue: 'Händerna bakom dig, höften upp – gå framåt och bakåt på händer och fötter.', how: [
    'Sitt på golvet med fötterna i golvet och händerna bakom dig, fingrarna pekar bakåt eller utåt.',
    'Lyft höften från golvet så att du står på händer och fötter med magen mot taket.',
    'Gå framåt med motsatt hand och fot samtidigt. Håll höften uppe.',
    '10 steg framåt och 10 bakåt. Öppnar bröst och axlar.',
  ] },
  horse_walk: { cue: 'Bred, låg ställning med knäna utåt – gå framåt med höften på samma höjd.', how: [
    'Stå brett med tårna utåt och böj knäna till en låg "ryttarställning". Knäna pekar åt samma håll som tårna.',
    'Bröstet upp och händerna på låren eller framför dig.',
    'Gå framåt med små steg utan att resa dig – höften ska ligga på samma höjd hela tiden.',
    '10 steg framåt och 10 bakåt. Du känner det på insida lår och i sätet.',
  ] },
  half_duck: { cue: 'Halv knäböj och gå framåt utan att resa dig.', how: [
    'Böj knäna till en halv knäböj, ungefär som när du ska sätta dig på en stol.',
    'Gå framåt med korta steg och håll samma höjd hela tiden.',
    'Överkroppen lätt framåtlutad och armarna framför dig för balans.',
    '10 steg framåt och 10 bakåt. Fungerar för nästan alla och är steget före anklunge.',
  ] },
  duck_lunge: { cue: 'Gående utfall med fötterna nära varandra, så att knäna böjs helt.', how: [
    'Gå ner i ett utfall med ett kortare steg än vanligt, så att båda knäna böjs mycket.',
    'Bakre knät går nära golvet och främre knät långt fram över tårna.',
    'Tryck dig upp och fram till nästa utfall med andra benet. Långsamt.',
    '10 steg framåt. Stärker knän och fötter i djupa lägen.',
  ] },
  duck_walk: { cue: 'Hela vägen ner i knäböj och gå framåt med höften låg.', how: [
    'Sätt dig i en djup knäböj, sätet nära hälarna, och gå upp på tå.',
    'Gå framåt med små steg utan att resa dig. Främre knät skjuts fram vid varje steg.',
    'Händerna framför dig för balans, bröstet så upprätt det går.',
    '10 steg framåt. Kräver förberedda knän – börja med halv ankgång.',
  ] },
};
