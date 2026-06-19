import { useState, useEffect } from 'react';

export const FONT_THEMES = [
  {
    id: 'default',
    label: 'Default',
    sans: "'Outfit', sans-serif",
    serif: "'Playfair Display', serif",
    preview: 'Aa',
    style: { fontFamily: "'Outfit', sans-serif" },
  },
  {
    id: 'modern',
    label: 'Modern',
    sans: "'DM Sans', sans-serif",
    serif: "'DM Serif Display', serif",
    preview: 'Aa',
    style: { fontFamily: "'DM Sans', sans-serif" },
  },
  {
    id: 'elegant',
    label: 'Elegant',
    sans: "'Lato', sans-serif",
    serif: "'Cormorant Garamond', serif",
    preview: 'Aa',
    style: { fontFamily: "'Cormorant Garamond', serif" },
  },
  {
    id: 'rounded',
    label: 'Rounded',
    sans: "'Nunito', sans-serif",
    serif: "'Nunito', sans-serif",
    preview: 'Aa',
    style: { fontFamily: "'Nunito', sans-serif" },
  },
] as const;

export type FontThemeId = typeof FONT_THEMES[number]['id'];

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
