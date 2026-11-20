import { describe, expect, it } from 'vitest';
import { Track, fmtPace, haversine, type Fix } from './gps';

// Moving north: 0.0001° latitude ≈ 11.1 m.
const at = (n: number, sec: number, acc = 5): Fix => ({ lat: 59.33 + n * 0.0001, lon: 18.06, acc, t: sec * 1000 });

describe('GPS-distans', () => {
  it('haversine ger rätt avstånd', () => {
    expect(haversine(at(0, 0), at(9, 0))).toBeCloseTo(100.1, 0);
  });

  it('räknar ihop en jämn runda (≈ 5:00 min/km)', () => {
    const t = new Track();
    // 11.1 m every 3.33 s ≈ 3.33 m/s ≈ 5:00 min/km, for 1 km.
    for (let k = 0; k <= 90; k++) t.add(at(k, k * 3.33), true);
    expect(t.meters).toBeGreaterThan(980);
    expect(t.meters).toBeLessThan(1020);
    const pace = t.pace(90 * 3330)!;
    expect(pace).toBeGreaterThan(290);
    expect(pace).toBeLessThan(310);
    expect(fmtPace(pace)).toMatch(/^[45]:\d\d$/);
  });

  it('ignorerar osäkra punkter, hopp och stillastående brus', () => {
    const t = new Track();
    t.add(at(0, 0), true);
    t.add(at(5, 10, 80), true); // 80 m uncertainty: skipped
    t.add(at(200, 12), true); // 2 km in 2 s: glitch
    t.add({ ...at(0, 20), lat: 59.33 + 0.00001 }, true); // 1 m jitter
    expect(t.meters).toBe(0);
  });

  it('räknar inte medan passet är pausat, och hoppar inte vid fortsätt', () => {
    const t = new Track();
    t.add(at(0, 0), true);
    t.add(at(5, 15), true); // 55 m
    t.add(at(30, 120), false); // walked away while paused
    t.add(at(31, 124), true); // resume: only the step after resuming counts
    expect(t.meters).toBeGreaterThan(60);
    expect(t.meters).toBeLessThan(70);
  });
});
