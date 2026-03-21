import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Character } from '../../types/character';
import { getIntersection } from '../../lib/criteria';
import { getDailyGrid } from '../../lib/grid-seed';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getTodayKey } from '../../lib/seed';
import { CharacterSearch } from '../shared/CharacterSearch';
import { GridCell, type CellState } from './GridCell';
import { RESULTS_NAVIGATE_DELAY_MS } from '../../lib/constants';
import { characters } from '../../data/characters-filtered';

interface CellData {
  status: 'empty' | 'correct' | 'wrong';
  character?: Character;
  rarity?: number;
}

interface StoredGridState {
  cells: CellData[][];
  gameState: 'playing' | 'won' | 'lost';
  wrongTotal: number;
}

export function GridGame() {
  const navigate = useNavigate();
  const todayKey = getTodayKey();
  const storageKey = `narutodle_grid_${todayKey}`;

  const difficulty = useLocalStorage<'casual' | 'pro'>('narutodle_difficulty_grid', 'casual')[0];
  const { rows, cols } = useMemo(() => getDailyGrid(characters), []);

  const [stored, setStored] = useLocalStorage<StoredGridState | null>(storageKey, null);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [wrongFlash, setWrongFlash] = useState<[number, number] | null>(null);

  const initialCells: CellData[][] = Array(3).fill(null).map(() =>
    Array(3).fill(null).map(() => ({ status: 'empty' as const })),
  );

  const cells: CellData[][] = stored?.cells ?? initialCells;
  const gameState = stored?.gameState ?? 'playing';
  const wrongTotal = stored?.wrongTotal ?? 0;

  // Auto-navigate if already finished (immediate — no delay needed on reload)
  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      const correct = cells.flat().filter(c => c.status === 'correct').length;
      navigate('/results', {
        replace: true,
        state: { won: gameState === 'won', mode: 'grid', guesses: correct, maxGuesses: 9, character: null },
      });
    }
  // Intentional: run only on mount to redirect if today's game was already finished
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usedIds = cells.flat()
    .filter(c => c.status === 'correct' && c.character)
    .map(c => c.character!.id);

  function saveState(newCells: CellData[][], newGameState: typeof gameState, newWrong: number) {
    setStored({ cells: newCells, gameState: newGameState, wrongTotal: newWrong });
  }

  function handleCellClick(row: number, col: number) {
    if (gameState !== 'playing') return;
    if (cells[row][col].status === 'correct') return;
    setActiveCell([row, col]);
  }

  function handleGuess(character: Character) {
    if (!activeCell || gameState !== 'playing') return;
    const [row, col] = activeCell;

    const valid = rows[row].matches(character) && cols[col].matches(character);

    if (valid) {
      const eligible = getIntersection(rows[row], cols[col], characters)
        .filter(c => !usedIds.includes(c.id));
      const rarity = Math.max(1, Math.round((1 / eligible.length) * 100));
      const newCells = cells.map(r => r.map(c => ({ ...c })));
      newCells[row][col] = { status: 'correct', character, rarity };

      const allCorrect = newCells.flat().every(c => c.status === 'correct');
      const newState = allCorrect ? 'won' : 'playing';
      saveState(newCells, newState, wrongTotal);
      setActiveCell(null);

      if (newState === 'won') {
        setTimeout(() => navigate('/results', {
          state: { won: true, mode: 'grid', guesses: 9, maxGuesses: 9, character: null },
        }), RESULTS_NAVIGATE_DELAY_MS);
      }
    } else {
      const newWrong = wrongTotal + 1;
      if (difficulty === 'pro') {
        const newCells = cells.map(r => r.map(c => ({ ...c })));
        newCells[row][col] = { status: 'wrong' };
        saveState(newCells, 'lost', newWrong);
        setTimeout(() => navigate('/results', {
          state: { won: false, mode: 'grid', guesses: cells.flat().filter(c => c.status === 'correct').length, maxGuesses: 9, character: null },
        }), RESULTS_NAVIGATE_DELAY_MS);
      } else {
        setWrongFlash([row, col]);
        saveState(cells, 'playing', newWrong);
        setTimeout(() => setWrongFlash(null), 800);
      }
    }
  }

  const correctCount = cells.flat().filter(c => c.status === 'correct').length;

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 max-w-2xl mx-auto w-full">
      {/* Score bar */}
      <div className="flex items-center gap-6 font-mono text-sm text-muted">
        <span>
          <span className="text-match font-bold text-base">{correctCount}</span>
          <span>/9 correct</span>
        </span>
        {wrongTotal > 0 && (
          <span>
            <span className="text-miss font-bold text-base">{wrongTotal}</span>
            <span> wrong</span>
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="w-full">
        {/* Column headers */}
        <div className="grid grid-cols-[minmax(60px,96px)_1fr_1fr_1fr] gap-2 mb-1">
          <div />
          {cols.map(col => (
            <div key={col.id} className="flex items-center justify-center px-1 py-1">
              <span
                title={col.label}
                className="inline-block px-2 py-1 rounded-full bg-border/30 font-display text-xs tracking-wide text-ink uppercase text-center leading-tight font-semibold line-clamp-2 break-words"
              >
                {col.label}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((rowCrit, ri) => (
          <div key={rowCrit.id} className="grid grid-cols-[minmax(60px,96px)_1fr_1fr_1fr] gap-2 mb-2">
            <div className="flex items-center justify-end pr-2">
              <span
                title={rowCrit.label}
                className="inline-block px-2 py-1 rounded-full bg-border/30 font-display text-xs tracking-wide text-ink uppercase text-right leading-tight font-semibold line-clamp-2 break-words"
              >
                {rowCrit.label}
              </span>
            </div>
            {cols.map((_col, ci) => {
              const cell = cells[ri][ci];
              const isFlash = wrongFlash?.[0] === ri && wrongFlash?.[1] === ci;

              let state: CellState;
              if (isFlash) {
                state = { status: 'wrong', flash: true };
              } else if (cell.status === 'correct' && cell.character) {
                state = { status: 'correct', character: cell.character, rarity: cell.rarity ?? 0 };
              } else if (cell.status === 'wrong') {
                // Persisted wrong cell (Pro mode game over saved to localStorage)
                state = { status: 'wrong' };
              } else if (activeCell?.[0] === ri && activeCell?.[1] === ci) {
                state = { status: 'active' };
              } else {
                state = { status: 'empty' };
              }

              return (
                <GridCell
                  key={ci}
                  state={state}
                  onClick={() => handleCellClick(ri, ci)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Search area */}
      {gameState === 'playing' && activeCell && (
        <div className="w-full max-w-md">
          <p className="flex items-center justify-center gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-border/30 font-display text-xs tracking-wide text-ink uppercase font-semibold">{rows[activeCell[0]].label}</span>
            <span className="font-mono text-xs text-muted">×</span>
            <span className="px-2 py-0.5 rounded-full bg-border/30 font-display text-xs tracking-wide text-ink uppercase font-semibold">{cols[activeCell[1]].label}</span>
          </p>
          <CharacterSearch
            characters={characters}
            excluded={usedIds}
            onSelect={handleGuess}
          />
        </div>
      )}

      {gameState === 'playing' && !activeCell && !wrongFlash && (
        <p className="font-body text-sm text-muted opacity-60">
          Select a cell to place your ninja.
        </p>
      )}
      {wrongFlash && difficulty === 'casual' && (
        <p className="font-body text-sm text-miss font-bold motion-safe:animate-pulse">
          Wrong! Try a different character.
        </p>
      )}

      {gameState === 'won' && (
        <p className="font-display text-lg text-match font-bold tracking-wide">
          Mission complete! 🎉
        </p>
      )}
      {gameState === 'lost' && (
        <p className="font-display text-lg text-miss font-bold tracking-wide">
          Mission failed.
        </p>
      )}
    </div>
  );
}
