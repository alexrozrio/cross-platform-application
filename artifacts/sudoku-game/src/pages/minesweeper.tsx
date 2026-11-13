import React from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, BookOpen, Bomb, Clock3, Flag, Home, Keyboard, LayoutGrid, Lightbulb, RotateCcw, Scroll, Share2, Timer, Trophy, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
import { chordFrom, computeCounts, createMinefield, MAX_HINTS, MAX_MISTAKES, MINESWEEPER_LEVELS, revealFrom, type MinesweeperDifficulty } from "@/lib/minesweeper";
import { recordMinesweeperCompletion } from "@/lib/minesweeper-stats";
import { Button } from "@/components/ui/button";

const SAVE_KEY = "brain-games-minesweeper-session";
const DIFFICULTIES: { id: MinesweeperDifficulty; detail: string }[] = [
  { id: "beginner", detail: "6 × 6 · 5 mines" },
  { id: "easy", detail: "8 × 8 · 12 mines" },
  { id: "medium", detail: "12 × 12 · 24 mines" },
  { id: "hard", detail: "14 × 14 · 34 mines" },
];
const NUMBER_COLORS = ["", "text-sky-600 dark:text-sky-400", "text-emerald-600 dark:text-emerald-400", "text-rose-600 dark:text-rose-400", "text-violet-600 dark:text-violet-400", "text-amber-700 dark:text-amber-400", "text-teal-600 dark:text-teal-400", "text-slate-800 dark:text-slate-200", "text-slate-500 dark:text-slate-400"];

type SavedGame = {
  difficulty: MinesweeperDifficulty;
  seed: number;
  size: number;
  mines: boolean[];
  counts: number[];
  revealed: boolean[];
  flagged: boolean[];
  revealedCount: number;
  mistakes: number;
  hintsUsed: number;
  elapsed: number;
  savedAt: number;
  status: "playing" | "won" | "lost";
  gameId?: number;
  dailyDate?: string;
  challengeId?: number;
};
type MinesweeperReward = { points: number; xpEarned: number; gemsEarned: number; won?: boolean; isPersonalBest?: boolean; offline?: boolean };
type MinesweeperChallengeResult = { id: number; status: string; challengerId: number; challengedId: number; winnerId: number | null; challengerUsername: string; challengedUsername: string; challengerPoints: number | null; challengedPoints: number | null; challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null };

function loadSaved(): SavedGame | null {
  try {
    const value = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as SavedGame | null;
    if (value && ["beginner", "easy", "medium", "hard"].includes(value.difficulty) && Array.isArray(value.mines) && Array.isArray(value.revealed) && value.size > 0) {
      value.mistakes = Number.isFinite(value.mistakes) ? value.mistakes : 0;
      value.hintsUsed = Number.isFinite(value.hintsUsed) ? Math.min(MAX_HINTS, value.hintsUsed) : 0;
      value.revealedCount = Number.isFinite(value.revealedCount) ? value.revealedCount : 0;
      value.status = value.status === "won" || value.status === "lost" ? value.status : "playing";
      return value;
    }
  } catch { /* Ignore an unavailable or invalid save. */ }
  return null;
}

export default function MinesweeperPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const query = new URLSearchParams(search);
  const { profileId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId as number);
  const queryClient = useQueryClient();
  const sounds = useSound(profile?.soundEnabled);
  const gameMode = profile?.gameMode ?? "4all";
  const availableDifficulties = DIFFICULTIES.filter(({ id }) =>
    gameMode === "children" ? MINESWEEPER_LEVELS[id].mode === "baby" :
      gameMode === "adult" ? MINESWEEPER_LEVELS[id].mode === "adult" : true,
  );
  const [game, setGame] = React.useState<SavedGame | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [flagMode, setFlagMode] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [hasSavedGame, setHasSavedGame] = React.useState(false);
  const [reward, setReward] = React.useState<MinesweeperReward | null>(null);
  const [rewardLoading, setRewardLoading] = React.useState(false);
  const [rewardError, setRewardError] = React.useState<string | null>(null);
  const [challengeResult, setChallengeResult] = React.useState<MinesweeperChallengeResult | null>(null);
  const [infoModal, setInfoModal] = React.useState<"rules" | "controls" | "backstory" | null>(null);
  const activeGameRef = React.useRef(game);
  activeGameRef.current = game;
  const pendingGameRef = React.useRef<{ savedAt: number; promise: Promise<number | null> } | null>(null);
  const directStartHandledRef = React.useRef(false);

  usePageMeta({
    title: "Minesweeper Game | Play Brain Games",
    description: "Clear the minefield in four board sizes from Beginner to Hard. Play free Minesweeper puzzles.",
    path: "/minesweeper",
  });

  React.useEffect(() => {
    const saved = loadSaved();
    setHasSavedGame(Boolean(saved));
    if (query.get("resume") === "1" && saved) {
      setGame(saved); setElapsed(saved.elapsed);
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

  const completeGame = async (completed: SavedGame, finalElapsed: number, won: boolean) => {
    setRewardLoading(true);
    setRewardError(null);
    try {
      const pending = pendingGameRef.current;
      let gameId = completed.gameId ?? (pending?.savedAt === completed.savedAt ? await pending.promise : null);
      // Like Word Search, recover if the game-create request failed or the
      // player finished before it returned. This lets a finished game still
      // use the server's normal points, XP, and gems calculation.
      if (!gameId && profileId && navigator.onLine !== false) {
        const createController = new AbortController();
        const createTimeout = window.setTimeout(() => createController.abort(), 5000);
        try {
          const created = await customFetch<{ id: number }>("/api/minesweeper-games", {
            method: "POST",
            body: JSON.stringify({
              profileId,
              difficulty: completed.difficulty,
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
      let result: MinesweeperReward;
      try {
        result = await customFetch<MinesweeperReward>(`/api/minesweeper-games/${gameId}/complete`, {
          method: "POST",
          body: JSON.stringify({ elapsedSeconds: finalElapsed, mistakes: completed.mistakes, hintsUsed: completed.hintsUsed, won }),
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
        queryClient.invalidateQueries({ queryKey: [`/api/minesweeper-daily-challenge/status/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: ["minesweeper-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments/leaderboard"] });
        window.dispatchEvent(new CustomEvent(ACHIEVEMENT_COMPLETION_EVENT, { detail: { profileId } }));
      }
    } catch (error) {
      console.error("[Minesweeper] Could not save completion rewards:", error);
      if (activeGameRef.current?.savedAt === completed.savedAt) {
        setReward({ points: 0, xpEarned: 0, gemsEarned: 0, won, offline: true });
        setRewardError(error instanceof Error ? error.message : "Unknown API error");
      }
    } finally {
      if (activeGameRef.current?.savedAt === completed.savedAt) setRewardLoading(false);
    }
  };

  const startGame = (level: MinesweeperDifficulty, dailyDate?: string, seed?: number, existingGameId?: number, challengeId?: number) => {
    sounds.click();
    const savedAt = Date.now();
    const { size, mines: mineCount } = MINESWEEPER_LEVELS[level];
    const boardSeed = seed ?? Math.floor(Math.random() * 2_147_483_647) + 1;
    const mines = createMinefield(size, mineCount, boardSeed);
    const nextGame: SavedGame = {
      difficulty: level, seed: boardSeed, size, mines, counts: computeCounts(mines, size),
      revealed: new Array<boolean>(size * size).fill(false), flagged: new Array<boolean>(size * size).fill(false),
      revealedCount: 0, mistakes: 0, hintsUsed: 0, elapsed: 0, savedAt,
      status: "playing", ...(dailyDate ? { dailyDate } : {}), ...(existingGameId ? { gameId: existingGameId } : {}), ...(challengeId ? { challengeId } : {}),
    };
    setGame(nextGame); setReward(null); setRewardError(null); setRewardLoading(false);
    setElapsed(0); setFlagMode(false); setChallengeResult(null);
    setLocation(dailyDate ? `/minesweeper?play=1&dailyDate=${dailyDate}&difficulty=${level}&seed=${boardSeed}` : challengeId ? `/minesweeper?play=1&challengeId=${challengeId}&gameId=${existingGameId}&difficulty=${level}&seed=${boardSeed}` : "/minesweeper?play=1");
    if (existingGameId) {
      pendingGameRef.current = { savedAt, promise: Promise.resolve(existingGameId) };
      return;
    }
    const promise = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const { id } = await customFetch<{ id: number }>("/api/minesweeper-games", {
          method: "POST",
          body: JSON.stringify({ profileId: profileId ?? null, difficulty: level, ...(dailyDate ? { dailyDate } : {}) }),
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
    const requestedDifficulty = query.get("difficulty") as MinesweeperDifficulty | null;
    const level = availableDifficulties.find(({ id }) => id === requestedDifficulty)?.id ?? availableDifficulties[0]?.id;
    if (!level) return;
    const dailyDate = query.get("dailyDate");
    const seedValue = Number(query.get("seed"));
    const existingGameId = Number(query.get("gameId"));
    const challengeId = Number(query.get("challengeId"));
    startGame(level, dailyDate && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate) ? dailyDate : undefined, Number.isInteger(seedValue) && seedValue > 0 ? seedValue : undefined,
      Number.isInteger(existingGameId) && existingGameId > 0 ? existingGameId : undefined,
      Number.isInteger(challengeId) && challengeId > 0 ? challengeId : undefined);
    // startGame is recreated each render; the guard ref makes this run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, profile?.gameMode, search]);

  const finishGame = React.useCallback((next: SavedGame, finalElapsed: number, won: boolean) => {
    if (won) {
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3200);
      recordMinesweeperCompletion(profileId, next.difficulty, finalElapsed, next.mistakes);
    }
    localStorage.removeItem(SAVE_KEY);
    setHasSavedGame(false);
    void completeGame(next, finalElapsed, won);
  }, [profileId]);

  const applyAction = (next: SavedGame) => {
    const totalSafe = next.size * next.size - next.mines.filter(Boolean).length;
    if (next.mistakes >= MAX_MISTAKES && next.status === "playing") {
      sounds.gameover();
      const lostGame = { ...next, status: "lost" as const };
      setGame(lostGame);
      finishGame(lostGame, elapsed, false);
    } else if (next.revealedCount >= totalSafe && next.status === "playing") {
      sounds.complete();
      const wonGame = { ...next, status: "won" as const };
      setGame(wonGame);
      finishGame(wonGame, elapsed, true);
    } else {
      setGame(next);
    }
  };

  const handleCell = (index: number) => {
    if (!game || game.status !== "playing") return;
    if (flagMode) { toggleFlag(index); return; }
    const revealed = [...game.revealed];
    const flagged = [...game.flagged];
    const wasRevealed = revealed[index];
    const result = wasRevealed
      ? chordFrom(index, game.mines, game.counts, game.size, revealed, flagged)
      : revealFrom(index, game.mines, game.counts, game.size, revealed, flagged);
    if (!result.revealed.length) { sounds.click(); return; }
    const safeNew = result.revealed.filter((i) => !game.mines[i]).length;
    const next: SavedGame = {
      ...game,
      revealed, flagged,
      revealedCount: game.revealedCount + safeNew,
      mistakes: game.mistakes + (result.hitMine ? 1 : 0),
    };
    if (result.hitMine) sounds.error(); else sounds.note();
    applyAction(next);
  };

  const toggleFlag = (index: number) => {
    if (!game || game.status !== "playing" || game.revealed[index]) return;
    const flagged = [...game.flagged];
    flagged[index] = !flagged[index];
    sounds.click();
    setGame({ ...game, flagged });
  };

  const issueHint = () => {
    if (!game || game.status !== "playing" || game.hintsUsed >= MAX_HINTS) return;
    const candidates: number[] = [];
    for (let i = 0; i < game.size * game.size; i++) {
      if (!game.revealed[i] && !game.flagged[i] && !game.mines[i]) candidates.push(i);
    }
    if (!candidates.length) return;
    const index = candidates[Math.floor(Math.random() * candidates.length)];
    const revealed = [...game.revealed];
    const flagged = [...game.flagged];
    const result = revealFrom(index, game.mines, game.counts, game.size, revealed, flagged);
    const safeNew = result.revealed.filter((i) => !game.mines[i]).length;
    sounds.place();
    applyAction({ ...game, revealed, flagged, revealedCount: game.revealedCount + safeNew, hintsUsed: game.hintsUsed + 1 });
  };

  const shareResult = async () => {
    if (!game) return;
    const url = appShareUrlForPath("/minesweeper");
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const rewardLine = reward && !reward.offline && reward.won !== false
      ? `+${reward.points.toLocaleString()} pts · +${reward.xpEarned} XP · +${reward.gemsEarned} 💎`
      : null;
    const lines = [
      game.status === "won"
        ? `💥 Cleared the ${MINESWEEPER_LEVELS[game.difficulty].label} minefield in ${fmt(elapsed)} with ${game.mistakes} mistake${game.mistakes === 1 ? "" : "s"}!`
        : `💣 Got caught in the ${MINESWEEPER_LEVELS[game.difficulty].label} minefield — ${game.mistakes} mines hit.`,
      rewardLine,
      rank ? `🏅 ${rank} · Play Brain Games . Online` : "🧠 Play Brain Games . Online",
      `🔗 ${url}`,
    ].filter((line): line is string => Boolean(line));
    try {
      const result = await shareOrDownloadShareCard({
        title: "Minesweeper result",
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: "#059669",
        filename: "minesweeper-result.png",
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
    if (!game || game.status === "playing" || !game.challengeId) { setChallengeResult(null); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const detail = await customFetch<MinesweeperChallengeResult>(`/api/minesweeper-challenges/${game.challengeId}`);
        if (cancelled) return;
        setChallengeResult(detail);
        if (detail.status !== "completed") timer = setTimeout(refresh, 5000);
      } catch { if (!cancelled) timer = setTimeout(refresh, 5000); }
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [game?.status, game?.challengeId]);

  if (game && game.status !== "playing") {
    const mineCount = game.mines.filter(Boolean).length;
    const flagCount = game.flagged.filter(Boolean).length;
    const won = game.status === "won";
    return <main className="mx-auto w-full max-w-lg space-y-4 px-3 py-5 sm:px-6 sm:py-8">
      {showConfetti && <Confetti />}
      <section className={`relative isolate overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-center text-white shadow-xl sm:p-6 ${won ? "from-emerald-600 via-teal-600 to-cyan-500 shadow-emerald-500/20" : "from-rose-600 via-red-600 to-orange-500 shadow-rose-500/20"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/15" />
        <div className="relative z-10 space-y-2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/20 text-3xl">{won ? "🎉" : "💥"}</div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75">{game.dailyDate ? "Daily Minesweeper" : "Minesweeper"} {won ? "complete" : "over"}</p>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">{won ? "Minefield cleared!" : "Out of luck — a mine got you!"}</h1>
          <p className="text-sm text-white/85">{MINESWEEPER_LEVELS[game.difficulty].label} · {game.size}×{game.size} · {mineCount} mines · {game.mistakes} mistake{game.mistakes === 1 ? "" : "s"} · {flagCount} flags</p>
          {game.dailyDate && <p className="text-sm font-semibold text-white/90">📅 Today&apos;s shared daily board</p>}
          {won && reward?.isPersonalBest && <p className="pt-1 text-sm font-bold text-amber-100">🏆 New personal best!</p>}
          {game.challengeId && <p className="pt-1 text-sm font-bold text-white">⚔️ Challenge score submitted</p>}
          <Button variant="secondary" className="mt-2 gap-2" onClick={() => void shareResult()}><Share2 className="h-4 w-4"/> Share your result</Button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        {game.challengeId
          ? <Button className="w-full gap-2" onClick={() => setLocation("/challenges?tab=minesweeper")}><Trophy className="h-4 w-4"/> Return to Minesweeper challenge</Button>
          : <Button className="w-full gap-2" onClick={() => startGame(game.difficulty, game.dailyDate, game.seed)}><RotateCcw className="h-4 w-4"/> Play again · {MINESWEEPER_LEVELS[game.difficulty].label}</Button>}
        <div className="grid grid-cols-2 gap-2">
          {availableDifficulties.map(({ id }) => {
            const level = MINESWEEPER_LEVELS[id];
            const active = id === game.difficulty;
            return <button key={id} type="button" onClick={() => startGame(id)} className={`min-h-14 rounded-xl border-2 px-3 py-2 text-left transition ${active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-border hover:border-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20"}`}>
              <span className="block text-sm font-bold">{level.label}{active ? " · Current" : ""}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{level.size}×{level.size} · {level.mines} mines</span>
            </button>;
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setGame(null)}><LayoutGrid className="h-4 w-4"/> Game home</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/leaderboard/minesweeper")}><Trophy className="h-4 w-4"/> Leaderboard</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/profile?tab=minesweeper")}><Flag className="h-4 w-4"/> My stats</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/")}><Home className="h-4 w-4"/> Portal</Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Timer, label: "Time", value: fmt(elapsed) },
          { icon: Bomb, label: "Level", value: MINESWEEPER_LEVELS[game.difficulty].label },
          { icon: Bomb, label: "Mines hit", value: String(game.mistakes) },
          { icon: Lightbulb, label: "Hints used", value: String(game.hintsUsed) },
        ].map(({ icon: Icon, label, value }) => <div key={label} className="space-y-1 rounded-xl border bg-card p-3 text-center sm:p-4"><Icon className="mx-auto h-4 w-4 text-emerald-600"/><p className="text-base font-black tabular-nums sm:text-lg">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>)}
      </div>

      {won && <section className="rounded-2xl border-2 border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30">
        {rewardLoading ? <div className="py-2 text-center text-sm font-semibold text-muted-foreground">Calculating your score and rewards…</div> : reward?.offline ? <div className="py-2 text-center"><p className="font-semibold text-amber-900 dark:text-amber-200">Rewards could not be saved</p><p className="mt-1 text-xs text-muted-foreground">{rewardError || "The game server could not save this result."}</p></div> : reward ? <><div className="grid grid-cols-3 items-center gap-2 text-center">
          <div><p className="text-2xl font-black text-amber-800 dark:text-amber-200">{reward.points.toLocaleString()}</p><p className="text-xs font-semibold text-muted-foreground">Points</p></div>
          <div className="border-x border-amber-300/70 px-2 dark:border-amber-700/60"><p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">+{reward.xpEarned}</p><p className="text-xs font-semibold text-muted-foreground">XP</p></div>
          <div><p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">+{reward.gemsEarned} 💎</p><p className="text-xs font-semibold text-muted-foreground">Gems</p></div>
        </div><p className="col-span-3 mt-2 text-[11px] text-muted-foreground">Score reflects level, completion time, mines hit, and hints used.</p></> : <div className="py-2 text-center text-sm text-muted-foreground">Your rewards are being prepared.</div>}
      </section>}

      {game.challengeId && <section className="rounded-xl border border-emerald-200 bg-card p-4 text-center dark:border-emerald-800" aria-live="polite">
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

  return <main className={`mx-auto w-full px-3 py-5 sm:px-6 sm:py-8 ${game ? "max-w-3xl" : "max-w-lg"}`}>
    {showConfetti && <Confetti />}
    <div className="relative isolate mb-4 flex items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-100 px-4 py-3 shadow-lg shadow-emerald-500/10 dark:border-emerald-800/60 dark:from-emerald-950/60 dark:via-card dark:to-teal-950/60">
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-teal-300/30 blur-2xl dark:bg-teal-400/15" />
      <Button variant="ghost" size="sm" className="relative z-10 shrink-0 px-1" onClick={() => (game ? setGame(null) : setLocation("/"))}><ArrowLeft className="mr-1 h-4 w-4"/> {game ? "Back" : "Home"}</Button>
      <div className="relative z-10 min-w-0 text-right">
        <h1 className="font-serif text-xl font-bold leading-tight tracking-tight sm:text-3xl">Minesweeper</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{profile?.username ? `Welcome back, ${profile.username}` : "Clear the field, avoid the mines"}</p>
      </div>
      <Button variant="ghost" size="icon" className="relative z-10 shrink-0" aria-label={sounds.enabled ? "Mute sounds" : "Enable sounds"} onClick={sounds.toggle}>{sounds.enabled ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}</Button>
    </div>
    <div className={`grid gap-5 ${game ? "" : "grid-cols-1"}`}>
      <section className="min-w-0 space-y-4">
        {!game ? <>
          {hasSavedGame && <button onClick={() => setLocation("/minesweeper?resume=1")} className="flex w-full items-center gap-3 rounded-xl border-2 border-emerald-300/60 bg-card px-4 py-3 text-left transition hover:bg-emerald-50 dark:border-emerald-800/50 dark:hover:bg-emerald-950/30"><RotateCcw className="h-4 w-4 shrink-0 text-emerald-600"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">Resume Minesweeper</span><span className="block text-xs text-muted-foreground">Pick up where you left off</span></span><span className="text-lg text-emerald-600">→</span></button>}
          <div className="relative isolate overflow-hidden rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-4 shadow-xl shadow-emerald-500/10 dark:border-emerald-800/50 dark:from-card dark:via-emerald-950/35 dark:to-teal-950/40 sm:p-5">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-teal-300/25 blur-2xl dark:bg-teal-400/10" />
            <div className="relative z-10 mb-4 flex items-center gap-3 rounded-xl border border-emerald-200/70 bg-white/65 px-3 py-3 dark:border-emerald-800/50 dark:bg-slate-950/20">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-2xl">💣</span>
              <div className="min-w-0 flex-1"><h2 className="font-serif text-lg font-bold">Ready to sweep?</h2><p className="text-xs leading-relaxed text-muted-foreground">Reveal every safe cell without hitting {MAX_MISTAKES} mines. Numbers show how many mines touch each cell.</p></div>
              <div className="hidden grid-cols-3 gap-1 rounded-lg border border-emerald-200/70 bg-white/70 p-1 sm:grid dark:border-emerald-800/50 dark:bg-slate-950/30">{["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n, i) => <span key={i} className={`grid h-5 w-5 place-items-center rounded text-[9px] font-black ${NUMBER_COLORS[Number(n)]}`}>{n}</span>)}</div>
            </div>
            <p className="relative z-10 mb-2.5 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Choose Difficulty</p>
            <div className="relative z-10 grid grid-cols-2 gap-2.5">
              {availableDifficulties.map((item) => {
                const meta = { beginner: "🧸", easy: "🌱", medium: "🧭", hard: "🔥" }[item.id];
                const level = MINESWEEPER_LEVELS[item.id];
                return <button key={item.id} onClick={() => startGame(item.id)} className="group flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50 p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md active:scale-[0.98] dark:border-emerald-800/60 dark:from-emerald-950/45 dark:to-teal-950/40">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-xl group-hover:bg-emerald-500/20">{meta}</span>
                  <span className="text-sm font-bold leading-tight">{level.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{item.detail}</span>
                </button>;
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setLocation("/profile?tab=minesweeper")} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition hover:border-emerald-300 hover:bg-muted/50"><Flag className="h-5 w-5 shrink-0 text-emerald-600"/><span><span className="block text-sm font-semibold">My Stats</span><span className="hidden text-xs text-muted-foreground sm:block">Best times & progress</span></span></button>
            <button onClick={() => setLocation("/leaderboard/minesweeper")} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition hover:border-emerald-300 hover:bg-muted/50"><Trophy className="h-5 w-5 shrink-0 text-emerald-600"/><span><span className="block text-sm font-semibold">Leaderboard</span><span className="hidden text-xs text-muted-foreground sm:block">Top sweepers</span></span></button>
          </div>
          <button onClick={() => setLocation("/minesweeper-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/60 px-4 py-3 text-left transition hover:bg-orange-50 dark:border-orange-800/40 dark:bg-orange-950/20 dark:hover:bg-orange-950/30">
            <span className="text-lg leading-none">🔥</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Daily Minesweeper</span><span className="block text-xs text-muted-foreground">One shared board for everyone each day</span></span>
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
            id="minesweeper-guidance"
            title="More Minesweeper guidance"
            className="rounded-2xl border border-emerald-400/25 bg-card p-5 sm:p-6"
          >
            <section className="space-y-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">How to play and improve at Minesweeper</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Mines are hidden under the covered cells. Reveal safe cells to
                  uncover the numbers — each number counts the mines touching
                  that cell. Clear every safe cell to win, but hitting{" "}
                  {MAX_MISTAKES} mines ends the game.
                </p>
              </div>
              <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                <article>
                  <h3 className="font-semibold text-foreground">Start with the numbers</h3>
                  <p className="mt-1">A revealed 1 next to a covered cell often means that cell is safe — but only flag a mine when the count proves it. Wrong flags cost you nothing until you reveal them, but they hide information.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Use chords wisely</h3>
                  <p className="mt-1">When a number already has enough flags around it, click the revealed number to reveal all its remaining covered neighbours at once — a fast way to clear open areas.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Pick a level that fits</h3>
                  <p className="mt-1">Beginner (6×6, 5 mines) and Easy (8×8, 12 mines) are quick warm-ups. Medium (12×12, 24 mines) and Hard (14×14, 34 mines) demand real deduction — Kids mode unlocks the small boards, Adult mode the big ones.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Understand your score</h3>
                  <p className="mt-1">Points, XP, and gems reflect the level, your completion time, mines hit, and hints used — faster, cleaner clears earn more. Only wins score — daily challenges give everyone the same board, and head-to-head challenges compare points.</p>
                </article>
              </div>
            </section>
          </MobileContentDisclosure>

          {/* Rules modal */}
          <Dialog open={infoModal === "rules"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-600" /> Rules</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>Minesweeper hides mines under a grid of covered cells. Use the numbers to find them all.</p>
                <ul className="list-none space-y-2">
                  {[
                    "Choose a difficulty — each has its own board size and mine count.",
                    "Reveal a cell to see how many mines touch it (the number shows the count).",
                    "Flag cells you believe are mines so you don't reveal them by accident.",
                    "Clear every safe cell to win. Hitting 3 mines ends the game.",
                    "Click a revealed number with the right number of flags around it to reveal its neighbours at once.",
                  ].map((rule, index) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300">{index + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-1">Points, XP, and 💎 gems are based on the level, completion time, mines hit, and hints used — faster, cleaner clears earn more of each. Only wins award rewards.</p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Controls modal */}
          <Dialog open={infoModal === "controls"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Keyboard className="h-5 w-5 text-emerald-600" /> Controls</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-2 font-semibold text-foreground">Mouse / Touch</p>
                  <div className="space-y-1.5 text-muted-foreground">
                    {[
                      ["Click / tap a covered cell", "Reveal it (or chord if it's a revealed number)"],
                      ["Right-click a covered cell", "Place or remove a flag"],
                      ["Flag mode button", "Switch taps between reveal and flag"],
                      ["Hint button", "Reveal one safe cell (2 per game)"],
                      ["New game button", "Back to the difficulty picker"],
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
                      ["Level", "Higher levels award more points"],
                      ["Time", "Faster clears earn a bonus"],
                      ["Mines hit", "Each mistake reduces the score"],
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
                <DialogTitle className="flex items-center gap-2"><Scroll className="h-5 w-5 text-emerald-600" /> Backstory</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Minesweeper began as a mainframe game called Mined-Out, written
                  by Robert Don Smith (known as Dagdeg) for the DEC-10 computer
                  in 1969 — one of the very first computer games ever made.
                </p>
                <p>
                  The version most players know arrived with Microsoft Windows
                  3.1 in 1992. Its little smiley face, counter, and grid of
                  covered cells turned logical deduction into a global
                  obsession — and spawned countless clones, speedruns, and
                  world-record chases.
                </p>
                <p>
                  This Minesweeper keeps that classic logic puzzle and adds four
                  board sizes, daily challenges, hints, and head-to-head
                  challenges against friends.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </> : <section className="rounded-3xl border border-border bg-card p-3 shadow-sm sm:p-5">
          {/* Top controls — single line */}
          <div className="mb-3 flex flex-nowrap items-center gap-1 rounded-xl border border-border bg-muted/40 px-2 py-1.5 text-xs sm:gap-2 sm:px-3">
            <Button variant={flagMode ? "default" : "outline"} size="sm" className={`h-8 shrink-0 gap-1 px-2 ${flagMode ? "bg-emerald-600 hover:bg-emerald-700" : ""}`} onClick={() => { sounds.click(); setFlagMode((v) => !v); }} aria-pressed={flagMode} aria-label={flagMode ? "Flag mode on" : "Flag mode"}><Flag className="h-4 w-4"/> <span className="hidden sm:inline">{flagMode ? "Flagging" : "Flag"}</span></Button>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5" title="Mines remaining"><Bomb className="h-3.5 w-3.5 text-rose-500"/>{game.mines.filter(Boolean).length - game.flagged.filter(Boolean).length}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Clock3 className="h-3.5 w-3.5 text-emerald-600"/>{fmt(elapsed)}</span>
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-background px-1.5 py-1 sm:px-2" title={`Mines hit — ${MAX_MISTAKES} ends the game`}>
              {Array.from({ length: MAX_MISTAKES }, (_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i < game.mistakes ? "bg-rose-500" : "bg-muted-foreground/25"}`} />)}
            </span>
            <Button variant="outline" size="sm" className="ml-auto h-8 shrink-0 gap-1 px-2" onClick={issueHint} disabled={game.hintsUsed >= MAX_HINTS} aria-label={`Hint, ${MAX_HINTS - game.hintsUsed} left`}><Lightbulb className="h-4 w-4"/> <span className="hidden sm:inline">Hint ({MAX_HINTS - game.hintsUsed})</span><span className="sm:hidden">{MAX_HINTS - game.hintsUsed}</span></Button>
          </div>

          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="font-bold">{MINESWEEPER_LEVELS[game.difficulty].label} board</h2><p className="mt-0.5 text-xs text-muted-foreground">{game.size}×{game.size} · {game.mines.filter(Boolean).length} mines · {flagMode ? "Tap to flag cells" : "Tap to reveal · click a number to chord"}</p></div>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setGame(null)}><RotateCcw className="h-4 w-4"/> New game</Button>
          </div>

          <div className="mx-auto w-full max-w-[560px] rounded-2xl bg-gradient-to-br from-emerald-300 via-teal-300 to-cyan-300 p-1.5 shadow-lg shadow-emerald-500/15 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-800">
            <div
              className="select-none touch-none overflow-hidden rounded-xl border border-white/70 bg-white/70 dark:border-slate-700 dark:bg-slate-950/70"
              style={{ display: "grid", gridTemplateColumns: `repeat(${game.size}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: game.size * game.size }, (_, index) => {
                const revealed = game.revealed[index];
                const flagged = game.flagged[index];
                const isMine = game.mines[index];
                const count = game.counts[index];
                const showMine = isMine && (revealed || game.status === "lost");
                const wrongFlag = flagged && !isMine && game.status === "lost";
                let content: React.ReactNode = "";
                let cls = "bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-50 dark:hover:bg-emerald-800/70";
                if (flagged && !wrongFlag) {
                  content = "🚩";
                } else if (showMine) {
                  content = "💣";
                  cls = revealed && isMine ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
                } else if (wrongFlag) {
                  content = "❌";
                  cls = "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
                } else if (revealed) {
                  if (count > 0) { content = count; cls = `bg-slate-200 dark:bg-slate-800 ${NUMBER_COLORS[count]}`; }
                  else cls = "bg-slate-100 dark:bg-slate-900";
                }
                return <button
                  key={index}
                  data-cell={index}
                  type="button"
                  aria-label={`Row ${Math.floor(index / game.size) + 1}, column ${index % game.size + 1}${revealed ? (isMine ? ", mine" : count > 0 ? `, ${count} adjacent mines` : ", empty") : flagged ? ", flagged" : ""}`}
                  onClick={() => handleCell(index)}
                  onContextMenu={(e) => { e.preventDefault(); toggleFlag(index); }}
                  className={`flex aspect-square min-w-0 items-center justify-center border-[0.5px] border-emerald-900/15 text-[clamp(10px,2.6vw,20px)] font-black transition-colors ${cls}`}
                >{content}</button>;
              })}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{game.revealedCount} of {game.size * game.size - game.mines.filter(Boolean).length} safe cells cleared · {game.mistakes}/{MAX_MISTAKES} mines hit · {game.hintsUsed}/{MAX_HINTS} hints</span>
          </div>
        </section>}
      </section>
    </div>
  </main>;
}
