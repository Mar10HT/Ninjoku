import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Character } from '../../types/character';
import { getDailyCharacter, getTodayKey } from '../../lib/seed';
import { compareCharacters } from '../../lib/feedback';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CharacterSearch } from '../shared/CharacterSearch';
import { GuessTable, type GuessEntry } from './GuessTable';
import { CLASSIC_CASUAL_GUESSES, RESULTS_NAVIGATE_DELAY_MS } from '../../lib/constants';
import { characters } from '../../data/characters-filtered';

type GameState = 'playing' | 'won' | 'lost';

interface StoredState {
  guesses: GuessEntry[];
  gameState: GameState;
  targetId: number;
}

export function ClassicGame() {
  const navigate = useNavigate();
  const todayKey = getTodayKey();
  const storageKey = `narutodle_classic_${todayKey}`;

  const difficulty = useLocalStorage<'casual' | 'pro'>('narutodle_difficulty_classic', 'casual')[0];
  const maxGuesses = difficulty === 'pro' ? 1 : CLASSIC_CASUAL_GUESSES;

  const target = useMemo(() => getDailyCharacter(characters), []);

  const [stored, setStored] = useLocalStorage<StoredState | null>(storageKey, null);

  // Restore state only if it's for today's character
  const validStored =
    stored && stored.targetId === target.id ? stored : null;

  const guesses: GuessEntry[] = validStored?.guesses ?? [];
  const gameState: GameState = validStored?.gameState ?? 'playing';

  // If game was already finished (restored from localStorage), navigate immediately
  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      navigate('/results', {
        replace: true,
        state: {
          won: gameState === 'won',
          character: target,
          guesses: guesses.length,
          maxGuesses,
          mode: 'classic',
        },
      });
    }
  // Intentional: run only on mount to redirect if today's game was already finished
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveState(newGuesses: GuessEntry[], newGameState: GameState) {
    setStored({ guesses: newGuesses, gameState: newGameState, targetId: target.id });
  }

  function handleSelect(char: Character) {
    if (gameState !== 'playing') return;

    const feedback = compareCharacters(char, target);
    const newGuesses: GuessEntry[] = [...guesses, { character: char, feedback }];

    const won = char.id === target.id;
    const lost = !won && newGuesses.length >= maxGuesses;
    const newState: GameState = won ? 'won' : lost ? 'lost' : 'playing';

    saveState(newGuesses, newState);

    if (newState !== 'playing') {
      setTimeout(() => {
        navigate('/results', {
          state: {
            won,
            character: target,
            guesses: newGuesses.length,
            maxGuesses,
            mode: 'classic',
          },
        });
      }, RESULTS_NAVIGATE_DELAY_MS);
    }
  }

  const excluded = guesses.map((g) => g.character.id);

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 max-w-5xl mx-auto w-full">
      {/* Status banner */}
      {gameState === 'playing' && (
        <p className="font-body text-sm text-muted">
          Guess #{guesses.length + 1} of {maxGuesses}
        </p>
      )}
      {gameState === 'won' && (
        <p className="font-display text-lg text-match font-bold tracking-wide">
          You found the ninja! 🎉
        </p>
      )}
      {gameState === 'lost' && (
        <p className="font-display text-lg text-miss font-bold tracking-wide">
          Mission failed. Return at dawn.
        </p>
      )}

      {/* Search input */}
      {gameState === 'playing' && (
        <CharacterSearch
          characters={characters}
          excluded={excluded}
          onSelect={handleSelect}
          disabled={gameState !== 'playing'}
        />
      )}

      {/* Guess table */}
      {guesses.length > 0 && (
        <GuessTable guesses={guesses} />
      )}

      {guesses.length === 0 && gameState === 'playing' && (
        <p className="text-muted font-body text-sm opacity-60">
          Name the hidden ninja.
        </p>
      )}
    </div>
  );
}
