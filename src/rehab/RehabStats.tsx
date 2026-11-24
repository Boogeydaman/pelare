// Du: your rehab at a glance – sessions, walks, lessons and how the pain has gone.
import { useCtx } from '../core/ctx';
import { weekStart } from '../core/format';
import { CHAPTERS, REHAB, rehabTint } from './content';
import { isHipSession } from '../modules/gym/hip';
import { inRehab } from './state';

export function RehabStats() {
  const ctx = useCtx();
  if (!ctx || !inRehab(ctx.profile, ctx.now)) return null;
  const rehab = ctx.logs.filter(isHipSession);
  const week = weekStart(ctx.now);
  const thisWeek = rehab.filter((l) => new Date(l.startedAt) >= week).length;
  const walkMin = ctx.logs.filter((l) => l.type === 'walk' && new Date(l.startedAt) >= week).reduce((a, l) => a + l.minutes, 0);
  const pains = rehab.filter((l) => l.pain !== undefined).slice(0, 10).reverse().map((l) => l.pain!);
  const read = CHAPTERS.filter((c) => (ctx.profile.rehab?.read ?? []).includes(c.id)).length;
  return (
    <section className="mt-6 rounded-[22px] px-5 py-4" style={{ background: rehabTint(0.08) }}>
      <div className="text-[13px] font-semibold" style={{ color: REHAB }}>Din rehab</div>
      <div className="num mt-2 grid grid-cols-3 gap-3">
        <div><div className="text-[24px] font-semibold leading-tight">{thisWeek}</div><div className="text-[12px] text-ink2">rehabpass i veckan · {rehab.length} totalt</div></div>
        <div><div className="text-[24px] font-semibold leading-tight">{walkMin}</div><div className="text-[12px] text-ink2">min promenad i veckan</div></div>
        <div><div className="text-[24px] font-semibold leading-tight">{read}/{CHAPTERS.length}</div><div className="text-[12px] text-ink2">kapitel lästa</div></div>
      </div>
      {pains.length > 1 && (
        <div className="mt-4">
          <div className="text-[13px] text-ink2">Smärta under passen (0–10), senaste {pains.length}</div>
          <div className="mt-2 flex h-14 items-end gap-1.5" aria-label={`Smärta: ${pains.join(', ')}`}>
            {pains.map((v, i) => (
              <span key={i} className="flex-1 rounded-t" style={{ height: `${Math.max(8, v * 10)}%`, background: v > 5 ? 'rgb(var(--gym))' : REHAB, opacity: 0.85 }} />
            ))}
          </div>
          <div className="mt-1 text-[12px] text-ink2">Under strecket 5 är okej. Orange staplar betyder att passet gjorde mer ont.</div>
        </div>
      )}
    </section>
  );
}
