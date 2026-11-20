import { describe, expect, it } from 'vitest';
import { STRETCH, STRETCHES } from '../modules/mobility/stretches';
import { ARTICLES } from './articles';
import { SOURCE } from './sources';

describe('Artiklarna', () => {
  it('varje källhänvisning i texten finns i källistan och i artikelns underlag', () => {
    for (const a of ARTICLES) {
      const text = [a.lead, ...a.sections.flatMap((s) => s.p)].join(' ');
      const refs = [...text.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
      for (const n of refs) {
        expect(SOURCE[n], `${a.id}: källa ${n} saknas`).toBeDefined();
        expect(a.sources, `${a.id}: källa ${n} saknas i underlaget`).toContain(n);
      }
      for (const n of a.sources) expect(refs, `${a.id}: källa ${n} används inte i texten`).toContain(n);
    }
  });

  it('har en artikel för varje pelare och för vila', () => {
    for (const t of ['gym', 'run', 'mobility', 'rest'] as const) expect(ARTICLES.some((a) => a.topic === t), t).toBe(true);
  });
});

describe('Stretchbiblioteket', () => {
  it('stegarna pekar åt båda hållen', () => {
    for (const s of STRETCHES) {
      if (s.harder) expect(STRETCH[s.harder]?.easier, `${s.id} → ${s.harder}`).toBe(s.id);
      if (s.easier) expect(STRETCH[s.easier]?.harder, `${s.id} → ${s.easier}`).toBe(s.id);
    }
  });

  it('har minst 40 övningar varav minst 10 djurrörelser', () => {
    expect(STRETCHES.length).toBeGreaterThanOrEqual(40);
    expect(STRETCHES.filter((s) => s.group === 'Djurrörelser').length).toBeGreaterThanOrEqual(10);
  });
});
