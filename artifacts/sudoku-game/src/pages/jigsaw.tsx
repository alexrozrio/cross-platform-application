import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Eye, EyeOff, Grip, Image as ImageIcon, Move, RotateCcw, Share2, Sparkles, Timer, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useImageTheme } from "@/hooks/use-image-theme";
import { useThemeImageSrc } from "@/components/theme-icons";
import { getTheme } from "@/lib/themes";
import { useGetProfile, customFetch } from "@workspace/api-client-react";
import { appShareUrlForPath } from "@/lib/app-links";
import { shareOrDownloadShareCard } from "@/lib/share-card";
import { ACHIEVEMENT_COMPLETION_EVENT } from "@/lib/achievement-events";
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
        backgroundColor: "#d9e5df",
      }}
    />
  );
}

function ReferenceImage({ themeId, imageKey, className = "" }: { themeId: string; imageKey: number; className?: string }) {
  const src = useThemeImageSrc(themeId, imageKey);
  return src
    ? <img src={src} alt="Puzzle reference" className={className} />
    : <div aria-label="Puzzle artwork loading" className={`${className} bg-[linear-gradient(135deg,#d9e5df,#c2d7ce)]`} />;
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
      className={`group relative aspect-square overflow-hidden rounded-lg border-2 bg-[#f7f5ed] shadow-sm transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d88b52]/35 ${selected ? "border-[#c66c3b] ring-2 ring-[#c66c3b]/25" : "border-[#e0dfd3]"}`}
    >
      <PuzzlePiece themeId={themeId} imageKey={imageKey} piece={piece} gridSize={gridSize} />
      <span className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-[#223d3a]/75 text-[10px] font-semibold text-white">{index + 1}</span>
    </button>
  );
}

export default function JigsawPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
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
  const [config, setConfig] = useState<Config>({
    gridSize: SIZES.includes(requestedSize as GridSize) ? requestedSize as GridSize : availableSizes[0] ?? 2,
    level: LEVELS.some((level) => level.value === requestedLevel) ? requestedLevel as 1 | 2 | 3 : 1,
    imageKey: Number.isInteger(requestedImage) && requestedImage > 0 ? requestedImage : 1,
    dailyDate: params.get("dailyDate") ?? undefined,
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
  const startedAt = useRef<number | null>(null);
  const completedRef = useRef(false);
  const gameIdRef = useRef<number | null>(null);
  const pendingCompletion = useRef<{ elapsedSeconds: number; moves: number } | null>(null);
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

  const startGame = useCallback((linkedGameId?: number) => {
    const pieces = shuffledTiles(config.gridSize * config.gridSize);
    setBoard(Array(config.gridSize * config.gridSize).fill(null));
    setTray(pieces);
    setSelected(null);
    setMoves(0);
    setElapsed(0);
    setResult(null);
    gameIdRef.current = linkedGameId ?? (Number.isInteger(requestedGameId) && requestedGameId > 0 ? requestedGameId : null);
    pendingCompletion.current = null;
    setShowReference(config.level === 1);
    completedRef.current = false;
    startedAt.current = Date.now();
    setPhase("playing");

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
  }, [config, profileId, requestedGameId, submitCompletion]);

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
      startGame(created.gameId);
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

  if (phase === "setup") {
    return (
      <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 pb-14 pt-5 text-[#203b38] sm:px-8">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#d6ded1] bg-[#f7f5ed] px-4 py-2 text-sm font-semibold text-[#52645d] transition hover:border-[#b3c4b5]" data-testid="link-back-home"><ArrowLeft size={16} /> All games</Link>
          <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#82918a]">Play Brain Games . Online</p><p className="font-mono text-xs text-[#65766f]">PICTURE STUDIO / 01</p></div>
        </header>
        <section className="grid gap-10 lg:grid-cols-[1fr_0.88fr] lg:items-center">
          <div className="relative">
            <div className="absolute -left-4 -top-8 h-24 w-24 rounded-full border border-[#d6a16f]/35" />
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#bc6d43]"><span className="h-px w-8 bg-[#bc6d43]" /> Jigsaw atelier</p>
            <h1 className="max-w-xl font-serif text-5xl leading-[.98] tracking-[-.045em] sm:text-7xl">A picture, in<br /><em className="font-normal text-[#c8754b]">pieces.</em></h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#62746d]">Choose a scene, set your challenge, then bring every little fragment home.</p>
            <div className="mt-9 grid grid-cols-2 gap-3 sm:max-w-md">
              {availableSizes.map((size) => (
                <button key={size} type="button" onClick={() => setConfig((old) => ({ ...old, gridSize: size }))} data-testid={`select-grid-${size}`}
                  className={`rounded-2xl border p-4 text-left transition ${config.gridSize === size ? "border-[#c8754b] bg-[#f4e5d7] shadow-[0_8px_24px_rgba(125,79,51,.08)]" : "border-[#d9dfd4] bg-[#f7f5ed] hover:border-[#b8c9bb]"}`}>
                  <span className="block font-serif text-3xl">{size}×{size}</span>
                  <span className="mt-1 block text-xs text-[#76857e]">{size * size} picture pieces</span>
                </button>
              ))}
            </div>
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#82918a]">Choose your pace</p>
              <div className="space-y-2">
                {LEVELS.map((level) => (
                  <button key={level.value} type="button" onClick={() => setConfig((old) => ({ ...old, level: level.value }))} data-testid={`select-level-${level.value}`}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${config.level === level.value ? "border-[#c8754b] bg-[#f4e5d7]" : "border-[#d9dfd4] bg-[#f7f5ed] hover:border-[#b8c9bb]"}`}>
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${config.level === level.value ? "bg-[#c8754b] text-white" : "bg-[#e9ece3] text-[#75857d]"}`}>{level.value}</span>
                    <span className="flex-1"><span className="block text-sm font-semibold">{level.title}</span><span className="block text-xs text-[#7c8982]">{level.copy}</span></span>
                    {config.level === level.value && <Check size={17} className="text-[#bd6d43]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[#d5ded2] bg-[#e9eee5] p-4 shadow-[0_24px_70px_rgba(41,68,60,.08)] sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#82918a]">Your picture</p><p className="mt-1 font-serif text-2xl">{themeId} collection</p></div>
              <ImageIcon className="text-[#bc754d]" size={21} />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-[1.4rem] border-[7px] border-[#f7f5ed] bg-[#d1dfd5] shadow-inner">
              <ReferenceImage themeId={themeId} imageKey={config.imageKey} className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-60">
                {[0, 1, 2, 3].map((n) => <div key={n} className="border border-white/75" />)}
              </div>
              <div className="absolute bottom-3 left-3 rounded-full bg-[#203b38]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white">Artwork {config.imageKey}</div>
            </div>
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Choose image">
              {Array.from({ length: themeLength }, (_, index) => index + 1).map((key) => (
                <button key={key} type="button" onClick={() => setConfig((old) => ({ ...old, imageKey: key }))} aria-label={`Choose picture ${key}`} aria-pressed={config.imageKey === key} data-testid={`select-image-${key}`}
                  className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition ${config.imageKey === key ? "border-[#c8754b] ring-2 ring-[#c8754b]/20" : "border-[#f7f5ed] opacity-75 hover:opacity-100"}`}>
                  <ReferenceImage themeId={themeId} imageKey={key} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => startGame()} data-testid="button-start-jigsaw" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#244844] px-5 py-4 text-sm font-bold text-[#f6f4e9] shadow-[0_9px_22px_rgba(36,72,68,.18)] transition hover:-translate-y-0.5 hover:bg-[#183b37] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#244844]/25">
              <Sparkles size={17} /> Start building
            </button>
            <button type="button" onClick={() => void createChallengeAndPlay()} disabled={isCreatingChallenge} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbd6ca] bg-[#f7f5ed] px-5 py-3 text-sm font-semibold text-[#52645d] transition hover:border-[#c8754b] hover:text-[#b96942] disabled:opacity-60">
              <Share2 size={16} /> {isCreatingChallenge ? "Preparing challenge…" : "Challenge a friend"}
            </button>
            <Link href="/jigsaw-challenges" className="mt-3 block text-center text-xs font-semibold text-[#8b9990] hover:text-[#bd6d43]">View your Jigsaw challenges</Link>
            <p className="mt-3 text-center text-[11px] text-[#82918a]">Plays offline. Your score syncs when available.</p>
          </div>
        </section>
      </main>
    );
  }

  if (phase === "complete" && result) {
    return (
      <main className="mx-auto min-h-[100dvh] max-w-5xl px-4 pb-14 pt-8 text-[#203b38] sm:px-8">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-[#d4ddd1] bg-[#f7f5ed] shadow-[0_25px_70px_rgba(36,67,60,.12)]">
          <div className="relative bg-[#244844] px-6 py-10 text-center text-[#f6f4e9] sm:px-12">
            <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10" />
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#d88b52] text-white"><Trophy size={25} /></div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d5c9a7]">Picture complete</p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Every piece, in place.</h1>
          </div>
          <div className="grid gap-7 p-5 sm:grid-cols-[1fr_0.9fr] sm:p-9">
            <div className="aspect-square overflow-hidden rounded-2xl border-[6px] border-[#e7e6d9] shadow-sm">
              <ReferenceImage themeId={themeId} imageKey={result.imageKey} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8b9990]">Your result</p>
              <p className="mt-2 font-serif text-6xl text-[#c8754b]" data-testid="result-points">{result.points.toLocaleString()}<span className="ml-2 text-base font-sans font-semibold text-[#87958b]">pts</span></p>
              <div className="my-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[#edf0e7] p-3"><p className="text-[10px] uppercase tracking-[.14em] text-[#87958b]">Time</p><p className="mt-1 font-mono text-xl" data-testid="result-time">{formatTime(result.elapsedSeconds)}</p></div>
                <div className="rounded-xl bg-[#edf0e7] p-3"><p className="text-[10px] uppercase tracking-[.14em] text-[#87958b]">Moves</p><p className="mt-1 font-mono text-xl" data-testid="result-moves">{result.moves}</p></div>
              </div>
              <p className="mb-5 text-sm text-[#75857d]" data-testid="result-rewards">+{result.xpEarned} XP <span className="px-1 text-[#bec7bb]">/</span> +{result.gemsEarned} gems{result.isPersonalBest ? " / Personal best" : ""}</p>
              <button type="button" onClick={() => void handleShare()} data-testid="button-share-result" className="mb-2 inline-flex items-center justify-center gap-2 rounded-xl border border-[#c7d4c8] px-4 py-3 text-sm font-semibold transition hover:bg-[#edf0e7]"><Share2 size={16} /> Share result</button>
              {!hasLinkedChallenge && <button type="button" onClick={() => startGame()} data-testid="button-play-again" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244844] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#183b37]"><RotateCcw size={16} /> Play again</button>}
              <Link href="/jigsaw" className="mt-3 text-center text-xs font-semibold text-[#8b9990] hover:text-[#bd6d43]" data-testid="link-new-picture">Change picture or difficulty</Link>
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
    <main className="mx-auto min-h-[100dvh] max-w-7xl px-3 pb-12 pt-4 text-[#203b38] sm:px-7">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/jigsaw" className="inline-flex items-center gap-2 rounded-full border border-[#d6ded1] bg-[#f7f5ed] px-4 py-2 text-sm font-semibold text-[#52645d] transition hover:border-[#b3c4b5]" data-testid="link-exit-jigsaw"><ArrowLeft size={16} /> Setup</Link>
        <div className="flex items-center gap-2 rounded-full bg-[#e9eee5] px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-[#61746b]"><span>Level {config.level}</span><span className="text-[#c4a07c]">/</span><span>{tileCount} pieces</span></div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-[1.7rem] border border-[#d5ded2] bg-[#f7f5ed] p-3 shadow-[0_16px_45px_rgba(41,68,60,.07)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#8b9990]">The board</p><h1 className="font-serif text-2xl sm:text-3xl">Find the picture.</h1></div>
            <div className="flex items-center gap-2 rounded-xl bg-[#edf0e7] px-3 py-2 font-mono text-sm" data-testid="status-timer"><Timer size={15} className="text-[#bc754d]" />{formatTime(elapsed)}</div>
          </div>
          <div className="mx-auto grid aspect-square w-full max-w-[min(78vw,660px)] gap-1.5 rounded-2xl bg-[#cbd6ca] p-1.5 sm:gap-2 sm:p-2" style={{ gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))` }} role="grid" aria-label={`${config.gridSize} by ${config.gridSize} puzzle board`}>
            {board.map((piece, slot) => (
              <button key={slot} type="button" role="gridcell" onClick={() => chooseSlot(slot)} onDragOver={(event) => event.preventDefault()} onDrop={dropOnSlot(slot)}
                draggable={piece !== null} onDragStart={piece === null ? undefined : dragStart({ piece, from: "board", slot })} onDragEnd={() => setDragged(null)}
                aria-label={`Puzzle position ${slot + 1}${piece !== null ? `, piece ${piece + 1}` : ", empty"}`} aria-pressed={selected?.from === "board" && selected.slot === slot}
                data-testid={`board-slot-${slot}`}
                className={`relative min-h-0 overflow-hidden rounded-md border-2 transition ${piece === null ? "border-dashed border-[#9ead9f] bg-[#e6e9df]" : "border-[#f7f5ed] shadow-sm"} ${selected?.from === "board" && selected.slot === slot ? "ring-4 ring-[#cf7749]/50" : ""} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d88b52]/45`}>
                {piece !== null && <PuzzlePiece themeId={themeId} imageKey={config.imageKey} piece={piece} gridSize={config.gridSize} />}
                {piece === null && <span className="absolute inset-0 grid place-items-center text-[10px] font-mono text-[#87958b]">{String(slot + 1).padStart(2, "0")}</span>}
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[#89968e]"><Move size={14} /> Select a piece, then its home. You can also drag it into place.</p>
        </section>
        <aside className="flex flex-col gap-4">
          <section className="rounded-[1.6rem] border border-[#d5ded2] bg-[#e9eee5] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8b9990]">Reference</p><p className="font-serif text-xl">{config.level === 3 ? "Picture memory" : "Keep it in view"}</p></div>
              {config.level === 2 && <button type="button" onClick={() => setShowReference((value) => !value)} aria-label={showReference ? "Hide reference picture" : "Show reference picture"} data-testid="button-toggle-reference" className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7f5ed] text-[#47615a] hover:text-[#bd6d43]">{showReference ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
            </div>
            {canSeeReference ? <div className="aspect-square overflow-hidden rounded-xl border-4 border-[#f7f5ed]"><ReferenceImage themeId={themeId} imageKey={config.imageKey} className="h-full w-full object-cover" /></div> : <div className="grid aspect-square place-items-center rounded-xl border border-dashed border-[#b5c6b8] bg-[#dce5db] p-6 text-center"><div><EyeOff size={23} className="mx-auto mb-2 text-[#75877d]" /><p className="font-serif text-xl">Build it from memory</p><p className="mt-1 text-xs text-[#7c8982]">This level keeps the picture hidden.</p></div></div>}
            <p className="mt-3 text-xs leading-5 text-[#75857d]">{LEVELS[config.level - 1].copy}</p>
          </section>
          <section className="rounded-[1.6rem] border border-[#d5ded2] bg-[#f7f5ed] p-4 sm:p-5">
            <div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8b9990]">Loose pieces</p><p className="font-serif text-xl">On the table</p></div><span className="font-mono text-sm text-[#bd6d43]" data-testid="status-pieces-left">{tray.length} left</span></div>
            <div className="grid max-h-[40vh] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5 lg:grid-cols-4">
              {tray.map((piece) => (
                <Tile key={piece} piece={piece} index={piece} gridSize={config.gridSize} themeId={themeId} imageKey={config.imageKey} selected={selected?.from === "tray" && selected.piece === piece}
                  onClick={() => setSelected((current) => current?.from === "tray" && current.piece === piece ? null : { piece, from: "tray" })}
                  onDragStart={dragStart({ piece, from: "tray" })} onDragEnd={() => setDragged(null)} label={`Piece ${piece + 1}, select to place`} />
              ))}
              {tray.length === 0 && <div className="col-span-full rounded-lg bg-[#edf0e7] px-3 py-5 text-center text-xs text-[#7d8a82]">All pieces are on the board. Adjust any that need a new home.</div>}
            </div>
          </section>
          <section className="flex items-center justify-between rounded-2xl border border-[#d5ded2] bg-[#e9eee5] px-4 py-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8b9990]">Moves</p><p className="font-mono text-2xl" data-testid="status-moves">{moves}</p></div>
            {!hasLinkedChallenge && <button type="button" onClick={() => startGame()} data-testid="button-restart-jigsaw" className="inline-flex items-center gap-2 rounded-lg border border-[#cbd6ca] bg-[#f7f5ed] px-3 py-2 text-xs font-semibold text-[#52645d] transition hover:border-[#c8754b] hover:text-[#b96942]"><RotateCcw size={14} /> Restart</button>}
          </section>
          <p className="flex items-center gap-2 px-1 text-[11px] text-[#8b9990]"><Grip size={14} /> Tip: keyboard users can tab to each piece and press Enter to select.</p>
        </aside>
      </div>
    </main>
  );
}
