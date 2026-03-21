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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const allMatches = query.length < 1
    ? []
    : characters.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const availableMatches = allMatches.filter((c) => !excluded.includes(c.id));
  const filtered = availableMatches.slice(0, 8);
  const hiddenCount = availableMatches.length - filtered.length;
  const allExcluded = allMatches.length > 0 && availableMatches.length === 0;
  const noResults = query.length > 0 && allMatches.length === 0;

  const showDropdown = open && query.length > 0 && (filtered.length > 0 || allExcluded || noResults);

  // Reset focused index when query changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(char: Character) {
    onSelect(char);
    setQuery('');
    setOpen(false);
    setFocusedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      setFocusedIndex(-1);
      return;
    }
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filtered.length) {
        handleSelect(filtered[focusedIndex]);
      }
    }
  }

  const activeDescendant = focusedIndex >= 0 && filtered[focusedIndex]
    ? `cs-option-${filtered[focusedIndex].id}`
    : undefined;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="cs-listbox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={activeDescendant}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
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
          {filtered.map((char, idx) => (
            <li
              key={char.id}
              id={`cs-option-${char.id}`}
              role="option"
              aria-selected={focusedIndex === idx}
              onClick={() => handleSelect(char)}
              onMouseEnter={() => setFocusedIndex(idx)}
              className={`flex items-center gap-3 px-4 py-2 transition-colors cursor-pointer ${
                focusedIndex === idx ? 'bg-bg' : 'hover:bg-bg'
              }`}
            >
              <img
                src={char.image}
                alt={char.name}
                loading="lazy"
                decoding="async"
                className="w-8 h-8 rounded-full object-cover bg-border flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <span className="font-body text-sm text-ink">{char.name}</span>
            </li>
          ))}
          {hiddenCount > 0 && (
            <li
              role="option"
              aria-selected={false}
              aria-disabled="true"
              className="px-4 py-2.5 text-xs text-muted font-body italic border-t border-border"
            >
              +{hiddenCount} more — keep typing to narrow down
            </li>
          )}
          {allExcluded && (
            <li
              role="option"
              aria-selected={false}
              aria-disabled="true"
              className="px-4 py-2.5 text-xs text-muted font-body italic"
            >
              Already guessed
            </li>
          )}
          {noResults && (
            <li
              role="option"
              aria-selected={false}
              aria-disabled="true"
              className="px-4 py-2.5 text-xs text-muted font-body italic"
            >
              No characters found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
