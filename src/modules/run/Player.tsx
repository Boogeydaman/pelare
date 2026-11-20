import { Pause, Play, SkipForward } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { fmtClock, vibrate } from '../../core/format';
import type { RunSegment } from '../../core/types';
import { Dim, ON, OnButton, RoundButton } from '../../shared/player/parts';
import { useCountdown } from '../../shared/ui/hooks';
import type { PlayerProps } from '../types';

const EFFORT_TEXT: Record<RunSegment['effort'], string> = {
  'hårt': 'Hårt – ungefär 8 av 10', 'gå': 'Gå', 'vila': 'Lugnt, återhämta dig', 'lugnt': 'Pratbart tempo',
};

export function RunPlayer({ plan, onProgress, onFinish }: PlayerProps) {
  const segments: RunSegment[] = plan.content.kind === 'run' ? plan.content.segments : [];
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(false);
  const finish = useCallback((done: number) => onFinish({ kind: 'run', segmentsDone: done }), [onFinish]);
  const advance = useCallback(() => {
    vibrate([250, 120, 250]);
    setI((x) => {
      if (x + 1 >= segments.length) { finish(segments.length); return x; }
      return x + 1;
    });
  }, [segments.length, finish]);
  const cd = useCountdown(advance);

  useEffect(() => { if (started && i > 0) cd.start(segments[i].seconds); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const seg = segments[i];
  const total = segments.reduce((a, s) => a + s.seconds, 0);
  const before = segments.slice(0, i).reduce((a, s) => a + s.seconds, 0);
  const left = started ? cd.left : seg?.seconds ?? 0;
  const p = Math.round(((before + ((seg?.seconds ?? 0) - left)) / Math.max(1, total)) * 200) / 200;
  useEffect(() => onProgress(p), [p, onProgress]);
  if (!seg) return null;

  return (
    <div className="flex flex-1 flex-col">
      <Dim>{EFFORT_TEXT[seg.effort]}</Dim>
      <h1 className="mt-2 font-serif text-title">{seg.label}</h1>

      <div className="flex flex-1 items-center justify-center">
        <div className="num text-[120px] font-semibold leading-none tracking-tight" aria-live="off">{fmtClock(left)}</div>
      </div>

      <div className="mb-6 flex h-8 items-end gap-[3px]" aria-hidden="true">
        {segments.map((sg, k) => (
          <div key={k} className="rounded-sm transition-all" style={{
            flex: sg.seconds, height: sg.effort === 'hårt' ? '100%' : sg.effort === 'gå' ? '35%' : '60%',
            background: k < i ? 'rgb(var(--onpillar) / 0.35)' : k === i ? ON : 'rgb(var(--onpillar) / 0.2)',
          }} />
        ))}
      </div>
      {segments[i + 1] && <Dim className="mb-4">Sedan: {segments[i + 1].label} · {fmtClock(segments[i + 1].seconds)}</Dim>}

      <div className="flex gap-3">
        {!started ? (
          <OnButton onClick={() => { setStarted(true); cd.start(seg.seconds); }}><Play size={22} /> Starta</OnButton>
        ) : cd.running ? (
          <OnButton onClick={cd.pause}><Pause size={22} /> Paus</OnButton>
        ) : (
          <OnButton onClick={cd.resume}><Play size={22} /> Fortsätt</OnButton>
        )}
        <RoundButton size={64} label="Nästa del" onClick={() => { cd.stop(); advance(); }}><SkipForward size={22} /></RoundButton>
      </div>
      <button onClick={() => { cd.stop(); finish(i); }} className="mt-3 min-h-[44px] text-[15px] underline underline-offset-4" style={{ color: 'rgb(var(--onpillar) / 0.72)' }}>
        Avsluta och logga
      </button>
    </div>
  );
}
