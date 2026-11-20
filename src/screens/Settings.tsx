import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { exportAll, importAll, removeSampleData, resetAll, saveProfile } from '../core/db';
import { useCtx } from '../core/ctx';
import { useTheme } from '../core/theme';
import type { Equip, Goals, Place } from '../core/types';
import { FOCUS_NAME, focusOf } from '../modules/mobility/planner';
import { MODULE_LIST } from '../modules/registry';
import { Page, Row, Section } from '../shared/layout/page';
import { InstallCard } from '../shared/ui/InstallCard';
import { OptionList, Primary, Segmented, Sheet } from '../shared/ui/kit';
import { GOAL_OPTIONS } from './Onboarding';
import { WEEKDAYS } from '../core/week';

type Edit = keyof Goals | 'days' | 'weekdays' | 'places' | 'equipment' | 'reset' | null;
const EQUIP: { value: Equip; label: string }[] = [
  { value: 'dumbbell', label: 'Hantlar' }, { value: 'kettlebell', label: 'Kettlebell' }, { value: 'band', label: 'Gummiband' },
  { value: 'pullup_bar', label: 'Chinsstång' }, { value: 'bench', label: 'Bänk' },
];

export function Settings() {
  const ctx = useCtx();
  const nav = useNavigate();
  const [theme, setTheme] = useTheme();
  const loc = useLocation();
  const [edit, setEdit] = useState<Edit>(loc.hash === '#dagar' ? 'weekdays' : null);
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);
  if (!ctx) return null;
  const p = ctx.profile;
  const save = (patch: Partial<typeof p>) => saveProfile({ ...p, ...patch });
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="safe-top mx-auto max-w-lg px-6">
      <Page title="Inställningar" back="/idag">
        <Section title="Mål" className="mt-0">
          {MODULE_LIST.filter((m) => m.id !== 'mobility').map((m) => (
            <Row key={m.id} kind={m.id} title={m.name} right={GOAL_OPTIONS[m.id].find((o) => o.value === p.goals[m.id])?.label} onClick={() => setEdit(m.id)} />
          ))}
          <Row kind="mobility" title="Rörlighet" right={focusOf(p).length ? `Hela kroppen + ${focusOf(p).map((f) => FOCUS_NAME[f].toLowerCase()).join(', ')}` : 'Hela kroppen'} to="/rorlighet/program" />
        </Section>

        <Section title="Program">
          {MODULE_LIST.map((m) => (
            <Row key={m.id} title={m.name} right={m.programs.find((x) => x.id === p.enrollments[m.id]?.programId)?.name ?? m.programs[0].name} to={`/${m.slug}/program`} />
          ))}
        </Section>

        <Section title="Träning">
          <Row title="Dagar per vecka" right={String(p.daysPerWeek)} onClick={() => setEdit('days')} />
          <Row title="Träningsdagar" right={p.trainingDays?.length ? [...p.trainingDays].sort().map((d) => WEEKDAYS[d]).join(', ') : 'Automatiskt'} onClick={() => setEdit('weekdays')} />
          <Row title="Var du tränar" right={p.places.map((x) => (x === 'gym' ? 'Gym' : 'Hemma')).join(', ')} onClick={() => setEdit('places')} />
          {p.places.includes('home') && <Row title="Utrustning hemma" right={p.homeEquipment.length ? `${p.homeEquipment.length} saker` : 'Ingen'} onClick={() => setEdit('equipment')} />}
        </Section>

        <Section title="App">
          <div className="border-t border-rule pt-4"><InstallCard dismissible={false} /></div>
          <p className="pt-3 text-[14px] text-ink2">Redan installerad? Då syns inget här. Din data ligger i telefonens lagring och skickas aldrig någonstans.</p>
          <p className="num pt-2 text-[14px] text-ink2">Version {__APP_VERSION__}</p>
        </Section>

        <Section title="Utseende">
          <div className="border-t border-rule py-4">
            <Segmented label="Tema" value={theme} onChange={setTheme}
              options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Ljust' }, { value: 'dark', label: 'Mörkt' }]} />
          </div>
        </Section>

        <Section title="Data">
          <Row title="Exportera säkerhetskopia" right="JSON" onClick={exportAll} />
          <Row title="Importera säkerhetskopia" onClick={() => file.current?.click()} />
          {ctx.logs.some((l) => l.sample) && <Row title="Ta bort exempeldata" onClick={async () => { await removeSampleData(); setMsg('Exempeldatan är borttagen.'); }} />}
          <Row title={<span className="text-gym">Radera all data</span>} onClick={() => setEdit('reset')} />
          <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setMsg((await importAll(f)) ? 'Säkerhetskopian är inläst.' : 'Filen kunde inte läsas.');
            e.target.value = '';
          }} />
          {msg && <p className="pt-3 text-[15px]" role="status">{msg}</p>}
        </Section>
        <p className="mt-8 text-[13px] text-ink2">All data sparas bara i den här telefonen.</p>
      </Page>

      {(['gym', 'run'] as const).map((id) => (
        <Sheet key={id} open={edit === id} onClose={() => setEdit(null)} title="Mål">
          <div className="pb-4">
            <OptionList value={p.goals[id]} options={GOAL_OPTIONS[id]} onChange={(v) => {
              // A new running goal starts that program from week 1.
              const enrollments = id === 'run' && v !== p.goals.run ? { ...p.enrollments, run: { programId: v as string, startedAt: new Date().toISOString() } } : p.enrollments;
              save({ goals: { ...p.goals, [id]: v } as Goals, enrollments }); setEdit(null);
            }} />
          </div>
        </Sheet>
      ))}
      <Sheet open={edit === 'days'} onClose={() => setEdit(null)} title="Dagar per vecka">
        <div className="pb-4"><OptionList value={p.daysPerWeek} options={[2, 3, 4, 5, 6].map((d) => ({ value: d, label: `${d} dagar` }))} onChange={(v) => { save({ daysPerWeek: v }); setEdit(null); }} /></div>
      </Sheet>
      <Sheet open={edit === 'weekdays'} onClose={() => setEdit(null)} title="Träningsdagar">
        <div className="pb-4">
          <p className="mb-4 text-[15px] leading-snug text-ink2">Välj dagar som brukar passa för gym och löpning. Planen lägger passen där, och använder andra dagar bara om veckan inte går ihop. Inga valda dagar = passen sprids ut jämnt.</p>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((label, i) => {
              const on = p.trainingDays?.includes(i) ?? false;
              return (
                <button key={i} aria-pressed={on} onClick={() => save({ trainingDays: toggle(p.trainingDays ?? [], i).sort() })}
                  className={`h-12 rounded-2xl text-[14px] font-medium ${on ? 'bg-ink text-paper' : 'bg-ink/[0.06]'}`}>{label}</button>
              );
            })}
          </div>
          <p className="mt-3 text-[13px] text-ink2">{p.trainingDays?.length ? `${p.trainingDays.length} dagar valda. Du har ${p.daysPerWeek} träningsdagar i veckan.` : 'Automatiskt'}</p>
          <div className="mt-4 flex gap-3">
            {!!p.trainingDays?.length && <button onClick={() => save({ trainingDays: [] })} className="h-12 flex-1 rounded-full bg-ink/[0.06] text-[15px] font-medium">Rensa</button>}
            <div className="flex-1"><Primary onClick={() => setEdit(null)}>Klar</Primary></div>
          </div>
        </div>
      </Sheet>
      <Sheet open={edit === 'places'} onClose={() => setEdit(null)} title="Var du tränar">
        <div className="pb-4"><OptionList<Place> multi value={p.places} options={[{ value: 'gym', label: 'Gym' }, { value: 'home', label: 'Hemma' }]}
          onChange={(v) => { const n = toggle(p.places, v); if (n.length) save({ places: n }); }} /></div>
      </Sheet>
      <Sheet open={edit === 'equipment'} onClose={() => setEdit(null)} title="Utrustning hemma">
        <div className="pb-4"><OptionList<Equip> multi value={p.homeEquipment} options={EQUIP} onChange={(v) => save({ homeEquipment: toggle(p.homeEquipment, v) })} /></div>
      </Sheet>
      <Sheet open={edit === 'reset'} onClose={() => setEdit(null)} title="Radera allt?">
        <p className="mb-6 text-[16px]">Profil, pass och tester tas bort från telefonen. Det går inte att ångra.</p>
        <div className="pb-4"><Primary onClick={async () => { await resetAll(); nav('/idag', { replace: true }); }}>Radera</Primary></div>
      </Sheet>
    </div>
  );
}
