import { useEffect, useState } from 'react';
import { ANIMS } from './poses';
import { FLOOR, HEAD_R, first, placed, type Anim, type P, type Pose } from './skeleton';
import { color, type Kind } from './kit';

/** Which keyframes to blend at a given phase (0–1) of the whole cycle. */
export function frameAt(a: Anim, phase: number): { i: number; j: number; t: number } {
  const n = a.frames.length;
  if (n < 2) return { i: 0, j: 0, t: 0 };
  const order = a.loop ? (a.reset ? [...Array(n).keys()] : [...Array(n).keys(), 0]) : [...Array(n).keys(), ...[...Array(n - 1).keys()].reverse()];
  const segs = order.length - 1;
  const x = phase * segs;
  const k = Math.min(segs - 1, Math.floor(x));
  const local = x - k;
  const hold = a.hold ?? 0.25;
  const u = Math.min(1, Math.max(0, (local - hold / 2) / (1 - hold)));
  return { i: order[k], j: order[k + 1], t: 0.5 - 0.5 * Math.cos(Math.PI * u) };
}

export const cycleMs = (a: Anim) => (a.frames.length < 2 ? 0 : (a.loop ? a.frames.length - (a.reset ? 1 : 0) : 2 * (a.frames.length - 1)) * (a.ms ?? 1300));

/** Animated stick figure showing a movement. Static (first frame) when the user prefers reduced motion. */
export function Figure({ anim = 'stand', kind, label, size = 'lg', onPillar, phase }: {
  anim?: string; kind: Kind; label: string; size?: 'lg' | 'sm'; onPillar?: boolean; phase?: number;
}) {
  const A = ANIMS[anim] ?? ANIMS.stand;
  const [ph, setPh] = useState(0);

  useEffect(() => {
    if (phase !== undefined) return;
    const total = cycleMs(A);
    if (!total || matchMedia('(prefers-reduced-motion: reduce)').matches) { setPh(0); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => { setPh(((now - start) % total) / total); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [A, phase]);

  const { i, j, t } = frameAt(A, phase ?? ph);
  const { pose: p, arch } = placed(A, i, j, t);
  const p0 = first(A);
  const ink = onPillar ? 'rgb(var(--onpillar))' : color(kind);
  const front = A.view === 'front' || A.view === 'top';
  const faint = front ? ink : onPillar ? 'rgb(var(--onpillar) / 0.45)' : color(kind, 0.4);
  const equip = onPillar ? 'rgb(var(--onpillar) / 0.35)' : 'rgb(var(--ink2) / 0.3)';
  const steel = onPillar ? 'rgb(var(--onpillar) / 0.7)' : 'rgb(var(--ink2) / 0.75)';
  const line = (pts: P[], stroke: string, w = 4) => (
    <polyline points={pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  );
  const foot = (a: P, b: P, stroke: string) => (a[0] !== b[0] || a[1] !== b[1] ? line([a, b], stroke, 3.5) : null);
  // Spine: a gentle curve when the pose arches or rounds the back.
  const mid: P = [(p.H[0] + p.S[0]) / 2, (p.H[1] + p.S[1]) / 2];
  const dir: P = [p.S[0] - p.H[0], p.S[1] - p.H[1]];
  const len = Math.hypot(dir[0], dir[1]) || 1;
  const ctrl: P = [mid[0] - (dir[1] / len) * arch * 2, mid[1] + (dir[0] / len) * arch * 2];
  const shapes = A.props?.(p0) ?? [];
  const cable = A.cable?.(p0);

  return (
    <div className={`flex w-full items-center justify-center rounded-3xl ${size === 'lg' ? 'aspect-[4/3]' : 'aspect-square'}`}
      style={{ background: onPillar ? 'rgb(var(--onpillar) / 0.12)' : color(kind, 0.08) }}
      role="img" aria-label={`Figur som visar ${label.toLowerCase()}`}>
      <svg viewBox="-3 -8 126 126" className="h-[88%]" aria-hidden="true">
        {A.view !== 'top' && <line x1="4" y1={FLOOR + 2} x2="116" y2={FLOOR + 2} stroke={onPillar ? 'rgb(var(--onpillar) / 0.35)' : 'rgb(var(--rule))'} strokeWidth="2" strokeLinecap="round" />}
        {shapes.map((s, k) => s.kind === 'rect'
          ? <rect key={k} x={s.x} y={s.y} width={s.w} height={s.h} rx="2.5" fill={equip} />
          : <line key={k} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={steel} strokeWidth="3" strokeLinecap="round" />)}
        {cable && <line x1={cable[0]} y1={cable[1]} x2={p.W[0]} y2={p.W[1]} stroke={steel} strokeWidth="1.5" strokeDasharray="3 2" />}
        {/* far limbs behind */}
        {line([p.H, p.K2, p.F2], faint)}{foot(p.F2, p.T2, faint)}
        {line([p.S, p.E2, p.W2], faint)}
        <path d={`M${p.H[0].toFixed(1)},${p.H[1].toFixed(1)} Q${ctrl[0].toFixed(1)},${ctrl[1].toFixed(1)} ${p.S[0].toFixed(1)},${p.S[1].toFixed(1)}`} fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
        {line([p.H, p.K, p.F], ink)}{foot(p.F, p.T, ink)}
        {line([p.S, p.E, p.W], ink)}
        <circle cx={p.N[0]} cy={p.N[1]} r={HEAD_R} fill={onPillar ? 'none' : 'rgb(var(--paper))'} stroke={ink} strokeWidth="3.5" />
        {A.held === 'bar' && <circle cx={p.W[0]} cy={p.W[1]} r="5.5" fill={steel} />}
        {(A.held === 'db' || A.held === 'dbs') && <rect x={p.W[0] - 5} y={p.W[1] - 2.5} width="10" height="5" rx="1.5" fill={steel} />}
        {A.held === 'blocks' && <rect x={p.W[0] - 6} y={p.W[1] + 2} width="12" height={Math.max(0, FLOOR - p.W[1] - 2)} rx="2" fill={equip} />}
        {A.plate && (() => { const d: P = [p.F[0] - p.K[0], p.F[1] - p.K[1]]; const l = Math.hypot(d[0], d[1]) || 1; const n: P = [-d[1] / l * 10, d[0] / l * 10];
          return <line x1={p.F[0] + n[0] + d[0] / l * 3} y1={p.F[1] + n[1] + d[1] / l * 3} x2={p.F[0] - n[0] + d[0] / l * 3} y2={p.F[1] - n[1] + d[1] / l * 3} stroke={steel} strokeWidth="4" strokeLinecap="round" />; })()}
        {A.held === 'dbs' && <rect x={p.W2[0] - 5} y={p.W2[1] - 2.5} width="10" height="5" rx="1.5" fill={steel} />}
      </svg>
    </div>
  );
}

export type { Pose };
