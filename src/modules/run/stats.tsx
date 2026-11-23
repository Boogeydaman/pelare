// Running statistics on Framsteg: pace zones, race estimates, records and recent runs.
import { Link } from 'react-router-dom';
import { useCtx } from '../../core/ctx';
import { fmtDate } from '../../core/format';
import { Empty, Section } from '../../shared/layout/page';
import { color } from '../../shared/ui/kit';
import { km, runs } from './planner';
import { fmtPaceS, fmtTime, paceZones, riegel } from './pace';

const fmtKm = (n: number) => n.toFixed(n >= 10 ? 1 : 2).replace('.', ',');

export function RunStats() {
  const ctx = useCtx();
  if (!ctx) return null;
  const all = runs(ctx.logs);
  const withKm = all.filter((l) => km(l) > 0);
  const z = paceZones(ctx);
  const pace = (l: (typeof all)[number]) => (l.minutes * 60) / km(l);
  const longestKm = withKm.reduce((m, l) => Math.max(m, km(l)), 0);
  const totalKm = withKm.reduce((a, l) => a + km(l), 0);
  const year = new Date(ctx.now.getFullYear(), 0, 1);
  const yearKm = withKm.filter((l) => new Date(l.startedAt) >= year).reduce((a, l) => a + km(l), 0);
  const fastest = withKm.filter((l) => km(l) >= 3).sort((a, b) => pace(a) - pace(b))[0];

  return (
    <>
      <Section title="Ditt tempo">
        {z ? (
          <div className="border-t border-rule pt-3">
            <p className="text-[14px] text-ink2">Räknat från {z.source}. Mätaren på löpskärmen håller dig i rätt zon.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {([['Lugnt', z.easy, 'Pratbart, långpass'], ['Tempo', z.tempo, 'Kontrollerat hårt'], ['Intervall', z.interval, 'Runt 5 km-fart']] as const).map(([n, r, h]) => (
                <div key={n} className="rounded-2xl px-3 py-3" style={{ background: color('run', 0.1) }}>
                  <div className="text-[13px] font-medium" style={{ color: color('run') }}>{n}</div>
                  <div className="num text-[17px] font-semibold">{fmtPaceS(r[0])}–{fmtPaceS(r[1])}</div>
                  <div className="text-[12px] text-ink2">{h}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-[14px] font-medium">Uppskattade tider just nu</div>
            <div className="num mt-1 grid grid-cols-4 gap-2 text-center text-[13px]">
              {[5, 10, 15, 21.1].map((d) => (
                <div key={d} className="rounded-xl border border-rule py-2">
                  <div className="text-ink2">{d === 21.1 ? 'Halvmara' : `${d} km`}</div>
                  <div className="font-semibold">{fmtTime(riegel(z.p5 * 5, 5, d))}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-ink2">Uppskattning med Riegels formel – längre distanser kräver att du har tränat för dem.</p>
          </div>
        ) : <Empty>Spring några rundor med GPS (minst 3 km) eller gör ett 5 km-test, så räknar appen ut dina tempozoner och uppskattade tider.</Empty>}
      </Section>

      <Section title="Rekord och totalt">
        <div className="num grid grid-cols-2 gap-x-6 gap-y-4 border-t border-rule pt-4">
          <Fact label="Längsta distans" value={longestKm ? `${fmtKm(longestKm)} km` : '–'} />
          <Fact label="Längsta pass" value={all.length ? `${Math.max(...all.map((l) => l.minutes))} min` : '–'} />
          <Fact label="Snabbaste runda (3 km+)" value={fastest ? `${fmtPaceS(pace(fastest))} /km` : '–'} />
          <Fact label="Antal löppass" value={String(all.length)} />
          <Fact label="Km i år" value={fmtKm(yearKm)} />
          <Fact label="Km totalt" value={fmtKm(totalKm)} />
        </div>
      </Section>

      <Section title="Senaste rundorna">
        {all.length ? all.slice(0, 10).map((l) => (
          <Link key={l.id} to={`/logg/${l.id}`} className="num grid grid-cols-[1fr_auto_auto] items-baseline gap-4 border-t border-rule py-3 text-[15px]">
            <span><span className="block font-medium">{l.title}</span><span className="block text-[13px] text-ink2">{fmtDate(l.startedAt)} · {l.minutes} min</span></span>
            <span>{km(l) ? `${fmtKm(km(l))} km` : '–'}</span>
            <span className="w-16 text-right text-ink2">{km(l) ? `${fmtPaceS(pace(l))}` : ''}</span>
          </Link>
        )) : <Empty>Inga löppass än.</Empty>}
      </Section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><div className="text-[13px] text-ink2">{label}</div><div className="text-[22px] font-semibold leading-tight">{value}</div></div>;
}
