import type { Character } from '../../types/character';
import type { GuessFeedback } from '../../lib/feedback';
import { FieldCell } from './FieldCell';

interface Props {
  character: Character;
  feedback: GuessFeedback;
}

export function GuessRow({ character, feedback }: Props) {
  return (
    <tr>
      {/* Character cell — row header for screen readers */}
      <th scope="row" className="bg-surface border border-border px-3 py-2 min-w-[120px] animate-fade-in font-normal text-left">
        <div className="flex items-center gap-2">
          <img
            src={character.image}
            alt={character.name}
            loading="lazy"
            decoding="async"
            className="w-9 h-9 rounded-full object-cover bg-border flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
          <span className="font-body text-sm text-ink leading-tight">{character.name}</span>
        </div>
      </th>
      <FieldCell value={character.affiliation}        feedback={feedback.affiliation}  col={1} />
      <FieldCell value={character.clan || '—'}        feedback={feedback.clan}         col={2} />
      <FieldCell value={character.rank || '—'}        feedback={feedback.rank}         col={3} />
      <FieldCell value={character.natureType}         feedback={feedback.natureType}   col={4} />
      <FieldCell value={character.kekkeiGenkai}       feedback={feedback.kekkeiGenkai} col={5} />
      <FieldCell value={character.arcOfDebut || '—'} feedback={feedback.arcOfDebut}   col={6} />
      <FieldCell value={character.gender || '—'}     feedback={feedback.gender}        col={7} />
      <FieldCell value={character.status || '—'}     feedback={feedback.status}        col={8} />
    </tr>
  );
}
