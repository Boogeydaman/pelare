// Gym programs. Each muscle is trained at least twice a week (strength.frequency, A),
// at most ~10 sets per muscle per session (strength.session_cap) and 1–3 exercises per muscle and session.
import type { ProgramOption } from '../../core/types';

export interface Slot {
  ex: string;
  sets: number;
  reps?: [number, number]; // overrides the exercise default
  note?: string; // technique, e.g. drop set
  unit?: 'reps' | 'sek';
  rest?: number;
}

export interface SessionTemplate { type: string; title: string; slots: Slot[] }

export interface GymProgram extends ProgramOption {
  place: 'gym' | 'home';
  source: string;
  sessions: SessionTemplate[];
}

const s = (ex: string, sets: number, note?: string, reps?: [number, number]): Slot => ({ ex, sets, note, reps });
/** Timed interval slot: 3 × 40 s work, 20 s rest. */
const t = (ex: string, note: string): Slot => ({ ex, sets: 3, reps: [40, 40], unit: 'sek', rest: 20, note });
const DROP = 'Sista setet: dropset – sänk vikten 30–40 % och kör till failure igen.';
const TOP = 'Ett tungt toppset (4–6 reps), sedan ett lättare set (8–10 reps).';

export const PROGRAMS: GymProgram[] = [
  {
    id: 'fullbody', name: 'Helkropp 3×', place: 'gym', weeks: 6, perWeek: 3,
    description: 'Två helkroppspass (A och B) som växlar. Varje muskel tränas tre gånger på två veckor och minst två gånger i veckan.',
    source: 'Dr Mike (frekvens, volym), effective reps-videon (A/B-upplägg), regelbas [1][9].',
    sessions: [
      { type: 'full_a', title: 'Helkropp A', slots: [s('squat', 3), s('incline_bench', 3), s('cs_row', 3), s('leg_curl', 2), s('lateral_cable', 2), s('oh_triceps', 2)] },
      { type: 'full_b', title: 'Helkropp B', slots: [s('rdl', 3), s('dips', 3), s('pullup', 3), s('bulgarian', 2), s('preacher_curl', 2), s('calf', 2)] },
    ],
  },
  {
    id: 'upperlower', name: 'Över/under 4×', place: 'gym', weeks: 6, perWeek: 4,
    description: 'Två överkroppspass och två benpass. Ett tungt flerledslyft först, sedan assistansövningar. Med 3 pass i veckan roterar du bara vidare.',
    source: 'Natural 3–4×/v-videon (upplägg, rep-intervall), Dr Mike (1–3 övningar per muskel), regelbas [4][5].',
    sessions: [
      { type: 'upper_a', title: 'Överkropp A', slots: [s('incline_bench', 3), s('lat_pulldown', 3), s('cs_row', 3), s('lateral_cable', 3), s('oh_triceps', 2), s('preacher_curl', 2)] },
      { type: 'lower_a', title: 'Underkropp A', slots: [s('squat', 3), s('rdl', 3), s('leg_curl', 2), s('leg_ext', 2), s('calf', 3), s('cable_crunch', 2)] },
      { type: 'upper_b', title: 'Överkropp B', slots: [s('bench', 3), s('pullup', 3), s('cable_row', 3), s('pec_deck', 2), s('rev_pec_deck', 2), s('bayesian_curl', 2)] },
      { type: 'lower_b', title: 'Underkropp B', slots: [s('hack_squat', 3), s('hip_thrust', 3), s('bulgarian', 2), s('leg_curl', 2), s('calf', 3), s('hanging_knee', 2)] },
    ],
  },
  {
    id: 'minimal', name: 'Minimalist 2×', place: 'gym', weeks: 6, perWeek: 2,
    description: 'Två helkroppspass under 45 minuter. Få set, men varje set går nära failure. Dropset sparar tid.',
    source: 'Minimalistprogrammet (övningsval, toppset, dropset), Dr Mike (minst 2×/v), regelbas [11] minsta dos.',
    sessions: [
      { type: 'min_a', title: 'Helkropp 1', slots: [s('db_press', 2, TOP, [4, 10]), s('db_rdl', 2), s('lat_pulldown', 2, 'Första setet brett grepp, andra smalt underhandsgrepp.'), s('step_up', 1), s('oh_triceps', 1, DROP), s('lateral_cable', 1, DROP), s('calf', 1, DROP)] },
      { type: 'min_b', title: 'Helkropp 2', slots: [s('hack_squat', 2, TOP, [4, 10]), s('incline_bench', 2, 'Kör i par med rodden: vila 30–60 s mellan.'), s('cs_row', 2), s('leg_curl', 1, DROP), s('db_curl', 1, 'Myo-reps: efter failure, vila 3–4 s och kör 4 reps till, upprepa.'), s('cable_crunch', 1, DROP)] },
    ],
  },
  {
    id: 'totalbody', name: 'Helkropp A/B: 7 rörelsemönster', place: 'gym', weeks: 8, perWeek: 3,
    description: 'Två helkroppspass som växlar, byggda på sju rörelsemönster: knäböj, utfall, höftfällning, press, drag, bära och en korrektiv övning. Tunga baslyft på 5 reps, assistans på 10–12.',
    source: 'Total Body A/B-programmet (användarens anteckningar, nivå D), regelbas [1][4].',
    sessions: [
      { type: 'tb_a', title: 'Helkropp A: knäböj och bänk', slots: [
        s('multi_lunge', 2, 'Uppvärmning: två kliv framåt, åt sidan och snett bakåt per ben.'), s('squat', 3, 'Öka vikten när alla 5 reps sitter.', [5, 5]),
        s('hip_thrust', 3, undefined, [10, 12]), s('bench', 3, undefined, [5, 5]), s('chinup', 3, 'Med extra vikt när du klarar 10.', [6, 10]),
        s('farmer_carry', 2, 'Sikta mot halva kroppsvikten i varje hand.'), s('face_pull', 2, '12 strikta reps med utåtrotation.', [12, 12]),
      ] },
      { type: 'tb_b', title: 'Helkropp B: marklyft och press', slots: [
        s('multi_lunge', 2, 'Uppvärmning: två kliv framåt, åt sidan och snett bakåt per ben.'), s('deadlift', 3, 'Öka vikten när alla 5 reps sitter.', [5, 5]),
        s('bb_reverse_lunge', 3, 'Per ben.', [10, 10]), s('ohp', 3, undefined, [5, 5]), s('barbell_row', 3, undefined, [10, 12]),
        s('oh_carry', 2, 'Ungefär en fjärdedel av kroppsvikten i varje hand.'), s('band_walk', 2),
      ] },
    ],
  },
  {
    id: 'allmuscles', name: 'Muskelbygge 4×: alla muskler', place: 'gym', weeks: 8, perWeek: 4,
    description: 'Över- och underkropp två gånger var, med övningar valda för att träffa varje muskel i sträckt läge – även trapezius, underarmar och baksida axlar.',
    source: 'Övningslistan "alla muskler" (användarens anteckningar, nivå D), Dr Mike (1–3 övningar per muskel), regelbas [1][4][5].',
    sessions: [
      { type: 'am_upper1', title: 'Överkropp 1: bröst och lats', slots: [
        s('db_press', 3), s('cable_incline_press', 3), s('high_cable_row', 3), s('straight_arm_pd', 2),
        s('lateral_cable', 3, 'Starta med kabeln snett framför kroppen för djupare sträckning.'), s('skullcrusher', 2), s('wall_curl', 2, 'Sista setet: kliv ut från väggen, fuska upp några till och sänk mycket långsamt.'),
      ] },
      { type: 'am_lower1', title: 'Underkropp 1: framsida lår', slots: [
        s('front_squat', 3), s('rdl', 3), s('ghr', 2), s('calf', 3), s('shrug', 2), s('cable_crunch', 2),
      ] },
      { type: 'am_upper2', title: 'Överkropp 2: press och rodd', slots: [
        s('bench', 3), s('dips', 2, '1,5-stil: botten, halvvägs upp, botten, hela vägen upp = 1 rep. Sista setet: dropset till kroppsvikt.'),
        s('barbell_row', 3), s('rear_delt_row', 2), s('lateral_db', 2, 'Tyngre vikt med lite fart i starten är okej här.'), s('cg_bench', 2), s('hammer_cross', 2),
      ] },
      { type: 'am_lower2', title: 'Underkropp 2: säte och baksida', slots: [
        s('bulgarian', 3), s('hip_thrust', 3), s('leg_curl', 2), s('leg_ext', 2), s('calf', 3), s('farmer_carry', 2), s('hanging_knee', 2),
      ] },
    ],
  },
  {
    id: 'rolling', name: 'Rullande: alla gympass', place: 'gym', weeks: 12, perWeek: 3,
    description: 'Alla gympass i appen i en rullande blandning. Varje gång väljs det pass som tränar det som fått minst den här veckan, och som inte belastar muskler som fortfarande är trötta. Lika många pass i veckan som du har valt.',
    source: 'Alla gymprogram ovan. Valet: veckovolym per muskel [2] och 48–72 timmars återhämtning [1].',
    sessions: [],
  },
  {
    id: 'bodyweight', name: 'Kroppsvikt 3×', place: 'home', weeks: 6, perWeek: 3,
    description: 'Helkropp utan vikter. Du blir starkare genom svårare varianter: när du klarar toppen av repintervallet föreslås nästa steg.',
    source: 'Calisthenics Family (topp 10-övningar, 3×/v helkropp), calisthenics per muskelgrupp-videon (progressioner).',
    sessions: [
      { type: 'bw_a', title: 'Kroppsvikt A', slots: [s('decline_pushup', 3), s('chinup', 3), s('pike_pushup', 3), s('bulgarian_bw', 3), s('hollow', 3), s('frog_stand', 2)] },
      { type: 'bw_b', title: 'Kroppsvikt B', slots: [s('pushup', 3), s('pullup', 3), s('bench_dip', 2), s('split_squat', 3), s('sl_rdl', 2), s('tuck_lsit', 3)] },
    ],
  },
  {
    id: 'home_db', name: 'Hemma med hantlar', place: 'home', weeks: 6, perWeek: 3,
    description: 'Hantlar och en stol räcker. Två helkroppspass som växlar.',
    source: 'Regelbas [1][4], övningsval från transkripten.',
    sessions: [
      { type: 'home_a', title: 'Hemmapass A', slots: [s('goblet_squat', 3), s('floor_press', 3), s('db_row', 3), s('db_rdl', 2), s('lateral_db', 2), s('db_oh_triceps', 2)] },
      { type: 'home_b', title: 'Hemmapass B', slots: [s('reverse_lunge', 3), s('db_ohp', 3), s('inverted_row', 3), s('glute_bridge', 2), s('db_curl', 2), s('plank', 2)] },
    ],
  },
  {
    id: 'home20', name: 'Hemma 20 min', place: 'home', weeks: 4, perWeek: 3,
    description: 'Nybörjarpass utan utrustning: sex övningar, 40 sekunder arbete och 20 sekunder vila, tre varv.',
    source: '20 min-följ-med-videon (upplägg och övningar).',
    sessions: [
      { type: 'home20', title: 'Hemma 20 min', slots: [t('split_squat', 'Smal utfallsställning, vikten på främre benet.'), t('knee_pushup', 'Negativa: sänk dig långsamt i full position, reset på knäna.'), t('tuck_lsit', 'Sittande, lyft ett ben i taget.'), t('cossack', 'Brett, byt sida, bara så djupt det känns bra.'), t('floor_y_raise', 'Magliggande, lyft armarna i ett Y – videon saknar rygg, så den här är tillagd.'), t('half_hollow', 'Byt ben varje varv.')] },
    ],
  },
];

// The rolling program draws from every gym session in the other gym programs.
const ROLLING = PROGRAMS.find((p) => p.id === 'rolling')!;
ROLLING.sessions = PROGRAMS.filter((p) => p.place === 'gym' && p !== ROLLING).flatMap((p) => p.sessions);

export const PROGRAM_BY_ID: Record<string, GymProgram> = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));
