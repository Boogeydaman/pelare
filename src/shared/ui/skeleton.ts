// Stick-figure engine. A pose is described with joint angles (degrees: 0 = right, 90 = down,
// 180 = left, -90 = up), so limbs always keep their length. Animations are keyframes of angles;
// the figure is rebuilt every frame and placed on the floor (or a chosen joint on a chosen height).

export type P = [number, number];
export type Joint = 'S' | 'H' | 'K' | 'F' | 'E' | 'W' | 'K2' | 'F2' | 'E2' | 'W2' | 'N' | 'T' | 'T2';
export type Pose = Record<Joint, P>;
type Limb = [number, number];

export interface Spec {
  torso: number; // hip → shoulder
  legs: [Limb, Limb?]; // [thigh, shin], near then far (far defaults to near)
  arms: [Limb, Limb?]; // [upper arm, forearm]
  head?: number; // neck direction, defaults to the torso direction
  feet?: [number?, number?]; // foot direction from the ankle; omitted = no foot drawn
  arch?: number; // spine curve: negative rounds the back up (cat), positive sags (cow)
  x?: number; // hip x when the animation has no anchor
  on?: [Joint, number]; // put this joint on this height instead of the lowest point on the floor
  lift?: number; // raise the whole figure (jumps, calf raises)
}

export type Shape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number };

export interface Anim {
  frames: Spec[];
  loop?: boolean; // cycle through the frames (walking) instead of going back and forth
  reset?: boolean; // with loop: jump straight back to the first frame (movements that travel)
  ms?: number; // time per segment
  hold?: number; // share of each segment spent still at the keyframe
  view?: 'side' | 'front' | 'top';
  anchor?: Joint | null; // joint that stays put horizontally (default the near foot)
  held?: 'bar' | 'db' | 'dbs' | 'blocks'; // follows the wrist(s); blocks = support under the hands
  plate?: boolean; // leg press plate at the feet
  props?: (p0: Pose) => Shape[]; // fixed equipment, placed from the first frame
  cable?: (p0: Pose) => P; // a cable from this point to the hands
}

export const FLOOR = 106;
const LEN = { torso: 30, neck: 9, thigh: 23, shin: 23, upper: 15, fore: 14, foot: 7 };
export const HEAD_R = 6.5;

const rad = (d: number) => (d * Math.PI) / 180;
const go = (p: P, a: number, l: number): P => [p[0] + Math.cos(rad(a)) * l, p[1] + Math.sin(rad(a)) * l];

export function build(s: Spec, hip: P = [60, 60]): Pose {
  const H = hip;
  const S = go(H, s.torso, LEN.torso);
  const [l1, l2 = l1] = s.legs;
  const [a1, a2 = a1] = s.arms;
  const K = go(H, l1[0], LEN.thigh); const F = go(K, l1[1], LEN.shin);
  const K2 = go(H, l2[0], LEN.thigh); const F2 = go(K2, l2[1], LEN.shin);
  const E = go(S, a1[0], LEN.upper); const W = go(E, a1[1], LEN.fore);
  const E2 = go(S, a2[0], LEN.upper); const W2 = go(E2, a2[1], LEN.fore);
  const N = go(S, s.head ?? s.torso, LEN.neck + HEAD_R);
  const [f1, f2 = f1] = s.feet ?? [];
  const T = f1 === undefined ? F : go(F, f1, LEN.foot);
  const T2 = f2 === undefined ? F2 : go(F2, f2, LEN.foot);
  return { S, H, K, F, K2, F2, E, W, E2, W2, N, T, T2 };
}

const shift = (p: Pose, dx: number, dy: number): Pose =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, [v[0] + dx, v[1] + dy]])) as Pose;

/** Vertical offset that puts the figure on the floor, or the chosen joint on its height. */
function groundY(p: Pose, s: Spec, view: Anim['view']): number {
  if (view === 'top') {
    const ys = (Object.entries(p) as [Joint, P][]).flatMap(([k, v]) => (k === 'N' ? [v[1] - HEAD_R, v[1] + HEAD_R] : [v[1]]));
    return 56 - (Math.min(...ys) + Math.max(...ys)) / 2;
  }
  if (s.on) return s.on[1] - p[s.on[0]][1];
  const low = Math.max(...(Object.entries(p) as [Joint, P][]).map(([k, v]) => (k === 'N' ? v[1] + HEAD_R : v[1])));
  return FLOOR - low;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function blendSpec(a: Spec, b: Spec, t: number): Spec {
  const L = (x: Limb, y: Limb): Limb => [lerp(x[0], y[0], t), lerp(x[1], y[1], t)];
  const legs: [Limb, Limb] = [L(a.legs[0], b.legs[0]), L(a.legs[1] ?? a.legs[0], b.legs[1] ?? b.legs[0])];
  const arms: [Limb, Limb] = [L(a.arms[0], b.arms[0]), L(a.arms[1] ?? a.arms[0], b.arms[1] ?? b.arms[0])];
  const fa = a.feet ?? [], fb = b.feet ?? [];
  const foot = (i: 0 | 1) => (fa[i] === undefined && fb[i] === undefined ? undefined : lerp(fa[i] ?? fb[i]!, fb[i] ?? fa[i]!, t));
  return {
    torso: lerp(a.torso, b.torso, t), legs, arms,
    head: lerp(a.head ?? a.torso, b.head ?? b.torso, t),
    feet: a.feet || b.feet ? [foot(0), foot(1)] : undefined,
    arch: lerp(a.arch ?? 0, b.arch ?? 0, t),
    x: lerp(a.x ?? 60, b.x ?? 60, t),
    lift: lerp(a.lift ?? 0, b.lift ?? 0, t),
  };
}

/** Builds a placed pose: frame i blended towards frame j by t. */
export function placed(anim: Anim, i: number, j: number, t: number): { pose: Pose; arch: number } {
  const A = anim.frames[i], B = anim.frames[j];
  const s = blendSpec(A, B, t);
  const anchor = anim.anchor === undefined ? 'F' : anim.anchor;
  const raw = build(s, [s.x ?? 60, 60]);
  // Ground the blended pose by each keyframe's rule and blend the two, so "on" switches smoothly.
  const dy = lerp(groundY(raw, A, anim.view), groundY(raw, B, anim.view), t) - (s.lift ?? 0);
  let dx = 0, ddy = dy;
  if (anchor) {
    // Keep the anchor joint where it is in the (centred) first frame; seen from above, in both directions.
    const p0 = first(anim);
    dx = p0[anchor][0] - raw[anchor][0];
    if (anim.view === 'top') ddy = p0[anchor][1] - raw[anchor][1];
  }
  return { pose: shift(raw, dx, ddy), arch: s.arch ?? 0 };
}

const firstCache = new WeakMap<Anim, Pose>();
/** First frame, placed and centred horizontally. */
export function first(anim: Anim): Pose {
  const hit = firstCache.get(anim);
  if (hit) return hit;
  const A = anim.frames[0];
  const raw = build(A, [A.x ?? 60, 60]);
  const dy = groundY(raw, A, anim.view) - (A.lift ?? 0);
  let p = shift(raw, 0, dy);
  if (anim.anchor !== null) {
    const xs = Object.entries(p).map(([k, v]) => (k === 'N' ? [v[0] - HEAD_R, v[0] + HEAD_R] : [v[0]])).flat();
    p = shift(p, 60 - (Math.min(...xs) + Math.max(...xs)) / 2, 0);
  }
  firstCache.set(anim, p);
  return p;
}
