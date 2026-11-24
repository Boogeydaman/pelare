// Rehab mode – Tester: the test battery from the research report (part 11) with instructions, the
// latest result, a trend and the target for your phase.
import { ChevronRight, Timer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useCtx } from '../core/ctx';
import { saveTest, uid } from '../core/db';
import { fmtDate } from '../core/format';
import type { TestResult } from '../core/types';
import { rehabPhase } from '../modules/common';
import { NumberInput, parseNum } from '../shared/ui/fields';
import { Primary, Sheet } from '../shared/ui/kit';
import { REHAB, rehabTint } from './content';
import { HIP_TESTS, type HipTest } from './criteria';

const fmt = (t: HipTest, v: number) => (t.yesNo ? (v ? 'Positivt' : 'Negativt') : `${String(Math.round(v * 10) / 10).replace('.', ',')}${t.unit ? ` ${t.unit}` : ''}`);
const good = (t: HipTest, v: number, target?: number) => target === undefined ? undefined : t.higher ? v >= target : v <= target;

export function RehabTests() {
  const ctx = useCtx();
  const [open, setOpen] = useState<HipTest | null>(null);
  const [more, setMore] = useState(false);
  if (!ctx) return null;
  const ph = Math.max(1, rehabPhase(ctx.profile, ctx.now) ?? 5);
  const byId = (id: string) => ctx.tests.filter((t) => t.testId === id).sort((a, b) => a.date.localeCompare(b.date));
  const now = HIP_TESTS.filter((t) => t.fromPhase <= ph);
  const later = HIP_TESTS.filter((t) => t.fromPhase > ph);
  const row = (t: HipTest) => {
    const rs = byId(t.id);
    const last = rs[rs.length - 1];
    const tg = t.target(ph);
    const ok = last ? good(t, last.value, tg.value) : undefined;
    return (
      <li key={t.id}>
        <button onClick={() => setOpen(t)} className="flex min-h-[76px] w-full items-center gap-4 border-t border-rule py-3 text-left">
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-medium">{t.name}</span>
            <span className="block text-[13px] text-ink2">{t.measures}</span>
            {rs.length > 1 && !t.yesNo && <Spark values={rs.slice(-8).map((r) => r.value)} higher={t.higher} />}
          </span>
          <span className="shrink-0 text-right">
            {last ? (
              <>
                <span className="num block text-[18px] font-semibold" style={ok === true ? { color: REHAB } : undefined}>{fmt(t, last.value)}</span>
                <span className="block text-[12px] text-ink2">{fmtDate(last.date)}</span>
              </>
            ) : <span className="text-[14px] font-medium" style={{ color: REHAB }}>Gör testet</span>}
          </span>
          <ChevronRight size={16} className="shrink-0 text-ink2" aria-hidden="true" />
        </button>
      </li>
    );
  };
  return (
    <div className="pb-6 pt-4">
      <div className="text-[13px] font-semibold" style={{ color: REHAB }}>Rehabläge</div>
      <h1 className="mt-1 font-serif text-display">Tester</h1>
      <p className="mt-2 text-[16px] leading-snug text-ink2">Objektiva tester visar framsteg du inte märker från dag till dag – och flera av dem är kriterierna för att gå vidare. Testa var 2–4:e vecka, under liknande förhållanden varje gång.</p>
      <section className="mt-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink2">Passar fas {ph}</h2>
        <ul className="mt-2">{now.map(row)}</ul>
      </section>
      {later.length > 0 && (
        <section className="mt-6">
          <button onClick={() => setMore(!more)} aria-expanded={more} className="min-h-[44px] text-[15px] font-medium underline underline-offset-4">{more ? 'Dölj' : 'Visa'} tester för senare faser ({later.length})</button>
          {more && <ul className="mt-2">{later.map(row)}</ul>}
        </section>
      )}
      <p className="mt-6 text-[13px] leading-snug text-ink2">Riktvärdena är ungefärliga mål från normdata och klinisk praxis, inte exakta gränser mellan faserna.</p>
      {open && <TestSheet t={open} ph={ph} results={byId(open.id)} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Spark({ values, higher }: { values: number[]; higher: boolean }) {
  const lo = Math.min(...values), hi = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${hi === lo ? 10 : 18 - ((v - lo) / (hi - lo)) * 16}`).join(' ');
  const better = higher ? values[values.length - 1] >= values[0] : values[values.length - 1] <= values[0];
  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="mt-1 h-5 w-28" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={better ? REHAB : 'rgb(var(--ink2))'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function TestSheet({ t, ph, results, onClose }: { t: HipTest; ph: number; results: TestResult[]; onClose: () => void }) {
  const [v, setV] = useState('');
  const tg = t.target(ph);
  const save = async (value: number) => {
    await saveTest({ id: uid(), module: 'gym', testId: t.id, value, unit: t.unit, date: new Date().toISOString() });
    onClose();
  };
  const n = parseNum(v);
  const valid = n !== undefined && n >= t.min && n <= t.max;
  const timed = t.id === 'hip_chair30' ? 30 : t.id === 'hip_6mwt' ? 360 : null;
  return (
    <Sheet open onClose={onClose} title={t.name}>
      <div className="flex flex-col gap-4 pb-4">
        <div className="text-[14px] text-ink2">{t.measures}</div>
        <ol className="space-y-2">
          {t.how.map((h, i) => <li key={i} className="flex gap-3 text-[16px] leading-snug"><span className="num w-5 shrink-0 font-semibold" style={{ color: REHAB }}>{i + 1}</span>{h}</li>)}
        </ol>
        <div className="rounded-2xl px-4 py-3 text-[14px] leading-snug" style={{ background: rehabTint(0.1) }}>{tg.text}</div>
        {timed && <Countdown seconds={timed} />}
        {t.id === 'hip_stance' && <Stopwatch onStop={(s) => setV(String(s))} />}
        {t.yesNo ? (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => save(0)} className="h-14 rounded-2xl text-[16px] font-semibold" style={{ background: REHAB, color: 'rgb(var(--onpillar))' }}>Negativt (bra)</button>
            <button onClick={() => save(1)} className="h-14 rounded-2xl text-[16px] font-semibold" style={{ background: 'rgb(var(--ink) / 0.08)' }}>Positivt</button>
          </div>
        ) : (
          <>
            <label className="flex items-center justify-between gap-4 border-t border-rule pt-3">
              <span className="text-[17px]">Resultat</span>
              <NumberInput value={v} onChange={setV} unit={t.unit} decimal={t.step < 1} ariaLabel={`Resultat, ${t.unit}`} />
            </label>
            <Primary disabled={!valid} onClick={() => n !== undefined && save(n)}>Spara</Primary>
          </>
        )}
        {results.length > 0 && (
          <div>
            <div className="text-[13px] font-medium text-ink2">Tidigare</div>
            <ul>{[...results].reverse().slice(0, 6).map((r) => <li key={r.id} className="num flex justify-between border-t border-rule py-2 text-[15px]"><span className="text-ink2">{fmtDate(r.date)}</span><span>{fmt(t, r.value)}</span></li>)}</ul>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/** For timed tests (30 s chair stand, 6 minutes walk): a countdown with a beep at the end. */
function Countdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState<number | null>(null);
  const end = useRef(0);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const id = window.setInterval(() => {
      const l = Math.max(0, Math.ceil((end.current - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) { try { navigator.vibrate?.(400); } catch { /* ignore */ } }
    }, 200);
    return () => window.clearInterval(id);
  }, [left]);
  const mm = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s} s`);
  return (
    <button onClick={() => { end.current = Date.now() + seconds * 1000; setLeft(seconds); }}
      className="flex h-14 items-center justify-center gap-2 rounded-2xl text-[17px] font-semibold" style={{ background: rehabTint(0.14), color: REHAB }}>
      <Timer size={18} aria-hidden="true" />
      {left === null ? `Starta klockan (${mm(seconds)})` : left > 0 ? <span className="num">{mm(left)} kvar</span> : 'Tiden är ute – skriv in resultatet'}
    </button>
  );
}

/** For single-leg stance: start, stop, and the seconds go into the field. */
function Stopwatch({ onStop }: { onStop: (s: number) => void }) {
  const [start, setStart] = useState<number | null>(null);
  const [, tick] = useState(0);
  useEffect(() => {
    if (start === null) return;
    const id = window.setInterval(() => tick((n) => n + 1), 100);
    return () => window.clearInterval(id);
  }, [start]);
  const s = start === null ? 0 : Math.floor((Date.now() - start) / 1000);
  return (
    <button onClick={() => { if (start === null) setStart(Date.now()); else { onStop(Math.min(60, s)); setStart(null); } }}
      className="flex h-14 items-center justify-center gap-2 rounded-2xl text-[17px] font-semibold" style={{ background: rehabTint(0.14), color: REHAB }}>
      <Timer size={18} aria-hidden="true" />
      {start === null ? 'Starta tidtagning' : <span className="num">{s} s – tryck för att stoppa</span>}
    </button>
  );
}
