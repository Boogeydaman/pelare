// Your own technique videos for an exercise: record with the camera (or pick a file), watch in slow
// motion next to the figure, delete. Stored only on the phone.
import { Trash2, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { deleteVideo, saveVideo, uid, useVideos, type TechniqueVideo } from '../../core/db';
import { fmtDate } from '../../core/format';

const MAX = 400 * 1024 * 1024;

export function TechniqueVideos({ exercise, name, onPillar }: { exercise: string; name: string; onPillar?: boolean }) {
  const videos = useVideos(exercise);
  const input = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const add = async (f?: File) => {
    if (!f) return;
    if (f.size > MAX) { setMsg('Filmen är för stor (över 400 MB). Spela in ett kortare klipp.'); return; }
    await saveVideo({ id: uid(), exercise, date: new Date().toISOString(), blob: f, type: f.type || 'video/mp4', size: f.size });
    setMsg('Sparad i telefonen.');
  };
  const border = onPillar ? '1.5px solid rgb(var(--onpillar) / 0.45)' : '1px solid rgb(var(--rule))';
  return (
    <section className="mt-6">
      <div className="text-[13px] font-medium opacity-80">Dina teknikvideor</div>
      <p className="mt-1 text-[13px] opacity-70">Filma ett set från sidan och jämför med gubben. Videorna sparas bara i telefonen och följer inte med i säkerhetskopian.</p>
      <div className="mt-3 flex flex-col gap-3">
        {(videos ?? []).map((v) => <Clip key={v.id} v={v} name={name} border={border} />)}
      </div>
      <button onClick={() => input.current?.click()} className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium" style={{ border }}>
        <Video size={18} aria-hidden="true" /> Spela in eller välj video
      </button>
      <input ref={input} type="file" accept="video/*" capture="environment" className="hidden"
        onChange={(e) => { add(e.target.files?.[0]); e.target.value = ''; }} aria-label={`Spela in video av ${name}`} />
      {msg && <p className="mt-2 text-[13px]" role="status">{msg}</p>}
    </section>
  );
}

function Clip({ v, name, border }: { v: TechniqueVideo; name: string; border: string }) {
  const [url, setUrl] = useState('');
  const [rate, setRate] = useState(1);
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { const u = URL.createObjectURL(v.blob); setUrl(u); return () => URL.revokeObjectURL(u); }, [v.blob]);
  useEffect(() => { if (ref.current) ref.current.playbackRate = rate; }, [rate, url]);
  return (
    <div className="overflow-hidden rounded-2xl" style={{ border }}>
      {url && <video ref={ref} src={url} controls playsInline loop className="aspect-video w-full bg-black" aria-label={`Din video av ${name}, ${fmtDate(v.date)}`} />}
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-[13px]">
        <span className="opacity-75">{fmtDate(v.date)} · {v.size < 1e6 ? '<1' : Math.round(v.size / 1e6)} MB</span>
        <span className="flex items-center gap-1">
          {[1, 0.5, 0.25].map((r) => (
            <button key={r} onClick={() => setRate(r)} aria-pressed={rate === r} className={`h-9 min-w-[44px] rounded-full px-2 font-semibold ${rate === r ? 'bg-ink/10' : ''}`}>
              {r === 1 ? '1×' : r === 0.5 ? '½×' : '¼×'}
            </button>
          ))}
          {confirm
            ? <button onClick={() => deleteVideo(v.id)} className="h-9 rounded-full px-3 font-semibold text-gym">Ta bort?</button>
            : <button onClick={() => setConfirm(true)} aria-label="Ta bort videon" className="flex h-9 w-9 items-center justify-center"><Trash2 size={16} /></button>}
        </span>
      </div>
    </div>
  );
}
