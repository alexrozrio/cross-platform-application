import React from 'react';
import { useImageTheme } from '@/hooks/use-image-theme';
import { ThemeIcon } from '@/components/theme-icons';
import { IMAGE_THEMES } from '@/lib/themes';
import { Check, Lock, Gem } from 'lucide-react';
import { type ThemeId } from '@/lib/themes';
import { useAuth } from '@/hooks/use-auth';
import { useGetProfile, useUpdateProfile } from '@workspace/api-client-react';
import { applyAppTheme } from '@/components/layout';
import { useFontTheme, FONT_THEMES, type FontThemeId } from '@/hooks/use-font-theme';
import { useUnlockedItems, useUnlockItem } from '@/hooks/use-unlocked-items';
import { getItemCost, isFreeItem, type ItemType } from '@/lib/item-catalog';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const APP_THEMES = [
  { id: 'light',    label: 'Classic',  bg: '#f8f6f0', primary: '#4a6585', accent: '#e8e4da' },
  { id: 'dark',     label: 'Dark',     bg: '#1a1f2e', primary: '#6b8fc4', accent: '#2a3045' },
  { id: 'ocean',    label: 'Ocean',    bg: '#eef7fb', primary: '#2e8a91', accent: '#cce9f0' },
  { id: 'forest',   label: 'Forest',   bg: '#f2f8f2', primary: '#2e6b40', accent: '#cce5cc' },
  { id: 'sunset',   label: 'Sunset',   bg: '#fdf6f0', primary: '#b84e20', accent: '#f0d8c4' },
  { id: 'midnight', label: 'Midnight', bg: '#0f0b1a', primary: '#8b5cf6', accent: '#2a1f40' },
  { id: 'rose',     label: 'Rose',     bg: '#fdf5f7', primary: '#a3254e', accent: '#f0d0da' },
] as const;

interface PendingUnlock {
  type: ItemType;
  id: string;
  label: string;
  cost: number;
}

export default function Themes() {
  const { themeId, setThemeId } = useImageTheme();
  const { profileId } = useAuth();
  const { data: profile, refetch: refetchProfile } = useGetProfile(profileId as number, { query: { enabled: !!profileId } });
  const updateProfile = useUpdateProfile();
  const { fontId, setFontId } = useFontTheme();
  const { isUnlocked } = useUnlockedItems(profileId);
  const unlockMutation = useUnlockItem(profileId);

  const [activeAppTheme, setActiveAppTheme] = React.useState<string>(profile?.theme ?? 'light');
  const [pendingUnlock, setPendingUnlock] = React.useState<PendingUnlock | null>(null);

  React.useEffect(() => {
    if (profile?.theme) setActiveAppTheme(profile.theme);
  }, [profile?.theme]);

  const gems = profile?.gems ?? 0;

  const handleAppTheme = (id: string) => {
    const type: ItemType = 'color_theme';
    if (!isUnlocked(type, id)) {
      if (!profileId) {
        toast.error('Sign in to unlock themes');
        return;
      }
      setPendingUnlock({ type, id, label: APP_THEMES.find(t => t.id === id)?.label ?? id, cost: getItemCost(type, id) });
      return;
    }
    setActiveAppTheme(id);
    applyAppTheme(id);
    if (profileId) updateProfile.mutate({ id: profileId, data: { theme: id } });
  };

  const handleFont = (id: string) => {
    const type: ItemType = 'font';
    if (!isUnlocked(type, id)) {
      if (!profileId) {
        toast.error('Sign in to unlock fonts');
        return;
      }
      setPendingUnlock({ type, id, label: FONT_THEMES.find(f => f.id === id)?.label ?? id, cost: getItemCost(type, id) });
      return;
    }
    setFontId(id as FontThemeId);
  };

  const handleIconSet = (id: string) => {
    const type: ItemType = 'icon_set';
    if (!isUnlocked(type, id)) {
      if (!profileId) {
        toast.error('Sign in to unlock icon sets');
        return;
      }
      setPendingUnlock({ type, id, label: IMAGE_THEMES.find(t => t.id === id)?.name ?? id, cost: getItemCost(type, id) });
      return;
    }
    setThemeId(id as ThemeId);
  };

  const confirmUnlock = () => {
    if (!pendingUnlock || !profileId) return;
    unlockMutation.mutate(
      { itemType: pendingUnlock.type, itemId: pendingUnlock.id },
      {
        onSuccess: () => {
          toast.success(`${pendingUnlock.label} unlocked!`);
          refetchProfile();
          if (pendingUnlock.type === 'color_theme') {
            setActiveAppTheme(pendingUnlock.id);
            applyAppTheme(pendingUnlock.id);
            if (profileId) updateProfile.mutate({ id: profileId, data: { theme: pendingUnlock.id } });
          } else if (pendingUnlock.type === 'font') {
            setFontId(pendingUnlock.id as FontThemeId);
          } else if (pendingUnlock.type === 'icon_set') {
            setThemeId(pendingUnlock.id as ThemeId);
          }
          setPendingUnlock(null);
        },
        onError: (err) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? err.message;
          toast.error(msg === 'Not enough gems' ? "Not enough gems to unlock this!" : `Failed to unlock: ${msg}`);
          setPendingUnlock(null);
        },
      },
    );
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Themes</h1>
        <p className="text-muted-foreground mt-1">
          Personalise the look, feel, and typography of the app. Locked items can be unlocked with gems.
        </p>
        {profileId && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-800">
            <Gem className="w-3.5 h-3.5" />
            <span>{gems.toLocaleString()} gems available</span>
          </div>
        )}
      </div>

      {/* ── App Colour Theme ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-serif font-semibold">Colour Theme</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Changes the background and colour palette of the entire app.
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {APP_THEMES.map(t => {
            const selected = activeAppTheme === t.id;
            const unlocked = isUnlocked('color_theme', t.id);
            const free = isFreeItem('color_theme', t.id);
            const cost = getItemCost('color_theme', t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleAppTheme(t.id)}
                className={[
                  'relative rounded-xl border-2 p-2 flex flex-col items-center gap-1.5 transition-all duration-150 cursor-pointer',
                  selected
                    ? 'border-primary ring-2 ring-primary/30 shadow-sm'
                    : unlocked
                      ? 'border-border hover:border-primary/40 hover:shadow-sm'
                      : 'border-border hover:border-amber-400/60 hover:shadow-sm',
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
                {selected ? (
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </span>
                ) : !unlocked ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                    <Gem className="w-2.5 h-2.5" />{cost}
                  </span>
                ) : null}
                {!unlocked && (
                  <div className="absolute inset-0 rounded-xl flex items-end justify-center pb-1 pointer-events-none">
                    <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-amber-500/80" />
                  </div>
                )}
                {free && !unlocked && (
                  <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[8px] font-bold px-1 rounded">FREE</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">Classic and Dark are always free. Others unlock with gems.</p>
      </section>

      <div className="border-t" />

      {/* ── Font Style ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-serif font-semibold">Font Style</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Changes the typeface used throughout the app. Default is free — others cost 50 gems each.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FONT_THEMES.map(f => {
            const selected = fontId === f.id;
            const unlocked = isUnlocked('font', f.id);
            const cost = getItemCost('font', f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFont(f.id)}
                className={[
                  'relative rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all duration-150 cursor-pointer',
                  selected
                    ? 'border-primary ring-2 ring-primary/30 shadow-sm bg-primary/5'
                    : unlocked
                      ? 'border-border hover:border-primary/40 hover:shadow-sm'
                      : 'border-border hover:border-amber-400/60 hover:shadow-sm',
                ].join(' ')}
              >
                {!unlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-amber-500/80" />}
                <span
                  className={['text-3xl font-bold leading-none', !unlocked ? 'opacity-50' : ''].join(' ')}
                  style={f.style}
                >
                  Aa
                </span>
                <span className="text-[11px] font-medium">{f.label}</span>
                {selected ? (
                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </span>
                ) : !unlocked ? (
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Gem className="w-2.5 h-2.5" />{cost} gems
                  </span>
                ) : null}
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
            Choose the characters used when playing in image mode. Shapes and Adventure are free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {IMAGE_THEMES.map(theme => {
            const isSelected = themeId === theme.id;
            const unlocked = isUnlocked('icon_set', theme.id);
            const cost = getItemCost('icon_set', theme.id);
            const names = getCharacterNames(theme.id);
            return (
              <button
                key={theme.id}
                onClick={() => handleIconSet(theme.id)}
                className={[
                  'relative text-left rounded-2xl border-2 p-5 transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-primary/6 shadow-md ring-1 ring-primary/20'
                    : unlocked
                      ? 'border-border hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm'
                      : 'border-border hover:border-amber-400/60 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 hover:shadow-sm',
                ].join(' ')}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                {!unlocked && !isSelected && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                    <Gem className="w-3 h-3" />{cost}
                  </span>
                )}

                <div className={['space-y-3', !unlocked ? 'opacity-60' : ''].join(' ')}>
                  <div className="flex items-center gap-2">
                    <h3 className={['text-lg font-bold', isSelected ? 'text-primary' : ''].join(' ')}>
                      {theme.name}
                    </h3>
                    {!unlocked && <Lock className="w-4 h-4 text-amber-500" />}
                  </div>

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

                {!unlocked && (
                  <div className="mt-3 text-center">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Tap to unlock for {cost} gems
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-center text-muted-foreground pb-4">
        Free selections save automatically. Unlocks are permanent.
      </p>

      {/* ── Unlock Confirmation Dialog ────────────────────────────────── */}
      <Dialog open={!!pendingUnlock} onOpenChange={(open) => { if (!open) setPendingUnlock(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock {pendingUnlock?.label}?</DialogTitle>
            <DialogDescription>
              This will deduct <strong>{pendingUnlock?.cost} gems</strong> from your balance. Unlocks are permanent.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Your balance</span>
            <span className="flex items-center gap-1.5 font-semibold text-cyan-600 dark:text-cyan-400">
              <Gem className="w-4 h-4" />
              {gems.toLocaleString()} gems
            </span>
          </div>
          {pendingUnlock && gems < pendingUnlock.cost && (
            <p className="text-sm text-destructive font-medium text-center">
              You need {pendingUnlock.cost - gems} more gems to unlock this.
            </p>
          )}
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setPendingUnlock(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmUnlock}
              disabled={unlockMutation.isPending || (pendingUnlock ? gems < pendingUnlock.cost : false)}
              className="gap-1.5"
            >
              <Gem className="w-3.5 h-3.5" />
              {unlockMutation.isPending ? 'Unlocking…' : `Unlock for ${pendingUnlock?.cost} gems`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
