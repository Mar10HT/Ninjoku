import type { Character } from '../../types/character';

export type PyramidCellState =
  | { status: 'pending' }
  | { status: 'active' }
  | { status: 'correct'; character: Character; score: number }
  | { status: 'wrong'; character: Character };

interface Props {
  state: PyramidCellState;
  onClick?: () => void;
}

export function PyramidCell({ state, onClick }: Props) {
  if (state.status === 'correct') {
    return (
      <div
        className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-match cursor-default animate-pop-in"
        role="img"
        aria-label={`${state.character.name} — correct, +${state.score} pts`}
      >
        <img
          src={state.character.image}
          alt={state.character.name}
          className="w-full h-full object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/C8B89A/1A1209?text=?'; }}
        />
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-match/80 px-1 py-0.5">
          <span className="font-display text-lg text-white leading-none truncate block text-center">
            {state.character.name}
          </span>
        </div>
        {/* Score badge */}
        <span className="absolute top-0.5 right-1 font-mono text-[8px] text-white font-bold drop-shadow">
          +{state.score}
        </span>
      </div>
    );
  }

  if (state.status === 'wrong') {
    return (
      <div
        className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-miss cursor-default animate-fade-in"
        role="img"
        aria-label={`${state.character.name} — wrong`}
      >
        <img
          src={state.character.image}
          alt={state.character.name}
          className="w-full h-full object-cover object-top opacity-60"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/C8B89A/1A1209?text=?'; }}
        />
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-miss/80 px-1 py-0.5">
          <span className="font-display text-lg text-white leading-none truncate block text-center">
            {state.character.name}
          </span>
        </div>
        <span className="absolute top-0.5 right-1 font-mono text-[8px] text-white font-bold drop-shadow">✗</span>
      </div>
    );
  }

  if (state.status === 'active') {
    return (
      <button
        onClick={onClick}
        className="flex items-center justify-center border-2 border-accent rounded-lg w-16 h-16 bg-accent/5 transition-colors active:scale-95"
        aria-label="Active cell — type to search"
      >
        <span className="text-accent text-xl font-bold" aria-hidden="true">?</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center border-2 border-dashed border-border rounded-lg w-16 h-16 opacity-50 hover:opacity-80 hover:border-accent transition-all active:scale-95"
      aria-label="Pending cell — click to guess"
    >
      <span className="text-muted text-lg" aria-hidden="true">·</span>
    </button>
  );
}
