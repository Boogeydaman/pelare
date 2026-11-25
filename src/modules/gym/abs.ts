// Follow-along ab workouts: timed intervals (work, short rest) without equipment. Built from four
// follow-along videos the user shared (Athlean-X 7- and 6-minute ab workouts built around the abs'
// functions – bottom-up, top-down and rotation – and a 20-minute 45/15 routine in four positions).
// The abs are one muscle (rectus abdominis) plus the obliques; "lower" and "upper" here mean where the
// movement starts – the pelvis curling toward the ribs, or the ribs toward the pelvis.
import type { CircuitItem, PlannedSession } from '../../core/types';

export interface AbMove { name: string; cue: string; how: [string, string, string]; anim: string }

export const ABS: Record<string, AbMove> = {
  // ---------------------------------------------------- from the bottom (pelvis toward ribs)
  reverse_frog_swipe: { name: 'Omvänd grodsvep', anim: 'reverse_crunch', cue: 'Lyft bäckenet så högt att händerna hinner svepa under svanskotan.',
    how: ['Ligg på rygg med knäna böjda och utåt, fotsulorna mot varandra.', 'Rulla upp bäckenet mot axlarna – inte bara dra in benen – och svep båda händerna in under svanskotan.', 'Sänk långsamt. Kommer händerna inte under har du inte lyft bäckenet tillräckligt.'] },
  hip_drop_knee_drive: { name: 'Höftfall med knädrag', anim: 'reverse_crunch', cue: 'Låt höften falla mjukt åt sidan, axlarna stilla, dra knäna upp i toppen.',
    how: ['Ligg på rygg uppstödd på underarmarna, knäna böjda och fötterna i luften.', 'Rotera bäckenet och låt höften falla mjukt mot ena sidan – underarmarna platt i golvet så axlarna står stilla.', 'Rulla tillbaka till mitten och dra knäna upp mot bröstet med ett lyft av bäckenet. Byt sida.'] },
  hands_back_raise: { name: 'Bäckenlyft med armarna bakåt', anim: 'reverse_crunch', cue: 'Tänk knäna mot pannan – rulla upp svanskotan.',
    how: ['Ligg på rygg och håll i något bakom huvudet, benen uppe med böjda knän.', 'Lyft och rulla bäckenet så att knäna går mot pannan, inte bara mot bröstet.', 'Sänk kontrollerat utan att svanken släpper från golvet.'] },
  lying_hip_raise: { name: 'Höftlyft mot taket', anim: 'reverse_crunch', cue: 'Knäna in, sedan bäckenet upp mot taket.',
    how: ['Ligg på rygg med händerna under sätet och benen raka uppåt.', 'Dra in knäna och lyft höften rakt upp från golvet mot taket.', 'Sänk långsamt, kota för kota.'] },
  legs_down_hold: { name: 'Benhäng', anim: 'hollow', cue: 'Fötterna 15 cm över golvet, svanken i golvet, andas.',
    how: ['Ligg på rygg med händerna under sätet och benen raka.', 'Lyft fötterna cirka 15 cm och håll. Pressa ländryggen mot golvet och andas lugnt.', 'Börjar svanken släppa: böj knäna eller lyft fötterna högre.'] },
  lying_flutter: { name: 'Fladdersparkar', anim: 'flutter', cue: 'Raka ben, små snabba sparkar, svanken i golvet.',
    how: ['Ligg på rygg med händerna under sätet och benen raka strax över golvet.', 'Sparka växelvis upp och ner med raka ben – större utslag är tyngre.', 'Ländryggen ska ligga kvar mot golvet hela tiden.'] },
  leg_raise: { name: 'Benlyft liggande', anim: 'leg_raise', cue: 'Upp till lodrätt, ner utan att nudda golvet.',
    how: ['Ligg på rygg med händerna under sätet och benen raka.', 'Lyft benen till lodrätt och sänk kontrollerat tills hälarna nästan nuddar golvet.', 'Släpper svanken: sänk mindre eller böj knäna.'] },
  scissors: { name: 'Sax', anim: 'flutter', cue: 'Korsa benen över varandra, bäckenet stilla.',
    how: ['Ligg på rygg med händerna under sätet och benen raka strax över golvet.', 'Korsa benen växelvis över varandra med raka ben.', 'Håll bäckenet och ländryggen stilla mot golvet.'] },
  seated_ab_circle: { name: 'Sittande bencirklar', anim: 'seated_tuck', cue: 'Stora cirklar med benen – låt magen göra jobbet, inte höftböjarna.',
    how: ['Sitt och luta dig bakåt på underarmarna eller händerna, benen raka och lyfta.', 'Rita stora cirklar med båda benen ihop åt ett håll.', 'Halva tiden åt andra hållet. Bränner det mest i höftens framsida: mindre cirklar och spänn magen mer.'] },
  // ---------------------------------------------------- from the top (ribs toward pelvis)
  roll_up: { name: 'Roll-up', anim: 'roll_up', cue: 'Upp, och rulla ner långsamt – en kota i taget.',
    how: ['Ligg på rygg med raka ben och armarna uppåt.', 'Rulla upp till sittande och sträck händerna mot tårna.', 'Rulla ner långsamt, en kota i taget – det är nedvägen som gör jobbet.'] },
  reach_up: { name: 'Situp med armarna uppåt', anim: 'roll_up', cue: 'Hälarna i golvet, hela vägen upp och ner.',
    how: ['Ligg på rygg med böjda knän, hälarna i golvet och armarna uppåt.', 'Rulla upp till sittande med armarna mot taket.', 'Rulla ner kontrollerat.'] },
  crunch_reach_through: { name: 'Crunch med räck mellan benen', anim: 'crunch', cue: 'Krulla upp och stöt händerna mellan knäna.',
    how: ['Ligg på rygg med böjda knän och armarna framåt.', 'Krulla upp överkroppen och stöt händerna fram mellan knäna.', 'Sänk utan att lägga ner huvudet helt.'] },
  upper_circle_crunch: { name: 'Cirkelcrunch', anim: 'crunch', cue: 'Skulderbladen från golvet, rita en stor cirkel med bröstkorgen.',
    how: ['Ligg på rygg med böjda knän och armarna uppåt.', 'Lyft skulderbladen och för bröstkorgen i en stor cirkel – åt sidan, upp och runt.', 'Halva tiden åt andra hållet.'] },
  // ---------------------------------------------------- from both ends
  v_up_leg_hug: { name: 'V-sit med benkram', anim: 'v_up', cue: 'Mötas i mitten – krama ena benet, andra, sedan båda.',
    how: ['Ligg på rygg med raka ben och armarna bakåt.', 'Lyft ben och överkropp samtidigt och krama om ena benet. Nästa rep det andra.', 'Svårast: lyft båda benen till en hel V och krama båda.'] },
  scissor_v_up: { name: 'Sax-V-sit', anim: 'v_up', cue: 'Saxa längst ner, V-sit upptill.',
    how: ['Ligg på rygg med raka ben strax över golvet och ländryggen pressad mot golvet.', 'Saxa benen en gång, och gör sedan en V-sit där händerna möter benen.', 'Tillbaka till saxen utan att svanken släpper.'] },
  crunchy_frog: { name: 'Grodcrunch', anim: 'seated_tuck', cue: 'Ut med benen, in och nudda hälarna.',
    how: ['Sitt och luta dig bakåt med benen raka och lyfta.', 'Dra in knäna och krulla upp så att händerna nuddar hälarna.', 'Sträck ut igen utan att fötterna nuddar golvet.'] },
  seated_in_out: { name: 'Sittande knä in och ut', anim: 'seated_tuck', cue: 'Knäna hela vägen in mot bröstet och ut igen.',
    how: ['Sitt med händerna i golvet bakom dig, fingrarna framåt, och fötterna lyfta.', 'Dra knäna in mot bröstet och sträck ut benen igen.', 'Full rörelse och lugnt tempo ger mer än snabbt.'] },
  seated_flutter: { name: 'Sittande fladdersparkar', anim: 'seated_tuck', cue: 'Luta bakåt, benen lyfta, små sparkar.',
    how: ['Sitt med händerna i golvet bakom dig och benen raka.', 'Lyft benen och sparka växelvis upp och ner.', 'Rak rygg – luta dig inte för långt bak.'] },
  // ---------------------------------------------------- rotation
  sledgehammer: { name: 'Slägghammare', anim: 'roll_up', cue: 'Benen i golvet, slå armarna ner åt sidan och vrid axlarna bakåt.',
    how: ['Ligg på rygg med böjda knän och fötterna fast i golvet, händerna ihop över huvudet.', 'Sitt upp och slå armarna ner mot ena höften som med en slägga – vrid axlarna och titta bakåt.', 'Rulla ner och ta andra sidan. Bäckenet står still, det är överkroppen som roterar.'] },
  starfish_crunch: { name: 'Sjöstjärnecrunch', anim: 'v_up', cue: 'Armar och ben ut, lyft och nå handen mot motsatt fot.',
    how: ['Ligg på rygg som en sjöstjärna med armar och ben isär.', 'Lyft ena benet och motsatt arm och för handen mot foten med en vridning i överkroppen.', 'Tillbaka ut och byt sida.'] },
  cross_toe_touch: { name: 'Korsvis tåtouch', anim: 'v_up', cue: 'Upp och nudda motsatt fotled – vrid ordentligt.',
    how: ['Ligg på rygg med raka ben.', 'Sitt upp och nudda motsatt fotled med handen, med en tydlig vridning.', 'Ner kontrollerat och byt sida. Lugnt tempo – för snabbt tar bort magen.'] },
  bicycle: { name: 'Cykelcrunch', anim: 'bicycle', cue: 'Knä mot motsatt armbåge, full rörelse.',
    how: ['Ligg på rygg med händerna bakom huvudet och benen lyfta.', 'För höger armbåge mot vänster knä medan höger ben sträcks, och byt.', 'Gå bara så fort du hinner vrida hela vägen.'] },
  russian_twist: { name: 'Rysk vridning', anim: 'twist', cue: 'Fötterna lyfta, vrid hela bålen från sida till sida.',
    how: ['Sitt med böjda knän, luta dig bakåt och lyft fötterna.', 'Vrid överkroppen och nudda golvet bredvid höften, sedan andra sidan.', 'Vrid hela bålen – inte bara armarna.'] },
  russian_v_tuck_twist: { name: 'Rysk V-tuck med vridning', anim: 'twist', cue: 'Ett knä in, vrid och nudda motsatt sida.',
    how: ['Sitt i en V med benen lyfta.', 'Dra in ena knät och vrid överkroppen så att händerna nuddar motsatt sida.', 'Sträck ut och byt sida, fötterna i luften hela tiden.'] },
  side_v_pump: { name: 'Sido-V med pump', anim: 'twist', cue: 'Luta på ena skinkan och pumpa uppåt.',
    how: ['Sitt med fötterna lyfta, luta dig bakåt och rulla över på ena skinkan.', 'Pumpa små rörelser uppåt med ben och överkropp. För tungt: håll bara läget.', 'Halva tiden på varje sida.'] },
  // ---------------------------------------------------- plank
  drunken_mountain_climber: { name: 'Mountain climbers på snedden', anim: 'climber', cue: 'Dra knät snett över kroppen – med rotation.',
    how: ['Stå i armhävningsläge med händerna under axlarna.', 'Dra höger knä snett mot vänster armbåge, och byt.', 'Det är vridningen som gör det till en magövning – inte bara knäna framåt.'] },
  cross_knee_plank: { name: 'Planka knä mot motsatt armbåge', anim: 'climber', cue: 'Långsamt, och knip i varje rep.',
    how: ['Stå i armhävningsläge.', 'För knät långsamt mot motsatt armbåge och knip med magen en sekund.', 'Tillbaka och byt ben.'] },
  plank_knee_elbow: { name: 'Planka knä mot armbåge', anim: 'climber', cue: 'Knät hela vägen fram till armbågen på samma sida.',
    how: ['Planka på underarmarna eller raka armar.', 'Dra knät fram mot armbågen på samma sida.', 'Byt ben – höften stilla, ingen gungning.'] },
  marching_plank: { name: 'Marscherande planka', anim: 'plank', cue: 'Spänn sätet och magen, lyft fötterna växelvis.',
    how: ['Planka på underarmarna med fötterna höftbrett.', 'Lyft fötterna växelvis några centimeter, som en marsch.', 'Höften rör sig inte – spänn sätet och magen.'] },
  plank_jack: { name: 'Planka öppna och stäng', anim: 'plank', cue: 'Hoppa isär och ihop med fötterna, höften stilla.',
    how: ['Planka med raka armar.', 'Hoppa isär med fötterna och ihop igen.', 'För tungt: kliv ut och in i stället.'] },
  plank_up_down: { name: 'Planka upp och ner', anim: 'plank', cue: 'Från underarmar till raka armar och tillbaka.',
    how: ['Börja i planka på underarmarna.', 'Sträck upp en arm i taget till raka armar, och gå ner igen.', 'Halva tiden börjar du med höger hand, halva med vänster. Höften i nivå.'] },
  side_plank_reach: { name: 'Sidoplanka med genomrotation', anim: 'side_plank', cue: 'Rotera överarmen in under kroppen och upp igen.',
    how: ['Sidoplanka på underarmen.', 'För övre armen in under kroppen med en vridning, och upp mot taket igen.', 'Halva tiden på varje sida.'] },
  side_plank_dip: { name: 'Sidoplanka med höftdipp', anim: 'side_plank', cue: 'Sänk höften mot golvet och lyft igen.',
    how: ['Sidoplanka på rak arm med stadigt grepp i golvet.', 'Sänk höften mot golvet och pressa upp den igen.', 'Halva tiden på varje sida.'] },
  plank: { name: 'Planka', anim: 'plank', cue: 'Spänn hela kroppen, höften varken för högt eller lågt, andas.',
    how: ['Underarmarna under axlarna, kroppen i en rak linje.', 'Spänn mage, säte och axlar – och andas.', 'Höften varken hänger eller pekar mot taket.'] },
};

const it = (id: string, seconds: number, rest = 0, sides?: 2, label?: string): CircuitItem => ({ id, name: ABS[id].name, cue: ABS[id].cue, seconds, rest, ...(sides ? { sides } : {}), ...(label ? { label } : {}) });

export interface AbWorkout { type: string; title: string; summary: string; minutes: number; items: CircuitItem[]; reasons: string[] }

export const AB_WORKOUTS: AbWorkout[] = [
  {
    type: 'core_abs5', title: 'Bålpass: fem funktioner', minutes: 7, summary: '5 × 60 s, 30 s vila',
    items: [it('reverse_frog_swipe', 60, 30), it('hip_drop_knee_drive', 60, 30), it('v_up_leg_hug', 60, 30), it('sledgehammer', 60, 30), it('roll_up', 60)],
    reasons: ['En övning för varje funktion: nerifrån, rotation nerifrån, från båda håll, rotation uppifrån och uppifrån.', 'Orkar du inte hela minuten – vila och fortsätt. Bygg upp till hela tiden.'],
  },
  {
    type: 'core_abs6', title: 'Bålpass: sex minuter', minutes: 6, summary: '30–60 s, två vilor',
    items: [it('hands_back_raise', 60), it('drunken_mountain_climber', 30), it('cross_knee_plank', 60, 30), it('scissor_v_up', 60), it('starfish_crunch', 30, 30), it('upper_circle_crunch', 30, 0, undefined, 'Medsols'), it('upper_circle_crunch', 30, 0, undefined, 'Motsols')],
    reasons: ['Nerifrån, rotation och uppifrån på sex minuter.', 'Knip hårdare i varje rep – kvaliteten ger mer än tempot.'],
  },
  {
    type: 'core_abs7', title: 'Bålpass: sju minuter', minutes: 7, summary: '30–60 s, två vilor',
    items: [it('seated_ab_circle', 60, 0, undefined, 'Åt vänster'), it('seated_ab_circle', 60, 0, undefined, 'Åt höger'), it('drunken_mountain_climber', 60, 30), it('marching_plank', 60), it('scissors', 60), it('starfish_crunch', 30, 30), it('russian_v_tuck_twist', 30)],
    reasons: ['Kort och intensivt – det är regelbundenheten som bygger magen, inte långa pass.', 'Bränner höftens framsida mest? Mindre rörelse och spänn magen hårdare.'],
  },
  {
    type: 'core_abs20', title: 'Hela magen: 20 minuter', minutes: 20, summary: '20 övningar × 45 s, 15 s vila',
    items: [
      it('legs_down_hold', 45, 15), it('lying_flutter', 45, 15), it('leg_raise', 45, 15), it('lying_hip_raise', 45, 15), it('crunchy_frog', 45, 15),
      it('russian_twist', 45, 15), it('cross_toe_touch', 45, 15), it('bicycle', 45, 15), it('drunken_mountain_climber', 45, 15), it('side_plank_reach', 44, 15, 2),
      it('seated_flutter', 45, 15), it('seated_in_out', 45, 15), it('side_v_pump', 44, 15, 2), it('reach_up', 45, 15), it('crunch_reach_through', 45, 15),
      it('plank_knee_elbow', 45, 15), it('side_plank_dip', 44, 15, 2), it('plank_jack', 45, 15), it('plank_up_down', 44, 15), it('plank', 45),
    ],
    reasons: ['Fyra block à fem övningar: liggande, rotation, sittande och planka – hela bålen.', 'Gå i din egen takt. Hellre långsamt med full rörelse än snabbt och slarvigt.'],
  },
];

export const circuitMinutes = (items: CircuitItem[]) => Math.round(items.reduce((a, x) => a + x.seconds + x.rest, 0) / 60);

/** A follow-along ab workout as a planned session (gym module, type core_* so it counts as a core session). */
export function abSession(w: AbWorkout): PlannedSession {
  return {
    id: `${w.type}-${Date.now().toString(36)}`, module: 'gym', type: w.type, title: w.title, minutes: circuitMinutes(w.items),
    summary: w.summary, effort: 'medel', content: { kind: 'circuit', items: w.items },
    reasons: w.reasons.map((text) => ({ text })),
  };
}
