import { ArrowLeftRight, Check, Info, ListOrdered, Minus, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { beep, unlockAudio } from '../../shared/ui/sound';
import { fmtClock, fmtNum, vibrate } from '../../core/format';
import type { ExerciseResult, Feel, StrengthItem } from '../../core/types';
import { Dim, ON, ON_DIM, ON_LINE, OnButton, RoundButton } from '../../shared/player/parts';
import { useCountdown } from '../../shared/ui/hooks';
import { Figure } from '../../shared/ui/Figure';
import { Ring, Sheet } from '../../shared/ui/kit';
import { HOWTO } from './howto';
import { useCtx } from '../../core/ctx';
import { EX, MUSCLE_NAME } from './exercises';
import { equipmentAt, similar, swapItem } from './planner';
import type { PlayerProps } from '../types';

interface Saved { ex: number; set: number; phase: 'work' | 'feel'; kg: number; reps: number; results: ExerciseResult[]; swaps?: Record<number, string>; warm?: Record<string, boolean> }
const KEY = 'pelare.gymplayer';

function restore(storageKey: string): Saved | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return raw && raw.key === storageKey ? (raw.state as Saved) : null;
  } catch { return null; }
}

export function GymPlayer({ plan, storageKey, onProgress, onFinish: finishOuter }: PlayerProps) {
  const ctx = useCtx();
  const saved = useMemo(() => restore(storageKey), [storageKey]);
  const [swaps, setSwaps] = useState<Record<number, string>>(saved?.swaps ?? {});
  // Ticked warm-up sets, keyed "exercise:set" (and "exercise:done" when the warm-up is finished).
  const [warm, setWarm] = useState<Record<string, boolean>>(saved?.warm ?? {});
  // Exercises swapped during the session get their own target from the history.
  const items: StrengthItem[] = useMemo(() => {
    const base = plan.content.kind === 'strength' ? plan.content.items : [];
    return base.map((it, i) => (swaps[i] ? swapItem(it, swaps[i], ctx?.logs ?? []) ?? it : it));
  }, [plan, swaps, ctx?.logs]);
  const [ex, setEx] = useState(saved?.ex ?? 0);
  const [set, setSet] = useState(saved?.set ?? 0);
  const [phase, setPhase] = useState<'work' | 'rest' | 'feel'>(saved?.phase ?? 'work');
  const [kg, setKg] = useState(saved?.kg ?? items[0]?.kg ?? 20);
  const [reps, setReps] = useState(saved?.reps ?? items[0]?.target ?? items[0]?.reps[0] ?? 8);
  const [results, setResults] = useState<ExerciseResult[]>(saved?.results ?? items.map((i) => ({ id: i.id, name: i.name, sets: [], unit: i.unit === 'sek' ? 'sek' : undefined })));

  // Save after every change so a locked phone or reload does not lose the session.
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ key: storageKey, state: { ex, set, phase: phase === 'rest' ? 'work' : phase, kg, reps, results, swaps, warm } })); } catch { /* ignore */ }
  }, [storageKey, ex, set, phase, kg, reps, results, swaps, warm]);
  const onFinish: typeof finishOuter = (data) => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } finishOuter(data); };
  const [help, setHelp] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const options = useMemo(() => (ctx && items[ex] ? similar(items[ex].id, equipmentAt(ctx.profile, ctx.checkin.place)) : []), [ctx, items, ex]);
  const swapTo = (id: string) => {
    const next = { ...swaps, [ex]: id };
    setSwaps(next);
    const n = swapItem(items[ex], id, ctx?.logs ?? []);
    if (n) { setKg(n.kg ?? 20); setReps(n.target ?? n.reps[0]); setResults((r) => r.map((x, i) => (i === ex ? { id: n.id, name: n.name, sets: [], unit: n.unit === 'sek' ? 'sek' : undefined } : x))); }
    setSwapOpen(false);
  };
  const rest = useCountdown(useCallback(() => { vibrate([200, 100, 200]); beep(3, 1046, 160); setPhase('work'); }, []));
  // Ten seconds left of the rest: a short signal so you have time to get into position.
  const warned = useRef(false);
  useEffect(() => {
    if (phase !== 'rest' || !rest.running) { warned.current = false; return; }
    if (!warned.current && rest.total > 15 && rest.left <= 10) { warned.current = true; vibrate(120); beep(1, 660, 120); }
  }, [phase, rest.running, rest.left, rest.total]);
  const it = items[ex];
  const totalSets = items.reduce((a, i) => a + i.sets, 0);

  useEffect(() => {
    const done = results.reduce((a, r) => a + r.sets.length, 0);
    onProgress(totalSets ? done / totalSets : 0);
  }, [results, totalSets, onProgress]);

  if (!it) return null;

  const done = () => {
    vibrate(30);
    unlockAudio();
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
      {HOWTO[it.id] && (
        <button onClick={() => setHelp(true)} className="mt-1 flex min-h-[40px] items-center gap-1.5 text-[15px] font-medium underline underline-offset-4" style={{ color: ON_DIM }}>
          <Info size={16} aria-hidden="true" /> Hur gör man?
        </button>
      )}
      <div className="-mx-1 mt-1 flex flex-wrap gap-x-4">
        {set === 0 && options.length > 0 && (
          <button onClick={() => setSwapOpen(true)} className="flex min-h-[40px] items-center gap-1.5 px-1 text-[15px] font-medium underline underline-offset-4" style={{ color: ON_DIM }}>
            <ArrowLeftRight size={16} aria-hidden="true" /> Byt övning
          </button>
        )}
        <button onClick={() => setListOpen(true)} className="flex min-h-[40px] items-center gap-1.5 px-1 text-[15px] font-medium underline underline-offset-4" style={{ color: ON_DIM }}>
          <ListOrdered size={16} aria-hidden="true" /> Kommande ({items.length - ex - 1})
        </button>
      </div>
      {set === 0 && it.warmup && it.warmup.length > 0 && !warm[`${ex}:done`] && (
        <div className="mt-3 rounded-2xl px-4 py-3" style={{ background: 'rgb(var(--onpillar) / 0.12)' }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold">Uppvärmning först</span>
            <span className="text-[12px]" style={{ color: ON_DIM }}>~1 min vila mellan</span>
          </div>
          <div className="mt-2 flex gap-2">
            {it.warmup.map((w, k) => {
              const on = !!warm[`${ex}:${k}`];
              return (
                <button key={k} aria-pressed={on} onClick={() => setWarm((x) => {
                  const next = { ...x, [`${ex}:${k}`]: !on };
                  if (it.warmup!.every((_, j) => next[`${ex}:${j}`])) next[`${ex}:done`] = true;
                  return next;
                })}
                  className="num flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl text-[15px] font-semibold"
                  style={on ? { background: ON, color: 'rgb(var(--ink))' } : { border: '1.5px solid rgb(var(--onpillar) / 0.45)' }}>
                  {on && <Check size={15} aria-hidden="true" />}{fmtNum(w.kg)} × {w.reps}
                </button>
              );
            })}
          </div>
          <button onClick={() => setWarm((x) => ({ ...x, [`${ex}:done`]: true }))} className="mt-2 min-h-[36px] text-[13px] underline underline-offset-4" style={{ color: ON_DIM }}>Hoppa över uppvärmningen</button>
        </div>
      )}
      {(it.last || it.aim) && (
        <div className="num mt-2 grid grid-cols-2 gap-3 rounded-2xl px-4 py-3 text-[14px]" style={{ background: 'rgb(var(--onpillar) / 0.12)' }}>
          <div><div style={{ color: ON_DIM }}>Förra gången</div><div className="font-semibold">{it.last?.replace(/^[^·]*· /, '') ?? '–'}</div></div>
          <div><div style={{ color: ON_DIM }}>Sikta på i dag</div><div className="font-semibold">{it.aim ?? '–'}</div></div>
        </div>
      )}
      {it.plateau && (
        <details className="mt-2 rounded-2xl px-4 py-2 text-[13px] leading-snug" style={{ border: '1.5px solid rgb(var(--onpillar) / 0.35)' }}>
          <summary className="cursor-pointer py-1 text-[14px] font-semibold">Platå – så bryter du den</summary>
          <p className="pb-1">{it.plateau.replace(/^Platå: /, '')}</p>
        </details>
      )}
      <Dim className="mt-2">{it.cue}</Dim>
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

      <Sheet open={swapOpen} onClose={() => setSwapOpen(false)} title="Byt övning">
        <div className="pb-4">
          <p className="mb-2 text-[15px] text-ink2">Liknande övningar som tränar {(EX[it.id]?.primary ?? []).map((m) => MUSCLE_NAME[m].toLowerCase()).join(' och ') || 'samma muskler'} och fungerar med utrustningen du har i dag.</p>
          {options.map((o) => (
            <button key={o.id} onClick={() => swapTo(o.id)} className="flex min-h-[60px] w-full items-center justify-between gap-3 border-t border-rule py-3 text-left">
              <span>
                <span className="block text-[17px] font-medium">{o.name}</span>
                <span className="block text-[13px] text-ink2">{[...o.primary, ...o.secondary].map((m) => MUSCLE_NAME[m]).join(', ')}</span>
              </span>
              <ArrowLeftRight size={18} className="shrink-0 text-ink2" aria-hidden="true" />
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={listOpen} onClose={() => setListOpen(false)} title="Passets övningar">
        <ol className="pb-4">
          {items.map((x, i) => (
            <li key={i} className={`flex items-center justify-between gap-3 border-t border-rule py-3 ${i === ex ? 'font-semibold' : ''}`}>
              <span className="flex items-center gap-3">
                <span className="num w-5 text-ink2">{i < ex ? <Check size={16} aria-label="Klar" /> : i + 1}</span>
                <span>
                  <span className="block text-[16px]">{x.name}{i === ex ? ' · nu' : ''}</span>
                  <span className="num block text-[13px] font-normal text-ink2">{x.sets} set × {x.reps[0]}{x.reps[1] !== x.reps[0] ? `–${x.reps[1]}` : ''}{x.unit === 'sek' ? ' s' : ''}{x.kg ? ` · ${fmtNum(x.kg)} kg` : ''}</span>
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Sheet>

      <Sheet open={help} onClose={() => setHelp(false)} title={it.name}>
        <div className="pb-4">
          <Figure anim={HOWTO[it.id]?.anim} kind="gym" label={it.name} />
          <ol className="mt-4">
            {HOWTO[it.id]?.how.map((t, i) => (
              <li key={i} className="flex gap-4 border-t border-rule py-3 text-[16px] leading-snug"><span className="num w-4 shrink-0 text-ink2">{i + 1}</span><span>{t}</span></li>
            ))}
          </ol>
        </div>
      </Sheet>
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
