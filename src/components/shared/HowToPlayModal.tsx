import { useState, useRef, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

type Tab = 'classic' | 'grid' | 'pyramid';

const TABS: { id: Tab; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'grid', label: 'Grid' },
  { id: 'pyramid', label: 'Pyramid' },
];

function ClassicRules() {
  return (
    <div className="space-y-4 text-sm text-ink font-body">
      <p>
        Guess the mystery Naruto character. After each guess, the colors tell you how close you are.
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded bg-match inline-flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">✓</span>
          <span><strong>Green</strong> — Exact match</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded bg-partial inline-flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">~</span>
          <span><strong>Orange</strong> — Partial match (some values overlap)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded bg-miss inline-flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">✗</span>
          <span><strong>Red</strong> — No match</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded bg-miss inline-flex items-center justify-center text-white text-xs" aria-hidden="true">↑</span>
          <span><strong>Arrow</strong> — The answer is higher/lower in the timeline or rank</span>
        </div>
      </div>
      <div className="border-t border-border pt-3 space-y-1">
        <p className="font-bold">Difficulty</p>
        <p><strong>Casual:</strong> 8 guesses</p>
        <p><strong>Pro:</strong> 1 guess — get it right or lose</p>
      </div>
    </div>
  );
}

function GridRules() {
  return (
    <div className="space-y-4 text-sm text-ink font-body">
      <p>
        Fill a 3×3 grid. Each cell needs a character that matches <strong>both</strong> its row criterion and its column criterion.
      </p>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-match font-bold mt-0.5">✓</span>
          <span>Each character can only be used <strong>once</strong> across the grid.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-match font-bold mt-0.5">✓</span>
          <span>A <strong>rarity %</strong> appears on each correct cell — how often that character was chosen.</span>
        </div>
      </div>
      <div className="border-t border-border pt-3 space-y-1">
        <p className="font-bold">Difficulty</p>
        <p><strong>Casual:</strong> Unlimited wrong guesses per cell — keep trying until you find the right character.</p>
        <p><strong>Pro:</strong> One wrong guess ends the game immediately.</p>
      </div>
    </div>
  );
}

function PyramidRules() {
  return (
    <div className="space-y-4 text-sm text-ink font-body">
      <p>
        Fill a pyramid of 10 cells, tier by tier from top to bottom. Each row has its own criterion.
      </p>
      <div className="bg-bg rounded-lg p-3 font-mono text-xs text-center space-y-1 text-muted">
        <p>[ ]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ← Row 1 · +200 pts</p>
        <p>[ ][ ]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ← Row 2 · +150 pts</p>
        <p>[ ][ ][ ]&nbsp;&nbsp; ← Row 3 · +125 pts</p>
        <p>[ ][ ][ ][ ] ← Row 4 · +100 pts</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-miss font-bold mt-0.5">!</span>
          <span><strong>10 guesses exactly</strong> — one per cell. No extras.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-miss font-bold mt-0.5">!</span>
          <span>A wrong guess <strong>permanently wastes</strong> that slot.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-match font-bold mt-0.5">✓</span>
          <span>No character can appear more than once.</span>
        </div>
      </div>
      <div className="border-t border-border pt-3">
        <p className="font-bold mb-1">Scoring</p>
        <p><strong>Score = Row bonus − rarity %</strong></p>
        <p className="text-muted mt-1">Rarer picks score more. Aim for uncommon characters!</p>
      </div>
    </div>
  );
}

export function HowToPlayModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('classic');
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape key
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus first focusable element inside modal
    const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    return () => {
      previouslyFocused?.focus();
    };
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={handleKeyDown}
        className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="modal-title" className="font-display text-lg font-bold text-ink tracking-wide">
            How to Play
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors p-2 -mr-2 rounded-lg leading-none"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`modal-tab-${t.id}`}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="modal-tabpanel"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-body transition-colors ${
                tab === t.id
                  ? 'text-accent border-b-2 border-accent font-bold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          id="modal-tabpanel"
          role="tabpanel"
          aria-labelledby={`modal-tab-${tab}`}
          className="px-6 py-5 max-h-[60vh] overflow-y-auto"
        >
          {tab === 'classic' && <ClassicRules />}
          {tab === 'grid' && <GridRules />}
          {tab === 'pyramid' && <PyramidRules />}
        </div>
      </div>
    </div>
  );
}
