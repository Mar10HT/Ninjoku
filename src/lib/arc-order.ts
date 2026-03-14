// Chronological arc order derived from scripts/arc-map.ts
export const ARC_ORDER: string[] = [
  // Part I
  'Land of Waves Arc',
  'Chūnin Exams Arc',
  'Konoha Crush Arc',
  'Search for Tsunade Arc',
  'Sasuke Recovery Arc',
  'Filler Arc (Part I)',
  // Shippuden
  'Kazekage Rescue Arc',
  'Tenchi Bridge Reconnaissance Arc',
  'Akatsuki Suppression Arc',
  'Itachi Pursuit Arc',
  'Six-Tails Unleashed Arc',
  "Pain's Assault Arc",
  'Past Arc (Filler)',
  'Five Kage Summit Arc',
  'Fourth Shinobi War: Countdown',
  'Fourth Shinobi War Arc',
  'Fourth Shinobi War: Climax',
  "Birth of the Ten-Tails' Jinchūriki",
  'Kaguya Ōtsutsuki Strikes Arc',
  'Epilogue Arc',
  // Boruto
  'Academy Entrance Arc',
  'Genin Mission Arc',
  'Versus Momoshiki Arc',
  'Sarada Arc',
  'Mujina Bandits Arc',
  'Kawaki Arc',
  'Boruto Arc',
];

export function arcIndex(name: string): number {
  return ARC_ORDER.indexOf(name);
}
