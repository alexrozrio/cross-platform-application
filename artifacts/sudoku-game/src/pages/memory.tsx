import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useImageTheme } from '@/hooks/use-image-theme';
import { getTheme } from '@/lib/themes';
import { customFetch, useGetProfile } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Timer, Repeat2, Trophy, Gem, Star, RotateCcw, Zap, Brain, BarChart2, BookOpen, Keyboard, Scroll, Lightbulb, Volume2, VolumeX, Share2 } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';
import { Confetti } from '@/components/confetti';
import { pickCompletionMessage, type CompletionMessage } from '@/lib/completion-messages';
import { getLevelFromXp } from '@/lib/levels';
import { toast } from 'sonner';
import {
  type GridSize, type DisplayMode, type Card,
  shuffle, getPairs, buildDeck, formatTime, ALPHA_LABELS, getCardLabel,
} from '@/lib/memory-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type GamePhase = 'setup' | 'playing' | 'won';
type InfoModal = 'rules' | 'controls' | 'backstory' | null;

interface WinResult {
  points: number;
  xpEarned: number;
  isPersonalBest?: boolean;
  gemsEarned: number;
  tipsUsed?: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MAX_TIPS = 2;

const GRID_OPTIONS: { size: GridSize; label: string; pairs: number; desc: string }[] = [
  { size: 2, label: '2×4', pairs: 4,  desc: 'Beginner · 4 pairs' },
  { size: 4, label: '4×4', pairs: 8,  desc: 'Easy · 8 pairs' },
  { size: 6, label: '8×4', pairs: 16, desc: 'Medium · 16 pairs' },
  { size: 8, label: '8×8', pairs: 32, desc: 'Hard · 32 pairs' },
];

// ─── Card component ───────────────────────────────────────────────────────────

function MemoryCard({
  card,
  themeId,
  onClick,
  disabled,
  size,
  displayMode,
  hinted,
  fillHeight,
}: {
  card: Card;
  themeId: string;
  onClick: () => void;
  disabled: boolean;
  size: GridSize;
  displayMode: DisplayMode;
  hinted?: boolean;
  fillHeight?: boolean;
}) {
  const theme = getTheme(themeId as any);
  const symbol = theme.symbols[(card.value - 1) % theme.symbols.length];

  // Font sizes scale with grid: 2×4 biggest, 8×8 smallest — sized to fill ~70–80% of each card
  const imgSize = size === 8 ? 'text-3xl sm:text-4xl' : size === 6 ? 'text-4xl sm:text-5xl' : size === 4 ? 'text-5xl sm:text-6xl' : 'text-6xl sm:text-7xl';
  const txtSizeSingle = size === 8 ? 'text-2xl sm:text-3xl' : size === 6 ? 'text-3xl sm:text-4xl' : size === 4 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl';
  const txtSizeMulti  = size === 8 ? 'text-lg sm:text-xl'  : size === 6 ? 'text-xl sm:text-2xl'  : size === 4 ? 'text-2xl sm:text-3xl'  : 'text-4xl sm:text-5xl';

  // Front face content
  let frontContent: React.ReactNode;
  if (displayMode === 'image') {
    frontContent = <span className={`${imgSize} leading-none`}>{symbol}</span>;
  } else {
    const label = getCardLabel(card.value, displayMode);
    frontContent = (
      <span className={`${label.length > 1 ? txtSizeMulti : txtSizeSingle} font-black leading-none tabular-nums`}>
        {label}
      </span>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || card.flipped || card.matched}
      className={`relative w-full ${fillHeight ? 'h-full' : 'aspect-square'} rounded-xl cursor-pointer select-none focus:outline-none`}
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
          className={[
            'absolute inset-0 rounded-xl flex items-center justify-center border-2 transition-all',
            hinted
              ? 'border-amber-400 bg-gradient-to-br from-amber-100/80 to-amber-50/60 shadow-[0_0_0_3px_rgba(251,191,36,0.4)] dark:from-amber-900/40 dark:to-amber-800/20 animate-pulse'
              : 'border-primary/20 bg-gradient-to-br from-primary/15 to-primary/8 hover:from-primary/25 hover:to-primary/15',
          ].join(' ')}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className={`text-2xl font-black ${hinted ? 'text-amber-500' : 'text-primary/40'}`}>?</span>
        </div>
        {/* Front face */}
        <div
          className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 transition-colors
            ${card.matched
              ? 'border-green-400/60 bg-green-50 dark:bg-green-950/30'
              : 'border-primary/30 bg-primary/5'}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {frontContent}
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
  const queryClient = useQueryClient();

  const { data: profile } = useGetProfile(profileId as number, {
    query: { enabled: !!profileId },
  });

  const sounds = useSound(profile?.soundEnabled);

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [gridSize, setGridSize] = useState<GridSize>(2);
  const [infoModal, setInfoModal] = useState<InfoModal>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('image');
  const [showNewGame, setShowNewGame] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'reset' } | { type: 'new'; size: GridSize } | null>(null);
  const [tipsUsed, setTipsUsed] = useState(0);
  const [hintedIds, setHintedIds] = useState<number[]>([]);

  const gameMode = (profile?.gameMode ?? '4all') as 'children' | 'adult' | '4all';
  // Options the user can see and start — hidden entirely when out of their mode
  const renderGridOptions = GRID_OPTIONS.filter(o =>
    gameMode === 'children' ? o.size <= 4 :
    gameMode === 'adult'    ? o.size >= 6 :
    true
  );
  const filteredGridOptions = renderGridOptions;

  useEffect(() => {
    if (filteredGridOptions.length > 0 && !filteredGridOptions.find(o => o.size === gridSize)) {
      setGridSize(filteredGridOptions[0].size);
    }
  }, [gameMode]);

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [flips, setFlips] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [winMessage, setWinMessage] = useState<CompletionMessage | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);
  const [challengeBonus, setChallengeBonus] = useState<{ bonusXp: number; bonusGems: number } | null>(null);

  // Read ?challenge=daily|weekly from URL
  const challengeType = (() => {
    const p = new URLSearchParams(search);
    const c = p.get('challenge');
    return c === 'daily' || c === 'weekly' ? c : null;
  })();

  // Read ?duelGameId=X&gridSize=Y from URL (when starting from a challenge duel)
  const duelGameId = (() => {
    const p = new URLSearchParams(search);
    const d = parseInt(p.get('duelGameId') ?? '', 10);
    return isNaN(d) ? null : d;
  })();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const restoredRef = useRef(false);

  const STORAGE_KEY = 'brain-games-memory-session';

  // Restore from localStorage on mount (before URL auto-start)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s.savedAt || Date.now() - s.savedAt > 12 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      restoredRef.current = true;
      setGridSize(s.gridSize);
      setCards((s.cards as Card[]).map((c) => ({ ...c, flipped: c.matched })));
      setFlippedIds([]);
      setLockBoard(false);
      setFlips(s.flips ?? 0);
      setElapsed(s.elapsed ?? 0);
      setGameId(s.gameId ?? null);
      setTipsUsed(s.tipsUsed ?? 0);
      setHintedIds(s.hintedIds ?? []);
      setMatchedCount((s.cards as Card[]).filter((c) => c.matched).length);
      setPhase('playing');
      toast.info('Resuming your last game…', { duration: 2500 });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage on every move during playing phase
  useEffect(() => {
    if (phase !== 'playing' || cards.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gridSize, cards, flips, elapsed, gameId, tipsUsed, hintedIds, savedAt: Date.now(),
      }));
    } catch { /* quota exceeded — ignore */ }
  }, [phase, gridSize, cards, flips, elapsed, gameId, tipsUsed, hintedIds]);

  // Timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const startGame = useCallback(async (size: GridSize, presetGameId?: number) => {
    setGridSize(size);
    setCards(buildDeck(size));
    setFlippedIds([]);
    setMatchedCount(0);
    setFlips(0);
    setElapsed(0);
    setLockBoard(false);
    setWinResult(null);
    setGameId(presetGameId ?? null);
    setTipsUsed(0);
    setHintedIds([]);
    setPhase('playing');

    // If a duel game ID was pre-created by the server, skip creation
    if (presetGameId) return;

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

  // Auto-start when ?size= or ?duelGameId= is in the URL (skip if restored from localStorage)
  const startGameRef = useRef(startGame);
  useEffect(() => { startGameRef.current = startGame; }, [startGame]);
  useEffect(() => {
    if (restoredRef.current) return;
    const params = new URLSearchParams(search);
    const duelId = parseInt(params.get('duelGameId') ?? '', 10);
    const gs = parseInt(params.get('gridSize') ?? params.get('size') ?? '', 10);
    if (!isNaN(duelId) && [2, 4, 6, 8].includes(gs)) {
      startGameRef.current(gs as GridSize, duelId);
      return;
    }
    const s = gs;
    if ([2, 4, 6, 8].includes(s)) {
      startGameRef.current(s as GridSize);
    }
  }, [search]);

  const handleTip = useCallback(() => {
    if (tipsUsed >= MAX_TIPS || lockBoard) return;

    // Pick one unmatched, face-down pair to highlight
    setCards(currentCards => {
      const unmatched = currentCards.filter(c => !c.matched && !c.flipped);
      if (unmatched.length < 2) return currentCards;

      // Find any value that has 2+ unmatched face-down cards
      const valueCounts = new Map<number, number[]>();
      for (const c of unmatched) {
        const ids = valueCounts.get(c.value) ?? [];
        ids.push(c.id);
        valueCounts.set(c.value, ids);
      }
      const pairEntry = Array.from(valueCounts.entries()).find(([, ids]) => ids.length >= 2);
      if (!pairEntry) return currentCards;

      const [, pairIds] = pairEntry;
      const chosen = pairIds.slice(0, 2);
      setHintedIds(chosen);
      setTipsUsed(t => t + 1);

      // Clear the highlight after 2 seconds
      setTimeout(() => setHintedIds([]), 2000);
      sounds.note();

      return currentCards; // no card state change — just highlighting
    });
  }, [tipsUsed, lockBoard]);

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
            sounds.place();
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
            sounds.error();
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
      sounds.click();
      setCards(cards => cards.map(c => c.id === cardId ? { ...c, flipped: true } : c));
      return next;
    });
  }, [lockBoard, gridSize]);

  const completeGame = useCallback(async (finalCards: Card[]) => {
    setPhase('won');
    sounds.complete();
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem('brain-games-memory-session');

    // Pick a congratulation message based on grid difficulty
    const diffBySize: Record<GridSize, string> = { 2: 'easy', 4: 'medium', 6: 'hard', 8: 'expert' };
    setWinMessage(pickCompletionMessage(diffBySize[gridSize]));

    const currentElapsed = elapsed;
    const currentFlips = flips + 1;

    let pts = 0;
    if (gameId) {
      try {
        const result = await customFetch<WinResult>(`/api/memory-games/${gameId}/complete`, {
          method: 'POST',
          body: JSON.stringify({ elapsedSeconds: currentElapsed, flips: currentFlips, tipsUsed }),
        });
        setWinResult(result);
        pts = result.points;
      } catch {
        setWinResult({ points: 0, xpEarned: 0, gemsEarned: 0 });
      }
    } else {
      setWinResult({ points: 0, xpEarned: 0, gemsEarned: 0 });
    }

    // Trigger achievement detection and refresh profile XP/gems
    if (profileId) {
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/achievements/${profileId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/${profileId}`] });
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

  const handleShare = useCallback(async () => {
    const sizeLabel = GRID_OPTIONS.find(o => o.size === gridSize)?.label ?? `${gridSize}×${gridSize}`;
    const diffLabel = GRID_OPTIONS.find(o => o.size === gridSize)?.desc.split(' · ')[0] ?? '';
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const appUrl = `${window.location.origin}/memory`;
    const lines = [
      `${winMessage?.emoji ?? '🎉'} Matched all ${getPairs(gridSize)} pairs (${sizeLabel} ${diffLabel}) in ${formatTime(elapsed)}!`,
      `🔄 ${flips} flip${flips !== 1 ? 's' : ''}`,
      winResult && winResult.points > 0 ? `+${winResult.points.toLocaleString()} pts` : null,
      rank ? `🏅 ${rank} · Brain Games 4 All` : '🧠 Brain Games 4 All',
      `🔗 ${appUrl}`,
    ].filter(Boolean).join('\n');
    try {
      if (navigator.share) {
        await navigator.share({ text: lines });
      } else {
        await navigator.clipboard.writeText(lines);
        toast.success('Result copied to clipboard!', { duration: 2500 });
      }
    } catch {
      // user cancelled or clipboard blocked — silent
    }
  }, [gridSize, profile, winMessage, elapsed, flips, winResult]);

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
          <ArrowLeft className="w-4 h-4" /> Brain Games 4 All
        </button>

        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Memory Match 4 All</h1>
          {profile ? (
            <p className="text-muted-foreground mt-0.5">Welcome back, {profile.username}</p>
          ) : (
            <p className="text-muted-foreground mt-0.5">Flip cards to find matching pairs</p>
          )}
        </div>

        {/* Theme / mode preview */}
        <div className="flex items-center gap-2 flex-wrap">
          {displayMode === 'image'
            ? theme.symbols.slice(0, 8).map((sym, i) => (
                <span key={i} className="text-2xl leading-none">{sym}</span>
              ))
            : (displayMode === 'number'
                ? Array.from({ length: 8 }, (_, i) => String(i + 1))
                : ALPHA_LABELS.slice(0, 8)
              ).map((lbl, i) => (
                <span key={i} className={`text-xl font-black leading-none ${displayMode === 'alpha' ? 'font-mono' : ''}`}>{lbl}</span>
              ))
          }
          <span className="text-muted-foreground text-sm">
            {displayMode === 'image' ? `… using ${theme.name} theme` : displayMode === 'number' ? '… 1 – 32' : '… A – Z + a – f'}
          </span>
        </div>

        {/* Display Mode selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Card Display Mode</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'image'  as DisplayMode, label: '🎴 Image',  sub: 'Theme symbols' },
              { id: 'number' as DisplayMode, label: '1 2 3 Numbers', sub: '1 – 32' },
              { id: 'alpha'  as DisplayMode, label: 'A B C Alpha',   sub: 'A–Z + a–f' },
            ] as const).map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setDisplayMode(m.id)}
                className={[
                  'flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2 text-center transition-all',
                  displayMode === m.id
                    ? 'border-primary bg-primary/8 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50',
                ].join(' ')}
              >
                <span className="text-sm font-bold leading-tight">{m.label}</span>
                <span className="text-[10px] text-muted-foreground">{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Choose Grid Size</p>
          {renderGridOptions.map(opt => (
            <button
              key={opt.size}
              onClick={() => startGame(opt.size)}
              className="w-full flex items-center justify-between rounded-xl border-2 transition-all p-4 text-left group border-primary/15 bg-gradient-to-r from-primary/5 to-primary/3 hover:border-primary/40 hover:from-primary/10 hover:to-primary/8"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg transition-colors bg-primary/10 text-primary group-hover:bg-primary/20">
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

        {/* Quick links — Stats & Leaderboard */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLocation('/stats?tab=memory')}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
          >
            <BarChart2 className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-sm">My Stats</p>
              <p className="text-xs text-muted-foreground">Wins &amp; best times</p>
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
              <p>Memory Match is a classic concentration game where all cards start face-down.</p>
              <ul className="space-y-2 list-none">
                {[
                  'Tap any face-down card to flip it and reveal its symbol.',
                  'Tap a second card — if the symbols match, both cards stay face-up.',
                  'If they don\'t match, both cards flip back after a short delay.',
                  'Match all pairs to complete the game.',
                  'Fewer flips and less time earns a higher score.',
                ].map((rule, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <p className="pt-1">
                Grid sizes range from 2×4 (4 pairs) up to 8×8 (32 pairs). Points, XP, and 💎 gems are awarded on completion.
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
                    ['Tap a face-down card', 'Flip it to reveal its symbol'],
                    ['Tap a second card', 'Attempt a match'],
                    ['Wait after a mismatch', 'Cards auto-flip back'],
                    ['Reset button', 'Start the same grid over'],
                  ].map(([action, result]) => (
                    <div key={action} className="flex justify-between gap-4">
                      <span>{action}</span>
                      <span className="text-foreground font-medium text-right">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold text-foreground mb-2">Scoring</p>
                <div className="space-y-1.5 text-muted-foreground">
                  {[
                    ['Base score', 'Increases with grid size'],
                    ['Time bonus', 'Faster completion = more points'],
                    ['Flip bonus', 'Fewer flips = more points'],
                    ['XP & Gems', 'Awarded on game completion'],
                  ].map(([key, result]) => (
                    <div key={key} className="flex justify-between gap-4">
                      <span className="font-medium text-foreground">{key}</span>
                      <span className="text-right">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                Memory Match — also known as Concentration, Pairs, or Pelmanism — is one of the oldest card games in the world, with roots stretching back to 19th-century Japan.
              </p>
              <p>
                The game was popularised in the West as <em>Concentration</em>, named after the mental effort required to hold multiple card positions in mind simultaneously. It appeared in parlour game books as early as the 1890s and became a staple of children's toy boxes throughout the 20th century.
              </p>
              <p>
                Memory training with matching cards has been studied extensively by cognitive scientists. Regularly playing the game is linked to improvements in short-term visual memory, pattern recognition, and focus — benefits that hold across all age groups.
              </p>
              <p>
                In the digital era the game has evolved far beyond a standard 52-card deck. Here you can play with themed emoji symbols across grids from a quick 2×4 sprint to a challenging 8×8 marathon — and compete on global leaderboards for the fastest solve.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Win screen ───────────────────────────────────────────────────────────────
  if (phase === 'won') {
    return (
      <div className="max-w-lg mx-auto w-full space-y-6 animate-in fade-in duration-500 pt-4">
        <Confetti />
        <div className="rounded-2xl bg-primary text-primary-foreground p-6 text-center space-y-3 shadow-lg">
          <div className="text-5xl mb-1">{winMessage?.emoji ?? '🎉'}</div>
          <h1 className="text-3xl font-serif font-bold">{winMessage?.headline ?? 'You won!'}</h1>
          <p className="opacity-80 text-sm">All {totalPairs} pairs matched</p>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 mt-1 text-sm opacity-80 hover:opacity-100 transition-opacity bg-white/15 hover:bg-white/25 rounded-lg px-4 py-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share your result
          </button>
        </div>

        {winResult?.isPersonalBest && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-yellow-300/60 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20 dark:border-yellow-700/40 px-4 py-2.5">
            <span className="text-lg">🏆</span>
            <span className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">New Personal Best!</span>
          </div>
        )}

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

        {tipsUsed > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/40 px-4 py-3 flex items-center gap-3">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <span className="font-semibold">{tipsUsed} tip{tipsUsed > 1 ? 's' : ''} used</span>
              {' '}— {tipsUsed === 1 ? '−15%' : '−30%'} score penalty applied
            </p>
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

        <div className="space-y-3">
          <Button variant="outline" className="w-full gap-2" onClick={() => startGame(gridSize)}>
            <RotateCcw className="w-4 h-4" /> Play again ({GRID_OPTIONS.find(o => o.size === gridSize)?.desc})
          </Button>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">Or start a new game</p>
            <div className="grid grid-cols-2 gap-2">
              {filteredGridOptions.map(opt => (
                <button
                  key={opt.size}
                  onClick={() => startGame(opt.size)}
                  className={[
                    'flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2 text-center transition-all',
                    opt.size === gridSize
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50',
                  ].join(' ')}
                >
                  <span className="font-black text-base text-primary">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setLocation('/')}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Brain Games 4 All
        </button>
      </div>
    );
  }

  // ── Game board ───────────────────────────────────────────────────────────────
  const colClass = gridSize === 2 ? 'grid-cols-4' : gridSize === 4 ? 'grid-cols-4' : gridSize === 6 ? 'grid-cols-4' : 'grid-cols-8';

  return (
    <div className="max-w-2xl w-full space-y-4 animate-in fade-in duration-300 -mx-2 px-2 sm:mx-auto sm:px-0">
      {/* Header bar — two rows so nothing overflows on mobile */}
      <div className="flex flex-col gap-1.5">

        {/* Row 1: back · stats · progress bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAbandonConfirm(true)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {profile?.showTimer !== false && (
            <div className="flex items-center gap-1.5 text-sm font-mono tabular-nums shrink-0">
              <Timer className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground font-semibold">{formatTime(elapsed)}</span>
            </div>
          )}

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
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${(matchedCount / totalPairs) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Row 2: actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPendingAction({ type: 'reset' })}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowNewGame(v => !v)}
                  className={[
                    'flex items-center gap-1 text-xs transition-colors shrink-0 font-medium',
                    showNewGame ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                >
                  <Star className="w-3 h-3" /> New
                </button>
              </TooltipTrigger>
              <TooltipContent>Start new game</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            onClick={handleTip}
            disabled={tipsUsed >= MAX_TIPS || lockBoard}
            className={[
              'flex items-center gap-1 text-xs transition-colors shrink-0 font-medium disabled:cursor-not-allowed',
              tipsUsed >= MAX_TIPS ? 'text-muted-foreground/40' : 'text-amber-500 hover:text-amber-600',
            ].join(' ')}
            title="Tip: briefly reveals all cards"
          >
            <Lightbulb className={`w-3 h-3 ${tipsUsed >= MAX_TIPS ? 'opacity-40' : ''}`} />
            <span>Tip</span>
            <span className={`text-[9px] font-bold leading-none tabular-nums ${tipsUsed >= MAX_TIPS ? 'text-red-400' : 'text-amber-500'}`}>
              {MAX_TIPS - tipsUsed}
            </span>
          </button>

          <button
            onClick={sounds.toggle}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title={sounds.enabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {sounds.enabled
              ? <Volume2 className="w-3.5 h-3.5" />
              : <VolumeX className="w-3.5 h-3.5" />
            }
          </button>

          {/* Mode toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5 shrink-0">
            {([
              { id: 'image'  as DisplayMode, title: '🎴' },
              { id: 'number' as DisplayMode, title: '123' },
              { id: 'alpha'  as DisplayMode, title: 'ABC' },
            ] as const).map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setDisplayMode(m.id)}
                className={[
                  'px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all',
                  displayMode === m.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
                title={m.id === 'image' ? 'Image mode' : m.id === 'number' ? 'Number mode' : 'Alpha mode'}
              >
                {m.title}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Abandon game confirmation */}
      <Dialog open={showAbandonConfirm} onOpenChange={setShowAbandonConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Abandon this game?</DialogTitle>
            <DialogDescription>
              You have {matchedCount} of {totalPairs} pairs matched. Your progress will be lost if you go back to setup.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setShowAbandonConfirm(false)}>
              Keep Playing
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => {
              localStorage.removeItem('brain-games-memory-session');
              setShowAbandonConfirm(false);
              setPhase('setup');
            }}>
              Abandon Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset / new-game confirmation */}
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === 'reset' ? 'Reset this game?' : 'Start a new game?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'reset'
                ? 'All cards will be reshuffled and your current progress will be lost.'
                : `This will start a fresh ${GRID_OPTIONS.find(o => o.size === (pendingAction as any)?.size)?.desc ?? 'game'}. Your current progress will be lost.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Playing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingAction) return;
                if (pendingAction.type === 'reset') startGame(gridSize);
                else startGame(pendingAction.size);
                setPendingAction(null);
              }}
            >
              {pendingAction?.type === 'reset' ? 'Reset' : 'Start New Game'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New game level picker */}
      <AnimatePresence>
        {showNewGame && (
          <motion.div
            key="new-game-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border-2 border-primary/20 bg-primary/4 p-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Start New Game</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {filteredGridOptions.map(opt => (
                  <button
                    key={opt.size}
                    onClick={() => { setPendingAction({ type: 'new', size: opt.size }); setShowNewGame(false); }}
                    className={[
                      'flex flex-col items-center gap-1 rounded-lg border-2 py-2.5 px-2 text-center transition-all',
                      opt.size === gridSize
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50',
                    ].join(' ')}
                  >
                    <span className="font-black text-sm text-primary">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card grid */}
      {/* For 8×4: fix grid height to viewport so 8 rows fit without scrolling */}
      <div
        className={`grid ${colClass} gap-1 sm:gap-2`}
        style={(gridSize === 4 || gridSize === 6 || gridSize === 8) ? {
          height: 'calc(100dvh - 280px)',
          gridTemplateRows: gridSize === 4 ? 'repeat(4, 1fr)' : 'repeat(8, 1fr)',
        } : undefined}
      >
        {cards.map(card => (
          <MemoryCard
            key={card.id}
            card={card}
            themeId={themeId}
            onClick={() => handleCardClick(card.id)}
            disabled={lockBoard}
            size={gridSize}
            displayMode={displayMode}
            hinted={hintedIds.includes(card.id)}
            fillHeight={gridSize === 4 || gridSize === 6 || gridSize === 8}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {displayMode === 'image'
          ? <>Theme: {theme.name} · <button onClick={() => setLocation('/themes')} className="underline underline-offset-2 hover:text-foreground transition-colors">Change</button></>
          : displayMode === 'number'
            ? 'Number mode · 1 – 32'
            : 'Alpha mode · A–Z + a–f'
        }
      </p>
    </div>
  );
}
