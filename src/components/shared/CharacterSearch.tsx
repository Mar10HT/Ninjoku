import { useState, useRef, useEffect } from 'react';
import type { Character } from '../../types/character';

interface Props {
  characters: Character[];
  excluded: number[];
  onSelect: (character: Character) => void;
  disabled?: boolean;
}

export function CharacterSearch({ characters, excluded, onSelect, disabled }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // All matches (before exclusion) to detect "already guessed" state
  const allMatches = query.length < 1
    ? []
    : characters.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const filtered = allMatches.filter((c) => !excluded.includes(c.id)).slice(0, 8);
  const allExcluded = allMatches.length > 0 && filtered.length === 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(char: Character) {
    onSelect(char);
    setQuery('');
    setOpen(false);
  }

  const showDropdown = open && query.length > 0 && (filtered.length > 0 || allExcluded);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="cs-listbox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        placeholder="Search for a ninja..."
        aria-label="Search for a character"
        className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-ink placeholder:text-muted font-body text-sm focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {showDropdown && (
        <ul
          role="listbox"
          id="cs-listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-fade-slide-down"
        >
          {filtered.map((char) => (
            <li key={char.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => handleSelect(char)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-bg text-left transition-colors"
              >
                <img
                  src={char.image}
                  alt={char.name}
                  loading="lazy"
                  className="w-8 h-8 rounded-full object-cover bg-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/32x32/C8B89A/1A1209?text=?';
                  }}
                />
                <span className="font-body text-sm text-ink">{char.name}</span>
              </button>
            </li>
          ))}
          {allExcluded && (
            <li role="option" aria-selected={false} aria-disabled="true" className="px-4 py-2.5 text-xs text-muted font-body italic">
              Already guessed
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
