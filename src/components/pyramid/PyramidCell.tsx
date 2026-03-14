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
        className="relative flex flex-col items-center justify-center bg-match/10 border-2 border-match rounded-lg p-1.5 w-16 h-16 cursor-default animate-pop-in"
        role="img"
        aria-label={`${state.character.name} — correct, +${state.score} pts`}
      >
        <img
          src={state.character.image}
          alt={state.character.name}
          className="w-7 h-7 rounded-full object-cover bg-border"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/28x28/C8B89A/1A1209?text=?'; }}
        />
        <span className="font-display text-[9px] text-ink text-center leading-tight mt-0.5 line-clamp-1 w-full px-0.5">
          {state.character.name}
        </span>
        <span className="absolute top-0.5 right-1 font-mono text-[8px] text-match font-bold">
          +{state.score}
        </span>
      </div>
    );
  }

  if (state.status === 'wrong') {
    return (
      <div
        className="relative flex flex-col items-center justify-center bg-miss/10 border-2 border-miss rounded-lg p-1.5 w-16 h-16 cursor-default animate-fade-in"
        role="img"
        aria-label={`${state.character.name} — wrong`}
      >
        <img
          src={state.character.image}
          alt={state.character.name}
          className="w-7 h-7 rounded-full object-cover bg-border opacity-60"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/28x28/C8B89A/1A1209?text=?'; }}
        />
        <span className="font-display text-[9px] text-miss text-center leading-tight mt-0.5 line-clamp-1 w-full px-0.5">
          {state.character.name}
        </span>
        <span className="absolute top-0.5 right-1 font-mono text-[8px] text-miss font-bold">✗</span>
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
