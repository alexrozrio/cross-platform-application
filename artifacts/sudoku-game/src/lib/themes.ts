import iconSetsConfig from '@/config/icon-sets.json';

export type ThemeId = string;

export interface ImageTheme {
  id: ThemeId;
  name: string;
  preview: string;
  symbols: string[];
  bg: string;
}

export const IMAGE_THEMES: ImageTheme[] = iconSetsConfig
  .filter(t => t.visible)
  .map(t => ({
    id: t.id,
    name: t.name,
    preview: t.preview,
    symbols: t.symbols,
    bg: t.bg,
  }));

export const DEFAULT_THEME_ID: ThemeId = 'shapes';

export function getTheme(id: ThemeId): ImageTheme {
  return IMAGE_THEMES.find(t => t.id === id) ?? IMAGE_THEMES[0];
}

export function getSymbol(theme: ImageTheme, value: number): string {
  return theme.symbols[(value - 1) % theme.symbols.length] ?? '?';
}
