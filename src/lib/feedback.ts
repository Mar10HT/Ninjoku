import type { Character } from '../types/character';
import { arcIndex } from './arc-order';

export type FeedbackValue = 'match' | 'partial' | 'none' | 'higher' | 'lower';

export interface GuessFeedback {
  affiliation: FeedbackValue;
  clan: FeedbackValue;
  rank: FeedbackValue;
  natureType: FeedbackValue;
  kekkeiGenkai: FeedbackValue;
  arcOfDebut: FeedbackValue;
  gender: FeedbackValue;
  status: FeedbackValue;
}

// Canonical rank order (ascending)
const RANK_ORDER = ['Genin', 'Chūnin', 'Jōnin', 'ANBU', 'Kage'];

function rankIndex(rank: string): number {
  return RANK_ORDER.indexOf(rank);
}

function compareMulti(guessArr: string[], targetArr: string[]): FeedbackValue {
  if (!guessArr.length && !targetArr.length) return 'match';
  if (!guessArr.length || !targetArr.length) return 'none';

  const targetSet = new Set(targetArr);
  const matches = guessArr.filter((v) => targetSet.has(v));

  if (matches.length === guessArr.length && guessArr.length === targetArr.length) return 'match';
  // Exact match: every guess value is in target AND counts are equal
  if (
    guessArr.every((v) => targetSet.has(v)) &&
    targetArr.every((v) => new Set(guessArr).has(v))
  )
    return 'match';
  if (matches.length > 0) return 'partial';
  return 'none';
}

function compareExact(a: string, b: string): FeedbackValue {
  return a === b ? 'match' : 'none';
}

function compareOrdered(guessIdx: number, targetIdx: number): FeedbackValue {
  if (guessIdx === -1 || targetIdx === -1) return 'none';
  if (guessIdx === targetIdx) return 'match';
  return targetIdx > guessIdx ? 'higher' : 'lower';
}

export function compareCharacters(guess: Character, target: Character): GuessFeedback {
  return {
    affiliation: compareMulti(guess.affiliation, target.affiliation),
    clan: compareExact(guess.clan, target.clan),
    rank: compareOrdered(rankIndex(guess.rank), rankIndex(target.rank)),
    natureType: compareMulti(guess.natureType, target.natureType),
    kekkeiGenkai: compareMulti(guess.kekkeiGenkai, target.kekkeiGenkai),
    arcOfDebut: compareOrdered(arcIndex(guess.arcOfDebut), arcIndex(target.arcOfDebut)),
    gender: compareExact(guess.gender, target.gender),
    status: compareExact(guess.status, target.status),
  };
}
