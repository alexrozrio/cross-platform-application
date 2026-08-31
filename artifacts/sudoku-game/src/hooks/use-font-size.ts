import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGetProfile, useUpdateProfile } from '@workspace/api-client-react';

export const FONT_SIZE_OPTIONS = [
  { id: 'small', label: 'Small', description: 'More content on screen', scale: 0.875 },
  { id: 'default', label: 'Medium', description: 'Balanced for everyday use', scale: 1 },
  { id: 'large', label: 'Large', description: 'Easier to read', scale: 1.125 },
  { id: 'extra-large', label: 'Extra Large', description: 'Maximum readability', scale: 1.25 },
] as const;

export type FontSizeId = typeof FONT_SIZE_OPTIONS[number]['id'];

const STORAGE_KEY = 'sudoku-font-size';
const FONT_SIZE_CHANGE = 'brain-games-font-size-changed';
const DEFAULT_FONT_SIZE: FontSizeId = 'default';

function isFontSizeId(value: string | null): value is FontSizeId {
  return FONT_SIZE_OPTIONS.some(option => option.id === value);
}

function applyFontSize(id: FontSizeId) {
  const option = FONT_SIZE_OPTIONS.find(item => item.id === id) ?? FONT_SIZE_OPTIONS[1];
  document.documentElement.style.setProperty('--app-font-size', `${option.scale * 100}%`);
  document.documentElement.dataset.fontSize = id;
}

export function useFontSize() {
  const { profileId } = useAuth();
  const { data: profile } = useGetProfile(profileId as number);
  const updateProfile = useUpdateProfile();
  const storageKey = `${STORAGE_KEY}-${profileId ?? 'guest'}`;
  const [fontSizeId, setFontSizeState] = useState<FontSizeId>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return isFontSizeId(stored) ? stored : DEFAULT_FONT_SIZE;
    } catch {
      return DEFAULT_FONT_SIZE;
    }
  });

  useEffect(() => {
    applyFontSize(fontSizeId);
  }, [fontSizeId]);

  useEffect(() => {
    if (!profileId) return;
    try {
      const saved = localStorage.getItem(storageKey);
      setFontSizeState(profile?.fontSize ?? (isFontSizeId(saved) ? saved : DEFAULT_FONT_SIZE));
    } catch {
      setFontSizeState(profile?.fontSize ?? DEFAULT_FONT_SIZE);
    }
  }, [profileId, profile?.fontSize, storageKey]);

  useEffect(() => {
    const handleChange = (event: Event) => {
      const id = (event as CustomEvent<FontSizeId>).detail;
      if (isFontSizeId(id)) setFontSizeState(id);
    };
    window.addEventListener(FONT_SIZE_CHANGE, handleChange);
    return () => window.removeEventListener(FONT_SIZE_CHANGE, handleChange);
  }, []);

  const setFontSize = (id: FontSizeId) => {
    if (!isFontSizeId(id)) return;
    setFontSizeState(id);
    applyFontSize(id);
    try {
      localStorage.setItem(storageKey, id);
    } catch {
      // Ignore storage failures; the preference still applies for this session.
    }
    if (profileId) {
      updateProfile.mutate({ id: profileId, data: { fontSize: id } });
    }
    window.dispatchEvent(new CustomEvent(FONT_SIZE_CHANGE, { detail: id }));
  };

  return { fontSizeId, setFontSize };
}