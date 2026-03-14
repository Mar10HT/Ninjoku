import { Link } from 'react-router-dom';
import { getDayNumber } from '../../lib/seed';

export function Navbar() {
  const day = getDayNumber();

  return (
    <nav aria-label="Main navigation" className="w-full border-b border-border bg-surface px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-display font-black text-xl text-accent tracking-widest">
        NARUTODLE
      </Link>
      <span className="font-mono text-sm text-muted">
        Day #{day}
      </span>
    </nav>
  );
}
