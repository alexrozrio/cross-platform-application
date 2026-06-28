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
  {
    id: 'playful',
    label: 'Playful',
    sans: "'Quicksand', sans-serif",
    serif: "'Pacifico', cursive",
    preview: 'Aa',
    style: { fontFamily: "'Pacifico', cursive" },
  },
  {
    id: 'mono',
    label: 'Mono',
    sans: "'Space Mono', monospace",
    serif: "'Space Mono', monospace",
    preview: 'Aa',
    style: { fontFamily: "'Space Mono', monospace" },
  },
  {
    id: 'classic',
    label: 'Classic Serif',
    sans: "'Source Sans 3', sans-serif",
    serif: "'Merriweather', serif",
    preview: 'Aa',
    style: { fontFamily: "'Merriweather', serif" },
  },
  {
    id: 'handwritten',
    label: 'Handwritten',
    sans: "'Karla', sans-serif",
    serif: "'Caveat', cursive",
    preview: 'Aa',
    style: { fontFamily: "'Caveat', cursive" },
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
