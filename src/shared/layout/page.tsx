import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Metric } from '../../core/types';
import { IconButton, Kicker, Line, color, type Kind } from '../ui/kit';

/** Go back in history when there is one, otherwise to `fallback` (e.g. a deep link opened fresh). */
export function useBack(fallback: string) {
  const nav = useNavigate();
  return () => ((window.history.state?.idx ?? 0) > 0 ? nav(-1) : nav(fallback, { replace: true }));
}

/** Sub page: back arrow, small kicker, serif title. */
export function Page({ kicker, kind, title, back, children, action }: {
  kicker?: string; kind?: Kind; title: string; back: string; children: ReactNode; action?: ReactNode;
}) {
  const goBack = useBack(back);
  return (
    <div className="pb-10">
      <div className="flex items-center justify-between py-2">
        <IconButton ariaLabel="Tillbaka" onClick={goBack}><ArrowLeft size={22} strokeWidth={1.75} /></IconButton>
        {action}
      </div>
      {kicker && <Kicker kind={kind} className="mt-4">{kicker}</Kicker>}
      <h1 className="mt-2 font-serif text-title">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}

/** Section with a heading and an optional "see all" link. */
export function Section({ title, to, linkLabel = 'Visa alla', children, className = '' }: {
  title: string; to?: string; linkLabel?: string; children: ReactNode; className?: string;
}) {
  return (
    <section className={`mt-10 ${className}`}>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[13px] font-medium text-ink2">{title}</h2>
        {to && <Link to={to} className="flex min-h-[32px] items-center gap-0.5 text-[14px] font-medium">{linkLabel}<ChevronRight size={16} strokeWidth={1.75} /></Link>}
      </div>
      {children}
    </section>
  );
}

/** A tappable list row with a hairline above. */
export function Row({ title, sub, right, onClick, to, kind, serif }: {
  title: ReactNode; sub?: ReactNode; right?: ReactNode; onClick?: () => void; to?: string; kind?: Kind; serif?: boolean;
}) {
  const inner = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        {kind && <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: color(kind) }} aria-hidden="true" />}
        <span className="min-w-0">
          <span className={`block truncate ${serif ? 'font-serif text-[24px] leading-tight' : 'text-[17px] font-medium'}`}>{title}</span>
          {sub && <span className="block truncate text-[14px] text-ink2">{sub}</span>}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[15px] text-ink2">
        {right}
        {(onClick || to) && <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />}
      </span>
    </>
  );
  const cls = 'flex min-h-[60px] w-full items-center justify-between gap-4 border-t border-rule py-3 text-left';
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

/** Key figure with optional sparkline. */
export function Stat({ m, kind, big }: { m: Metric; kind: Kind; big?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[13px] text-ink2">{m.label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`num font-semibold leading-none tracking-tight ${big ? 'text-[56px]' : 'text-[32px]'}`}>{m.value}</span>
        {m.unit && m.value !== '–' && <span className="text-[15px] text-ink2">{m.unit}</span>}
      </div>
      {m.change && <div className="mt-1 text-[13px] font-medium" style={{ color: color(kind) }}>{m.change}</div>}
      {big && m.series && m.series.length > 1 && <div className="mt-4"><Line series={m.series} kind={kind} invert={m.invert} /></div>}
      {big && m.bars && <Bars bars={m.bars} kind={kind} />}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="border-t border-rule py-4 text-[15px] text-ink2">{children}</p>;
}

/** Placeholder illustration for exercises until real figures exist. */
export function Figure({ kind, label }: { kind: Kind; label: string }) {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl" style={{ background: color(kind, 0.1) }} role="img" aria-label={`Bild: ${label}`}>
      <svg viewBox="0 0 120 120" className="h-2/3" aria-hidden="true">
        <g fill="none" stroke={color(kind)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="60" cy="22" r="9" />
          <path d="M60 32 L60 70 M60 42 L38 58 M60 42 L82 58 M60 70 L44 104 M60 70 L76 104" />
        </g>
      </svg>
    </div>
  );
}

/** Horizontal bars against a target line, e.g. weekly sets per muscle. */
export function Bars({ bars, kind }: { bars: NonNullable<Metric['bars']>; kind: Kind }) {
  const max = Math.max(...bars.map((b) => Math.max(b.value, b.target))) || 1;
  return (
    <ul className="mt-5 flex flex-col gap-2.5">
      {bars.map((b) => (
        <li key={b.label} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-[14px]">
          <span className="truncate">{b.label}</span>
          <span className="relative h-2.5 rounded-full" style={{ background: color(kind, 0.12) }}>
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(Math.min(b.value, max) / max) * 100}%`, background: b.value >= b.target ? color(kind) : color(kind, 0.55) }} />
            <span className="absolute -inset-y-1 w-px bg-ink/50" style={{ left: `${(b.target / max) * 100}%` }} aria-hidden="true" />
          </span>
          <span className="num text-right text-ink2">{String(b.value).replace('.', ',')}</span>
        </li>
      ))}
    </ul>
  );
}
