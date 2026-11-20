import { useCtx } from '../../core/ctx';
import { saveProfile } from '../../core/db';
import type { MobilityFocus } from '../../core/types';
import { OptionList } from '../../shared/ui/kit';
import { FOCUS_HINT, FOCUS_NAME, focusOf } from './planner';

export const FOCUS_OPTIONS = (Object.keys(FOCUS_NAME) as MobilityFocus[]).map((f) => ({ value: f, label: FOCUS_NAME[f], hint: FOCUS_HINT[f] }));

/** Multi-select of mobility focus areas, shown on the mobility program page. */
export function FocusPicker() {
  const ctx = useCtx();
  if (!ctx) return null;
  const focus = focusOf(ctx.profile);
  const toggle = (f: MobilityFocus) => {
    const next = focus.includes(f) ? focus.filter((x) => x !== f) : [...focus, f];
    saveProfile({ ...ctx.profile, mobilityFocus: next });
  };
  return (
    <section className="mt-8">
      <h2 className="text-[13px] font-medium text-ink2">Extra fokus</h2>
      <p className="mt-1 text-[15px] text-ink2">Hela kroppen ingår alltid. Valda områden får dubbelt så mycket tid och svårare stretchar med tiden.</p>
      <div className="mt-2"><OptionList multi value={focus} options={FOCUS_OPTIONS} onChange={toggle} /></div>
    </section>
  );
}
