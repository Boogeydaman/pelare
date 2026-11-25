import { useEffect, useRef, useState, type ReactNode } from 'react';

// Building blocks for player screens. The player is the page colour tinted with the pillar: text is ink
// (the player sets --onpillar to ink), the pillar colour is the accent – solid buttons and progress.
export const ON = 'rgb(var(--onpillar))';
export const ACCENT = 'rgb(var(--accent, var(--onpillar)))';
export const ON_ACCENT = 'rgb(var(--on-accent, var(--ink)))';
export const ON_DIM = 'rgb(var(--onpillar) / 0.72)';
export const ON_LINE = 'rgb(var(--onpillar) / 0.25)';

export const HOLD_MS = 1000;

/**
 * Press-and-hold: the action only fires after holding for HOLD_MS, so nothing happens by accident in a
 * pocket or with a sweaty hand. Keyboard and screen readers still activate it normally (click with detail 0).
 */
export function useHold(onDone: () => void, enabled: boolean) {
  const [p, setP] = useState(0);
  const raf = useRef(0);
  const cb = useRef(onDone);
  cb.current = onDone;
  const cancel = () => { cancelAnimationFrame(raf.current); setP(0); };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  if (!enabled) return { progress: 0, handlers: { onClick: () => onDone() } };
  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    const t0 = performance.now();
    const tick = (now: number) => {
      const x = Math.min(1, (now - t0) / HOLD_MS);
      setP(x);
      if (x >= 1) { navigator.vibrate?.(40); setP(0); cb.current(); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  return {
    progress: p,
    handlers: {
      onPointerDown: start, onPointerUp: cancel, onPointerLeave: cancel, onPointerCancel: cancel,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
      onClick: (e: React.MouseEvent) => { if (e.detail === 0) cb.current(); }, // keyboard / assistive tech
    },
  };
}

export function OnButton({ children, onClick, ghost, className = '', hold = false }: { children: ReactNode; onClick: () => void; ghost?: boolean; className?: string; hold?: boolean }) {
  const h = useHold(onClick, hold);
  return (
    <button {...h.handlers}
      className={`relative flex h-16 w-full touch-none select-none items-center justify-center gap-2 overflow-hidden rounded-full text-[18px] font-semibold transition active:scale-[0.98] ${className}`}
      style={ghost ? { border: '1.5px solid rgb(var(--onpillar) / 0.5)', color: ON } : { background: ACCENT, color: ON_ACCENT }}>
      {hold && <span className="absolute inset-y-0 left-0" style={{ width: `${h.progress * 100}%`, background: ghost ? 'rgb(var(--onpillar) / 0.25)' : 'rgb(var(--on-accent, var(--ink)) / 0.2)' }} aria-hidden="true" />}
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
}

export function RoundButton({ children, onClick, label, size = 56, hold = false }: { children: ReactNode; onClick: () => void; label: string; size?: number; hold?: boolean }) {
  const h = useHold(onClick, hold);
  const r = size / 2 - 2, c = 2 * Math.PI * r;
  return (
    <button {...h.handlers} aria-label={hold ? `${label} (håll inne)` : label} className="relative flex shrink-0 touch-none select-none items-center justify-center rounded-full transition active:scale-95"
      style={{ width: size, height: size, border: '1.5px solid rgb(var(--onpillar) / 0.45)' }}>
      {hold && h.progress > 0 && (
        <svg className="absolute inset-0 -rotate-90" width={size} height={size} aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ON} strokeWidth="3" strokeDasharray={c} strokeDashoffset={c * (1 - h.progress)} />
        </svg>
      )}
      {children}
    </button>
  );
}

export function Dim({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`text-[15px] ${className}`} style={{ color: ON_DIM }}>{children}</div>;
}
