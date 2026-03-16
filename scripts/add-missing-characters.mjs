// scripts/add-missing-characters.mjs
// Adds major characters that were missing from the dataset (filtered out by the
// original fetch script because they have no rank in the Dattebayo API).
// All data (images, natures, affiliations) is from the API; rank/status/arc
// are filled in manually based on canonical Naruto knowledge.
import { readFileSync, writeFileSync } from 'fs';

const chars = JSON.parse(readFileSync('./src/data/characters.json', 'utf8'));
const existingIds = new Set(chars.map(c => c.id));

// Helper — normalize array or string from API
function toArr(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
}
// Strip "(Anime only)", extra spaces, deduplicate
function clean(arr) {
  return [...new Set(arr.map(s => s.replace(/\s*\([^)]*\)/g, '').trim()).filter(Boolean))];
}

const ADD = [
  // ── Akatsuki ──────────────────────────────────────────────
  {
    id: 861,
    name: 'Nagato',
    image: 'https://static.wikia.nocookie.net/naruto/images/4/46/Nagato.png',
    affiliation: ['Akatsuki', 'Amegakure'],
    clan: 'Uzumaki',
    rank: 'Jōnin',
    natureType: clean(['Fire Release', 'Wind Release', 'Lightning Release', 'Earth Release', 'Water Release']),
    kekkeiGenkai: ['Rinnegan'],
    arcOfDebut: "Pain's Assault Arc",
    gender: 'Male',
    status: 'Deceased',
  },
  {
    id: 684,
    name: 'Konan',
    image: 'https://static.wikia.nocookie.net/naruto/images/5/58/Konan_Infobox.png',
    affiliation: ['Akatsuki', 'Amegakure'],
    clan: '',
    rank: 'Jōnin',
    natureType: clean(['Wind Release', 'Earth Release', 'Water Release']),
    kekkeiGenkai: [],
    arcOfDebut: "Pain's Assault Arc",
    gender: 'Female',
    status: 'Deceased',
  },
  {
    id: 421,
    name: 'Kisame Hoshigaki',
    image: 'https://static.wikia.nocookie.net/naruto/images/2/25/Kisame.png',
    affiliation: ['Akatsuki', 'Kirigakure'],
    clan: 'Hoshigaki',
    rank: 'Jōnin',
    natureType: clean(['Water Release', 'Fire Release', 'Wind Release', 'Earth Release']),
    kekkeiGenkai: [],
    arcOfDebut: 'Land of Waves Arc',
    gender: 'Male',
    status: 'Deceased',
  },
  {
    id: 388,
    name: 'Hidan',
    image: 'https://static.wikia.nocookie.net/naruto/images/e/e3/Hidan.png',
    affiliation: ['Akatsuki', 'Yugakure'],
    clan: '',
    rank: 'Jōnin',
    natureType: [],
    kekkeiGenkai: [],
    arcOfDebut: 'Akatsuki Suppression Arc',
    gender: 'Male',
    status: 'Alive', // immortal — buried alive by Shikamaru, but cannot die
  },
  {
    id: 558,
    name: 'Kakuzu',
    image: 'https://static.wikia.nocookie.net/naruto/images/5/57/Kakuzu.png',
    affiliation: ['Akatsuki', 'Takigakure'],
    clan: '',
    rank: 'Jōnin',
    natureType: clean(['Earth Release', 'Water Release', 'Fire Release', 'Wind Release', 'Lightning Release']),
    kekkeiGenkai: [],
    arcOfDebut: 'Akatsuki Suppression Arc',
    gender: 'Male',
    status: 'Deceased',
  },
  {
    id: 193,
    name: 'Deidara',
    image: 'https://static.wikia.nocookie.net/naruto/images/0/06/Deidara.png',
    affiliation: ['Akatsuki', 'Iwagakure'],
    clan: '',
    rank: 'Jōnin',
    natureType: clean(['Earth Release', 'Lightning Release']),
    kekkeiGenkai: ['Explosion Release'],
    arcOfDebut: 'Kazekage Rescue Arc',
    gender: 'Male',
    status: 'Deceased',
  },
  {
    id: 1042,
    name: 'Sasori',
    image: 'https://static.wikia.nocookie.net/naruto/images/f/f7/Sasori.png',
    affiliation: ['Akatsuki', 'Sunagakure'],
    clan: '',
    rank: 'Jōnin',
    natureType: [],
    kekkeiGenkai: [],
    arcOfDebut: 'Kazekage Rescue Arc',
    gender: 'Male',
    status: 'Deceased',
  },
  {
    id: 1426,
    name: 'White Zetsu',
    image: 'https://static.wikia.nocookie.net/naruto/images/5/5f/White_Zetsu.png',
    affiliation: ['Akatsuki'],
    clan: '',
    rank: 'Anbu',
    natureType: clean(['Wood Release', 'Earth Release', 'Water Release']),
    kekkeiGenkai: ['Wood Release'],
    arcOfDebut: 'Sasuke Recovery Mission Arc',
    gender: 'Male',
    status: 'Deceased',
  },
  // ── Mist / Land of Waves ──────────────────────────────────
  {
    id: 356,
    name: 'Haku',
    image: 'https://static.wikia.nocookie.net/naruto/images/9/90/Haku.png',
    affiliation: ['Kirigakure'],
    clan: 'Yuki',
    rank: 'Anbu',
    natureType: clean(['Ice Release', 'Wind Release', 'Water Release']),
    kekkeiGenkai: ['Ice Release'],
    arcOfDebut: 'Land of Waves Arc',
    gender: 'Male',
    status: 'Deceased',
  },
  // ── Sand ──────────────────────────────────────────────────
  {
    id: 148,
    name: 'Chiyo',
    image: 'https://static.wikia.nocookie.net/naruto/images/d/d8/Elder_Chiyo.png',
    affiliation: ['Sunagakure'],
    clan: '',
    rank: 'Jōnin',
    natureType: [],
    kekkeiGenkai: [],
    arcOfDebut: 'Kazekage Rescue Arc',
    gender: 'Female',
    status: 'Deceased',
  },
  // ── Cloud ─────────────────────────────────────────────────
  {
    id: 636,
    name: 'Killer B',
    image: 'https://static.wikia.nocookie.net/naruto/images/6/63/Killer_B.png',
    affiliation: ['Kumogakure'],
    clan: '',
    rank: 'Jōnin',
    natureType: clean(['Lightning Release', 'Water Release', 'Fire Release']),
    kekkeiGenkai: [],
    arcOfDebut: 'Five Kage Summit Arc',
    gender: 'Male',
    status: 'Alive',
  },
  // ── Uchiha / Konoha legends ───────────────────────────────
  {
    id: 1299,
    name: 'Madara Uchiha',
    image: 'https://static.wikia.nocookie.net/naruto/images/f/fd/Madara.png',
    affiliation: ['Akatsuki', 'Konohagakure'],
    clan: 'Uchiha',
    rank: 'Kage',
    natureType: clean(['Fire Release', 'Wind Release', 'Lightning Release', 'Earth Release', 'Water Release']),
    kekkeiGenkai: ['Sharingan', 'Eternal Mangekyō Sharingan', 'Rinnegan', 'Wood Release'],
    arcOfDebut: 'Five Kage Summit Arc',
    gender: 'Male',
    status: 'Deceased',
  },
  {
    id: 1341,
    name: 'Kushina Uzumaki',
    image: 'https://static.wikia.nocookie.net/naruto/images/d/db/Kushina.png',
    affiliation: ['Konohagakure', 'Uzushiogakure'],
    clan: 'Uzumaki',
    rank: 'Jōnin',
    natureType: clean(['Wind Release', 'Water Release']),
    kekkeiGenkai: [],
    arcOfDebut: 'Konoha Crush Arc',
    gender: 'Female',
    status: 'Deceased',
  },
  // ── Sound / Orochimaru ────────────────────────────────────
  {
    id: 637,
    name: 'Kimimaro',
    image: 'https://static.wikia.nocookie.net/naruto/images/c/c8/Kimimaro_infobox.png',
    affiliation: ['Otogakure'],
    clan: 'Kaguya',
    rank: 'Anbu',
    natureType: [],
    kekkeiGenkai: ['Shikotsumyaku'],
    arcOfDebut: 'Sasuke Recovery Mission Arc',
    gender: 'Male',
    status: 'Deceased',
  },
  {
    id: 430,
    name: 'Suigetsu Hōzuki',
    image: 'https://static.wikia.nocookie.net/naruto/images/3/3e/Suigetsu_H%C5%8Dzuki.png',
    affiliation: ['Kirigakure', 'Otogakure'],
    clan: 'Hōzuki',
    rank: 'Genin',
    natureType: clean(['Water Release', 'Wind Release']),
    kekkeiGenkai: [],
    arcOfDebut: 'Tenchi Bridge Reconnaissance Arc',
    gender: 'Male',
    status: 'Alive',
  },
  {
    id: 521,
    name: 'Jūgo',
    image: 'https://static.wikia.nocookie.net/naruto/images/4/42/Jugo.png',
    affiliation: ['Otogakure'],
    clan: '',
    rank: 'Genin',
    natureType: clean(['Wind Release', 'Earth Release', 'Water Release']),
    kekkeiGenkai: [],
    arcOfDebut: 'Tenchi Bridge Reconnaissance Arc',
    gender: 'Male',
    status: 'Alive',
  },
];

// Only add characters not already in the dataset
const toAdd = ADD.filter(c => !existingIds.has(c.id));
const final = [...chars, ...toAdd];

writeFileSync('./src/data/characters.json', JSON.stringify(final, null, 2));

console.log(`Added ${toAdd.length} characters (${ADD.length - toAdd.length} already existed).`);
console.log(`Total: ${final.length} characters\n`);
toAdd.forEach(c => console.log(`  + [${c.id}] ${c.name} (${c.status})`));

// Verify no missing critical fields
const issues = final.filter(c => !c.status || !c.arcOfDebut || !c.image || !c.gender || !c.rank || !c.affiliation?.length);
if (issues.length) {
  console.log('\n⚠ Characters with missing fields:');
  issues.forEach(c => console.log(`  [${c.id}] ${c.name}`));
} else {
  console.log('\n✓ All characters have complete critical fields');
}
