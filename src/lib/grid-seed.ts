import type { Character } from '../types/character';
import { CRITERIA_POOL, type Criterion, getIntersection } from './criteria';

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DailyGrid {
  rows: Criterion[];
  cols: Criterion[];
}

const CATEGORY_PAIRS: Array<[Criterion['category'], Criterion['category']]> = [
  ['village', 'rank'],
  ['village', 'nature'],
  ['village', 'clan'],
  ['clan', 'rank'],
  ['clan', 'nature'],
  ['nature', 'rank'],
  ['village', 'kekkei'],
];

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export function getDailyGrid(characters: Character[]): DailyGrid {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  for (let offset = 0; offset < 100; offset++) {
    const rand = mulberry32(seed + offset * 7919);

    const pairIdx = Math.floor(rand() * CATEGORY_PAIRS.length);
    const [rowCat, colCat] = CATEGORY_PAIRS[pairIdx];

    const rowPool = CRITERIA_POOL.filter(c => c.category === rowCat);
    const colPool = CRITERIA_POOL.filter(c => c.category === colCat);

    if (rowPool.length < 3 || colPool.length < 3) continue;

    const rows = pickN(rowPool, 3, rand);
    const cols = pickN(colPool, 3, rand);

    let valid = true;
    for (const row of rows) {
      for (const col of cols) {
        if (getIntersection(row, col, characters).length < 1) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }

    if (valid) return { rows, cols };
  }

  // Guaranteed fallback
  return {
    rows: [
      CRITERIA_POOL.find(c => c.id === 'village_konoha')!,
      CRITERIA_POOL.find(c => c.id === 'village_akatsuki')!,
      CRITERIA_POOL.find(c => c.id === 'village_suna')!,
    ],
    cols: [
      CRITERIA_POOL.find(c => c.id === 'gender_male')!,
      CRITERIA_POOL.find(c => c.id === 'nature_fire')!,
      CRITERIA_POOL.find(c => c.id === 'rank_jonin')!,
    ],
  };
}
