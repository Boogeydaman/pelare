import { RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteSession, saveSession, uid, useSession } from '../core/db';
import { fmtDate } from '../core/format';
import { useStart } from '../core/start';
import { ResultList } from '../shared/layout/content';
import { Empty, Page, Section } from '../shared/layout/page';
import { Field, QuickLog, TextInput } from '../shared/ui/fields';
import { IconButton, MODULE_NAME, Primary, Secondary, Sheet } from '../shared/ui/kit';

const FEEL = ['', 'Lätt', 'Lagom', 'Tungt'];

export function SessionDetail() {
  const { id } = useParams();
  const log = useSession(id);
  const nav = useNavigate();
  const start = useStart();
  const [confirm, setConfirm] = useState(false);
  if (log === undefined) return null;
  if (log === null) return <Page title="Hittades inte" back="/du"><Empty>Passet finns inte längre.</Empty></Page>;
  const replayable = log.plan && log.plan.module !== 'rest';

  return (
    <Page kicker={MODULE_NAME[log.module]} kind={log.module} title={log.title} back="/du"
      action={<IconButton ariaLabel="Ta bort passet" onClick={() => setConfirm(true)}><Trash2 size={20} strokeWidth={1.75} /></IconButton>}>
      <div className="num flex flex-wrap gap-x-3 text-[16px] text-ink2">
        <span className="font-medium text-ink">{log.minutes} min</span><span>·</span>
        <span>{fmtDate(log.startedAt)}</span>
        {log.feel && <><span>·</span><span>{FEEL[log.feel]}</span></>}
      </div>
      {log.note && <p className="mt-4 text-[16px]">{log.note}</p>}

      <Section title="Det här gjorde du"><ResultList data={log.data} />{!log.data && <Empty>Inga detaljer loggade.</Empty>}</Section>

      {replayable && (
        <div className="mt-10"><Secondary onClick={() => start({ ...log.plan!, id: `${log.plan!.id}:again` })}><RotateCcw size={18} /> Kör samma pass igen</Secondary></div>
      )}

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Ta bort passet?">
        <p className="mb-6 text-[16px]">Passet försvinner från historiken och statistiken.</p>
        <div className="pb-4"><Primary onClick={async () => { await deleteSession(log.id); nav(-1); }}>Ta bort</Primary></div>
      </Sheet>
    </Page>
  );
}

/** Log something done outside the modules (cycling, football …). */
export function OtherLog() {
  const nav = useNavigate();
  const [activity, setActivity] = useState('');
  return (
    <Page kicker="Annat" title="Logga något annat" back="/idag">
      <Field label="Aktivitet"><span className="w-48"><TextInput value={activity} onChange={setActivity} placeholder="T.ex. cykel" ariaLabel="Aktivitet" /></span></Field>
      <QuickLog types={[{ value: 'cardio', label: 'Kondition' }, { value: 'sport', label: 'Sport' }, { value: 'walk', label: 'Promenad' }, { value: 'other', label: 'Annat' }]}
        onSave={async (v) => {
          await saveSession({ id: uid(), module: 'other', type: v.type, title: activity.trim() || v.title, minutes: v.minutes, feel: v.feel,
            startedAt: new Date(Date.now() - v.minutes * 60000).toISOString(), data: { kind: 'other', activity: activity.trim() || v.title } });
          nav('/idag', { replace: true });
        }} />
    </Page>
  );
}
