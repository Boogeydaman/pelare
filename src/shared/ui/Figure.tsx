import { useEffect, useRef, useState } from 'react';
import { ANIMS, type P, type Pose } from './poses';
import { color, type Kind } from './kit';

const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const blend = (a: Pose, b: Pose, t: number): Pose => {
  const out = {} as Pose;
  for (const k of Object.keys(a) as (keyof Pose)[]) {
    const pa = a[k]; const pb = b[k] ?? pa;
    if (pa && pb) out[k] = lerp(pa, pb, t);
  }
  return out;
};

/** Animated stick figure showing a movement (start ↔ end). Static when the user prefers reduced motion. */
export function Figure({ anim = 'stand', kind, label, size = 'lg', onPillar }: { anim?: string; kind: Kind; label: string; size?: 'lg' | 'sm'; onPillar?: boolean }) {
  const A = ANIMS[anim] ?? ANIMS.stand;
  const [t, setT] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || A.still) { setT(A.still ? 0 : 1); return; }
    const start = performance.now();
    const period = 2800; // one full rep: down and up
    const tick = (now: number) => {
      const phase = ((now - start) % period) / period;
      // Hold briefly at each end, ease in between.
      const x = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, (x - 0.1) / 0.8)));
      setT(eased);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [A]);

  const p = blend(A.a, A.b, t);
  const dir: P = [p.S[0] - p.H[0], p.S[1] - p.H[1]];
  const len = Math.hypot(dir[0], dir[1]) || 1;
  const head: P = [p.S[0] + (dir[0] / len) * 9, p.S[1] + (dir[1] / len) * 9];
  const ink = onPillar ? 'rgb(var(--onpillar))' : color(kind);
  const faint = onPillar ? 'rgb(var(--onpillar) / 0.45)' : color(kind, 0.4);
  const line = (pts: (P | undefined)[], stroke: string) => {
    const ok = pts.filter(Boolean) as P[];
    return ok.length > 1 ? <polyline points={ok.map((q) => q.join(',')).join(' ')} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /> : null;
  };

  return (
    <div className={`flex w-full items-center justify-center rounded-3xl ${size === 'lg' ? 'aspect-[4/3]' : 'aspect-square'}`} style={{ background: onPillar ? 'rgb(var(--onpillar) / 0.12)' : color(kind, 0.08) }}
      role="img" aria-label={`Figur som visar ${label.toLowerCase()}`}>
      <svg viewBox="0 0 120 120" className="h-[85%]" aria-hidden="true">
        <line x1="6" y1="108" x2="114" y2="108" stroke={onPillar ? 'rgb(var(--onpillar) / 0.35)' : 'rgb(var(--rule))'} strokeWidth="2" strokeLinecap="round" />
        {A.prop === 'bench' && <rect x="28" y="87" width="66" height="6" rx="2" fill="rgb(var(--ink2) / 0.35)" />}
        {A.prop === 'box' && <rect x="38" y="72" width="26" height="34" rx="3" fill="rgb(var(--ink2) / 0.25)" />}
        {A.prop === 'pullbar' && <line x1="40" y1="12" x2="80" y2="12" stroke="rgb(var(--ink2))" strokeWidth="3" strokeLinecap="round" />}
        {A.prop === 'dipbars' && <line x1="50" y1="63" x2="72" y2="63" stroke="rgb(var(--ink2))" strokeWidth="3" strokeLinecap="round" />}
        {/* far limbs behind */}
        {line([p.H, p.K2, p.F2], faint)}
        {line([p.S, p.E2, p.W2], faint)}
        {line([p.H, p.K, p.F], ink)}
        {line([p.H, p.S], ink)}
        {line([p.S, p.E, p.W], ink)}
        <circle cx={head[0]} cy={head[1]} r="6.5" fill={onPillar ? 'none' : 'rgb(var(--paper))'} stroke={ink} strokeWidth="3.5" />
        {A.prop === 'bar' && <circle cx={p.W[0]} cy={p.W[1]} r="6" fill="rgb(var(--ink2) / 0.55)" />}
        {A.prop === 'db' && <rect x={p.W[0] - 5} y={p.W[1] - 2.5} width="10" height="5" rx="1.5" fill="rgb(var(--ink2) / 0.7)" />}
      </svg>
    </div>
  );
}
