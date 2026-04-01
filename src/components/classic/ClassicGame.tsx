import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Character } from '../../types/character';
import { getDailyCharacter, getTodayKey } from '../../lib/seed';
import { compareCharacters } from '../../lib/feedback';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CharacterSearch } from '../shared/CharacterSearch';
import { GuessTable, type GuessEntry } from './GuessTable';
import { CLUE_STATUS_AFTER, CLUE_AFFILIATION_AFTER, RESULTS_NAVIGATE_DELAY_MS } from '../../lib/constants';
import { characters } from '../../data/characters-filtered';

// Pro mode: 1 guess only. Casual: unlimited (clues unlock progressively).
const PRO_MAX_GUESSES = 1;

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
  const isPro = difficulty === 'pro';

  const target = useMemo(() => getDailyCharacter(characters), []);

  const [stored, setStored] = useLocalStorage<StoredState | null>(storageKey, null);

  const validStored = stored && stored.targetId === target.id ? stored : null;
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
    // Pro: lose after 1 wrong guess. Casual: never auto-lose.
    const lost = !won && isPro && newGuesses.length >= PRO_MAX_GUESSES;
    const newState: GameState = won ? 'won' : lost ? 'lost' : 'playing';

    saveState(newGuesses, newState);

    if (newState !== 'playing') {
      setTimeout(() => {
        navigate('/results', {
          state: {
            won,
            character: target,
            guesses: newGuesses.length,
            mode: 'classic',
          },
        });
      }, RESULTS_NAVIGATE_DELAY_MS);
    }
  }

  const excluded = guesses.map((g) => g.character.id);
  const failedGuesses = guesses.filter((g) => g.character.id !== target.id).length;

  // Progressive clues unlock after N failed guesses (casual only)
  const showStatusClue = !isPro && failedGuesses >= CLUE_STATUS_AFTER;
  const showAffiliationClue = !isPro && failedGuesses >= CLUE_AFFILIATION_AFTER;

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 max-w-5xl mx-auto w-full">
      {/* Guess counter */}
      {gameState === 'playing' && (
        <div className="flex flex-col items-center gap-1.5">
          {isPro ? (
            // Pro: show fixed dots
            <div className="flex gap-1.5">
              {Array.from({ length: PRO_MAX_GUESSES }).map((_, i) => {
                const used = i < guesses.length;
                const current = i === guesses.length;
                return (
                  <span key={i} aria-hidden="true" className={`text-base leading-none transition-all ${used ? 'text-miss opacity-60' : current ? 'text-accent scale-125' : 'text-border'}`}>
                    ✦
                  </span>
                );
              })}
            </div>
          ) : (
            // Casual: show count + next clue hint
            <div className="flex flex-col items-center gap-0.5">
              <p className="font-body text-sm text-muted">
                Attempt <span className="font-bold text-ink">{guesses.length + 1}</span>
              </p>
              {!showStatusClue && (
                <p className="font-body text-[11px] text-muted/70">
                  Status clue in {CLUE_STATUS_AFTER - failedGuesses} wrong {CLUE_STATUS_AFTER - failedGuesses === 1 ? 'guess' : 'guesses'}
                </p>
              )}
              {showStatusClue && !showAffiliationClue && (
                <p className="font-body text-[11px] text-muted/70">
                  Affiliation clue in {CLUE_AFFILIATION_AFTER - failedGuesses} wrong {CLUE_AFFILIATION_AFTER - failedGuesses === 1 ? 'guess' : 'guesses'}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progressive clues banner (casual only) */}
      {gameState === 'playing' && (showStatusClue || showAffiliationClue) && (
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
          {showStatusClue && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-partial/15 border border-partial/30 rounded-full">
              <span className="text-xs font-display tracking-wide text-partial uppercase">Status</span>
              <span className="font-mono text-xs font-bold text-ink">{target.status}</span>
            </div>
          )}
          {showAffiliationClue && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-partial/15 border border-partial/30 rounded-full">
              <span className="text-xs font-display tracking-wide text-partial uppercase">Affiliation</span>
              <span className="font-mono text-xs font-bold text-ink">{Array.isArray(target.affiliation) ? target.affiliation[0] : target.affiliation}</span>
            </div>
          )}
        </div>
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
