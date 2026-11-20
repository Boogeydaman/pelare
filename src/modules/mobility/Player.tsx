import { Pause, Play, SkipForward } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { vibrate } from '../../core/format';
import type { HoldItem } from '../../core/types';
import { Dim, OnButton, RoundButton } from '../../shared/player/parts';
import { useCountdown } from '../../shared/ui/hooks';
import { Figure } from '../../shared/ui/Figure';
import { Ring } from '../../shared/ui/kit';
import { STRETCH_ANIM } from './stretches';
import type { PlayerProps } from '../types';

interface Step { id: string; name: string; cue: string; seconds: number; label: string }
const SWITCH = 6;

export function MobilityPlayer({ plan, onProgress, onFinish }: PlayerProps) {
  const holds: HoldItem[] = plan.content.kind === 'mobility' ? plan.content.holds : [];
  const steps = useMemo<Step[]>(() => holds.flatMap((h) => Array.from({ length: h.rounds }, (_, r) =>
    (h.sides === 2 ? ['Vänster', 'Höger'] : ['']).map((side) => ({
      id: h.id, name: h.name, cue: h.cue, seconds: h.seconds,
      label: [h.rounds > 1 ? `Varv ${r + 1} av ${h.rounds}` : '', side].filter(Boolean).join(' · '),
    }))).flat()), [holds]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'hold' | 'switch'>('ready');
  const finish = useCallback((n: number) => onFinish({ kind: 'mobility', holdsDone: n }), [onFinish]);

  const onEnd = useCallback(() => {
    if (phase === 'hold') {
      vibrate([80, 60, 80]);
      if (i + 1 >= steps.length) { finish(steps.length); return; }
      setPhase('switch');
    } else if (phase === 'switch') {
      setI((x) => x + 1);
      setPhase('hold');
    }
  }, [phase, i, steps.length, finish]);
  const cd = useCountdown(onEnd);

  useEffect(() => {
    if (phase === 'hold') cd.start(steps[i].seconds);
    if (phase === 'switch') cd.start(SWITCH);
  }, [phase, i]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onProgress(steps.length ? (i + (phase === 'switch' ? 1 : 0)) / steps.length : 0), [i, phase, steps.length, onProgress]);

  const cur = phase === 'switch' ? steps[i + 1] : steps[i];
  if (!cur) return null;
  const total = phase === 'switch' ? SWITCH : cur.seconds;
  const left = phase === 'ready' ? cur.seconds : cd.left;

  return (
    <div className="flex flex-1 flex-col">
      <Dim className="num">{phase === 'switch' ? 'Nästa' : `${i + 1} av ${steps.length}`}{cur.label ? ` · ${cur.label}` : ''}</Dim>
      <h1 className="mt-2 font-serif text-title">{cur.name}</h1>
      <Dim className="mt-2 text-[16px] leading-snug">{cur.cue}</Dim>

      <div className="mx-auto mt-4 w-36"><Figure anim={STRETCH_ANIM[cur.id]} kind="mobility" label={cur.name} size="sm" onPillar /></div>

      <div className="flex flex-1 items-center justify-center py-6">
        <Ring progress={phase === 'ready' ? 1 : left / total} size={248}>
          <div className="num text-[76px] font-semibold leading-none" style={{ opacity: phase === 'switch' ? 0.6 : 1 }}>{Math.ceil(left)}</div>
          <Dim className="text-[14px]">{phase === 'switch' ? 'gör dig redo' : 'sekunder'}</Dim>
        </Ring>
      </div>

      <div className="flex gap-3">
        {phase === 'ready' ? (
          <OnButton onClick={() => setPhase('hold')}><Play size={22} /> Starta</OnButton>
        ) : cd.running ? (
          <OnButton onClick={cd.pause}><Pause size={22} /> Paus</OnButton>
        ) : (
          <OnButton onClick={cd.resume}><Play size={22} /> Fortsätt</OnButton>
        )}
        <RoundButton size={64} label="Nästa stretch" onClick={() => {
          cd.stop();
          if (i + 1 >= steps.length) finish(steps.length); else { setI(i + 1); setPhase('hold'); }
        }}><SkipForward size={22} /></RoundButton>
      </div>
    </div>
  );
}
