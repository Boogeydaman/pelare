// Start screen: a short greeting over your own motivating images, with today's session.
// Shown once per app start (not when switching back to it), never during a running session.
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { coach } from '../core/coach';
import { useCtx } from '../core/ctx';
import { db, deleteSplashImage, saveProfile, uid, useActive, useSplashImages, type SplashImage } from '../core/db';
import { MODULE_LIST } from '../modules/registry';
import { color } from '../shared/ui/kit';

let shownThisLaunch = false;
const SHOW_MS = 2600;
const ROTATE_KEY = 'pelare.splashIndex';

const greeting = (h: number) => (h < 5 ? 'God natt' : h < 10 ? 'God morgon' : h < 17 ? 'Hej' : 'God kväll');
const LINES = ['Nu kör vi.', 'En dag i taget.', 'Lite varje dag slår mycket ibland.', 'Du behöver inte vara pigg – bara börja.', 'Kroppen minns varje pass.'];

/** Which image to show this time: the next one in turn, so they rotate between starts. */
function nextIndex(n: number): number {
  if (!n) return -1;
  try {
    const k = (Number(localStorage.getItem(ROTATE_KEY)) + 1) % n;
    localStorage.setItem(ROTATE_KEY, String(k));
    return Number.isFinite(k) ? k : 0;
  } catch { return Math.floor(Math.random() * n); }
}

export function Splash() {
  const ctx = useCtx();
  const active = useActive();
  const images = useSplashImages();
  const loc = useLocation();
  const [phase, setPhase] = useState<'wait' | 'show' | 'leaving' | 'gone'>(shownThisLaunch ? 'gone' : 'wait');
  const [url, setUrl] = useState<string | null>(null);
  const [pick] = useState(() => ({ line: LINES[Math.floor(Math.random() * LINES.length)] }));

  const skip = !ctx || ctx.profile.splash?.off || active || loc.pathname.startsWith('/pass') || loc.pathname.startsWith('/veckan');
  const img: SplashImage | undefined = useMemo(() => (images && images.length ? images[nextIndex(images.length)] : undefined), [images]); // eslint-disable-line react-hooks/exhaustive-deps

  // Decide once everything has loaded.
  useEffect(() => {
    if (phase !== 'wait' || !ctx || active === undefined || images === undefined) return;
    shownThisLaunch = true;
    setPhase(skip ? 'gone' : 'show');
  }, [phase, ctx, active, images, skip]);

  // "Visa startskärmen nu" in Settings.
  useEffect(() => {
    const show = () => setPhase('show');
    window.addEventListener('pelare:splash', show);
    return () => window.removeEventListener('pelare:splash', show);
  }, []);

  useEffect(() => {
    if (!img) return;
    const u = URL.createObjectURL(img.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [img]);

  useEffect(() => {
    if (phase !== 'show') return;
    const a = setTimeout(() => setPhase('leaving'), SHOW_MS);
    return () => clearTimeout(a);
  }, [phase]);
  useEffect(() => {
    if (phase !== 'leaving') return;
    const a = setTimeout(() => setPhase('gone'), 450);
    return () => clearTimeout(a);
  }, [phase]);

  const today = useMemo(() => {
    if (!ctx || phase === 'gone') return null;
    try {
      const v = coach(ctx, MODULE_LIST);
      const done = v.week.filter((w) => w.module !== 'mobility').reduce((a, w) => a + Math.min(w.done, w.target), 0);
      const target = v.week.filter((w) => w.module !== 'mobility').reduce((a, w) => a + w.target, 0);
      return { title: v.primary.title, minutes: v.primary.minutes, module: v.primary.module, done, target };
    } catch { return null; }
  }, [ctx, phase === 'gone']); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'gone' || phase === 'wait' || !ctx) return null;
  const now = ctx.now;
  const own = ctx.profile.splash?.text?.trim();
  return (
    <div role="dialog" aria-label="Startskärm" onClick={() => setPhase('leaving')}
      className={`fixed inset-0 z-[100] flex flex-col overflow-hidden transition-opacity duration-500 ${phase === 'leaving' ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: `linear-gradient(160deg, ${color('gym')}, ${color('run')} 60%, ${color('mobility')})`, color: '#fff' }}>
      {url && <img src={url} alt="" className="splash-zoom absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgb(0 0 0 / 0.15) 0%, rgb(0 0 0 / 0.05) 35%, rgb(0 0 0 / 0.65) 100%)' }} />
      <div className="safe-top safe-bottom relative mx-auto flex w-full max-w-lg flex-1 flex-col px-7 pb-10">
        <div className="pt-6 text-[15px] font-medium tracking-wide opacity-90">Pelare</div>
        <div className="mt-auto">
          <div className="splash-rise text-[18px] opacity-90">{greeting(now.getHours())}.</div>
          <h1 className={`splash-rise mt-1 font-serif leading-[1.02] ${(own || pick.line).length > 26 ? 'text-[40px]' : 'text-[52px]'}`} style={{ animationDelay: '120ms' }}>{own || pick.line}</h1>
          {today && (
            <div className="splash-rise mt-6 rounded-2xl px-4 py-3 backdrop-blur-sm" style={{ background: 'rgb(255 255 255 / 0.16)', animationDelay: '260ms' }}>
              <div className="text-[13px] opacity-85">I dag</div>
              <div className="text-[19px] font-semibold">{today.title} · {today.minutes} min</div>
              {today.target > 0 && <div className="mt-1 text-[13px] opacity-85">{today.done} av {today.target} pass den här veckan</div>}
            </div>
          )}
          <div className="mt-6 text-center text-[13px] opacity-70">Tryck för att börja</div>
        </div>
      </div>
    </div>
  );
}

/** Downscale a photo before storing it (about 1600 px on the long side), so many images fit. */
export async function addSplashImage(file: File) {
  let blob: Blob = file;
  try {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b ?? file), 'image/jpeg', 0.85));
  } catch { /* keep the original */ }
  await db.splash.put({ id: uid(), date: new Date().toISOString(), blob });
}

/** Settings: the start screen's on/off, your own line and your images. */
export function SplashSettings() {
  const ctx = useCtx();
  const images = useSplashImages();
  const [text, setText] = useState(ctx?.profile.splash?.text ?? '');
  const [busy, setBusy] = useState(false);
  // Save the text while typing (shortly after the last key), so nothing is lost when leaving the page.
  useEffect(() => {
    if (!ctx || (ctx.profile.splash?.text ?? '') === text.trim()) return;
    const t = setTimeout(() => saveProfile({ ...ctx.profile, splash: { ...ctx.profile.splash, text: text.trim() || undefined } }), 500);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ctx) return null;
  const p = ctx.profile;
  const save = (patch: Partial<NonNullable<typeof p.splash>>) => saveProfile({ ...p, splash: { ...p.splash, ...patch } });
  const on = !p.splash?.off;
  return (
    <div className="border-t border-rule pt-3">
      <button onClick={() => save({ off: on })} aria-pressed={on} className="flex min-h-[48px] w-full items-center justify-between text-left">
        <span className="text-[17px] font-medium">Visa när appen startar</span>
        <span className="text-[15px] text-ink2">{on ? 'På' : 'Av'}</span>
      </button>
      <label className="mt-2 block">
        <span className="mb-1 block text-[14px] text-ink2">Din egen rad (valfri), t.ex. ditt mål</span>
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={80}
          placeholder="Sommaren 2027: 10 km under 50 min" aria-label="Egen text på startskärmen"
          className="h-12 w-full rounded-2xl bg-ink/[0.06] px-4 text-[16px] outline-none focus:ring-2 focus:ring-ink" />
      </label>
      <div className="mt-4 text-[14px] text-ink2">Bilder i bakgrunden – en ny visas varje gång appen startar</div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {(images ?? []).map((i) => <Thumb key={i.id} img={i} />)}
        <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-rule text-center text-[13px] text-ink2">
          <span className="text-[24px] leading-none">+</span>{busy ? 'Sparar …' : 'Lägg till'}
          <input type="file" accept="image/*" multiple className="hidden" aria-label="Lägg till bilder till startskärmen" onChange={async (e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = '';
            setBusy(true);
            for (const f of files) await addSplashImage(f);
            setBusy(false);
          }} />
        </label>
      </div>
      <p className="mt-2 text-[13px] text-ink2">Bilderna sparas bara i telefonen. Tips: bilder på det du vill kunna göra – ett lopp, en splitt, en topp du vill bestiga – håller motivationen uppe längst.</p>
      <button onClick={() => window.dispatchEvent(new Event('pelare:splash'))} className="mt-3 min-h-[44px] text-[15px] font-medium underline underline-offset-4">Visa startskärmen nu</button>
    </div>
  );
}

function Thumb({ img }: { img: SplashImage }) {
  const [url, setUrl] = useState('');
  useEffect(() => { const u = URL.createObjectURL(img.blob); setUrl(u); return () => URL.revokeObjectURL(u); }, [img.blob]);
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ink/[0.06]">
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
      <button onClick={() => deleteSplashImage(img.id)} aria-label="Ta bort bilden"
        className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-[16px] font-semibold" style={{ background: 'rgb(0 0 0 / 0.55)', color: '#fff' }}>×</button>
    </div>
  );
}
