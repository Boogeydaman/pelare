import type { RecordItem, TrainingModule } from '../modules/types';
import type { SessionLog } from './types';

/** Personal records across all modules within `days`, newest first. */
export function recentRecords(logs: SessionLog[], modules: TrainingModule[], days: number, now = new Date()): RecordItem[] {
  const chrono = [...logs].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const from = now.getTime() - days * 864e5;
  const out: RecordItem[] = [];
  chrono.forEach((l, i) => {
    if (new Date(l.startedAt).getTime() < from) return;
    const m = modules.find((x) => x.id === l.module);
    if (m?.records) out.push(...m.records(chrono.slice(0, i), l));
  });
  return out.reverse();
}
