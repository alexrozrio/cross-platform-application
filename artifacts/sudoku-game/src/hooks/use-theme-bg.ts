import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'brain-games-bg-custom-';
const ENABLED_KEY = 'brain-games-bg-enabled';

/** Default Unsplash background images keyed by colour-theme ID */
export const THEME_BG_DEFAULTS: Record<string, string> = {
  light:     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop',
  dark:      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80&auto=format&fit=crop',
  ocean:     'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80&auto=format&fit=crop',
  forest:    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80&auto=format&fit=crop',
  sunset:    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80&auto=format&fit=crop',
  midnight:  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80&auto=format&fit=crop',
  rose:      'https://images.unsplash.com/photo-1548460616-5d3ef2e0e0b2?w=1920&q=80&auto=format&fit=crop',
  emerald:   'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80&auto=format&fit=crop',
  slate:     'https://images.unsplash.com/photo-1440688807730-73e4e2169fb8?w=1920&q=80&auto=format&fit=crop',
  lavender:  'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1920&q=80&auto=format&fit=crop',
  amber:     'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80&auto=format&fit=crop',
  mocha:     'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80&auto=format&fit=crop',
  neon:      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=80&auto=format&fit=crop',
  cyberpunk: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80&auto=format&fit=crop',
  deepsea:   'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?w=1920&q=80&auto=format&fit=crop',
  obsidian:  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80&auto=format&fit=crop',
  nordic:    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80&auto=format&fit=crop',
  crimson:   'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1920&q=80&auto=format&fit=crop',
};

function readCustomImages(): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(STORAGE_PREFIX)) {
        const id = key.slice(STORAGE_PREFIX.length);
        const v = localStorage.getItem(key);
        if (v) result[id] = v;
      }
    }
  } catch { /* ignore */ }
  return result;
}

function readEnabled(): boolean {
  try {
    const v = localStorage.getItem(ENABLED_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
}

/** Manages per-theme custom background images stored in localStorage. */
export function useThemeBg(themeId: string) {
  const [customImages, setCustomImages] = useState<Record<string, string>>(readCustomImages);
  const [enabled, setEnabledState] = useState<boolean>(readEnabled);

  const hasCustom = !!customImages[themeId];
  const defaultUrl = THEME_BG_DEFAULTS[themeId] ?? null;

  /** The effective background URL for the current theme (custom > default, or null if disabled). */
  const effectiveBg: string | null = enabled
    ? (customImages[themeId] ?? defaultUrl)
    : null;

  const setCustomImage = useCallback((id: string, dataUrl: string) => {
    try { localStorage.setItem(STORAGE_PREFIX + id, dataUrl); } catch { /* ignore */ }
    setCustomImages(prev => ({ ...prev, [id]: dataUrl }));
  }, []);

  const resetCustomImage = useCallback((id: string) => {
    try { localStorage.removeItem(STORAGE_PREFIX + id); } catch { /* ignore */ }
    setCustomImages(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    try { localStorage.setItem(ENABLED_KEY, String(v)); } catch { /* ignore */ }
    setEnabledState(v);
  }, []);

  return {
    effectiveBg,
    enabled,
    setEnabled,
    hasCustom,
    defaultUrl,
    setCustomImage,
    resetCustomImage,
    /** Call this to get the custom image URL for any theme (for the settings UI). */
    getCustomImage: (id: string) => customImages[id] ?? null,
  };
}
