// Every movement in the app as joint-angle keyframes (see skeleton.ts for the conventions).
// Side view faces right. "front" = seen from the front, "top" = seen from above.
import { FLOOR, type Anim, type Pose, type Spec } from './skeleton';

type Legs = Spec['legs'];
type Arms = Spec['arms'];
const ST: Legs = [[90, 90], [90, 90]];
const HANG: Arms = [[92, 90], [88, 90]];
const FL: Legs = [[84, 92], [96, 88]]; // front view, standing
const FA: Arms = [[78, 86], [102, 94]]; // front view, arms down
const stand = (x: Partial<Spec> = {}): Spec => ({ torso: -90, legs: ST, arms: HANG, feet: [0, 0], ...x });
const fstand = (x: Partial<Spec> = {}): Spec => ({ torso: -90, legs: FL, arms: FA, ...x });

const seat = (w = 26) => (p: Pose) => [{ kind: 'rect' as const, x: p.H[0] - w / 2, y: p.H[1] + 3, w, h: FLOOR - p.H[1] - 3 }];
const wallAt = (x: number) => [{ kind: 'rect' as const, x, y: 6, w: 4, h: FLOOR - 6 }];
const bar = (y: number, x: number, w = 30) => [{ kind: 'line' as const, x1: x - w / 2, y1: y, x2: x + w / 2, y2: y }];

export const ANIMS: Record<string, Anim> = {
  stand: { frames: [stand()] },

  // ======================================================== Strength · legs
  squat: { held: 'bar', frames: [
    stand({ arms: [[150, -70]] }),
    stand({ torso: -55, legs: [[12, 118]], arms: [[185, -35]] }),
  ] },
  goblet: { held: 'db', frames: [
    stand({ arms: [[75, -100]] }),
    stand({ torso: -68, legs: [[8, 120]], arms: [[97, -78]] }),
  ] },
  hinge: { held: 'bar', frames: [
    stand({ legs: [[88, 92]], arms: [[90, 90]] }),
    stand({ torso: -22, head: -30, legs: [[76, 100]], arms: [[90, 90]] }),
  ] },
  sl_rdl: { held: 'db', frames: [
    stand({ legs: [[90, 90], [100, 100]], arms: [[90, 90]] }),
    stand({ torso: -12, head: -20, legs: [[80, 96], [178, 178]], arms: [[90, 90]], feet: [0, 90] }),
  ] },
  lunge: { held: 'db', frames: [
    stand({ arms: [[90, 90]] }),
    stand({ torso: -88, legs: [[2, 92], [110, 188]], arms: [[90, 90]], feet: [0, 40] }),
  ] },
  split: { held: 'db', frames: [
    stand({ legs: [[62, 108], [110, 128]], arms: [[90, 90]], feet: [0, 20] }),
    stand({ torso: -88, legs: [[2, 92], [110, 188]], arms: [[90, 90]], feet: [0, 40] }),
  ] },
  step_up: { held: 'db', anchor: 'F',
    props: (p) => [{ kind: 'rect', x: p.F[0] - 12, y: p.F[1] + 2, w: 28, h: FLOOR - p.F[1] - 2 }],
    frames: [
      stand({ legs: [[30, 100], [100, 95]], arms: [[90, 90]] }),
      stand({ legs: [[90, 90], [10, 100]], arms: [[90, 90]], on: ['F', 94.6] }),
    ] },
  pistol: { frames: [
    stand({ legs: [[90, 90], [60, 70]], arms: [[10, 0]] }),
    stand({ torso: -45, legs: [[-5, 115], [-5, -5]], arms: [[0, 0]], feet: [0, -90] }),
  ] },
  cossack: { view: 'front', anchor: null, frames: [
    { torso: -90, legs: [[35, 105], [130, 130]], arms: [[140, 60], [40, 120]] },
    { torso: -90, legs: [[50, 50], [145, 75]], arms: [[140, 60], [40, 120]] },
  ] },
  leg_press: { plate: true, anchor: 'H',
    props: (p) => [...seat(24)(p), { kind: 'line', x1: p.H[0] - 2, y1: p.H[1] + 2, x2: p.S[0] - 3, y2: p.S[1] + 3 }],
    frames: [
      { torso: -145, legs: [[-62, 25]], arms: [[100, 60]], on: ['H', 86] },
      { torso: -145, legs: [[-40, -40]], arms: [[100, 60]], on: ['H', 86] },
    ] },
  hip_thrust: { held: 'bar', anchor: 'F',
    props: (p) => [{ kind: 'rect', x: p.S[0] - 26, y: p.S[1] + 4, w: 26, h: FLOOR - p.S[1] - 4 }],
    frames: [
      { torso: 212, head: 200, legs: [[-40, 105]], arms: [[35, 30]], on: ['F', FLOOR] },
      { torso: 180, head: 185, legs: [[-5, 95]], arms: [[10, -5]], on: ['F', FLOOR] },
    ] },
  bridge: { frames: [
    { torso: 180, head: 180, legs: [[-45, 110]], arms: [[12, 5]] },
    { torso: 160, head: 180, legs: [[-10, 100]], arms: [[15, 15]] },
  ] },
  slider_curl: { frames: [
    { torso: 168, head: 180, legs: [[6, 6]], arms: [[15, 12]] },
    { torso: 160, head: 180, legs: [[-10, 100]], arms: [[15, 15]] },
  ] },
  legcurl: { anchor: 'H', props: seat(28), frames: [
    { torso: -95, legs: [[0, 0]], arms: [[80, 10]], on: ['H', 76] },
    { torso: -95, legs: [[0, 100]], arms: [[80, 10]], on: ['H', 76] },
  ] },
  legext: { anchor: 'H', props: seat(28), frames: [
    { torso: -95, legs: [[0, 95]], arms: [[80, 10]], on: ['H', 78] },
    { torso: -95, legs: [[-4, -4]], arms: [[80, 10]], on: ['H', 78] },
  ] },
  calf: { frames: [stand({ feet: [0, 0] }), stand({ feet: [70, 70] })] },

  // ======================================================== Strength · push
  bench: { held: 'bar', anchor: 'F',
    props: (p) => [{ kind: 'rect', x: p.S[0] - 14, y: p.H[1] + 3, w: p.H[0] - p.S[0] + 20, h: FLOOR - p.H[1] - 3 }],
    frames: [
      { torso: 180, head: 180, legs: [[12, 95]], arms: [[-90, -90]], on: ['F', FLOOR] },
      { torso: 180, head: 180, legs: [[12, 95]], arms: [[110, -70]], on: ['F', FLOOR] },
    ] },
  incline: { held: 'bar', anchor: 'F',
    props: (p) => [...seat(22)(p), { kind: 'line', x1: p.H[0] - 3, y1: p.H[1] + 3, x2: p.S[0] - 4, y2: p.S[1] + 5 }],
    frames: [
      { torso: -150, head: -155, legs: [[10, 95]], arms: [[-62, -62]], on: ['F', FLOOR] },
      { torso: -150, head: -155, legs: [[10, 95]], arms: [[115, -55]], on: ['F', FLOOR] },
    ] },
  floorpress: { held: 'bar', frames: [
    { torso: 180, head: 180, legs: [[-45, 110]], arms: [[-90, -90]] },
    { torso: 180, head: 180, legs: [[-45, 110]], arms: [[95, -85]] },
  ] },
  chest_press: { anchor: 'H', props: (p) => [...seat(24)(p), { kind: 'line', x1: p.H[0] - 4, y1: p.H[1], x2: p.S[0] - 4, y2: p.S[1] - 2 }],
    frames: [
      { torso: -90, legs: [[0, 92]], arms: [[160, 0]] },
      { torso: -90, legs: [[0, 92]], arms: [[2, 0]] },
    ] },
  pushup: { anchor: 'W', frames: [
    { torso: -12, head: -8, legs: [[174, 174]], arms: [[90, 90]] },
    { torso: -3, head: -2, legs: [[177, 177]], arms: [[150, 35]] },
  ] },
  knee_pushup: { anchor: 'W', frames: [
    { torso: -20, head: -15, legs: [[160, 190]], arms: [[90, 90]] },
    { torso: -8, head: -5, legs: [[166, 190]], arms: [[150, 35]] },
  ] },
  pike: { anchor: 'W', frames: [
    { torso: 45, head: 100, legs: [[108, 108]], arms: [[60, 60]] },
    { torso: 55, head: 110, legs: [[110, 110]], arms: [[120, 35]] },
  ] },
  dips: { anchor: 'W', props: (p) => bar(p.W[1] + 1, p.W[0], 28), frames: [
    { torso: -82, head: -85, legs: [[100, 150]], arms: [[95, 85]], on: ['W', 62] },
    { torso: -72, head: -78, legs: [[105, 155]], arms: [[165, 80]], on: ['W', 62] },
  ] },
  benchdip: { anchor: 'W', props: (p) => [{ kind: 'rect', x: p.W[0] - 24, y: p.W[1] + 2, w: 28, h: FLOOR - p.W[1] - 2 }], frames: [
    { torso: -88, legs: [[-5, 88]], arms: [[100, 90]], on: ['W', 82] },
    { torso: -85, legs: [[-10, 41]], arms: [[160, 85]], on: ['W', 82] },
  ] },
  fly: { view: 'front', anchor: null, frames: [
    fstand({ arms: [[5, -5], [175, 185]] }),
    fstand({ arms: [[20, 160], [160, 20]] }),
  ] },

  // ======================================================== Strength · pull
  pullup: { anchor: 'W', props: (p) => bar(p.W[1], p.W[0], 34), frames: [
    { torso: -90, legs: [[45, 170]], arms: [[-90, -90]], on: ['W', 24] },
    { torso: -86, legs: [[45, 170]], arms: [[140, -50]], on: ['W', 24] },
  ] },
  hanging_knee: { anchor: 'W', props: (p) => bar(p.W[1], p.W[0], 34), frames: [
    { torso: -90, legs: [[110, 135]], arms: [[-90, -90]], on: ['W', 12] },
    { torso: -95, legs: [[-15, 80]], arms: [[-90, -90]], on: ['W', 12] },
  ] },
  pulldown: { held: 'bar', anchor: 'H', props: seat(24), cable: (p) => [p.W[0], 2], frames: [
    { torso: -95, legs: [[0, 90]], arms: [[-85, -88]], on: ['H', 80] },
    { torso: -100, legs: [[0, 90]], arms: [[115, -75]], on: ['H', 80] },
  ] },
  row: { held: 'db', frames: [
    stand({ torso: -18, head: -15, legs: [[80, 98]], arms: [[90, 90]] }),
    stand({ torso: -18, head: -15, legs: [[80, 98]], arms: [[-160, 95]] }),
  ] },
  cablerow: { anchor: 'H', cable: (p) => [p.W[0] + 30, p.W[1]],
    props: (p) => [...seat(22)(p), { kind: 'line', x1: p.F[0] + 3, y1: p.F[1] - 12, x2: p.F[0] + 3, y2: FLOOR }],
    frames: [
      { torso: -72, legs: [[-10, 12]], arms: [[5, 2]], on: ['H', 88] },
      { torso: -95, legs: [[-10, 12]], arms: [[135, 2]], on: ['H', 88] },
    ] },
  invrow: { anchor: 'W', props: (p) => bar(p.W[1], p.W[0], 24), frames: [
    { torso: -20, head: -20, legs: [[170, 170]], arms: [[-90, -90]], on: ['W', 66] },
    { torso: -28, head: -28, legs: [[165, 165]], arms: [[150, -50]], on: ['W', 66] },
  ] },
  face_pull: { cable: (p) => [p.W[0] + 28, p.W[1]], frames: [
    stand({ arms: [[-5, -5]] }),
    stand({ arms: [[190, 10]] }),
  ] },
  revfly: { view: 'front', anchor: null, held: 'dbs', frames: [
    fstand({ arms: [[60, 125], [120, 55]] }),
    fstand({ arms: [[-5, 0], [185, 180]] }),
  ] },
  y_raise: { frames: [
    { torso: 0, head: 0, legs: [[180, 180]], arms: [[-8, -8]] },
    { torso: -6, head: -12, legs: [[181, 181]], arms: [[-20, -20]] },
  ] },

  // ======================================================== Strength · shoulders & arms
  ohp: { held: 'bar', frames: [stand({ arms: [[72, -100]] }), stand({ arms: [[-92, -90]] })] },
  ohp_db: { held: 'db', frames: [stand({ arms: [[72, -100]] }), stand({ arms: [[-92, -90]] })] },
  lateral: { view: 'front', anchor: null, held: 'dbs', frames: [
    fstand({ arms: [[80, 88], [100, 92]] }),
    fstand({ arms: [[0, 5], [180, 175]] }),
  ] },
  curl: { held: 'db', frames: [stand({ arms: [[92, 90]] }), stand({ arms: [[92, -55]] })] },
  triceps: { held: 'db', frames: [stand({ arms: [[-112, 112]] }), stand({ arms: [[-112, -98]] })] },

  // ======================================================== Strength · core
  plank: { frames: [{ torso: -8, head: -5, legs: [[175, 175]], arms: [[90, 0]] }] },
  crunch: { frames: [
    { torso: 180, head: 180, legs: [[-45, 110]], arms: [[20, 190]] },
    { torso: 210, head: 215, legs: [[-45, 110]], arms: [[50, 220]] },
  ] },
  cable_crunch: { cable: (p) => [p.W[0] - 6, 2], frames: [
    { torso: -95, head: -95, legs: [[90, 180]], arms: [[-60, 150]] },
    { torso: 40, head: 70, legs: [[90, 180]], arms: [[70, 280]] },
  ] },
  hollow: { frames: [{ torso: 192, head: 196, legs: [[-12, -12]], arms: [[188, 188]] }] },
  lsit: { anchor: 'W', frames: [{ torso: -92, legs: [[-4, -4]], arms: [[78, 98]], on: ['W', FLOOR] }] },
  tuck_lsit: { anchor: 'W', frames: [{ torso: -92, legs: [[-35, 60]], arms: [[78, 98]], on: ['W', FLOOR] }] },
  frog_stand: { anchor: 'W', frames: [{ torso: 25, head: 15, legs: [[45, 190]], arms: [[95, 85]], on: ['W', FLOOR] }] },

  // ======================================================== Mobility · neck & shoulders
  upper_trap: { view: 'front', anchor: null, ms: 1800, hold: 0.45, frames: [
    fstand(),
    fstand({ head: -58, arms: [[-125, 15], [102, 94]] }),
  ] },
  head_roll: { view: 'front', anchor: null, loop: true, ms: 900, hold: 0.1, frames: [
    fstand({ head: -60 }), fstand({ head: -90 }), fstand({ head: -120 }), fstand({ head: -90 }),
  ] },
  chest_opener: { ms: 1600, hold: 0.45, frames: [
    stand({ arms: [[115, 155]] }),
    stand({ torso: -96, head: -110, arms: [[145, 170]] }),
  ] },
  doorway: { anchor: 'E', ms: 1600, hold: 0.45, props: (p) => wallAt(p.W[0] + 2), frames: [
    stand({ arms: [[0, -90], [92, 90]] }),
    stand({ torso: -78, head: -76, legs: [[80, 95], [102, 92]], arms: [[-8, -95], [92, 90]] }),
  ] },
  cross_body: { view: 'front', anchor: null, ms: 1600, hold: 0.45, frames: [
    fstand(),
    fstand({ arms: [[178, 180], [110, -130]] }),
  ] },
  lat_stretch: { ms: 1600, hold: 0.45, frames: [
    { torso: 30, head: 35, legs: [[95, 180]], arms: [[15, 15]] },
    { torso: 22, head: 18, legs: [[125, 180]], arms: [[-6, -6]] },
  ] },
  wall_slide: { view: 'front', anchor: null, frames: [
    fstand({ arms: [[15, -90], [165, -90]] }),
    fstand({ arms: [[-55, -75], [-125, -105]] }),
  ] },
  open_book: { view: 'top', anchor: 'H', ms: 1500, hold: 0.35, frames: [
    { torso: 180, head: 180, legs: [[90, 0], [88, 2]], arms: [[90, 90], [88, 88]] },
    { torso: 180, head: 205, legs: [[90, 0], [88, 2]], arms: [[270, 270], [88, 88]] },
  ] },

  // ======================================================== Mobility · back
  cat_cow: { ms: 1500, frames: [
    { torso: -10, head: 70, arch: -7, legs: [[90, 180]], arms: [[90, 90]] },
    { torso: -10, head: -40, arch: 6, legs: [[90, 180]], arms: [[90, 90]] },
  ] },
  childs_pose: { frames: [{ torso: 15, head: 10, legs: [[35, 180]], arms: [[12, 4]] }] },
  lumbar_rot: { view: 'top', anchor: 'H', ms: 1600, hold: 0.45, frames: [
    { torso: -90, legs: [[90, 90], [92, 90]], arms: [[0, 0], [180, 180]] },
    { torso: -90, head: -55, legs: [[150, 80], [92, 90]], arms: [[0, 0], [180, 180]] },
  ] },
  side_stretch: { view: 'front', anchor: null, ms: 1600, hold: 0.45, frames: [
    fstand({ arms: [[-80, -85], [102, 94]] }),
    fstand({ torso: -106, head: -118, arms: [[-135, -155], [100, 96]] }),
  ] },
  seated_twist: { view: 'front', anchor: null, ms: 1200, frames: [
    { torso: -90, head: -105, legs: [[15, 165], [165, 15]], arms: [[170, 175], [140, 175]] },
    { torso: -90, head: -75, legs: [[15, 165], [165, 15]], arms: [[40, 5], [10, 5]] },
  ] },
  worlds_greatest: { loop: true, anchor: 'F', ms: 1300, frames: [
    { torso: -30, head: -20, legs: [[10, 95], [160, 180]], arms: [[95, 90], [92, 88]], feet: [0, 60] },
    { torso: -12, head: 0, legs: [[10, 95], [160, 180]], arms: [[110, 150], [92, 88]], feet: [0, 60] },
    { torso: -40, head: -75, legs: [[10, 95], [160, 180]], arms: [[-92, -90], [92, 88]], feet: [0, 60] },
  ] },

  // ======================================================== Mobility · hips
  hip_flexor: { anchor: 'K2', ms: 1600, hold: 0.45, frames: [
    { torso: -90, legs: [[0, 90], [100, 180]], arms: [[60, 15]], feet: [0] },
    { torso: -94, head: -94, legs: [[-8, 105], [120, 180]], arms: [[120, 35]], feet: [0] },
  ] },
  couch: { anchor: 'K2', ms: 1600, hold: 0.45, props: (p) => wallAt(p.K2[0] - 8), frames: [
    { torso: -60, legs: [[0, 90], [100, -88]], arms: [[60, 30]], feet: [0] },
    { torso: -95, legs: [[0, 90], [100, -88]], arms: [[115, 35]], feet: [0] },
  ] },
  flexor_glute: { anchor: 'K2', ms: 1600, hold: 0.4, frames: [
    { torso: -92, legs: [[-8, 105], [120, 180]], arms: [[120, 35]], feet: [0] },
    { torso: -40, head: -30, legs: [[28, 28], [72, 180]], arms: [[70, 40]], feet: [-60] },
  ] },
  figure_four: { ms: 1600, hold: 0.45, frames: [
    { torso: 180, head: 180, legs: [[-20, -135], [-70, 20]], arms: [[-30, -30]] },
    { torso: 180, head: 180, legs: [[-45, -160], [-95, 10]], arms: [[-35, -40]] },
  ] },
  pigeon: { ms: 1700, hold: 0.45, frames: [
    { torso: -88, legs: [[12, 172], [176, 180]], arms: [[95, 90]] },
    { torso: 12, head: 15, legs: [[12, 172], [176, 180]], arms: [[15, 2]] },
  ] },
  ninety_ninety: { view: 'top', anchor: 'H', frames: [
    { torso: -90, legs: [[0, 90], [90, 180]], arms: [[120, 100], [60, 80]] },
    { torso: -90, legs: [[90, 0], [180, 90]], arms: [[120, 100], [60, 80]] },
  ] },
  frog: { anchor: 'K', ms: 1500, frames: [
    { torso: 5, head: 10, legs: [[90, 180], [92, 180]], arms: [[95, 0]] },
    { torso: 15, head: 20, legs: [[130, 180], [132, 180]], arms: [[60, 5]] },
  ] },

  // ======================================================== Mobility · hamstrings
  supine_ham: { ms: 1600, hold: 0.45, frames: [
    { torso: 180, head: 180, legs: [[-60, -60], [2, 0]], arms: [[-30, -30]] },
    { torso: 180, head: 180, legs: [[-85, -85], [2, 0]], arms: [[-30, -40]] },
  ] },
  half_split: { ms: 1600, hold: 0.45, frames: [
    { torso: -70, legs: [[30, 30], [95, 180]], arms: [[80, 90]], feet: [-50] },
    { torso: -25, head: -20, legs: [[30, 30], [95, 180]], arms: [[90, 90]], feet: [-50] },
  ] },
  split_slide: { held: 'blocks', anchor: null, ms: 1700, hold: 0.4, frames: [
    { torso: -88, legs: [[40, 40], [140, 140]], arms: [[92, 90]], feet: [-60, 90] },
    { torso: -88, legs: [[18, 18], [162, 162]], arms: [[92, 90]], feet: [-60, 90] },
  ] },
  elephant_walk: { loop: true, ms: 1000, frames: [
    { torso: 40, head: 60, legs: [[90, 90], [70, 120]], arms: [[95, 100]] },
    { torso: 40, head: 60, legs: [[70, 120], [90, 90]], arms: [[95, 100]] },
  ] },
  forward_fold: { ms: 1700, hold: 0.45, frames: [
    stand(),
    stand({ torso: 50, head: 85, legs: [[84, 96]], arms: [[115, 125]] }),
  ] },

  // ======================================================== Mobility · inner thighs
  pancake: { ms: 1700, hold: 0.45, frames: [
    { torso: -80, legs: [[0, 0], [-3, -3]], arms: [[60, 30]], feet: [-90, -90] },
    { torso: -22, head: -15, legs: [[0, 0], [-3, -3]], arms: [[5, 0]], feet: [-90, -90] },
  ] },
  butterfly: { view: 'front', anchor: null, ms: 900, hold: 0.1, frames: [
    { torso: -90, legs: [[-25, 170], [205, 10]], arms: [[55, 35], [125, 145]] },
    { torso: -90, legs: [[-5, 158], [185, 22]], arms: [[45, 40], [135, 140]] },
  ] },
  side_lunge: { view: 'front', anchor: null, ms: 1600, hold: 0.45, frames: [
    { torso: -90, legs: [[60, 110], [120, 120]], arms: [[140, 60], [40, 120]] },
    { torso: -90, legs: [[45, 108], [128, 128]], arms: [[140, 60], [40, 120]] },
  ] },

  // ======================================================== Mobility · ankles
  knee_wall: { anchor: 'F', ms: 1600, hold: 0.45, props: (p) => wallAt(p.F[0] + 10), frames: [
    { torso: -85, legs: [[-5, 92], [100, 180]], arms: [[-5, -10]], feet: [0] },
    { torso: -82, legs: [[10, 110], [100, 180]], arms: [[-15, -15]], feet: [0] },
  ] },
  calf_wall: { anchor: 'F', ms: 1600, hold: 0.45, props: (p) => wallAt(p.W[0] + 2), frames: [
    stand({ torso: -78, legs: [[70, 100], [115, 115]], arms: [[-10, -10]] }),
    stand({ torso: -68, legs: [[60, 104], [121, 121]], arms: [[-8, -8]] }),
  ] },
  down_dog: { anchor: 'W', loop: true, ms: 1100, frames: [
    { torso: 48, head: 70, legs: [[108, 108], [118, 80]], arms: [[50, 50]], feet: [0, 40] },
    { torso: 48, head: 70, legs: [[118, 80], [108, 108]], arms: [[50, 50]], feet: [40, 0] },
  ] },

  // ======================================================== Animal moves
  finger_pushup: { anchor: 'W', frames: [
    { torso: -10, legs: [[90, 180]], arms: [[90, 90]] },
    { torso: -4, legs: [[72, 180]], arms: [[102, 78]] },
  ] },
  bear_squat: { anchor: 'W', ms: 1400, frames: [
    { torso: -10, legs: [[90, -172]], arms: [[90, 90]], feet: [110] },
    { torso: -2, head: -8, legs: [[28, -165]], arms: [[55, 45]], feet: [110] },
  ] },
  cat_crawl: { loop: true, ms: 900, hold: 0.1, frames: [
    { torso: -6, legs: [[68, 172], [112, 185]], arms: [[100, 85], [72, 95]] },
    { torso: -6, legs: [[112, 185], [68, 172]], arms: [[72, 95], [100, 85]] },
  ] },
  frog_hop: { loop: true, reset: true, anchor: null, ms: 850, hold: 0.2, frames: [
    { x: 34, torso: -20, head: -45, legs: [[0, 100]], arms: [[92, 90]], feet: [0] },
    { x: 34, torso: 0, head: -20, legs: [[0, 100]], arms: [[40, 40]], feet: [0] },
    { x: 67, torso: 50, head: 40, legs: [[60, 150]], arms: [[90, 90]], feet: [60], on: ['W', FLOOR] },
    { x: 58.5, torso: -20, head: -45, legs: [[0, 100]], arms: [[92, 90]], feet: [0] },
  ] },
  bear_walk: { loop: true, anchor: null, ms: 900, hold: 0.1, frames: [
    { torso: 40, head: 60, legs: [[95, 95], [125, 105]], arms: [[60, 60], [40, 40]] },
    { torso: 40, head: 60, legs: [[125, 105], [95, 95]], arms: [[40, 40], [60, 60]] },
  ] },
  monkey: { view: 'front', loop: true, reset: true, anchor: null, ms: 850, hold: 0.2, frames: [
    { x: 76, torso: -80, legs: [[35, 95], [145, 85]], arms: [[150, 120], [160, 125]] },
    { x: 62, torso: -105, legs: [[20, 120], [160, 60]], arms: [[150, 110], [165, 120]], lift: 12 },
    { x: 46, torso: -80, legs: [[35, 95], [145, 85]], arms: [[150, 120], [160, 125]] },
  ] },
  crab_walk: { loop: true, anchor: null, ms: 900, hold: 0.1, frames: [
    { torso: 195, head: 205, legs: [[-25, 95], [-5, 100]], arms: [[100, 95], [80, 92]] },
    { torso: 195, head: 205, legs: [[-5, 100], [-25, 95]], arms: [[80, 92], [100, 95]] },
  ] },
  horse_walk: { view: 'front', loop: true, anchor: null, ms: 900, hold: 0.15, frames: [
    { torso: -90, legs: [[40, 95], [140, 85]], arms: [[45, 80], [135, 100]] },
    { torso: -94, legs: [[20, 60], [140, 85]], arms: [[45, 80], [135, 100]] },
    { torso: -90, legs: [[40, 95], [140, 85]], arms: [[45, 80], [135, 100]] },
    { torso: -86, legs: [[40, 95], [160, 120]], arms: [[45, 80], [135, 100]] },
  ] },
  half_duck: { loop: true, ms: 800, hold: 0.1, anchor: null, frames: [
    { torso: -70, legs: [[40, 115], [105, 130]], arms: [[20, 0]], feet: [0, 30] },
    { torso: -70, legs: [[105, 130], [40, 115]], arms: [[20, 0]], feet: [30, 0] },
  ] },
  duck_lunge: { loop: true, ms: 1000, hold: 0.15, anchor: null, frames: [
    { torso: -80, legs: [[0, 112], [118, 190]], arms: [[60, 10]], feet: [0, 40] },
    { torso: -80, legs: [[118, 190], [0, 112]], arms: [[60, 10]], feet: [40, 0] },
  ] },
  duck_walk: { loop: true, ms: 800, hold: 0.1, anchor: null, frames: [
    { torso: -60, legs: [[-8, 118], [25, 135]], arms: [[30, 0]], feet: [0, 30] },
    { torso: -60, legs: [[25, 135], [-8, 118]], arms: [[30, 0]], feet: [30, 0] },
  ] },
};

// Variants that only change the equipment.
ANIMS.bench_db = { ...ANIMS.bench, held: 'db' };
ANIMS.incline_db = { ...ANIMS.incline, held: 'db' };
ANIMS.row_bar = { ...ANIMS.row, held: 'bar' };
