// How an exercise is done: figure, steps and your own technique videos. Used inline in the session
// list ("Visa passet"), in the players' "Hur gör man?" and in the library.
import { Link } from 'react-router-dom';
import type { ModuleId } from '../../core/types';
import { MODULE } from '../../modules/registry';
import { Figure } from './Figure';
import { TechniqueVideos } from './TechniqueVideos';

export function ExerciseHow({ module, id, name, compact }: { module: ModuleId; id: string; name: string; compact?: boolean }) {
  const m = MODULE[module];
  const item = m?.library.items.find((i) => i.id === id);
  const steps = item?.how ?? item?.tips ?? [];
  return (
    <div className="pb-3">
      <div className={compact ? 'mx-auto w-full max-w-[11rem]' : ''}><Figure anim={item?.anim} kind={module} label={name} size={compact ? 'sm' : 'lg'} /></div>
      {steps.length > 0 && (
        <ol className="mt-3">
          {steps.map((t, k) => (
            <li key={k} className="flex gap-3 border-t border-rule py-2.5 text-[15px] leading-snug"><span className="num w-4 shrink-0 text-ink2">{k + 1}</span><span>{t}</span></li>
          ))}
        </ol>
      )}
      <TechniqueVideos exercise={id} name={name} />
      {item && <Link to={`/${m.slug}/bibliotek/${id}`} className="mt-3 block text-[14px] font-medium underline underline-offset-4">Mer om övningen</Link>}
    </div>
  );
}
