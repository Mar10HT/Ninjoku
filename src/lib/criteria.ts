import type { Character } from '../types/character';

export interface Criterion {
  id: string;
  label: string;
  category: 'village' | 'clan' | 'rank' | 'nature' | 'kekkei' | 'gender' | 'status';
  matches: (c: Character) => boolean;
}

export const CRITERIA_POOL: Criterion[] = [
  // Villages
  { id: 'village_konoha', label: 'Konoha', category: 'village',
    matches: c => c.affiliation.some(a => a.toLowerCase().includes('konoha')) },
  { id: 'village_akatsuki', label: 'Akatsuki', category: 'village',
    matches: c => c.affiliation.some(a => a.toLowerCase().includes('akatsuki')) },
  { id: 'village_suna', label: 'Sunagakure', category: 'village',
    matches: c => c.affiliation.some(a => a.toLowerCase().includes('suna')) },
  { id: 'village_kiri', label: 'Kirigakure', category: 'village',
    matches: c => c.affiliation.some(a => a.toLowerCase().includes('kiri')) },
  { id: 'village_kumo', label: 'Kumogakure', category: 'village',
    matches: c => c.affiliation.some(a => a.toLowerCase().includes('kumo')) },
  { id: 'village_iwa', label: 'Iwagakure', category: 'village',
    matches: c => c.affiliation.some(a => a.toLowerCase().includes('iwa')) },
  { id: 'village_oto', label: 'Otogakure', category: 'village',
    matches: c => c.affiliation.some(a => a.toLowerCase().includes('oto')) },
  // Clans
  { id: 'clan_uchiha', label: 'Uchiha Clan', category: 'clan',
    matches: c => (c.clan ?? '').toLowerCase().includes('uchiha') },
  { id: 'clan_hyuga', label: 'Hyūga Clan', category: 'clan',
    matches: c => (c.clan ?? '').toLowerCase().includes('hy\u016bga') || (c.clan ?? '').toLowerCase().includes('hyuga') },
  { id: 'clan_nara', label: 'Nara Clan', category: 'clan',
    matches: c => (c.clan ?? '').toLowerCase().includes('nara') },
  { id: 'clan_uzumaki', label: 'Uzumaki Clan', category: 'clan',
    matches: c => (c.clan ?? '').toLowerCase().includes('uzumaki') },
  { id: 'clan_senju', label: 'Senju Clan', category: 'clan',
    matches: c => (c.clan ?? '').toLowerCase().includes('senju') },
  { id: 'clan_akimichi', label: 'Akimichi Clan', category: 'clan',
    matches: c => (c.clan ?? '').toLowerCase().includes('akimichi') },
  { id: 'clan_yamanaka', label: 'Yamanaka Clan', category: 'clan',
    matches: c => (c.clan ?? '').toLowerCase().includes('yamanaka') },
  { id: 'clan_hatake', label: 'Hatake Clan', category: 'clan',
    matches: c => (c.clan ?? '').toLowerCase().includes('hatake') },
  // Ranks
  { id: 'rank_genin', label: 'Genin', category: 'rank',
    matches: c => (c.rank ?? '').toLowerCase().includes('genin') },
  { id: 'rank_chunin', label: 'Chūnin', category: 'rank',
    matches: c => (c.rank ?? '').toLowerCase().includes('h\u016bnin') || (c.rank ?? '').toLowerCase().includes('chunin') },
  { id: 'rank_jonin', label: 'Jōnin', category: 'rank',
    matches: c => (c.rank ?? '').toLowerCase().includes('j\u014dnin') || (c.rank ?? '').toLowerCase().includes('jonin') },
  { id: 'rank_kage', label: 'Kage', category: 'rank',
    matches: c => (c.rank ?? '').toLowerCase().includes('kage') },
  { id: 'rank_anbu', label: 'ANBU', category: 'rank',
    matches: c => (c.rank ?? '').toLowerCase().includes('anbu') },
  // Nature types
  { id: 'nature_fire', label: 'Fire Release', category: 'nature',
    matches: c => c.natureType.some(n => n.toLowerCase().includes('fire')) },
  { id: 'nature_wind', label: 'Wind Release', category: 'nature',
    matches: c => c.natureType.some(n => n.toLowerCase().includes('wind')) },
  { id: 'nature_lightning', label: 'Lightning Release', category: 'nature',
    matches: c => c.natureType.some(n => n.toLowerCase().includes('lightning')) },
  { id: 'nature_earth', label: 'Earth Release', category: 'nature',
    matches: c => c.natureType.some(n => n.toLowerCase().includes('earth')) },
  { id: 'nature_water', label: 'Water Release', category: 'nature',
    matches: c => c.natureType.some(n => n.toLowerCase().includes('water')) },
  // Kekkei Genkai
  { id: 'kk_sharingan', label: 'Sharingan', category: 'kekkei',
    matches: c => c.kekkeiGenkai.some(k => k.toLowerCase().includes('sharingan')) },
  { id: 'kk_byakugan', label: 'Byakugan', category: 'kekkei',
    matches: c => c.kekkeiGenkai.some(k => k.toLowerCase().includes('byakugan')) },
  { id: 'kk_woodrelease', label: 'Wood Release', category: 'kekkei',
    matches: c => c.kekkeiGenkai.some(k => k.toLowerCase().includes('wood')) },
  { id: 'kk_ice', label: 'Ice Release', category: 'kekkei',
    matches: c => c.kekkeiGenkai.some(k => k.toLowerCase().includes('ice')) },
  // Gender
  { id: 'gender_male', label: 'Male', category: 'gender',
    matches: c => (c.gender ?? '').toLowerCase() === 'male' },
  { id: 'gender_female', label: 'Female', category: 'gender',
    matches: c => (c.gender ?? '').toLowerCase() === 'female' },
  // Status
  { id: 'status_alive', label: 'Alive', category: 'status',
    matches: c => (c.status ?? '').toLowerCase() === 'alive' },
  { id: 'status_deceased', label: 'Deceased', category: 'status',
    matches: c => (c.status ?? '').toLowerCase() === 'deceased' },
];

export function getEligible(criterion: Criterion, characters: Character[]): Character[] {
  return characters.filter(criterion.matches);
}

export function getIntersection(a: Criterion, b: Criterion, characters: Character[]): Character[] {
  return characters.filter(c => a.matches(c) && b.matches(c));
}
