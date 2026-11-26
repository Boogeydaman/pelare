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
  /** Interval and tempo sessions: each hard part's distance, time and pace – shown instead of km splits. */
  reps?: { meters: number; seconds: number; pace: number }[];
  repPace?: number; // average pace over the hard parts
}

const QUALITY = ['intervals', 'tempo'];
const repsOf = (l: SessionLog) => (l.data?.kind === 'run' ? (l.data.intervals ?? []).filter((x) => x.meters > 20).map((x) => ({ ...x, pace: x.seconds / (x.meters / 1000) })) : []);
const avgPace = (r: { meters: number; seconds: number }[]) => r.reduce((a, x) => a + x.seconds, 0) / (r.reduce((a, x) => a + x.meters, 0) / 1000);

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

  // Interval and tempo sessions: the hard parts are what counts – their pace, how even, and against last time.
  const reps = QUALITY.includes(log.type) ? repsOf(log) : [];
  const repPace = reps.length ? avgPace(reps) : undefined;
  if (repPace) {
    if (log.type === 'tempo' || reps.length === 1) {
      lines.push(`Tempodelen: ${fmtPaceS(repPace)} /km i ${Math.round(reps.reduce((a, x) => a + x.seconds, 0) / 60)} minuter.`);
    } else {
      const fastestRep = reps.reduce((b, x, k) => (x.pace < reps[b].pace ? k : b), 0);
      lines.push(`Snitt i intervallerna: ${fmtPaceS(repPace)} /km. Snabbast var nummer ${fastestRep + 1} (${fmtPaceS(reps[fastestRep].pace)}).`);
      const first = reps[0].pace, lastRep = reps[reps.length - 1].pace;
      const spread = (Math.max(...reps.map((x) => x.pace)) - Math.min(...reps.map((x) => x.pace))) / Math.min(...reps.map((x) => x.pace));
      if (spread <= 0.03) { lines.push('Jämna intervaller hela vägen – precis så ska det vara.'); if (!recs.length) headline = 'Jämnt och starkt!'; }
      else if (lastRep > first * 1.05) lines.push(`Du tappade mot slutet (första ${fmtPaceS(first)}, sista ${fmtPaceS(lastRep)}). Börja lite lugnare nästa gång så orkar du hålla farten i alla.`);
      else if (lastRep < first) { lines.push('Starkt avslut – sista intervallen var snabbare än den första.'); if (!recs.length) headline = 'Starkt avslut!'; }
    }
    const prevSame = before.find((l) => l.type === log.type && repsOf(l).length);
    if (prevSame) {
      const diff = Math.round(avgPace(repsOf(prevSame)) - repPace);
      lines.push(Math.abs(diff) >= 3 ? `${Math.abs(diff)} s/km ${diff > 0 ? 'snabbare' : 'långsammare'} i de hårda delarna än förra ${log.type === 'tempo' ? 'tempopasset' : 'intervallpasset'}.` : `Samma fart i de hårda delarna som förra ${log.type === 'tempo' ? 'tempopasset' : 'intervallpasset'}.`);
    }
  }

  // Compared with earlier runs (not for interval sessions – the average there mixes warm-up, jogs and hard parts)
  const last = withKm[0];
  if (p && last && !repPace) {
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

  return { headline, lines, distance: dist || undefined, pace: p, zone, splits: repPace ? undefined : d?.splits, reps: reps.length ? reps : undefined, repPace };
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
        <div><div className="text-[24px] font-semibold leading-none">{s.repPace ? fmtPaceS(s.repPace) : s.pace ? fmtPaceS(s.pace) : '–'}</div><div className="text-[12px] text-ink2">{s.repPace ? (log.type === 'tempo' ? 'tempo, min/km' : 'intervaller, min/km') : 'min/km'}</div></div>
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
      {s.reps && s.reps.length > 1 && (() => {
        const fast = Math.min(...s.reps.map((x) => x.pace)), slow = Math.max(...s.reps.map((x) => x.pace));
        return (
          <div className="mt-4">
            <div className="text-[13px] font-medium text-ink2">Intervaller</div>
            <ol className="mt-1">
              {s.reps.map((x, k) => (
                <li key={k} className="num flex items-center gap-3 py-0.5 text-[14px]">
                  <span className="w-8 text-ink2">{k + 1}</span>
                  <span className="w-16 text-ink2">{Math.round(x.meters)} m</span>
                  <span className="h-2 rounded-full" style={{ width: `${20 + (slow > fast ? ((slow - x.pace) / (slow - fast)) * 45 : 22)}%`, background: x.pace === fast ? run : color('run', 0.35) }} />
                  <span className={x.pace === fast ? 'font-semibold' : ''}>{fmtPaceS(x.pace)}</span>
                </li>
              ))}
            </ol>
          </div>
        );
      })()}
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
