// Hip rehab UI: the status/safety card on I dag and the settings section.
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCtx } from '../../core/ctx';
import { saveProfile } from '../../core/db';
import type { HipApproach, HipFixation, HipRehab, Profile } from '../../core/types';
import { OptionList } from '../../shared/ui/kit';
import { REHAB_PHASES, phaseOf, rehabPhase, weeksFromSurgery } from '../common';
import { resumeRehab, undoPhase } from '../../rehab/state';
import { WARNINGS } from '../../rehab/criteria';
import { precautions } from './hip';

export function HipRehabCard() {
  const ctx = useCtx();
  const [open, setOpen] = useState(false);
  if (!ctx) return null;
  const ph = rehabPhase(ctx.profile, ctx.now);
  if (ph === null) return null;
  const w = weeksFromSurgery(ctx.profile, ctx.now);
  const r = ctx.profile.rehab!;
  const restrict = precautions(ctx.profile, ctx.now);
  const urgent = WARNINGS.filter((x) => x.urgent);
  return (
    <section className="mt-4 rounded-[22px] px-5 py-4" style={{ background: 'rgb(var(--rehab) / 0.1)' }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium" style={{ color: 'rgb(var(--rehab))' }}>{ph === 0 ? 'Inför höftprotes' : 'Efter höftprotes'} · {r.side} höft</span>
        <span className="num text-[13px] text-ink2">{ph === 0 ? `om ${Math.ceil(-w * 7)} dagar` : `vecka ${Math.floor(w) + 1}`}</span>
      </div>
      <div className="mt-1 text-[18px] font-semibold">{ph === 0 ? 'Före operationen' : `Fas ${ph} av 5: ${phaseOf(ph).name}`}</div>
      {ph > 0 && (
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {REHAB_PHASES.map((p) => <span key={p.n} className="h-1.5 flex-1 rounded-full" style={{ background: p.n <= ph ? 'rgb(var(--rehab))' : 'rgb(var(--rehab) / 0.18)' }} />)}
        </div>
      )}
      {r.holdPhase && <p className="mt-2 text-[13px] text-ink2">Du har valt att stanna kvar i fas {r.holdPhase}.</p>}
      {restrict && <p className="mt-3 text-[14px] leading-snug">{restrict}</p>}
      {ph > 0 && (
        <>
          <button onClick={() => setOpen(!open)} aria-expanded={open} className="mt-3 flex min-h-[40px] w-full items-center justify-between text-left text-[15px] font-medium">
            Varningstecken – när du ska söka vård <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {open && (
            <ul className="mt-1 space-y-2 text-[14px] leading-snug">
              {urgent.map((x) => <li key={x.title}><b>{x.title}:</b> {x.signs} <b>{x.act}</b></li>)}
              <li><Link to="/rehab/las/varning" className="underline underline-offset-4">Alla varningssignaler</Link></li>
            </ul>
          )}
        </>
      )}
      <div className="mt-2 flex gap-4 text-[14px]">
        <Link to="/rehab/las" className="font-medium underline underline-offset-4">Läroboken</Link>
        <Link to="/installningar#hoft" className="text-ink2 underline underline-offset-4">Ändra uppgifter</Link>
      </div>
    </section>
  );
}

const APPROACHES = [
  { value: 'bakre' as const, label: 'Bakre snitt', hint: 'Posteriort – vanligast i Sverige' },
  { value: 'sido' as const, label: 'Sidosnitt', hint: 'Direkt lateralt, Hardinge eller anterolateralt' },
  { value: 'framre' as const, label: 'Främre snitt', hint: 'Anteriort, DAA' },
  { value: 'okand' as const, label: 'Vet inte', hint: 'Står i operationsberättelsen i 1177 Journalen' },
];
const FIXATIONS = [
  { value: 'cementerad' as const, label: 'Cementerad' }, { value: 'ocementerad' as const, label: 'Ocementerad' },
  { value: 'hybrid' as const, label: 'Hybrid' }, { value: 'omvand' as const, label: 'Omvänd hybrid' }, { value: 'okand' as const, label: 'Vet inte' },
];

/** The operation questions – shared by onboarding and settings. */
export function HipDetails({ r, set, compact }: { r: Partial<HipRehab>; set: (p: Partial<HipRehab>) => void; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-1 text-[14px] text-ink2">Vilken höft?</div>
        <OptionList value={r.side ?? 'höger'} onChange={(v) => set({ side: v })} options={[{ value: 'höger', label: 'Höger' }, { value: 'vänster', label: 'Vänster' }]} />
      </div>
      <div>
        <div className="mb-1 text-[14px] text-ink2">Snitt – styr vad du ska vara försiktig med</div>
        <OptionList value={r.approach ?? 'okand'} onChange={(v: HipApproach) => set({ approach: v })} options={APPROACHES} />
      </div>
      <div>
        <div className="mb-1 text-[14px] text-ink2">Fick du rörelserestriktioner?</div>
        <OptionList value={r.restrictions ?? 'okand'} onChange={(v) => set({ restrictions: v })} options={[
          { value: 'ordinerade', label: 'Ja', hint: 'Till exempel inte böja över 90° eller korsa benen' },
          { value: 'inga', label: 'Nej, inga restriktioner' },
          { value: 'okand', label: 'Vet inte än' },
        ]} />
      </div>
      <div>
        <div className="mb-1 text-[14px] text-ink2">Får du belasta benet fullt?</div>
        <OptionList value={r.weightBearing ?? 'full'} onChange={(v) => set({ weightBearing: v })} options={[
          { value: 'full', label: 'Ja, fullt eller efter förmåga', hint: 'Det vanliga – för både cementerad och ocementerad protes' },
          { value: 'partiell', label: 'Nej, bara delvis', hint: 'Appen väljer övningar på två ben tills du ändrar' },
        ]} />
      </div>
      {!compact && (
        <>
          <div>
            <div className="mb-1 text-[14px] text-ink2">Fixation</div>
            <OptionList value={r.fixation ?? 'okand'} onChange={(v: HipFixation) => set({ fixation: v })} options={FIXATIONS} />
          </div>
          {r.approach === 'bakre' && (
            <div>
              <div className="mb-1 text-[14px] text-ink2">Reparerades kapseln?</div>
              <OptionList value={r.capsule ?? 'okand'} onChange={(v) => set({ capsule: v })} options={[{ value: 'ja', label: 'Ja' }, { value: 'nej', label: 'Nej' }, { value: 'okand', label: 'Vet inte' }]} />
            </div>
          )}
          <Toggle on={!!r.dualMobility} onClick={() => set({ dualMobility: !r.dualMobility })} title="Dual mobility-protes" sub="Ett rörligt inlägg som ger extra skydd mot luxation" />
        </>
      )}
    </div>
  );
}

function Toggle({ on, onClick, title, sub }: { on: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} className="flex min-h-[48px] items-center justify-between gap-4 text-left">
      <span><span className="block text-[16px] font-medium">{title}</span><span className="block text-[13px] text-ink2">{sub}</span></span>
      <span className="shrink-0 text-[15px] text-ink2">{on ? 'Ja' : 'Nej'}</span>
    </button>
  );
}

/** Settings: start, adjust or end the hip rehab mode. */
export function HipRehabSettings() {
  const ctx = useCtx();
  if (!ctx) return null;
  const p = ctx.profile;
  const r = p.rehab;
  const set = (patch: Partial<HipRehab>) => saveProfile({ ...p, rehab: { ...(r ?? { kind: 'hip', surgery: new Date().toISOString().slice(0, 10), side: 'höger', approach: 'okand' }), ...patch } });
  const start = () => resumeRehab(p, { kind: 'hip', surgery: new Date().toISOString().slice(0, 10), side: 'höger', approach: r?.approach ?? 'okand', passed: {} });
  if (!r || r.ended) {
    return (
      <div className="border-t border-rule pt-3">
        <p className="text-[14px] text-ink2">{r ? `Du lämnade rehabläget. Operationen den ${r.surgery}, dina tester och det du läst finns sparat.` : 'Ska du eller har du opererat in en höftprotes? Då blir appen en egen rehabdel: förberedelser före operationen, fem faser efteråt som du går igenom med kriterier, tester, en lärobok och promenader i stället för löpning.'}</p>
        {r && <button onClick={() => resumeRehab(p)} className="mt-3 flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold" style={{ background: 'rgb(var(--rehab))', color: 'rgb(var(--onpillar))' }}>Gå tillbaka till rehabläget</button>}
        <button onClick={start} className="mt-3 min-h-[44px] text-[15px] font-medium underline underline-offset-4">{r ? 'Ny operation – börja om' : 'Starta rehabläget (höftprotes)'}</button>
      </div>
    );
  }
  const ph = rehabPhase(p) ?? 5;
  const passed = Object.keys(r.passed ?? {}).length;
  return (
    <div className="flex flex-col gap-6 border-t border-rule pt-3" id="hoft">
      <label className="block">
        <span className="mb-1 block text-[14px] text-ink2">Datum för operationen – ett datum framåt i tiden ger förberedelser före</span>
        <input type="date" value={r.surgery} onChange={(e) => e.target.value && set({ surgery: e.target.value })} aria-label="Datum för operationen"
          className="h-12 w-full rounded-2xl bg-ink/[0.06] px-4 text-[17px] outline-none focus:ring-2 focus:ring-ink" />
      </label>
      <HipDetails r={r} set={set} />
      {r.approach === 'sido' && (
        <Toggle on={!!r.abdCleared} onClick={() => set({ abdCleared: !r.abdCleared })} title="Klartecken för abduktion mot motstånd" sub="Sidosnitt: från kirurgen, ofta efter 6 veckor. Då kommer gummiband och maskin in i passen" />
      )}
      <Toggle on={!!r.heavy} onClick={() => set({ heavy: !r.heavy })} title="Tung styrka tidigt (4 × 5)" sub="Benpress och abduktion nära max redan i fas 3 (Husby, Winther). Kräver gym" />
      {ph > 0 && (
        <div>
          <div className="text-[14px] text-ink2">Fas – styrs av kriterierna du bockar i (nu fas {ph})</div>
          {passed > 0 && <button onClick={() => undoPhase(p)} className="mt-1 min-h-[44px] text-[15px] font-medium underline underline-offset-4">Gå tillbaka en fas</button>}
          <OptionList value={r.holdPhase ?? 0} onChange={(v) => set({ holdPhase: v || undefined })} options={[
            { value: 0, label: 'Följ kriterierna' }, ...REHAB_PHASES.slice(0, 4).map((x) => ({ value: x.n, label: `Stanna i fas ${x.n}`, hint: x.name })),
          ]} />
        </div>
      )}
      <Toggle on={!!r.cleared} onClick={() => set({ cleared: !r.cleared })} title="Klartecken för fri träning" sub="Från kirurg eller fysioterapeut: löpning och djupa höftstretchar (från fas 5)" />
      <Link to="/lamna-rehab" className="flex min-h-[44px] items-center text-left text-[15px] font-medium underline underline-offset-4">Lämna rehabläget och gå till den vanliga appen</Link>
      <p className="-mt-4 text-[13px] text-ink2">Du kan alltid komma tillbaka här. Lämna bara om din fysioterapeut eller kirurg säger att du kan träna fritt.</p>
    </div>
  );
}

/** Turn the rehab mode on: rehab program for the gym, walking instead of running. New profiles start criteria-based. */
export function withRehab(p: Profile, rehab: HipRehab): Profile {
  const now = new Date().toISOString();
  return { ...p, rehab: { passed: {}, ...rehab }, goals: { ...p.goals, run: 'walk' }, enrollments: { ...p.enrollments, gym: { programId: 'hip_rehab', startedAt: now }, run: { programId: 'walk', startedAt: now } } };
}
