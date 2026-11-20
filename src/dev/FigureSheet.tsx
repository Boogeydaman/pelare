import { ANIMS } from '../shared/ui/poses';
import { Figure } from '../shared/ui/Figure';

/** Dev only (#/figurer): every animation at a few points of its cycle, to check the poses. */
export function FigureSheet() {
  const only = new URLSearchParams(location.hash.split('?')[1] ?? '').get('k');
  const keys = Object.keys(ANIMS).filter((k) => !only || only.split(',').includes(k));
  const phases = only && only.split(",").length === 1 ? [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9] : [0, 0.25, 0.5, 0.75];
  return (
    <div className="bg-paper p-2 text-ink">
      {keys.map((k) => (
        <div key={k} className="mb-1 flex items-center gap-1">
          <div className="w-16 shrink-0 text-[11px]">{k}</div>
          {phases.map((ph) => <div key={ph} className="w-28"><Figure anim={k} kind="gym" label={k} size="sm" phase={ph} /></div>)}
        </div>
      ))}
    </div>
  );
}
