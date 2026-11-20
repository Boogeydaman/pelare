// All sources the app cites. 1–26 come from the spec (docs/SPEC.md section 12);
// 27–35 were looked up and checked against PubMed/journal/publisher pages on 2026-11-20 (35 = the user's PDF).
import { SOURCES as SPEC_SOURCES, type Source } from '../engine/rules';

export type { Source };

const EXTRA: Source[] = [
  { id: 27, year: 2022, level: 'A', cite: 'Paluch m.fl. Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. Lancet Public Health. 2022', url: 'https://pubmed.ncbi.nlm.nih.gov/35247352/' },
  { id: 28, year: 2022, level: 'A', cite: 'Momma m.fl. Muscle-strengthening activities are associated with lower risk and mortality in major non-communicable diseases: meta-analysis. Br J Sports Med. 2022', url: 'https://doi.org/10.1136/bjsports-2021-105061' },
  { id: 29, year: 2015, level: 'C', cite: 'Watson m.fl. Recommended amount of sleep for a healthy adult: AASM/SRS consensus statement. Sleep. 2015', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/' },
  { id: 30, year: 2018, level: 'A', cite: 'Morton m.fl. Protein supplementation and resistance training-induced gains in muscle mass and strength: meta-analysis. Br J Sports Med. 2018', url: 'https://pubmed.ncbi.nlm.nih.gov/28698222/' },
  { id: 33, year: 2014, level: 'C', cite: 'Nielsen m.fl. Excessive progression in weekly running distance and risk of running-related injuries: 874 novice runners. J Orthop Sports Phys Ther. 2014', url: 'https://vbn.aau.dk/da/publications/excessive-progression-in-weekly-running-distance-and-risk-of-runn' },
  { id: 34, year: 2024, level: 'H', cite: 'NHS. Couch to 5K: 9 veckor, 3 pass i veckan med vilodag emellan, gå-spring till 30 minuter.', url: 'https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/' },
  { id: 35, year: 2020, level: 'D', cite: 'Joggingguide 2020: Löpning för nybörjare – från 0 till 5 km på 6 veckor (gå-jogg, 3 pass i veckan).' },
  { id: 31, year: 2021, level: 'B', cite: 'Maeo m.fl. Greater hamstrings hypertrophy after training at long versus short muscle lengths (sittande vs liggande bencurl). Med Sci Sports Exerc. 2021', url: 'https://pubmed.ncbi.nlm.nih.gov/33009197/' },
  { id: 32, year: 2023, level: 'B', cite: 'Kinoshita m.fl. Triceps surae hypertrophy is greater after standing versus seated calf-raise training. Front Physiol. 2023', url: 'https://doi.org/10.3389/fphys.2023.1272106' },
];

export const SOURCES: Source[] = [...SPEC_SOURCES, ...EXTRA];
export const SOURCE: Record<number, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));
