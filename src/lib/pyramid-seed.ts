import type { Character } from '../types/character';
import { CRITERIA_POOL, type Criterion } from './criteria';

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DailyPyramid {
  // 4 criteria, one per row. rows[0] = top (1 cell), rows[3] = bottom (4 cells)
  criteria: Criterion[];
}

// Row sizes top-to-bottom: row 0 = 1 cell, row 1 = 2, row 2 = 3, row 3 = 4
const ROW_SIZES = [1, 2, 3, 4];

export function getDailyPyramid(characters: Character[]): DailyPyramid {
  const now = new Date();
  // Offset seed so pyramid differs from grid
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + 9999;

  for (let offset = 0; offset < 100; offset++) {
    const rand = mulberry32(seed + offset * 6271);

    const shuffled = [...CRITERIA_POOL].sort(() => rand() - 0.5);
    const usedCategories = new Set<string>();
    const criteria: Criterion[] = [];

    for (const c of shuffled) {
      if (criteria.length === 4) break;
      if (usedCategories.has(c.category)) continue;
      const eligible = characters.filter(c.matches).length;
      const rowSize = ROW_SIZES[criteria.length];
      if (eligible < rowSize + 3) continue;
      criteria.push(c);
      usedCategories.add(c.category);
    }

    if (criteria.length === 4) return { criteria };
  }

  return {
    criteria: [
      CRITERIA_POOL.find(c => c.id === 'kk_sharingan')!,
      CRITERIA_POOL.find(c => c.id === 'village_akatsuki')!,
      CRITERIA_POOL.find(c => c.id === 'nature_fire')!,
      CRITERIA_POOL.find(c => c.id === 'village_konoha')!,
    ],
  };
}

export const ROW_BONUSES = [200, 150, 125, 100]; // top to bottom (fewer cells = harder = more points)
