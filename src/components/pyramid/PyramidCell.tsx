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
        className="relative aspect-square min-h-[52px] rounded-lg overflow-hidden border-2 border-match cursor-default animate-pop-in"
        role="img"
        aria-label={`${state.character.name} — correct, +${state.score} pts`}
      >
        <img
          src={state.character.image}
          alt={state.character.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
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
        className="relative aspect-square min-h-[52px] rounded-lg overflow-hidden border-2 border-miss cursor-default animate-fade-in"
        role="img"
        aria-label={`${state.character.name} — wrong`}
      >
        <img
          src={state.character.image}
          alt={state.character.name}
          className="w-full h-full object-cover object-top opacity-60"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
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
        className="flex items-center justify-center border-2 border-accent rounded-lg aspect-square min-h-[52px] bg-accent/5 transition-all hover:scale-[1.06] active:scale-95"
        aria-label="Active cell — type to search"
      >
        <span className="text-accent text-xl font-bold" aria-hidden="true">?</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center border-2 border-dashed border-border rounded-lg aspect-square min-h-[52px] opacity-50 hover:opacity-90 hover:border-accent hover:scale-[1.06] transition-all active:scale-95"
      aria-label="Pending cell — click to guess"
    >
      <span className="text-muted text-lg" aria-hidden="true">·</span>
    </button>
  );
}
