import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import type { Character } from '../types/character';
import { Navbar } from '../components/layout/Navbar';

interface ResultsState {
  won: boolean;
  character: Character | null;
  guesses: number;
  maxGuesses: number;
  mode: string;
  score?: number;
}

function useCountdown(): string {
  const [label, setLabel] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return label;
}

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;
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
      const prev = raw ? (JSON.parse(raw) as { played?: number; totalGuesses?: number }) : {};
      const played = (prev.played ?? 0) + 1;
      const totalGuesses = (prev.totalGuesses ?? 0) + state.guesses;
      localStorage.setItem(statsKey, JSON.stringify({ played, totalGuesses }));
    } catch {
      // ignore
    }
  // Intentional: run only on mount — dedup key prevents double-counting in StrictMode
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return <Navigate to="/" replace />;

  const { won, character, guesses, maxGuesses, mode, score } = state;

  function handleShare() {
    const emoji = won ? '✅' : '❌';
    let text: string;
    if (mode === 'grid') {
      text = `🎮 NARUTODLE — GRID\n${emoji} ${guesses}/9 cells correct!`;
    } else if (mode === 'pyramid') {
      text = `🎮 NARUTODLE — PYRAMID\n${emoji} Final score: ${score ?? 0} pts!`;
    } else {
      text = `🎮 NARUTODLE\n${emoji} ${won ? `Got it in ${guesses}/${maxGuesses} guesses!` : `Didn't get it (${guesses}/${maxGuesses} guesses used)`}${character ? `\nThe answer was: ${character.name}` : ''}`;
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

        {/* Answer card — only for Classic mode (character is not null) */}
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
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/80x80/C8B89A/1A1209?text=?';
              }}
            />
            <p className="font-display font-bold text-xl text-ink tracking-wide text-center">
              {character.name}
            </p>
          </div>
        )}

        {/* Countdown */}
        <div
          className="text-center animate-fade-up"
          style={{ animationDelay: character ? '380ms' : '220ms' }}
        >
          <p className="font-body text-xs text-muted uppercase tracking-widest mb-1">
            Next challenge in
          </p>
          <p className="font-mono text-3xl font-bold text-ink">{countdown}</p>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col gap-3 w-full max-w-xs animate-fade-up"
          style={{ animationDelay: character ? '480ms' : '320ms' }}
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
