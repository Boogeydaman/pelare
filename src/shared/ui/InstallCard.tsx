import { NATIVE } from '../../core/native';
import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { useInstall } from '../../core/install';
import { IconButton, Primary } from './kit';

const KEY = 'pelare.installHidden';

/** Shown until the app is installed: one-tap install where the browser allows it, otherwise short instructions. */
export function InstallCard({ dismissible = true }: { dismissible?: boolean }) {
  const s = useInstall();
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } });
  if (NATIVE || s.installed || (dismissible && hidden)) return null;

  const hide = () => { setHidden(true); try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ } };

  return (
    <section className="relative rounded-[24px] border border-rule bg-raised px-5 py-5">
      {dismissible && <IconButton ariaLabel="Dölj" onClick={hide} className="absolute right-3 top-3"><X size={18} strokeWidth={1.75} /></IconButton>}
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink2"><Download size={16} strokeWidth={1.75} /> Installera som app</div>
      <p className="mt-2 pr-8 text-[16px] leading-snug">Lägg Pelare i applådan. Den öppnas i helskärm, fungerar utan nät och all data sparas bara i telefonen.</p>
      {s.canPrompt ? (
        <div className="mt-4"><Primary onClick={() => s.install()}>Installera Pelare</Primary></div>
      ) : (
        <ol className="mt-3 list-decimal pl-5 text-[15px] leading-relaxed text-ink2">
          {s.ios ? (
            <><li>Tryck på dela-knappen i Safari.</li><li>Välj <b className="text-ink">Lägg till på hemskärmen</b>.</li></>
          ) : s.samsung ? (
            <><li>Tryck på menyn <b className="text-ink">≡</b> längst ner.</li><li>Välj <b className="text-ink">Lägg till sida i</b> → <b className="text-ink">Startskärm</b>.</li></>
          ) : (
            <><li>Tryck på menyn <b className="text-ink">⋮</b> uppe till höger i Chrome.</li><li>Välj <b className="text-ink">Installera app</b> eller <b className="text-ink">Lägg till på startskärmen</b>.</li></>
          )}
        </ol>
      )}
    </section>
  );
}
