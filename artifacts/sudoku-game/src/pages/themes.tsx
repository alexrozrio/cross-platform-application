import React from 'react';
import { useImageTheme } from '@/hooks/use-image-theme';
import { ThemeIcon } from '@/components/theme-icons';
import { IMAGE_THEMES } from '@/lib/themes';
import { Check } from 'lucide-react';
import { type ThemeId } from '@/lib/themes';
import { useAuth } from '@/hooks/use-auth';
import { useGetProfile, useUpdateProfile } from '@workspace/api-client-react';
import { applyAppTheme } from '@/components/layout';
import { useFontTheme, FONT_THEMES, type FontThemeId } from '@/hooks/use-font-theme';

const APP_THEMES = [
  { id: 'light',    label: 'Classic',  bg: '#f8f6f0', primary: '#4a6585', accent: '#e8e4da' },
  { id: 'dark',     label: 'Dark',     bg: '#1a1f2e', primary: '#6b8fc4', accent: '#2a3045' },
  { id: 'ocean',    label: 'Ocean',    bg: '#eef7fb', primary: '#2e8a91', accent: '#cce9f0' },
  { id: 'forest',   label: 'Forest',   bg: '#f2f8f2', primary: '#2e6b40', accent: '#cce5cc' },
  { id: 'sunset',   label: 'Sunset',   bg: '#fdf6f0', primary: '#b84e20', accent: '#f0d8c4' },
  { id: 'midnight', label: 'Midnight', bg: '#0f0b1a', primary: '#8b5cf6', accent: '#2a1f40' },
  { id: 'rose',     label: 'Rose',     bg: '#fdf5f7', primary: '#a3254e', accent: '#f0d0da' },
] as const;

export default function Themes() {
  const { themeId, setThemeId } = useImageTheme();
  const { profileId } = useAuth();
  const { data: profile } = useGetProfile(profileId as number, { query: { enabled: !!profileId } });
  const updateProfile = useUpdateProfile();
  const { fontId, setFontId } = useFontTheme();

  // Local state so the selected swatch updates instantly on click
  const [activeAppTheme, setActiveAppTheme] = React.useState<string>(profile?.theme ?? 'light');

  // Sync with server value once loaded
  React.useEffect(() => {
    if (profile?.theme) setActiveAppTheme(profile.theme);
  }, [profile?.theme]);

  const handleAppTheme = (id: string) => {
    // Apply immediately — no waiting for API
    setActiveAppTheme(id);
    applyAppTheme(id);
    // Persist to DB if signed in
    if (profileId) {
      updateProfile.mutate({ id: profileId, data: { theme: id } });
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Themes</h1>
        <p className="text-muted-foreground mt-1">
          Personalise the look, feel, and typography of the app, and choose your game icon set.
        </p>
      </div>

      {/* ── App Colour Theme ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-serif font-semibold">Colour Theme</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Changes the background and colour palette of the entire app instantly.
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {APP_THEMES.map(t => {
            const selected = activeAppTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleAppTheme(t.id)}
                className={[
                  'rounded-xl border-2 p-2 flex flex-col items-center gap-1.5 transition-all duration-150 cursor-pointer',
                  selected
                    ? 'border-primary ring-2 ring-primary/30 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:shadow-sm',
                ].join(' ')}
              >
                <div
                  className="w-full h-10 rounded-lg flex items-center justify-center gap-1"
                  style={{ background: t.bg }}
                >
                  <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: t.primary }} />
                  <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: t.accent }} />
                </div>
                <span className="text-[10px] font-medium leading-none">{t.label}</span>
                {selected && (
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="border-t" />

      {/* ── Font Style ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-serif font-semibold">Font Style</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Changes the typeface used throughout the app.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FONT_THEMES.map(f => {
            const selected = fontId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFontId(f.id as FontThemeId)}
                className={[
                  'rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all duration-150 cursor-pointer',
                  selected
                    ? 'border-primary ring-2 ring-primary/30 shadow-sm bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:shadow-sm',
                ].join(' ')}
              >
                <span
                  className="text-3xl font-bold leading-none"
                  style={f.style}
                >
                  Aa
                </span>
                <span className="text-[11px] font-medium">{f.label}</span>
                {selected && (
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="border-t" />

      {/* ── Game Icon Set ────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-serif font-semibold">Game Icon Set</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose the characters used when playing in image mode.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {IMAGE_THEMES.map(theme => {
            const isSelected = themeId === theme.id;
            const names = getCharacterNames(theme.id);
            return (
              <button
                key={theme.id}
                onClick={() => setThemeId(theme.id as ThemeId)}
                className={[
                  'relative text-left rounded-2xl border-2 p-5 transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-primary/6 shadow-md ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm',
                ].join(' ')}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}

                <div className="space-y-3">
                  <h3 className={['text-lg font-bold', isSelected ? 'text-primary' : ''].join(' ')}>
                    {theme.name}
                  </h3>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">9×9</p>
                    <div className="grid grid-cols-9 gap-0.5">
                      {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
                        <ThemeIcon key={n} themeId={theme.id} value={n} size={28} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">16×16 extras</p>
                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: 7 }, (_, i) => i + 10).map(n => (
                        <ThemeIcon key={n} themeId={theme.id} value={n} size={28} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {names.map((name, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <ThemeIcon themeId={theme.id} value={i + 1} size={14} />
                        <span className="text-[10px] text-muted-foreground truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-center text-muted-foreground pb-4">
        All selections are saved automatically.
      </p>
    </div>
  );
}

function getCharacterNames(themeId: ThemeId): string[] {
  const names: Record<ThemeId, string[]> = {
    shapes:    ['Circle', 'Square', 'Triangle', 'Diamond', 'Star', 'Hexagon', 'Heart', 'Cross', 'Ring', 'Cyan Diamond', 'Spiral', 'Crescent', 'Arrow', 'Gear', 'Lightning', 'Infinity'],
    adventure: ['Explorer', 'Fox', 'Map', 'Backpack', 'Flower', 'Telescope', 'Key', 'Rainbow', 'Trophy', 'Compass', 'Campfire', 'Lantern', 'Butterfly', 'Mushroom', 'Magic Wand', 'Dartboard'],
    superhero: ['Spider-Man', 'Superman', 'Batman', 'Wonder Woman', 'Iron Man', 'Cap America', 'Thor', 'Hulk', 'The Flash', 'Villain', 'Tornado', 'Sparkle', 'Eagle', 'Crossed Swords', 'Magnet', 'Bullseye'],
    ocean:     ['Dolphin', 'Octopus', 'Shark', 'Clownfish', 'Crab', 'Pufferfish', 'Squid', 'Turtle', 'Lobster', 'Whale', 'Seal', 'Seashell', 'Coral', 'Shrimp', 'Fish', 'Wave'],
    jungle:    ['Monkey', 'Lion', 'Elephant', 'Giraffe', 'Zebra', 'Rhino', 'Leopard', 'Gorilla', 'Parrot', 'Crocodile', 'Lizard', 'Butterfly', 'Leaf Cluster', 'Palm Tree', 'Hibiscus', 'Caterpillar'],
    space:     ['Rocket', 'Star', 'Moon', 'Comet', 'Saturn', 'Earth', 'Alien', 'UFO', 'Astronaut', 'Galaxy', 'Telescope', 'Shooting Star', 'Satellite', 'Sun', 'New Moon', 'Mars'],
  };
  return names[themeId] ?? [];
}
