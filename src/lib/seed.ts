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

export function getDailyCharacter(chars: Character[]): Character {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = seed % chars.length;
  return chars[index];
}
