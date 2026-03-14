import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDayNumber } from '../lib/seed';
import { HowToPlayModal } from '../components/shared/HowToPlayModal';

function getLocalStats(): { played: number; avgGuesses: string } {
  try {
    const raw = localStorage.getItem('narutodle_stats_classic');
    if (!raw) return { played: 0, avgGuesses: '—' };
    const stats = JSON.parse(raw) as { played?: number; totalGuesses?: number };
    const played = stats.played ?? 0;
    const avg = played > 0 && stats.totalGuesses
      ? (stats.totalGuesses / played).toFixed(1)
      : '—';
    return { played, avgGuesses: avg };
  } catch {
    return { played: 0, avgGuesses: '—' };
  }
}

// Prefetch game assets when user shows intent to navigate (hover/focus on CTA)
function prefetchGameAssets() {
  void import('./ModeSelect');
  void import('./ClassicPage');
}

export function Home() {
  const navigate = useNavigate();
  const day = getDayNumber();
  const [showModal, setShowModal] = useState(false);
  const { played, avgGuesses } = getLocalStats();
  useEffect(() => { document.title = 'NARUTODLE — Daily Ninja Puzzle'; }, []);

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
        style={{ animationDelay: '80ms' }}
      >
        NARUTODLE
      </h1>

      {/* Subtitle */}
      <p
        className="font-body text-base text-muted mb-10 tracking-wide animate-fade-up"
        style={{ animationDelay: '160ms' }}
      >
        Guess the hidden ninja
      </p>

      {/* Buttons */}
      <div
        className="flex flex-col items-center gap-3 w-full max-w-xs animate-fade-up"
        style={{ animationDelay: '240ms' }}
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

      {/* Stats row */}
      <div
        className="flex gap-8 mt-12 border-t border-border pt-8 animate-fade-up"
        style={{ animationDelay: '360ms' }}
      >
        {[
          { label: 'Current day', value: String(day) },
          { label: 'Games played', value: played > 0 ? String(played) : '—' },
          { label: 'Avg guesses', value: avgGuesses },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-mono text-xl font-bold text-ink">{stat.value}</p>
            <p className="font-body text-sm text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {showModal && <HowToPlayModal onClose={() => setShowModal(false)} />}
    </main>
  );
}
