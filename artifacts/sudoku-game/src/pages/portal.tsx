import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useImageTheme } from '@/hooks/use-image-theme';
import { ThemeIcon } from '@/components/theme-icons';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Sparkles, Loader2 } from 'lucide-react';
import { customFetch } from '@workspace/api-client-react';

const COMING_SOON = [
  { title: 'Word Search', description: 'Find hidden words in a letter grid', icon: '🔤', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-200/60' },
  { title: 'Minesweeper', description: 'Clear the field without hitting mines', icon: '💣', color: 'from-rose-500/20 to-orange-500/20 border-rose-200/60' },
  { title: 'Memory Match', description: 'Match pairs of hidden cards', icon: '🃏', color: 'from-violet-500/20 to-purple-500/20 border-violet-200/60' },
];

const GRID_QUICK_START = [
  { size: 3, label: '3×3', sublabel: 'Baby' },
  { size: 4, label: '4×4', sublabel: 'Mini' },
  { size: 9, label: '9×9', sublabel: 'Classic' },
  { size: 16, label: '16×16', sublabel: 'Pro' },
];

export default function Portal() {
  const [, setLocation] = useLocation();
  const { profileId, isReady } = useAuth();
  const { themeId } = useImageTheme();
  const [loadingSize, setLoadingSize] = useState<number | null>(null);

  const handleQuickStart = async (size: number) => {
    if (!isReady || !profileId || loadingSize !== null) return;
    setLoadingSize(size);
    try {
      const puzzle = await customFetch<{ id: number; difficulty: string }>(
        `/api/puzzles/new?difficulty=easy&gridSize=${size}`,
      );
      const game = await customFetch<{ id: number }>('/api/games', {
        method: 'POST',
        body: JSON.stringify({ profileId, puzzleId: puzzle.id, difficulty: 'easy' }),
      });
      setLocation(`/game/${game.id}`);
    } catch (err) {
      console.error('Error starting game:', err);
      setLoadingSize(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-8">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-4xl font-serif font-bold tracking-tight">Game Hub</h1>
        <p className="text-muted-foreground text-lg">Choose your game and play</p>
        {!profileId && isReady && (
          <p className="text-sm text-muted-foreground">
            <button className="underline underline-offset-2 hover:text-foreground transition-colors" onClick={() => setLocation('/sign-in')}>
              Sign in
            </button>{' '}to sync progress across devices
          </p>
        )}
      </div>

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

            {/* Quick-start grid: each badge directly starts a game */}
            <div className="px-6 pb-2">
              <p className="text-[10px] text-muted-foreground mb-2">Tap a size to jump right in</p>
              <div className="grid grid-cols-4 gap-1.5">
                {GRID_QUICK_START.map(opt => (
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
