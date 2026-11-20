import type { ReactNode } from 'react';

// Building blocks for player screens, which sit on a module-coloured background.
export const ON = 'rgb(var(--onpillar))';
export const ON_DIM = 'rgb(var(--onpillar) / 0.72)';
export const ON_LINE = 'rgb(var(--onpillar) / 0.25)';

export function OnButton({ children, onClick, ghost, className = '' }: { children: ReactNode; onClick: () => void; ghost?: boolean; className?: string }) {
  return (
    <button onClick={onClick}
      className={`flex h-16 w-full items-center justify-center gap-2 rounded-full text-[18px] font-semibold transition active:scale-[0.98] ${className}`}
      style={ghost ? { border: '1.5px solid rgb(var(--onpillar) / 0.5)', color: ON } : { background: ON, color: 'rgb(var(--ink))' }}>
      {children}
    </button>
  );
}

export function RoundButton({ children, onClick, label, size = 56 }: { children: ReactNode; onClick: () => void; label: string; size?: number }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex shrink-0 items-center justify-center rounded-full transition active:scale-95"
      style={{ width: size, height: size, border: '1.5px solid rgb(var(--onpillar) / 0.45)' }}>
      {children}
    </button>
  );
}

export function Dim({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`text-[15px] ${className}`} style={{ color: ON_DIM }}>{children}</div>;
}
