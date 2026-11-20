import { useRef, useState } from 'react';
import { exportAll, importAll, removeSampleData, resetAll, saveProfile } from '../core/db';
import { useCtx } from '../core/ctx';
import { useTheme } from '../core/theme';
import type { Equip, Goals, Place } from '../core/types';
import { FOCUS_NAME, focusOf } from '../modules/mobility/planner';
import { MODULE_LIST } from '../modules/registry';
import { Page, Row, Section } from '../shared/layout/page';
import { OptionList, Primary, Segmented, Sheet } from '../shared/ui/kit';
import { GOAL_OPTIONS } from './Onboarding';

type Edit = keyof Goals | 'days' | 'places' | 'equipment' | 'reset' | null;
const EQUIP: { value: Equip; label: string }[] = [
  { value: 'dumbbell', label: 'Hantlar' }, { value: 'kettlebell', label: 'Kettlebell' }, { value: 'band', label: 'Gummiband' },
  { value: 'pullup_bar', label: 'Chinsstång' }, { value: 'bench', label: 'Bänk' },
];

export function Settings() {
  const ctx = useCtx();
  const [theme, setTheme] = useTheme();
  const [edit, setEdit] = useState<Edit>(null);
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
          <Row title="Var du tränar" right={p.places.map((x) => (x === 'gym' ? 'Gym' : 'Hemma')).join(', ')} onClick={() => setEdit('places')} />
          {p.places.includes('home') && <Row title="Utrustning hemma" right={p.homeEquipment.length ? `${p.homeEquipment.length} saker` : 'Ingen'} onClick={() => setEdit('equipment')} />}
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
          <Row title="Ta bort exempeldata" onClick={async () => { await removeSampleData(); setMsg('Exempeldatan är borttagen.'); }} />
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
            <OptionList value={p.goals[id]} options={GOAL_OPTIONS[id]} onChange={(v) => { save({ goals: { ...p.goals, [id]: v } as Goals }); setEdit(null); }} />
          </div>
        </Sheet>
      ))}
      <Sheet open={edit === 'days'} onClose={() => setEdit(null)} title="Dagar per vecka">
        <div className="pb-4"><OptionList value={p.daysPerWeek} options={[2, 3, 4, 5, 6].map((d) => ({ value: d, label: `${d} dagar` }))} onChange={(v) => { save({ daysPerWeek: v }); setEdit(null); }} /></div>
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
        <div className="pb-4"><Primary onClick={() => resetAll()}>Radera</Primary></div>
      </Sheet>
    </div>
  );
}
