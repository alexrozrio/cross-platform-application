import React from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight, ArrowUp, BookOpen, Clock3, Flame, Grid3x3, Home, Keyboard, Layers, LayoutGrid, Lightbulb, RotateCcw, Scroll, Share2, Timer, Trophy, Undo2, Volume2, VolumeX, X } from "lucide-react";
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
import {
  canMove2048, createGame2048, deserialize2048, GAME_2048_LEVELS, GAME_2048_TARGET_TILE,
  move2048, serialize2048, type Game2048Direction, type Game2048Difficulty, type Game2048State,
} from "@/lib/game-2048";
import { recordGame2048Completion } from "@/lib/game-2048-stats";
import { Button } from "@/components/ui/button";

const SAVE_KEY = "brain-games-2048-session";
const UNDO_LIMIT = 50;

const TILE_COLORS: Record<number, string> = {
  2: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
  4: "bg-orange-200 text-orange-900 dark:bg-orange-800/60 dark:text-orange-100",
  8: "bg-red-300 text-red-900 dark:bg-red-700 dark:text-red-100",
  16: "bg-red-400 text-white dark:bg-red-600",
  32: "bg-rose-500 text-white dark:bg-rose-600",
  64: "bg-rose-600 text-white dark:bg-rose-700",
  128: "bg-amber-400 text-white dark:bg-amber-500",
  256: "bg-amber-500 text-white dark:bg-amber-600",
  512: "bg-yellow-400 text-yellow-900 dark:bg-yellow-500 dark:text-yellow-950",
  1024: "bg-yellow-300 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-950",
  2048: "bg-cyan-300 text-cyan-900 dark:bg-cyan-400 dark:text-cyan-950",
};

function tileClass(value: number): string {
  if (value >= 4096) return "bg-fuchsia-400 text-white dark:bg-fuchsia-500";
  return TILE_COLORS[value] ?? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
}

function tileFontSize(value: number, size: number): number {
  const digits = String(value).length;
  const base = size <= 3 ? 34 : size === 4 ? 30 : size === 5 ? 24 : 20;
  return Math.max(10, base - (digits - 1) * 4);
}

type SavedGame = {
  difficulty: Game2048Difficulty;
  seed: number;
  state: Game2048State;
  elapsed: number;
  savedAt: number;
  gameId?: number;
  dailyDate?: string;
  challengeId?: number;
};

type Game2048Reward = { points: number; xpEarned: number; gemsEarned: number; score: number; maxTile: number; won?: boolean; isPersonalBest?: boolean; offline?: boolean };
type Game2048ChallengeResult = { id: number; status: string; challengerId: number; challengedId: number; winnerId: number | null; challengerUsername: string; challengedUsername: string; challengerPoints: number | null; challengedPoints: number | null; challengerScore: number | null; challengedScore: number | null; challengerMaxTile: number | null; challengedMaxTile: number | null; challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null };

function loadSaved(): SavedGame | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as SavedGame | null;
    if (!raw || typeof raw.difficulty !== "string" || !GAME_2048_LEVELS[raw.difficulty]) return null;
    const state = deserialize2048(raw.state, GAME_2048_LEVELS[raw.difficulty].size, raw.seed, GAME_2048_LEVELS[raw.difficulty].targetTile);
    if (!state) return null;
    return { ...raw, state, elapsed: Number.isFinite(raw.elapsed) ? raw.elapsed : 0 };
  } catch { return null; }
}

export default function Game2048Page() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const query = new URLSearchParams(search);
  const { profileId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId as number);
  const queryClient = useQueryClient();
  const sounds = useSound(profile?.soundEnabled);
  const gameMode = profile?.gameMode ?? "4all";
  const availableDifficulties = (Object.keys(GAME_2048_LEVELS) as Game2048Difficulty[]).filter((id) =>
    gameMode === "children" ? GAME_2048_LEVELS[id].mode === "baby" :
      gameMode === "adult" ? GAME_2048_LEVELS[id].mode === "adult" : true,
  );
  const [game, setGame] = React.useState<SavedGame | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [history, setHistory] = React.useState<Game2048State[]>([]);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [hasSavedGame, setHasSavedGame] = React.useState(false);
  const [reward, setReward] = React.useState<Game2048Reward | null>(null);
  const [rewardLoading, setRewardLoading] = React.useState(false);
  const [rewardError, setRewardError] = React.useState<string | null>(null);
  const [challengeResult, setChallengeResult] = React.useState<Game2048ChallengeResult | null>(null);
  const [infoModal, setInfoModal] = React.useState<"rules" | "controls" | "backstory" | null>(null);
  const [endConfirm, setEndConfirm] = React.useState(false);
  const activeGameRef = React.useRef(game);
  activeGameRef.current = game;
  const pendingGameRef = React.useRef<{ savedAt: number; promise: Promise<number | null> } | null>(null);
  const directStartHandledRef = React.useRef(false);
  const touchRef = React.useRef<{ x: number; y: number } | null>(null);
  const finishedRef = React.useRef(false);

  usePageMeta({
    title: "2048 Game | Play Brain Games",
    description: "Slide and merge numbered tiles on 3×3, 4×4, 5×5, and 6×6 boards. Reach the target tile, beat the clock, and climb the leaderboard.",
    path: "/game-2048",
  });

  React.useEffect(() => {
    const saved = loadSaved();
    setHasSavedGame(Boolean(saved));
    if (query.get("resume") === "1" && saved) {
      setGame(saved); setElapsed(saved.elapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!game || game.state.status !== "playing") return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [game?.state.status]);

  React.useEffect(() => {
    if (game && game.state.status === "playing") {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...game, state: serialize2048(game.state), elapsed })); setHasSavedGame(true); } catch { /* Storage is optional. */ }
    }
  }, [game, elapsed]);

  const completeGame = async (completed: SavedGame, finalElapsed: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setRewardLoading(true);
    setRewardError(null);
    const won = completed.state.reachedTarget;
    try {
      const pending = pendingGameRef.current;
      let gameId = completed.gameId ?? (pending?.savedAt === completed.savedAt ? await pending.promise : null);
      if (!gameId && profileId && navigator.onLine !== false) {
        const createController = new AbortController();
        const createTimeout = window.setTimeout(() => createController.abort(), 5000);
        try {
          const created = await customFetch<{ id: number }>("/api/game-2048-games", {
            method: "POST",
            body: JSON.stringify({
              profileId,
              difficulty: completed.difficulty,
              size: completed.state.size,
              seed: completed.seed,
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
      let result: Game2048Reward;
      try {
        result = await customFetch<Game2048Reward>(`/api/game-2048-games/${gameId}/complete`, {
          method: "POST",
          body: JSON.stringify({
            elapsedSeconds: finalElapsed,
            moves: completed.state.moves,
            score: completed.state.score,
            maxTile: completed.state.maxTile,
            won,
          }),
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
        queryClient.invalidateQueries({ queryKey: [`/api/game-2048-daily-challenge/status/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: ["game-2048-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments/leaderboard"] });
        window.dispatchEvent(new CustomEvent(ACHIEVEMENT_COMPLETION_EVENT, { detail: { profileId } }));
      }
    } catch (error) {
      console.error("[2048] Could not save completion rewards:", error);
      if (activeGameRef.current?.savedAt === completed.savedAt) {
        setReward({ points: 0, xpEarned: 0, gemsEarned: 0, score: completed.state.score, maxTile: completed.state.maxTile, won, offline: true });
        setRewardError(error instanceof Error ? error.message : "Unknown API error");
      }
    } finally {
      if (activeGameRef.current?.savedAt === completed.savedAt) setRewardLoading(false);
    }
  };

  const finishRun = (completed: SavedGame, finalElapsed: number) => {
    const won = completed.state.reachedTarget;
    if (won) {
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3200);
    }
    recordGame2048Completion(profileId, completed.difficulty, completed.state.size, finalElapsed, completed.state.moves, completed.state.score, completed.state.maxTile, won);
    localStorage.removeItem(SAVE_KEY);
    setHasSavedGame(false);
    setGame({ ...completed, state: { ...completed.state, status: "over" } });
    void completeGame(completed, finalElapsed);
  };

  const startGame = (level: Game2048Difficulty, dailyDate?: string, seed?: number, existingGameId?: number, challengeId?: number) => {
    sounds.click();
    const savedAt = Date.now();
    const cfg = GAME_2048_LEVELS[level];
    const boardSeed = seed ?? Math.floor(Math.random() * 2_147_483_647) + 1;
    const nextGame: SavedGame = {
      difficulty: level, seed: boardSeed,
      state: createGame2048(cfg.size, boardSeed, cfg.targetTile),
      elapsed: 0, savedAt,
      ...(dailyDate ? { dailyDate } : {}), ...(existingGameId ? { gameId: existingGameId } : {}), ...(challengeId ? { challengeId } : {}),
    };
    setGame(nextGame); setReward(null); setRewardError(null); setRewardLoading(false);
    setElapsed(0); setHistory([]); setChallengeResult(null); finishedRef.current = false;
    setLocation(dailyDate
      ? `/game-2048?play=1&dailyDate=${dailyDate}&difficulty=${level}&seed=${boardSeed}`
      : challengeId
        ? `/game-2048?play=1&challengeId=${challengeId}&gameId=${existingGameId}&difficulty=${level}&seed=${boardSeed}`
        : "/game-2048?play=1");
    if (existingGameId) {
      pendingGameRef.current = { savedAt, promise: Promise.resolve(existingGameId) };
      return;
    }
    const promise = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const { id } = await customFetch<{ id: number }>("/api/game-2048-games", {
          method: "POST",
          body: JSON.stringify({ profileId: profileId ?? null, difficulty: level, size: cfg.size, seed: boardSeed, ...(dailyDate ? { dailyDate } : {}) }),
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
    if ((query.get("start") !== "1" && query.get("play") !== "1") || directStartHandledRef.current || profileLoading) return;
    directStartHandledRef.current = true;
    const requestedDifficulty = query.get("difficulty") as Game2048Difficulty | null;
    const level = availableDifficulties.find((id) => id === requestedDifficulty) ?? availableDifficulties[0];
    if (!level) return;
    const dailyDate = query.get("dailyDate");
    const seedValue = Number(query.get("seed"));
    const existingGameId = Number(query.get("gameId"));
    const challengeId = Number(query.get("challengeId"));
    startGame(level,
      dailyDate && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate) ? dailyDate : undefined,
      Number.isInteger(seedValue) && seedValue > 0 ? seedValue : undefined,
      Number.isInteger(existingGameId) && existingGameId > 0 ? existingGameId : undefined,
      Number.isInteger(challengeId) && challengeId > 0 ? challengeId : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, profile?.gameMode, search]);

  const applyMove = (dir: Game2048Direction) => {
    if (!game || game.state.status !== "playing" || finishedRef.current) return;
    const cfg = GAME_2048_LEVELS[game.difficulty];
    const next = move2048(game.state, dir, game.seed, cfg.targetTile);
    if (!next) { sounds.click(); return; }
    sounds.note();
    const gained = next.score - game.state.score;
    if (gained > 0) sounds.place();
    setHistory((h) => [...h.slice(-(UNDO_LIMIT - 1)), game.state]);
    const updated: SavedGame = { ...game, state: next };
    setGame(updated);
    if (next.status === "over") {
      sounds.complete();
      finishRun(updated, elapsed);
    } else if (next.reachedTarget && !game.state.reachedTarget) {
      sounds.complete();
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3200);
    }
  };

  const undo = () => {
    if (!game || game.state.status !== "playing" || !history.length || finishedRef.current) return;
    sounds.click();
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setGame({ ...game, state: prev });
  };

  // Keyboard controls
  React.useEffect(() => {
    if (!game || game.state.status !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Game2048Direction> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); applyMove(dir); }
      else if (e.key === "z" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, history]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current || !game || game.state.status !== "playing") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current = null;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (Math.max(adx, ady) < 24) return;
    applyMove(adx > ady ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  };

  const shareResult = async () => {
    if (!game) return;
    const url = appShareUrlForPath("/game-2048");
    const cfg = GAME_2048_LEVELS[game.difficulty];
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const rewardLine = reward && !reward.offline
      ? `+${reward.points.toLocaleString()} pts · +${reward.xpEarned} XP · +${reward.gemsEarned} 💎`
      : null;
    const lines = [
      `🔢 ${cfg.label} 2048 (${cfg.size}×${cfg.size}): score ${game.state.score.toLocaleString()}, biggest tile ${game.state.maxTile}, ${game.state.moves} moves in ${fmt(elapsed)}!`,
      rewardLine,
      rank ? `🏅 ${rank} · Play Brain Games . Online` : "🧠 Play Brain Games . Online",
      `🔗 ${url}`,
    ].filter((line): line is string => Boolean(line));
    try {
      const result = await shareOrDownloadShareCard({
        title: "2048 result",
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: "#f97316",
        filename: "game-2048-result.png",
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
    if (!game || game.state.status === "playing" || !game.challengeId) { setChallengeResult(null); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const detail = await customFetch<Game2048ChallengeResult>(`/api/game-2048-challenges/${game.challengeId}`);
        if (cancelled) return;
        setChallengeResult(detail);
        if (detail.status !== "completed") timer = setTimeout(refresh, 5000);
      } catch { if (!cancelled) timer = setTimeout(refresh, 5000); }
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [game?.state.status, game?.challengeId]);

  if (game && game.state.status !== "playing") {
    const cfg = GAME_2048_LEVELS[game.difficulty];
    const won = game.state.reachedTarget;
    return <main className="mx-auto w-full max-w-lg space-y-4 px-3 py-5 sm:px-6 sm:py-8">
      {showConfetti && <Confetti />}
      <section className={`relative isolate overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-center text-white shadow-xl sm:p-6 ${won ? "from-orange-500 via-amber-500 to-yellow-500 shadow-orange-500/20" : "from-slate-600 via-slate-700 to-slate-800 shadow-slate-500/20"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/15" />
        <div className="relative z-10 space-y-2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/20 text-3xl">{won ? "🏆" : "🔢"}</div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75">{game.dailyDate ? "Daily 2048" : "2048"} {won ? "target reached" : "run finished"}</p>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">{won ? `You made ${cfg.targetTile}!` : "No moves left"}</h1>
          <p className="text-sm text-white/85">{cfg.label} · {game.state.size}×{game.state.size} · Score {game.state.score.toLocaleString()} · Best tile {game.state.maxTile} · {game.state.moves} moves · {fmt(elapsed)}</p>
          {game.dailyDate && <p className="text-sm font-semibold text-white/90">📅 Today&apos;s shared daily board</p>}
          {reward?.isPersonalBest && <p className="pt-1 text-sm font-bold text-amber-100">🏆 New personal best score!</p>}
          {game.challengeId && <p className="pt-1 text-sm font-bold text-white">⚔️ Challenge score submitted</p>}
          <Button variant="secondary" className="mt-2 gap-2" onClick={() => void shareResult()}><Share2 className="h-4 w-4"/> Share your result</Button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        {game.challengeId
          ? <Button className="w-full gap-2" onClick={() => setLocation("/challenges?tab=game-2048")}><Trophy className="h-4 w-4"/> Return to 2048 challenge</Button>
          : <Button className="w-full gap-2" onClick={() => startGame(game.difficulty, game.dailyDate, game.seed, undefined, undefined)}><RotateCcw className="h-4 w-4"/> Play again · {cfg.label}</Button>}
        <div className="grid grid-cols-2 gap-2">
          {availableDifficulties.map((id) => {
            const level = GAME_2048_LEVELS[id];
            const active = id === game.difficulty;
            return <button key={id} type="button" onClick={() => startGame(id)} className={`min-h-14 rounded-xl border-2 px-3 py-2 text-left transition ${active ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30" : "border-border hover:border-orange-300 hover:bg-orange-50/60 dark:hover:bg-orange-950/20"}`}>
              <span className="block text-sm font-bold">{level.label}{active ? " · Current" : ""}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{level.size}×{level.size} · target {level.targetTile}</span>
            </button>;
          })}
        </div>
        {!game.dailyDate && !game.challengeId && <Button variant="outline" className="w-full gap-2" onClick={() => setLocation("/game-2048-challenge")}><Flame className="h-4 w-4"/> Try today&apos;s daily challenge</Button>}
        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setGame(null)}><LayoutGrid className="h-4 w-4"/> Game home</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/leaderboard/game-2048")}><Trophy className="h-4 w-4"/> Leaderboard</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/profile?tab=game-2048")}><Grid3x3 className="h-4 w-4"/> My stats</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/")}><Home className="h-4 w-4"/> Portal</Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Timer, label: "Time", value: fmt(elapsed) },
          { icon: Layers, label: "Score", value: game.state.score.toLocaleString() },
          { icon: Trophy, label: "Best tile", value: String(game.state.maxTile) },
          { icon: Grid3x3, label: "Moves", value: String(game.state.moves) },
        ].map(({ icon: Icon, label, value }) => <div key={label} className="space-y-1 rounded-xl border bg-card p-3 text-center sm:p-4"><Icon className="mx-auto h-4 w-4 text-orange-600"/><p className="text-base font-black tabular-nums sm:text-lg">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>)}
      </div>

      {won && <section className="rounded-2xl border-2 border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30">
        {rewardLoading ? <div className="py-2 text-center text-sm font-semibold text-muted-foreground">Calculating your score and rewards…</div> : reward?.offline ? <div className="py-2 text-center"><p className="font-semibold text-amber-900 dark:text-amber-200">Rewards could not be saved</p><p className="mt-1 text-xs text-muted-foreground">{rewardError || "The game server could not save this result."}</p></div> : reward ? <><div className="grid grid-cols-3 items-center gap-2 text-center">
          <div><p className="text-2xl font-black text-amber-800 dark:text-amber-200">{reward.points.toLocaleString()}</p><p className="text-xs font-semibold text-muted-foreground">Points</p></div>
          <div className="border-x border-amber-300/70 px-2 dark:border-amber-700/60"><p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">+{reward.xpEarned}</p><p className="text-xs font-semibold text-muted-foreground">XP</p></div>
          <div><p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">+{reward.gemsEarned} 💎</p><p className="text-xs font-semibold text-muted-foreground">Gems</p></div>
        </div><p className="col-span-3 mt-2 text-[11px] text-muted-foreground">Points scale with your biggest tile, completion time, and move efficiency.</p></> : <div className="py-2 text-center text-sm text-muted-foreground">Your rewards are being prepared.</div>}
      </section>}

      {game.challengeId && <section className="rounded-xl border border-orange-200 bg-card p-4 text-center dark:border-orange-800" aria-live="polite">
        <h2 className="font-bold">Challenge result</h2>
        {!challengeResult || challengeResult.status !== "completed" ? <p className="mt-1 text-sm text-muted-foreground">You finished with {game.state.score.toLocaleString()} points. Waiting for your opponent to finish…</p> : (() => {
          const mine = challengeResult.challengerId === profileId ? challengeResult.challengerPoints : challengeResult.challengedPoints;
          const theirs = challengeResult.challengerId === profileId ? challengeResult.challengedPoints : challengeResult.challengerPoints;
          const opponent = challengeResult.challengerId === profileId ? challengeResult.challengedUsername : challengeResult.challengerUsername;
          const outcome = challengeResult.winnerId === null ? "It’s a tie!" : challengeResult.winnerId === profileId ? "You won the challenge!" : "You lost the challenge.";
          return <><p className="mt-1 text-lg font-black">{outcome}</p><p className="mt-1 text-sm text-muted-foreground">You: {mine ?? 0} points · {opponent}: {theirs ?? 0} points</p><p className="mt-1 text-xs text-muted-foreground">{challengeResult.winnerId === null ? "Both players earned 2 bonus gems." : challengeResult.winnerId === profileId ? "You earned 10 bonus gems." : `${opponent} earned 10 bonus gems.`}</p></>;
        })()}
      </section>}
    </main>;
  }

  const cfg = game ? GAME_2048_LEVELS[game.difficulty] : null;

  return <main className={`mx-auto w-full px-3 py-3 sm:px-6 sm:py-8 ${game ? "max-w-3xl" : "max-w-lg"}`}>
    {showConfetti && <Confetti />}
    <div className="relative isolate mb-3 flex items-center sm:mb-4 justify-between gap-3 overflow-hidden rounded-2xl border-2 border-orange-200/80 bg-gradient-to-br from-orange-50 via-white to-amber-100 px-3 py-2 shadow-lg shadow-orange-500/10 sm:px-4 sm:py-3 dark:border-orange-800/60 dark:from-orange-950/60 dark:via-card dark:to-amber-950/60">
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-amber-300/30 blur-2xl dark:bg-amber-400/15" />
      <Button variant="ghost" size="sm" className="relative z-10 shrink-0 px-1" onClick={() => (game ? setGame(null) : setLocation("/"))}><ArrowLeft className="mr-1 h-4 w-4"/> {game ? "Back" : "Home"}</Button>
      <div className="relative z-10 min-w-0 text-right">
        <h1 className="font-serif text-xl font-bold leading-tight tracking-tight sm:text-3xl">2048</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{profile?.username ? `Welcome back, ${profile.username}` : "Merge tiles, reach the target"}</p>
      </div>
      <Button variant="ghost" size="icon" className="relative z-10 shrink-0" aria-label={sounds.enabled ? "Mute sounds" : "Enable sounds"} onClick={sounds.toggle}>{sounds.enabled ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}</Button>
    </div>
    <div className={`grid gap-4 sm:gap-5 ${game ? "" : "grid-cols-1"}`}>
      <section className="min-w-0 space-y-3 sm:space-y-4">
        {!game ? <>
          {hasSavedGame && (() => { const saved = loadSaved(); return saved ? <button onClick={() => setLocation("/game-2048?resume=1")} className="flex w-full items-center gap-3 rounded-xl border-2 border-orange-300/60 bg-card px-3 py-2.5 sm:px-4 sm:py-3 text-left transition hover:bg-orange-50 dark:border-orange-800/50 dark:hover:bg-orange-950/30"><RotateCcw className="h-4 w-4 shrink-0 text-orange-600"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-orange-700 dark:text-orange-300">Resume 2048</span><span className="block text-xs text-muted-foreground">{GAME_2048_LEVELS[saved.difficulty].label} · score {saved.state.score.toLocaleString()}</span></span><span className="text-lg text-orange-600">→</span></button> : null; })()}
          <div className="relative isolate overflow-hidden rounded-2xl border-2 border-orange-200/80 bg-gradient-to-br from-white via-orange-50 to-amber-50 p-3 shadow-xl shadow-orange-500/10 dark:border-orange-800/50 dark:from-card dark:via-orange-950/35 dark:to-amber-950/40 sm:p-5">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-amber-300/25 blur-2xl dark:bg-amber-400/10" />
            <div className="relative z-10 mb-4 hidden items-center gap-3 rounded-xl border border-orange-200/70 bg-white/65 px-3 py-3 dark:border-orange-800/50 dark:bg-slate-950/20 sm:flex">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-2xl">🔢</span>
              <div className="min-w-0 flex-1"><h2 className="font-serif text-lg font-bold">Ready to merge?</h2><p className="text-xs leading-relaxed text-muted-foreground">Slide the board with arrows, WASD, or a swipe. Matching tiles merge — reach the target tile before you run out of moves.</p></div>
              <div className="hidden grid-cols-4 gap-1 rounded-lg border border-orange-200/70 bg-white/70 p-1 sm:grid dark:border-orange-800/50 dark:bg-slate-950/30">{[2, 4, 8, 16].map((v) => <span key={v} className={`grid h-5 w-5 place-items-center rounded text-[9px] font-black ${tileClass(v)}`}>{v}</span>)}</div>
            </div>
            <p className="relative z-10 mb-2 hidden text-xs font-semibold uppercase tracking-widest text-orange-700 dark:text-orange-300 sm:block">Choose Board Size</p>
            <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-2.5">
              {availableDifficulties.map((id) => {
                const level = GAME_2048_LEVELS[id];
                const meta = { "3x3": "🌱", "4x4": "🧩", "5x5": "🔥", "6x6": "🏔️" }[id];
                return <button key={id} onClick={() => startGame(id)} className="group flex min-h-[72px] sm:min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-orange-200/80 bg-gradient-to-br from-orange-50 to-amber-50 p-2 text-center shadow-sm sm:p-3 transition-all hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md active:scale-[0.98] dark:border-orange-800/60 dark:from-orange-950/45 dark:to-amber-950/40">
                  <span className="grid h-8 w-8 place-items-center sm:h-9 sm:w-9 rounded-xl bg-orange-500/10 text-xl group-hover:bg-orange-500/20">{meta}</span>
                  <span className="text-sm font-bold leading-tight">{level.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{level.size}×{level.size} · target {level.targetTile} · {level.mode === "baby" ? "Kids" : "Adult"}</span>
                </button>;
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setLocation("/profile?tab=game-2048")} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left sm:p-3 transition hover:border-orange-300 hover:bg-muted/50"><Grid3x3 className="h-5 w-5 shrink-0 text-orange-600"/><span><span className="block text-sm font-semibold">My Stats</span><span className="hidden text-xs text-muted-foreground sm:block">Best scores & tiles</span></span></button>
            <button onClick={() => setLocation("/leaderboard/game-2048")} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left sm:p-3 transition hover:border-orange-300 hover:bg-muted/50"><Trophy className="h-5 w-5 shrink-0 text-orange-600"/><span><span className="block text-sm font-semibold">Leaderboard</span><span className="hidden text-xs text-muted-foreground sm:block">Top scores</span></span></button>
          </div>
          <button onClick={() => setLocation("/game-2048-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-2.5 sm:px-4 sm:py-3 text-left transition hover:bg-orange-50 dark:border-orange-800/40 dark:bg-orange-950/20 dark:hover:bg-orange-950/30">
            <span className="text-lg leading-none">🔥</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Daily 2048</span><span className="block text-xs text-muted-foreground">One shared tile sequence for everyone each day</span></span>
            <span className="text-orange-500">→</span>
          </button>
          <div className="home-info-links flex items-center justify-center gap-4 rounded-xl border border-border bg-card px-3 py-2 sm:gap-6 sm:px-4 sm:py-2.5">
            <button onClick={() => setInfoModal("rules")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><BookOpen className="h-3.5 w-3.5" /> Rules</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("controls")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Keyboard className="h-3.5 w-3.5" /> Controls</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("backstory")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Scroll className="h-3.5 w-3.5" /> Backstory</button>
          </div>

          <MobileContentDisclosure
            id="game-2048-guidance"
            title="More 2048 guidance"
            className="rounded-2xl border border-orange-400/25 bg-card p-5 sm:p-6"
          >
            <section className="space-y-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">How to play and improve at 2048</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Every slide moves all tiles as far as they can go. When two
                  tiles with the same number collide, they merge into one tile
                  worth double — and each tile can only merge once per move.
                </p>
              </div>
              <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                <article>
                  <h3 className="font-semibold text-foreground">Keep your biggest tile in a corner</h3>
                  <p className="mt-1">Pick one corner (bottom-right is classic) and never let your highest tile leave it. Build a descending snake of tiles around it — this is the single biggest improvement for high scores.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Don&apos;t merge too early</h3>
                  <p className="mt-1">Merging two medium tiles too soon can block your biggest tile. Sometimes it&apos;s better to keep pairs apart until you&apos;re ready for them.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Bigger boards need patience</h3>
                  <p className="mt-1">5×5 and 6×6 give you more room but the target is harder to reach. Focus on one edge at a time and don&apos;t chase every merge.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Understand your score</h3>
                  <p className="mt-1">Points, XP, and gems scale with your biggest tile, completion time, and move efficiency. Daily challenges give everyone the same tile sequence, and head-to-head challenges compare points.</p>
                </article>
              </div>
            </section>
          </MobileContentDisclosure>

          <Dialog open={infoModal === "rules"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-orange-600" /> Rules</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>Slide the numbered tiles to merge matching pairs and reach the target tile.</p>
                <ul className="list-none space-y-2">
                  {[
                    "Choose a board size — 3×3, 4×4, 5×5, or 6×6.",
                    "Swipe, use arrow keys, WASD, or the on-screen pad to slide.",
                    "Two equal tiles merge into one tile worth double.",
                    `Reach ${GAME_2048_TARGET_TILE} (or the level target) to win — but you can keep playing for a bigger tile.`,
                    "The run ends when no moves remain; your biggest tile and time set your score.",
                  ].map((rule, index) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-700 dark:text-orange-300">{index + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-1">Points, XP, and 💎 gems scale with your biggest tile, completion time, and move efficiency.</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={infoModal === "controls"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Keyboard className="h-5 w-5 text-orange-600" /> Controls</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-2 font-semibold text-foreground">Touch / Mouse</p>
                  <div className="space-y-1.5 text-muted-foreground">
                    {[
                      ["Swipe on the board", "Slide all tiles in that direction"],
                      ["On-screen arrow pad", "Same four directions, tap to move"],
                      ["Undo button", "Step back one move (last 50 kept)"],
                      ["End run button", "Finish early and save your score"],
                    ].map(([action, result]) => (
                      <div key={action} className="flex justify-between gap-4">
                        <span>{action}</span>
                        <span className="text-right font-medium text-foreground">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="mb-2 font-semibold text-foreground">Keyboard</p>
                  <div className="space-y-1.5 text-muted-foreground">
                    {[
                      ["Arrow keys / WASD", "Slide in that direction"],
                      ["Ctrl/⌘ + Z", "Undo last move"],
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

          <Dialog open={infoModal === "backstory"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto overscroll-contain">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Scroll className="h-5 w-5 text-orange-600" /> Backstory</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  2048 began as an open-source project by Gabriele Cirulli in
                  2014 — a single HTML file, no images, just numbers on a
                  grid. Within weeks it had spread to every app store and
                  become one of the most cloned games in history.
                </p>
                <p>
                  Its genius is simplicity: slide, merge, repeat. Yet beneath
                  that simplicity sits a surprisingly deep combinatorial
                  puzzle — the difference between a casual player and a
                  100,000-point run is strategy, not luck.
                </p>
                <p>
                  This version adds four board sizes from 3×3 to 6×6, daily
                  challenges where everyone gets the same tile sequence,
                  head-to-head duels, and persistent stats.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </> : <section className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-5">
          {/* Top controls */}
          <div className="mb-2 flex flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 px-2 py-1.5 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:px-3">
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Layers className="h-3.5 w-3.5 text-orange-600"/>{game.state.score.toLocaleString()} score</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Trophy className="h-3.5 w-3.5 text-orange-600"/>{game.state.maxTile}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Clock3 className="h-3.5 w-3.5 text-orange-600"/>{fmt(elapsed)}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Grid3x3 className="h-3.5 w-3.5 text-orange-600"/>{game.state.moves} moves</span>
            <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1 px-2" onClick={undo} disabled={!history.length} aria-label="Undo last move"><Undo2 className="h-4 w-4"/> <span className="hidden sm:inline">Undo</span></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => startGame(game.difficulty, game.dailyDate, game.seed, undefined, undefined)} aria-label="Restart"><RotateCcw className="h-4 w-4"/></Button>
            <Button variant="outline" size="sm" className="ml-auto h-8 shrink-0 gap-1 px-2 text-red-600" onClick={() => setEndConfirm(true)}><X className="h-4 w-4"/> <span className="hidden sm:inline">End run</span></Button>
          </div>

          <div className="mx-auto w-full max-w-[560px] rounded-2xl bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-300 p-1.5 shadow-lg shadow-orange-500/15 dark:from-orange-800 dark:via-amber-800 dark:to-yellow-800">
            <div
              className="select-none touch-none overflow-hidden rounded-xl border border-white/70 bg-orange-50/60 dark:border-slate-700 dark:bg-slate-950/70"
              style={{ display: "grid", gridTemplateColumns: `repeat(${game.state.size}, minmax(0, 1fr))`, gap: "6px", padding: "6px", containerType: "inline-size" }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {game.state.tiles.map((value, index) => (
                <div
                  key={index}
                  className={`flex aspect-square min-w-0 items-center justify-center rounded-lg font-black transition-colors ${value === 0 ? "bg-orange-100/50 dark:bg-slate-900/50" : `${tileClass(value)} shadow-sm`}`}
                  style={value !== 0 ? { fontSize: `${tileFontSize(value, game.state.size)}px` } : undefined}
                >{value === 0 ? "" : value}</div>
              ))}
            </div>
          </div>

          {/* On-screen D-pad for touch devices */}
          <div className="mx-auto mt-3 grid w-fit grid-cols-3 grid-rows-3 gap-1.5 sm:hidden" aria-label="Move controls">
            <span /><button type="button" aria-label="Move up" onClick={() => applyMove("up")} className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-200 bg-white/80 text-orange-700 shadow-sm active:bg-orange-100 dark:border-orange-800 dark:bg-slate-900/70 dark:text-orange-300"><ArrowUp className="h-5 w-5"/></button><span />
            <button type="button" aria-label="Move left" onClick={() => applyMove("left")} className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-200 bg-white/80 text-orange-700 shadow-sm active:bg-orange-100 dark:border-orange-800 dark:bg-slate-900/70 dark:text-orange-300"><ArrowLeftIcon className="h-5 w-5"/></button>
            <button type="button" aria-label="Move down" onClick={() => applyMove("down")} className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-200 bg-white/80 text-orange-700 shadow-sm active:bg-orange-100 dark:border-orange-800 dark:bg-slate-900/70 dark:text-orange-300"><ArrowDown className="h-5 w-5"/></button>
            <button type="button" aria-label="Move right" onClick={() => applyMove("right")} className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-200 bg-white/80 text-orange-700 shadow-sm active:bg-orange-100 dark:border-orange-800 dark:bg-slate-900/70 dark:text-orange-300"><ArrowRight className="h-5 w-5"/></button>
          </div>
          <div className="mt-3 hidden flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground sm:flex">
            <span>Target {cfg?.targetTile} · par ≈ {cfg ? fmt(cfg.parSeconds) : ""} · swipe, arrow keys, WASD, or Ctrl+Z to undo</span>
          </div>
        </section>}
      </section>
    </div>

    <Dialog open={endConfirm} onOpenChange={setEndConfirm}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>End this run?</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Your score ({game?.state.score.toLocaleString() ?? 0}) and biggest tile ({game?.state.maxTile ?? 0}) will be saved now.</p>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setEndConfirm(false)}>Keep playing</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => { setEndConfirm(false); if (game) finishRun(game, elapsed); }}>End run</Button>
        </div>
      </DialogContent>
    </Dialog>
  </main>;
}
