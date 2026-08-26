import { useState, useEffect } from 'react';
import { type ThemeId, DEFAULT_THEME_ID } from '@/lib/themes';
import { useAuth } from '@/hooks/use-auth';
import { useGetProfile, useUpdateProfile } from '@workspace/api-client-react';

const STORAGE_KEY = 'sudoku-image-theme';
const IMAGE_THEME_CHANGE = 'brain-games-image-theme-changed';

export function useImageTheme() {
  const { profileId } = useAuth();
  const { data: profile } = useGetProfile(profileId as number);
  const updateProfile = useUpdateProfile();
  const storageKey = `${STORAGE_KEY}-${profileId ?? 'guest'}`;
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return (saved as ThemeId) ?? DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  useEffect(() => {
    if (!profileId) return;
    try {
      const saved = localStorage.getItem(storageKey) as ThemeId | null;
      setThemeIdState((profile?.imageTheme as ThemeId | undefined) ?? saved ?? DEFAULT_THEME_ID);
    } catch {
      setThemeIdState((profile?.imageTheme as ThemeId | undefined) ?? DEFAULT_THEME_ID);
    }
  }, [profileId, profile?.imageTheme, storageKey]);

  useEffect(() => {
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ id: ThemeId; profileId?: number | null }>).detail;
      if (detail?.id && detail.profileId === profileId) setThemeIdState(detail.id);
    };
    window.addEventListener(IMAGE_THEME_CHANGE, handleChange);
    return () => window.removeEventListener(IMAGE_THEME_CHANGE, handleChange);
  }, [profileId]);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(storageKey, id);
    } catch {
      // ignore
    }
    if (profileId) {
      updateProfile.mutate({ id: profileId, data: { imageTheme: id } });
    }
    window.dispatchEvent(new CustomEvent(IMAGE_THEME_CHANGE, {
      detail: { id, profileId },
    }));
  };

  return { themeId, setThemeId };
}
