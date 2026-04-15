import type { Character } from '../types/character';

const LAUNCH_DATE = new Date('2025-01-01');

export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDayNumber(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const launch = new Date(LAUNCH_DATE);
  launch.setHours(0, 0, 0, 0);
  const diff = today.getTime() - launch.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

// Mulberry32 PRNG — same algorithm used in grid-seed for consistency
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle seeded with the epoch cycle number so each
// full cycle of chars.length days uses a different permutation.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getDailyCharacter(chars: Character[]): Character {
  if (chars.length === 0) throw new Error('getDailyCharacter: character list is empty');
  const dayNum = getDayNumber();
  // Which full cycle we're in determines the shuffle seed,
  // which position within the cycle picks the character.
  const cycleIndex = Math.floor(dayNum / chars.length);
  const posInCycle = dayNum % chars.length;
  const shuffled = seededShuffle(chars, cycleIndex + 1);
  const result = shuffled[posInCycle];
  if (!result) throw new Error(`getDailyCharacter: index out of bounds (pos=${posInCycle}, len=${shuffled.length})`);
  return result;
}
