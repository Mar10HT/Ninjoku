import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDayNumber } from '../lib/seed';
import { HowToPlayModal } from '../components/shared/HowToPlayModal';

interface ModeStats {
  played: number;
  avgGuesses: string;
  avgScore?: string;
}

function getModeStats(mode: string): ModeStats {
  try {
    const raw = localStorage.getItem(`narutodle_stats_${mode}`);
    if (!raw) return { played: 0, avgGuesses: '—' };
    const stats = JSON.parse(raw) as { played?: number; totalGuesses?: number; totalScore?: number };
    const played = stats.played ?? 0;
    if (played === 0) return { played: 0, avgGuesses: '—' };
    if (mode === 'pyramid' && stats.totalScore !== undefined) {
      return { played, avgGuesses: '—', avgScore: (stats.totalScore / played).toFixed(0) };
    }
    const avgGuesses = stats.totalGuesses
      ? (stats.totalGuesses / played).toFixed(1)
      : '—';
    return { played, avgGuesses };
  } catch {
    return { played: 0, avgGuesses: '—' };
  }
}

// Prefetch game assets when user shows intent to navigate (hover/focus on CTA)
function prefetchGameAssets() {
  void import('./ModeSelect');
  void import('./ClassicPage');
}

const MODE_ROWS = [
  { key: 'classic', label: 'CLASSIC', accentClass: 'text-accent' },
  { key: 'grid',    label: 'GRID',    accentClass: 'text-ink/70' },
  { key: 'pyramid', label: 'PYRAMID', accentClass: 'text-forest' },
] as const;

export function Home() {
  const navigate = useNavigate();
  const day = getDayNumber();
  const [showModal, setShowModal] = useState(false);
  useEffect(() => { document.title = 'NARUTODLE — Daily Ninja Puzzle'; }, []);

  const modeStats = MODE_ROWS.map(m => ({ ...m, stats: getModeStats(m.key) }));
  const anyPlayed = modeStats.some(m => m.stats.played > 0);

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Badge */}
      <div
        className="mb-6 px-4 py-1.5 border border-accent/40 rounded-full bg-accent/5 animate-fade-up"
        style={{ animationDelay: '0ms' }}
      >
        <span className="font-mono text-xs text-accent tracking-widest">
          DAILY CHALLENGE #{day}
        </span>
      </div>

      {/* Logo */}
      <h1
        className="font-display font-bold text-6xl md:text-8xl text-ink tracking-widest mb-2 leading-none animate-fade-up"
        style={{ animationDelay: '120ms' }}
      >
        NARUTODLE
      </h1>

      {/* Subtitle */}
      <p
        className="font-body text-base text-muted mb-10 tracking-wide animate-fade-up"
        style={{ animationDelay: '240ms' }}
      >
        Guess the hidden ninja
      </p>

      {/* Buttons */}
      <div
        className="flex flex-col items-center gap-3 w-full max-w-xs animate-fade-up"
        style={{ animationDelay: '380ms' }}
      >
        <button
          onClick={() => navigate('/play')}
          onMouseEnter={prefetchGameAssets}
          onFocus={prefetchGameAssets}
          className="w-full py-4 bg-accent text-white font-display font-semibold text-lg tracking-widest rounded-lg hover:bg-accent/90 hover:scale-[1.02] transition-all active:scale-95"
        >
          PLAY TODAY'S CHALLENGE
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3 border border-border text-muted font-display font-semibold text-sm tracking-widest rounded-lg hover:border-ink hover:text-ink transition-colors"
        >
          HOW TO PLAY
        </button>
      </div>

      {/* Stats dashboard */}
      <div
        className="mt-12 border-t border-border pt-8 w-full max-w-xs animate-fade-up"
        style={{ animationDelay: '520ms' }}
      >
        {anyPlayed ? (
          <div className="grid grid-cols-3 divide-x divide-border">
            {modeStats.map(({ key, label, accentClass, stats }) => (
              <div key={key} className="flex flex-col items-center gap-0.5 px-3 text-center">
                <p className={`font-display text-[10px] tracking-widest uppercase font-bold ${accentClass}`}>
                  {label}
                </p>
                <p className="font-mono text-2xl font-bold text-ink leading-none mt-1">
                  {stats.played}
                </p>
                <p className="font-body text-xs text-muted">played</p>
                {key === 'classic' && (
                  <>
                    <p className="font-mono text-sm font-bold text-ink mt-1">{stats.avgGuesses}</p>
                    <p className="font-body text-xs text-muted">avg guesses</p>
                  </>
                )}
                {key === 'pyramid' && stats.avgScore && (
                  <>
                    <p className="font-mono text-sm font-bold text-ink mt-1">{stats.avgScore}</p>
                    <p className="font-body text-xs text-muted">avg pts</p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="font-mono text-xl font-bold text-ink">{day}</p>
              <p className="font-body text-sm text-muted mt-0.5">Current day</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xl font-bold text-ink">—</p>
              <p className="font-body text-sm text-muted mt-0.5">Games played</p>
            </div>
          </div>
        )}
      </div>

      {showModal && <HowToPlayModal onClose={() => setShowModal(false)} />}
    </main>
  );
}
