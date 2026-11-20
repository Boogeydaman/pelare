import { ArrowLeft } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { saveProfile } from '../core/db';
import { useNavigate } from 'react-router-dom';
import type { Equip, Goals, MobilityFocus, ModuleId, Place, Profile } from '../core/types';
import { FOCUS_OPTIONS } from '../modules/mobility/FocusPicker';
import { RUN_PER_WEEK, gymProgramFor } from '../modules/common';
import { InstallCard } from '../shared/ui/InstallCard';
import { IconButton, Kicker, OptionList, Primary, color } from '../shared/ui/kit';

export const GOAL_OPTIONS: { [K in ModuleId]: { value: Goals[K]; label: string; hint: string }[] } = {
  gym: [
    { value: 'stronger', label: 'Bli starkare', hint: 'Tyngre vikter i grundlyften' },
    { value: 'muscle', label: 'Bygga muskler', hint: 'Mer volym, fler set' },
    { value: 'maintain', label: 'Hålla mig stark', hint: 'Minsta effektiva dos' },
  ],
  run: [
    { value: 'start', label: 'Dina första 5 km', hint: 'Från noll, med gå-spring · 7 veckor' },
    { value: '10k', label: 'Dina första 10 km', hint: 'Jag kan springa 30 min utan paus · 8 veckor' },
    { value: '15k', label: 'Dina första 15 km', hint: 'Jag springer redan 10 km · 10 veckor' },
    { value: '20k', label: 'Dina första 20 km', hint: 'Jag springer 10 km bekvämt · 12 veckor' },
    { value: '5k', label: 'Snabbare 5 km', hint: 'Jag springer redan 5 km' },
  ],
  mobility: [
    { value: 'front_split', label: 'Splitt framåt', hint: 'Baksida lår och höftböjare' },
    { value: 'side_split', label: 'Sidosplitt', hint: 'Insida lår och höfter' },
    { value: 'hips', label: 'Rörligare höfter', hint: 'För knäböj, löpning och vardag' },
    { value: 'general', label: 'Rörligare överlag', hint: 'Höfter, axlar och fotleder' },
  ],
};

type Step = 'welcome' | 'gym' | 'run' | 'mobility' | 'days' | 'place' | 'health';
const HEALTH = [
  'Har en läkare sagt att du har en hjärtsjukdom eller högt blodtryck?',
  'Får du ont i bröstet eller blir yr när du anstränger dig?',
  'Har du en skada eller sjukdom som kan bli sämre av träning?',
];
const MODULE_TITLE: Record<ModuleId, [string, string]> = {
  gym: ['Gym', 'Vad vill du få ut av styrketräningen?'],
  run: ['Löpning', 'Vad är ditt löpmål?'],
  mobility: ['Rörlighet', 'Vill du lägga extra fokus på något?'],
};

export function Onboarding() {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const [goals, setGoals] = useState<Goals>({ gym: 'stronger', run: 'start', mobility: 'front_split' });
  const [focus, setFocus] = useState<MobilityFocus[]>([]);
  const [gymDays, setGymDays] = useState(2);
  const [places, setPlaces] = useState<Place[]>(['gym']);
  const [equip, setEquip] = useState<Equip[]>([]);
  const [health, setHealth] = useState(HEALTH.map(() => false));
  const steps: Step[] = ['welcome', 'gym', 'run', 'mobility', 'days', 'place', 'health'];
  const step = steps[i];
  const next = () => setI((x) => Math.min(steps.length - 1, x + 1));

  const finish = async () => {
    const now = new Date().toISOString();
    const gymProgram = gymProgramFor(gymDays, places, equip);
    const legacy = focus.find((f): f is 'front_split' | 'side_split' | 'hips' => f === 'front_split' || f === 'side_split' || f === 'hips') ?? 'general';
    const profile: Profile = {
      goals: { ...goals, mobility: legacy }, daysPerWeek: gymDays + (RUN_PER_WEEK[goals.run] ?? 3), gymDays, places, homeEquipment: equip, createdAt: now, mobilityFocus: focus,
      enrollments: {
        gym: { programId: gymProgram, startedAt: now },
        run: { programId: goals.run, startedAt: now },
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
        {(step === 'gym' || step === 'run') && (
          <Q kicker={MODULE_TITLE[step][0]} kind={step} title={MODULE_TITLE[step][1]}>
            <OptionList value={goals[step]} options={GOAL_OPTIONS[step]} onChange={(v) => setGoals({ ...goals, [step]: v } as Goals)} />
          </Q>
        )}
        {step === 'mobility' && (
          <Q kicker={MODULE_TITLE.mobility[0]} kind="mobility" title={MODULE_TITLE.mobility[1]}>
            <p className="-mt-4 mb-4 text-[16px] text-ink2">Hela kroppen ingår alltid – axlar, rygg, höfter, ben och fotleder varje vecka. Välj gärna ett eller flera områden som ska få extra tid, eller inget alls.</p>
            <OptionList multi value={focus} options={FOCUS_OPTIONS} onChange={(v) => setFocus((f) => (f.includes(v) ? f.filter((x) => x !== v) : [...f, v]))} />
          </Q>
        )}
        {step === 'days' && (
          <Q kicker="Gym" kind="gym" title="Hur många gympass i veckan?">
            <OptionList value={gymDays} onChange={setGymDays} options={[
              { value: 1, label: '1 pass', hint: 'Bättre än inget – men två ger mer' },
              { value: 2, label: '2 pass', hint: 'Minsta effektiva dosen, och WHO:s rekommendation' },
              { value: 3, label: '3 pass', hint: 'Helkropp tre gånger i veckan' },
              { value: 4, label: '4 pass', hint: 'Över- och underkropp varannan gång' },
            ]} />
            <p className="mt-6 text-[16px] leading-snug text-ink2">
              Löpningen följer ditt löpprogram: <span className="font-medium text-ink">{RUN_PER_WEEK[goals.run] ?? 3} pass i veckan</span>.
              Totalt blir det <span className="font-medium text-ink">{gymDays + (RUN_PER_WEEK[goals.run] ?? 3)} pass i veckan</span>. Korta stretchpass räknas inte – de görs de flesta dagar.
            </p>
          </Q>
        )}
        {step === 'place' && (
          <Q title="Var tränar du?">
            <OptionList multi value={places} onChange={(v) => setPlaces((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))}
              options={[{ value: 'gym', label: 'På gym', hint: 'Skivstång, hantlar och maskiner' }, { value: 'home', label: 'Hemma', hint: 'Kroppsvikt, eller det du har' }]} />
            {places.includes('home') && (
              <div className="mt-8">
                <div className="mb-1 text-[14px] text-ink2">Vad har du hemma?</div>
                <OptionList multi value={equip} onChange={(v) => setEquip((e) => (e.includes(v) ? e.filter((x) => x !== v) : [...e, v]))}
                  options={[{ value: 'dumbbell', label: 'Hantlar' }, { value: 'band', label: 'Gummiband' }, { value: 'pullup_bar', label: 'Chinsstång' }]} />
              </div>
            )}
          </Q>
        )}
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
          : <Primary onClick={next} disabled={step === 'place' && places.length === 0}>Fortsätt</Primary>}
      </div>
    </div>
  );
}

function Q({ kicker, kind, title, children }: { kicker?: string; kind?: ModuleId; title: string; children: ReactNode }) {
  return (
    <div>
      {kicker && <Kicker kind={kind} className="mb-3">{kicker}</Kicker>}
      <h1 className="mb-8 font-serif text-title">{title}</h1>
      {children}
    </div>
  );
}
