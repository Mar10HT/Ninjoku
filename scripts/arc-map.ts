// Arc map: maps episode numbers to arc names for Naruto, Shippuden, and Boruto

type Series = 'Naruto' | 'Shippuden' | 'Boruto';

interface ArcEntry {
  series: Series;
  start: number;
  end: number;
  name: string;
}

const ARC_TABLE: ArcEntry[] = [
  // Naruto (Part I)
  { series: 'Naruto', start: 1,   end: 19,  name: 'Land of Waves Arc' },
  { series: 'Naruto', start: 20,  end: 67,  name: 'Chūnin Exams Arc' },
  { series: 'Naruto', start: 68,  end: 80,  name: 'Konoha Crush Arc' },
  { series: 'Naruto', start: 81,  end: 100, name: 'Search for Tsunade Arc' },
  { series: 'Naruto', start: 101, end: 135, name: 'Sasuke Recovery Arc' },
  { series: 'Naruto', start: 136, end: 219, name: 'Filler Arc (Part I)' },

  // Naruto Shippūden
  { series: 'Shippuden', start: 1,   end: 32,  name: 'Kazekage Rescue Arc' },
  { series: 'Shippuden', start: 33,  end: 69,  name: 'Tenchi Bridge Reconnaissance Arc' },
  { series: 'Shippuden', start: 70,  end: 89,  name: 'Akatsuki Suppression Arc' },
  { series: 'Shippuden', start: 90,  end: 112, name: 'Itachi Pursuit Arc' },
  { series: 'Shippuden', start: 113, end: 143, name: 'Six-Tails Unleashed Arc' },
  { series: 'Shippuden', start: 144, end: 175, name: "Pain's Assault Arc" },
  { series: 'Shippuden', start: 176, end: 196, name: 'Past Arc (Filler)' },
  { series: 'Shippuden', start: 197, end: 222, name: 'Five Kage Summit Arc' },
  { series: 'Shippuden', start: 223, end: 256, name: 'Fourth Shinobi War: Countdown' },
  { series: 'Shippuden', start: 257, end: 320, name: 'Fourth Shinobi War Arc' },
  { series: 'Shippuden', start: 321, end: 348, name: 'Fourth Shinobi War: Climax' },
  { series: 'Shippuden', start: 349, end: 361, name: "Birth of the Ten-Tails' Jinchūriki" },
  { series: 'Shippuden', start: 362, end: 413, name: 'Kaguya Ōtsutsuki Strikes Arc' },
  { series: 'Shippuden', start: 414, end: 500, name: 'Epilogue Arc' },

  // Boruto
  { series: 'Boruto', start: 1,   end: 15,  name: 'Academy Entrance Arc' },
  { series: 'Boruto', start: 16,  end: 32,  name: 'Genin Mission Arc' },
  { series: 'Boruto', start: 33,  end: 66,  name: 'Versus Momoshiki Arc' },
  { series: 'Boruto', start: 67,  end: 95,  name: 'Sarada Arc' },
  { series: 'Boruto', start: 96,  end: 128, name: 'Mujina Bandits Arc' },
  { series: 'Boruto', start: 129, end: 219, name: 'Kawaki Arc' },
  { series: 'Boruto', start: 220, end: 9999, name: 'Boruto Arc' },
];

/**
 * Maps a raw debut string from the Dattebayo API to an arc name.
 * Input examples:
 *   "Naruto Episode #1"
 *   "Naruto Shippūden Episode #130"
 *   "Boruto Episode #5"
 *   "Naruto Episode #25 (Heard; Not Shown)"
 * Returns the arc name, or the original string if it cannot be parsed.
 */
export function getArcOfDebut(raw: string): string {
  if (!raw) return '';

  // Strip trailing parentheticals, e.g. " (Heard; Not Shown)"
  const cleaned = raw.replace(/\s*\([^)]*\)/g, '').trim();

  // Match "Naruto Episode #N", "Naruto Shippūden Episode #N", "Boruto Episode #N"
  const match = cleaned.match(/^(Naruto Shipp[uū]den|Naruto|Boruto)\s+Episode\s+#(\d+)$/i);
  if (!match) return cleaned;

  const seriesRaw = match[1].toLowerCase();
  const episode = parseInt(match[2], 10);

  let series: Series;
  if (seriesRaw.includes('shipp')) {
    series = 'Shippuden';
  } else if (seriesRaw === 'boruto') {
    series = 'Boruto';
  } else {
    series = 'Naruto';
  }

  const arc = ARC_TABLE.find(
    (a) => a.series === series && episode >= a.start && episode <= a.end
  );

  return arc?.name ?? cleaned;
}
