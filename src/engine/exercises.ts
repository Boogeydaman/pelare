import type { Equip, Joint, Muscle, Pattern } from './types';

export interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  pattern: Pattern;
  primary: Muscle[];
  secondary: Muscle[];
  needs: Equip[]; // all required; [] = bodyweight
  compound: boolean;
  load: Partial<Record<Joint, 0 | 1 | 2>>;
  increment: number; // smallest weight step in kg (0 = bodyweight progression)
  bodyweight: boolean;
  lengthened: 0 | 1 | 2;
  unit?: 'reps' | 'sek';
  tips: [string, string, string];
}

const ex = (e: Omit<Exercise, 'bodyweight'> & { bodyweight?: boolean }): Exercise => ({
  bodyweight: e.needs.length === 0 || !!e.bodyweight,
  ...e,
});

// Order within a pattern = priority when picking main exercises for a block.
export const EXERCISES: Exercise[] = [
  // --- Squat ---
  ex({ id: 'squat_bb', name: 'Knäböj med skivstång', nameEn: 'Barbell back squat', pattern: 'squat', primary: ['quads', 'glutes'], secondary: ['adductors', 'lower_back'], needs: ['barbell'], compound: true, load: { knee: 2, back: 1, hip: 1 }, increment: 2.5, lengthened: 2, tips: ['Stången mitt över foten', 'Knäna följer tårna', 'Gå så djupt du kan med neutral rygg'] }),
  ex({ id: 'leg_press', name: 'Benpress', nameEn: 'Leg press', pattern: 'squat', primary: ['quads', 'glutes'], secondary: ['adductors'], needs: ['machine'], compound: true, load: { knee: 2, hip: 1 }, increment: 5, lengthened: 2, tips: ['Hela foten i plattan', 'Sänk tills höften nästan lyfter', 'Lås inte knäna i toppen'] }),
  ex({ id: 'goblet_squat', name: 'Goblet squat', nameEn: 'Goblet squat', pattern: 'squat', primary: ['quads', 'glutes'], secondary: ['adductors', 'abs'], needs: ['dumbbell'], compound: true, load: { knee: 1, hip: 1 }, increment: 2, lengthened: 2, tips: ['Hantel tätt mot bröstet', 'Armbågarna mellan knäna i botten', 'Rak överkropp'] }),
  ex({ id: 'squat_bw', name: 'Knäböj, långsam nedfart', nameEn: 'Tempo bodyweight squat', pattern: 'squat', primary: ['quads', 'glutes'], secondary: ['adductors'], needs: [], compound: true, load: { knee: 1, hip: 1 }, increment: 0, lengthened: 2, tips: ['Tre sekunder ner', 'Paus en sekund i botten', 'Upp med kraft'] }),

  // --- Hinge ---
  ex({ id: 'rdl_bb', name: 'Rumänsk marklyft', nameEn: 'Romanian deadlift', pattern: 'hinge', primary: ['hamstrings', 'glutes'], secondary: ['lower_back', 'forearms'], needs: ['barbell'], compound: true, load: { back: 2, hip: 1 }, increment: 2.5, lengthened: 2, tips: ['Skjut höften bakåt', 'Stången nära benen', 'Stanna när baksida lår är sträckt'] }),
  ex({ id: 'rdl_db', name: 'Rumänsk marklyft med hantlar', nameEn: 'Dumbbell Romanian deadlift', pattern: 'hinge', primary: ['hamstrings', 'glutes'], secondary: ['lower_back', 'forearms'], needs: ['dumbbell'], compound: true, load: { back: 1, hip: 1 }, increment: 2, lengthened: 2, tips: ['Mjuka knän', 'Hantlarna glider längs låren', 'Neutral rygg hela vägen'] }),
  ex({ id: 'sl_rdl_bw', name: 'Enbens marklyft', nameEn: 'Single-leg RDL', pattern: 'hinge', primary: ['hamstrings', 'glutes'], secondary: ['lower_back'], needs: [], compound: true, load: { back: 1, hip: 1 }, increment: 0, lengthened: 2, tips: ['Höften pekar rakt ner', 'Bakre benet i linje med ryggen', 'Långsamt och kontrollerat'] }),

  // --- Lunge ---
  ex({ id: 'bulgarian_db', name: 'Bulgarisk utfallsböj', nameEn: 'Bulgarian split squat', pattern: 'lunge', primary: ['quads', 'glutes'], secondary: ['adductors'], needs: ['dumbbell', 'bench'], compound: true, load: { knee: 1, hip: 1 }, increment: 2, lengthened: 2, tips: ['Bakre foten på bänk', 'Sänk rakt ner', 'Lätt framåtlutning för mer säte'] }),
  ex({ id: 'walking_lunge_db', name: 'Gående utfall med hantlar', nameEn: 'Dumbbell walking lunge', pattern: 'lunge', primary: ['quads', 'glutes'], secondary: ['adductors', 'calves'], needs: ['dumbbell'], compound: true, load: { knee: 1, hip: 1 }, increment: 2, lengthened: 1, tips: ['Långa steg', 'Bakre knät nästan i golvet', 'Rak överkropp'] }),
  ex({ id: 'split_squat_bw', name: 'Utfallsböj', nameEn: 'Split squat', pattern: 'lunge', primary: ['quads', 'glutes'], secondary: ['adductors'], needs: [], compound: true, load: { knee: 1, hip: 1 }, increment: 0, lengthened: 2, tips: ['Stå kvar i utfallsposition', 'Sänk bakre knät mot golvet', 'Tryck ifrån med främre hälen'] }),

  // --- Knee flexion ---
  ex({ id: 'leg_curl', name: 'Sittande bencurl', nameEn: 'Seated leg curl', pattern: 'knee_flexion', primary: ['hamstrings'], secondary: ['calves'], needs: ['machine'], compound: false, load: { knee: 1 }, increment: 2.5, lengthened: 2, tips: ['Luta dig lätt framåt', 'Full sträckning varje rep', 'Långsam nedfart'] }),
  ex({ id: 'slider_curl', name: 'Glidande bencurl (handduk)', nameEn: 'Slider leg curl', pattern: 'knee_flexion', primary: ['hamstrings'], secondary: ['glutes'], needs: [], compound: false, load: { knee: 1 }, increment: 0, lengthened: 1, tips: ['Höften uppe hela tiden', 'Dra hälarna mot rumpan', 'Börja med båda benen'] }),

  // --- Glute ---
  ex({ id: 'hip_thrust_bb', name: 'Höftlyft med skivstång', nameEn: 'Barbell hip thrust', pattern: 'glute', primary: ['glutes'], secondary: ['hamstrings'], needs: ['barbell', 'bench'], compound: true, load: { hip: 1 }, increment: 5, lengthened: 0, tips: ['Skulderbladen mot bänken', 'Hakan mot bröstet', 'Kläm sätet i toppen'] }),
  ex({ id: 'glute_bridge_db', name: 'Höftlyft med hantel', nameEn: 'Dumbbell glute bridge', pattern: 'glute', primary: ['glutes'], secondary: ['hamstrings'], needs: ['dumbbell'], compound: false, load: { hip: 1 }, increment: 2, lengthened: 0, tips: ['Hantel på höften', 'Tryck genom hälarna', 'Paus i toppen'] }),
  ex({ id: 'glute_bridge_bw', name: 'Enbens höftlyft', nameEn: 'Single-leg glute bridge', pattern: 'glute', primary: ['glutes'], secondary: ['hamstrings'], needs: [], compound: false, load: { hip: 1 }, increment: 0, lengthened: 0, tips: ['Ena benet rakt upp', 'Höften i våg', 'Kläm i toppen två sekunder'] }),

  // --- Calf ---
  ex({ id: 'calf_machine', name: 'Vadpress i maskin', nameEn: 'Machine calf raise', pattern: 'calf', primary: ['calves'], secondary: [], needs: ['machine'], compound: false, load: { foot: 1 }, increment: 5, lengthened: 2, tips: ['Djupt ner i sträckt läge', 'Paus i botten', 'Upp på tå'] }),
  ex({ id: 'calf_db', name: 'Enbens tåhävning med hantel', nameEn: 'Single-leg dumbbell calf raise', pattern: 'calf', primary: ['calves'], secondary: [], needs: ['dumbbell'], compound: false, load: { foot: 1 }, increment: 2, lengthened: 2, tips: ['Stå på ett trappsteg', 'Hälen långt ner', 'Håll i något för balans'] }),
  ex({ id: 'calf_bw', name: 'Tåhävning på trappsteg', nameEn: 'Step calf raise', pattern: 'calf', primary: ['calves'], secondary: [], needs: [], compound: false, load: { foot: 1 }, increment: 0, lengthened: 2, tips: ['Hälen under trappsteget', 'Långsamt ner', 'Ett ben när två blir lätt'] }),

  // --- Horizontal push ---
  ex({ id: 'bench_bb', name: 'Bänkpress', nameEn: 'Barbell bench press', pattern: 'hpush', primary: ['chest'], secondary: ['triceps', 'front_delt'], needs: ['barbell', 'bench'], compound: true, load: { shoulder: 1, elbow: 1 }, increment: 2.5, lengthened: 1, tips: ['Skulderbladen ihop och ner', 'Stången mot nedre bröstet', 'Fötterna stadigt i golvet'] }),
  ex({ id: 'bench_db', name: 'Hantelpress', nameEn: 'Dumbbell bench press', pattern: 'hpush', primary: ['chest'], secondary: ['triceps', 'front_delt'], needs: ['dumbbell', 'bench'], compound: true, load: { shoulder: 1, elbow: 1 }, increment: 2, lengthened: 2, tips: ['Djupt ner med kontroll', 'Armbågar cirka 45° från kroppen', 'Pressa upp och lite inåt'] }),
  ex({ id: 'chest_press', name: 'Bröstpress i maskin', nameEn: 'Machine chest press', pattern: 'hpush', primary: ['chest'], secondary: ['triceps', 'front_delt'], needs: ['machine'], compound: true, load: { shoulder: 1, elbow: 1 }, increment: 5, lengthened: 1, tips: ['Handtagen i brösthöjd', 'Skulderbladen bakåt', 'Långsam nedfart'] }),
  ex({ id: 'pushup', name: 'Armhävningar', nameEn: 'Push-up', pattern: 'hpush', primary: ['chest'], secondary: ['triceps', 'front_delt', 'abs'], needs: [], compound: true, load: { shoulder: 1, elbow: 1 }, increment: 0, lengthened: 1, tips: ['Kroppen rak som en planka', 'Bröstet nästan i golvet', 'På knä eller mot bänk om det behövs'] }),

  // --- Vertical push ---
  ex({ id: 'ohp_bb', name: 'Militärpress', nameEn: 'Overhead press', pattern: 'vpush', primary: ['front_delt'], secondary: ['triceps', 'side_delt', 'upper_back'], needs: ['barbell'], compound: true, load: { shoulder: 2, back: 1, elbow: 1 }, increment: 2.5, lengthened: 1, tips: ['Spänn sätet och magen', 'Huvudet igenom i toppen', 'Stången i rak linje'] }),
  ex({ id: 'ohp_db', name: 'Axelpress med hantlar', nameEn: 'Dumbbell shoulder press', pattern: 'vpush', primary: ['front_delt'], secondary: ['triceps', 'side_delt'], needs: ['dumbbell'], compound: true, load: { shoulder: 2, elbow: 1 }, increment: 2, lengthened: 1, tips: ['Sittande eller stående', 'Hantlarna ner till öronhöjd', 'Pressa rakt upp'] }),
  ex({ id: 'pike_pushup', name: 'Pike-armhävning', nameEn: 'Pike push-up', pattern: 'vpush', primary: ['front_delt'], secondary: ['triceps', 'side_delt'], needs: [], compound: true, load: { shoulder: 2, elbow: 1 }, increment: 0, lengthened: 1, tips: ['Höften högt upp', 'Huvudet mot golvet framför händerna', 'Fötterna på stol gör det tyngre'] }),

  // --- Horizontal pull ---
  ex({ id: 'cable_row', name: 'Sittande rodd i kabel', nameEn: 'Seated cable row', pattern: 'hpull', primary: ['upper_back', 'lats'], secondary: ['biceps', 'rear_delt'], needs: ['cable'], compound: true, load: { back: 1 }, increment: 5, lengthened: 2, tips: ['Låt skulderbladen glida fram', 'Dra mot naveln', 'Bröstet upp'] }),
  ex({ id: 'row_db', name: 'Enarmsrodd med hantel', nameEn: 'One-arm dumbbell row', pattern: 'hpull', primary: ['upper_back', 'lats'], secondary: ['biceps', 'rear_delt'], needs: ['dumbbell', 'bench'], compound: true, load: { back: 1 }, increment: 2, lengthened: 2, tips: ['Stöd hand och knä på bänken', 'Dra armbågen mot höften', 'Full sträckning i botten'] }),
  ex({ id: 'band_row', name: 'Rodd med gummiband', nameEn: 'Band row', pattern: 'hpull', primary: ['upper_back', 'lats'], secondary: ['biceps', 'rear_delt'], needs: ['band'], compound: true, load: {}, increment: 0, bodyweight: true, lengthened: 1, tips: ['Fäst bandet i brösthöjd', 'Skulderbladen ihop', 'Paus när händerna når kroppen'] }),
  ex({ id: 'inverted_row', name: 'Omvänd rodd under bord', nameEn: 'Inverted row', pattern: 'hpull', primary: ['upper_back', 'lats'], secondary: ['biceps', 'rear_delt'], needs: [], compound: true, load: {}, increment: 0, lengthened: 1, tips: ['Stadigt bord eller räcke', 'Kroppen rak', 'Bröstet mot kanten'] }),

  // --- Vertical pull ---
  ex({ id: 'pullup', name: 'Chins/pull-ups', nameEn: 'Pull-up', pattern: 'vpull', primary: ['lats'], secondary: ['biceps', 'upper_back', 'forearms'], needs: ['pullup_bar'], compound: true, load: { shoulder: 1, elbow: 1 }, increment: 0, bodyweight: true, lengthened: 2, tips: ['Hela vägen ner', 'Bröstet mot stången', 'Gummiband som hjälp om det behövs'] }),
  ex({ id: 'lat_pulldown', name: 'Latsdrag', nameEn: 'Lat pulldown', pattern: 'vpull', primary: ['lats'], secondary: ['biceps', 'upper_back'], needs: ['cable'], compound: true, load: { shoulder: 1 }, increment: 5, lengthened: 2, tips: ['Full sträckning i toppen', 'Dra armbågarna ner mot sidorna', 'Lätt bakåtlutning'] }),
  ex({ id: 'band_pulldown', name: 'Latsdrag med gummiband', nameEn: 'Band pulldown', pattern: 'vpull', primary: ['lats'], secondary: ['biceps', 'upper_back'], needs: ['band'], compound: true, load: { shoulder: 1 }, increment: 0, bodyweight: true, lengthened: 1, tips: ['Fäst bandet högt', 'Knäståend', 'Dra armbågarna mot höften'] }),

  // --- Chest isolation ---
  ex({ id: 'cable_fly', name: 'Flyes i kabel', nameEn: 'Cable fly', pattern: 'chest_iso', primary: ['chest'], secondary: ['front_delt'], needs: ['cable'], compound: false, load: { shoulder: 1 }, increment: 2.5, lengthened: 2, tips: ['Lätt böj i armbågarna', 'Känn sträckningen i bröstet', 'Mötas framför bröstet'] }),
  ex({ id: 'db_fly', name: 'Flyes med hantlar', nameEn: 'Dumbbell fly', pattern: 'chest_iso', primary: ['chest'], secondary: ['front_delt'], needs: ['dumbbell', 'bench'], compound: false, load: { shoulder: 1 }, increment: 2, lengthened: 2, tips: ['Låg vikt, stor båge', 'Stanna när bröstet är sträckt', 'Kontrollerat upp'] }),

  // --- Lateral raise ---
  ex({ id: 'db_lateral', name: 'Sidolyft med hantlar', nameEn: 'Dumbbell lateral raise', pattern: 'lateral', primary: ['side_delt'], secondary: [], needs: ['dumbbell'], compound: false, load: { shoulder: 1 }, increment: 1, lengthened: 1, tips: ['Led med armbågarna', 'Upp till axelhöjd', 'Långsamt ner'] }),
  ex({ id: 'cable_lateral', name: 'Sidolyft i kabel', nameEn: 'Cable lateral raise', pattern: 'lateral', primary: ['side_delt'], secondary: [], needs: ['cable'], compound: false, load: { shoulder: 1 }, increment: 2.5, lengthened: 2, tips: ['Kabeln bakom kroppen', 'Starta med armen över mitten', 'Upp till axelhöjd'] }),
  ex({ id: 'band_lateral', name: 'Sidolyft med gummiband', nameEn: 'Band lateral raise', pattern: 'lateral', primary: ['side_delt'], secondary: [], needs: ['band'], compound: false, load: { shoulder: 1 }, increment: 0, bodyweight: true, lengthened: 0, tips: ['Stå på bandet', 'Lätt framåtlutad', 'Paus i toppen'] }),

  // --- Rear delt ---
  ex({ id: 'face_pull', name: 'Face pulls', nameEn: 'Face pull', pattern: 'rear_delt', primary: ['rear_delt'], secondary: ['upper_back'], needs: ['cable'], compound: false, load: {}, increment: 2.5, lengthened: 1, tips: ['Rep i ansiktshöjd', 'Dra isär repet mot öronen', 'Tummarna pekar bakåt i slutet'] }),
  ex({ id: 'reverse_fly_db', name: 'Omvända flyes', nameEn: 'Reverse dumbbell fly', pattern: 'rear_delt', primary: ['rear_delt'], secondary: ['upper_back'], needs: ['dumbbell'], compound: false, load: {}, increment: 1, lengthened: 1, tips: ['Framåtlutad med rak rygg', 'Lyft ut åt sidorna', 'Lätt vikt'] }),
  ex({ id: 'band_pull_apart', name: 'Band pull-apart', nameEn: 'Band pull-apart', pattern: 'rear_delt', primary: ['rear_delt'], secondary: ['upper_back'], needs: ['band'], compound: false, load: {}, increment: 0, bodyweight: true, lengthened: 0, tips: ['Raka armar framför dig', 'Dra isär till bröstet', 'Långsamt tillbaka'] }),

  // --- Biceps ---
  ex({ id: 'incline_curl', name: 'Lutande hantelcurl', nameEn: 'Incline dumbbell curl', pattern: 'biceps', primary: ['biceps'], secondary: ['forearms'], needs: ['dumbbell', 'bench'], compound: false, load: { elbow: 1 }, increment: 1, lengthened: 2, tips: ['Bänken på cirka 45°', 'Armarna hänger rakt ner', 'Armbågen stilla'] }),
  ex({ id: 'db_curl', name: 'Hantelcurl', nameEn: 'Dumbbell curl', pattern: 'biceps', primary: ['biceps'], secondary: ['forearms'], needs: ['dumbbell'], compound: false, load: { elbow: 1 }, increment: 1, lengthened: 1, tips: ['Armbågarna mot sidorna', 'Vrid handflatan uppåt', 'Långsamt ner'] }),
  ex({ id: 'cable_curl', name: 'Bicepscurl i kabel', nameEn: 'Cable curl', pattern: 'biceps', primary: ['biceps'], secondary: ['forearms'], needs: ['cable'], compound: false, load: { elbow: 1 }, increment: 2.5, lengthened: 1, tips: ['Stå ett steg från kabeln', 'Full sträckning', 'Ingen gung'] }),
  ex({ id: 'band_curl', name: 'Bicepscurl med gummiband', nameEn: 'Band curl', pattern: 'biceps', primary: ['biceps'], secondary: ['forearms'], needs: ['band'], compound: false, load: { elbow: 1 }, increment: 0, bodyweight: true, lengthened: 0, tips: ['Stå på bandet', 'Armbågarna stilla', 'Paus i toppen'] }),

  // --- Triceps ---
  ex({ id: 'overhead_cable_ext', name: 'Triceps över huvudet i kabel', nameEn: 'Overhead cable extension', pattern: 'triceps', primary: ['triceps'], secondary: [], needs: ['cable'], compound: false, load: { elbow: 1, shoulder: 1 }, increment: 2.5, lengthened: 2, tips: ['Vänd ryggen mot kabeln', 'Armbågarna pekar framåt', 'Djupt ner bakom huvudet'] }),
  ex({ id: 'db_overhead_ext', name: 'Triceps över huvudet med hantel', nameEn: 'Overhead dumbbell extension', pattern: 'triceps', primary: ['triceps'], secondary: [], needs: ['dumbbell'], compound: false, load: { elbow: 1, shoulder: 1 }, increment: 1, lengthened: 2, tips: ['En hantel med båda händerna', 'Armbågarna nära huvudet', 'Sträck helt i toppen'] }),
  ex({ id: 'pushdown', name: 'Tricepspress i kabel', nameEn: 'Cable pushdown', pattern: 'triceps', primary: ['triceps'], secondary: [], needs: ['cable'], compound: false, load: { elbow: 1 }, increment: 2.5, lengthened: 0, tips: ['Armbågarna mot sidorna', 'Sträck helt', 'Kontrollerat upp'] }),
  ex({ id: 'band_pushdown', name: 'Tricepspress med gummiband', nameEn: 'Band pushdown', pattern: 'triceps', primary: ['triceps'], secondary: [], needs: ['band'], compound: false, load: { elbow: 1 }, increment: 0, bodyweight: true, lengthened: 0, tips: ['Fäst bandet högt', 'Armbågarna stilla', 'Sträck helt'] }),
  ex({ id: 'diamond_pushup', name: 'Smala armhävningar', nameEn: 'Close-grip push-up', pattern: 'triceps', primary: ['triceps'], secondary: ['chest', 'front_delt'], needs: [], compound: true, load: { elbow: 1, shoulder: 1 }, increment: 0, lengthened: 0, tips: ['Händerna under axlarna', 'Armbågarna längs kroppen', 'På knä om det behövs'] }),

  // --- Core ---
  ex({ id: 'cable_crunch', name: 'Crunch i kabel', nameEn: 'Cable crunch', pattern: 'core', primary: ['abs'], secondary: [], needs: ['cable'], compound: false, load: {}, increment: 2.5, lengthened: 1, tips: ['Knäståend mot kabeln', 'Rulla ihop ryggen', 'Höften stilla'] }),
  ex({ id: 'hanging_knee_raise', name: 'Hängande knälyft', nameEn: 'Hanging knee raise', pattern: 'core', primary: ['abs'], secondary: ['forearms'], needs: ['pullup_bar'], compound: false, load: { shoulder: 1 }, increment: 0, bodyweight: true, lengthened: 1, tips: ['Häng stilla', 'Rulla upp bäckenet', 'Ingen sving'] }),
  ex({ id: 'dead_bug', name: 'Dead bug', nameEn: 'Dead bug', pattern: 'core', primary: ['abs'], secondary: [], needs: [], compound: false, load: {}, increment: 0, lengthened: 0, tips: ['Ländryggen mot golvet', 'Motsatt arm och ben ut', 'Andas ut när du sträcker'] }),
  ex({ id: 'plank', name: 'Plankan', nameEn: 'Plank', pattern: 'core', primary: ['abs'], secondary: ['front_delt'], needs: [], compound: false, load: { shoulder: 1 }, increment: 0, lengthened: 0, unit: 'sek', tips: ['Armbågar under axlarna', 'Spänn sätet', 'Rak linje från huvud till häl'] }),
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export const MUSCLE_NAMES: Record<Muscle, string> = {
  chest: 'Bröst', upper_back: 'Övre rygg', lats: 'Lats', front_delt: 'Främre axel', side_delt: 'Sidoaxel',
  rear_delt: 'Bakre axel', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Underarmar', abs: 'Mage',
  lower_back: 'Ländrygg', glutes: 'Säte', quads: 'Framsida lår', hamstrings: 'Baksida lår',
  adductors: 'Adduktorer', calves: 'Vader',
};

export const JOINT_NAMES: Record<Joint, string> = {
  shoulder: 'Axel', elbow: 'Armbåge', back: 'Rygg', hip: 'Höft', knee: 'Knä', foot: 'Fot/vad',
};

export const EQUIP_NAMES: Record<Equip, string> = {
  barbell: 'Skivstång', dumbbell: 'Hantlar', machine: 'Maskiner', cable: 'Kabel', bench: 'Bänk',
  pullup_bar: 'Chinsstång', band: 'Gummiband',
};

export const GYM_EQUIPMENT: Equip[] = ['barbell', 'dumbbell', 'machine', 'cable', 'bench', 'pullup_bar', 'band'];
