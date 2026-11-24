// Hip rehab UI: the status/safety card on Idag and the settings section.
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCtx } from '../../core/ctx';
import { saveProfile } from '../../core/db';
import type { HipApproach, HipRehab, Profile } from '../../core/types';
import { OptionList, color } from '../../shared/ui/kit';
import { REHAB_PHASES, gymProgramFor, rehabPhase, weeksSinceSurgery } from '../common';
import { precautions } from './hip';

export function HipRehabCard() {
  const ctx = useCtx();
  const [open, setOpen] = useState(false);
  if (!ctx) return null;
  const ph = rehabPhase(ctx.profile, ctx.now);
  if (!ph) return null;
  const w = weeksSinceSurgery(ctx.profile, ctx.now);
  const r = ctx.profile.rehab!;
  const restrict = w < 6 ? precautions(ctx.profile) : null;
  return (
    <section className="mt-4 rounded-[22px] px-5 py-4" style={{ background: color('gym', 0.1) }}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium" style={{ color: color('gym') }}>Efter höftprotes · {r.side} höft</span>
        <span className="num text-[13px] text-ink2">vecka {Math.floor(w) + 1}</span>
      </div>
      <div className="mt-1 text-[18px] font-semibold">Fas {ph} av 5: {REHAB_PHASES[ph - 1].name}</div>
      <div className="mt-2 flex gap-1.5" aria-hidden="true">
        {REHAB_PHASES.map((p) => <span key={p.n} className="h-1.5 flex-1 rounded-full" style={{ background: p.n <= ph ? color('gym') : color('gym', 0.18) }} />)}
      </div>
      {r.holdPhase && <p className="mt-2 text-[13px] text-ink2">Du har valt att stanna kvar i fas {r.holdPhase}.</p>}
      {restrict && <p className="mt-3 text-[14px] leading-snug">{restrict}</p>}
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="mt-3 flex min-h-[40px] w-full items-center justify-between text-left text-[15px] font-medium">
        Varningstecken – när du ska söka vård <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className="mt-1 space-y-2 text-[14px] leading-snug">
          <li><b>Plötslig kraftig smärta</b>, benet ser kortare ut eller vridet, eller du kan inte stå på det – kan vara att höften hoppat ur led. <b>Ring 112.</b></li>
          <li><b>Svullen, varm och öm vad</b> – kan vara blodpropp. Kontakta vården samma dag (1177). Vid andnöd eller bröstsmärta: <b>ring 112.</b></li>
          <li><b>Feber, rodnad, vätska från såret</b> eller värk som ökar – kontakta kliniken där du opererades.</li>
          <li>Smärta som <b>inte har lagt sig till nästa morgon</b> flera dagar i rad – ta det lugnare och prata med din fysioterapeut.</li>
        </ul>
      )}
      <div className="mt-2 flex gap-4 text-[14px]">
        <Link to="/las/hoftprotes" className="font-medium underline underline-offset-4">Läs om träningen</Link>
        <Link to="/installningar#hoft" className="text-ink2 underline underline-offset-4">Ändra</Link>
      </div>
    </section>
  );
}

/** Settings: start, adjust or end the hip rehab mode. */
export function HipRehabSettings() {
  const ctx = useCtx();
  if (!ctx) return null;
  const p = ctx.profile;
  const r = p.rehab;
  const set = (patch: Partial<HipRehab>) => saveProfile({ ...p, rehab: { ...(r ?? { kind: 'hip', surgery: new Date().toISOString().slice(0, 10), side: 'höger', approach: 'okand' }), ...patch } });
  const start = () => saveProfile(withRehab(p, { kind: 'hip', surgery: new Date().toISOString().slice(0, 10), side: 'höger', approach: 'okand' }));
  if (!r || r.ended) {
    return (
      <div className="border-t border-rule pt-3">
        <p className="text-[14px] text-ink2">Har du opererat in en höftprotes? Då får du ett program som följer veckorna efter operationen, med promenader i stället för löpning.</p>
        <button onClick={start} className="mt-3 min-h-[44px] text-[15px] font-medium underline underline-offset-4">Starta träning efter höftprotes</button>
      </div>
    );
  }
  const ph = rehabPhase(p) ?? 5;
  return (
    <div className="flex flex-col gap-4 border-t border-rule pt-3" id="hoft">
      <label className="block">
        <span className="mb-1 block text-[14px] text-ink2">Datum för operationen</span>
        <input type="date" value={r.surgery} max={new Date().toISOString().slice(0, 10)} onChange={(e) => e.target.value && set({ surgery: e.target.value })} aria-label="Datum för operationen"
          className="h-12 w-full rounded-2xl bg-ink/[0.06] px-4 text-[17px] outline-none focus:ring-2 focus:ring-ink" />
      </label>
      <div>
        <div className="mb-1 text-[14px] text-ink2">Höft och snitt</div>
        <OptionList value={r.side} onChange={(v) => set({ side: v })} options={[{ value: 'höger', label: 'Höger' }, { value: 'vänster', label: 'Vänster' }]} />
        <OptionList value={r.approach} onChange={(v: HipApproach) => set({ approach: v })} options={[
          { value: 'bakre', label: 'Bakre snitt' }, { value: 'sido', label: 'Sidosnitt' }, { value: 'framre', label: 'Främre snitt' }, { value: 'okand', label: 'Vet inte' },
        ]} />
      </div>
      <div>
        <div className="mb-1 text-[14px] text-ink2">Fas – följer veckorna, men du kan stanna kvar om det känns för tidigt (nu fas {ph})</div>
        <OptionList value={r.holdPhase ?? 0} onChange={(v) => set({ holdPhase: v || undefined })} options={[
          { value: 0, label: 'Följ veckorna' }, ...REHAB_PHASES.slice(0, 4).map((x) => ({ value: x.n, label: `Stanna i fas ${x.n}`, hint: x.name })),
        ]} />
      </div>
      <button onClick={() => set({ cleared: !r.cleared })} aria-pressed={!!r.cleared} className="flex min-h-[48px] items-center justify-between text-left">
        <span><span className="block text-[16px] font-medium">Klartecken från kirurg eller fysioterapeut</span><span className="block text-[13px] text-ink2">För fri träning, löpning och djupa höftstretchar (gäller från fas 5)</span></span>
        <span className="text-[15px] text-ink2">{r.cleared ? 'Ja' : 'Nej'}</span>
      </button>
      <button onClick={() => saveProfile({ ...p, rehab: { ...r, ended: true }, enrollments: { ...p.enrollments, gym: { programId: gymProgramFor(p.gymDays ?? 2, p.places, p.homeEquipment), startedAt: new Date().toISOString() } } })} className="min-h-[44px] text-left text-[15px] font-medium underline underline-offset-4">Avsluta rehabläget och träna som vanligt</button>
    </div>
  );
}

/** Turn the rehab mode on: rehab program for the gym, walking instead of running. */
export function withRehab(p: Profile, rehab: HipRehab): Profile {
  const now = new Date().toISOString();
  return { ...p, rehab, goals: { ...p.goals, run: 'walk' }, enrollments: { ...p.enrollments, gym: { programId: 'hip_rehab', startedAt: now }, run: { programId: 'walk', startedAt: now } } };
}
