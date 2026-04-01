import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import type { Character } from '../types/character';
import { Navbar } from '../components/layout/Navbar';
import { getTodayKey } from '../lib/seed';

interface ResultsState {
  won: boolean;
  character: Character | null;
  guesses: number;
  maxGuesses: number;
  mode: string;
  score?: number;
}

function computeCountdown(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function useCountdown(): string {
  // Lazy initializer avoids empty-string flash on first render
  const [label, setLabel] = useState(computeCountdown);

  useEffect(() => {
    const id = setInterval(() => setLabel(computeCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  return label;
}

/** Visual summary of today's Grid result (reads from localStorage). */
function GridSummary() {
  const key = `narutodle_grid_${getTodayKey()}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { cells } = JSON.parse(raw) as { cells: { status: string }[][] };
    return (
      <div className="grid grid-cols-3 gap-1.5">
        {cells.map((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                cell.status === 'correct'
                  ? 'bg-match text-white'
                  : 'bg-miss/10 border border-miss/40 text-miss'
              }`}
            >
              {cell.status === 'correct' ? '✓' : '✗'}
            </div>
          ))
        )}
      </div>
    );
  } catch {
    return null;
  }
}

/** Visual summary of today's Pyramid result (reads from localStorage). */
function PyramidSummary({ score }: { score: number }) {
  const key = `narutodle_pyramid_${getTodayKey()}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { cells } = JSON.parse(raw) as { cells: { status: string }[][] };
    return (
      <div className="flex flex-col items-center gap-2">
        {cells.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 justify-center">
            {row.map((cell, ci) => (
              <div
                key={ci}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                  cell.status === 'correct'
                    ? 'bg-match text-white'
                    : cell.status === 'wrong'
                      ? 'bg-miss text-white'
                      : 'bg-border/40 text-muted'
                }`}
              >
                {cell.status === 'correct' ? '✓' : cell.status === 'wrong' ? '✗' : '·'}
              </div>
            ))}
          </div>
        ))}
        <p className="font-mono text-sm font-bold text-ink mt-1">{score} pts total</p>
      </div>
    );
  } catch {
    return null;
  }
}

function isResultsState(s: unknown): s is ResultsState {
  if (!s || typeof s !== 'object') return false;
  const r = s as Record<string, unknown>;
  return (
    typeof r.won === 'boolean' &&
    typeof r.guesses === 'number' &&
    typeof r.mode === 'string'
  );
}

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const rawState = location.state;
  const state: ResultsState | null = isResultsState(rawState) ? rawState : null;
  const countdown = useCountdown();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  useEffect(() => { document.title = 'Results — NARUTODLE'; }, []);

  // Save stats once per game (dedup by mode+date to survive StrictMode double-invoke)
  useEffect(() => {
    if (!state) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const dedupKey = `narutodle_stats_counted_${state.mode}_${dateStr}`;
    if (localStorage.getItem(dedupKey)) return;
    localStorage.setItem(dedupKey, '1');
    try {
      const statsKey = `narutodle_stats_${state.mode}`;
      const raw = localStorage.getItem(statsKey);
      const prev = raw ? (JSON.parse(raw) as {
        played?: number;
        totalGuesses?: number;
        totalScore?: number;
        streak?: number;
        maxStreak?: number;
        lastWonDate?: string;
      }) : {};
      const played = (prev.played ?? 0) + 1;

      // Streak: only tracked for Classic and Grid (modes with win/loss)
      let streak = prev.streak ?? 0;
      let maxStreak = prev.maxStreak ?? 0;
      let lastWonDate = prev.lastWonDate;
      if (state.mode !== 'pyramid' && state.won) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
        streak = lastWonDate === yesterdayStr ? streak + 1 : 1;
        maxStreak = Math.max(maxStreak, streak);
        lastWonDate = dateStr;
      } else if (state.mode !== 'pyramid' && !state.won) {
        streak = 0;
      }

      if (state.mode === 'pyramid' && state.score !== undefined) {
        const totalScore = (prev.totalScore ?? 0) + state.score;
        localStorage.setItem(statsKey, JSON.stringify({ played, totalScore }));
      } else {
        const totalGuesses = (prev.totalGuesses ?? 0) + state.guesses;
        localStorage.setItem(statsKey, JSON.stringify({ played, totalGuesses, streak, maxStreak, lastWonDate }));
      }
    } catch {
      // ignore
    }
  // Intentional: run only on mount — dedup key prevents double-counting in StrictMode
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return <Navigate to="/" replace />;

  const { won, character, guesses, maxGuesses, mode, score } = state;

  // Whether a visual summary card is shown (affects animation timing)
  const hasCard = !!character || mode === 'grid' || mode === 'pyramid';

  function buildClassicEmojiGrid(): string {
    try {
      const key = `narutodle_classic_${getTodayKey()}`;
      const raw = localStorage.getItem(key);
      if (!raw) return '';
      const { guesses: entries } = JSON.parse(raw) as {
        guesses: { feedback: Record<string, string> }[];
      };
      const FIELDS = ['affiliation', 'clan', 'rank', 'natureType', 'kekkeiGenkai', 'arcOfDebut', 'gender', 'status'];
      return entries
        .map((g) =>
          FIELDS.map((f) => {
            const v = g.feedback[f];
            if (v === 'match') return '🟢';
            if (v === 'partial') return '🟡';
            if (v === 'higher') return '🔼';
            if (v === 'lower') return '🔽';
            return '🔴';
          }).join('')
        )
        .join('\n');
    } catch {
      return '';
    }
  }

  function handleShare() {
    const emoji = won ? '✅' : '❌';
    let text: string;
    if (mode === 'grid') {
      text = `🎮 NARUTODLE — GRID\n${emoji} ${guesses}/9 cells correct!`;
    } else if (mode === 'pyramid') {
      text = `🎮 NARUTODLE — PYRAMID\n${emoji} Final score: ${score ?? 0} pts!`;
    } else {
      const grid = buildClassicEmojiGrid();
      text = `🎮 NARUTODLE — CLASSIC\n${emoji} ${won ? `Got it in ${guesses} guess${guesses !== 1 ? 'es' : ''}!` : `Couldn't get it (${guesses} guess${guesses !== 1 ? 'es' : ''} used)`}${grid ? `\n\n${grid}` : ''}`;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 3000);
      });
    } else {
      // Fallback for browsers without clipboard API
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 3000);
      }
    }
  }

  function renderSubtitle() {
    if (mode === 'grid') {
      return <p className="font-body text-muted text-sm">{guesses}/9 cells correct</p>;
    }
    if (mode === 'pyramid') {
      return <p className="font-body text-muted text-sm">Final score: <span className="font-bold text-ink">{score ?? 0}</span> pts</p>;
    }
    return (
      <p className="font-body text-muted text-sm">
        {won
          ? `You got it in ${guesses} guess${guesses !== 1 ? 'es' : ''}!`
          : `You used ${guesses} of ${maxGuesses} guesses.`}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-8">
        {/* Result */}
        <div className="text-center animate-fade-up" style={{ animationDelay: '60ms' }}>
          <p className={`font-display text-4xl font-black mb-2 ${won ? 'text-match' : 'text-miss'}`}>
            {won ? 'VICTORY!' : 'DEFEAT!'}
          </p>
          {renderSubtitle()}
        </div>

        {/* Answer card — Classic mode */}
        {character && (
          <div
            className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 w-full max-w-xs animate-fade-up"
            style={{ animationDelay: '220ms' }}
          >
            <p className="font-display text-xs tracking-widest text-muted uppercase">The answer was</p>
            <img
              src={character.image}
              alt={character.name}
              className="w-20 h-20 rounded-full object-cover bg-border"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
            <p className="font-display font-bold text-xl text-ink tracking-wide text-center">
              {character.name}
            </p>
          </div>
        )}

        {/* Grid visual summary */}
        {mode === 'grid' && (
          <div
            className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 w-full max-w-xs animate-fade-up"
            style={{ animationDelay: '220ms' }}
          >
            <p className="font-display text-xs tracking-widest text-muted uppercase">Your grid</p>
            <GridSummary />
          </div>
        )}

        {/* Pyramid visual summary */}
        {mode === 'pyramid' && (
          <div
            className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 w-full max-w-xs animate-fade-up"
            style={{ animationDelay: '220ms' }}
          >
            <p className="font-display text-xs tracking-widest text-muted uppercase">Your pyramid</p>
            <PyramidSummary score={score ?? 0} />
          </div>
        )}

        {/* Countdown */}
        <div
          className="text-center animate-fade-up"
          style={{ animationDelay: hasCard ? '380ms' : '220ms' }}
        >
          <p className="font-body text-xs text-muted uppercase tracking-widest mb-1">
            Next challenge in
          </p>
          <p className="font-mono text-3xl font-bold text-ink">{countdown}</p>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col gap-3 w-full max-w-xs animate-fade-up"
          style={{ animationDelay: hasCard ? '480ms' : '320ms' }}
        >
          <button
            onClick={handleShare}
            className="w-full py-3 bg-accent text-white font-display font-bold text-xs tracking-widest rounded-lg hover:bg-accent/90 hover:scale-[1.02] transition-all active:scale-95"
          >
            {copied ? 'COPIED!' : copyFailed ? 'COPY FAILED — try manually' : 'SHARE RESULT'}
          </button>
          <button
            onClick={() => navigate('/play')}
            className="w-full py-3 border border-border text-muted font-display font-bold text-xs tracking-widest rounded-lg hover:border-ink hover:text-ink transition-colors"
          >
            PLAY ANOTHER MODE
          </button>
        </div>
      </main>
    </div>
  );
}
