import React from 'react';
import { useImageTheme } from '@/hooks/use-image-theme';
import { ThemeIcon, useThemeImageSrc } from '@/components/theme-icons';
import { IMAGE_THEMES, getTheme, getSymbol } from '@/lib/themes';
import { Check, Lock, Gem, LayoutGrid, Eye, ChevronLeft, ChevronRight, ArrowLeft, ImageIcon, EyeOff } from 'lucide-react';
import { type ThemeId } from '@/lib/themes';
import { useAuth } from '@/hooks/use-auth';
import { useGetProfile, useUpdateProfile } from '@workspace/api-client-react';
import { applyAppTheme } from '@/components/layout';
import { useFontTheme, FONT_THEMES, type FontThemeId } from '@/hooks/use-font-theme';
import { useFontSize, FONT_SIZE_OPTIONS, type FontSizeId } from '@/hooks/use-font-size';
import { useUnlockedItems, useUnlockItem } from '@/hooks/use-unlocked-items';
import { getItemCost, isFreeItem, type ItemType } from '@/lib/item-catalog';
import { useThemeBg, THEME_BG_DEFAULTS } from '@/hooks/use-theme-bg';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import colourThemesConfig from '@/config/colour-themes.json';

const APP_THEMES = colourThemesConfig
  .filter(t => t.visible)
  .map(t => ({ id: t.id, label: t.name, bg: t.bg, primary: t.primary, accent: t.accent }));

interface PendingUnlock {
  type: ItemType;
  id: string;
  label: string;
  cost: number;
}

// ── Generic mobile carousel ──────────────────────────────────────────────────
function MobileCarousel({
  items,
  perPage,
  renderItem,
  cols = perPage,
  pageKey,
}: {
  items: React.ReactNode[];
  perPage: number;
  renderItem?: never;
  cols?: number;
  pageKey?: string;
} | {
  items: unknown[];
  perPage: number;
  renderItem: (item: unknown, idx: number) => React.ReactNode;
  cols?: number;
  pageKey?: string;
}) {
  const [page, setPage] = React.useState(0);
  const pageCount = Math.ceil(items.length / perPage);
  const start = page * perPage;
  const visible = items.slice(start, start + perPage);
  const useDots = pageCount <= 8;

  // Reset to page 0 when pageKey changes (e.g. section re-renders)
  React.useEffect(() => { setPage(0); }, [pageKey]);

  const nodes = renderItem
    ? (visible as unknown[]).map((item, i) => renderItem(item, start + i))
    : (visible as React.ReactNode[]);

  return (
    <div className="sm:hidden">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {nodes}
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-background disabled:opacity-30 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {useDots ? (
            <div className="flex gap-1.5">
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={[
                    'rounded-full transition-all',
                    i === page
                      ? 'w-4 h-2 bg-primary'
                      : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                  ].join(' ')}
                />
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground font-medium">
              {page + 1} / {pageCount}
            </span>
          )}

          <button
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-background disabled:opacity-30 hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Themes() {
  const { themeId, setThemeId } = useImageTheme();
  const { profileId } = useAuth();
  const { data: profile, refetch: refetchProfile } = useGetProfile(profileId as number, { query: { enabled: !!profileId } });
  const updateProfile = useUpdateProfile();
  const { fontId, setFontId } = useFontTheme();
  const { fontSizeId, setFontSize } = useFontSize();
  const { isUnlocked } = useUnlockedItems(profileId);
  const unlockMutation = useUnlockItem(profileId);

  const [activeAppTheme, setActiveAppTheme] = React.useState<string>(profile?.theme ?? 'light');
  const [pendingUnlock, setPendingUnlock] = React.useState<PendingUnlock | null>(null);
  const [overviewThemeId, setOverviewThemeId] = React.useState<ThemeId | null>(null);
  const overviewTheme = overviewThemeId ? getTheme(overviewThemeId) : null;
  const [previewColourId, setPreviewColourId] = React.useState<string | null>(null);
  const previewColour = previewColourId ? APP_THEMES.find(t => t.id === previewColourId) ?? null : null;
  const [previewFontId, setPreviewFontId] = React.useState<string | null>(null);
  const previewFont = previewFontId ? FONT_THEMES.find(f => f.id === previewFontId) ?? null : null;
  const [showAll, setShowAll] = React.useState<'colors' | 'fonts' | 'icons' | null>(null);

  // Background image
  const bgThemeId = activeAppTheme || 'light';
  const { effectiveBg, bgSource, enabled: bgEnabled, setEnabled: setBgEnabled, hasCustom, localBgUrl, defaultUrl: bgDefaultUrl, setCustomImage, resetCustomImage } = useThemeBg(bgThemeId);
  const bgFileRef = React.useRef<HTMLInputElement>(null);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setCustomImage(bgThemeId, dataUrl);
        toast.success('Background image updated!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
    window.dispatchEvent(new CustomEvent('brain-games-theme-selected', { detail: id }));
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
      <div className="bg-card rounded-2xl px-5 py-4 border border-border">
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
      <section className="space-y-3 bg-card rounded-2xl border border-border p-5">
        <div>
          <h2 className="text-xl font-serif font-semibold">Colour Theme</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Changes the background and colour palette of the entire app.
          </p>
        </div>

        {/* Mobile carousel — 6 per page (2 rows × 3 cols) */}
        <MobileCarousel
          items={APP_THEMES}
          perPage={6}
          cols={3}
          renderItem={(item) => {
            const t = item as typeof APP_THEMES[0];
            const selected = activeAppTheme === t.id;
            const unlocked = isUnlocked('color_theme', t.id);
            const free = isFreeItem('color_theme', t.id);
            const cost = getItemCost('color_theme', t.id);
            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => handleAppTheme(t.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAppTheme(t.id); }}
                className={[
                  'relative rounded-xl border-2 p-2 flex flex-col items-center gap-1.5 transition-all duration-150 cursor-pointer',
                  selected ? 'border-primary ring-2 ring-primary/30 shadow-sm'
                    : unlocked ? 'border-border hover:border-primary/40'
                    : 'border-border hover:border-amber-400/60',
                ].join(' ')}
              >
                <div className="w-full h-9 rounded-lg flex items-center justify-center gap-1" style={{ background: t.bg }}>
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: t.primary }} />
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: t.accent }} />
                </div>
                <span className="text-[10px] font-medium leading-none text-center">{t.label}</span>
                {selected ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </span>
                ) : !unlocked ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                    <Gem className="w-2.5 h-2.5" />{cost}
                  </span>
                ) : null}
                {!unlocked && <Lock className="absolute top-1.5 right-1.5 w-2.5 h-2.5 text-amber-500/80" />}
                {free && !unlocked && <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[7px] font-bold px-0.5 rounded">FREE</span>}
                <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewColourId(t.id); }}
                  className="absolute bottom-1 right-1 p-0.5 rounded text-muted-foreground/60 hover:text-foreground hover:bg-black/10" title="Preview">
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          }}
        />

        {/* Show all — mobile only */}
        <div className="sm:hidden flex justify-end">
          <button
            onClick={() => setShowAll('colors')}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Show all themes <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-6 gap-2">
          {APP_THEMES.map(t => {
            const selected = activeAppTheme === t.id;
            const unlocked = isUnlocked('color_theme', t.id);
            const free = isFreeItem('color_theme', t.id);
            const cost = getItemCost('color_theme', t.id);
            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => handleAppTheme(t.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAppTheme(t.id); }}
                className={[
                  'relative rounded-xl border-2 p-2 flex flex-col items-center gap-1.5 transition-all duration-150 cursor-pointer',
                  selected ? 'border-primary ring-2 ring-primary/30 shadow-sm'
                    : unlocked ? 'border-border hover:border-primary/40 hover:shadow-sm'
                    : 'border-border hover:border-amber-400/60 hover:shadow-sm',
                ].join(' ')}
              >
                <div className="w-full h-10 rounded-lg flex items-center justify-center gap-1" style={{ background: t.bg }}>
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
                {!unlocked && <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-amber-500/80" />}
                {free && !unlocked && <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[8px] font-bold px-1 rounded">FREE</span>}
                <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewColourId(t.id); }}
                  className="absolute bottom-1 right-1 p-0.5 rounded text-muted-foreground/60 hover:text-foreground hover:bg-black/10 transition-colors" title="Preview">
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">Classic and Dark are always free. Others unlock with gems.</p>
      </section>

      {/* ── Background Image ─────────────────────────────────────────── */}
      <section className="space-y-3 bg-card rounded-2xl border border-border p-5">
        <div>
          <h2 className="text-xl font-serif font-semibold">Background Image</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add a personal touch with a custom image or use the theme’s default backdrop.<br />
            Your chosen background appears throughout the app behind every game.
          </p>
        </div>

        {/* Enable / disable toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
          <div className="flex items-center gap-2.5">
            {bgEnabled ? <ImageIcon className="w-4 h-4 text-primary shrink-0" /> : <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />}
            <p className="text-sm font-medium leading-none">Background image</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={bgEnabled}
            aria-label={bgEnabled ? 'Turn background image off' : 'Turn background image on'}
            onClick={() => setBgEnabled(!bgEnabled)}
            className={[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              bgEnabled ? 'bg-primary' : 'bg-muted-foreground/30',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                bgEnabled ? 'translate-x-6' : 'translate-x-1',
              ].join(' ')}
            />
          </button>
        </div>

        {/* Image preview + controls */}
        <div className="rounded-2xl border-2 border-border overflow-hidden">
          {/* Preview strip */}
          <div
            className="relative w-full h-36 bg-muted/50 bg-cover bg-center"
            style={{ backgroundImage: bgEnabled && effectiveBg ? `url(${effectiveBg})` : 'none' }}
          >
            {(!bgEnabled || !effectiveBg) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
            )}
            {bgEnabled && effectiveBg && (
              <div className="absolute inset-0" style={{ background: 'var(--background)', opacity: 0.5 }} />
            )}
          </div>
        </div>
      </section>

      {/* ── Font Style ───────────────────────────────────────────────── */}
      <section className="space-y-3 bg-card rounded-2xl border border-border p-5">
        <div>
          <h2 className="text-xl font-serif font-semibold">Font Style</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Changes the typeface used throughout the app. Default is free — others cost 50 gems each.
          </p>
        </div>

        {/* Mobile carousel — 2 per page */}
        <MobileCarousel
          items={FONT_THEMES}
          perPage={2}
          cols={2}
          renderItem={(item) => {
            const f = item as typeof FONT_THEMES[0];
            const selected = fontId === f.id;
            const unlocked = isUnlocked('font', f.id);
            const cost = getItemCost('font', f.id);
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={() => handleFont(f.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFont(f.id); }}
                className={[
                  'relative rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all duration-150 cursor-pointer',
                  selected ? 'border-primary ring-2 ring-primary/30 shadow-sm bg-primary/5'
                    : unlocked ? 'border-border hover:border-primary/40 hover:shadow-sm'
                    : 'border-border hover:border-amber-400/60 hover:shadow-sm',
                ].join(' ')}
              >
                {!unlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-amber-500/80" />}
                <span className={['text-3xl font-bold leading-none', !unlocked ? 'opacity-50' : ''].join(' ')} style={f.style}>Aa</span>
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
                <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewFontId(f.id); }}
                  className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-0.5 hover:bg-muted/50 transition-colors mt-0.5">
                  <Eye className="w-2.5 h-2.5" /> Preview
                </button>
              </div>
            );
          }}
        />

        {/* Show all — mobile only */}
        <div className="sm:hidden flex justify-end">
          <button
            onClick={() => setShowAll('fonts')}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Show all fonts <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-4 gap-3">
          {FONT_THEMES.map(f => {
            const selected = fontId === f.id;
            const unlocked = isUnlocked('font', f.id);
            const cost = getItemCost('font', f.id);
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={() => handleFont(f.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFont(f.id); }}
                className={[
                  'relative rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all duration-150 cursor-pointer',
                  selected ? 'border-primary ring-2 ring-primary/30 shadow-sm bg-primary/5'
                    : unlocked ? 'border-border hover:border-primary/40 hover:shadow-sm'
                    : 'border-border hover:border-amber-400/60 hover:shadow-sm',
                ].join(' ')}
              >
                {!unlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-amber-500/80" />}
                <span className={['text-3xl font-bold leading-none', !unlocked ? 'opacity-50' : ''].join(' ')} style={f.style}>Aa</span>
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
                <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewFontId(f.id); }}
                  className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-0.5 hover:bg-muted/50 transition-colors mt-0.5">
                  <Eye className="w-2.5 h-2.5" /> Preview
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Font Size ──────────────────────────────────────────────────── */}
      <section className="space-y-3 bg-card rounded-2xl border border-border p-5">
        <div>
          <h2 className="text-xl font-serif font-semibold">Font Size</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Adjusts text and interface sizing throughout the entire application. Your choice is saved on this device.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FONT_SIZE_OPTIONS.map(option => {
            const selected = fontSizeId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFontSize(option.id as FontSizeId)}
                className={[
                  'rounded-xl border-2 p-3 text-left transition-all duration-150',
                  selected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50',
                ].join(' ')}
              >
                <span
                  className={[
                    'block font-bold leading-tight',
                    option.id === 'small' ? 'text-sm' :
                    option.id === 'large' ? 'text-lg' :
                    option.id === 'extra-large' ? 'text-xl' : 'text-base',
                  ].join(' ')}
                >
                  Aa
                </span>
                <span className="mt-1 block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
                  {option.description}
                </span>
                {selected && (
                  <span className="mt-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Game Icon Set ────────────────────────────────────────────── */}
      <section className="space-y-3 bg-card rounded-2xl border border-border p-5">
        <div>
          <h2 className="text-xl font-serif font-semibold">Game Icon Set</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose the characters used when playing in image mode. Shapes and Adventure are free.
          </p>
        </div>

        {/* Mobile carousel — 1 per page */}
        <MobileCarousel
          items={IMAGE_THEMES}
          perPage={1}
          cols={1}
          renderItem={(item) => {
            const theme = item as typeof IMAGE_THEMES[0];
            const isSelected = themeId === theme.id;
            const unlocked = isUnlocked('icon_set', theme.id);
            const cost = getItemCost('icon_set', theme.id);
            const names = getCharacterNames(theme.id);
            return (
              <div
                key={theme.id}
                role="button"
                tabIndex={0}
                onClick={() => handleIconSet(theme.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleIconSet(theme.id); }}
                className={[
                  'relative text-left rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer',
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
                        <ThemeIconWithEmojiFallback key={n} themeId={theme.id} value={n} sym={getSymbol(theme, n)} size={28} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">16×16 extras</p>
                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: 7 }, (_, i) => i + 10).map(n => (
                        <ThemeIconWithEmojiFallback key={n} themeId={theme.id} value={n} sym={getSymbol(theme, n)} size={28} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {names.map((name, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <ThemeIconWithEmojiFallback themeId={theme.id} value={i + 1} sym={getSymbol(theme, i + 1)} size={14} />
                        <span className="text-[10px] text-muted-foreground truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {!unlocked ? (
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Tap to unlock for {cost} gems
                    </span>
                  ) : <span />}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOverviewThemeId(theme.id); }}
                    className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1 hover:bg-muted/50 transition-colors"
                  >
                    <LayoutGrid className="w-3 h-3" />
                    All symbols
                  </button>
                </div>
              </div>
            );
          }}
        />

        {/* Show all — mobile only */}
        <div className="sm:hidden flex justify-end">
          <button
            onClick={() => setShowAll('icons')}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Show all icon sets <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 gap-4">
          {IMAGE_THEMES.map(theme => {
            const isSelected = themeId === theme.id;
            const unlocked = isUnlocked('icon_set', theme.id);
            const cost = getItemCost('icon_set', theme.id);
            const names = getCharacterNames(theme.id);
            return (
              <div
                key={theme.id}
                role="button"
                tabIndex={0}
                onClick={() => handleIconSet(theme.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleIconSet(theme.id); }}
                className={[
                  'relative text-left rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer',
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
                        <ThemeIconWithEmojiFallback key={n} themeId={theme.id} value={n} sym={getSymbol(theme, n)} size={28} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">16×16 extras</p>
                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: 7 }, (_, i) => i + 10).map(n => (
                        <ThemeIconWithEmojiFallback key={n} themeId={theme.id} value={n} sym={getSymbol(theme, n)} size={28} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {names.map((name, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <ThemeIconWithEmojiFallback themeId={theme.id} value={i + 1} sym={getSymbol(theme, i + 1)} size={14} />
                        <span className="text-[10px] text-muted-foreground truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {!unlocked ? (
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Tap to unlock for {cost} gems
                    </span>
                  ) : <span />}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOverviewThemeId(theme.id); }}
                    className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1 hover:bg-muted/50 transition-colors"
                  >
                    <LayoutGrid className="w-3 h-3" />
                    All symbols
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-center text-muted-foreground bg-card border border-border rounded-lg px-4 py-2.5">
        Free selections save automatically. Unlocks are permanent.
      </p>

      {/* ── Show All Sub-pages (mobile overlay) ──────────────────────── */}
      {showAll !== null && (
        <div className="sm:hidden fixed inset-0 z-40 bg-background overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="max-w-2xl mx-auto px-4 pb-8 space-y-5">
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm pt-4 pb-3 flex items-center gap-3 border-b border-border z-10">
              <button
                onClick={() => setShowAll(null)}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-background hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg font-serif font-semibold">
                  {showAll === 'colors' ? 'All Colour Themes' : showAll === 'fonts' ? 'All Font Styles' : 'All Icon Sets'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {showAll === 'colors' ? `${APP_THEMES.length} themes` : showAll === 'fonts' ? `${FONT_THEMES.length} fonts` : `${IMAGE_THEMES.length} icon sets`}
                </p>
              </div>
            </div>

            {/* All Colour Themes */}
            {showAll === 'colors' && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {APP_THEMES.map(t => {
                  const selected = activeAppTheme === t.id;
                  const unlocked = isUnlocked('color_theme', t.id);
                  const free = isFreeItem('color_theme', t.id);
                  const cost = getItemCost('color_theme', t.id);
                  return (
                    <div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleAppTheme(t.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAppTheme(t.id); }}
                      className={[
                        'relative rounded-xl border-2 p-2 flex flex-col items-center gap-1.5 transition-all duration-150 cursor-pointer',
                        selected ? 'border-primary ring-2 ring-primary/30 shadow-sm'
                          : unlocked ? 'border-border hover:border-primary/40'
                          : 'border-border hover:border-amber-400/60',
                      ].join(' ')}
                    >
                      <div className="w-full h-9 rounded-lg flex items-center justify-center gap-1" style={{ background: t.bg }}>
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: t.primary }} />
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: t.accent }} />
                      </div>
                      <span className="text-[10px] font-medium leading-none text-center">{t.label}</span>
                      {selected ? (
                        <span className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2 h-2 text-primary-foreground" />
                        </span>
                      ) : !unlocked ? (
                        <span className="flex items-center gap-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                          <Gem className="w-2.5 h-2.5" />{cost}
                        </span>
                      ) : null}
                      {!unlocked && <Lock className="absolute top-1.5 right-1.5 w-2.5 h-2.5 text-amber-500/80" />}
                      {free && !unlocked && <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[7px] font-bold px-0.5 rounded">FREE</span>}
                      <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewColourId(t.id); }}
                        className="absolute bottom-1 right-1 p-0.5 rounded text-muted-foreground/60 hover:text-foreground hover:bg-black/10" title="Preview">
                        <Eye className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* All Font Styles */}
            {showAll === 'fonts' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                {FONT_THEMES.map(f => {
                  const selected = fontId === f.id;
                  const unlocked = isUnlocked('font', f.id);
                  const cost = getItemCost('font', f.id);
                  return (
                    <div
                      key={f.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleFont(f.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFont(f.id); }}
                      className={[
                        'relative rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all duration-150 cursor-pointer',
                        selected ? 'border-primary ring-2 ring-primary/30 shadow-sm bg-primary/5'
                          : unlocked ? 'border-border hover:border-primary/40 hover:shadow-sm'
                          : 'border-border hover:border-amber-400/60 hover:shadow-sm',
                      ].join(' ')}
                    >
                      {!unlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-amber-500/80" />}
                      <span className={['text-3xl font-bold leading-none', !unlocked ? 'opacity-50' : ''].join(' ')} style={f.style}>Aa</span>
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
                      <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewFontId(f.id); }}
                        className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-0.5 hover:bg-muted/50 transition-colors mt-0.5">
                        <Eye className="w-2.5 h-2.5" /> Preview
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* All Icon Sets */}
            {showAll === 'icons' && (
              <div className="grid grid-cols-1 gap-4 pt-1">
                {IMAGE_THEMES.map(theme => {
                  const isSelected = themeId === theme.id;
                  const unlocked = isUnlocked('icon_set', theme.id);
                  const cost = getItemCost('icon_set', theme.id);
                  const names = getCharacterNames(theme.id);
                  return (
                    <div
                      key={theme.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleIconSet(theme.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleIconSet(theme.id); }}
                      className={[
                        'relative text-left rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer',
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
                          <h3 className={['text-lg font-bold', isSelected ? 'text-primary' : ''].join(' ')}>{theme.name}</h3>
                          {!unlocked && <Lock className="w-4 h-4 text-amber-500" />}
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">9×9</p>
                          <div className="grid grid-cols-9 gap-0.5">
                            {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
                              <ThemeIconWithEmojiFallback key={n} themeId={theme.id} value={n} sym={getSymbol(theme, n)} size={28} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">16×16 extras</p>
                          <div className="grid grid-cols-7 gap-0.5">
                            {Array.from({ length: 7 }, (_, i) => i + 10).map(n => (
                              <ThemeIconWithEmojiFallback key={n} themeId={theme.id} value={n} sym={getSymbol(theme, n)} size={28} />
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          {names.map((name, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <ThemeIconWithEmojiFallback themeId={theme.id} value={i + 1} sym={getSymbol(theme, i + 1)} size={14} />
                              <span className="text-[10px] text-muted-foreground truncate">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        {!unlocked ? (
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Tap to unlock for {cost} gems</span>
                        ) : <span />}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setOverviewThemeId(theme.id); }}
                          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1 hover:bg-muted/50 transition-colors"
                        >
                          <LayoutGrid className="w-3 h-3" />
                          All symbols
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Colour Theme Preview Dialog ──────────────────────────────── */}
      {(() => {
        const ct = previewColour;
        if (!ct) return null;
        const ctUnlocked = isUnlocked('color_theme', ct.id);
        const ctSelected = activeAppTheme === ct.id;
        const ctCost = getItemCost('color_theme', ct.id);
        const ctCanAfford = gems >= ctCost;
        return (
          <Dialog open={!!previewColourId} onOpenChange={(open) => { if (!open) setPreviewColourId(null); }}>
            <DialogContent className="max-w-sm p-0 overflow-hidden">
              <DialogHeader className="px-5 pt-5 pb-0">
                <DialogTitle>{ct.label} Theme</DialogTitle>
                <DialogDescription>Colour palette preview</DialogDescription>
              </DialogHeader>

              {/* Mini app mockup */}
              <div className="mx-5 mt-3 rounded-xl overflow-hidden border border-border shadow-md text-[11px]" style={{ background: ct.bg, color: ct.primary }}>
                {/* Header bar */}
                <div className="flex items-center justify-between px-3 py-2" style={{ background: ct.primary }}>
                  <span className="font-bold text-white text-xs">Brain Games 4 All</span>
                  <div className="flex gap-1.5">
                    {['Home', 'Leaderboard', 'Themes'].map(l => (
                      <span key={l} className="text-white/70 text-[9px]">{l}</span>
                    ))}
                  </div>
                </div>
                {/* Body */}
                <div className="p-3 space-y-2">
                  <div className="rounded-lg p-2.5 border" style={{ background: ct.accent, borderColor: ct.primary + '33' }}>
                    <p className="font-semibold text-xs mb-1.5" style={{ color: ct.primary }}>Daily Sudoku</p>
                    <div className="grid grid-cols-9 gap-px" style={{ background: ct.primary + '40' }}>
                      {[5,3,'',null,7,'',null,null,'', 6,'',null,1,9,5,null,null,'', null,9,8,null,null,'',null,6,''].map((n, i) => (
                        <div key={i} className="flex items-center justify-center text-[9px] font-bold" style={{ background: ct.bg, height: 14, color: n ? ct.primary : 'transparent' }}>
                          {n || '·'}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg p-2 text-center text-white text-[9px] font-semibold" style={{ background: ct.primary }}>
                      Play Now
                    </div>
                    <div className="flex-1 rounded-lg p-2 text-center text-[9px] font-medium border" style={{ borderColor: ct.primary + '50', color: ct.primary }}>
                      Stats
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {['bg', 'primary', 'accent'].map((role, i) => (
                      <div key={role} className="flex-1 rounded-md p-1.5 text-center" style={{ background: [ct.bg, ct.primary, ct.accent][i], border: '1px solid ' + ct.primary + '30' }}>
                        <p className="text-[7px]" style={{ color: i === 1 ? 'white' : ct.primary }}>{role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-border mt-3">
                {ctSelected ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-primary">
                    <Check className="w-4 h-4" />Currently selected
                  </div>
                ) : ctUnlocked ? (
                  <Button className="w-full" onClick={() => { handleAppTheme(ct.id); setPreviewColourId(null); }}>
                    <Check className="w-4 h-4 mr-1.5" />Select {ct.label}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Gem className="w-3.5 h-3.5 text-cyan-500" />Balance: <strong className="text-foreground">{gems}</strong></span>
                      <span>Cost: <strong className={ctCanAfford ? 'text-foreground' : 'text-destructive'}>{ctCost} gems</strong></span>
                    </div>
                    <Button className="w-full" variant={ctCanAfford ? 'default' : 'secondary'} disabled={!ctCanAfford}
                      onClick={() => { setPreviewColourId(null); handleAppTheme(ct.id); }}>
                      <Gem className="w-4 h-4 mr-1.5" />
                      {ctCanAfford ? `Unlock for ${ctCost} gems` : `Need ${ctCost - gems} more gems`}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* ── Font Style Preview Dialog ─────────────────────────────────── */}
      {(() => {
        const ft = previewFont;
        if (!ft) return null;
        const ftUnlocked = isUnlocked('font', ft.id);
        const ftSelected = fontId === ft.id;
        const ftCost = getItemCost('font', ft.id);
        const ftCanAfford = gems >= ftCost;
        return (
          <Dialog open={!!previewFontId} onOpenChange={(open) => { if (!open) setPreviewFontId(null); }}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>{ft.label} Font</DialogTitle>
                <DialogDescription>How text looks throughout the app</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                {/* Heading specimen */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Heading</p>
                  <p className="text-2xl font-bold leading-tight" style={{ fontFamily: ft.serif }}>
                    Daily Sudoku
                  </p>
                </div>
                {/* Body specimen */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Body</p>
                  <p className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: ft.sans }}>
                    Complete the grid so every row, column, and box contains the digits 1 through 9.
                  </p>
                </div>
                {/* Digits specimen */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">Sudoku digits</p>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <div key={n} className="flex-1 aspect-square flex items-center justify-center rounded-md bg-background border border-border text-sm font-bold" style={{ fontFamily: ft.sans }}>
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                {/* UI labels */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">UI labels</p>
                  <div className="flex flex-wrap gap-2 text-xs" style={{ fontFamily: ft.sans }}>
                    {['Leaderboard', 'My Stats', 'Streak: 7 days', '⭐ 1,240 XP'].map(l => (
                      <span key={l} className="px-2 py-0.5 rounded-full bg-muted border border-border">{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-1 border-t border-border">
                {ftSelected ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-primary">
                    <Check className="w-4 h-4" />Currently selected
                  </div>
                ) : ftUnlocked ? (
                  <Button className="w-full" onClick={() => { handleFont(ft.id); setPreviewFontId(null); }}>
                    <Check className="w-4 h-4 mr-1.5" />Select {ft.label}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Gem className="w-3.5 h-3.5 text-cyan-500" />Balance: <strong className="text-foreground">{gems}</strong></span>
                      <span>Cost: <strong className={ftCanAfford ? 'text-foreground' : 'text-destructive'}>{ftCost} gems</strong></span>
                    </div>
                    <Button className="w-full" variant={ftCanAfford ? 'default' : 'secondary'} disabled={!ftCanAfford}
                      onClick={() => { setPreviewFontId(null); handleFont(ft.id); }}>
                      <Gem className="w-4 h-4 mr-1.5" />
                      {ftCanAfford ? `Unlock for ${ftCost} gems` : `Need ${ftCost - gems} more gems`}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* ── Symbol Overview Dialog ───────────────────────────────────── */}
      {(() => {
        const ovId = overviewThemeId;
        const ovTheme = overviewTheme;
        if (!ovId || !ovTheme) return null;
        const ovUnlocked = isUnlocked('icon_set', ovId);
        const ovSelected = themeId === ovId;
        const ovCost = getItemCost('icon_set', ovId);
        const canAfford = gems >= ovCost;
        return (
          <Dialog open={!!overviewThemeId} onOpenChange={(open) => { if (!open) setOverviewThemeId(null); }}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl">{ovTheme.preview}</span>
                  {ovTheme.name} — All Symbols
                </DialogTitle>
                <DialogDescription>
                  All {ovTheme.symbols.length} symbols used in Memory Match
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-8 gap-1.5 pt-1">
                {ovTheme.symbols.map((sym, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/40 p-1.5"
                    title={`#${i + 1}`}
                  >
                    {/* Images take precedence over emoji — ThemeIcon probes for a real image
                        file first; if none exists it falls back to the SVG icon, and we
                        render the emoji symbol as a last resort. */}
                    <ThemeIconWithEmojiFallback themeId={ovId} value={i + 1} sym={sym} />
                    <span className="text-[8px] text-muted-foreground font-mono">{i + 1}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border">
                {ovSelected ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-primary">
                    <Check className="w-4 h-4" />
                    Currently selected
                  </div>
                ) : ovUnlocked ? (
                  <Button
                    className="w-full"
                    onClick={() => { handleIconSet(ovId); setOverviewThemeId(null); }}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Select this theme
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
                      <span className="flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5 text-cyan-500" />
                        Your balance: <strong className="text-foreground">{gems} gems</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        Cost: <strong className={canAfford ? 'text-foreground' : 'text-destructive'}>{ovCost} gems</strong>
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      variant={canAfford ? 'default' : 'secondary'}
                      disabled={!canAfford}
                      onClick={() => {
                        setOverviewThemeId(null);
                        handleIconSet(ovId);
                      }}
                    >
                      <Gem className="w-4 h-4 mr-1.5" />
                      {canAfford ? `Unlock for ${ovCost} gems` : `Need ${ovCost - gems} more gems`}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

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

/** Shows a real image if one has been placed in /public/themes/<id>/<value>.<ext>,
 *  otherwise falls back to the emoji symbol from the config.
 *  Used in the "All symbols" dialog so images always take precedence over text. */
function ThemeIconWithEmojiFallback({ themeId, value, sym, size = 28 }: { themeId: ThemeId; value: number; sym: string; size?: number }) {
  const imageSrc = useThemeImageSrc(themeId, value);

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={sym}
        draggable={false}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block', userSelect: 'none' }}
      />
    );
  }

  // While probing (undefined) show emoji; if probe fails (null) also show emoji.
  return <span style={{ fontSize: size * 0.75, lineHeight: 1 }}>{sym}</span>;
}

function getCharacterNames(themeId: ThemeId): string[] {
  const names: Record<string, string[]> = {
    shapes:       ['Circle', 'Square', 'Triangle', 'Diamond', 'Star', 'Hexagon', 'Heart', 'Cross', 'Ring', 'Cyan Diamond', 'Spiral', 'Crescent', 'Arrow', 'Gear', 'Lightning', 'Infinity'],
    adventure:    ['Explorer', 'Fox', 'Map', 'Backpack', 'Flower', 'Telescope', 'Key', 'Rainbow', 'Trophy', 'Compass', 'Campfire', 'Lantern', 'Butterfly', 'Mushroom', 'Magic Wand', 'Dartboard'],
    superhero:    ['Spider-Man', 'Superman', 'Batman', 'Wonder Woman', 'Iron Man', 'Cap America', 'Thor', 'Hulk', 'The Flash', 'Villain', 'Tornado', 'Sparkle', 'Eagle', 'Crossed Swords', 'Magnet', 'Bullseye'],
    ocean:        ['Dolphin', 'Octopus', 'Shark', 'Clownfish', 'Crab', 'Pufferfish', 'Squid', 'Turtle', 'Lobster', 'Whale', 'Seal', 'Seashell', 'Coral', 'Shrimp', 'Fish', 'Wave'],
    jungle:       ['Monkey', 'Lion', 'Elephant', 'Giraffe', 'Zebra', 'Rhino', 'Leopard', 'Gorilla', 'Parrot', 'Crocodile', 'Lizard', 'Butterfly', 'Leaf Cluster', 'Palm Tree', 'Hibiscus', 'Caterpillar'],
    space:        ['Rocket', 'Star', 'Moon', 'Comet', 'Saturn', 'Earth', 'Alien', 'UFO', 'Astronaut', 'Galaxy', 'Telescope', 'Shooting Star', 'Satellite', 'Sun', 'New Moon', 'Mars'],
    princess:     ['Princess', 'Crown', 'Castle', 'Diamond', 'Unicorn', 'Magic Wand', 'Rainbow', 'Sparkle', 'Bow', 'Tulip', 'Stars', 'Blossom', 'Butterfly', 'Bouquet', 'Flower', 'Candle'],
    vehicles:     ['Car', 'Taxi', 'SUV', 'Bus', 'Race Car', 'Police Car', 'Ambulance', 'Fire Truck', 'Van', 'Truck', 'Semi', 'Pickup', 'Motorbike', 'Bicycle', 'Scooter', 'Tuk-tuk'],
    peppa_pig:    ['Peppa', 'Pig Snout', 'Frog', 'Rabbit', 'Sheep', 'Bear', 'Fox', 'Dog', 'Chick', 'Lion', 'Cow', 'Hamster', 'Rain', 'Cloud', 'House', 'Sunflower'],
    paw_patrol:   ['Paw Print', 'Ryder', 'Chase', 'Marshall', 'Skye', 'Rocky', 'Rubble', 'Mountain', 'Vest', 'Torch', 'Zuma', 'Everest', 'Star', 'Medal', 'Shield', 'Bell'],
    sheriff:      ['Sheriff', 'Badge', 'Labrador', 'Desert', 'Cactus', 'Horse', 'Coin', 'Eagle', 'Wheat', 'Bucket', 'Sunrise', 'Cattle', 'Bell', 'Hook', 'Target', 'Boomerang'],
    doraemon:     ['Doraemon', 'Blue Bell', 'Swirl', 'Bag', 'Pocket', 'Anywhere Door', 'Lantern', 'Dango', 'Gear', 'Gift', 'Star', 'Crystal Ball', 'Balloon', 'Donut', 'Magic Wand', 'Wave'],
    chotta_bheem: ['Bheem', 'Wrestler', 'Laddoo', 'Laddu', 'Elephant', 'Flower', 'Palace', 'Sword', 'Leaf', 'Tiger', 'Lion', 'Trumpet', 'Gloves', 'Trophy', 'Gold Medal', 'Blossom'],
    shinchan:     ['Shin-chan', 'Bus', 'Shiro', 'Mask', 'Action', 'House', 'Cherry', 'Circus', 'Cake', 'Elephant', 'Clown', 'Balloon', 'Target', 'Rainbow', 'Wheel', 'Magic'],
    bluey:        ['Bluey', 'Paw Print', 'Blossom', 'Home', 'Game', 'Rainbow', 'Puzzle', 'Art', 'Leaf', 'Carnival', 'Sunflower', 'Star', 'Ferris Wheel', 'Carousel', 'Stage', 'Hibiscus'],
    tom_jerry:    ['Tom', 'Jerry', 'Cheese', 'Cake', 'Mallet', 'Fishing', 'House', 'Chase', 'Lightning', 'Guitar', 'Boxing Glove', 'Drama', 'Pizza', 'Carrot', 'Eagle', 'Whirlwind'],
    mickey_mouse: ['Mickey Hat', 'Mickey', 'Star', 'Sparkle', 'Carousel', 'Ferris Wheel', 'Roller Coaster', 'Castle', 'Stage', 'Circus', 'Balloon', 'Rainbow', 'Magic', 'Confetti', 'Gift', 'Ribbon'],
  };
  return names[themeId] ?? [];
}
