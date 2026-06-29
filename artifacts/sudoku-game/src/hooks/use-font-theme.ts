import { useState, useEffect } from 'react';
import fontThemesConfig from '@/config/font-themes.json';

export const FONT_THEMES = fontThemesConfig
  .filter(t => t.visible)
  .map(t => ({
    id: t.id,
    label: t.name,
    sans: t.sans,
    serif: t.serif,
    preview: t.preview,
    style: { fontFamily: t.previewFont },
  }));

export type FontThemeId = string;

const STORAGE_KEY = 'sudoku-font-theme';

function applyFont(id: FontThemeId) {
  const theme = FONT_THEMES.find(f => f.id === id) ?? FONT_THEMES[0];
  document.documentElement.style.setProperty('--app-font-sans', theme.sans);
  document.documentElement.style.setProperty('--app-font-serif', theme.serif);
}

export function useFontTheme() {
  const [fontId, setFontIdState] = useState<FontThemeId>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as FontThemeId) ?? 'default';
    } catch {
      return 'default';
    }
  });

  useEffect(() => {
    applyFont(fontId);
  }, [fontId]);

  const setFontId = (id: FontThemeId) => {
    setFontIdState(id);
    applyFont(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  return { fontId, setFontId };
}
