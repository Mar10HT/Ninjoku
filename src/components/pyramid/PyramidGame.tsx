import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Character } from '../../types/character';
import { getDailyPyramid, ROW_BONUSES } from '../../lib/pyramid-seed';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getTodayKey } from '../../lib/seed';
import { CharacterSearch } from '../shared/CharacterSearch';
import { PyramidCell, type PyramidCellState } from './PyramidCell';
import charactersData from '../../data/characters.json';
import { BORUTO_ARCS } from '../../lib/arc-order';

const characters = (charactersData as Character[]).filter(c => !BORUTO_ARCS.has(c.arcOfDebut));

// Row sizes: rows[0] = top = 1 cell, rows[3] = bottom = 4 cells
const ROW_SIZES = [1, 2, 3, 4];

interface CellData {
  status: 'pending' | 'correct' | 'wrong';
  character?: Character;
  score?: number;
}

interface StoredPyramidState {
  cells: CellData[][];
  totalScore: number;
  finished: boolean;
}

export function PyramidGame() {
  const navigate = useNavigate();
  const todayKey = getTodayKey();
  const storageKey = `narutodle_pyramid_${todayKey}`;

  const { criteria } = useMemo(() => getDailyPyramid(characters), []);

  const [stored, setStored] = useLocalStorage<StoredPyramidState | null>(storageKey, null);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  // Pending guess: character selected but not yet confirmed (prevents accidental submissions)
  const [pendingGuess, setPendingGuess] = useState<Character | null>(null);

  const initialCells: CellData[][] = ROW_SIZES.map(size =>
    Array(size).fill(null).map(() => ({ status: 'pending' as const })),
  );

  const cells: CellData[][] = stored?.cells ?? initialCells;
  const totalScore = stored?.totalScore ?? 0;
  const finished = stored?.finished ?? false;

  // Auto-navigate if already finished (immediate — no delay needed on reload)
  useEffect(() => {
    if (finished) {
      const won = cells.flat().some(c => c.status === 'correct');
      navigate('/results', {
        replace: true,
        state: { won, mode: 'pyramid', guesses: 10, maxGuesses: 10, character: null, score: totalScore },
      });
    }
  // Intentional: run only on mount to redirect if today's pyramid was already finished
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Characters used (both correct and wrong — can't retry)
  const usedIds = cells.flat()
    .filter(c => c.character)
    .map(c => c.character!.id);

  function saveState(newCells: CellData[][], newScore: number, newFinished: boolean) {
    setStored({ cells: newCells, totalScore: newScore, finished: newFinished });
  }

  function handleCellClick(row: number, col: number) {
    if (finished) return;
    const cell = cells[row][col];
    if (cell.status !== 'pending') return;
    // Toggle: clicking the active cell deselects it
    if (activeCell?.[0] === row && activeCell?.[1] === col) {
      setActiveCell(null);
      setPendingGuess(null);
    } else {
      setActiveCell([row, col]);
      setPendingGuess(null); // reset pending when switching cells
    }
  }

  function handleGuess(character: Character) {
    if (!activeCell || finished) return;
    setPendingGuess(null);
    const [row, col] = activeCell;

    const criterion = criteria[row];
    const valid = criterion.matches(character);

    const newCells = cells.map(r => r.map(c => ({ ...c })));

    if (valid) {
      const eligible = characters.filter(criterion.matches).length;
      const rarity = Math.max(1, Math.round((1 / eligible) * 100));
      const score = Math.max(0, ROW_BONUSES[row] - rarity);
      newCells[row][col] = { status: 'correct', character, score };
      const newTotal = totalScore + score;

      const allFilled = newCells.flat().every(c => c.status !== 'pending');
      saveState(newCells, newTotal, allFilled);
      setActiveCell(null);

      if (allFilled) {
        const won = newCells.flat().some(c => c.status === 'correct');
        setTimeout(() => navigate('/results', {
          state: { won, mode: 'pyramid', guesses: 10, maxGuesses: 10, character: null, score: newTotal },
        }), 1200);
      }
    } else {
      newCells[row][col] = { status: 'wrong', character };
      const allFilled = newCells.flat().every(c => c.status !== 'pending');
      saveState(newCells, totalScore, allFilled);
      setActiveCell(null);

      if (allFilled) {
        const won = newCells.flat().some(c => c.status === 'correct');
        setTimeout(() => navigate('/results', {
          state: { won, mode: 'pyramid', guesses: 10, maxGuesses: 10, character: null, score: totalScore },
        }), 1200);
      }
    }
  }

  const guessesUsed = cells.flat().filter(c => c.status !== 'pending').length;
  const guessesLeft = 10 - guessesUsed;

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6 max-w-2xl mx-auto w-full">
      {/* Score + guesses */}
      <div className="flex items-center gap-6 font-mono text-sm text-muted">
        <span>Score: <span key={totalScore} className="text-ink font-bold text-base animate-score-pop inline-block">{totalScore}</span></span>
        <span>Guesses: <span className="text-ink font-bold text-base">{guessesLeft}</span> left</span>
      </div>

      {/* Pyramid */}
      <div className="flex flex-col items-center gap-2 w-full">
        {criteria.map((criterion, rowIdx) => {
          const rowSize = ROW_SIZES[rowIdx];
          const isActiveRow = activeCell?.[0] === rowIdx;

          return (
            <div key={criterion.id} className="flex flex-col items-center gap-1">
              {/* Criterion label */}
              <div className={`px-3 py-0.5 rounded-full text-xs font-display tracking-wider uppercase cursor-default transition-colors duration-200 ${
                isActiveRow
                  ? 'bg-accent text-white'
                  : 'bg-border/40 text-muted'
              }`}>
                {criterion.label}
                <span className="ml-1 opacity-60 font-mono text-[10px]">+{ROW_BONUSES[rowIdx]}</span>
              </div>
              {/* Cells */}
              <div className="flex gap-2 justify-center">
                {Array(rowSize).fill(null).map((_, colIdx) => {
                  const cell = cells[rowIdx][colIdx];
                  const isThisActive =
                    activeCell?.[0] === rowIdx && activeCell?.[1] === colIdx;

                  let state: PyramidCellState;
                  if (cell.status === 'correct' && cell.character) {
                    state = { status: 'correct', character: cell.character, score: cell.score ?? 0 };
                  } else if (cell.status === 'wrong' && cell.character) {
                    state = { status: 'wrong', character: cell.character };
                  } else if (isThisActive) {
                    state = { status: 'active' };
                  } else {
                    state = { status: 'pending' };
                  }

                  return (
                    <PyramidCell
                      key={colIdx}
                      state={state}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search / confirm */}
      {!finished && activeCell && !pendingGuess && (
        <div className="w-full max-w-md">
          <p className="font-display text-xs text-muted text-center mb-2 uppercase tracking-wider">
            Must match: <span className="text-ink">{criteria[activeCell[0]].label}</span>
          </p>
          <CharacterSearch
            characters={characters}
            excluded={usedIds}
            onSelect={setPendingGuess}
          />
        </div>
      )}

      {/* Confirm step — prevents accidental permanent guesses */}
      {!finished && activeCell && pendingGuess && (
        <div className="w-full max-w-md bg-surface border border-border rounded-lg p-4 flex flex-col gap-3 animate-slide-up-scale">
          <div className="flex items-center gap-3">
            <img
              src={pendingGuess.image}
              alt={pendingGuess.name}
              className="w-10 h-10 rounded-full object-cover bg-border flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-bold text-ink truncate">{pendingGuess.name}</p>
              <p className="font-mono text-xs text-miss">This guess is permanent.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleGuess(pendingGuess)}
              className="flex-1 py-2 bg-accent text-white font-display font-bold text-xs tracking-widest rounded-lg hover:bg-accent/90 transition-colors"
            >
              CONFIRM
            </button>
            <button
              onClick={() => setPendingGuess(null)}
              className="flex-1 py-2 border border-border text-muted font-display font-bold text-xs tracking-widest rounded-lg hover:border-ink hover:text-ink transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {!finished && !activeCell && (
        <p className="font-body text-sm text-muted opacity-60">
          Select a cell to place your ninja.
        </p>
      )}

      {finished && (
        <p className="font-display text-lg text-match font-bold tracking-wide">
          Mission complete — {totalScore} pts!
        </p>
      )}
    </div>
  );
}
