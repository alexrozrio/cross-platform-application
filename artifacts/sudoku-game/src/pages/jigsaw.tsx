import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Eye, EyeOff, Grip, Image as ImageIcon, Move, RotateCcw, Share2, Sparkles, Timer, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useImageTheme } from "@/hooks/use-image-theme";
import { useThemeImageSrc } from "@/components/theme-icons";
import { usePageMeta } from "@/components/page-meta";
import { getTheme } from "@/lib/themes";
import { useGetProfile, customFetch } from "@workspace/api-client-react";
import { appShareUrlForPath } from "@/lib/app-links";
import { shareOrDownloadShareCard } from "@/lib/share-card";
import { ACHIEVEMENT_COMPLETION_EVENT } from "@/lib/achievement-events";
import {
  JIGSAW_SESSION_STORAGE_KEY,
  parseSavedJigsawSession,
  type SavedJigsawSession,
} from "@/lib/jigsaw-session";
import { toast } from "sonner";

type GridSize = 2 | 3 | 4 | 5;
type Phase = "setup" | "playing" | "complete";
type Result = {
  id?: number;
  points: number;
  xpEarned: number;
  gemsEarned: number;
  isPersonalBest?: boolean;
  elapsedSeconds: number;
  moves: number;
  gridSize: GridSize;
  level: 1 | 2 | 3;
  imageKey: number;
};
type Config = { gridSize: GridSize; level: 1 | 2 | 3; imageKey: number; dailyDate?: string };

const SIZES: GridSize[] = [2, 3, 4, 5];
const LEVELS: { value: 1 | 2 | 3; title: string; copy: string }[] = [
  { value: 1, title: "Guided", copy: "Reference stays beside your puzzle" },
  { value: 2, title: "Recall", copy: "Peek at the picture whenever you need" },
  { value: 3, title: "From memory", copy: "No reference image during play" },
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

function PuzzlePiece({ themeId, imageKey, piece, gridSize, className = "" }: {
  themeId: string; imageKey: number; piece: number; gridSize: GridSize; className?: string;
}) {
  const src = useThemeImageSrc(themeId, imageKey);
  const row = Math.floor(piece / gridSize);
  const col = piece % gridSize;
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

function Tile({ piece, index, gridSize, themeId, imageKey, selected, onClick, onDragStart, onDragEnd, label }: {
  piece: number; index: number; gridSize: GridSize; themeId: string; imageKey: number; selected: boolean;
  onClick: () => void; onDragStart: (event: DragEvent) => void; onDragEnd: () => void; label: string;
}) {
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
      className={`group relative aspect-square overflow-hidden rounded-lg border-2 bg-background shadow-sm transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring ${selected ? "border-primary ring-2 ring-primary/25" : "border-border"}`}
    >
      <PuzzlePiece themeId={themeId} imageKey={imageKey} piece={piece} gridSize={gridSize} />
      <span className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-foreground/75 text-[10px] font-semibold text-background">{index + 1}</span>
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
  const [challengeId, setChallengeId] = useState<number | null>(
    Number.isInteger(Number(params.get("challengeId"))) && Number(params.get("challengeId")) > 0
      ? Number(params.get("challengeId"))
      : null,
  );
  const [shareToken, setShareToken] = useState<string | null>(params.get("shareToken"));
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const hasLinkedChallenge = challengeId !== null;
  const [phase, setPhase] = useState<Phase>("setup");
  const [board, setBoard] = useState<(number | null)[]>([]);
  const [tray, setTray] = useState<number[]>([]);
  const [selected, setSelected] = useState<{ piece: number; from: "tray" | "board"; slot?: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showReference, setShowReference] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [dragged, setDragged] = useState<{ piece: number; from: "tray" | "board"; slot?: number } | null>(null);
  const [savedSession, setSavedSession] = useState<SavedJigsawSession | null>(null);
  const [sessionThemeId, setSessionThemeId] = useState<string | null>(null);
  const startedAt = useRef<number | null>(null);
  const completedRef = useRef(false);
  const restoreCheckedRef = useRef(false);
  const autoStartedGameIdRef = useRef<number | null>(null);
  const autoStartedDailyDateRef = useRef<string | null>(null);
  const gameIdRef = useRef<number | null>(null);
  const pendingCompletion = useRef<{ elapsedSeconds: number; moves: number } | null>(null);
  const puzzleThemeId = sessionThemeId ?? themeId;
  const tileCount = config.gridSize * config.gridSize;
  const isSolved = board.length > 0 && board.every((piece, index) => piece === index);

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

  const pointsFor = useCallback((seconds: number) => {
    const basePoints: Record<GridSize, number> = { 2: 250, 3: 500, 4: 900, 5: 1400 };
    const parSeconds: Record<GridSize, number> = { 2: 45, 3: 90, 4: 150, 5: 240 };
    const levelMultiplier = 1 + (config.level - 1) * 0.5;
    const adjustedPar = parSeconds[config.gridSize] * (1 + (config.level - 1) * 0.35);
    const speedBonus = Math.round(Math.max(0, adjustedPar - seconds) * 2 * config.level);
    return Math.max(10, Math.round(basePoints[config.gridSize] * levelMultiplier + speedBonus));
  }, [config.gridSize, config.level]);

  const submitCompletion = useCallback((id: number, elapsedSeconds: number, moveCount: number) => {
    void customFetch<{ id: number; points: number; xpEarned: number; gemsEarned: number; isPersonalBest?: boolean; completedAt: string }>(
      `/api/jigsaw-games/${id}/complete`,
      { method: "POST", body: JSON.stringify({ elapsedSeconds, moves: moveCount }) },
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

  const startGame = useCallback((
    linkedGameId?: number,
    linkedChallenge?: { challengeId: number; shareToken: string },
  ) => {
    const pieces = shuffledTiles(config.gridSize * config.gridSize);
    setBoard(Array(config.gridSize * config.gridSize).fill(null));
    setTray(pieces);
    setSelected(null);
    setMoves(0);
    setElapsed(0);
    setResult(null);
    gameIdRef.current = linkedGameId ?? (Number.isInteger(requestedGameId) && requestedGameId > 0 ? requestedGameId : null);
    pendingCompletion.current = null;
    if (linkedChallenge) {
      setChallengeId(linkedChallenge.challengeId);
      setShareToken(linkedChallenge.shareToken);
    }
    setShowReference(config.level === 1);
    completedRef.current = false;
    startedAt.current = Date.now();
    setSessionThemeId(themeId);
    setPhase("playing");

    const nextParams = new URLSearchParams({
      gridSize: String(config.gridSize),
      level: String(config.level),
      imageKey: String(config.imageKey),
      play: "1",
    });
    if (config.dailyDate) nextParams.set("dailyDate", config.dailyDate);
    if (gameIdRef.current) nextParams.set("gameId", String(gameIdRef.current));
    const nextChallengeId = linkedChallenge?.challengeId ?? challengeId;
    const nextShareToken = linkedChallenge?.shareToken ?? shareToken;
    if (nextChallengeId !== null) nextParams.set("challengeId", String(nextChallengeId));
    if (nextShareToken) nextParams.set("shareToken", nextShareToken);
    setLocation(`/jigsaw?${nextParams.toString()}`);

    if (gameIdRef.current) return;
    const body = {
      ...(profileId ? { profileId } : {}),
      gridSize: config.gridSize,
      level: config.level,
      imageKey: config.imageKey,
      ...(config.dailyDate ? { dailyDate: config.dailyDate } : {}),
    };
    void customFetch<{ id: number }>("/api/jigsaw-games", { method: "POST", body: JSON.stringify(body) })
      .then((session) => {
        gameIdRef.current = session.id;
        if (pendingCompletion.current) submitCompletion(session.id, pendingCompletion.current.elapsedSeconds, pendingCompletion.current.moves);
      })
      .catch(() => undefined);
  }, [challengeId, config, profileId, requestedGameId, setLocation, shareToken, submitCompletion, themeId]);

  const restoreSession = useCallback((session: SavedJigsawSession) => {
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
    setShowReference(session.showReference);
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
  }, [setLocation]);

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
  }, [board, challengeId, config, elapsed, moves, phase, puzzleThemeId, shareToken, showReference, tileCount, tray]);

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
    completedRef.current = true;
    const offline: Result = {
      points: pointsFor(finalElapsed),
      xpEarned: Math.max(1, Math.round(config.gridSize * config.level / 2)),
      gemsEarned: config.gridSize >= 4 ? 2 : 1,
      elapsedSeconds: finalElapsed, moves: finalMoves, gridSize: config.gridSize, level: config.level, imageKey: config.imageKey,
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
    pendingCompletion.current = { elapsedSeconds: finalElapsed, moves: finalMoves };
    if (gameIdRef.current) submitCompletion(gameIdRef.current, finalElapsed, finalMoves);
  }, [config, pointsFor, profileId, submitCompletion]);

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
      `${result.moves} moves · ${formatTime(result.elapsedSeconds)}`,
      `${result.points.toLocaleString()} points`,
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
    setPhase("setup");
    setSelected(null);
    setDragged(null);
    setConfig((current) => ({ ...current, dailyDate: undefined }));
    setLocation("/jigsaw");
  };

  if (phase === "setup") {
    return (
      <main className="mx-auto min-h-0 w-full min-w-0 max-w-6xl px-3 pb-6 pt-3 text-foreground sm:px-5 sm:pt-5">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary" data-testid="link-back-home"><ArrowLeft size={16} /> All games</Link>
          <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-muted-foreground">Play Brain Games . Online</p><p className="font-mono text-xs text-muted-foreground">JIGSAW PUZZLE</p></div>
        </header>
        <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.88fr)] lg:items-start lg:gap-6">
          <div className="relative min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-primary"><span className="h-px w-8 bg-primary" /> Picture puzzle</p>
            <h1 className="max-w-xl font-serif text-4xl font-bold leading-tight tracking-[-.035em] sm:text-5xl">Put the picture<br className="hidden sm:block" /> back together.</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Choose a scene and board size, then place each piece in its home.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
              {availableSizes.map((size) => (
                <button key={size} type="button" onClick={() => setConfig((old) => ({ ...old, gridSize: size }))} data-testid={`select-grid-${size}`}
                  className={`rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${config.gridSize === size ? "border-primary bg-accent text-accent-foreground shadow-sm" : "border-border bg-background hover:border-primary"}`}>
                  <span className="block text-2xl font-bold">{size}×{size}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{size * size} pieces</span>
                </button>
              ))}
            </div>
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">Choose your pace</p>
              <div className="space-y-2">
                {LEVELS.map((level) => (
                  <button key={level.value} type="button" onClick={() => setConfig((old) => ({ ...old, level: level.value }))} data-testid={`select-level-${level.value}`}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${config.level === level.value ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background hover:border-primary"}`}>
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${config.level === level.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{level.value}</span>
                    <span className="flex-1"><span className="block text-sm font-semibold">{level.title}</span><span className="block text-xs text-muted-foreground">{level.copy}</span></span>
                    {config.level === level.value && <Check size={17} className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">Your picture</p><p className="mt-1 font-serif text-2xl">{themeId} collection</p></div>
              <ImageIcon className="text-primary" size={21} />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl border-4 border-background bg-muted shadow-inner">
              <ReferenceImage themeId={themeId} imageKey={config.imageKey} className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-60">
                {[0, 1, 2, 3].map((n) => <div key={n} className="border border-white/75" />)}
              </div>
              <div className="absolute bottom-3 left-3 rounded-full bg-foreground/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-background">Picture {config.imageKey}</div>
            </div>
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Choose image">
              {Array.from({ length: themeLength }, (_, index) => index + 1).map((key) => (
                <button key={key} type="button" onClick={() => setConfig((old) => ({ ...old, imageKey: key }))} aria-label={`Choose picture ${key}`} aria-pressed={config.imageKey === key} data-testid={`select-image-${key}`}
                  className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${config.imageKey === key ? "border-primary ring-2 ring-primary/25" : "border-border opacity-75 hover:opacity-100"}`}>
                  <ReferenceImage themeId={themeId} imageKey={key} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            {savedSession && !config.dailyDate && phase === "setup" && (
              <button type="button" onClick={() => restoreSession(savedSession)} data-testid="button-resume-jigsaw" className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-primary/35 bg-accent px-4 py-3 text-left text-sm font-semibold text-accent-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span><span className="block">Resume your puzzle</span><span className="mt-0.5 block text-xs font-normal text-muted-foreground">{savedSession.gridSize}×{savedSession.gridSize} · {savedSession.moves} moves · {formatTime(savedSession.elapsed)}</span></span>
                <RotateCcw size={16} />
              </button>
            )}
            <button type="button" onClick={() => startGame()} data-testid="button-start-jigsaw" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Sparkles size={17} /> Start building
            </button>
            <button type="button" onClick={() => void createChallengeAndPlay()} disabled={isCreatingChallenge} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary disabled:opacity-60">
              <Share2 size={16} /> {isCreatingChallenge ? "Preparing challenge…" : "Challenge a friend"}
            </button>
            <Link href="/jigsaw-challenge" data-testid="link-daily-jigsaw" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:border-primary">
              <CalendarDays size={16} /> Play today&apos;s daily challenge <ArrowRight size={15} />
            </Link>
            <Link href="/jigsaw-challenges" className="mt-3 block text-center text-xs font-semibold text-muted-foreground hover:text-primary">View your Jigsaw challenges</Link>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">Plays offline. Your score syncs when available.</p>
          </div>
        </section>
      </main>
    );
  }

  if (phase === "complete" && result) {
    return (
      <main className="mx-auto min-h-0 w-full max-w-5xl px-3 pb-6 pt-3 text-foreground sm:px-5 sm:pt-5">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="relative bg-primary px-6 py-8 text-center text-primary-foreground sm:px-12">
            <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10" />
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-background/20 text-primary-foreground"><Trophy size={25} /></div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary-foreground/75">Picture complete</p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Every piece, in place.</h1>
          </div>
          <div className="grid gap-5 p-4 sm:grid-cols-[1fr_0.9fr] sm:p-6">
            <div className="aspect-square overflow-hidden rounded-xl border-4 border-background shadow-sm">
              <ReferenceImage themeId={puzzleThemeId} imageKey={result.imageKey} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">Your result</p>
              <p className="mt-2 font-serif text-6xl text-primary" data-testid="result-points">{result.points.toLocaleString()}<span className="ml-2 text-base font-sans font-semibold text-muted-foreground">pts</span></p>
              <div className="my-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-muted p-3"><p className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">Time</p><p className="mt-1 font-mono text-xl" data-testid="result-time">{formatTime(result.elapsedSeconds)}</p></div>
                <div className="rounded-xl bg-muted p-3"><p className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">Moves</p><p className="mt-1 font-mono text-xl" data-testid="result-moves">{result.moves}</p></div>
              </div>
              <p className="mb-5 text-sm text-muted-foreground" data-testid="result-rewards">+{result.xpEarned} XP <span className="px-1 text-border">/</span> +{result.gemsEarned} gems{result.isPersonalBest ? " / Personal best" : ""}</p>
              <button type="button" onClick={() => void handleShare()} data-testid="button-share-result" className="mb-2 inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-muted"><Share2 size={16} /> Share result</button>
              {!hasLinkedChallenge && <button type="button" onClick={() => startGame()} data-testid="button-play-again" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"><RotateCcw size={16} /> Play again</button>}
              {!config.dailyDate && <Link href="/jigsaw-challenge" className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:border-primary"><CalendarDays size={16} /> Try today&apos;s daily challenge</Link>}
              <button type="button" onClick={exitToSetup} className="mt-3 text-center text-xs font-semibold text-muted-foreground hover:text-primary" data-testid="link-new-picture">Change picture or difficulty</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const canSeeReference = config.level === 1 || showReference;
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
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={exitToSetup} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary" data-testid="link-exit-jigsaw"><ArrowLeft size={16} /> Setup</button>
        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-muted-foreground"><span>Level {config.level}</span><span className="text-border">/</span><span>{tileCount} pieces</span></div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-2xl border border-border bg-card p-2 shadow-sm sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">The board</p><h1 className="font-serif text-2xl font-bold sm:text-3xl">Find the picture.</h1></div>
            <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 font-mono text-sm" data-testid="status-timer"><Timer size={15} className="text-primary" />{formatTime(elapsed)}</div>
          </div>
          <div className="mx-auto grid aspect-square w-full max-w-[min(90vw,660px)] gap-1 rounded-xl bg-muted p-1 sm:gap-2 sm:rounded-2xl sm:p-2" style={{ gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))` }} role="grid" aria-label={`${config.gridSize} by ${config.gridSize} puzzle board`}>
            {board.map((piece, slot) => (
              <button key={slot} type="button" role="gridcell" onClick={() => chooseSlot(slot)} onDragOver={(event) => event.preventDefault()} onDrop={dropOnSlot(slot)}
                draggable={piece !== null} onDragStart={piece === null ? undefined : dragStart({ piece, from: "board", slot })} onDragEnd={() => setDragged(null)}
                aria-label={`Puzzle position ${slot + 1}${piece !== null ? `, piece ${piece + 1}` : ", empty"}`} aria-pressed={selected?.from === "board" && selected.slot === slot}
                data-testid={`board-slot-${slot}`}
                className={`relative min-h-0 overflow-hidden rounded-md border-2 transition ${piece === null ? "border-dashed border-border bg-background" : "border-background shadow-sm"} ${selected?.from === "board" && selected.slot === slot ? "ring-4 ring-primary/40" : ""} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring`}>
                {piece !== null && <PuzzlePiece themeId={puzzleThemeId} imageKey={config.imageKey} piece={piece} gridSize={config.gridSize} />}
                {piece === null && <span className="absolute inset-0 grid place-items-center text-[10px] font-mono text-muted-foreground">{String(slot + 1).padStart(2, "0")}</span>}
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><Move size={14} /> Select a piece, then its home. You can also drag it into place.</p>
        </section>
        <aside className="flex flex-col gap-4">
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Reference</p><p className="font-serif text-xl font-semibold">{config.level === 3 ? "Picture memory" : "Keep it in view"}</p></div>
              {config.level === 2 && <button type="button" onClick={() => setShowReference((value) => !value)} aria-label={showReference ? "Hide reference picture" : "Show reference picture"} data-testid="button-toggle-reference" className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-foreground hover:text-primary">{showReference ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
            </div>
            {canSeeReference ? <div className="aspect-square overflow-hidden rounded-xl border-4 border-background"><ReferenceImage themeId={puzzleThemeId} imageKey={config.imageKey} className="h-full w-full object-cover" /></div> : <div className="grid aspect-square place-items-center rounded-xl border border-dashed border-border bg-muted p-6 text-center"><div><EyeOff size={23} className="mx-auto mb-2 text-muted-foreground" /><p className="font-serif text-xl">Build it from memory</p><p className="mt-1 text-xs text-muted-foreground">This level keeps the picture hidden.</p></div></div>}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{LEVELS[config.level - 1].copy}</p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Loose pieces</p><p className="font-serif text-xl font-semibold">On the table</p></div><span className="font-mono text-sm text-primary" data-testid="status-pieces-left">{tray.length} left</span></div>
            <div className="grid max-h-[40vh] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5 lg:grid-cols-4">
              {tray.map((piece) => (
                <Tile key={piece} piece={piece} index={piece} gridSize={config.gridSize} themeId={puzzleThemeId} imageKey={config.imageKey} selected={selected?.from === "tray" && selected.piece === piece}
                  onClick={() => setSelected((current) => current?.from === "tray" && current.piece === piece ? null : { piece, from: "tray" })}
                  onDragStart={dragStart({ piece, from: "tray" })} onDragEnd={() => setDragged(null)} label={`Piece ${piece + 1}, select to place`} />
              ))}
              {tray.length === 0 && <div className="col-span-full rounded-lg bg-muted px-3 py-5 text-center text-xs text-muted-foreground">All pieces are on the board. Adjust any that need a new home.</div>}
            </div>
          </section>
          <section className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Moves</p><p className="font-mono text-2xl" data-testid="status-moves">{moves}</p></div>
            {!hasLinkedChallenge && <button type="button" onClick={() => startGame()} data-testid="button-restart-jigsaw" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"><RotateCcw size={14} /> Restart</button>}
          </section>
          <p className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground"><Grip size={14} /> Select a piece, then select its home. Drag and drop also works on desktop.</p>
        </aside>
      </div>
    </main>
  );
}
