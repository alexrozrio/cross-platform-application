import React from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, BookOpen, Clock3, Grid3x3, Home, Keyboard, LayoutGrid, Lightbulb, MousePointerClick, RotateCcw, Scroll, Share2, Timer, Trophy, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useImageTheme } from "@/hooks/use-image-theme";
import { useSound } from "@/hooks/use-sound";
import { usePageMeta } from "@/components/page-meta";
import { Confetti } from "@/components/confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileContentDisclosure } from "@/components/mobile-content-disclosure";
import { customFetch, useGetProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { appShareUrlForPath } from "@/lib/app-links";
import { shareOrDownloadShareCard } from "@/lib/share-card";
import { getLevelFromXp } from "@/lib/levels";
import { toast } from "sonner";
import { ACHIEVEMENT_COMPLETION_EVENT } from "@/lib/achievement-events";
import { blankIndex, createSolvedTiles, hintTileIndex, isSolved, MAX_HINTS, scrambleTiles, slideTile, slideableIndexes, SLIDE_PUZZLE_LEVELS, SLIDE_PUZZLE_TILE_STYLES, tileLabel, type SlidePuzzleDifficulty, type SlidePuzzleTileStyle } from "@/lib/slide-puzzle";
import { recordSlidePuzzleCompletion } from "@/lib/slide-puzzle-stats";
import { getTheme, IMAGE_THEMES } from "@/lib/themes";
import { ThemeIcon, useThemeImageSrc } from "@/components/theme-icons";
import { Button } from "@/components/ui/button";

const SAVE_KEY = "brain-games-slide-puzzle-session";
const DIFFICULTIES: { id: SlidePuzzleDifficulty; detail: string }[] = [
  { id: "2x2", detail: "2 × 2 · 3 tiles" },
  { id: "3x3", detail: "3 × 3 · 8 tiles" },
  { id: "4x4", detail: "4 × 4 · 15 tiles" },
  { id: "5x5", detail: "5 × 5 · 24 tiles" },
];
const STYLE_LABELS: Record<SlidePuzzleTileStyle, string> = { numbers: "Numbers", alphabet: "Alphabet", icons: "Pictures" };

type SavedGame = {
  difficulty: SlidePuzzleDifficulty;
  tileStyle: SlidePuzzleTileStyle;
  themeId: string | null;
  iconValue?: number;
  seed: number;
  size: number;
  tiles: number[];
  moves: number;
  hintsUsed: number;
  elapsed: number;
  savedAt: number;
  status: "playing" | "won";
  gameId?: number;
  dailyDate?: string;
  challengeId?: number;
};
type SlidePuzzleReward = { points: number; xpEarned: number; gemsEarned: number; won?: boolean; isPersonalBest?: boolean; offline?: boolean };
type SlidePuzzleChallengeResult = { id: number; status: string; challengerId: number; challengedId: number; winnerId: number | null; challengerUsername: string; challengedUsername: string; challengerPoints: number | null; challengedPoints: number | null; challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null };

function loadSaved(): SavedGame | null {
  try {
    const value = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as SavedGame | null;
    if (value && ["2x2", "3x3", "4x4", "5x5"].includes(value.difficulty) && Array.isArray(value.tiles) && value.size > 0) {
      value.moves = Number.isFinite(value.moves) ? value.moves : 0;
      value.hintsUsed = Number.isFinite(value.hintsUsed) ? Math.min(MAX_HINTS, value.hintsUsed) : 0;
      value.status = value.status === "won" ? "won" : "playing";
      return value;
    }
  } catch { /* Ignore an unavailable or invalid save. */ }
  return null;
}

export default function SlidePuzzlePage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const query = new URLSearchParams(search);
  const { profileId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId as number);
  const queryClient = useQueryClient();
  const sounds = useSound(profile?.soundEnabled);
  const gameMode = profile?.gameMode ?? "4all";
  const availableDifficulties = DIFFICULTIES.filter(({ id }) =>
    gameMode === "children" ? SLIDE_PUZZLE_LEVELS[id].mode === "baby" :
      gameMode === "adult" ? SLIDE_PUZZLE_LEVELS[id].mode === "adult" : true,
  );
  const [game, setGame] = React.useState<SavedGame | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [hintIndex, setHintIndex] = React.useState<number | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [hasSavedGame, setHasSavedGame] = React.useState(false);
  const [reward, setReward] = React.useState<SlidePuzzleReward | null>(null);
  const [rewardLoading, setRewardLoading] = React.useState(false);
  const [rewardError, setRewardError] = React.useState<string | null>(null);
  const [challengeResult, setChallengeResult] = React.useState<SlidePuzzleChallengeResult | null>(null);
  const [infoModal, setInfoModal] = React.useState<"rules" | "controls" | "backstory" | null>(null);
  const [tileStyle, setTileStyle] = React.useState<SlidePuzzleTileStyle>("numbers");
  const { themeId: imageThemeId } = useImageTheme();
  const [iconValue, setIconValue] = React.useState(1);
  const activeGameRef = React.useRef(game);
  activeGameRef.current = game;
  const pendingGameRef = React.useRef<{ savedAt: number; promise: Promise<number | null> } | null>(null);
  const directStartHandledRef = React.useRef(false);
  const hintTimerRef = React.useRef<number | null>(null);
  const puzzleImageSrc = useThemeImageSrc(game?.themeId ?? imageThemeId, game?.iconValue ?? iconValue);

  usePageMeta({
    title: "Slide Puzzle Game | Play Brain Games",
    description: "Slide the tiles into order on 2×2, 3×3, 4×4, and 5×5 boards with numbers, letters, or pictures. Play free slide puzzles.",
    path: "/slide-puzzle",
  });

  React.useEffect(() => {
    const saved = loadSaved();
    setHasSavedGame(Boolean(saved));
    if (query.get("resume") === "1" && saved) {
      setGame(saved); setElapsed(saved.elapsed);
      if (saved.tileStyle) setTileStyle(saved.tileStyle);
      if (saved.iconValue) setIconValue(saved.iconValue);
    }
    // The mount reads the browser's local save once; location state is encoded in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!game || game.status !== "playing") return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [game?.status]);

  React.useEffect(() => {
    if (game && game.status === "playing") {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...game, elapsed })); setHasSavedGame(true); } catch { /* Storage is optional. */ }
    }
  }, [game, elapsed]);

  React.useEffect(() => () => { if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current); }, []);

  const completeGame = async (completed: SavedGame, finalElapsed: number, won: boolean) => {
    setRewardLoading(true);
    setRewardError(null);
    try {
      const pending = pendingGameRef.current;
      let gameId = completed.gameId ?? (pending?.savedAt === completed.savedAt ? await pending.promise : null);
      // Like Minesweeper, recover if the game-create request failed or the
      // player finished before it returned. This lets a finished game still
      // use the server's normal points, XP, and gems calculation.
      if (!gameId && profileId && navigator.onLine !== false) {
        const createController = new AbortController();
        const createTimeout = window.setTimeout(() => createController.abort(), 5000);
        try {
          const created = await customFetch<{ id: number }>("/api/slide-puzzle-games", {
            method: "POST",
            body: JSON.stringify({
              profileId,
              difficulty: completed.difficulty,
              tileStyle: completed.tileStyle,
              themeId: completed.themeId,
              ...(completed.dailyDate ? { dailyDate: completed.dailyDate } : {}),
            }),
            signal: createController.signal,
          });
          const createdGameId = created.id;
          gameId = createdGameId;
          setGame((current) => current?.savedAt === completed.savedAt ? { ...current, gameId: createdGameId } : current);
        } finally {
          window.clearTimeout(createTimeout);
        }
      }
      if (!gameId) throw new Error("Game could not be saved");
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      let result: SlidePuzzleReward;
      try {
        result = await customFetch<SlidePuzzleReward>(`/api/slide-puzzle-games/${gameId}/complete`, {
          method: "POST",
          body: JSON.stringify({ elapsedSeconds: finalElapsed, moves: completed.moves, hintsUsed: completed.hintsUsed, won }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeout);
      }
      if (activeGameRef.current?.savedAt === completed.savedAt) setReward(result);
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/stats/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/achievements/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/slide-puzzle-daily-challenge/status/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: ["slide-puzzle-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments/leaderboard"] });
        window.dispatchEvent(new CustomEvent(ACHIEVEMENT_COMPLETION_EVENT, { detail: { profileId } }));
      }
    } catch (error) {
      console.error("[SlidePuzzle] Could not save completion rewards:", error);
      if (activeGameRef.current?.savedAt === completed.savedAt) {
        setReward({ points: 0, xpEarned: 0, gemsEarned: 0, won, offline: true });
        setRewardError(error instanceof Error ? error.message : "Unknown API error");
      }
    } finally {
      if (activeGameRef.current?.savedAt === completed.savedAt) setRewardLoading(false);
    }
  };

  const startGame = (level: SlidePuzzleDifficulty, style: SlidePuzzleTileStyle, theme: string | null, dailyDate?: string, seed?: number, existingGameId?: number, challengeId?: number, iconOverride?: number) => {
    sounds.click();
    const savedAt = Date.now();
    const { size } = SLIDE_PUZZLE_LEVELS[level];
    const boardSeed = seed ?? Math.floor(Math.random() * 2_147_483_647) + 1;
    const icon = style === "icons" ? (iconOverride ?? iconValue) : null;
    const iconParam = icon ? `&icon=${icon}` : "";
    const nextGame: SavedGame = {
      difficulty: level, tileStyle: style, themeId: style === "icons" ? theme : null,
      ...(icon ? { iconValue: icon } : {}),
      seed: boardSeed, size, tiles: scrambleTiles(size, boardSeed),
      moves: 0, hintsUsed: 0, elapsed: 0, savedAt,
      status: "playing", ...(dailyDate ? { dailyDate } : {}), ...(existingGameId ? { gameId: existingGameId } : {}), ...(challengeId ? { challengeId } : {}),
    };
    setGame(nextGame); setReward(null); setRewardError(null); setRewardLoading(false);
    setElapsed(0); setHintIndex(null); setChallengeResult(null);
    setLocation(dailyDate
      ? `/slide-puzzle?play=1&dailyDate=${dailyDate}&difficulty=${level}&style=${style}${theme ? `&theme=${theme}` : ""}&seed=${boardSeed}${iconParam}`
      : challengeId
        ? `/slide-puzzle?play=1&challengeId=${challengeId}&gameId=${existingGameId}&difficulty=${level}&style=${style}${theme ? `&theme=${theme}` : ""}&seed=${boardSeed}${iconParam}`
        : "/slide-puzzle?play=1");
    if (existingGameId) {
      pendingGameRef.current = { savedAt, promise: Promise.resolve(existingGameId) };
      return;
    }
    const promise = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const { id } = await customFetch<{ id: number }>("/api/slide-puzzle-games", {
          method: "POST",
          body: JSON.stringify({ profileId: profileId ?? null, difficulty: level, tileStyle: style, themeId: theme, ...(dailyDate ? { dailyDate } : {}) }),
          signal: controller.signal,
        });
        setGame((current) => current?.savedAt === savedAt ? { ...current, gameId: id } : current);
        return id;
      } catch {
        return null;
      } finally {
        window.clearTimeout(timeout);
      }
    })();
    pendingGameRef.current = { savedAt, promise };
  };

  React.useEffect(() => {
    if (query.get("start") !== "1" || directStartHandledRef.current || profileLoading) return;
    directStartHandledRef.current = true;
    const requestedDifficulty = query.get("difficulty") as SlidePuzzleDifficulty | null;
    const level = availableDifficulties.find(({ id }) => id === requestedDifficulty)?.id ?? availableDifficulties[0]?.id;
    if (!level) return;
    const requestedStyle = query.get("style");
    const style: SlidePuzzleTileStyle = requestedStyle === "alphabet" || requestedStyle === "icons" ? requestedStyle : "numbers";
    const themeParam = query.get("theme");
    const theme = themeParam && IMAGE_THEMES.some((t) => t.id === themeParam) ? themeParam : IMAGE_THEMES[0]?.id ?? "shapes";
    const dailyDate = query.get("dailyDate");
    const seedValue = Number(query.get("seed"));
    const existingGameId = Number(query.get("gameId"));
    const challengeId = Number(query.get("challengeId"));
    const iconParam = Number(query.get("icon"));
    const icon = Number.isInteger(iconParam) && iconParam >= 1 && iconParam <= 32 ? iconParam : undefined;
    setTileStyle(style);
    if (icon) setIconValue(icon);
    startGame(level, style, style === "icons" ? theme : null, dailyDate && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate) ? dailyDate : undefined, Number.isInteger(seedValue) && seedValue > 0 ? seedValue : undefined,
      Number.isInteger(existingGameId) && existingGameId > 0 ? existingGameId : undefined,
      Number.isInteger(challengeId) && challengeId > 0 ? challengeId : undefined,
      icon);
    // startGame is recreated each render; the guard ref makes this run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, profile?.gameMode, search]);

  const finishGame = React.useCallback((next: SavedGame, finalElapsed: number, won: boolean) => {
    if (won) {
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3200);
      recordSlidePuzzleCompletion(profileId, next.difficulty, next.tileStyle, finalElapsed, next.moves);
    }
    localStorage.removeItem(SAVE_KEY);
    setHasSavedGame(false);
    void completeGame(next, finalElapsed, won);
  }, [profileId]);

  const applyWin = (next: SavedGame, finalElapsed: number) => {
    const wonGame = { ...next, status: "won" as const };
    setGame(wonGame);
    finishGame(wonGame, finalElapsed, true);
  };

  const handleCell = (index: number) => {
    if (!game || game.status !== "playing") return;
    if (!slideableIndexes(game.tiles, game.size).includes(index)) { sounds.click(); return; }
    sounds.note();
    const tiles = slideTile(game.tiles, index);
    const next: SavedGame = { ...game, tiles, moves: game.moves + 1 };
    if (isSolved(tiles)) {
      sounds.complete();
      applyWin(next, elapsed);
    } else {
      setGame(next);
    }
  };

  const switchTileStyle = (style: SlidePuzzleTileStyle) => {
    if (!game || style === game.tileStyle || game.dailyDate || game.challengeId) return;
    sounds.click();
    const icon = game.iconValue ?? iconValue;
    if (style === "icons") setIconValue(icon);
    startGame(game.difficulty, style, style === "icons" ? (game.themeId ?? imageThemeId) : null,
      undefined, game.seed, undefined, undefined, icon);
  };

  const switchPicture = (picture: number) => {
    if (!game || picture === (game.iconValue ?? iconValue)) return;
    sounds.click();
    setIconValue(picture);
    startGame(game.difficulty, "icons", game.themeId ?? imageThemeId,
      undefined, game.seed, undefined, undefined, picture);
  };

  const styleSwitcher = (active: SlidePuzzleTileStyle) => {
    const pictureThemeId = game?.themeId ?? imageThemeId;
    return (
      <div className="w-full space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tile style</span>
          {SLIDE_PUZZLE_TILE_STYLES.map((s) => (
            <button key={s.id} type="button" onClick={() => switchTileStyle(s.id)} className={`min-h-8 rounded-lg border px-2.5 text-xs font-bold transition ${active === s.id ? "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300" : "border-border bg-white/60 text-muted-foreground hover:border-sky-300 dark:bg-slate-950/30"}`}>{s.label}</button>
          ))}
        </div>
        {active === "icons" && (
          <div className="mx-auto grid max-h-28 w-full max-w-md grid-cols-8 gap-1 overflow-y-auto rounded-xl border border-border/60 bg-white/40 p-1.5 dark:bg-slate-950/30">
            {Array.from({ length: getTheme(pictureThemeId).symbols.length }, (_, i) => i + 1).map((v) => (
              <button key={v} type="button" onClick={() => switchPicture(v)} title={`Picture ${v}`} aria-label={`Play with picture ${v}`} className={`flex aspect-square items-center justify-center rounded-lg transition ${v === (game?.iconValue ?? iconValue) ? "bg-sky-500/20 ring-1 ring-sky-500" : "hover:bg-sky-500/10"}`}>
                <ThemeIcon themeId={pictureThemeId} value={v} size={20} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const issueHint = () => {
    if (!game || game.status !== "playing" || game.hintsUsed >= MAX_HINTS) return;
    const index = hintTileIndex(game.tiles, game.size);
    if (index < 0) return;
    sounds.place();
    setHintIndex(index);
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => setHintIndex(null), 2600);
    setGame({ ...game, hintsUsed: game.hintsUsed + 1 });
  };

  const shareResult = async () => {
    if (!game) return;
    const url = appShareUrlForPath("/slide-puzzle");
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const rewardLine = reward && !reward.offline && reward.won !== false
      ? `+${reward.points.toLocaleString()} pts · +${reward.xpEarned} XP · +${reward.gemsEarned} 💎`
      : null;
    const lines = [
      `🧩 Solved the ${SLIDE_PUZZLE_LEVELS[game.difficulty].label} slide puzzle in ${fmt(elapsed)} with ${game.moves} moves!`,
      rewardLine,
      rank ? `🏅 ${rank} · Play Brain Games . Online` : "🧠 Play Brain Games . Online",
      `🔗 ${url}`,
    ].filter((line): line is string => Boolean(line));
    try {
      const result = await shareOrDownloadShareCard({
        title: "Slide Puzzle result",
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: "#0284c7",
        filename: "slide-puzzle-result.png",
      });
      if (result === "downloaded") toast.success("Result image downloaded — attach it to your message!", { duration: 3000 });
    } catch {
      try {
        await navigator.clipboard.writeText(lines.join("\n"));
        toast.success("Sharing didn't complete. Text copied — paste it into your message.", { duration: 3500 });
      } catch { /* silent */ }
    }
  };
  const fmt = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  React.useEffect(() => {
    if (!game || game.status !== "playing" || !game.challengeId) { setChallengeResult(null); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const detail = await customFetch<SlidePuzzleChallengeResult>(`/api/slide-puzzle-challenges/${game.challengeId}`);
        if (cancelled) return;
        setChallengeResult(detail);
        if (detail.status !== "completed") timer = setTimeout(refresh, 5000);
      } catch { if (!cancelled) timer = setTimeout(refresh, 5000); }
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [game?.status, game?.challengeId]);

  if (game && game.status !== "playing") {
    const won = game.status === "won";
    return <main className="mx-auto w-full max-w-lg space-y-4 px-3 py-5 sm:px-6 sm:py-8">
      {showConfetti && <Confetti />}
      <section className={`relative isolate overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-center text-white shadow-xl sm:p-6 ${won ? "from-sky-600 via-cyan-600 to-blue-500 shadow-sky-500/20" : "from-slate-600 via-slate-700 to-slate-800 shadow-slate-500/20"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/15" />
        <div className="relative z-10 space-y-2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/20 text-3xl">{won ? "🎉" : "🧩"}</div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75">{game.dailyDate ? "Daily Slide Puzzle" : "Slide Puzzle"} {won ? "complete" : "finished"}</p>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">{won ? "Order restored!" : "Puzzle left unfinished"}</h1>
          <p className="text-sm text-white/85">{SLIDE_PUZZLE_LEVELS[game.difficulty].label} · {game.size}×{game.size} · {STYLE_LABELS[game.tileStyle]} tiles · {game.moves} moves · {fmt(elapsed)}</p>
          {game.dailyDate && <p className="text-sm font-semibold text-white/90">📅 Today&apos;s shared daily puzzle</p>}
          {won && reward?.isPersonalBest && <p className="pt-1 text-sm font-bold text-amber-100">🏆 New personal best!</p>}
          {game.challengeId && <p className="pt-1 text-sm font-bold text-white">⚔️ Challenge score submitted</p>}
          <Button variant="secondary" className="mt-2 gap-2" onClick={() => void shareResult()}><Share2 className="h-4 w-4"/> Share your result</Button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        {game.challengeId
          ? <Button className="w-full gap-2" onClick={() => setLocation("/challenges?tab=slide-puzzle")}><Trophy className="h-4 w-4"/> Return to Slide Puzzle challenge</Button>
          : <Button className="w-full gap-2" onClick={() => startGame(game.difficulty, game.tileStyle, game.themeId, game.dailyDate, game.seed, undefined, undefined, game.iconValue)}><RotateCcw className="h-4 w-4"/> Play again · {SLIDE_PUZZLE_LEVELS[game.difficulty].label}</Button>}
        {!game.dailyDate && !game.challengeId && <div className="pt-1">{styleSwitcher(game.tileStyle)}</div>}
        <div className="grid grid-cols-2 gap-2">
          {availableDifficulties.map(({ id }) => {
            const level = SLIDE_PUZZLE_LEVELS[id];
            const active = id === game.difficulty;
            return <button key={id} type="button" onClick={() => startGame(id, game.tileStyle, game.themeId, undefined, undefined, undefined, undefined, game.iconValue)} className={`min-h-14 rounded-xl border-2 px-3 py-2 text-left transition ${active ? "border-sky-500 bg-sky-50 dark:bg-sky-950/30" : "border-border hover:border-sky-300 hover:bg-sky-50/60 dark:hover:bg-sky-950/20"}`}>
              <span className="block text-sm font-bold">{level.label}{active ? " · Current" : ""}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{level.size}×{level.size} · {level.tiles} tiles</span>
            </button>;
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setGame(null)}><LayoutGrid className="h-4 w-4"/> Game home</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/leaderboard/slide-puzzle")}><Trophy className="h-4 w-4"/> Leaderboard</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/profile?tab=slide-puzzle")}><Grid3x3 className="h-4 w-4"/> My stats</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/")}><Home className="h-4 w-4"/> Portal</Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Timer, label: "Time", value: fmt(elapsed) },
          { icon: Grid3x3, label: "Board", value: SLIDE_PUZZLE_LEVELS[game.difficulty].label },
          { icon: MousePointerClick, label: "Moves", value: String(game.moves) },
          { icon: Lightbulb, label: "Hints used", value: String(game.hintsUsed) },
        ].map(({ icon: Icon, label, value }) => <div key={label} className="space-y-1 rounded-xl border bg-card p-3 text-center sm:p-4"><Icon className="mx-auto h-4 w-4 text-sky-600"/><p className="text-base font-black tabular-nums sm:text-lg">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>)}
      </div>

      {won && <section className="rounded-2xl border-2 border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30">
        {rewardLoading ? <div className="py-2 text-center text-sm font-semibold text-muted-foreground">Calculating your score and rewards…</div> : reward?.offline ? <div className="py-2 text-center"><p className="font-semibold text-amber-900 dark:text-amber-200">Rewards could not be saved</p><p className="mt-1 text-xs text-muted-foreground">{rewardError || "The game server could not save this result."}</p></div> : reward ? <><div className="grid grid-cols-3 items-center gap-2 text-center">
          <div><p className="text-2xl font-black text-amber-800 dark:text-amber-200">{reward.points.toLocaleString()}</p><p className="text-xs font-semibold text-muted-foreground">Points</p></div>
          <div className="border-x border-amber-300/70 px-2 dark:border-amber-700/60"><p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">+{reward.xpEarned}</p><p className="text-xs font-semibold text-muted-foreground">XP</p></div>
          <div><p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">+{reward.gemsEarned} 💎</p><p className="text-xs font-semibold text-muted-foreground">Gems</p></div>
        </div><p className="col-span-3 mt-2 text-[11px] text-muted-foreground">Score reflects board size, completion time, move efficiency, and hints used.</p></> : <div className="py-2 text-center text-sm text-muted-foreground">Your rewards are being prepared.</div>}
      </section>}

      {game.challengeId && <section className="rounded-xl border border-sky-200 bg-card p-4 text-center dark:border-sky-800" aria-live="polite">
        <h2 className="font-bold">Challenge result</h2>
        {!challengeResult || challengeResult.status !== "completed" ? <p className="mt-1 text-sm text-muted-foreground">You finished in {fmt(elapsed)} and earned {reward?.points?.toLocaleString() ?? "…"} points. Waiting for your opponent to finish…</p> : (() => {
          const mine = challengeResult.challengerId === profileId ? challengeResult.challengerPoints : challengeResult.challengedPoints;
          const theirs = challengeResult.challengerId === profileId ? challengeResult.challengedPoints : challengeResult.challengerPoints;
          const opponent = challengeResult.challengerId === profileId ? challengeResult.challengedUsername : challengeResult.challengerUsername;
          const outcome = challengeResult.winnerId === null ? "It’s a tie!" : challengeResult.winnerId === profileId ? "You won the challenge!" : "You lost the challenge.";
          return <><p className="mt-1 text-lg font-black">{outcome}</p><p className="mt-1 text-sm text-muted-foreground">You: {mine ?? 0} points · {opponent}: {theirs ?? 0} points</p><p className="mt-1 text-xs text-muted-foreground">Completed in {fmt(elapsed)} · {challengeResult.winnerId === null ? "Both players earned 2 bonus gems." : challengeResult.winnerId === profileId ? "You earned 10 bonus gems." : `${opponent} earned 10 bonus gems.`}</p></>;
        })()}
      </section>}
    </main>;
  }

  const solvedPreview = createSolvedTiles(3);
  const slideableSet = game ? new Set(slideableIndexes(game.tiles, game.size)) : new Set<number>();

  return <main className={`mx-auto w-full px-3 py-5 sm:px-6 sm:py-8 ${game ? "max-w-3xl" : "max-w-lg"}`}>
    {showConfetti && <Confetti />}
    <div className="relative isolate mb-4 flex items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-cyan-100 px-4 py-3 shadow-lg shadow-sky-500/10 dark:border-sky-800/60 dark:from-sky-950/60 dark:via-card dark:to-cyan-950/60">
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-cyan-300/30 blur-2xl dark:bg-cyan-400/15" />
      <Button variant="ghost" size="sm" className="relative z-10 shrink-0 px-1" onClick={() => (game ? setGame(null) : setLocation("/"))}><ArrowLeft className="mr-1 h-4 w-4"/> {game ? "Back" : "Home"}</Button>
      <div className="relative z-10 min-w-0 text-right">
        <h1 className="font-serif text-xl font-bold leading-tight tracking-tight sm:text-3xl">Slide Puzzle</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{profile?.username ? `Welcome back, ${profile.username}` : "Slide every tile back into place"}</p>
      </div>
      <Button variant="ghost" size="icon" className="relative z-10 shrink-0" aria-label={sounds.enabled ? "Mute sounds" : "Enable sounds"} onClick={sounds.toggle}>{sounds.enabled ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}</Button>
    </div>
    <div className={`grid gap-5 ${game ? "" : "grid-cols-1"}`}>
      <section className="min-w-0 space-y-4">
        {!game ? <>
          {hasSavedGame && <button onClick={() => setLocation("/slide-puzzle?resume=1")} className="flex w-full items-center gap-3 rounded-xl border-2 border-sky-300/60 bg-card px-4 py-3 text-left transition hover:bg-sky-50 dark:border-sky-800/50 dark:hover:bg-sky-950/30"><RotateCcw className="h-4 w-4 shrink-0 text-sky-600"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-sky-700 dark:text-sky-300">Resume Slide Puzzle</span><span className="block text-xs text-muted-foreground">Pick up where you left off</span></span><span className="text-lg text-sky-600">→</span></button>}
          <div className="relative isolate overflow-hidden rounded-2xl border-2 border-sky-200/80 bg-gradient-to-br from-white via-sky-50 to-cyan-50 p-4 shadow-xl shadow-sky-500/10 dark:border-sky-800/50 dark:from-card dark:via-sky-950/35 dark:to-cyan-950/40 sm:p-5">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-cyan-300/25 blur-2xl dark:bg-cyan-400/10" />
            <div className="relative z-10 mb-4 flex items-center gap-3 rounded-xl border border-sky-200/70 bg-white/65 px-3 py-3 dark:border-sky-800/50 dark:bg-slate-950/20">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-2xl">🧩</span>
              <div className="min-w-0 flex-1"><h2 className="font-serif text-lg font-bold">Ready to slide?</h2><p className="text-xs leading-relaxed text-muted-foreground">Tap a tile next to the gap to slide it. Restore tiles 1 through {SLIDE_PUZZLE_LEVELS["3x3"].tiles} in order to solve the board.</p></div>
              <div className="hidden grid-cols-3 gap-1 rounded-lg border border-sky-200/70 bg-white/70 p-1 sm:grid dark:border-sky-800/50 dark:bg-slate-950/30">{solvedPreview.map((value, i) => <span key={i} className={`grid h-5 w-5 place-items-center rounded text-[9px] font-black ${value === 0 ? "bg-sky-200/60 text-sky-400" : "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200"}`}>{value === 0 ? "·" : value}</span>)}</div>
            </div>
            <p className="relative z-10 mb-2.5 text-xs font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-300">Choose Board Size</p>
            <div className="relative z-10 grid grid-cols-2 gap-2.5">
              {availableDifficulties.map((item) => {
                const meta = { "2x2": "🧸", "3x3": "🌱", "4x4": "🧭", "5x5": "🔥" }[item.id];
                const level = SLIDE_PUZZLE_LEVELS[item.id];
                return <button key={item.id} onClick={() => startGame(item.id, tileStyle, tileStyle === "icons" ? imageThemeId : null)} className="group flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-200/80 bg-gradient-to-br from-sky-50 to-cyan-50 p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md active:scale-[0.98] dark:border-sky-800/60 dark:from-sky-950/45 dark:to-cyan-950/40">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500/10 text-xl group-hover:bg-sky-500/20">{meta}</span>
                  <span className="text-sm font-bold leading-tight">{level.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{item.detail}</span>
                </button>;
              })}
            </div>
            <div className="relative z-10 mt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-300">Tile Style</p>
              <div className="grid grid-cols-3 gap-1.5">
                {SLIDE_PUZZLE_TILE_STYLES.map((style) => (
                  <button key={style.id} onClick={() => setTileStyle(style.id)} className={`min-h-10 rounded-xl border px-2 text-xs font-bold transition ${tileStyle === style.id ? "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300" : "border-border bg-white/60 text-muted-foreground hover:border-sky-300 dark:bg-slate-950/30"}`}>{style.label}</button>
                ))}
              </div>
              {tileStyle === "icons" && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-300">Choose picture · {getTheme(imageThemeId).name}</p>
                  <div className="grid max-h-32 grid-cols-8 gap-1 overflow-y-auto rounded-xl border border-border/60 bg-white/40 p-1.5 dark:bg-slate-950/30">
                    {Array.from({ length: getTheme(imageThemeId).symbols.length }, (_, i) => i + 1).map((v) => (
                      <button key={v} onClick={() => setIconValue(v)} title={`Picture ${v}`} className={`flex aspect-square items-center justify-center rounded-lg transition ${iconValue === v ? "bg-sky-500/20 ring-1 ring-sky-500" : "hover:bg-sky-500/10"}`}>
                        <ThemeIcon themeId={imageThemeId} value={v} size={20} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setLocation("/profile?tab=slide-puzzle")} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition hover:border-sky-300 hover:bg-muted/50"><Grid3x3 className="h-5 w-5 shrink-0 text-sky-600"/><span><span className="block text-sm font-semibold">My Stats</span><span className="hidden text-xs text-muted-foreground sm:block">Best times & progress</span></span></button>
            <button onClick={() => setLocation("/leaderboard/slide-puzzle")} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition hover:border-sky-300 hover:bg-muted/50"><Trophy className="h-5 w-5 shrink-0 text-sky-600"/><span><span className="block text-sm font-semibold">Leaderboard</span><span className="hidden text-xs text-muted-foreground sm:block">Top solvers</span></span></button>
          </div>
          <button onClick={() => setLocation("/slide-puzzle-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/60 px-4 py-3 text-left transition hover:bg-orange-50 dark:border-orange-800/40 dark:bg-orange-950/20 dark:hover:bg-orange-950/30">
            <span className="text-lg leading-none">🔥</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Daily Slide Puzzle</span><span className="block text-xs text-muted-foreground">One shared board for everyone each day</span></span>
            <span className="text-orange-500">→</span>
          </button>
          {/* Info links */}
          <div className="home-info-links flex items-center justify-center gap-6 rounded-xl border border-border bg-card px-4 py-2.5">
            <button onClick={() => setInfoModal("rules")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><BookOpen className="h-3.5 w-3.5" /> Rules</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("controls")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Keyboard className="h-3.5 w-3.5" /> Controls</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("backstory")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Scroll className="h-3.5 w-3.5" /> Backstory</button>
          </div>

          <MobileContentDisclosure
            id="slide-puzzle-guidance"
            title="More Slide Puzzle guidance"
            className="rounded-2xl border border-sky-400/25 bg-card p-5 sm:p-6"
          >
            <section className="space-y-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">How to play and improve at Slide Puzzle</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  One tile is missing — the gap. Slide any tile touching the gap
                  into it, one move at a time, until every tile sits in order
                  from top-left to bottom-right.
                </p>
              </div>
              <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                <article>
                  <h3 className="font-semibold text-foreground">Work row by row</h3>
                  <p className="mt-1">Place tile 1, then 2, then 3… Lock each finished row in place mentally and never disturb it again. On bigger boards, solve the top rows first and the bottom-right corner sorts itself out.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Use the hint sparingly</h3>
                  <p className="mt-1">Stuck? The hint highlights the tile that most improves the board. You get {MAX_HINTS} hints per game — each one trims your score, so save them for real dead ends.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Pick a board that fits</h3>
                  <p className="mt-1">2×2 and 3×3 are quick warm-ups for Kids mode. 4×4 and 5×5 are genuine challenges for Adult mode — the 5×5 can take a while, so patience pays off.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Understand your score</h3>
                  <p className="mt-1">Points, XP, and gems reflect the board size, your completion time, move efficiency, and hints used — faster, cleaner solves earn more. Only wins score — daily challenges give everyone the same scramble, and head-to-head challenges compare points.</p>
                </article>
              </div>
            </section>
          </MobileContentDisclosure>

          {/* Rules modal */}
          <Dialog open={infoModal === "rules"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-sky-600" /> Rules</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>The board starts scrambled with one empty gap. Slide tiles into the gap to restore order.</p>
                <ul className="list-none space-y-2">
                  {[
                    "Choose a board size — 2×2, 3×3, 4×4, or 5×5.",
                    "Pick a tile style — numbers, alphabet letters, or pictures.",
                    "Tap or click a tile next to the gap to slide it one space.",
                    "Arrange every tile in order — 1 to the last tile, gap at the end.",
                    "Finish fast with few moves and no hints for the best score.",
                  ].map((rule, index) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-700 dark:text-sky-300">{index + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-1">Points, XP, and 💎 gems are based on the board size, completion time, move efficiency, and hints used — faster, cleaner solves earn more of each. Only wins award rewards.</p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Controls modal */}
          <Dialog open={infoModal === "controls"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Keyboard className="h-5 w-5 text-sky-600" /> Controls</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-2 font-semibold text-foreground">Mouse / Touch</p>
                  <div className="space-y-1.5 text-muted-foreground">
                    {[
                      ["Tap / click a tile beside the gap", "Slide it into the empty space"],
                      ["Tap a tile not beside the gap", "Nothing happens — only neighbours slide"],
                      ["Hint button", "Highlight the best next move (3 per game)"],
                      ["New game button", "Back to the board picker"],
                    ].map(([action, result]) => (
                      <div key={action} className="flex justify-between gap-4">
                        <span>{action}</span>
                        <span className="text-right font-medium text-foreground">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="mb-2 font-semibold text-foreground">Scoring</p>
                  <div className="space-y-1.5 text-muted-foreground">
                    {[
                      ["Board size", "Bigger boards award more points"],
                      ["Time", "Faster solves earn a bonus"],
                      ["Moves", "Staying near the par move count scores best"],
                      ["Hints", "Each hint reduces the score"],
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
          <Dialog open={infoModal === "backstory"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto overscroll-contain">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Scroll className="h-5 w-5 text-sky-600" /> Backstory</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  The sliding tile puzzle traces back to the 1874 "15 Puzzle" —
                  a numbered square invented by Noyes Palmer Chapman. Fifteen
                  numbered tiles plus one blank had to be slid back into order,
                  and it became an instant worldwide craze.
                </p>
                <p>
                  Chapman later proved that half of all possible arrangements
                  were impossible — a discovery that quietly founded an entire
                  branch of group theory. Today the same mechanic lives on as
                  the iconic 15-puzzle app, countless clones, and speedrun
                  communities.
                </p>
                <p>
                  This Slide Puzzle keeps that classic ordering challenge and
                  adds four board sizes, three tile styles — numbers, letters,
                  and pictures — plus daily challenges and head-to-head
                  challenges against friends.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </> : <section className="rounded-3xl border border-border bg-card p-3 shadow-sm sm:p-5">
          {/* Top controls — single line */}
          <div className="mb-3 flex flex-nowrap items-center gap-1 rounded-xl border border-border bg-muted/40 px-2 py-1.5 text-xs sm:gap-2 sm:px-3">
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><MousePointerClick className="h-3.5 w-3.5 text-sky-600"/>{game.moves} moves</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Clock3 className="h-3.5 w-3.5 text-sky-600"/>{fmt(elapsed)}</span>
            <Button variant="outline" size="sm" className="ml-auto h-8 shrink-0 gap-1 px-2" onClick={issueHint} disabled={game.hintsUsed >= MAX_HINTS} aria-label={`Hint, ${MAX_HINTS - game.hintsUsed} left`}><Lightbulb className="h-4 w-4"/> <span className="hidden sm:inline">Hint ({MAX_HINTS - game.hintsUsed})</span><span className="sm:hidden">{MAX_HINTS - game.hintsUsed}</span></Button>
            <Button variant="ghost" size="sm" className="h-8 shrink-0 gap-1 px-2" onClick={() => startGame(game.difficulty, game.tileStyle, game.themeId, undefined, undefined, undefined, undefined, game.iconValue)} aria-label="Restart"><RotateCcw className="h-4 w-4"/><span className="hidden sm:inline">Restart</span></Button>
          </div>

          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="font-bold">{SLIDE_PUZZLE_LEVELS[game.difficulty].label} board · {STYLE_LABELS[game.tileStyle]}</h2><p className="mt-0.5 text-xs text-muted-foreground">{game.size}×{game.size} · {game.tiles.filter((t) => t !== 0).length} tiles · slide tiles beside the gap</p></div>
            {!game.dailyDate && !game.challengeId && styleSwitcher(game.tileStyle)}
          </div>

          <div className="mx-auto w-full max-w-[560px] rounded-2xl bg-gradient-to-br from-sky-300 via-cyan-300 to-blue-300 p-1.5 shadow-lg shadow-sky-500/15 dark:from-sky-800 dark:via-cyan-800 dark:to-blue-800">
            <div
              className="select-none touch-none overflow-hidden rounded-xl border border-white/70 bg-white/70 dark:border-slate-700 dark:bg-slate-950/70"
              style={{ display: "grid", gridTemplateColumns: `repeat(${game.size}, minmax(0, 1fr))`, containerType: "inline-size" }}
            >
              {game.tiles.map((value, index) => {
                const isBlank = value === 0;
                const slideable = !isBlank && slideableSet.has(index);
                const label = isBlank || game.tileStyle === "icons" ? null : tileLabel(value, game.tileStyle);
                let content: React.ReactNode = "";
                if (!isBlank) {
                  if (game.tileStyle === "icons" && game.themeId) {
                    if (puzzleImageSrc) {
                      const piece = value - 1;
                      const pieceRow = Math.floor(piece / game.size);
                      const pieceCol = piece % game.size;
                      content = (
                        <span className="relative block h-full w-full overflow-hidden" aria-hidden="true">
                          <img
                            src={puzzleImageSrc}
                            alt=""
                            draggable={false}
                            className="absolute left-0 top-0"
                            style={{
                              width: `${game.size * 100}%`,
                              height: `${game.size * 100}%`,
                              objectFit: "cover",
                              transform: `translate(${-pieceCol * (100 / game.size)}%, ${-pieceRow * (100 / game.size)}%)`,
                            }}
                          />
                        </span>
                      );
                    } else {
                      content = <ThemeIcon themeId={game.themeId} value={value} size={Math.max(18, Math.floor(52 / game.size) * 4)} />;
                    }
                  } else {
                    content = label;
                  }
                }
                return <button
                  key={index}
                  data-cell={index}
                  type="button"
                  aria-label={isBlank ? `Row ${Math.floor(index / game.size) + 1}, column ${index % game.size + 1}, empty gap` : `Row ${Math.floor(index / game.size) + 1}, column ${index % game.size + 1}, tile ${value}`}
                  onClick={() => handleCell(index)}
                  className={`flex aspect-square min-w-0 items-center justify-center border-[0.5px] transition-colors ${isBlank
                    ? "bg-sky-100/60 dark:bg-slate-900/60"
                    : slideable
                      ? "cursor-pointer bg-white font-black text-sky-800 shadow-sm hover:bg-sky-50 active:bg-sky-100 dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700"
                      : "bg-slate-50 font-black text-slate-400 dark:bg-slate-900/50 dark:text-slate-500"} ${hintIndex === index ? "ring-2 ring-inset ring-amber-400" : ""}`}
                  style={!isBlank && game.tileStyle !== "icons" ? { fontSize: `clamp(14px, ${((label?.length ?? 1) > 1 ? 44 : 60) / game.size}cqw, 170px)` } : undefined}
                >{content}</button>;
              })}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{game.moves} moves · {game.hintsUsed}/{MAX_HINTS} hints · par ≈ {SLIDE_PUZZLE_LEVELS[game.difficulty].parMoves} moves</span>
          </div>
        </section>}
      </section>
    </div>
  </main>;
}
