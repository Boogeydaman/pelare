import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { saveProfile } from '../core/db';
import { useNavigate } from 'react-router-dom';
import type { Goals, HipRehab, Profile } from '../core/types';
import { HipDetails } from '../modules/gym/HipRehab';
import { RUN_PER_WEEK, gymProgramFor } from '../modules/common';
import { InstallCard } from '../shared/ui/InstallCard';
import { IconButton, OptionList, Primary, color } from '../shared/ui/kit';
import { BasicQuestion, Q, mobilityGoal, type Basics, type BasicStep } from './Basics';

export { GOAL_OPTIONS } from './Basics';

type Step = 'welcome' | 'rehab' | 'rehabinfo' | 'gym' | 'run' | 'mobility' | 'days' | 'place' | 'health';
const HEALTH = [
  'Har en läkare sagt att du har en hjärtsjukdom eller högt blodtryck?',
  'Får du ont i bröstet eller blir yr när du anstränger dig?',
  'Har du en skada eller sjukdom som kan bli sämre av träning?',
];
export function Onboarding() {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const [b, setB] = useState<Basics>({ goals: { gym: 'stronger', run: 'start', mobility: 'front_split' }, focus: [], gymDays: 2, places: ['gym'], equip: [] });
  const { goals, focus, gymDays, places, equip } = b;
  const [health, setHealth] = useState(HEALTH.map(() => false));
  // Training after a hip replacement: asked first; then the date, side and approach decide the programme.
  const [hip, setHip] = useState(false);
  const [surgery, setSurgery] = useState('');
  const [info, setInfo] = useState<Partial<HipRehab>>({ side: 'höger', approach: 'okand', restrictions: 'okand', weightBearing: 'full' });
  const steps: Step[] = hip
    ? ['welcome', 'rehab', 'rehabinfo', 'place', 'health']
    : ['welcome', 'rehab', 'gym', 'run', 'mobility', 'days', 'place', 'health'];
  const step = steps[i];
  const next = () => setI((x) => Math.min(steps.length - 1, x + 1));

  const finish = async () => {
    const now = new Date().toISOString();
    const gymProgram = hip ? 'hip_rehab' : gymProgramFor(gymDays, places, equip);
    const runGoal: Goals['run'] = hip ? 'walk' : goals.run;
    const legacy = mobilityGoal(focus);
    const profile: Profile = {
      goals: { ...goals, run: runGoal, mobility: legacy }, daysPerWeek: gymDays + (RUN_PER_WEEK[runGoal] ?? 3), gymDays: hip ? 3 : gymDays, places, homeEquipment: equip, createdAt: now, mobilityFocus: focus,
      ...(hip ? { rehab: { side: 'höger' as const, approach: 'okand' as const, ...info, kind: 'hip' as const, surgery, passed: {} } } : {}),
      enrollments: {
        gym: { programId: gymProgram, startedAt: now },
        run: { programId: runGoal, startedAt: now },
        mobility: { programId: 'whole', startedAt: now },
      },
    };
    await saveProfile(profile);
    // Always land on Idag – onboarding can start from any address (e.g. after "Radera all data" in Settings).
    nav('/idag', { replace: true });
  };

  if (step === 'welcome') {
    return (
      <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-lg flex-col px-6">
        <div className="flex flex-1 flex-col justify-end pb-10">
          <div className="mb-10 flex h-24 items-end gap-2" aria-hidden="true">
            {(['gym', 'run', 'mobility'] as const).map((p, k) => (
              <div key={p} className="rise w-5 rounded-[4px]" style={{ height: `${[70, 100, 55][k]}%`, background: color(p), animationDelay: `${k * 90}ms` }} />
            ))}
          </div>
          <h1 className="rise font-serif text-[64px] leading-[0.9] tracking-tight" style={{ animationDelay: '200ms' }}>Pelare</h1>
          <p className="rise mt-4 max-w-[24ch] text-[19px] leading-snug text-ink2" style={{ animationDelay: '280ms' }}>
            Gym, löpning och rörlighet – tre program, en plan.
          </p>
        </div>
        <div className="mb-4"><InstallCard dismissible={false} /></div>
        <Primary onClick={next}>Kom igång</Primary>
      </div>
    );
  }

  return (
    <div className="safe-top safe-bottom mx-auto flex min-h-full max-w-lg flex-col px-6">
      <div className="flex items-center gap-4 py-2">
        <IconButton ariaLabel="Tillbaka" onClick={() => setI((x) => x - 1)}><ArrowLeft size={22} strokeWidth={1.75} /></IconButton>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-rule" role="progressbar" aria-valuenow={i} aria-valuemax={steps.length - 1}>
          <div className="h-full rounded-full bg-ink transition-all duration-300 ease-out" style={{ width: `${(i / (steps.length - 1)) * 100}%` }} />
        </div>
      </div>

      <div key={step} className="rise flex flex-1 flex-col pt-8">
        {step === 'rehab' && (
          <Q title="Råkar du heta Anders och behöver specialanpassad träning efter din höftledsoperation?">
            <OptionList value={hip ? 'yes' : 'no'} onChange={(v) => setHip(v === 'yes')} options={[
              { value: 'yes', label: 'Ja, träning efter höftprotes', hint: 'Förberedelser före operationen, fem faser efteråt med kriterier, tester och en lärobok' },
              { value: 'no', label: 'Nej, vanlig träning', hint: 'Gym, löpning och rörlighet' },
            ]} />
          </Q>
        )}
        {step === 'rehabinfo' && (
          <Q kicker="Höftprotes" kind="gym" title="Berätta lite om operationen">
            <label className="block">
              <span className="mb-1 block text-[14px] text-ink2">Datum för operationen – har du inte opererats än, välj det planerade datumet så får du förberedelser</span>
              <input type="date" value={surgery} onChange={(e) => setSurgery(e.target.value)} aria-label="Datum för operationen"
                className="h-12 w-full rounded-2xl bg-ink/[0.06] px-4 text-[17px] outline-none focus:ring-2 focus:ring-ink" />
            </label>
            <div className="mt-6"><HipDetails r={info} set={(x) => setInfo({ ...info, ...x })} compact /></div>
            <p className="mt-6 text-[14px] text-ink2">Fixation och fler detaljer kan du lägga till under Inställningar. Allt står i operationsberättelsen i 1177 Journalen.</p>
            <p className="mt-6 rounded-2xl bg-ink/[0.06] p-4 text-[14px] leading-snug">Appen ersätter inte din kirurg eller fysioterapeut. Följ alltid de restriktioner och det program du fått från dem – Pelare hjälper dig att hålla igång och bygga vidare.</p>
          </Q>
        )}
        {(step === 'gym' || step === 'run' || step === 'mobility' || step === 'days' || step === 'place') && <BasicQuestion step={step as BasicStep} b={b} set={setB} />}
        {step === 'health' && (
          <Q title="Innan vi börjar">
            {HEALTH.map((q, k) => (
              <div key={q} className={`flex items-center justify-between gap-4 py-4 ${k > 0 ? 'border-t border-rule' : ''}`}>
                <span className="text-[16px]">{q}</span>
                <button role="switch" aria-checked={health[k]} aria-label={q} onClick={() => setHealth((h) => h.map((x, j) => (j === k ? !x : x)))}
                  className={`relative h-8 w-14 shrink-0 rounded-full transition ${health[k] ? 'bg-ink' : 'bg-rule'}`}>
                  <span className={`absolute top-1 h-6 w-6 rounded-full bg-paper transition-all ${health[k] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
            {health.some(Boolean) && <p className="mt-4 rounded-2xl bg-ink/[0.06] p-4 text-[15px]">Prata med en läkare innan du börjar träna hårdare. Du kan använda appen ändå – börja lugnt.</p>}
          </Q>
        )}
      </div>

      <div className="pt-6">
        {step === 'health' ? <Primary onClick={finish}>Visa dagens pass</Primary>
          : <Primary onClick={next} disabled={(step === 'place' && places.length === 0) || (step === 'rehabinfo' && !surgery)}>Fortsätt</Primary>}
      </div>
    </div>
  );
}
