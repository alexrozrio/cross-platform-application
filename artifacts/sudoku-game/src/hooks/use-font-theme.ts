import { useState, useEffect } from 'react';
import fontThemesConfig from '@/config/font-themes.json';
import { useAuth } from '@/hooks/use-auth';
import { useGetProfile, useUpdateProfile } from '@workspace/api-client-react';

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
const FONT_THEME_CHANGE = 'brain-games-font-theme-changed';

function applyFont(id: FontThemeId) {
  const theme = FONT_THEMES.find(f => f.id === id) ?? FONT_THEMES[0];
  document.documentElement.style.setProperty('--app-font-sans', theme.sans);
  document.documentElement.style.setProperty('--app-font-serif', theme.serif);
}

export function useFontTheme() {
  const { profileId } = useAuth();
  const { data: profile } = useGetProfile(profileId as number);
  const updateProfile = useUpdateProfile();
  const storageKey = `${STORAGE_KEY}-${profileId ?? 'guest'}`;
  const [fontId, setFontIdState] = useState<FontThemeId>(() => {
    try {
      return (localStorage.getItem(storageKey) as FontThemeId) ?? 'default';
    } catch {
      return 'default';
    }
  });

  useEffect(() => {
    applyFont(fontId);
  }, [fontId]);

  useEffect(() => {
    if (!profileId) return;
    try {
      const saved = localStorage.getItem(storageKey) as FontThemeId | null;
      setFontIdState(profile?.fontTheme ?? saved ?? 'default');
    } catch {
      setFontIdState(profile?.fontTheme ?? 'default');
    }
  }, [profileId, profile?.fontTheme, storageKey]);

  useEffect(() => {
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ id: FontThemeId; profileId?: number | null }>).detail;
      if (detail?.id && detail.profileId === profileId) setFontIdState(detail.id);
    };
    window.addEventListener(FONT_THEME_CHANGE, handleChange);
    return () => window.removeEventListener(FONT_THEME_CHANGE, handleChange);
  }, [profileId]);

  const setFontId = (id: FontThemeId) => {
    setFontIdState(id);
    applyFont(id);
    try {
      localStorage.setItem(storageKey, id);
    } catch {
      // ignore
    }
    if (profileId) {
      updateProfile.mutate({ id: profileId, data: { fontTheme: id } });
    }
    window.dispatchEvent(new CustomEvent(FONT_THEME_CHANGE, {
      detail: { id, profileId },
    }));
  };

  return { fontId, setFontId };
}
