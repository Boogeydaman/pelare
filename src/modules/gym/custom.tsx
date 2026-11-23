// Your own exercises: stored on the phone and added to the library, the swap list and the diary.
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { saveCustomExercises, useCustomExercises, uid } from '../../core/db';
import { Page } from '../../shared/layout/page';
import { Field, NumberInput, TextInput, parseNum } from '../../shared/ui/fields';
import { OptionList, Primary } from '../../shared/ui/kit';
import { EX, EXERCISES, GROUPS, MUSCLE_NAME, type Exercise, type Group, type Muscle, type Need } from './exercises';
import { HOWTO } from './howto';

export interface CustomExercise extends Exercise { how: string[]; custom: true }

const ANIM_FOR: Record<Group, string> = { Ben: 'squat', Bröst: 'bench', Rygg: 'row', Axlar: 'ohp', Armar: 'curl', Mage: 'crunch', Färdighet: 'stand' };
const ALL_MUSCLES = Object.keys(MUSCLE_NAME) as Muscle[];
const NEEDS: { value: Need; label: string }[] = [
  { value: 'barbell', label: 'Skivstång' }, { value: 'dumbbell', label: 'Hantlar' }, { value: 'cable', label: 'Kabel' }, { value: 'machine', label: 'Maskin' },
  { value: 'bench', label: 'Bänk' }, { value: 'pullup_bar', label: 'Chinsstång' }, { value: 'dip_bars', label: 'Dipsställning' }, { value: 'band', label: 'Gummiband' },
];

const registered = new Set<string>();
/** Adds (or updates, or removes) your own exercises in the shared exercise list. Idempotent. */
export function registerCustom(list: CustomExercise[]) {
  const ids = new Set(list.map((e) => e.id));
  for (const id of [...registered]) {
    if (ids.has(id)) continue;
    const k = EXERCISES.findIndex((e) => e.id === id);
    if (k >= 0) EXERCISES.splice(k, 1);
    delete EX[id]; delete HOWTO[id]; registered.delete(id);
  }
  for (const e of list) {
    const k = EXERCISES.findIndex((x) => x.id === e.id);
    if (k >= 0) EXERCISES[k] = e; else EXERCISES.push(e);
    EX[e.id] = e;
    HOWTO[e.id] = { anim: ANIM_FOR[e.group] ?? 'stand', how: e.how.length ? e.how : [e.cue] };
    registered.add(e.id);
  }
}
export const isCustom = (id: string) => registered.has(id);

/** Add or edit your own exercise (#/gym/egen-ovning, #/gym/egen-ovning/:id). */
export function CustomExercisePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const list = useCustomExercises();
  if (!list) return null;
  const existing = id ? list.find((e) => e.id === id) : undefined;
  return <Form key={existing?.id ?? 'new'} existing={existing} onSave={async (e) => {
    await saveCustomExercises([...list.filter((x) => x.id !== e.id), e]);
    nav(`/gym/bibliotek/${e.id}`, { replace: true });
  }} onDelete={existing ? async () => {
    await saveCustomExercises(list.filter((x) => x.id !== existing.id));
    nav('/gym/bibliotek', { replace: true });
  } : undefined} />;
}

function Form({ existing, onSave, onDelete }: { existing?: CustomExercise; onSave: (e: CustomExercise) => void; onDelete?: () => void }) {
  const [name, setName] = useState(existing?.name ?? '');
  const [group, setGroup] = useState<Group>(existing?.group ?? 'Bröst');
  const [muscles, setMuscles] = useState<Muscle[]>(existing?.primary ?? []);
  const [needs, setNeeds] = useState<Need[]>(existing?.needs ?? []);
  const [lo, setLo] = useState(String(existing?.reps[0] ?? 8));
  const [hi, setHi] = useState(String(existing?.reps[1] ?? 12));
  const [step, setStep] = useState(String(existing?.step ?? 2.5).replace('.', ','));
  const [cue, setCue] = useState(existing?.cue ?? '');
  const [how, setHow] = useState((existing?.how ?? []).join('\n'));
  const toggle = <T,>(l: T[], v: T) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]);
  const ok = name.trim().length > 1 && muscles.length > 0;

  const save = () => {
    const r0 = Math.max(1, Math.round(parseNum(lo) ?? 8)), r1 = Math.max(r0, Math.round(parseNum(hi) ?? 12));
    const kg = Math.max(0, parseNum(step) ?? 2.5);
    const steps = how.split('\n').map((x) => x.trim()).filter(Boolean);
    const c = cue.trim() || steps[0] || name.trim();
    onSave({
      id: existing?.id ?? `c_${uid()}`, custom: true, name: name.trim(), group, primary: muscles, secondary: [], needs,
      compound: muscles.length > 1, reps: [r0, r1], step: kg, rest: muscles.length > 1 ? 120 : 75,
      cue: c, tips: ['Kontrollerad nedfart', 'Sista setet nära failure', 'Logga varje pass så följer appen din utveckling'], how: steps.length ? steps : [c],
      why: 'Din egen övning.',
    });
  };

  return (
    <Page kicker="Gym" kind="gym" title={existing ? 'Ändra övning' : 'Egen övning'} back="/gym/bibliotek">
      <div className="flex flex-col gap-6">
        <Field label="Namn"><TextInput value={name} onChange={setName} placeholder="t.ex. Landmine press" ariaLabel="Namn" /></Field>
        <div>
          <div className="mb-1 text-[14px] text-ink2">Grupp</div>
          <OptionList value={group} options={GROUPS.map((g) => ({ value: g, label: g }))} onChange={setGroup} />
        </div>
        <div>
          <div className="mb-1 text-[14px] text-ink2">Muskler som tränas mest</div>
          <OptionList multi value={muscles} options={ALL_MUSCLES.map((m) => ({ value: m, label: MUSCLE_NAME[m] }))} onChange={(v) => setMuscles((l) => toggle(l, v))} />
        </div>
        <div>
          <div className="mb-1 text-[14px] text-ink2">Utrustning (inget valt = kroppsvikt)</div>
          <OptionList multi value={needs} options={NEEDS} onChange={(v) => setNeeds((l) => toggle(l, v))} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Reps från"><NumberInput value={lo} onChange={setLo} ariaLabel="Reps från" /></Field>
          <Field label="till"><NumberInput value={hi} onChange={setHi} ariaLabel="Reps till" /></Field>
          <Field label="Ökning"><NumberInput value={step} onChange={setStep} unit="kg" decimal ariaLabel="Viktökning i kg" /></Field>
        </div>
        <Field label="Kort instruktion (visas under passet)"><TextInput value={cue} onChange={setCue} placeholder="t.ex. Armbågarna nära kroppen" ariaLabel="Kort instruktion" /></Field>
        <label className="block">
          <span className="mb-1 block text-[14px] text-ink2">Så gör du – ett steg per rad</span>
          <textarea value={how} onChange={(e) => setHow(e.target.value)} rows={5} aria-label="Så gör du"
            className="w-full rounded-2xl bg-ink/[0.06] px-4 py-3 text-[16px] leading-snug outline-none focus:ring-2 focus:ring-ink" />
        </label>
        <Primary kind="gym" disabled={!ok} onClick={save}>Spara övningen</Primary>
        {onDelete && (
          <button onClick={onDelete} className="flex h-12 items-center justify-center gap-2 rounded-full border border-rule text-[15px] font-medium text-gym">
            <Trash2 size={16} aria-hidden="true" /> Ta bort övningen
          </button>
        )}
        <p className="pb-6 text-[13px] text-ink2">Din övning hamnar i biblioteket och dyker upp som alternativ när du byter övning under ett pass med samma muskler. Vikter och rekord följs som för alla andra övningar.</p>
      </div>
    </Page>
  );
}

/** Top of the gym library: add your own. */
export function GymLibraryActions() {
  return (
    <Link to="/gym/egen-ovning" className="mt-4 flex min-h-[48px] items-center justify-center rounded-full border border-rule text-[15px] font-medium">
      + Lägg till egen övning
    </Link>
  );
}
