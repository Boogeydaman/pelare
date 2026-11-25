// Follow-along ab workouts: work and rest on the clock. During the rest the next exercise is shown
// with its figure, like the videos' rest periods; three beeps count down the last seconds.
import { Info, Pause, Play, SkipForward } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { vibrate } from '../../core/format';
import type { CircuitItem } from '../../core/types';
import { Dim, ON_DIM, OnButton, RoundButton, ACCENT } from '../../shared/player/parts';
import { useCountdown } from '../../shared/ui/hooks';
import { Figure } from '../../shared/ui/Figure';
import { Ring, Sheet } from '../../shared/ui/kit';
import { beep, unlockAudio } from '../../shared/ui/sound';
import { AbHow } from '../../shared/layout/content';
import { ABS } from './abs';
import type { PlayerProps } from '../types';

interface Step { item: CircuitItem; index: number; seconds: number; rest: number; label: string }

/** Items → steps: a two-sided item becomes two halves with a short switch between. */
export function circuitSteps(items: CircuitItem[]): Step[] {
  return items.flatMap((item, index) => item.sides
    ? [
      { item, index, seconds: Math.round(item.seconds / 2), rest: 3, label: [item.label, 'Vänster sida'].filter(Boolean).join(' · ') },
      { item, index, seconds: Math.round(item.seconds / 2), rest: item.rest, label: [item.label, 'Höger sida'].filter(Boolean).join(' · ') },
    ]
    : [{ item, index, seconds: item.seconds, rest: item.rest, label: item.label ?? '' }]);
}

export function CircuitPlayer({ plan, onProgress, onFinish }: PlayerProps) {
  const items = useMemo(() => (plan.content.kind === 'circuit' ? plan.content.items : []), [plan]);
  const steps = useMemo(() => circuitSteps(items), [items]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'work' | 'rest'>('ready');
  const [help, setHelp] = useState(false);
  const beeped = useRef(-1);
  const finish = useCallback((n: number) => onFinish({ kind: 'circuit', done: Math.min(items.length, n), total: items.length }), [onFinish, items.length]);

  const onEnd = useCallback(() => {
    vibrate([80, 60, 80]);
    const s = steps[i];
    if (phase === 'work') {
      if (i + 1 >= steps.length) { beep(2, 1046, 180); finish(items.length); return; }
      if (s.rest > 0) setPhase('rest'); else { setI(i + 1); }
    } else if (phase === 'rest') {
      setI(i + 1); setPhase('work');
    }
  }, [phase, i, steps, items.length, finish]);
  const cd = useCountdown(onEnd);

  useEffect(() => {
    beeped.current = -1;
    if (phase === 'work') { beep(1, 988, 160); cd.start(steps[i].seconds); }
    if (phase === 'rest') cd.start(steps[i].rest);
  }, [phase, i]); // eslint-disable-line react-hooks/exhaustive-deps
  // Count down the last three seconds of each interval.
  useEffect(() => {
    const left = Math.ceil(cd.left);
    if (phase !== 'ready' && cd.running && left <= 3 && left >= 1 && beeped.current !== left) { beeped.current = left; beep(1, 660, 90); }
  }, [cd.left, cd.running, phase]);
  useEffect(() => onProgress(steps.length ? (i + (phase === 'rest' ? 1 : 0)) / steps.length : 0), [i, phase, steps.length, onProgress]);

  const cur = steps[i];
  if (!cur) return null;
  const show = phase === 'rest' ? steps[i + 1] : cur;
  const a = ABS[show.item.id];
  const total = phase === 'rest' ? cur.rest : cur.seconds;
  const left = phase === 'ready' ? cur.seconds : cd.left;

  return (
    <div className="flex flex-1 flex-col">
      <Dim className="num">{phase === 'rest' ? `Vila · nästa ${show.index + 1} av ${items.length}` : `${cur.index + 1} av ${items.length}`}{show.label ? ` · ${show.label}` : ''}</Dim>
      <h1 className="mt-2 font-serif text-title">{show.item.name}</h1>
      <Dim className="mt-2 text-[16px] leading-snug">{show.item.cue}</Dim>
      <button onClick={() => setHelp(true)} className="mt-1 flex min-h-[40px] items-center gap-1.5 text-[15px] font-medium underline underline-offset-4" style={{ color: ON_DIM }}>
        <Info size={16} aria-hidden="true" /> Hur gör man?
      </button>
      <button onClick={() => setHelp(true)} className="mx-auto mt-1 block w-40" aria-label={`Visa hur man gör ${show.item.name.toLowerCase()}`}>
        <Figure anim={a?.anim} kind="gym" label={show.item.name} size="sm" onPillar />
      </button>

      <div className="flex flex-1 items-center justify-center py-4">
        <Ring progress={phase === 'ready' ? 1 : left / total} size={220} fill={phase === 'rest' ? 'rgb(var(--onpillar) / 0.6)' : ACCENT}>
          <div className="num text-[72px] font-semibold leading-none">{Math.ceil(left)}</div>
          <Dim className="text-[14px]">{phase === 'rest' ? 'vila' : phase === 'ready' ? 'sekunder' : 'kör'}</Dim>
        </Ring>
      </div>
      {phase === 'work' && <p className="mb-3 text-center text-[13px]" style={{ color: ON_DIM }}>Orkar du inte hela tiden? Pausa några sekunder och fortsätt.</p>}

      <div className="flex gap-3">
        {phase === 'ready' ? (
          <OnButton onClick={() => { unlockAudio(); setPhase('work'); }}><Play size={22} /> Starta</OnButton>
        ) : cd.running ? (
          <OnButton onClick={cd.pause}><Pause size={22} /> Paus</OnButton>
        ) : (
          <OnButton onClick={cd.resume}><Play size={22} /> Fortsätt</OnButton>
        )}
        <RoundButton size={64} label={phase === 'rest' ? 'Hoppa över vilan' : 'Nästa övning'} onClick={() => {
          cd.stop();
          if (phase === 'rest') { setI(i + 1); setPhase('work'); return; }
          if (i + 1 >= steps.length) finish(cur.index + 1); else { setI(i + 1); setPhase('work'); }
        }}><SkipForward size={22} /></RoundButton>
      </div>

      <Sheet open={help} onClose={() => setHelp(false)} title={show.item.name}>
        <AbHow id={show.item.id} />
      </Sheet>
    </div>
  );
}
