import type { Character } from '../types/character';
import charactersData from './characters.json';
import { BORUTO_ARCS } from '../lib/arc-order';

/**
 * Characters filtered to exclude Boruto arcs.
 * Defined in a shared module so the filter runs once regardless of
 * how many game components import it (ESM module caching).
 */
export const characters: Character[] = (charactersData as Character[]).filter(
  c => !BORUTO_ARCS.has(c.arcOfDebut),
);
