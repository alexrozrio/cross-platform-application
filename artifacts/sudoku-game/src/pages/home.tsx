import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useImageTheme } from '@/hooks/use-image-theme';
import { useCreateGame, useGetProfile, customFetch, generatePuzzle } from '@workspace/api-client-react';
import { ThemeIcon } from '@/components/theme-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Play, BarChart2, Trophy, ArrowLeft, Hash, Type, Palette, Flame, BookOpen, Keyboard, Scroll, RotateCcw } from 'lucide-react';
import { IMAGE_THEMES } from '@/lib/themes';
import gameFeatures from '@/config/game-features.json';

interface ActiveGame {
  id: number;
  puzzle?: { difficulty: string; gridSize: number };
  elapsedSeconds: number;
  mistakeCount: number;
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
type GridSize = 3 | 4 | 9 | 16;

const ALPHA_COLORS = ['#E53935','#1E88E5','#43A047','#FB8C00','#8E24AA','#00897B','#D81B60','#F4511E','#3949AB'];

function AlphaPreview({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: Math.min(count, 4) }, (_, i) => (
        <span
          key={i}
          className="font-black text-base leading-none"
          style={{ color: ALPHA_COLORS[i % ALPHA_COLORS.length] }}
        >
          {String.fromCharCode(65 + i)}
        </span>
      ))}
      {count > 4 && <span className="text-muted-foreground text-xs">…</span>}
    </div>
  );
}

const GRID_OPTIONS: { size: GridSize; label: string; sublabel: string; difficulties: Difficulty[] }[] = [
  { size: 3, label: '3×3', sublabel: 'Baby', difficulties: ['easy', 'medium', 'hard', 'expert'] },
  { size: 4, label: '4×4', sublabel: 'Mini', difficulties: ['easy', 'medium', 'hard', 'expert'] },
  { size: 9, label: '9×9', sublabel: 'Classic', difficulties: ['easy', 'medium', 'hard', 'expert'] },
  { size: 16, label: '16×16', sublabel: 'Pro', difficulties: ['easy', 'medium', 'hard', 'expert'] },
];

type InfoModal = 'rules' | 'controls' | 'backstory' | null;

export default function SudokuHome() {
  const { profileId, isReady } = useAuth();
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const sizeParam = new URLSearchParams(search).get('size');
  const initialSize = ([3, 4, 9, 16].includes(Number(sizeParam)) ? Number(sizeParam) : 9) as GridSize;
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gridSize, setGridSize] = useState<GridSize>(initialSize);
  const { themeId } = useImageTheme();
  const [infoModal, setInfoModal] = useState<InfoModal>(null);

  const { data: profile } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId },
  });

  const gameMode = (profile?.gameMode ?? '4all') as 'children' | 'adult' | '4all';
  const allDifficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  const filteredGridOptions = GRID_OPTIONS.filter(opt =>
    gameMode === 'children' ? [3, 4].includes(opt.size) :
    gameMode === 'adult'    ? [9, 16].includes(opt.size) :
    true
  );

  const createGame = useCreateGame();
  const [isGenerating, setIsGenerating] = useState(false);
  const isLoading = !isReady || isGenerating || createGame.isPending;

  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  // Play style selected for the *next* game — grid-size buttons start the game immediately
  // using whichever style is currently selected.
  const [selectedMode, setSelectedMode] = useState<'number' | 'alpha' | 'image'>('number');
  const [pendingStart, setPendingStart] = useState<{ size: GridSize; mode: 'number' | 'alpha' | 'image'; difficulty?: Difficulty } | null>(null);

  useEffect(() => {
    if (!filteredGridOptions.find(o => o.size === gridSize)) {
      setGridSize(filteredGridOptions[0].size);
    }
  }, [gameMode]);

  useEffect(() => {
    if (!profileId || !isReady) return;
    customFetch<ActiveGame>(`/api/games/active/${profileId}`)
      .then(g => setActiveGame(g))
      .catch(() => setActiveGame(null));
  }, [profileId, isReady, location]);

  const modesForSize = (size: GridSize): Array<'number' | 'alpha' | 'image'> => {
    const smallGrid = size === 3 || size === 4;
    const modes: Array<'number' | 'alpha' | 'image'> = ['number'];
    if (smallGrid || gameFeatures.alphabetModeEnabled) modes.push('alpha');
    if (smallGrid || gameFeatures.imageModeEnabled) modes.push('image');
    return modes;
  };
  const availableModes = modesForSize(gridSize);

  const startInFlightRef = useRef(false);

  const doStart = async (size: GridSize, requestedMode: 'number' | 'alpha' | 'image', difficultyOverride?: Difficulty) => {
    if (!profileId) return;
    if (startInFlightRef.current) return;
    startInFlightRef.current = true;
    const mode = modesForSize(size).includes(requestedMode) ? requestedMode : 'number';
    const effectiveDifficulty = difficultyOverride ?? difficulty;
    setPendingStart(null);
    setIsGenerating(true);
    try {
      const puzzle = await generatePuzzle({ difficulty: effectiveDifficulty, gridSize: size as any });
      if (!puzzle) throw new Error('Failed to generate puzzle');
      const game = await createGame.mutateAsync({
        data: { profileId, puzzleId: puzzle.id, difficulty: effectiveDifficulty },
      });
      setActiveGame(null);
      const modeQuery = mode !== 'number' ? `?mode=${mode}` : '';
      setLocation(`/game/${game.id}${modeQuery}`);
    } catch (err) {
      console.error('Error starting game:', err);
    } finally {
      setIsGenerating(false);
      startInFlightRef.current = false;
    }
  };

  const handleSelectSize = (size: GridSize) => {
    if (startInFlightRef.current) return;
    setGridSize(size);
    const mode = modesForSize(size).includes(selectedMode) ? selectedMode : 'number';
    if (activeGame) {
      setPendingStart({ size, mode });
    } else {
      doStart(size, mode);
    }
  };

  // On 9×9/16×16 (where Play Style is hidden), changing difficulty starts a new game
  // immediately at the current grid size.
  const handleDifficultyAutoStart = (value: Difficulty) => {
    setDifficulty(value);
    if (startInFlightRef.current) return;
    if (activeGame) {
      setPendingStart({ size: gridSize, mode: 'number', difficulty: value });
    } else {
      doStart(gridSize, 'number', value);
    }
  };

  const activeTheme = IMAGE_THEMES.find(t => t.id === themeId) ?? IMAGE_THEMES[0];

  return (
    <div className="max-w-lg mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <button
        onClick={() => setLocation('/')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Brain Games 4 All
      </button>

      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Sudoku 4 All</h1>
        {profile && (
          <p className="text-muted-foreground mt-0.5">Welcome back, {profile.username}</p>
        )}
      </div>

      {/* Resume active game card — hide if the game's grid size is outside current mode */}
      {activeGame && (() => {
        const gs = activeGame.puzzle?.gridSize;
        const validForMode =
          gameMode === 'children' ? [3, 4].includes(gs!) :
          gameMode === 'adult'    ? [9, 16].includes(gs!) :
          true;
        return validForMode;
      })() && (
        <button
          onClick={() => setLocation(`/game/${activeGame.id}`)}
          className="w-full flex items-center gap-4 rounded-xl border-2 border-primary/40 bg-primary/5 p-4 hover:bg-primary/10 hover:border-primary/60 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-primary">Resume Last Game</p>
            <p className="text-xs text-muted-foreground capitalize">
              {activeGame.puzzle ? `${activeGame.puzzle.gridSize}×${activeGame.puzzle.gridSize} · ${activeGame.puzzle.difficulty}` : 'In progress'}
              {activeGame.mistakeCount > 0 && ` · ${activeGame.mistakeCount} mistake${activeGame.mistakeCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="text-primary text-lg shrink-0">→</div>
        </button>
      )}

      <Card className="shadow-md border-primary/15">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" /> New Game
          </CardTitle>
          <CardDescription>
            {availableModes.length > 1
              ? 'Pick a play style, then tap a grid size to jump right in'
              : 'Tap a grid size to jump right in'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Play mode selector — hidden entirely when only Numbers is available */}
          {availableModes.length > 1 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Play Style
            </label>

            {/* Numbers */}
            <Button
              size="lg"
              variant={selectedMode === 'number' ? 'default' : 'outline'}
              className="w-full h-13 text-base font-medium flex items-center justify-start gap-3"
              onClick={() => setSelectedMode('number')}
              disabled={isLoading}
            >
              <Hash className="w-5 h-5 shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <div className="font-semibold">Numbers</div>
                <div className="text-xs opacity-80">Classic 1, 2, 3 … style</div>
              </div>
            </Button>

            {/* Alphabets — always available for 3×3/4×4; gated by config for 9×9/16×16 */}
            {availableModes.includes('alpha') && (
            <Button
              size="lg"
              variant={selectedMode === 'alpha' ? 'default' : 'outline'}
              className="w-full h-13 text-base font-medium flex items-center gap-3"
              onClick={() => setSelectedMode('alpha')}
              disabled={isLoading}
            >
              <Type className="w-5 h-5 shrink-0 text-primary" />
              <div className="text-left flex-1 min-w-0">
                <div className="font-semibold">Letters</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  Colored A, B, C … &nbsp;<AlphaPreview count={gridSize} />
                </div>
              </div>
            </Button>
            )}

            {/* Image theme — always available for 3×3/4×4; gated by config for 9×9/16×16 */}
            {availableModes.includes('image') && (
            <Button
              size="lg"
              variant={selectedMode === 'image' ? 'default' : 'outline'}
              className="w-full h-13 text-base font-medium flex items-center gap-3"
              onClick={() => setSelectedMode('image')}
              disabled={isLoading}
            >
              <ThemeIcon themeId={themeId} value={1} size={24} />
              <div className="text-left flex-1 min-w-0">
                <div className="font-semibold">{activeTheme.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-0.5">
                  {Array.from({ length: Math.min(gridSize, 5) }, (_, i) => (
                    <ThemeIcon key={i} themeId={themeId} value={i + 1} size={14} />
                  ))}
                  {gridSize > 5 && <span className="opacity-50">…</span>}
                </div>
              </div>
            </Button>
            )}

            {availableModes.includes('image') && (
            <button
              onClick={() => setLocation('/themes')}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-0.5 underline underline-offset-2"
            >
              <Palette className="w-3 h-3 inline mr-1" />
              Change image theme
            </button>
            )}
          </div>
          )}

          {/* On 9×9/16×16 (only Numbers available), the Play Style slot is replaced by a
              Difficulty picker that starts a new game immediately on change. */}
          {availableModes.length === 1 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Difficulty
            </label>
            <Select value={difficulty} onValueChange={v => handleDifficultyAutoStart(v as Difficulty)} disabled={isLoading}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allDifficulties.map(d => (
                  <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Changing difficulty starts a new {gridSize}×{gridSize} game.</p>
          </div>
          )}

          {/* Difficulty dropdown — 3×3/4×4 only; picking difficulty here doesn't start the game,
              a grid-size tap does. */}
          {availableModes.length > 1 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Difficulty
            </label>
            <Select value={difficulty} onValueChange={v => setDifficulty(v as Difficulty)} disabled={isLoading}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allDifficulties.map(d => (
                  <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}

          {/* Grid size — tapping a size starts the game immediately with the selected style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Grid Size
            </label>
            <div className={`grid gap-2 ${filteredGridOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {filteredGridOptions.map(opt => (
                <Button
                  key={opt.size}
                  variant={gridSize === opt.size ? 'default' : 'outline'}
                  className="h-14 flex-col gap-0.5"
                  onClick={() => handleSelectSize(opt.size)}
                  disabled={isLoading}
                >
                  <span className="font-bold text-base leading-none">{opt.label}</span>
                  <span className="text-[11px] opacity-70 leading-none">{opt.sublabel}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenge banner */}
      <button
        onClick={() => setLocation('/daily-challenge')}
        className="w-full flex items-center gap-4 rounded-xl border-2 border-orange-200/70 bg-gradient-to-r from-orange-50 to-amber-50 p-4 hover:border-orange-300 hover:from-orange-100 hover:to-amber-100 transition-all text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 ring-1 ring-orange-200">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Daily Challenge</p>
          <p className="text-xs text-muted-foreground">Same puzzle for everyone · Resets at midnight</p>
        </div>
        <div className="text-orange-400 text-lg shrink-0">→</div>
      </button>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setLocation('/stats')}
          className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
        >
          <BarChart2 className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-sm">My Stats</p>
            <p className="text-xs text-muted-foreground">Wins & best times</p>
          </div>
        </button>
        <button
          onClick={() => setLocation('/leaderboard')}
          className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
        >
          <Trophy className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-sm">Leaderboard</p>
            <p className="text-xs text-muted-foreground">Top players</p>
          </div>
        </button>
      </div>

      {/* Info links */}
      <div className="flex items-center justify-center gap-6 pb-4">
        <button
          onClick={() => setInfoModal('rules')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" /> Rules
        </button>
        <span className="text-border">·</span>
        <button
          onClick={() => setInfoModal('controls')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5" /> Controls
        </button>
        <span className="text-border">·</span>
        <button
          onClick={() => setInfoModal('backstory')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Scroll className="w-3.5 h-3.5" /> Backstory
        </button>
      </div>

      {/* Rules modal */}
      <Dialog open={infoModal === 'rules'} onOpenChange={o => !o && setInfoModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Rules
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>Sudoku is a logic puzzle played on a grid divided into rows, columns, and boxes.</p>
            <ul className="space-y-2 list-none">
              {[
                'Every row must contain each symbol exactly once.',
                'Every column must contain each symbol exactly once.',
                'Every box must contain each symbol exactly once.',
                'No guessing required — every puzzle has a unique solution.',
                'Cells with pre-filled values are fixed and cannot be changed.',
              ].map((rule, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <p className="pt-1">
              Grid sizes range from 3×3 (9 cells) up to 16×16 (256 cells). Larger grids use letters or images instead of numbers.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Controls modal */}
      <Dialog open={infoModal === 'controls'} onOpenChange={o => !o && setInfoModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" /> Controls
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-foreground mb-2">Mouse / Touch</p>
              <div className="space-y-1.5 text-muted-foreground">
                {[
                  ['Tap a cell', 'Select it'],
                  ['Tap a number / letter', 'Fill the selected cell'],
                  ['Tap the eraser', 'Clear the selected cell'],
                  ['Tap the pencil', 'Toggle note (candidate) mode'],
                ].map(([action, result]) => (
                  <div key={action} className="flex justify-between gap-4">
                    <span>{action}</span>
                    <span className="text-foreground font-medium text-right">{result}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="font-semibold text-foreground mb-2">Keyboard</p>
              <div className="space-y-1.5 text-muted-foreground">
                {[
                  ['Arrow keys', 'Move between cells'],
                  ['1–9 / A–P', 'Fill selected cell'],
                  ['Backspace / Delete', 'Clear selected cell'],
                  ['N', 'Toggle note mode'],
                  ['Z (Ctrl+Z)', 'Undo last move'],
                ].map(([key, result]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs border">{key}</kbd>
                    <span className="text-right">{result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New game confirmation when one is in progress */}
      <Dialog open={pendingStart !== null} onOpenChange={o => !o && setPendingStart(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Start a new game?</DialogTitle>
            <DialogDescription>
              You have an unfinished{' '}
              {activeGame?.puzzle
                ? `${activeGame.puzzle.gridSize}×${activeGame.puzzle.gridSize} ${activeGame.puzzle.difficulty}`
                : ''}{' '}
              Sudoku in progress. Starting a new game will abandon it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" disabled={isLoading} onClick={() => {
              setPendingStart(null);
              if (activeGame) setLocation(`/game/${activeGame.id}`);
            }}>
              Resume Last Game
            </Button>
            <Button className="flex-1" disabled={isLoading} onClick={() => pendingStart && doStart(pendingStart.size, pendingStart.mode, pendingStart.difficulty)}>
              Start New Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backstory modal */}
      <Dialog open={infoModal === 'backstory'} onOpenChange={o => !o && setInfoModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-primary" /> Backstory
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Sudoku traces its roots to the 18th-century Swiss mathematician Leonhard Euler, who invented the concept of <em>Latin squares</em> — grids where each symbol appears exactly once in every row and column.
            </p>
            <p>
              The modern puzzle was popularised in 1979 by American architect Howard Garns, who published it as <em>Number Place</em> in Dell Magazines. It remained relatively obscure until 1984, when Japanese publisher Nikoli introduced it as <em>Sūji wa dokushin ni kagiru</em> — literally "the digits must remain single" — later shortened to <strong>Sudoku</strong>.
            </p>
            <p>
              The puzzle exploded globally after Wayne Gould, a retired New Zealand judge, wrote a computer program to generate puzzles and persuaded The Times of London to publish them in 2004. Within months Sudoku had become a worldwide phenomenon.
            </p>
            <p>
              Today billions of puzzles are solved every year, and the game has expanded far beyond classic 9×9 grids — into the multi-size, multi-symbol variants you can play right here.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
