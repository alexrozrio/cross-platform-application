import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useImageTheme } from '@/hooks/use-image-theme';
import { ThemeIcon } from '@/components/theme-icons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Sparkles } from 'lucide-react';

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
  const { profileId } = useAuth();
  const { themeId } = useImageTheme();

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-8">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-4xl font-serif font-bold tracking-tight">Game Hub</h1>
        <p className="text-muted-foreground text-lg">Choose your game and play</p>
        {!profileId && (
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
              {/* Icon row */}
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
              {/* Mini icon strip */}
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <ThemeIcon themeId={themeId} value={n} size={22} />
                  </div>
                ))}
                <span className="text-muted-foreground/60 text-xs self-end pb-0.5">…</span>
              </div>
            </button>

            {/* Quick-start grid: each badge navigates with pre-selected size */}
            <div className="px-6 pb-5 grid grid-cols-4 gap-1.5">
              {GRID_QUICK_START.map(opt => (
                <button
                  key={opt.size}
                  onClick={() => setLocation(`/sudoku?size=${opt.size}`)}
                  className="flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/40 transition-all py-1.5 px-1 cursor-pointer"
                >
                  <span className="font-bold text-xs leading-none text-primary">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">{opt.sublabel}</span>
                </button>
              ))}
            </div>
            <div className="px-6 pb-5">
              <p className="text-[10px] text-muted-foreground">Tap a grid size to jump right in</p>
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
