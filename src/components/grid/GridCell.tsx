import type { Character } from '../../types/character';

export type CellState =
  | { status: 'empty' }
  | { status: 'active' }
  | { status: 'correct'; character: Character; rarity: number }
  | { status: 'wrong'; flash?: boolean };

interface Props {
  state: CellState;
  onClick: () => void;
}

export function GridCell({ state, onClick }: Props) {
  if (state.status === 'correct') {
    return (
      <div
        className="relative aspect-square min-h-[60px] rounded-lg overflow-hidden border-2 border-match animate-pop-in"
        role="img"
        aria-label={`${state.character.name} — correct, ${state.rarity}% rarity`}
      >
        <img
          src={state.character.image}
          alt={state.character.name}
          className="w-full h-full object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/60x60/C8B89A/1A1209?text=?'; }}
        />
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-match/80 px-1 py-0.5">
          <span className="font-display text-lg text-white leading-none truncate block text-center">
            {state.character.name}
          </span>
        </div>
        {/* Rarity badge */}
        <span className="absolute top-0.5 right-1 font-mono text-[8px] text-white font-bold drop-shadow">
          {state.rarity}%
        </span>
      </div>
    );
  }

  if (state.status === 'wrong') {
    return (
      <div
        className={`flex items-center justify-center bg-miss/10 border-2 border-miss rounded-lg aspect-square min-h-[60px] ${state.flash ? 'animate-shake' : ''}`}
        role="img"
        aria-label="Wrong guess"
      >
        <span className="text-miss text-2xl font-bold" aria-hidden="true">✗</span>
      </div>
    );
  }

  if (state.status === 'active') {
    return (
      <button
        onClick={onClick}
        className="flex items-center justify-center border-2 border-accent rounded-lg aspect-square min-h-[60px] bg-accent/5 w-full transition-colors active:scale-95"
        aria-label="Active cell — type to search"
      >
        <span className="text-accent text-2xl font-bold" aria-hidden="true">?</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center border-2 border-dashed border-border rounded-lg aspect-square min-h-[60px] hover:border-accent hover:bg-accent/5 transition-colors w-full active:scale-95"
      aria-label="Empty cell — click to guess"
    >
      <span className="text-muted/50 text-2xl" aria-hidden="true">?</span>
    </button>
  );
}
