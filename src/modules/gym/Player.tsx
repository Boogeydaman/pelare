import { Minus, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fmtClock, fmtNum, vibrate } from '../../core/format';
import type { ExerciseResult, Feel, StrengthItem } from '../../core/types';
import { Dim, ON, ON_DIM, ON_LINE, OnButton, RoundButton } from '../../shared/player/parts';
import { useCountdown } from '../../shared/ui/hooks';
import { Ring } from '../../shared/ui/kit';
import type { PlayerProps } from '../types';

interface Saved { ex: number; set: number; phase: 'work' | 'feel'; kg: number; reps: number; results: ExerciseResult[] }
const KEY = 'pelare.gymplayer';

function restore(storageKey: string): Saved | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return raw && raw.key === storageKey ? (raw.state as Saved) : null;
  } catch { return null; }
}

export function GymPlayer({ plan, storageKey, onProgress, onFinish: finishOuter }: PlayerProps) {
  const items: StrengthItem[] = plan.content.kind === 'strength' ? plan.content.items : [];
  const saved = useMemo(() => restore(storageKey), [storageKey]);
  const [ex, setEx] = useState(saved?.ex ?? 0);
  const [set, setSet] = useState(saved?.set ?? 0);
  const [phase, setPhase] = useState<'work' | 'rest' | 'feel'>(saved?.phase ?? 'work');
  const [kg, setKg] = useState(saved?.kg ?? items[0]?.kg ?? 20);
  const [reps, setReps] = useState(saved?.reps ?? items[0]?.target ?? items[0]?.reps[0] ?? 8);
  const [results, setResults] = useState<ExerciseResult[]>(saved?.results ?? items.map((i) => ({ id: i.id, name: i.name, sets: [], unit: i.unit === 'sek' ? 'sek' : undefined })));

  // Save after every change so a locked phone or reload does not lose the session.
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ key: storageKey, state: { ex, set, phase: phase === 'rest' ? 'work' : phase, kg, reps, results } })); } catch { /* ignore */ }
  }, [storageKey, ex, set, phase, kg, reps, results]);
  const onFinish: typeof finishOuter = (data) => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } finishOuter(data); };
  const rest = useCountdown(useCallback(() => { vibrate([200, 100, 200]); setPhase('work'); }, []));
  const it = items[ex];
  const totalSets = items.reduce((a, i) => a + i.sets, 0);

  useEffect(() => {
    const done = results.reduce((a, r) => a + r.sets.length, 0);
    onProgress(totalSets ? done / totalSets : 0);
  }, [results, totalSets, onProgress]);

  if (!it) return null;

  const done = () => {
    vibrate(30);
    setResults((r) => r.map((x, i) => (i === ex ? { ...x, sets: [...x.sets, { kg: it.bodyweight ? 0 : kg, reps }] } : x)));
    if (set + 1 < it.sets) { setSet(set + 1); setPhase('rest'); rest.start(it.restSec); } else setPhase('feel');
  };

  const feel = (f: Feel) => {
    const updated = results.map((x, i) => (i === ex ? { ...x, feel: f } : x));
    setResults(updated);
    if (ex + 1 >= items.length) { onFinish({ kind: 'strength', exercises: updated.filter((x) => x.sets.length) }); return; }
    const n = items[ex + 1];
    setEx(ex + 1); setSet(0); setKg(n.kg ?? 20); setReps(n.target ?? n.reps[0]);
    setPhase('rest'); rest.start(90);
  };

  const skip = () => {
    if (ex + 1 >= items.length) { onFinish({ kind: 'strength', exercises: results.filter((x) => x.sets.length) }); return; }
    const n = items[ex + 1];
    setEx(ex + 1); setSet(0); setKg(n.kg ?? 20); setReps(n.target ?? n.reps[0]); setPhase('work');
  };

  if (phase === 'rest') {
    const next = items[ex];
    return (
      <div className="fade flex flex-1 flex-col items-center">
        <Dim>Vila</Dim>
        <div className="mt-6">
          <Ring progress={rest.total ? rest.left / rest.total : 0} size={248}>
            <div className="num text-[76px] font-semibold leading-none tracking-tight">{fmtClock(rest.left)}</div>
          </Ring>
        </div>
        <div className="mt-8 text-center">
          <Dim className="text-[14px]">Sedan</Dim>
          <div className="mt-1 font-serif text-[28px] leading-tight">{next.name}</div>
          <Dim className="num">Set {set + 1} av {next.sets}{next.bodyweight ? '' : ` · ${fmtNum(kg)} kg`} × {reps}{next.unit === 'sek' ? ' s' : ''}</Dim>
        </div>
        <div className="mt-auto grid w-full grid-cols-2 gap-3">
          <OnButton ghost onClick={() => rest.add(30)}>+30 s</OnButton>
          <OnButton onClick={() => { rest.stop(); setPhase('work'); }}>Kör</OnButton>
        </div>
      </div>
    );
  }

  if (phase === 'feel') {
    return (
      <div className="fade flex flex-1 flex-col">
        <Dim>{it.name}</Dim>
        <h1 className="mt-2 font-serif text-title">Hur kändes sista setet?</h1>
        <div className="mt-auto flex flex-col gap-3">
          {([[1, 'Lätt', 'Fyra reps eller fler kvar'], [2, 'Lagom', 'Ett till tre kvar'], [3, 'Tungt', 'Inget kvar']] as [Feel, string, string][]).map(([v, t, h]) => (
            <button key={v} onClick={() => feel(v)} className="flex h-[72px] items-center justify-between rounded-2xl px-6 text-left transition active:scale-[0.98]"
              style={{ border: '1.5px solid rgb(var(--onpillar) / 0.4)' }}>
              <span className="text-[20px] font-semibold">{t}</span>
              <span className="text-[14px]" style={{ color: ON_DIM }}>{h}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div key={`${ex}-${set}`} className="fade flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Dim className="num">Övning {ex + 1} av {items.length}</Dim>
        <button onClick={skip} className="min-h-[44px] text-[14px] underline underline-offset-4" style={{ color: ON_DIM }}>Hoppa över</button>
      </div>
      <h1 className="mt-1 font-serif text-title">{it.name}</h1>
      {it.last && <div className="num mt-2 text-[15px] font-medium">Förra gången: {it.last}</div>}
      <Dim className="mt-1">{it.cue}</Dim>
      {it.note && <div className="mt-3 rounded-2xl px-4 py-3 text-[14px] leading-snug" style={{ background: 'rgb(var(--onpillar) / 0.12)' }}>{it.note}</div>}

      <div className="mt-6 flex gap-2" aria-label={`Set ${set + 1} av ${it.sets}`}>
        {Array.from({ length: it.sets }, (_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= set ? ON : ON_LINE, opacity: i < set ? 0.55 : 1 }} />
        ))}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-6 py-6">
        {!it.bodyweight && (
          <>
            <Adjust label="kg" value={kg} onChange={setKg} step={it.step} hint={it.kg === null ? 'Hitta en vikt du klarar med 2–3 reps kvar' : undefined} />
            <div className="h-px" style={{ background: 'rgb(var(--onpillar) / 0.2)' }} />
          </>
        )}
        <Adjust label={it.unit === 'sek' ? `sekunder · mål ${it.reps[0]}${it.reps[1] !== it.reps[0] ? `–${it.reps[1]}` : ''}` : `reps · mål ${it.reps[0]}–${it.reps[1]}`} value={reps} onChange={setReps} step={it.unit === 'sek' ? 5 : 1} />
      </div>

      <OnButton onClick={done}>Set {set + 1} klart</OnButton>
    </div>
  );
}

function Adjust({ label, value, onChange, step, hint }: { label: string; value: number; onChange: (v: number) => void; step: number; hint?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <RoundButton label={`Minska ${label}`} onClick={() => onChange(Math.max(0, Math.round((value - step) * 100) / 100))}><Minus size={22} /></RoundButton>
        <div className="num text-center text-[88px] font-semibold leading-none tracking-tight" style={{ color: ON }} aria-live="polite">{fmtNum(value)}</div>
        <RoundButton label={`Öka ${label}`} onClick={() => onChange(Math.round((value + step) * 100) / 100)}><Plus size={22} /></RoundButton>
      </div>
      <div className="mt-1 text-center text-[14px]" style={{ color: ON_DIM }}>{hint ?? label}</div>
    </div>
  );
}
