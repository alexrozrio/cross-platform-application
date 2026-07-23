import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useImageTheme } from '@/hooks/use-image-theme';
import { ThemeIcon } from '@/components/theme-icons';
import { Badge } from '@/components/ui/badge';
import { Grid3x2 as Grid3X3, Sparkles, Loader as Loader2, RotateCcw } from 'lucide-react';
import { customFetch, useGetProfile } from '@workspace/api-client-react';
import { getLevelFromXp } from '@/lib/levels';
import { getTheme } from '@/lib/themes';

interface ActiveGame {
  id: number;
  puzzle?: { gridSize: number; difficulty: string };
  mistakeCount: number;
}

interface MemorySession {
  gridSize: number;
  flips: number;
  elapsed: number;
  savedAt: number;
  cards: { matched: boolean }[];
}

const COMING_SOON = [
  { title: 'Word Search', description: 'Find hidden words in a letter grid', icon: '🔤', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-200/60' },
  { title: 'Minesweeper', description: 'Clear the field without hitting mines', icon: '💣', color: 'from-rose-500/20 to-orange-500/20 border-rose-200/60' },
];

const GRID_QUICK_START = [
  { size: 3, label: '3×3', sublabel: 'Baby' },
  { size: 4, label: '4×4', sublabel: 'Mini' },
  { size: 6, label: '6×6', sublabel: 'Dual' },
  { size: 9, label: '9×9', sublabel: 'Classic' },
  { size: 16, label: '16×16', sublabel: 'Pro' },
];

export default function Portal() {
  const [location, setLocation] = useLocation();
  const { profileId, isReady } = useAuth();
  const { themeId } = useImageTheme();
  const [loadingSize, setLoadingSize] = useState<number | null>(null);

  const { data: profile } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId },
  });

  const gameMode = (profile?.gameMode ?? '4all') as 'children' | 'adult' | '4all';

  const visibleSudokuSizes = GRID_QUICK_START.filter(opt =>
    gameMode === 'children' ? [3, 4, 6].includes(opt.size) :
    gameMode === 'adult'    ? [9, 16].includes(opt.size) :
    true
  );

  const ALL_MEMORY_OPTIONS = [
    { size: 2, label: '2×4', sub: '4 pairs' },
    { size: 4, label: '4×4', sub: '8 pairs' },
    { size: 6, label: '4×8', sub: '16 pairs' },
    { size: 8, label: '8×8', sub: '32 pairs' },
  ];
  const visibleMemoryOptions = ALL_MEMORY_OPTIONS.filter(opt =>
    gameMode === 'children' ? [2, 4].includes(opt.size) :
    gameMode === 'adult'    ? [6, 8].includes(opt.size) :
    true
  );

  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [memorySession, setMemorySession] = useState<MemorySession | null>(null);

  // Fetch active Sudoku game
  useEffect(() => {
    if (!profileId || !isReady) return;
    customFetch<ActiveGame>(`/api/games/active/${profileId}`)
      .then(g => setActiveGame(g))
      .catch(() => setActiveGame(null));
  }, [profileId, isReady, location]);

  // Read Memory Match localStorage session
  useEffect(() => {
    try {
      const raw = localStorage.getItem('brain-games-memory-session');
      if (!raw) { setMemorySession(null); return; }
      const s: MemorySession = JSON.parse(raw);
      if (!s.savedAt || Date.now() - s.savedAt > 12 * 60 * 60 * 1000) {
        localStorage.removeItem('brain-games-memory-session');
        setMemorySession(null);
        return;
      }
      setMemorySession(s);
    } catch {
      setMemorySession(null);
    }
  }, [location]);

  const handleQuickStart = async (size: number) => {
    if (!isReady || !profileId || loadingSize !== null) return;
    setLoadingSize(size);
    // Use the difficulty the player last chose (persisted by home.tsx), defaulting to easy.
    const difficulty = (() => {
      try {
        const stored = localStorage.getItem('sudoku-last-difficulty');
        return stored && ['easy', 'medium', 'hard', 'expert'].includes(stored) ? stored : 'easy';
      } catch { return 'easy'; }
    })();
    try {
      const puzzle = await customFetch<{ id: number; difficulty: string }>(
        `/api/puzzles/new?difficulty=${difficulty}&gridSize=${size}`,
      );
      const game = await customFetch<{ id: number }>('/api/games', {
        method: 'POST',
        body: JSON.stringify({ profileId, puzzleId: puzzle.id, difficulty }),
      });
      try {
        localStorage.setItem('sudoku-last-grid-size', String(size));
        localStorage.setItem('sudoku-last-difficulty', difficulty);
      } catch { /* private browsing */ }
      setLocation(`/game/${game.id}`);
    } catch (err) {
      console.error('Error starting game:', err);
      setLoadingSize(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-8">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-4xl font-serif font-bold tracking-tight">Brain Games 4 All</h1>
        <p className="text-muted-foreground text-lg">Choose your game and play</p>
        {!profileId && isReady && (
          <p className="text-sm text-muted-foreground">
            <button className="underline underline-offset-2 hover:text-foreground transition-colors" onClick={() => setLocation('/sign-in')}>
              Sign in
            </button>{' '}to sync progress across devices
          </p>
        )}
      </div>

      {/* Rank quick-stats banner */}
      {profile && (() => {
        const xp = profile.xp ?? 0;
        const level = getLevelFromXp(xp);
        return (
          <button
            onClick={() => setLocation('/profile')}
            className="w-full text-left rounded-2xl px-4 py-3 flex items-center gap-4 transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              background: `linear-gradient(135deg, ${level.color}22 0%, ${level.ring}18 100%)`,
              border: `1.5px solid ${level.ring}55`,
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
              style={{ backgroundColor: level.color, color: level.textColor, boxShadow: `0 0 0 2.5px ${level.ring}` }}
            >
              {level.index + 1}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black" style={{ color: level.color }}>{level.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{xp.toLocaleString()} XP</span>
              </div>
              {level.nextTier ? (
                <>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${level.color}22` }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${level.progress}%`, backgroundColor: level.color }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {(level.nextTier.minXp - xp).toLocaleString()} XP to <span style={{ color: level.nextTier.color, fontWeight: 700 }}>{level.nextTier.name}</span>
                  </p>
                </>
              ) : (
                <p className="text-xs font-semibold" style={{ color: level.color }}>🏆 Max Rank</p>
              )}
            </div>
          </button>
        );
      })()}

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Available Games</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sudoku Card */}
          <div className="group relative rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
            {/* Clickable card body → goes to /sudoku */}
            <button
              onClick={() => setLocation('/sudoku')}
              className="w-full text-left p-6 space-y-4 hover:from-primary/15 hover:to-primary/10 hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <Grid3X3 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif">Sudoku</h2>
                  <p className="text-xs text-muted-foreground">Number puzzle</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fill the grid so every row, column, and box contains each symbol exactly once.
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <ThemeIcon themeId={themeId} value={n} size={22} />
                  </div>
                ))}
                <span className="text-muted-foreground/60 text-xs self-end pb-0.5">…</span>
              </div>
            </button>

            {/* Resume strip — only show if the game's grid size is valid for the current mode */}
            {activeGame && (() => {
              const gs = activeGame.puzzle?.gridSize;
              const validForMode =
                gameMode === 'children' ? [3, 4, 6].includes(gs!) :
                gameMode === 'adult'    ? [9, 16].includes(gs!) :
                true;
              return validForMode;
            })() && (
              <button
                onClick={() => setLocation(`/game/${activeGame.id}`)}
                className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/25 px-3 py-2 text-left hover:bg-primary/20 transition-colors w-[calc(100%-3rem)]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-semibold text-primary">Resume in progress</span>
                {activeGame.puzzle && (
                  <span className="text-[10px] text-muted-foreground capitalize ml-auto">
                    {activeGame.puzzle.gridSize}×{activeGame.puzzle.gridSize} · {activeGame.puzzle.difficulty}
                  </span>
                )}
              </button>
            )}

            {/* Quick-start grid: each badge directly starts a game */}
            <div className="px-6 pb-2">
              <p className="text-[10px] text-muted-foreground mb-2">Tap a size to jump right in</p>
              <div className={`grid gap-1.5 ${visibleSudokuSizes.length === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {visibleSudokuSizes.map(opt => (
                  <button
                    key={opt.size}
                    onClick={() => handleQuickStart(opt.size)}
                    disabled={loadingSize !== null || !isReady}
                    className="flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/40 transition-all py-2 px-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
                  >
                    {loadingSize === opt.size ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <>
                        <span className="font-bold text-xs leading-none text-primary">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">{opt.sublabel}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 pb-5 pt-1">
              <button
                onClick={() => setLocation('/sudoku')}
                className="text-[10px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
              >
                More options (difficulty, play style) →
              </button>
            </div>

            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400" title="Available" />
          </div>

          {/* Memory Match Card */}
          {(() => {
            const theme = getTheme(themeId as any);
            const previewSymbols = theme.symbols.slice(0, 4);
            return (
              <div className="group relative rounded-2xl border-2 border-violet-400/25 bg-gradient-to-br from-violet-500/10 to-purple-500/5 overflow-hidden">
                <button
                  onClick={() => setLocation('/memory')}
                  className="w-full text-left p-6 space-y-4 hover:from-violet-500/15 hover:to-purple-500/10 hover:border-violet-400/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-400/20 text-3xl">
                      🃏
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-serif">Memory Match</h2>
                      <p className="text-xs text-muted-foreground">Card matching game</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Flip cards to find matching pairs. Beat the clock and minimise your flips to maximise your score.
                  </p>
                  <div className="flex gap-1 items-center">
                    {previewSymbols.map((sym, i) => (
                      <span key={i} className="text-xl leading-none opacity-80 group-hover:opacity-100 transition-opacity">{sym}</span>
                    ))}
                    <span className="text-muted-foreground/60 text-xs self-end pb-0.5 ml-1">…</span>
                  </div>
                </button>
                {/* Memory resume strip — only show if session grid size is valid for the current mode */}
                {memorySession && (() => {
                  const gs = memorySession.gridSize;
                  const validForMode =
                    gameMode === 'children' ? [2, 4].includes(gs) :
                    gameMode === 'adult'    ? [6, 8].includes(gs) :
                    true;
                  if (!validForMode) return null;
                  const matched = memorySession.cards.filter(c => c.matched).length;
                  const total = memorySession.cards.length / 2;
                  const sizeLabel = gs === 2 ? '2×4' : gs === 4 ? '4×4' : gs === 6 ? '4×8' : '8×8';
                  return (
                    <button
                      onClick={() => setLocation('/memory')}
                      className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-violet-500/10 border border-violet-400/25 px-3 py-2 text-left hover:bg-violet-500/20 transition-colors w-[calc(100%-3rem)]"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">Resume in progress</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {sizeLabel} · {matched}/{total} pairs
                      </span>
                    </button>
                  );
                })()}

                <div className="px-6 pb-5 pt-1">
                  <div className={`grid gap-1.5 ${visibleMemoryOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                    {visibleMemoryOptions.map(opt => (
                      <button
                        key={opt.size}
                        onClick={() => setLocation(`/memory?size=${opt.size}`)}
                        className="flex flex-col items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/5 hover:bg-violet-500/15 hover:border-violet-400/40 transition-all py-2 px-1 cursor-pointer min-h-[52px]"
                      >
                        <span className="font-bold text-xs leading-none text-violet-600">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400" title="Available" />
              </div>
            );
          })()}
        </div>
      </div>

      {/* Coming soon */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Coming Soon
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMING_SOON.map(game => (
            <div
              key={game.title}
              className={`rounded-2xl border bg-gradient-to-br ${game.color} p-6 space-y-3 opacity-60 cursor-not-allowed select-none`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white/40 flex items-center justify-center text-3xl">
                  {game.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif">{game.title}</h2>
                  <Badge variant="outline" className="text-xs mt-0.5 border-current/30">Soon</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{game.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
