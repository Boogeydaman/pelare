// After a run: distance and pace, time in the target zone, km splits and how it compares – encouraging.
import type { SessionLog } from '../../core/types';
import { color } from '../../shared/ui/kit';
import { km, runs } from './planner';
import { fmtPaceS } from './pace';

const fmtKm = (n: number) => n.toFixed(n >= 10 ? 1 : 2).replace('.', ',');
const pace = (l: SessionLog) => (l.minutes * 60) / km(l);

export interface RunSummaryData {
  headline: string;
  lines: string[];
  distance?: number;
  pace?: number;
  zone?: { green: number; fast: number; slow: number; pct: number };
  splits?: number[];
}

/** Everything the summary says, as plain data (tested). */
export function summarizeRun(log: SessionLog, prev: SessionLog[]): RunSummaryData {
  const d = log.data?.kind === 'run' ? log.data : undefined;
  const before = runs(prev).filter((l) => l.id !== log.id && new Date(l.startedAt) < new Date(log.startedAt))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt)); // newest first
  const withKm = before.filter((l) => km(l) > 0);
  const dist = km(log);
  const p = dist > 0 ? pace(log) : undefined;
  const lines: string[] = [];
  let headline = before.length ? 'Bra jobbat!' : 'Första rundan är gjord!';

  // Records
  const longestMin = Math.max(0, ...before.map((l) => l.minutes));
  const longestKm = Math.max(0, ...withKm.map(km));
  const fastest = Math.min(Infinity, ...withKm.filter((l) => km(l) >= 3).map(pace));
  const fastestSplit = Math.min(Infinity, ...withKm.flatMap((l) => (l.data?.kind === 'run' ? l.data.splits ?? [] : [])));
  const recs: string[] = [];
  if (before.length && dist > longestKm && dist > 0) recs.push(`längsta distansen (${fmtKm(dist)} km)`);
  if (before.length && log.minutes > longestMin) recs.push(`längsta passet (${log.minutes} min)`);
  if (p && dist >= 3 && fastest < Infinity && p < fastest) recs.push(`snabbaste rundan på 3 km eller mer (${fmtPaceS(p)} /km)`);
  const bestSplit = d?.splits?.length ? Math.min(...d.splits) : Infinity;
  if (bestSplit < fastestSplit && fastestSplit < Infinity) recs.push(`snabbaste kilometern (${fmtPaceS(bestSplit)})`);
  if (recs.length) { headline = recs.length > 1 ? `${recs.length} nya rekord!` : 'Nytt rekord!'; lines.push(`Nytt: ${recs.length > 1 ? `${recs.slice(0, -1).join(', ')} och ${recs[recs.length - 1]}` : recs[0]}.`); }

  // Time in the target zone
  let zone: RunSummaryData['zone'];
  if (d?.zone) {
    const tot = d.zone.green + d.zone.fast + d.zone.slow;
    if (tot >= 60) {
      const pct = Math.round((d.zone.green / tot) * 100);
      zone = { ...d.zone, pct };
      const fastPct = Math.round((d.zone.fast / tot) * 100), slowPct = Math.round((d.zone.slow / tot) * 100);
      if (pct >= 75) { lines.push(`Du låg i målzonen ${pct} % av tiden – precis så det ska vara.`); if (!recs.length) headline = 'Perfekt tempo!'; }
      else if (fastPct > slowPct) lines.push(`${pct} % i målzonen, ${fastPct} % för fort. ${log.type === 'easy' || log.type === 'long' ? 'Lugna pass gör mest nytta när de faktiskt är lugna – det är där uthålligheten byggs.' : 'Börja lite lugnare nästa gång så orkar du hålla farten hela vägen.'}`);
      else lines.push(`${pct} % i målzonen, ${slowPct} % lugnare än planerat. Helt okej en tung dag – försök hålla dig närmare målet nästa gång.`);
    }
  }

  // Compared with earlier runs
  const last = withKm[0];
  if (p && last) {
    const diff = Math.round(pace(last) - p);
    if (Math.abs(diff) >= 5) lines.push(`${Math.abs(diff)} s/km ${diff > 0 ? 'snabbare' : 'långsammare'} än förra rundan med distans${diff < 0 && (log.type === 'easy' || log.type === 'long') ? ' – på ett lugnt pass är det bara bra' : ''}.`);
    else lines.push('Samma tempo som förra rundan – jämnt och fint.');
  }
  const month = withKm.filter((l) => new Date(log.startedAt).getTime() - new Date(l.startedAt).getTime() < 28 * 864e5);
  if (dist > 0 && month.length >= 2) {
    const avg = month.reduce((a, l) => a + km(l), 0) / month.length;
    if (dist > avg * 1.15) lines.push(`Längre än ditt snitt de senaste fyra veckorna (${fmtKm(avg)} km).`);
  }
  const weekRuns = before.filter((l) => new Date(log.startedAt).getTime() - new Date(l.startedAt).getTime() < 7 * 864e5).length + 1;
  if (weekRuns >= 2) lines.push(`Löppass nummer ${weekRuns} de senaste sju dagarna.`);
  if (!lines.length) lines.push('Varje runda bygger grunden. Nästa gång blir lite lättare.');

  return { headline, lines, distance: dist || undefined, pace: p, zone, splits: d?.splits };
}

export function RunSummary({ log, prev }: { log: SessionLog; prev: SessionLog[] }) {
  const s = summarizeRun(log, prev);
  const run = color('run');
  const best = s.splits?.length ? Math.min(...s.splits) : 0;
  const worst = s.splits?.length ? Math.max(...s.splits) : 0;
  return (
    <section className="rise mt-8 rounded-[24px] px-5 py-5" style={{ background: color('run', 0.1), animationDelay: '150ms' }}>
      <div className="text-[13px] font-semibold" style={{ color: run }}>Sammanfattning</div>
      <div className="mt-1 font-serif text-[30px] leading-tight">{s.headline}</div>
      <div className="num mt-3 grid grid-cols-3 gap-2">
        <div><div className="text-[24px] font-semibold leading-none">{s.distance ? fmtKm(s.distance) : '–'}</div><div className="text-[12px] text-ink2">km</div></div>
        <div><div className="text-[24px] font-semibold leading-none">{log.minutes}</div><div className="text-[12px] text-ink2">min</div></div>
        <div><div className="text-[24px] font-semibold leading-none">{s.pace ? fmtPaceS(s.pace) : '–'}</div><div className="text-[12px] text-ink2">min/km</div></div>
      </div>
      {s.zone && (
        <div className="mt-4">
          <div className="flex h-3 overflow-hidden rounded-full" aria-label={`${s.zone.pct} % i målzonen`}>
            <span style={{ flex: s.zone.slow, background: '#f0ad4e' }} />
            <span style={{ flex: s.zone.green, background: '#5cb85c' }} />
            <span style={{ flex: s.zone.fast, background: '#d9534f' }} />
          </div>
          <div className="mt-1 flex justify-between text-[12px] text-ink2"><span>Lugnare</span><span>{s.zone.pct} % i målzonen</span><span>Fortare</span></div>
        </div>
      )}
      <ul className="mt-4 space-y-2">
        {s.lines.map((t, i) => <li key={i} className="text-[15px] leading-snug">{t}</li>)}
      </ul>
      {s.splits && s.splits.length > 1 && (
        <div className="mt-4">
          <div className="text-[13px] font-medium text-ink2">Kilometertider</div>
          <ol className="mt-1">
            {s.splits.map((v, i) => (
              <li key={i} className="num flex items-center gap-3 py-0.5 text-[14px]">
                <span className="w-10 text-ink2">km {i + 1}</span>
                <span className="h-2 rounded-full" style={{ width: `${30 + (worst > best ? ((worst - v) / (worst - best)) * 60 : 30)}%`, background: v === best ? run : color('run', 0.35) }} />
                <span className={v === best ? 'font-semibold' : ''}>{fmtPaceS(v)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
