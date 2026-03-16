import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getArcOfDebut } from './arc-map.js';

// --- API types (Dattebayo API shape) ---

interface ApiCharacter {
  id: number;
  name: string;
  images?: string[];
  natureType?: string[];
  personal?: {
    affiliation?: string | string[];
    clan?: string | string[];
    kekkeiGenkai?: string | string[];
    sex?: string;
  };
  rank?: {
    ninjaRank?: Record<string, string>;
  };
  debut?: {
    anime?: string;
  };
}

interface ApiResponse {
  characters: ApiCharacter[];
  total: number;
  pageSize: number;
  currentPage: number;
}

// --- Output type ---

export interface Character {
  id: number;
  name: string;
  image: string;
  affiliation: string[];
  clan: string;
  rank: string;
  natureType: string[];
  kekkeiGenkai: string[];
  arcOfDebut: string;
  gender: string;
  status: string; // 'Alive' | 'Deceased' | '' — see status-overrides.json
}

// --- Status overrides (manually curated) ---

const statusOverridesPath = join(process.cwd(), 'scripts', 'status-overrides.json');
const statusOverrides: Record<string, string> = JSON.parse(
  readFileSync(statusOverridesPath, 'utf-8')
);

// --- Helpers ---

const BASE_URL = 'https://dattebayo-api.onrender.com';

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function pickRank(ninjaRank?: Record<string, string>): string {
  if (!ninjaRank) return '';
  // Prefer canonical rank: Part II > Part I > first available
  return (
    ninjaRank['Part II'] ??
    ninjaRank['Part I'] ??
    Object.values(ninjaRank).find(Boolean) ??
    ''
  );
}

function cleanGender(raw: string | undefined): string {
  if (!raw) return '';
  // Strip wiki file artifacts like "File:Gender Various.svg Various" → "Various"
  const match = raw.match(/\.svg\s+(.+)$/);
  return match ? match[1].trim() : raw.trim();
}

/** Remove wiki annotation parentheticals and normalize whitespace. */
function cleanAnnotation(value: string): string {
  return value.replace(/\s*\([^)]*\)/g, '').replace(/\s{2,}/g, ' ').trim();
}

/** Clean an array field: strip annotations, remove empties, deduplicate. */
function cleanArray(values: string[]): string[] {
  const cleaned = values.map(cleanAnnotation).filter(Boolean);
  return [...new Set(cleaned)];
}

function isValid(c: ApiCharacter): boolean {
  const name = c.name?.trim();
  if (!name) return false;
  // Skip unnamed / numbered entries
  if (/^(unnamed|unknown)/i.test(name)) return false;
  // Filter masked ANBU members (e.g. "Boar-Masked Anbu Member")
  if (/(Masked|masked).*Anbu Member/i.test(name)) return false;
  // Filter game-only characters (e.g. "Kagura (game)")
  if (/\(game\)/i.test(name)) return false;
  // Require image
  if (!c.images?.[0]) return false;
  // Require rank
  if (!pickRank(c.rank?.ninjaRank)) return false;
  // Require at least one affiliation
  if (!toArray(c.personal?.affiliation).length) return false;
  // Require gender (after cleaning)
  if (!cleanGender(c.personal?.sex)) return false;
  return true;
}

function mapCharacter(c: ApiCharacter): Character {
  return {
    id: c.id,
    name: c.name.trim(),
    image: c.images?.[0] ?? '',
    affiliation: cleanArray(toArray(c.personal?.affiliation)),
    clan: cleanAnnotation(toArray(c.personal?.clan)[0] ?? ''),
    rank: pickRank(c.rank?.ninjaRank),
    natureType: cleanArray(toArray(c.natureType)),
    kekkeiGenkai: cleanArray(toArray(c.personal?.kekkeiGenkai)),
    arcOfDebut: getArcOfDebut(c.debut?.anime ?? ''),
    gender: cleanGender(c.personal?.sex),
    status: statusOverrides[String(c.id)] ?? '',
  };
}

// --- Fetch all pages ---

async function fetchAll(): Promise<ApiCharacter[]> {
  const all: ApiCharacter[] = [];
  let page = 1;
  const limit = 20;

  while (true) {
    const res = await fetch(`${BASE_URL}/characters?page=${page}&limit=${limit}`);
    if (!res.ok) {
      console.error(`API error on page ${page}: ${res.status} ${res.statusText}`);
      break;
    }

    const data = (await res.json()) as ApiResponse;
    const batch = data.characters ?? [];
    if (!batch.length) break;

    all.push(...batch);
    console.log(`Page ${page} — ${all.length} / ${data.total} characters fetched`);

    if (all.length >= data.total) break;
    page++;
  }

  return all;
}

// --- Main ---

async function main() {
  console.log('Fetching characters from Dattebayo API…');

  const raw = await fetchAll();
  const characters = raw.filter(isValid).map(mapCharacter);

  console.log(`\nFetched: ${raw.length} | After filter: ${characters.length}`);

  const outDir = join(process.cwd(), 'src', 'data');
  mkdirSync(outDir, { recursive: true });

  const outPath = join(outDir, 'characters.json');
  writeFileSync(outPath, JSON.stringify(characters, null, 2), 'utf-8');

  console.log(`\n✓ Written to src/data/characters.json`);

  // Summary stats
  const withStatus = characters.filter((c) => c.status !== '').length;
  const withArc = characters.filter((c) => c.arcOfDebut !== '').length;
  console.log(`  Status populated: ${withStatus} / ${characters.length}`);
  console.log(`  Arc of debut populated: ${withArc} / ${characters.length}`);
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
