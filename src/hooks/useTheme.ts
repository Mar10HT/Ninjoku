import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'narutodle_theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }
    // Respect OS dark mode preference on first visit
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  function toggle() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  return [theme, toggle];
}
