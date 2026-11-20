// All sources the app cites. 1–26 come from the spec (docs/SPEC.md section 12);
// 27–32 were looked up and checked against PubMed/journal pages on 2026-11-20.
import { SOURCES as SPEC_SOURCES, type Source } from '../engine/rules';

export type { Source };

const EXTRA: Source[] = [
  { id: 27, year: 2022, level: 'A', cite: 'Paluch m.fl. Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. Lancet Public Health. 2022', url: 'https://pubmed.ncbi.nlm.nih.gov/35247352/' },
  { id: 28, year: 2022, level: 'A', cite: 'Momma m.fl. Muscle-strengthening activities are associated with lower risk and mortality in major non-communicable diseases: meta-analysis. Br J Sports Med. 2022', url: 'https://doi.org/10.1136/bjsports-2021-105061' },
  { id: 29, year: 2015, level: 'C', cite: 'Watson m.fl. Recommended amount of sleep for a healthy adult: AASM/SRS consensus statement. Sleep. 2015', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/' },
  { id: 30, year: 2018, level: 'A', cite: 'Morton m.fl. Protein supplementation and resistance training-induced gains in muscle mass and strength: meta-analysis. Br J Sports Med. 2018', url: 'https://pubmed.ncbi.nlm.nih.gov/28698222/' },
  { id: 31, year: 2021, level: 'B', cite: 'Maeo m.fl. Greater hamstrings hypertrophy after training at long versus short muscle lengths (sittande vs liggande bencurl). Med Sci Sports Exerc. 2021', url: 'https://pubmed.ncbi.nlm.nih.gov/33009197/' },
  { id: 32, year: 2023, level: 'B', cite: 'Kinoshita m.fl. Triceps surae hypertrophy is greater after standing versus seated calf-raise training. Front Physiol. 2023', url: 'https://doi.org/10.3389/fphys.2023.1272106' },
];

export const SOURCES: Source[] = [...SPEC_SOURCES, ...EXTRA];
export const SOURCE: Record<number, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));
