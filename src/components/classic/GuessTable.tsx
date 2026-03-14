import type { Character } from '../../types/character';
import type { GuessFeedback } from '../../lib/feedback';
import { GuessRow } from './GuessRow';

export interface GuessEntry {
  character: Character;
  feedback: GuessFeedback;
}

interface Props {
  guesses: GuessEntry[];
}

const HEADERS = [
  'Character',
  'Affiliation',
  'Clan',
  'Rank',
  'Nature',
  'Kekkei Genkai',
  'Arc',
  'Gender',
  'Status',
];

export function GuessTable({ guesses }: Props) {
  return (
    <div className="relative w-full">
      <p className="md:hidden text-center text-xs text-muted font-body mb-1 opacity-70">← Scroll to see all columns →</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="font-display text-xs tracking-wider text-muted uppercase px-2 py-2.5 text-center border-b border-border bg-bg whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guesses.map((g) => (
              <GuessRow key={g.character.id} character={g.character} feedback={g.feedback} />
            ))}
          </tbody>
        </table>
      </div>
      {/* Scroll fade indicator — visible only on mobile */}
      <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-bg to-transparent pointer-events-none md:hidden" />
    </div>
  );
}
