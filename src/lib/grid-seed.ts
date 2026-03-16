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
  ['village', 'gender'],
  ['village', 'status'],
  ['rank', 'gender'],
  ['rank', 'status'],
  ['nature', 'gender'],
  ['nature', 'status'],
];

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// Rejects pairs where one criterion is almost a subset of the other (>90% overlap
// in either direction), which would make cells trivially easy.
function isRedundantPair(a: Criterion, b: Criterion, characters: Character[]): boolean {
  const aCount = characters.filter(a.matches).length;
  const bCount = characters.filter(b.matches).length;
  if (aCount === 0 || bCount === 0) return true;
  const intersection = characters.filter(c => a.matches(c) && b.matches(c)).length;
  return intersection / aCount > 0.9 || intersection / bCount > 0.9;
}

// Verifies that 9 distinct characters can cover all 9 cells simultaneously
// using augmenting-path bipartite matching (cells ↔ characters).
function hasPerfectMatching(pools: Character[][]): boolean {
  const charToCell = new Map<number, number>();

  function tryAugment(cellIdx: number, visited: Set<number>): boolean {
    for (const char of pools[cellIdx]) {
      if (visited.has(char.id)) continue;
      visited.add(char.id);
      const prev = charToCell.get(char.id);
      if (prev === undefined || tryAugment(prev, visited)) {
        charToCell.set(char.id, cellIdx);
        return true;
      }
    }
    return false;
  }

  for (let i = 0; i < pools.length; i++) {
    if (!tryAugment(i, new Set())) return false;
  }
  return true;
}

export function getDailyGrid(characters: Character[]): DailyGrid {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  for (let offset = 0; offset < 200; offset++) {
    const rand = mulberry32(seed + offset * 7919);

    const pairIdx = Math.floor(rand() * CATEGORY_PAIRS.length);
    const [rowCat, colCat] = CATEGORY_PAIRS[pairIdx];

    const rowPool = CRITERIA_POOL.filter(c => c.category === rowCat);
    const colPool = CRITERIA_POOL.filter(c => c.category === colCat);

    if (rowPool.length < 3 || colPool.length < 3) continue;

    const rows = pickN(rowPool, 3, rand);
    const cols = pickN(colPool, 3, rand);

    let valid = true;
    const cellPools: Character[][] = [];

    for (let ri = 0; ri < rows.length; ri++) {
      for (let ci = 0; ci < cols.length; ci++) {
        if (isRedundantPair(rows[ri], cols[ci], characters)) {
          valid = false;
          break;
        }
        const pool = getIntersection(rows[ri], cols[ci], characters);
        // Require at least 3 valid characters per cell so no combo is trivially empty or near-impossible
        if (pool.length < 3) {
          valid = false;
          break;
        }
        cellPools.push(pool);
      }
      if (!valid) break;
    }

    if (!valid) continue;
    if (!hasPerfectMatching(cellPools)) continue;

    return { rows, cols };
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
