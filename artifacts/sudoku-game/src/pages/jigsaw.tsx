import { useCallback, useEffect, useId, useMemo, useRef, useState, type DragEvent } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BarChart2, BookOpen, CalendarDays, Check, Eye, EyeOff, Flame, Gem, Grip, Hash, Image as ImageIcon, Keyboard, Lightbulb, Move, RotateCcw, Scroll, Share2, Sparkles, Timer, Trophy, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useImageTheme } from "@/hooks/use-image-theme";
import { useThemeImageSrc } from "@/components/theme-icons";
import { MobileContentDisclosure } from "@/components/mobile-content-disclosure";
import { Confetti } from "@/components/confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePageMeta } from "@/components/page-meta";
import { getTheme } from "@/lib/themes";
import { useGetProfile, customFetch } from "@workspace/api-client-react";
import { calculateJigsawPoints, getJigsawGemsEarned, getJigsawXpEarned } from "@workspace/api-zod/jigsaw-scoring";
import { appShareUrlForPath } from "@/lib/app-links";
import { shareOrDownloadShareCard } from "@/lib/share-card";
import { ACHIEVEMENT_COMPLETION_EVENT } from "@/lib/achievement-events";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  JIGSAW_MAX_PIECE_NUMBER_HINTS,
  JIGSAW_MAX_REFERENCE_PEEKS,
  JIGSAW_SESSION_STORAGE_KEY,
  parseSavedJigsawSession,
  type SavedJigsawSession,
} from "@/lib/jigsaw-session";
import { getJigsawPiecePath } from "@/lib/jigsaw-piece-shapes";
import { toast } from "sonner";

type GridSize = 2 | 3 | 4 | 5;
type Phase = "setup" | "playing" | "complete";
type InfoModal = "rules" | "controls" | "backstory" | null;
type Result = {
  id?: number;
  points: number;
  xpEarned: number;
  gemsEarned: number;
  isPersonalBest?: boolean;
  elapsedSeconds: number;
  moves: number;
  tipsUsed: number;
  gridSize: GridSize;
  level: 1 | 2 | 3;
  imageKey: number;
};
type JigsawChallengeResult = { id: number; status: string; challengerId: number; challengedId: number | null; winnerId: number | null; challengerUsername: string; challengedUsername: string | null; challengerPoints: number | null; challengedPoints: number | null };
type Config = { gridSize: GridSize; level: 1 | 2 | 3; imageKey: number; dailyDate?: string };

const SIZES: GridSize[] = [2, 3, 4, 5];
const REFERENCE_PEEK_DURATION_MS = 5000;
const LEVELS: { value: 1 | 2 | 3; title: string; copy: string }[] = [
  { value: 1, title: "Easy", copy: "Reference stays beside your puzzle" },
  { value: 2, title: "Medium", copy: "5-second preview, up to 3 times" },
  { value: 3, title: "Hard", copy: "No reference image during play" },
];

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function shuffledTiles(count: number) {
  const pieces = Array.from({ length: count }, (_, index) => index);
  for (let i = pieces.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  if (pieces.every((piece, index) => piece === index)) [pieces[0], pieces[1]] = [pieces[1], pieces[0]];
  return pieces;
}

function PuzzlePiece({ themeId, imageKey, piece, gridSize, className = "", isPlacedCorrectly = false }: {
  themeId: string; imageKey: number; piece: number; gridSize: GridSize; className?: string; isPlacedCorrectly?: boolean;
}) {
  const src = useThemeImageSrc(themeId, imageKey);
  const row = Math.floor(piece / gridSize);
  const col = piece % gridSize;
  const clipId = `jigsaw-piece-${useId().replaceAll(":", "")}`;
  if (gridSize >= 4) {
    const path = getJigsawPiecePath(gridSize, piece);
    return (
      <div aria-hidden="true" className={`relative h-full w-full overflow-visible ${className}`}>
        <svg className="absolute -inset-[12%] h-[124%] w-[124%] overflow-visible" viewBox="-12 -12 124 124" preserveAspectRatio="none">
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <path d={path} />
            </clipPath>
          </defs>
          <path d={path} fill="hsl(var(--card))" stroke={isPlacedCorrectly ? "hsl(var(--border) / 0.4)" : "hsl(var(--border))"} strokeWidth={isPlacedCorrectly ? "1" : "3"} strokeLinejoin="round" />
          {src && (
            <image
              href={src}
              x={-col * 100}
              y={-row * 100}
              width={gridSize * 100}
              height={gridSize * 100}
              preserveAspectRatio="none"
              clipPath={`url(#${clipId})`}
            />
          )}
          <path d={path} fill="none" stroke={isPlacedCorrectly ? "hsl(var(--border) / 0.4)" : "hsl(var(--border))"} strokeWidth={isPlacedCorrectly ? "1" : "3"} strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`h-full w-full ${className}`}
      style={{
        backgroundImage: src ? `url("${src}")` : undefined,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${(col / (gridSize - 1)) * 100}% ${(row / (gridSize - 1)) * 100}%`,
         backgroundColor: "hsl(var(--muted))",
      }}
    />
  );
}

function ReferenceImage({ themeId, imageKey, className = "" }: { themeId: string; imageKey: number; className?: string }) {
  const src = useThemeImageSrc(themeId, imageKey);
  return src
    ? <img src={src} alt="Puzzle reference" className={className} />
    : <div aria-label="Puzzle artwork loading" className={`${className} bg-muted`} />;
}

function Tile({ piece, index, gridSize, themeId, imageKey, selected, showNumber, onClick, onDragStart, onDragEnd, label }: {
  piece: number; index: number; gridSize: GridSize; themeId: string; imageKey: number; selected: boolean; showNumber: boolean;
  onClick: () => void; onDragStart: (event: DragEvent) => void; onDragEnd: () => void; label: string;
}) {
  const isInterlocking = gridSize >= 4;
  return (
    <button
      type="button"
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-label={label}
      aria-pressed={selected}
      data-testid={`tile-piece-${piece}`}
      className={`group relative aspect-square ${isInterlocking ? "overflow-visible rounded-lg border border-border bg-card shadow-sm" : "overflow-hidden rounded-lg border-2 bg-background shadow-sm"} transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring ${selected ? "border-primary ring-2 ring-primary/25" : isInterlocking ? "" : "border-border"}`}
    >
      <PuzzlePiece themeId={themeId} imageKey={imageKey} piece={piece} gridSize={gridSize} />
      {showNumber && <span className="absolute bottom-1 right-1 z-20 grid h-5 w-5 place-items-center rounded-full bg-foreground/85 text-[10px] font-semibold text-background">{index + 1}</span>}
    </button>
  );
}

export default function JigsawPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  usePageMeta({
    title: "Play Jigsaw Puzzle Online Free | Play Brain Games . Online",
    description: "Rebuild picture puzzles, choose your board size, and play daily or friend challenges.",
    path: "/jigsaw",
  });
  const { profileId } = useAuth();
  const { themeId } = useImageTheme();
  const { data: profile } = useGetProfile(profileId as number);
  const queryClient = useQueryClient();
  const gameMode = profile?.gameMode ?? "4all";
  const availableSizes = SIZES.filter((size) => gameMode === "children" ? size <= 3 : gameMode === "adult" ? size >= 4 : true);
  const themeLength = getTheme(themeId as never).symbols.length;
  const requestedSize = Number(params.get("gridSize") ?? params.get("size"));
  const requestedLevel = Number(params.get("level"));
  const requestedImage = Number(params.get("imageKey"));
  const requestedDailyDate = params.get("dailyDate");
  const shouldStartDailyChallenge = params.get("start") === "1" && Boolean(requestedDailyDate);
  const [config, setConfig] = useState<Config>({
    gridSize: SIZES.includes(requestedSize as GridSize) ? requestedSize as GridSize : availableSizes[0] ?? 2,
    level: LEVELS.some((level) => level.value === requestedLevel) ? requestedLevel as 1 | 2 | 3 : 1,
    imageKey: Number.isInteger(requestedImage) && requestedImage > 0 ? requestedImage : 1,
    dailyDate: requestedDailyDate ?? undefined,
  });
  const requestedGameId = Number(params.get("gameId"));
  const shouldAutoStartGame = params.get("play") === "1"
    && !requestedDailyDate
    && !(Number.isInteger(requestedGameId) && requestedGameId > 0);
  const [challengeId, setChallengeId] = useState<number | null>(
    Number.isInteger(Number(params.get("challengeId"))) && Number(params.get("challengeId")) > 0
      ? Number(params.get("challengeId"))
      : null,
  );
  const [shareToken, setShareToken] = useState<string | null>(params.get("shareToken"));
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const hasLinkedChallenge = challengeId !== null;
  const [phase, setPhase] = useState<Phase>("setup");
  const [infoModal, setInfoModal] = useState<InfoModal>(null);
  const [board, setBoard] = useState<(number | null)[]>([]);
  const [tray, setTray] = useState<number[]>([]);
  const [selected, setSelected] = useState<{ piece: number; from: "tray" | "board"; slot?: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showReference, setShowReference] = useState(false);
  const [referencePeeksUsed, setReferencePeeksUsed] = useState(0);
  const [revealedPieceNumbers, setRevealedPieceNumbers] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [challengeResult, setChallengeResult] = useState<JigsawChallengeResult | null>(null);
  const [dragged, setDragged] = useState<{ piece: number; from: "tray" | "board"; slot?: number } | null>(null);
  const [savedSession, setSavedSession] = useState<SavedJigsawSession | null>(null);
  const [sessionThemeId, setSessionThemeId] = useState<string | null>(null);
  const startedAt = useRef<number | null>(null);
  const completedRef = useRef(false);
  const restoreCheckedRef = useRef(false);
  const autoStartedGameIdRef = useRef<number | null>(null);
  const autoStartedDailyDateRef = useRef<string | null>(null);
  const autoStartedPlayRef = useRef(false);
  const gameIdRef = useRef<number | null>(null);
  const activeGameProgressRef = useRef({ elapsed: 0, moves: 0 });
  const lastProgressSyncRef = useRef({ gameId: null as number | null, elapsed: 0, moves: 0 });
  const referencePeeksUsedRef = useRef(0);
  const revealedPieceNumbersRef = useRef<number[]>([]);
  const referencePeekTimeoutRef = useRef<number | null>(null);
  const pendingCompletion = useRef<{ elapsedSeconds: number; moves: number; tipsUsed: number } | null>(null);
  const puzzleThemeId = sessionThemeId ?? themeId;
  const tileCount = config.gridSize * config.gridSize;
  const isSolved = board.length > 0 && board.every((piece, index) => piece === index);

  const clearReferencePeekTimer = useCallback(() => {
    if (referencePeekTimeoutRef.current !== null) {
      window.clearTimeout(referencePeekTimeoutRef.current);
      referencePeekTimeoutRef.current = null;
    }
  }, []);

  const startReferencePeek = () => {
    if (
      config.level !== 2 ||
      referencePeeksUsedRef.current >= JIGSAW_MAX_REFERENCE_PEEKS ||
      referencePeekTimeoutRef.current !== null
    ) return;
    clearReferencePeekTimer();
    const nextPeeksUsed = referencePeeksUsedRef.current + 1;
    referencePeeksUsedRef.current = nextPeeksUsed;
    setReferencePeeksUsed(nextPeeksUsed);
    setShowReference(true);
    referencePeekTimeoutRef.current = window.setTimeout(() => {
      referencePeekTimeoutRef.current = null;
      setShowReference(false);
    }, REFERENCE_PEEK_DURATION_MS);
  };

  useEffect(() => () => clearReferencePeekTimer(), [clearReferencePeekTimer]);

  useEffect(() => {
    if (config.dailyDate || (Number.isInteger(requestedGameId) && requestedGameId > 0)) return;
    if (!availableSizes.includes(config.gridSize)) setConfig((current) => ({ ...current, gridSize: availableSizes[0] ?? 2 }));
  }, [gameMode, config.dailyDate, config.gridSize, requestedGameId, availableSizes]);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => {
      if (startedAt.current !== null) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "complete" || !challengeId) { setChallengeResult(null); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const detail = await customFetch<JigsawChallengeResult>(`/api/jigsaw-challenges/${challengeId}`);
        if (cancelled) return;
        setChallengeResult(detail);
        if (detail.status !== "completed") timer = setTimeout(refresh, 5000);
      } catch { if (!cancelled) timer = setTimeout(refresh, 5000); }
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [challengeId, phase]);

  const pointsFor = useCallback((seconds: number, moveCount: number, tipsUsed: number) =>
    calculateJigsawPoints(config.gridSize, config.level, seconds, moveCount, tipsUsed),
  [config.gridSize, config.level]);

  const submitCompletion = useCallback((id: number, elapsedSeconds: number, moveCount: number, tipsUsed: number) => {
    void customFetch<{ id: number; points: number; xpEarned: number; gemsEarned: number; tipsUsed: number; isPersonalBest?: boolean; completedAt: string }>(
      `/api/jigsaw-games/${id}/complete`,
      { method: "POST", body: JSON.stringify({ elapsedSeconds, moves: moveCount, tipsUsed }) },
    ).then((server) => {
      setResult((current) => current ? { ...current, ...server } : current);
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/stats/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/achievements/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/jigsaw-daily-challenge/status/${profileId}`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jigsaw-games/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jigsaw-daily-challenge/leaderboard"] });
      pendingCompletion.current = null;
    }).catch(() => undefined);
  }, [profileId, queryClient]);

  const saveJigsawProgress = useCallback((gameId: number, elapsedSeconds: number, moveCount: number) => {
    if (elapsedSeconds <= 0 && moveCount <= 0) return;
    void customFetch<{ id: number; saved: boolean }>(`/api/jigsaw-games/${gameId}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ elapsedSeconds, moves: moveCount }),
    }).then(() => {
      if (profileId) queryClient.invalidateQueries({ queryKey: [`/api/stats/${profileId}`] });
    }).catch(() => undefined);
  }, [profileId, queryClient]);

  const syncJigsawProgress = useCallback((elapsedSeconds: number, moveCount: number) => {
    const gameId = gameIdRef.current;
    if (!gameId || (elapsedSeconds <= 0 && moveCount <= 0)) return;

    const lastSync = lastProgressSyncRef.current;
    if (
      lastSync.gameId === gameId &&
      moveCount <= lastSync.moves &&
      elapsedSeconds - lastSync.elapsed < 5
    ) return;

    lastProgressSyncRef.current = { gameId, elapsed: elapsedSeconds, moves: moveCount };
    saveJigsawProgress(gameId, elapsedSeconds, moveCount);
  }, [saveJigsawProgress]);

  useEffect(() => {
    activeGameProgressRef.current.elapsed = elapsed;
    activeGameProgressRef.current.moves = moves;
    if (phase === "playing") syncJigsawProgress(elapsed, moves);
  }, [elapsed, moves, phase, syncJigsawProgress]);

  const startGame = useCallback((
    linkedGameId?: number,
    linkedChallenge?: { challengeId: number; shareToken: string },
    resetReferencePeeks = true,
    gameConfig: Config = config,
    forceNewGame = false,
  ) => {
    clearReferencePeekTimer();
    const gameProgress = { elapsed: 0, moves: 0 };
    activeGameProgressRef.current = gameProgress;
    lastProgressSyncRef.current = { gameId: null, elapsed: 0, moves: 0 };
    const pieces = shuffledTiles(gameConfig.gridSize * gameConfig.gridSize);
    setConfig(gameConfig);
    setBoard(Array(gameConfig.gridSize * gameConfig.gridSize).fill(null));
    setTray(pieces);
    setSelected(null);
    setMoves(0);
    setElapsed(0);
    setResult(null);
    gameIdRef.current = linkedGameId ?? (!forceNewGame && Number.isInteger(requestedGameId) && requestedGameId > 0 ? requestedGameId : null);
    pendingCompletion.current = null;
    if (linkedChallenge) {
      setChallengeId(linkedChallenge.challengeId);
      setShareToken(linkedChallenge.shareToken);
    }
    if (resetReferencePeeks) {
      referencePeeksUsedRef.current = 0;
      setReferencePeeksUsed(0);
      revealedPieceNumbersRef.current = [];
      setRevealedPieceNumbers([]);
    }
    setShowReference(gameConfig.level === 1);
    if (forceNewGame) {
      setChallengeId(null);
      setShareToken(null);
    }
    completedRef.current = false;
    startedAt.current = Date.now();
    setSessionThemeId(themeId);
    setPhase("playing");

    const nextParams = new URLSearchParams({
      gridSize: String(gameConfig.gridSize),
      level: String(gameConfig.level),
      imageKey: String(gameConfig.imageKey),
      play: "1",
    });
    if (gameConfig.dailyDate) nextParams.set("dailyDate", gameConfig.dailyDate);
    if (gameIdRef.current) nextParams.set("gameId", String(gameIdRef.current));
    const nextChallengeId = linkedChallenge?.challengeId ?? (forceNewGame ? null : challengeId);
    const nextShareToken = linkedChallenge?.shareToken ?? (forceNewGame ? null : shareToken);
    if (nextChallengeId !== null) nextParams.set("challengeId", String(nextChallengeId));
    if (nextShareToken) nextParams.set("shareToken", nextShareToken);
    setLocation(`/jigsaw?${nextParams.toString()}`);

    if (gameIdRef.current) return;
    const body = {
      ...(profileId ? { profileId } : {}),
      gridSize: gameConfig.gridSize,
      level: gameConfig.level,
      imageKey: gameConfig.imageKey,
      ...(gameConfig.dailyDate ? { dailyDate: gameConfig.dailyDate } : {}),
    };
    void customFetch<{ id: number }>("/api/jigsaw-games", { method: "POST", body: JSON.stringify(body) })
      .then((session) => {
        if (activeGameProgressRef.current !== gameProgress) {
          saveJigsawProgress(session.id, gameProgress.elapsed, gameProgress.moves);
          return;
        }
        gameIdRef.current = session.id;
        syncJigsawProgress(gameProgress.elapsed, gameProgress.moves);
        if (pendingCompletion.current) submitCompletion(session.id, pendingCompletion.current.elapsedSeconds, pendingCompletion.current.moves, pendingCompletion.current.tipsUsed);
      })
      .catch(() => undefined);
  }, [challengeId, clearReferencePeekTimer, config, profileId, requestedGameId, saveJigsawProgress, setLocation, shareToken, submitCompletion, syncJigsawProgress, themeId]);

  const startNewGameWithOptions = (changes: Partial<Config>) => {
    const nextConfig = { ...config, ...changes, dailyDate: undefined };
    if (
      nextConfig.gridSize === config.gridSize &&
      nextConfig.level === config.level &&
      nextConfig.imageKey === config.imageKey
    ) {
      setIsOptionsOpen(false);
      return;
    }
    setIsOptionsOpen(false);
    syncJigsawProgress(elapsed, moves);
    startGame(undefined, undefined, true, nextConfig, true);
  };

  const restoreSession = useCallback((session: SavedJigsawSession) => {
    clearReferencePeekTimer();
    setConfig({
      gridSize: session.gridSize,
      level: session.level,
      imageKey: session.imageKey,
      dailyDate: session.dailyDate,
    });
    setBoard(session.board);
    setTray(session.tray);
    setSelected(null);
    setDragged(null);
    setMoves(session.moves);
    setElapsed(session.elapsed);
    activeGameProgressRef.current = { elapsed: session.elapsed, moves: session.moves };
    referencePeeksUsedRef.current = session.referencePeeksUsed;
    setReferencePeeksUsed(session.referencePeeksUsed);
    revealedPieceNumbersRef.current = session.revealedPieceNumbers;
    setRevealedPieceNumbers(session.revealedPieceNumbers);
    setShowReference(session.level === 1);
    setResult(null);
    setChallengeId(session.challengeId);
    setShareToken(session.shareToken);
    setSessionThemeId(session.themeId);
    setSavedSession(session);
    gameIdRef.current = session.gameId;
    pendingCompletion.current = null;
    completedRef.current = false;
    startedAt.current = Date.now() - session.elapsed * 1000;
    const resumeParams = new URLSearchParams({
      gridSize: String(session.gridSize),
      level: String(session.level),
      imageKey: String(session.imageKey),
      play: "1",
    });
    if (session.dailyDate) resumeParams.set("dailyDate", session.dailyDate);
    if (session.gameId) resumeParams.set("gameId", String(session.gameId));
    if (session.challengeId !== null) resumeParams.set("challengeId", String(session.challengeId));
    if (session.shareToken) resumeParams.set("shareToken", session.shareToken);
    setLocation(`/jigsaw?${resumeParams.toString()}`);
    setPhase("playing");
    toast.info("Resuming your Jigsaw puzzle…", { duration: 2500 });
  }, [clearReferencePeekTimer, setLocation]);

  useEffect(() => {
    if (restoreCheckedRef.current) return;
    restoreCheckedRef.current = true;

    let session: SavedJigsawSession | null = null;
    try {
      session = parseSavedJigsawSession(localStorage.getItem(JIGSAW_SESSION_STORAGE_KEY));
      if (!session) localStorage.removeItem(JIGSAW_SESSION_STORAGE_KEY);
    } catch {
      session = null;
    }
    setSavedSession(session);

    if (Number.isInteger(requestedGameId) && requestedGameId > 0) {
      if (session?.gameId === requestedGameId) {
        restoreSession(session);
      } else {
        autoStartedGameIdRef.current = requestedGameId;
        startGame(requestedGameId);
      }
      return;
    }

    if (params.get("dailyDate")) return;
    if (params.get("play") === "1") {
      setSavedSession(null);
      return;
    }

    const requestedSize = Number(params.get("gridSize") ?? params.get("size"));
    if (session && Number.isInteger(requestedSize) && requestedSize > 0 && requestedSize !== session.gridSize) {
      try {
        localStorage.removeItem(JIGSAW_SESSION_STORAGE_KEY);
      } catch {}
      setSavedSession(null);
      return;
    }

    if (session) restoreSession(session);
  }, [params, requestedGameId, restoreSession, startGame]);

  useEffect(() => {
    if (
      !Number.isInteger(requestedGameId) ||
      requestedGameId <= 0 ||
      phase !== "setup" ||
      autoStartedGameIdRef.current === requestedGameId
    ) return;
    autoStartedGameIdRef.current = requestedGameId;
    startGame(requestedGameId);
  }, [phase, requestedGameId, startGame]);

  useEffect(() => {
    if (
      !shouldStartDailyChallenge ||
      !requestedDailyDate ||
      (Number.isInteger(requestedGameId) && requestedGameId > 0) ||
      phase !== "setup" ||
      autoStartedDailyDateRef.current === requestedDailyDate
    ) return;
    autoStartedDailyDateRef.current = requestedDailyDate;
    startGame();
  }, [phase, requestedDailyDate, requestedGameId, shouldStartDailyChallenge, startGame]);

  useEffect(() => {
    if (!shouldAutoStartGame || phase !== "setup" || autoStartedPlayRef.current) return;
    autoStartedPlayRef.current = true;
    startGame();
  }, [phase, shouldAutoStartGame, startGame]);

  useEffect(() => {
    if (phase !== "playing" || board.length !== tileCount) return;
    const session: SavedJigsawSession = {
      gridSize: config.gridSize,
      level: config.level,
      imageKey: config.imageKey,
      themeId: puzzleThemeId,
      board,
      tray,
      moves,
      elapsed,
      showReference,
      referencePeeksUsed,
      revealedPieceNumbers,
      gameId: gameIdRef.current,
      challengeId,
      shareToken,
      dailyDate: config.dailyDate,
      savedAt: Date.now(),
    };
    setSavedSession(session);
    try {
      localStorage.setItem(JIGSAW_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {}
  }, [board, challengeId, config, elapsed, moves, phase, puzzleThemeId, referencePeeksUsed, revealedPieceNumbers, shareToken, showReference, tileCount, tray]);

  const createChallengeAndPlay = async () => {
    if (!profileId) {
      toast.error("A player profile is needed to create a friend challenge.");
      return;
    }
    setIsCreatingChallenge(true);
    try {
      const created = await customFetch<{ challengeId: number; gameId: number; shareToken: string }>(
        "/api/jigsaw-challenges",
        {
          method: "POST",
          body: JSON.stringify({
            challengerId: profileId,
            gridSize: config.gridSize,
            level: config.level,
            imageKey: config.imageKey,
          }),
        },
      );
      setChallengeId(created.challengeId);
      setShareToken(created.shareToken);
      const inviteUrl = appShareUrlForPath(`/jigsaw-invite/${created.shareToken}`);
      try {
        if (navigator.share) {
          await navigator.share({
            title: "Jigsaw friend challenge",
            text: `I challenge you to a ${config.gridSize}×${config.gridSize} Jigsaw puzzle.`,
            url: inviteUrl,
          });
        } else {
          await navigator.clipboard.writeText(inviteUrl);
          toast.success("Challenge link copied.");
        }
      } catch {
        try {
          await navigator.clipboard.writeText(inviteUrl);
          toast.success("Challenge link copied.");
        } catch {
          toast.error("The challenge was created, but its link could not be shared.");
        }
      }
      startGame(created.gameId, { challengeId: created.challengeId, shareToken: created.shareToken });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create a Jigsaw challenge.");
    } finally {
      setIsCreatingChallenge(false);
    }
  };

  const finishGame = useCallback((finalElapsed: number, finalMoves: number) => {
    if (completedRef.current) return;
    clearReferencePeekTimer();
    completedRef.current = true;
    const tipsUsed = revealedPieceNumbersRef.current.length + referencePeeksUsedRef.current;
    const offline: Result = {
      points: pointsFor(finalElapsed, finalMoves, tipsUsed),
      xpEarned: getJigsawXpEarned(config.level),
      gemsEarned: getJigsawGemsEarned(config.gridSize),
      elapsedSeconds: finalElapsed, moves: finalMoves, tipsUsed, gridSize: config.gridSize, level: config.level, imageKey: config.imageKey,
    };
    setResult(offline);
    setPhase("complete");
    setSavedSession(null);
    try {
      localStorage.removeItem(JIGSAW_SESSION_STORAGE_KEY);
    } catch {}
    if (profileId) {
      window.dispatchEvent(new CustomEvent(ACHIEVEMENT_COMPLETION_EVENT, { detail: { profileId } }));
    }
    pendingCompletion.current = { elapsedSeconds: finalElapsed, moves: finalMoves, tipsUsed };
    if (gameIdRef.current) submitCompletion(gameIdRef.current, finalElapsed, finalMoves, tipsUsed);
  }, [clearReferencePeekTimer, config, pointsFor, profileId, submitCompletion]);

  const placePiece = useCallback((source: { piece: number; from: "tray" | "board"; slot?: number }, targetSlot: number) => {
    setBoard((current) => {
      const next = [...current];
      const displaced = next[targetSlot];
      if (source.from === "board" && source.slot !== undefined) {
        const sourceSlot = source.slot;
        const targetPiece = next[targetSlot];
        next[targetSlot] = source.piece;
        next[sourceSlot] = targetPiece;
        if (targetSlot !== sourceSlot) setMoves((value) => value + 1);
        return next;
      }
      next[targetSlot] = source.piece;
      setTray((currentTray) => {
        const remaining = currentTray.filter((piece) => piece !== source.piece);
        if (displaced !== null && displaced !== undefined) remaining.push(displaced);
        return remaining;
      });
      setMoves((value) => value + 1);
      return next;
    });
    setSelected(null);
  }, []);

  useEffect(() => {
    if (phase === "playing" && isSolved) finishGame(elapsed, moves);
  }, [phase, isSolved, elapsed, moves, finishGame]);

  const chooseSlot = (slot: number) => {
    const existingPiece = board[slot];
    if (!selected) {
      if (existingPiece !== null && existingPiece !== undefined) setSelected({ piece: existingPiece, from: "board", slot });
      return;
    }
    if (selected.from === "board" && selected.slot === slot) {
      setSelected(null);
      return;
    }
    placePiece(selected, slot);
  };

  const handleShare = async () => {
    if (!result) return;
    const inviteToken = shareToken;
    const url = appShareUrlForPath(inviteToken ? `/jigsaw-invite/${inviteToken}` : "/jigsaw");
    const lines = [
      `Finished a ${result.gridSize} × ${result.gridSize} picture puzzle on level ${result.level}.`,
      `${result.moves} moves · ${result.tipsUsed} assists · ${formatTime(result.elapsedSeconds)}`,
      `+${result.points.toLocaleString()} points · +${result.xpEarned} XP · +${result.gemsEarned} gems`,
      "Play Brain Games . Online",
      url,
    ];
    try {
      const shareResult = await shareOrDownloadShareCard({
        title: "Jigsaw puzzle complete",
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: "#d7804d",
        filename: "jigsaw-result.png",
      });
      if (shareResult === "downloaded") toast.success("Result card downloaded.");
    } catch {
      try {
        await navigator.clipboard.writeText(lines.join("\n"));
        toast.success("Puzzle result copied.");
      } catch {
        toast.error("Sharing is not available right now.");
      }
    }
  };

  const exitToSetup = () => {
    clearReferencePeekTimer();
    setPhase("setup");
    setSelected(null);
    setDragged(null);
    setConfig((current) => ({ ...current, dailyDate: undefined }));
    setLocation("/jigsaw");
  };

  if (phase === "setup") {
    return (
      <main className="mx-auto min-h-0 w-full min-w-0 max-w-lg px-3 pb-6 pt-3 text-foreground sm:px-5 sm:pt-5">
        {/* Top bar */}
        <div className="relative isolate overflow-hidden flex items-center justify-between gap-3 rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-3 shadow-lg shadow-amber-500/10 dark:border-amber-800/60 dark:from-amber-950/60 dark:via-card dark:to-yellow-950/60">
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-amber-300/25 blur-2xl dark:bg-amber-400/15" />
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="text-right">
            <h1 className="text-xl sm:text-3xl font-serif font-bold tracking-tight leading-tight">Jigsaw Puzzle</h1>
            {profile && (
              <p className="text-xs text-muted-foreground hidden sm:block">Welcome back, {profile.username}</p>
            )}
          </div>
        </div>

        {/* Resume session */}
        {savedSession && !config.dailyDate && (
          <button
            type="button"
            onClick={() => restoreSession(savedSession)}
            data-testid="button-resume-jigsaw"
            className="w-full flex items-center gap-3 rounded-xl border-2 border-amber-300/60 bg-card px-4 py-2.5 text-left hover:bg-muted transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Resume Jigsaw
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {savedSession.gridSize}×{savedSession.gridSize} · {savedSession.moves} moves · {formatTime(savedSession.elapsed)}
              </span>
            </div>
            <span className="text-amber-500 text-sm shrink-0">→</span>
          </button>
        )}

        {/* Mobile quick launch */}
        <div className="relative isolate overflow-hidden sm:hidden rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 space-y-3 shadow-xl shadow-amber-500/10 dark:border-amber-800/50 dark:from-amber-950/70 dark:via-orange-950/65 dark:to-yellow-950/70">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl dark:bg-amber-400/15" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Board Size</p>
            <div className={`grid gap-1.5 ${availableSizes.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => startGame(undefined, undefined, true, { ...config, gridSize: size, dailyDate: undefined }, true)}
                  data-testid={`select-grid-${size}`}
                  className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-amber-400/35 bg-white/75 px-2 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"
                >
                  <span className="font-bold text-base leading-none text-amber-700">{size}×{size}</span>
                  <span className="mt-1 text-xs leading-none text-muted-foreground">{size * size} pieces</span>
                </button>
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Level</p>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setConfig((old) => ({ ...old, level: level.value }))}
                  data-testid={`select-level-${level.value}`}
                  className={[
                    'flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all',
                    config.level === level.value ? 'border-amber-600 bg-amber-600 text-white' : 'border-amber-200/80 bg-white/50 hover:border-amber-400 dark:border-amber-800/60 dark:bg-slate-950/20',
                  ].join(' ')}
                >
                  <span className="grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold">{level.value}</span>
                  {level.title}
                </button>
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Picture</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: themeLength }, (_, index) => index + 1).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setConfig((old) => ({ ...old, imageKey: key }))}
                  aria-label={`Choose picture ${key}`}
                  aria-pressed={config.imageKey === key}
                  data-testid={`select-image-${key}`}
                  className={[
                    'h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 transition',
                    config.imageKey === key ? 'border-amber-600 bg-amber-600 text-white' : 'border-border bg-background hover:border-amber-400 text-muted-foreground',
                  ].join(' ')}
                >
                  <ReferenceImage themeId={themeId} imageKey={key} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:block rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-xl shadow-amber-500/10 dark:border-amber-800/50 dark:from-amber-950/70 dark:via-orange-950/65 dark:to-yellow-950/70 p-6">
          <h2 className="text-2xl font-serif font-bold mb-2">Choose your puzzle</h2>
          <p className="text-sm text-muted-foreground mb-6">Select a board size to start playing</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Board Size</label>
              <div className={`grid gap-2 ${availableSizes.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => startGame(undefined, undefined, true, { ...config, gridSize: size, dailyDate: undefined }, true)}
                    data-testid={`select-grid-${size}`}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-amber-400/35 bg-white/75 px-2 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"
                  >
                    <span className="font-bold text-lg leading-none text-amber-700">{size}×{size}</span>
                    <span className="mt-1 text-xs leading-none text-muted-foreground">{size * size} pieces</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Level</label>
              <div className="space-y-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setConfig((old) => ({ ...old, level: level.value }))}
                    data-testid={`select-level-${level.value}`}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${config.level === level.value ? "border-amber-600 bg-amber-50 dark:bg-amber-950/30" : "border-border bg-background hover:border-amber-400"}`}
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${config.level === level.value ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"}`}>{level.value}</span>
                    <span className="flex-1"><span className="block text-sm font-semibold">{level.title}</span><span className="block text-xs text-muted-foreground">{level.copy}</span></span>
                    {config.level === level.value && <Check size={17} className="text-amber-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Picture</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: themeLength }, (_, index) => index + 1).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setConfig((old) => ({ ...old, imageKey: key }))}
                    aria-label={`Choose picture ${key}`}
                    aria-pressed={config.imageKey === key}
                    data-testid={`select-image-${key}`}
                    className={[
                      'h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition',
                      config.imageKey === key ? 'border-amber-600 bg-amber-600 text-white' : 'border-border bg-background hover:border-amber-400 text-muted-foreground',
                    ].join(' ')}
                  >
                    <ReferenceImage themeId={themeId} imageKey={key} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional options */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => void createChallengeAndPlay()}
            disabled={isCreatingChallenge}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-amber-600 hover:text-amber-600 disabled:opacity-60"
          >
            <Share2 size={16} /> {isCreatingChallenge ? "Preparing challenge…" : "Challenge a friend"}
          </button>
          <Link
            href="/jigsaw-challenge"
            data-testid="link-daily-jigsaw"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-orange-300/50 bg-white/75 px-5 py-3 text-sm font-semibold text-orange-600 transition hover:border-orange-400/70 hover:bg-white dark:bg-slate-950/35 dark:hover:bg-slate-950/55"
          >
            <Flame size={16} /> Daily Challenge
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/profile?tab=jigsaw"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition hover:border-amber-600 hover:text-amber-600"
            >
              <BarChart2 size={14} /> My Stats
            </Link>
            <Link
              href="/leaderboard/jigsaw"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition hover:border-amber-600 hover:text-amber-600"
            >
              <Trophy size={14} /> Leaderboard
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setInfoModal("rules")}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-amber-600 hover:text-amber-600"
            >
              <Scroll size={14} /> Rules
            </button>
            <button
              type="button"
              onClick={() => setInfoModal("backstory")}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-amber-600 hover:text-amber-600"
            >
              <BookOpen size={14} /> Backstory
            </button>
            <button
              type="button"
              onClick={() => setInfoModal("controls")}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-amber-600 hover:text-amber-600"
            >
              <Keyboard size={14} /> Controls
            </button>
          </div>

          <Link href="/jigsaw-challenges" className="block text-center text-xs font-semibold text-muted-foreground hover:text-foreground">View your Jigsaw challenges</Link>
          <p className="text-center text-[11px] text-muted-foreground">Plays offline. Your score syncs when available.</p>
        </div>

        <MobileContentDisclosure
          id="jigsaw-guidance"
          title="More about Jigsaw puzzles"
          className="rounded-2xl border border-amber-400/25 bg-card p-5 sm:p-6"
        >
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground">How to solve picture puzzles</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Each tile is a square crop from the finished picture. Rebuild the image by placing every tile in its original board position. Look for distinctive colors, shapes, and neighboring details, then use the reference image when your selected level allows it.
              </p>
            </div>
            <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
              <article>
                <h3 className="font-semibold text-foreground">Choose a comfortable board</h3>
                <p className="mt-1">
                  A 2×2 board has 4 pieces, 3×3 has 9, 4×4 has 16, and 5×5 has 25. Kids mode offers 2×2 and 3×3, Adult mode offers 4×4 and 5×5, and default 4 All mode offers every size. Smaller boards are a quick way to learn the placement flow; larger boards ask you to compare more details at once.
                </p>
              </article>
              <article>
                <h3 className="font-semibold text-foreground">Set your reference level</h3>
                <p className="mt-1">
                  Easy keeps the full picture visible. Medium offers three five-second previews per game. Hard removes the reference, so solve from the tile details and your memory of the image.
                </p>
              </article>
              <article>
                <h3 className="font-semibold text-foreground">Place and rearrange</h3>
                <p className="mt-1">
                  Select a loose piece and its board position, or drag the piece into place. If a board tile is already there, placing another tile sends the displaced piece back to the tray; board tiles can also be swapped.
                </p>
              </article>
              <article>
                <h3 className="font-semibold text-foreground">Build a personal best</h3>
                <p className="mt-1">
                  Board size and level set the base score. Faster times add a bonus, while extra moves and used tips reduce it. Finishing earns XP based on level and gems based on board size.
                </p>
              </article>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                <Hash size={10} /> Spatial reasoning
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                <Timer size={10} /> Time-based scoring
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                <Trophy size={10} /> Daily challenges
              </span>
            </div>
            <Link
              href="/guides/#jigsaw-guide-title"
              className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Read the full Jigsaw guide
            </Link>
          </section>
        </MobileContentDisclosure>

        <Dialog open={infoModal === "rules"} onOpenChange={(open) => !open && setInfoModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scroll className="h-5 w-5 text-amber-600" /> Rules
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>Rebuild the complete picture by placing each shuffled tile in its original board position.</p>
              <ul className="list-none space-y-2">
                {[
                  "Choose a board from 2×2 to 5×5; each square is one picture tile.",
                  "Move tiles from the loose-piece tray onto the matching board positions.",
                  "A tile placed on an occupied position sends the displaced tile back to the tray; board tiles can be swapped.",
                  "Finish when every tile is in its correct position and the full image is restored.",
                  "Easy keeps the reference visible, Medium allows three five-second previews, and Hard hides the reference.",
                ].map((rule, index) => (
                  <li key={rule} className="flex gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-700 dark:text-amber-300">{index + 1}</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <p className="pt-1">Board size and level set the base points. Finish under par for a time bonus; extra moves and used tips reduce the score. Wins award 1–3 XP by level and 1–3 gems by board size.</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={infoModal === "controls"} onOpenChange={(open) => !open && setInfoModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-amber-600" /> Controls
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-2 font-semibold text-foreground">Mouse / Touch</p>
                <div className="space-y-1.5 text-muted-foreground">
                  {[
                    ["Tap or click a loose piece", "Select it"],
                    ["Tap or click a board position", "Place the selected piece"],
                    ["Drag a tile", "Move it to a board position"],
                    ["Preview button (Medium)", "Show the picture for 5 seconds (3 uses)"],
                    ["Restart", "Shuffle and restart this puzzle"],
                  ].map(([action, result]) => (
                    <div key={action} className="flex justify-between gap-4">
                      <span>{action}</span>
                      <span className="text-right font-medium text-foreground">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="border-t pt-3 text-muted-foreground">You can also select a tile already on the board, then select another position to swap them.</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={infoModal === "backstory"} onOpenChange={(open) => !open && setInfoModal(null)}>
          <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto overscroll-contain">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" /> Backstory
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Picture puzzles are often traced to 18th-century “dissected maps.” English mapmaker John Spilsbury is commonly credited with making early examples around the 1760s by mounting maps on wood and cutting them into pieces for geography lessons.
              </p>
              <p>
                Those teaching tools inspired a pastime: assemble the pieces to recover the map or picture. As printing and manufacturing changed, puzzles became available in many subjects and difficulty levels, from familiar scenes to intricate designs.
              </p>
              <p>
                This digital Jigsaw keeps the same picture-reconstruction idea in a square-tile format. The pieces begin shuffled in a tray; your task is to place each image fragment back where it belongs.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    );
  }

  if (phase === "complete" && result) {
    const startWithResultOptions = (changes: Partial<Config> = {}) => {
      const nextConfig: Config = {
        ...config,
        gridSize: result.gridSize,
        level: result.level,
        imageKey: result.imageKey,
        dailyDate: undefined,
        ...changes,
      };
      startGame(undefined, undefined, true, nextConfig, true);
    };

    return (
      <main className="mx-auto min-h-0 w-full max-w-lg px-3 pb-6 pt-3 text-foreground animate-in fade-in duration-500 sm:px-5 sm:pt-5">
        <Confetti />
        <section className="relative overflow-hidden rounded-2xl bg-primary p-4 text-center text-primary-foreground shadow-lg sm:p-5">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border border-white/15" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/10" />
          <div className="relative z-10 space-y-2">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/15"><Sparkles size={25} /></div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary-foreground/75">{config.dailyDate ? "Daily Jigsaw challenge complete" : "Picture complete"}</p>
            <h1 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">Every piece, in place!</h1>
            <div className="mx-auto aspect-square w-full max-w-[160px] overflow-hidden rounded-xl border-4 border-white/70 shadow-md">
              <ReferenceImage themeId={puzzleThemeId} imageKey={result.imageKey} className="h-full w-full object-cover" />
            </div>
            <p className="text-xs text-primary-foreground/80">{result.gridSize}×{result.gridSize} · {LEVELS[result.level - 1]?.title} · {formatTime(result.elapsedSeconds)} · {result.moves} moves · {result.tipsUsed} assists</p>
            {config.dailyDate && <p className="text-xs font-semibold text-primary-foreground/90">📅 Today&apos;s shared daily puzzle</p>}
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1 text-sm font-black sm:text-base" data-testid="result-rewards">
              <span data-testid="result-points">+{result.points.toLocaleString()} pts</span>
              <span>+{result.xpEarned} XP</span>
              <span>+{result.gemsEarned} 💎</span>
            </p>
            <button type="button" onClick={() => void handleShare()} data-testid="button-share-result" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/30">
              <Share2 size={16} /> Share your result
            </button>
          </div>
        </section>

        {hasLinkedChallenge && <section className="mt-3 rounded-xl border border-primary/25 bg-card p-4 text-center" aria-live="polite">
          <h2 className="font-bold">Challenge result</h2>
          {!challengeResult || challengeResult.status !== "completed" ? <p className="mt-1 text-sm text-muted-foreground">You completed the puzzle in {formatTime(result.elapsedSeconds)} and earned {result.points.toLocaleString()} points. Waiting for your opponent to finish…</p> : (() => {
            const mine = challengeResult.challengerId === profileId ? challengeResult.challengerPoints : challengeResult.challengedPoints;
            const theirs = challengeResult.challengerId === profileId ? challengeResult.challengedPoints : challengeResult.challengerPoints;
            const opponent = challengeResult.challengerId === profileId ? challengeResult.challengedUsername : challengeResult.challengerUsername;
            const outcome = challengeResult.winnerId === null ? "It’s a tie!" : challengeResult.winnerId === profileId ? "You won the challenge!" : "You lost the challenge.";
            return <><p className="mt-1 text-lg font-black">{outcome}</p><p className="mt-1 text-sm text-muted-foreground">You: {mine ?? 0} points · {opponent ?? "Opponent"}: {theirs ?? 0} points</p><p className="mt-1 text-xs text-muted-foreground">Completed in {formatTime(result.elapsedSeconds)} · {challengeResult.winnerId === null ? "Both players earned 2 bonus gems." : challengeResult.winnerId === profileId ? "You earned 10 bonus gems." : `${opponent ?? "Your opponent"} earned 10 bonus gems.`}</p></>;
          })()}
        </section>}

        {result.isPersonalBest && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-yellow-300/60 bg-card px-4 py-2.5">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">New Personal Best!</span>
          </div>
        )}

        <section className="mt-4 min-w-0 space-y-2 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
          {!hasLinkedChallenge && (
            <button type="button" onClick={() => startWithResultOptions()} data-testid="button-play-again" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90">
              <RotateCcw size={16} /> Play again ({result.gridSize}×{result.gridSize})
            </button>
          )}
          <div className="min-w-0 space-y-4 rounded-xl border border-border bg-background p-3 sm:p-4">
            <div>
              <h2 className="text-center text-sm font-bold">Choose your next Jigsaw</h2>
              <p className="mt-1 text-center text-xs text-muted-foreground">Tap any option to start. Your other selections stay the same.</p>
            </div>
            <fieldset className="min-w-0">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Board size</legend>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => startWithResultOptions({ gridSize: size })}
                    aria-label={`Start a ${size} by ${size} Jigsaw`}
                    aria-pressed={result.gridSize === size}
                    data-testid={`result-select-grid-${size}`}
                    className={`min-h-11 rounded-lg border-2 px-2 py-2 text-sm font-bold transition ${result.gridSize === size ? "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200" : "border-border hover:border-amber-400"}`}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Level</legend>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => startWithResultOptions({ level: level.value })}
                    aria-label={`Start a ${level.title} Jigsaw`}
                    aria-pressed={result.level === level.value}
                    data-testid={`result-select-level-${level.value}`}
                    className={`min-h-11 rounded-lg border-2 px-2 py-2 text-sm font-semibold transition ${result.level === level.value ? "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200" : "border-border hover:border-amber-400"}`}
                  >
                    {level.title}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="min-w-0">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Picture</legend>
              <div className="flex w-full min-w-0 max-w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-2">
                {Array.from({ length: themeLength }, (_, index) => index + 1).map((imageKey) => (
                  <button
                    key={imageKey}
                    type="button"
                    onClick={() => startWithResultOptions({ imageKey })}
                    aria-label={`Start with picture ${imageKey}`}
                    aria-pressed={result.imageKey === imageKey}
                    data-testid={`result-select-image-${imageKey}`}
                    className={`relative h-12 w-12 shrink-0 snap-start overflow-hidden rounded-lg border-2 transition ${result.imageKey === imageKey ? "border-amber-600 ring-2 ring-amber-500/30" : "border-border hover:border-amber-400"}`}
                  >
                    <ReferenceImage themeId={themeId} imageKey={imageKey} className="h-full w-full object-cover" />
                    {result.imageKey === imageKey && <span className="absolute inset-0 grid place-items-center bg-black/25 text-white"><Check size={18} /></span>}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          {!config.dailyDate && <Link href="/jigsaw-challenge" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:border-primary"><CalendarDays size={16} /> Try today&apos;s daily challenge</Link>}
        </section>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: Timer, label: "Time", value: formatTime(result.elapsedSeconds) },
            { icon: Move, label: "Moves", value: result.moves.toString() },
            { icon: Trophy, label: "Points", value: result.points.toLocaleString() },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="space-y-1 rounded-xl border bg-card p-3 text-center">
              <Icon className="mx-auto h-4 w-4 text-primary" />
              <p className="text-lg font-black tabular-nums sm:text-xl">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <section className="mt-3 flex items-center justify-center gap-6 rounded-xl border-2 border-primary/20 bg-card p-4">
          <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /><span className="font-black text-lg">+{result.xpEarned} XP</span></div>
          <div className="flex items-center gap-2"><Gem className="h-5 w-5 text-cyan-500" /><span className="font-black text-lg">+{result.gemsEarned} 💎</span></div>
        </section>

        <button
          type="button"
          onClick={() => setLocation("/")}
          className="mt-4 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-muted"
        >
          ← Back to Play Brain Games . Online
        </button>
      </main>
    );
  }

  const canSeeReference = config.level === 1 || (config.level === 2 && showReference);
  const interlockingPieces = config.gridSize >= 4;
  const hintablePieces = [
    ...tray,
    ...board.flatMap((piece, slot) => piece !== null && piece !== slot ? [piece] : []),
  ].filter((piece) => !revealedPieceNumbers.includes(piece));
  const revealPieceNumber = () => {
    if (revealedPieceNumbersRef.current.length >= JIGSAW_MAX_PIECE_NUMBER_HINTS) return;
    const availablePieces = [
      ...tray,
      ...board.flatMap((piece, slot) => piece !== null && piece !== slot ? [piece] : []),
    ].filter((piece) => !revealedPieceNumbersRef.current.includes(piece));
    if (availablePieces.length === 0) return;
    const piece = selected && availablePieces.includes(selected.piece) ? selected.piece : availablePieces[0];
    const nextRevealed = [...revealedPieceNumbersRef.current, piece];
    revealedPieceNumbersRef.current = nextRevealed;
    setRevealedPieceNumbers(nextRevealed);
  };
  const dragStart = (source: { piece: number; from: "tray" | "board"; slot?: number }) => (event: DragEvent) => {
    setDragged(source);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(source.piece));
  };
  const dropOnSlot = (slot: number) => (event: DragEvent) => {
    event.preventDefault();
    const source = dragged;
    if (source) placePiece(source, slot);
    setDragged(null);
  };

  return (
    <main className="mx-auto min-h-0 w-full max-w-7xl px-2 pb-4 pt-2 text-foreground sm:px-4 sm:pt-3">
      {/* Top options bar */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm sm:px-4 sm:py-2.5">
        <button type="button" onClick={exitToSetup} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary sm:px-4 sm:py-2 sm:text-sm" data-testid="link-exit-jigsaw"><ArrowLeft size={14} /> Setup</button>
        <div className="flex items-center gap-2">
          {!hasLinkedChallenge && (
            <Popover open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Change puzzle picture, level, or size"
                  title="Change puzzle options"
                  data-testid="button-jigsaw-options"
                  className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-border bg-background transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ReferenceImage themeId={themeId} imageKey={config.imageKey} className="h-full w-full object-cover" />
                  <ImageIcon size={12} className="absolute bottom-0 right-0 rounded-tl bg-background/90 p-0.5 text-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[min(22rem,calc(100vw-1rem))] space-y-4 p-3">
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Picture</p>
                  <div className="grid max-h-36 grid-cols-6 gap-1.5 overflow-y-auto">
                    {Array.from({ length: themeLength }, (_, index) => index + 1).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => startNewGameWithOptions({ imageKey: key })}
                        aria-label={`Start a new game with picture ${key}`}
                        aria-pressed={config.imageKey === key}
                        title={`Picture ${key}`}
                        className={`aspect-square overflow-hidden rounded-md border-2 transition ${config.imageKey === key ? "border-amber-600 ring-2 ring-amber-500/30" : "border-border hover:border-amber-400"}`}
                      >
                        <ReferenceImage themeId={themeId} imageKey={key} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Board size</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => startNewGameWithOptions({ gridSize: size })}
                        aria-pressed={config.gridSize === size}
                        className={`rounded-md border px-2 py-2 text-xs font-semibold transition ${config.gridSize === size ? "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200" : "border-border hover:border-amber-400"}`}
                      >
                        {size}×{size}
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Level</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => startNewGameWithOptions({ level: level.value })}
                        aria-pressed={config.level === level.value}
                        title={level.copy}
                        className={`rounded-md border px-2 py-2 text-xs font-semibold transition ${config.level === level.value ? "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200" : "border-border hover:border-amber-400"}`}
                      >
                        {level.title}
                      </button>
                    ))}
                  </div>
                </section>
              </PopoverContent>
            </Popover>
          )}
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground sm:px-4 sm:py-2">
            <span>Level {config.level}</span>
            <span className="text-border">/</span>
            <span>{tileCount} pieces</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-mono text-xs sm:px-4 sm:py-2 sm:text-sm" data-testid="status-timer">
            <Timer size={13} className="text-primary" />{formatTime(elapsed)}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-mono text-xs sm:px-4 sm:py-2 sm:text-sm" data-testid="status-moves">
            <span className="text-primary">{moves}</span> moves
          </div>
          <button
            type="button"
            onClick={revealPieceNumber}
            disabled={revealedPieceNumbers.length >= JIGSAW_MAX_PIECE_NUMBER_HINTS || hintablePieces.length === 0}
            aria-label={`Reveal a piece number, ${JIGSAW_MAX_PIECE_NUMBER_HINTS - revealedPieceNumbers.length} tips remaining`}
            title="Reveal the number of one unmatched piece"
            data-testid="button-jigsaw-tip"
            className="inline-flex h-8 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 text-xs font-semibold text-amber-800 transition hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-950/30 dark:text-amber-200 sm:h-9"
          >
            <Lightbulb size={14} />
            <span>Tip</span>
            <span className="tabular-nums">{JIGSAW_MAX_PIECE_NUMBER_HINTS - revealedPieceNumbers.length}</span>
          </button>
          {config.level === 2 && (
            <button
              type="button"
              onClick={startReferencePeek}
              disabled={showReference || referencePeeksUsed >= JIGSAW_MAX_REFERENCE_PEEKS}
              aria-label={`Preview reference picture, ${JIGSAW_MAX_REFERENCE_PEEKS - referencePeeksUsed} previews remaining`}
              title={`${JIGSAW_MAX_REFERENCE_PEEKS - referencePeeksUsed} previews remaining`}
              data-testid="button-toggle-reference"
              className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-background px-2 text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 sm:h-9"
            >
              <Eye size={15} />
              <span className="text-[10px] font-semibold tabular-nums">{JIGSAW_MAX_REFERENCE_PEEKS - referencePeeksUsed}</span>
            </button>
          )}
          {!hasLinkedChallenge && <button type="button" onClick={() => startGame(undefined, undefined, false)} data-testid="button-restart-jigsaw" className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary sm:px-4 sm:py-2 sm:text-sm"><RotateCcw size={13} /> Restart</button>}
        </div>
      </header>

      {/* Game board and pieces */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <section className="rounded-2xl border border-border bg-card p-2 shadow-sm sm:p-4">
          <div className="mb-3 px-1">
            <h1 className="font-serif text-xl font-bold sm:text-2xl">Find the picture.</h1>
          </div>
          <div className={`mx-auto grid aspect-square w-full max-w-[min(90vw,660px)] ${interlockingPieces ? "gap-0" : "gap-1 sm:gap-2"} rounded-xl bg-muted p-1 sm:rounded-2xl sm:p-2`} style={{ gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))` }} role="grid" aria-label={`${config.gridSize} by ${config.gridSize} puzzle board`}>
            {board.map((piece, slot) => (
              <button key={slot} type="button" role="gridcell" onClick={() => chooseSlot(slot)} onDragOver={(event) => event.preventDefault()} onDrop={dropOnSlot(slot)}
                draggable={piece !== null} onDragStart={piece === null ? undefined : dragStart({ piece, from: "board", slot })} onDragEnd={() => setDragged(null)}
                aria-label={`Puzzle position ${slot + 1}${piece !== null ? `, piece ${piece + 1}` : ", empty"}`} aria-pressed={selected?.from === "board" && selected.slot === slot}
                data-testid={`board-slot-${slot}`}
                className={`relative min-h-0 transition ${piece === null ? "z-20 overflow-hidden rounded-md border-2 border-dashed border-amber-500/70 bg-amber-100/70 shadow-inner dark:border-amber-600/70 dark:bg-amber-950/40" : interlockingPieces ? (piece === slot ? "z-10 overflow-visible rounded-md border-border/30 bg-transparent shadow-none" : "z-10 overflow-visible rounded-md border border-border bg-card shadow-sm") : piece === slot ? "overflow-hidden rounded-md border border-transparent bg-transparent shadow-none" : "overflow-hidden rounded-md border-2 border-background shadow-sm"} ${selected?.from === "board" && selected.slot === slot ? "ring-4 ring-primary/40" : ""} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring`}>
                {piece !== null && <PuzzlePiece themeId={puzzleThemeId} imageKey={config.imageKey} piece={piece} gridSize={config.gridSize} isPlacedCorrectly={piece === slot} />}
                {piece !== null && piece !== slot && revealedPieceNumbers.includes(piece) && <span className="absolute bottom-1 right-1 z-20 grid h-5 w-5 place-items-center rounded-full bg-foreground/85 text-[10px] font-semibold text-background">{piece + 1}</span>}
                {piece === null && <span className="absolute inset-0 grid place-items-center"><span className="grid h-7 w-7 place-items-center rounded-full border border-dashed border-amber-500/70 bg-background/90 text-xs font-bold tabular-nums text-amber-800 shadow-sm dark:border-amber-500/60 dark:bg-background/90 dark:text-amber-300">{String(slot + 1).padStart(2, "0")}</span></span>}
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><Move size={14} /> Select a piece, then its home. You can also drag it into place.</p>
        </section>

        {/* Loose pieces tray */}
        <aside className="flex flex-col gap-4 lg:w-64">
          <section className="rounded-2xl border border-border bg-card p-3">
            <div className="mb-2 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Loose pieces</p><p className="font-serif text-lg font-semibold">On the table</p></div><span className="font-mono text-sm text-primary" data-testid="status-pieces-left">{tray.length} left</span></div>
            <div className={`grid max-h-[40vh] grid-cols-4 ${interlockingPieces ? "gap-3 p-2" : "gap-1.5 pr-1"} overflow-y-auto sm:grid-cols-4 lg:grid-cols-3`}>
              {tray.map((piece) => (
                <Tile key={piece} piece={piece} index={piece} gridSize={config.gridSize} themeId={puzzleThemeId} imageKey={config.imageKey} selected={selected?.from === "tray" && selected.piece === piece} showNumber={revealedPieceNumbers.includes(piece)}
                  onClick={() => setSelected((current) => current?.from === "tray" && current.piece === piece ? null : { piece, from: "tray" })}
                  onDragStart={dragStart({ piece, from: "tray" })} onDragEnd={() => setDragged(null)} label={`Piece ${piece + 1}, select to place`} />
              ))}
              {tray.length === 0 && <div className="col-span-full rounded-lg bg-muted px-3 py-4 text-center text-xs text-muted-foreground">All pieces are on the board. Adjust any that need a new home.</div>}
            </div>
          </section>
        </aside>
      </div>

      {/* Reference preview at bottom */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Reference</p><p className="font-serif text-lg font-semibold">{config.level === 3 ? "Picture memory" : config.level === 2 ? "Limited previews" : "Keep it in view"}</p></div>
          <p className="text-right text-xs text-muted-foreground">{config.level === 2 ? `${JIGSAW_MAX_REFERENCE_PEEKS - referencePeeksUsed} of ${JIGSAW_MAX_REFERENCE_PEEKS} previews left` : LEVELS[config.level - 1].copy}</p>
        </div>
        {canSeeReference ? (
          <div className="mx-auto aspect-square max-w-[min(90vw,400px)] overflow-hidden rounded-xl border-4 border-background">
            <ReferenceImage themeId={puzzleThemeId} imageKey={config.imageKey} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="mx-auto grid aspect-square max-w-[min(90vw,400px)] place-items-center rounded-xl border border-dashed border-border bg-muted p-6 text-center">
            <div>
              <EyeOff size={23} className="mx-auto mb-2 text-muted-foreground" />
              <p className="font-serif text-xl">{config.level === 2 ? "Reference hidden" : "Build it from memory"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {config.level === 2
                  ? referencePeeksUsed >= JIGSAW_MAX_REFERENCE_PEEKS
                    ? "You have used all 3 previews for this game."
                    : "Use the eye button for a five-second preview."
                  : "This level keeps the picture hidden."}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
