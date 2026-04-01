import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getDayNumber } from '../../lib/seed';
import { HowToPlayModal, type Tab } from '../shared/HowToPlayModal';
import { useTheme } from '../../hooks/useTheme';

function getDefaultTab(pathname: string): Tab {
  if (pathname.startsWith('/grid')) return 'grid';
  if (pathname.startsWith('/pyramid')) return 'pyramid';
  return 'classic';
}

export function Navbar() {
  const day = getDayNumber();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const [theme, toggleTheme] = useTheme();

  return (
    <nav aria-label="Main navigation" className="w-full border-b border-border bg-surface px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-display font-black text-xl text-accent tracking-widest">
        NARUTODLE
      </Link>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-muted">Day #{day}</span>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted hover:text-ink hover:border-ink transition-colors text-base"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted hover:text-ink hover:border-ink transition-colors font-display font-bold text-sm"
          aria-label="How to play"
        >
          ?
        </button>
      </div>
      {showHelp && (
        <HowToPlayModal
          initialTab={getDefaultTab(location.pathname)}
          onClose={() => setShowHelp(false)}
        />
      )}
    </nav>
  );
}
