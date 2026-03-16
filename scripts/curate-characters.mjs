// scripts/curate-characters.mjs
// Filters characters.json to the ~150 most well-known Naruto characters,
// fills in missing status and fixes arcOfDebut inconsistencies.
import { readFileSync, writeFileSync } from 'fs';

const chars = JSON.parse(readFileSync('./src/data/characters.json', 'utf8'));

// ─────────────────────────────────────────────
// CURATED LIST — ~150 most well-known characters
// (only names confirmed present in the JSON)
// ─────────────────────────────────────────────
const CURATED = new Set([
  // Team 7 + extended
  'Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno', 'Kakashi Hatake',
  'Yamato', 'Sai', 'Iruka Umino',

  // Team Guy
  'Rock Lee', 'Neji Hyūga', 'Tenten', 'Might Guy', 'Might Duy',

  // Team 8
  'Hinata Hyūga', 'Kiba Inuzuka', 'Shino Aburame', 'Kurenai Yūhi',

  // Team 10
  'Shikamaru Nara', 'Chōji Akimichi', 'Ino Yamanaka', 'Asuma Sarutobi',

  // Hokages
  'Minato Namikaze', 'Hiruzen Sarutobi', 'Hashirama Senju', 'Tobirama Senju', 'Tsunade',

  // Sannin / close
  'Jiraiya', 'Orochimaru', 'Kabuto Yakushi', 'Nonō Yakushi',

  // Uchiha clan
  'Itachi Uchiha', 'Shisui Uchiha', 'Obito Uchiha', 'Fugaku Uchiha', 'Mikoto Uchiha',
  'Izumi Uchiha', 'Rin Nohara',

  // Konoha jonin / special
  'Anko Mitarashi', 'Hayate Gekkō', 'Yūgao Uzuki', 'Genma Shiranui', 'Raidō Namiashi',
  'Kotetsu Hagane', 'Izumo Kamizuki', 'Shizune', 'Ebisu', 'Aoba Yamashiro', 'Ibiki Morino',
  'Sakumo Hatake',

  // Clan parents
  'Hiashi Hyūga', 'Hizashi Hyūga', 'Hanabi Hyūga',
  'Inoichi Yamanaka', 'Shikaku Nara', 'Yoshino Nara', 'Chōza Akimichi',
  'Shibi Aburame', 'Tsume Inuzuka', 'Hana Inuzuka',

  // Konoha historical
  'Nawaki', 'Dan Katō', 'Biwako Sarutobi', 'Torifu Akimichi',

  // Root / Danzo's agents
  'Torune Aburame', 'Fū Yamanaka',

  // Sound Four
  'Jirobo', 'Kidomaru', 'Sakon', 'Tayuya',

  // Next gen Konoha
  'Konohamaru Sarutobi', 'Moegi Kazamatsuri', 'Udon Ise', 'Mirai Sarutobi',
  'Ensui Nara',

  // Sand Village
  'Gaara', 'Temari', 'Kankurō', 'Rasa', 'Baki', 'Yashamaru', 'Ebizō', 'Matsuri',
  'Third Kazekage',

  // Cloud Village
  'A (Fourth Raikage)', 'A (Third Raikage)', 'Darui', 'Samui', 'Omoi', 'Karui', 'C',
  'Mabui', 'Yugito Nii', 'Atsui', 'Dodai',

  // Mist Village
  'Zabuza Momochi', 'Mei Terumī', 'Chōjūrō', 'Ao', 'Yagura Karatachi',
  'Mangetsu Hōzuki', 'Gengetsu Hōzuki', 'Third Mizukage', 'Kagura Karatachi', 'Karin',

  // Seven Swordsmen of the Mist
  'Jūzō Biwa', 'Ameyuri Ringo', 'Fuguki Suikazan', 'Jinpachi Munashi',
  'Kushimaru Kuriarare', 'Jinin Akebino', 'Raiga Kurosuki',

  // Stone Village
  'Ōnoki', 'Kurotsuchi', 'Akatsuchi', 'Mū', 'Kitsuchi',

  // Jinchuriki / notable side
  'Fū', 'Pakura', 'Gari',

  // Filler / minor but memorable
  'Aoi Rokushō', 'Shibuki', 'Kosuke Maruboshi', 'Idate Morino',
  'Yoroi Akadō', 'Mugino',

  // Boruto generation
  'Boruto Uzumaki', 'Sarada Uchiha', 'Mitsuki', 'Kawaki', 'Himawari Uzumaki',
  'Shinki', 'Shikadai Nara', 'Inojin Yamanaka', 'Chōchō Akimichi', 'Metal Lee',
  'Denki Kaminarimon', 'Iwabee Yuino', 'Wasabi Izuno', 'Sumire Kakei',
  'Namida Suzumeno', 'Hōki Taketori',
]);

// ─────────────────────────────────────────────
// STATUS OVERRIDES (Alive / Deceased)
// ─────────────────────────────────────────────
const STATUS = {
  // Team 7
  'Naruto Uzumaki': 'Alive', 'Sasuke Uchiha': 'Alive', 'Sakura Haruno': 'Alive',
  'Kakashi Hatake': 'Alive', 'Yamato': 'Alive', 'Sai': 'Alive', 'Iruka Umino': 'Alive',
  // Team Guy
  'Rock Lee': 'Alive', 'Neji Hyūga': 'Deceased', 'Tenten': 'Alive',
  'Might Guy': 'Alive', 'Might Duy': 'Deceased',
  // Team 8
  'Hinata Hyūga': 'Alive', 'Kiba Inuzuka': 'Alive', 'Shino Aburame': 'Alive', 'Kurenai Yūhi': 'Alive',
  // Team 10
  'Shikamaru Nara': 'Alive', 'Chōji Akimichi': 'Alive', 'Ino Yamanaka': 'Alive',
  'Asuma Sarutobi': 'Deceased',
  // Hokages
  'Minato Namikaze': 'Deceased', 'Hiruzen Sarutobi': 'Deceased',
  'Hashirama Senju': 'Deceased', 'Tobirama Senju': 'Deceased', 'Tsunade': 'Alive',
  // Sannin / close
  'Jiraiya': 'Deceased', 'Orochimaru': 'Alive', 'Kabuto Yakushi': 'Alive',
  'Nonō Yakushi': 'Deceased',
  // Uchiha
  'Itachi Uchiha': 'Deceased', 'Shisui Uchiha': 'Deceased', 'Obito Uchiha': 'Deceased',
  'Fugaku Uchiha': 'Deceased', 'Mikoto Uchiha': 'Deceased',
  'Izumi Uchiha': 'Deceased', 'Rin Nohara': 'Deceased',
  // Konoha jonin
  'Anko Mitarashi': 'Alive', 'Hayate Gekkō': 'Deceased', 'Yūgao Uzuki': 'Alive',
  'Genma Shiranui': 'Alive', 'Raidō Namiashi': 'Alive', 'Kotetsu Hagane': 'Alive',
  'Izumo Kamizuki': 'Alive', 'Shizune': 'Alive', 'Ebisu': 'Alive',
  'Aoba Yamashiro': 'Alive', 'Ibiki Morino': 'Alive', 'Sakumo Hatake': 'Deceased',
  // Clan parents
  'Hiashi Hyūga': 'Alive', 'Hizashi Hyūga': 'Deceased', 'Hanabi Hyūga': 'Alive',
  'Inoichi Yamanaka': 'Deceased', 'Shikaku Nara': 'Deceased', 'Yoshino Nara': 'Alive',
  'Chōza Akimichi': 'Alive', 'Shibi Aburame': 'Alive', 'Tsume Inuzuka': 'Alive',
  'Hana Inuzuka': 'Alive',
  // Historical
  'Nawaki': 'Deceased', 'Dan Katō': 'Deceased',
  'Biwako Sarutobi': 'Deceased', 'Torifu Akimichi': 'Alive',
  // Root
  'Torune Aburame': 'Deceased', 'Fū Yamanaka': 'Deceased',
  // Sound Four
  'Jirobo': 'Deceased', 'Kidomaru': 'Deceased', 'Sakon': 'Deceased', 'Tayuya': 'Deceased',
  // Next gen Konoha
  'Konohamaru Sarutobi': 'Alive', 'Moegi Kazamatsuri': 'Alive', 'Udon Ise': 'Alive',
  'Mirai Sarutobi': 'Alive', 'Ensui Nara': 'Alive',
  // Sand
  'Gaara': 'Alive', 'Temari': 'Alive', 'Kankurō': 'Alive', 'Rasa': 'Deceased',
  'Baki': 'Alive', 'Yashamaru': 'Deceased', 'Ebizō': 'Alive', 'Matsuri': 'Alive',
  'Third Kazekage': 'Deceased',
  // Cloud
  'A (Fourth Raikage)': 'Alive', 'A (Third Raikage)': 'Deceased',
  'Darui': 'Alive', 'Samui': 'Alive', 'Omoi': 'Alive', 'Karui': 'Alive',
  'C': 'Alive', 'Mabui': 'Deceased', 'Yugito Nii': 'Deceased',
  'Atsui': 'Alive', 'Dodai': 'Alive',
  // Mist
  'Zabuza Momochi': 'Deceased', 'Mei Terumī': 'Alive', 'Chōjūrō': 'Alive',
  'Ao': 'Deceased', 'Yagura Karatachi': 'Deceased', 'Mangetsu Hōzuki': 'Deceased',
  'Gengetsu Hōzuki': 'Deceased', 'Third Mizukage': 'Deceased',
  'Kagura Karatachi': 'Deceased', 'Karin': 'Alive',
  // Seven Swordsmen
  'Jūzō Biwa': 'Deceased', 'Ameyuri Ringo': 'Deceased', 'Fuguki Suikazan': 'Deceased',
  'Jinpachi Munashi': 'Deceased', 'Kushimaru Kuriarare': 'Deceased',
  'Jinin Akebino': 'Deceased', 'Raiga Kurosuki': 'Deceased',
  // Stone
  'Ōnoki': 'Deceased', 'Kurotsuchi': 'Alive', 'Akatsuchi': 'Alive',
  'Mū': 'Deceased', 'Kitsuchi': 'Alive',
  // Other
  'Fū': 'Deceased', 'Pakura': 'Deceased', 'Gari': 'Deceased',
  'Aoi Rokushō': 'Deceased', 'Shibuki': 'Alive', 'Kosuke Maruboshi': 'Alive',
  'Idate Morino': 'Alive', 'Yoroi Akadō': 'Alive', 'Mugino': 'Deceased',
  // Boruto gen
  'Boruto Uzumaki': 'Alive', 'Sarada Uchiha': 'Alive', 'Mitsuki': 'Alive',
  'Kawaki': 'Alive', 'Himawari Uzumaki': 'Alive', 'Shinki': 'Alive',
  'Shikadai Nara': 'Alive', 'Inojin Yamanaka': 'Alive', 'Chōchō Akimichi': 'Alive',
  'Metal Lee': 'Alive', 'Denki Kaminarimon': 'Alive', 'Iwabee Yuino': 'Alive',
  'Wasabi Izuno': 'Alive', 'Sumire Kakei': 'Alive', 'Namida Suzumeno': 'Alive',
  'Hōki Taketori': 'Alive',
};

// ─────────────────────────────────────────────
// ARCOFDBUT FIXES (standardize inconsistent names)
// ─────────────────────────────────────────────
const ARC_FIXES = {
  'Sasuke Recovery Mission Arc': 'Sasuke Recovery Arc',
};

// ─────────────────────────────────────────────
// ARCOFDBUT for characters with empty debut arc
// ─────────────────────────────────────────────
const ARC_FILL = {
  'Biwako Sarutobi': 'Konoha Crush Arc',       // shown in Nine-Tails attack flashback
  'Torifu Akimichi': 'Chūnin Exams Arc',       // shown in Konoha history flashback
  'Izumi Uchiha': 'Konoha Crush Arc',           // Itachi Story flashback
  'Dodai': 'Five Kage Summit Arc',
  'Atsui': 'Five Kage Summit Arc',
  'Aoi Rokushō': 'Filler Arc (Part I)',         // Land of Tea arc
  'Raiga Kurosuki': 'Filler Arc (Part I)',      // Curry of Life arc
  'Shibuki': 'Filler Arc (Part I)',             // Land of the Waterfalls arc
  'Kosuke Maruboshi': 'Chūnin Exams Arc',
  'Idate Morino': 'Filler Arc (Part I)',        // Land of Tea arc
  'Yoroi Akadō': 'Chūnin Exams Arc',
  'Mugino': 'Boruto Arc',
};

// ─────────────────────────────────────────────
// FILTER + UPDATE
// ─────────────────────────────────────────────
const filtered = chars.filter(c => CURATED.has(c.name));

const updated = filtered.map(c => {
  const status = STATUS[c.name] ?? c.status ?? '';
  const rawArc = c.arcOfDebut ?? '';
  const arcOfDebut = ARC_FIXES[rawArc] || rawArc || ARC_FILL[c.name] || '';
  return { ...c, status, arcOfDebut };
});

writeFileSync('./src/data/characters.json', JSON.stringify(updated, null, 2));

// ─── Report ───
console.log(`✓ ${updated.length} characters written to characters.json\n`);

const missingStatus = updated.filter(c => !c.status);
const missingArc = updated.filter(c => !c.arcOfDebut);
const missingImage = updated.filter(c => !c.image);

if (missingStatus.length) {
  console.log('⚠ Missing status:');
  missingStatus.forEach(c => console.log(`  [${c.id}] ${c.name}`));
} else {
  console.log('✓ All characters have status');
}

if (missingArc.length) {
  console.log('\n⚠ Missing arcOfDebut:');
  missingArc.forEach(c => console.log(`  [${c.id}] ${c.name}`));
} else {
  console.log('✓ All characters have arcOfDebut');
}

if (missingImage.length) {
  console.log('\n⚠ Missing image:');
  missingImage.forEach(c => console.log(`  [${c.id}] ${c.name}`));
} else {
  console.log('✓ All characters have image');
}

console.log('\nStatus breakdown:');
const alive = updated.filter(c => c.status === 'Alive').length;
const deceased = updated.filter(c => c.status === 'Deceased').length;
console.log(`  Alive: ${alive}, Deceased: ${deceased}`);

// List who was NOT matched from curated list
const foundNames = new Set(updated.map(c => c.name));
const notFound = [...CURATED].filter(n => !foundNames.has(n));
if (notFound.length) {
  console.log('\n⚠ Curated names not found in JSON (check spelling):');
  notFound.forEach(n => console.log(`  "${n}"`));
}
