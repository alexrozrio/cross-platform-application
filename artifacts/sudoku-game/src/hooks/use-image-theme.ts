import { useState, useEffect } from 'react';
import { type ThemeId, DEFAULT_THEME_ID } from '@/lib/themes';

const STORAGE_KEY = 'sudoku-image-theme';

export function useImageTheme() {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved as ThemeId) ?? DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  return { themeId, setThemeId };
}
