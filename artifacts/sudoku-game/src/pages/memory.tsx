import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useImageTheme } from '@/hooks/use-image-theme';
import { getTheme } from '@/lib/themes';
import { customFetch } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Timer, Repeat2, Trophy, Gem, Star, RotateCcw, Zap, Brain } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type GridSize = 2 | 4 | 6 | 8;
type GamePhase = 'setup' | 'playing' | 'won';

interface Card {
  id: number;
  value: number;   // 1-based symbol index
  flipped: boolean;
  matched: boolean;
}

interface WinResult {
  points: number;
  xpEarned: number;
  gemsEarned: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const GRID_OPTIONS: { size: GridSize; label: string; pairs: number; desc: string }[] = [
  { size: 2, label: '2×4', pairs: 4,  desc: 'Beginner · 4 pairs' },
  { size: 4, label: '4×4', pairs: 8,  desc: 'Easy · 8 pairs' },
  { size: 6, label: '4×8', pairs: 16, desc: 'Medium · 16 pairs' },
  { size: 8, label: '8×8', pairs: 32, desc: 'Hard · 32 pairs' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPairs(gridSize: GridSize): number {
  if (gridSize === 2) return 4;  // 2×4  = 8 cards  = 4 pairs
  if (gridSize === 4) return 8;  // 4×4  = 16 cards = 8 pairs
  if (gridSize === 6) return 16; // 4×8  = 32 cards = 16 pairs
  return 32;                     // 8×8  = 64 cards = 32 pairs
}

function buildDeck(gridSize: GridSize): Card[] {
  const pairs = getPairs(gridSize);
  const values = Array.from({ length: pairs }, (_, i) => i + 1);
  const doubled = [...values, ...values];
  return shuffle(doubled).map((value, id) => ({ id, value, flipped: false, matched: false }));
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─── Card component ───────────────────────────────────────────────────────────

function MemoryCard({
  card,
  themeId,
  onClick,
  disabled,
  size,
}: {
  card: Card;
  themeId: string;
  onClick: () => void;
  disabled: boolean;
  size: GridSize;
}) {
  const theme = getTheme(themeId as any);
  const symbol = theme.symbols[(card.value - 1) % theme.symbols.length];
  const fontSize = size === 8 || size === 6 ? 'text-xl' : size === 4 ? 'text-2xl' : 'text-3xl';
  const cardH = size === 8 || size === 6 ? 'h-10 sm:h-12' : size === 2 ? 'h-20 sm:h-24' : 'h-16 sm:h-20';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || card.flipped || card.matched}
      className={`relative w-full ${cardH} rounded-xl cursor-pointer select-none focus:outline-none`}
      style={{ perspective: 600 }}
      whileTap={!disabled && !card.flipped && !card.matched ? { scale: 0.93 } : {}}
    >
      <motion.div
        className="w-full h-full"
        style={{ transformStyle: 'preserve-3d', position: 'relative' }}
        animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
        transition={{ duration: 0.32, ease: 'easeInOut' }}
      >
        {/* Back face */}
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center border-2 border-primary/20 bg-gradient-to-br from-primary/15 to-primary/8 hover:from-primary/25 hover:to-primary/15 transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-primary/40 text-2xl font-black">?</span>
        </div>
        {/* Front face */}
        <div
          className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 transition-colors
            ${card.matched
              ? 'border-green-400/60 bg-green-50'
              : 'border-primary/30 bg-primary/5'}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className={`${fontSize} leading-none`}>{symbol}</span>
        </div>
      </motion.div>
    </motion.button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MemoryMatchPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { profileId } = useAuth();
  const { themeId } = useImageTheme();

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [gridSize, setGridSize] = useState<GridSize>(2);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [flips, setFlips] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);
  const [challengeBonus, setChallengeBonus] = useState<{ bonusXp: number; bonusGems: number } | null>(null);

  // Read ?challenge=daily|weekly from URL
  const challengeType = (() => {
    const p = new URLSearchParams(search);
    const c = p.get('challenge');
    return c === 'daily' || c === 'weekly' ? c : null;
  })();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const startGame = useCallback(async (size: GridSize) => {
    setGridSize(size);
    setCards(buildDeck(size));
    setFlippedIds([]);
    setMatchedCount(0);
    setFlips(0);
    setElapsed(0);
    setLockBoard(false);
    setWinResult(null);
    setGameId(null);
    setPhase('playing');

    // Create server-side game record (best-effort)
    try {
      const res = await customFetch<{ id: number }>('/api/memory-games', {
        method: 'POST',
        body: JSON.stringify({ profileId: profileId ?? undefined, gridSize: size }),
      });
      setGameId(res.id);
    } catch {
      // non-fatal — game still plays locally
    }
  }, [profileId]);

  // Auto-start when ?size= is in the URL (e.g. from portal quick-start buttons)
  const startGameRef = useRef(startGame);
  useEffect(() => { startGameRef.current = startGame; }, [startGame]);
  useEffect(() => {
    const params = new URLSearchParams(search);
    const s = parseInt(params.get('size') ?? '', 10);
    if ([2, 4, 6, 8].includes(s)) {
      startGameRef.current(s as GridSize);
    }
  }, [search]);

  const handleCardClick = useCallback((cardId: number) => {
    if (lockBoard) return;

    setFlippedIds(prev => {
      if (prev.includes(cardId)) return prev;
      const next = [...prev, cardId];

      if (next.length === 2) {
        setFlips(f => f + 1);
        setLockBoard(true);

        const [a, b] = next;
        setCards(cards => {
          const ca = cards.find(c => c.id === a)!;
          const cb = cards.find(c => c.id === b)!;

          if (ca.value === cb.value) {
            // Match
            const updated = cards.map(c =>
              c.id === a || c.id === b ? { ...c, flipped: true, matched: true } : c,
            );
            const newMatchedCount = updated.filter(c => c.matched).length / 2;
            setMatchedCount(newMatchedCount);

            // Check win
            const totalPairs = getPairs(gridSize);
            if (newMatchedCount === totalPairs) {
              setTimeout(() => completeGame(updated), 400);
            } else {
              setTimeout(() => {
                setFlippedIds([]);
                setLockBoard(false);
              }, 400);
            }
            return updated;
          } else {
            // No match — flip back after delay
            const flippedTemp = cards.map(c =>
              c.id === a || c.id === b ? { ...c, flipped: true } : c,
            );
            setTimeout(() => {
              setCards(prev => prev.map(c =>
                c.id === a || c.id === b ? { ...c, flipped: false } : c,
              ));
              setFlippedIds([]);
              setLockBoard(false);
            }, 900);
            return flippedTemp;
          }
        });
        return [];
      }

      // First card flipped
      setCards(cards => cards.map(c => c.id === cardId ? { ...c, flipped: true } : c));
      return next;
    });
  }, [lockBoard, gridSize]);

  const completeGame = useCallback(async (finalCards: Card[]) => {
    setPhase('won');
    if (timerRef.current) clearInterval(timerRef.current);

    const currentElapsed = elapsed;
    const currentFlips = flips + 1;

    let pts = 0;
    if (gameId) {
      try {
        const result = await customFetch<WinResult>(`/api/memory-games/${gameId}/complete`, {
          method: 'POST',
          body: JSON.stringify({ elapsedSeconds: currentElapsed, flips: currentFlips }),
        });
        setWinResult(result);
        pts = result.points;
      } catch {
        setWinResult({ points: 0, xpEarned: 0, gemsEarned: 0 });
      }
    } else {
      setWinResult({ points: 0, xpEarned: 0, gemsEarned: 0 });
    }

    // Claim challenge bonus if this game was started from a challenge
    if (challengeType && profileId) {
      try {
        const bonus = await customFetch<{ alreadyClaimed: boolean; bonusXp: number; bonusGems: number }>(
          '/api/memory-challenges/complete',
          { method: 'POST', body: JSON.stringify({ profileId, type: challengeType, elapsedSeconds: currentElapsed, flips: currentFlips, points: pts }) }
        );
        if (!bonus.alreadyClaimed) {
          setChallengeBonus({ bonusXp: bonus.bonusXp, bonusGems: bonus.bonusGems });
        }
      } catch { /* non-fatal */ }
    }
  }, [gameId, elapsed, flips, challengeType, profileId]);

  // Wrap completeGame in a ref so the card-click closure captures it fresh
  const completeGameRef = useRef(completeGame);
  useEffect(() => { completeGameRef.current = completeGame; }, [completeGame]);

  const totalPairs = getPairs(gridSize);
  const theme = getTheme(themeId as any);

  // ── Setup screen ─────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="max-w-lg mx-auto w-full space-y-8 animate-in fade-in duration-500">
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Game Hub
        </button>

        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Memory Match</h1>
          <p className="text-muted-foreground mt-0.5">Flip cards to find matching pairs</p>
        </div>

        {/* Theme preview */}
        <div className="flex items-center gap-2 flex-wrap">
          {theme.symbols.slice(0, 8).map((sym, i) => (
            <span key={i} className="text-2xl leading-none">{sym}</span>
          ))}
          <span className="text-muted-foreground text-sm">… using {theme.name} theme</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Choose Grid Size</p>
          {GRID_OPTIONS.map(opt => (
            <button
              key={opt.size}
              onClick={() => startGame(opt.size)}
              className="w-full flex items-center justify-between rounded-xl border-2 border-primary/15 bg-gradient-to-r from-primary/5 to-primary/3 hover:border-primary/40 hover:from-primary/10 hover:to-primary/8 transition-all p-4 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-lg group-hover:bg-primary/20 transition-colors">
                  {opt.label}
                </div>
                <div>
                  <p className="font-semibold">{opt.desc}</p>
                  <p className="text-xs text-muted-foreground">
                    {opt.size === 2 || opt.size === 4 ? '+1 XP · min 1 💎' : opt.size === 6 ? '+2 XP · min 1 💎' : '+3 XP · min 1 💎'}
                  </p>
                </div>
              </div>
              <span className="text-primary text-lg">→</span>
            </button>
          ))}
        </div>

        {/* Challenge banner */}
        <button
          onClick={() => setLocation('/memory-challenge')}
          className="w-full flex items-center justify-between rounded-xl border-2 border-violet-300/50 bg-gradient-to-r from-violet-50 to-purple-50 hover:border-violet-400/60 hover:from-violet-100 hover:to-purple-100 transition-all px-4 py-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-violet-900">Daily &amp; Weekly Challenges</p>
              <p className="text-xs text-violet-600">Earn bonus XP and gems for completing challenges</p>
            </div>
          </div>
          <span className="text-violet-500 font-bold">→</span>
        </button>

        <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground text-xs uppercase tracking-widest">How to play</p>
          <p>Tap any card to reveal it, then tap a second card to find its pair.</p>
          <p>Match all pairs as fast as possible with as few flips as possible to maximise your score.</p>
          <p>Points, XP, and 💎 gems are awarded on completion.</p>
        </div>
      </div>
    );
  }

  // ── Win screen ───────────────────────────────────────────────────────────────
  if (phase === 'won') {
    return (
      <div className="max-w-lg mx-auto w-full space-y-6 animate-in fade-in duration-500 pt-4">
        <div className="text-center space-y-2">
          <div className="text-6xl mb-2">🎉</div>
          <h1 className="text-3xl font-serif font-bold">You won!</h1>
          <p className="text-muted-foreground">All {totalPairs} pairs matched</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Timer, label: 'Time', value: formatTime(elapsed) },
            { icon: Repeat2, label: 'Flips', value: flips.toString() },
            { icon: Trophy, label: 'Points', value: winResult ? winResult.points.toLocaleString() : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4 text-center space-y-1">
              <Icon className="w-4 h-4 text-primary mx-auto" />
              <p className="text-xl font-black tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {winResult && (winResult.xpEarned > 0 || winResult.gemsEarned > 0) && (
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/8 to-primary/4 p-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-black text-lg">+{winResult.xpEarned} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-cyan-500" />
              <span className="font-black text-lg">+{winResult.gemsEarned} 💎</span>
            </div>
          </div>
        )}

        {challengeBonus && (
          <div className="rounded-xl border-2 border-violet-300/50 bg-gradient-to-r from-violet-50 to-purple-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-violet-700 font-semibold text-sm">
              <Brain className="w-4 h-4" />
              {challengeType === 'daily' ? 'Daily' : 'Weekly'} Challenge Complete! 🎊
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-black">+{challengeBonus.bonusXp} bonus XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-cyan-500" />
                <span className="font-black">+{challengeBonus.bonusGems} bonus 💎</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2" onClick={() => startGame(gridSize)}>
            <RotateCcw className="w-4 h-4" /> Play again
          </Button>
          <Button className="gap-2" onClick={() => setPhase('setup')}>
            <Star className="w-4 h-4" /> New size
          </Button>
        </div>

        <button
          onClick={() => setLocation('/')}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Game Hub
        </button>
      </div>
    );
  }

  // ── Game board ───────────────────────────────────────────────────────────────
  const colClass = gridSize === 2 ? 'grid-cols-4' : gridSize === 4 ? 'grid-cols-4' : 'grid-cols-8';

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setPhase('setup')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-sm font-mono tabular-nums shrink-0">
          <Timer className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-foreground font-semibold">{formatTime(elapsed)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm shrink-0">
          <Repeat2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-semibold">{flips}</span>
          <span className="text-muted-foreground text-xs">flips</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm shrink-0">
          <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-semibold">{matchedCount}</span>
          <span className="text-muted-foreground text-xs">/ {totalPairs}</span>
        </div>

        {/* Progress bar */}
        <div className="flex-1 min-w-24 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${(matchedCount / totalPairs) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <button
          onClick={() => startGame(gridSize)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Card grid */}
      <div className={`grid ${colClass} gap-1.5 sm:gap-2`}>
        {cards.map(card => (
          <MemoryCard
            key={card.id}
            card={card}
            themeId={themeId}
            onClick={() => handleCardClick(card.id)}
            disabled={lockBoard}
            size={gridSize}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Theme: {theme.name} · <button onClick={() => setLocation('/themes')} className="underline underline-offset-2 hover:text-foreground transition-colors">Change</button>
      </p>
    </div>
  );
}
