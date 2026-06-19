'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  toggleRef: { current: null },
});

/**
 * ThemeProvider — manages light/dark theme state, persists to localStorage,
 * and applies `data-theme` attribute to <html> for CSS variable overrides.
 *
 * Provides a `toggleRef` so the ThemeToggle button can register its position
 * for the circular clip-path reveal animation.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  const toggleRef = useRef(null);

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('habesha-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  // Apply data-theme attribute and persist
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('habesha-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, toggleRef }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
