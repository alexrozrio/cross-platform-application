export type ThemeId = 'shapes' | 'adventure' | 'superhero' | 'ocean' | 'jungle' | 'space';

export interface ImageTheme {
  id: ThemeId;
  name: string;
  preview: string;
  symbols: string[];
  bg: string;
}

export const IMAGE_THEMES: ImageTheme[] = [
  {
    id: 'shapes',
    name: 'Shapes',
    preview: '🔷',
    bg: 'bg-blue-50 border-blue-200',
    symbols: [
      '🔴', '🟦', '🔺', '🔶', '⭐', '🟣', '🩷', '✚', '⚪',
      '💠', '🔸', '🔹', '🟥', '🟨', '🔻', '🌀',
    ],
  },
  {
    id: 'adventure',
    name: 'Dora Adventure',
    preview: '🗺️',
    bg: 'bg-yellow-50 border-yellow-200',
    symbols: [
      '🗺️', '🎒', '🦊', '⭐', '🌺', '🔭', '🔑', '🌈', '🏆',
      '🧭', '⛺', '🌙', '🦋', '🍄', '🪄', '🎯',
    ],
  },
  {
    id: 'superhero',
    name: 'Super Hero',
    preview: '🦸',
    bg: 'bg-red-50 border-red-200',
    symbols: [
      '🦸', '⚡', '🕷️', '🛡️', '💥', '🔥', '🌩️', '🦾', '👊',
      '🦹', '🌪️', '💫', '🦅', '⚔️', '🧲', '🎯',
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    preview: '🌊',
    bg: 'bg-cyan-50 border-cyan-200',
    symbols: [
      '🐬', '🐙', '🦈', '🐠', '🦀', '🐡', '🦑', '🐢', '🦞',
      '🐳', '🦭', '🐚', '🪸', '🦐', '🐟', '🌊',
    ],
  },
  {
    id: 'jungle',
    name: 'Jungle',
    preview: '🌿',
    bg: 'bg-green-50 border-green-200',
    symbols: [
      '🐒', '🦁', '🐘', '🦒', '🦓', '🦏', '🐆', '🦍', '🦜',
      '🐊', '🦎', '🦋', '🍃', '🌴', '🌺', '🐛',
    ],
  },
  {
    id: 'space',
    name: 'Space',
    preview: '🚀',
    bg: 'bg-purple-50 border-purple-200',
    symbols: [
      '🚀', '⭐', '🌙', '☄️', '🪐', '🌟', '💫', '🌍', '🛸',
      '🌌', '🔭', '👽', '🌠', '🛰️', '🌞', '🌑',
    ],
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'shapes';

export function getTheme(id: ThemeId): ImageTheme {
  return IMAGE_THEMES.find(t => t.id === id) ?? IMAGE_THEMES[0];
}

export function getSymbol(theme: ImageTheme, value: number): string {
  return theme.symbols[(value - 1) % theme.symbols.length] ?? '?';
}
