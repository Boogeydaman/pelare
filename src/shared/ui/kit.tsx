import { X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import type { ModuleId, WeeklyTarget } from '../../core/types';
import { MODULES } from '../../core/types';

export type Kind = ModuleId | 'rest' | 'other';
export type WeekProgress = Record<ModuleId, WeeklyTarget>;
export const MODULE_NAME: Record<Kind, string> = { gym: 'Gym', run: 'Löpning', mobility: 'Rörlighet', rest: 'Vila', other: 'Annat' };

export const color = (k: Kind, alpha = 1) =>
  k === 'rest' || k === 'other' ? `rgb(var(--ink2) / ${alpha})` : `rgb(var(--${k}) / ${alpha})`;

// ---------------------------------------------------------------- Buttons

type BtnProps = {
  children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string; ariaLabel?: string;
};

/** Main action. Ink on paper, or pillar colour when `kind` is given. */
export function Primary({ children, onClick, disabled, className = '', kind, ariaLabel }: BtnProps & { kind?: Kind }) {
  return (
    <button
      onClick={onClick} disabled={disabled} aria-label={ariaLabel}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-[17px] font-semibold transition duration-200 ease-out active:scale-[0.98] disabled:opacity-30 ${className}`}
      style={{ background: kind ? color(kind) : 'rgb(var(--ink))', color: kind ? 'rgb(var(--onpillar))' : 'rgb(var(--paper))' }}
    >
      {children}
    </button>
  );
}

export function Secondary({ children, onClick, disabled, className = '', ariaLabel }: BtnProps) {
  return (
    <button
      onClick={onClick} disabled={disabled} aria-label={ariaLabel}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-full border border-rule text-[17px] font-medium transition duration-200 active:scale-[0.98] disabled:opacity-30 ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, ariaLabel, className = '' }: BtnProps & { ariaLabel: string }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className={`-m-2 flex h-12 w-12 items-center justify-center rounded-full transition active:bg-ink/5 ${className}`}>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- Text

/** Small sentence-case label above a section. */
export function Kicker({ children, kind, className = '' }: { children: ReactNode; kind?: Kind; className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink2 ${className}`}>
      {kind && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color(kind) }} aria-hidden="true" />}
      {children}
    </div>
  );
}

export function Rule({ className = '' }: { className?: string }) {
  return <hr className={`border-0 border-t border-rule ${className}`} />;
}

// ---------------------------------------------------------------- Pillars (signature)

/**
 * The week as three concentric rings – gym outside, running in the middle, mobility inside – that close
 * as the week fills up. `size` sm = in the header on I dag (with the total in the middle), lg = hero on
 * Du and after a session (with the numbers per pillar beside it). `animateFrom` animates from before to after.
 */
export function Pillars({ week, size = 'sm', animateFrom }: {
  week: WeekProgress; size?: 'sm' | 'lg'; animateFrom?: WeekProgress;
}) {
  const [shown, setShown] = useState<WeekProgress>(animateFrom ?? week);
  useEffect(() => {
    if (!animateFrom) { setShown(week); return; }
    const t = setTimeout(() => setShown(week), 350);
    return () => clearTimeout(t);
  }, [week, animateFrom]);

  const lg = size === 'lg';
  const px = lg ? 176 : 92;
  const sw = lg ? 13 : 7.5;
  const gap = lg ? 4 : 2.5;
  const done = MODULES.reduce((a, p) => a + Math.min(week[p].done, week[p].target), 0);
  const target = MODULES.reduce((a, p) => a + week[p].target, 0);
  const label = MODULES.map((p) => `${MODULE_NAME[p]} ${week[p].done} av ${week[p].target}`).join(', ');

  const rings = (
    <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} className="shrink-0 -rotate-90" aria-hidden="true">
      {MODULES.map((p: ModuleId, i) => {
        const r = px / 2 - sw / 2 - i * (sw + gap);
        const len = 2 * Math.PI * r;
        const { done: d, target: t } = shown[p];
        const pct = t ? Math.min(1, d / t) : 0;
        return (
          <g key={p}>
            <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke={color(p, 0.16)} strokeWidth={sw} />
            <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke={color(p)} strokeWidth={sw} strokeLinecap="round"
              strokeDasharray={len} strokeDashoffset={len * (1 - pct)} style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.34, 1.2, 0.64, 1)', opacity: pct ? 1 : 0 }} />
          </g>
        );
      })}
    </svg>
  );

  if (!lg) {
    return (
      <div className="relative" role="img" aria-label={label}>
        {rings}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="num text-[19px] font-semibold leading-none">{done}<span className="text-ink2">/{target}</span></span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink2">pass</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-6" role="img" aria-label={label}>
      {rings}
      <ul className="flex flex-1 flex-col gap-4">
        {MODULES.map((p) => (
          <li key={p}>
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink2">
              <span className="h-2 w-2 rounded-full" style={{ background: color(p) }} />{MODULE_NAME[p]}
            </div>
            <div className="num mt-0.5 text-[26px] font-semibold leading-none">{week[p].done}<span className="text-ink2">/{week[p].target}</span></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- Segmented

export function Segmented<T extends string | number>({ value, options, onChange, label }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div role="radiogroup" aria-label={label} className="relative flex rounded-full bg-ink/[0.06] p-1">
      <div
        className="absolute bottom-1 top-1 rounded-full bg-raised shadow-[0_1px_2px_rgb(0_0_0/0.08)] transition-all duration-200 ease-out"
        style={{ left: `calc(${(idx / options.length) * 100}% + 4px)`, width: `calc(${100 / options.length}% - 8px)` }}
      />
      {options.map((o) => (
        <button key={String(o.value)} role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)}
          className={`relative z-10 h-11 flex-1 rounded-full text-[15px] font-medium transition-colors ${o.value === value ? 'text-ink' : 'text-ink2'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Sheet

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fade fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet safe-bottom max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-raised px-6 pt-2 text-ink" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 mt-1 h-1 w-10 rounded-full bg-rule" aria-hidden="true" />
        <div className="mb-5 flex items-start justify-between">
          <h2 className="font-serif text-[30px] leading-none">{title}</h2>
          <IconButton ariaLabel="Stäng" onClick={onClose}><X size={22} strokeWidth={1.75} /></IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Option list (onboarding, settings)

export function OptionList<T extends string | number>({ value, options, onChange, multi }: {
  value: T | T[]; options: { value: T; label: string; hint?: string }[]; onChange: (v: T) => void; multi?: boolean;
}) {
  const selected = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <div role={multi ? 'group' : 'radiogroup'} className="flex flex-col">
      {options.map((o, i) => (
        <button key={String(o.value)} onClick={() => onChange(o.value)}
          role={multi ? 'checkbox' : 'radio'} aria-checked={selected(o.value)}
          className={`flex min-h-[64px] items-center justify-between gap-4 py-3 text-left ${i > 0 ? 'border-t border-rule' : ''}`}>
          <span>
            <span className="block text-[18px] font-medium">{o.label}</span>
            {o.hint && <span className="block text-[14px] text-ink2">{o.hint}</span>}
          </span>
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected(o.value) ? 'border-ink bg-ink' : 'border-rule'}`} aria-hidden="true">
            {selected(o.value) && <span className="h-2 w-2 rounded-full bg-paper" />}
          </span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Chart

/** Minimal line chart. Higher is up unless `invert`. */
export function Line({ series, kind, invert, height = 72 }: { series: number[]; kind: Kind; invert?: boolean; height?: number }) {
  if (series.length < 2) return null;
  const w = 320;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const y = (v: number) => {
    const t = (v - min) / (max - min || 1);
    return 6 + (invert ? t : 1 - t) * (height - 12);
  };
  const pts = series.map((v, i) => [(i / (series.length - 1)) * (w - 12) + 6, y(v)] as const);
  const d = pts.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} aria-hidden="true" preserveAspectRatio="none">
      <path d={`${d} L${last[0]},${height} L6,${height} Z`} fill={color(kind, 0.1)} />
      <path d={d} fill="none" stroke={color(kind)} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="4" fill={color(kind)} />
    </svg>
  );
}

// ---------------------------------------------------------------- Ring timer

export function Ring({ progress, size = 260, stroke = 6, children, track = 'rgb(var(--onpillar) / 0.25)', fill = 'rgb(var(--onpillar))' }: {
  progress: number; size?: number; stroke?: number; children?: ReactNode; track?: string; fill?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fill} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, progress)))} style={{ transition: 'stroke-dashoffset 250ms linear' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
