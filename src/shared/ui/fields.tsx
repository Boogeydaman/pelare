import { useState, type ReactNode } from 'react';
import type { Feel } from '../../core/types';
import { Primary, Segmented } from './kit';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-h-[64px] items-center justify-between gap-4 border-t border-rule py-3">
      <span className="text-[17px]">{label}</span>
      {children}
    </label>
  );
}

export function NumberInput({ value, onChange, unit, decimal, ariaLabel }: { value: string; onChange: (v: string) => void; unit?: string; decimal?: boolean; ariaLabel?: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode={decimal ? 'decimal' : 'numeric'} aria-label={ariaLabel}
        className="num h-12 w-24 rounded-xl bg-ink/[0.06] px-3 text-right text-[20px] font-semibold outline-none focus:ring-2 focus:ring-ink" />
      {unit && <span className="w-8 text-[15px] text-ink2">{unit}</span>}
    </span>
  );
}

export function TextInput({ value, onChange, placeholder, ariaLabel }: { value: string; onChange: (v: string) => void; placeholder?: string; ariaLabel?: string }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={ariaLabel}
      className="h-12 w-full rounded-xl bg-ink/[0.06] px-4 text-[17px] outline-none placeholder:text-ink2 focus:ring-2 focus:ring-ink" />
  );
}

export const parseNum = (v: string) => {
  const n = Number(v.replace(',', '.'));
  return v.trim() === '' || Number.isNaN(n) ? undefined : n;
};

export function FeelPicker({ value, onChange }: { value: Feel; onChange: (f: Feel) => void }) {
  return (
    <div className="border-t border-rule py-4">
      <div className="mb-2 text-[14px] text-ink2">Hur kändes det?</div>
      <Segmented label="Känsla" value={value} onChange={onChange} options={[{ value: 1, label: 'Lätt' }, { value: 2, label: 'Lagom' }, { value: 3, label: 'Tungt' }]} />
    </div>
  );
}

/** Generic "log afterwards" form: options for type, minutes, feel and optional extra fields. */
export function QuickLog({ types, extra, onSave }: {
  types: { value: string; label: string }[];
  extra?: (set: (k: string, v: string) => void, vals: Record<string, string>) => ReactNode;
  onSave: (v: { type: string; title: string; minutes: number; feel: Feel; vals: Record<string, string> }) => void;
}) {
  const [type, setType] = useState(types[0].value);
  const [minutes, setMinutes] = useState('45');
  const [feel, setFeel] = useState<Feel>(2);
  const [vals, setVals] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setVals((x) => ({ ...x, [k]: v }));
  const mins = parseNum(minutes);
  return (
    <div>
      <div className="mb-2 text-[14px] text-ink2">Typ av pass</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t.value} onClick={() => setType(t.value)} aria-pressed={type === t.value}
            className={`h-11 rounded-full px-4 text-[15px] font-medium transition ${type === t.value ? 'bg-ink text-paper' : 'bg-ink/[0.06]'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <Field label="Tid"><NumberInput value={minutes} onChange={setMinutes} unit="min" ariaLabel="Tid i minuter" /></Field>
      {extra?.(set, vals)}
      <FeelPicker value={feel} onChange={setFeel} />
      <div className="pt-4">
        <Primary disabled={!mins} onClick={() => onSave({ type, title: types.find((t) => t.value === type)!.label, minutes: mins!, feel, vals })}>Spara</Primary>
      </div>
    </div>
  );
}
