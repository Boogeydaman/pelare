// Leaving the rehab mode: the same basic questions as in the onboarding (those who chose rehab skipped
// them), filled in with what the profile has. Running stays as walking until the surgeon has cleared it.
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCtx } from '../core/ctx';
import { saveProfile } from '../core/db';
import { rehabPhase } from '../modules/common';
import { IconButton, Primary } from '../shared/ui/kit';
import { BasicQuestion, Q, type BasicStep, type Basics } from '../screens/Basics';
import { REHAB, rehabTint } from './content';
import { basicsFrom, leftRehab } from './state';

type Step = 'intro' | BasicStep;
const STEPS: Step[] = ['intro', 'gym', 'run', 'mobility', 'days', 'place'];

export function LeaveRehab() {
  const ctx = useCtx();
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const [b, setB] = useState<Basics | null>(null);
  const [cleared, setCleared] = useState(false);
  if (!ctx) return null;
  const p = ctx.profile;
  const ph = rehabPhase(p, ctx.now);
  if (ph === null || !p.rehab) return <Navigate to="/idag" replace />;
  const basics = b ?? basicsFrom(p);
  const step = STEPS[i];
  const wasCleared = !!p.rehab.cleared;
  const needsClearance = step === 'run' && basics.goals.run !== 'walk' && !wasCleared && !cleared;
  const back = () => (i === 0 ? nav(-1) : setI(i - 1));
  const finish = async () => {
    await saveProfile(leftRehab(p, { ...basics, cleared }, new Date()));
    nav('/idag', { replace: true });
  };

  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-lg flex-col px-6">
      <div className="flex items-center gap-4 py-2">
        <IconButton ariaLabel={i === 0 ? 'Tillbaka till rehabläget' : 'Tillbaka'} onClick={back}><ArrowLeft size={22} strokeWidth={1.75} /></IconButton>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-rule" role="progressbar" aria-valuenow={i} aria-valuemax={STEPS.length - 1}>
          <div className="h-full rounded-full bg-ink transition-all duration-300 ease-out" style={{ width: `${(i / (STEPS.length - 1)) * 100}%` }} />
        </div>
      </div>

      <div key={step} className="rise flex flex-1 flex-col pt-8">
        {step === 'intro' && (
          <Q title="Till hela Pelare">
            <p className="-mt-4 text-[17px] leading-snug">Svara på samma frågor som alla får första gången – om gym, löpning, rörlighet och var du tränar – så anpassar appen programmen efter dig. Det du svarat tidigare är redan ifyllt.</p>
            {(ph < 5 || !wasCleared) && (
              <p className="mt-5 rounded-2xl px-4 py-3 text-[15px] leading-snug" style={{ background: rehabTint(0.12) }}>
                {ph === 0 ? 'Du har inte opererats än. ' : `Du är i fas ${ph}. `}Den vanliga appen anpassar inte övningarna efter din höft – lämna bara om din fysioterapeut eller kirurg säger att du kan träna fritt.
              </p>
            )}
            <ul className="mt-5 space-y-2 text-[15px] leading-snug text-ink2">
              <li>Ditt rehabprogram, dina tester och det du läst sparas.</li>
              <li>Fortsätt gärna med abduktorövningarna – de är ofta svagare i ett par år.</li>
              <li>Du kan gå tillbaka när du vill: Inställningar → Träning efter höftprotes.</li>
            </ul>
          </Q>
        )}
        {step !== 'intro' && (
          <BasicQuestion step={step} b={basics} set={setB} walk
            runNote={!wasCleared && (
              basics.goals.run === 'walk'
                ? <p className="mt-6 text-[15px] leading-snug text-ink2">Löpning och hopp väntar tills din kirurg har gett klartecken – tre av fyra kirurger tillåter lätt jogging efter 6 månader. Du kan byta under Löpning → Program.</p>
                : (
                  <button onClick={() => setCleared(!cleared)} aria-pressed={cleared} className="mt-6 flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left" style={{ background: rehabTint(0.12) }}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={cleared ? { background: REHAB, color: 'rgb(var(--onpillar))' } : { border: `2px solid ${rehabTint(0.5)}` }}>{cleared && <Check size={15} aria-hidden="true" />}</span>
                    <span className="text-[15px] leading-snug">Min kirurg eller fysioterapeut har gett klartecken för löpning</span>
                  </button>
                )
            )} />
        )}
      </div>

      <div className="pt-6">
        {step === 'place'
          ? <Primary onClick={finish} disabled={basics.places.length === 0}>Gå till appen</Primary>
          : <Primary onClick={() => setI(i + 1)} disabled={needsClearance}>{needsClearance ? 'Bocka i klartecken eller välj promenader' : 'Fortsätt'}</Primary>}
      </div>
    </div>
  );
}
