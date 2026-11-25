import React from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, Clock3, Flame, Home, Keyboard, LayoutGrid, Pause, Play, RotateCcw, Scroll, Share2, Timer, Trophy, Volume2, VolumeX, X } from "lucide-react";
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
  createSnakeGame, isSnakeRoundOver, parseSnakeGame, serializeSnakeGame, stepSnake,
  SNAKE_LEVELS, type SnakeDifficulty, type SnakeDirection, type SnakeGameState,
} from "@/lib/snake";
import { recordSnakeCompletion } from "@/lib/snake-stats";
import { Button } from "@/components/ui/button";

const SAVE_KEY = "brain-games-snake-session";

type SnakeReward = { points: number; xpEarned: number; gemsEarned: number; foodEaten: number; score: number; won?: boolean; isPersonalBest?: boolean; offline?: boolean };
type SnakeChallengeResult = { id: number; status: string; challengerId: number; challengedId: number; winnerId: number | null; challengerUsername: string; challengedUsername: string; challengerPoints: number | null; challengedPoints: number | null; challengerScore: number | null; challengedScore: number | null; challengerFoodEaten: number | null; challengedFoodEaten: number | null; challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null };

type SavedGame = {
  difficulty: SnakeDifficulty;
  seed: number;
  state: SnakeGameState;
  elapsed: number;
  savedAt: number;
  gameId?: number;
  dailyDate?: string;
  challengeId?: number;
};

function loadSaved(): SavedGame | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as SavedGame | null;
    if (!raw || typeof raw.difficulty !== "string" || !SNAKE_LEVELS[raw.difficulty]) return null;
    const state = parseSnakeGame(typeof raw.state === "string" ? raw.state : JSON.stringify(raw.state ?? null), raw.difficulty);
    if (!state) return null;
    return {
      ...raw,
      state,
      elapsed: Number.isFinite(raw.elapsed) ? raw.elapsed : 0,
    };
  } catch { return null; }
}

const PALETTE = {
  head: "#16a34a",
  body: "#22c55e",
  bodyAlt: "#4ade80",
  food: "#ef4444",
  grid: "rgba(148,163,184,0.18)",
};

function drawSnake(canvas: HTMLCanvasElement, state: SnakeGameState) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = state.gridSize;
  const cell = canvas.width / size;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Grid
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1;
  for (let i = 1; i < size; i++) {
    ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(canvas.width, i * cell); ctx.stroke();
  }
  // Food (apple)
  const fx = state.food.x * cell + cell / 2;
  const fy = state.food.y * cell + cell / 2;
  const r = cell * 0.32;
  ctx.fillStyle = PALETTE.food;
  ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#166534";
  ctx.fillRect(fx - 1, fy - r - cell * 0.18, 2, cell * 0.2);
  // Snake — head first, rounded cells, alternating shade
  state.snake.forEach((c, i) => {
    const pad = i === 0 ? cell * 0.06 : cell * 0.12;
    const x = c.x * cell + pad;
    const y = c.y * cell + pad;
    const w = cell - pad * 2;
    ctx.fillStyle = i === 0 ? PALETTE.head : i % 2 === 0 ? PALETTE.body : PALETTE.bodyAlt;
    const radius = i === 0 ? cell * 0.28 : cell * 0.22;
    ctx.beginPath();
    ctx.roundRect(x, y, w, w, radius);
    ctx.fill();
  });
  // Eyes on head
  const head = state.snake[0];
  const hx = head.x * cell + cell / 2;
  const hy = head.y * cell + cell / 2;
  const d = DIR_VEC[state.direction];
  const ex = -d.y, ey = d.x; // perpendicular
  const eo = cell * 0.16, fo = cell * 0.14;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(hx + d.x * fo + ex * eo, hy + d.y * fo + ey * eo, cell * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + d.x * fo - ex * eo, hy + d.y * fo - ey * eo, cell * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath(); ctx.arc(hx + d.x * (fo + cell * 0.03) + ex * eo, hy + d.y * (fo + cell * 0.03) + ey * eo, cell * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + d.x * (fo + cell * 0.03) - ex * eo, hy + d.y * (fo + cell * 0.03) - ey * eo, cell * 0.05, 0, Math.PI * 2); ctx.fill();
}

const DIR_VEC: Record<SnakeDirection, { x: number; y: number }> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

export default function SnakePage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const query = new URLSearchParams(search);
  const { profileId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId as number);
  const queryClient = useQueryClient();
  const sounds = useSound(profile?.soundEnabled);
  const gameMode = profile?.gameMode ?? "4all";
  const availableDifficulties = (Object.keys(SNAKE_LEVELS) as SnakeDifficulty[]).filter((id) =>
    gameMode === "children" ? SNAKE_LEVELS[id].mode === "baby" :
      gameMode === "adult" ? SNAKE_LEVELS[id].mode === "adult" : true,
  );
  const [game, setGame] = React.useState<SavedGame | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [hasSavedGame, setHasSavedGame] = React.useState(false);
  const [reward, setReward] = React.useState<SnakeReward | null>(null);
  const [rewardLoading, setRewardLoading] = React.useState(false);
  const [rewardError, setRewardError] = React.useState<string | null>(null);
  const [challengeResult, setChallengeResult] = React.useState<SnakeChallengeResult | null>(null);
  const [infoModal, setInfoModal] = React.useState<"rules" | "controls" | "backstory" | null>(null);
  const [endConfirm, setEndConfirm] = React.useState(false);
  const [runFinished, setRunFinished] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const activeGameRef = React.useRef(game);
  activeGameRef.current = game;
  const pendingGameRef = React.useRef<{ savedAt: number; promise: Promise<number | null> } | null>(null);
  const directStartHandledRef = React.useRef(false);
  const finishedRef = React.useRef(false);
  const directionQueueRef = React.useRef<SnakeDirection[]>([]);
  const stateRef = React.useRef<SnakeGameState | null>(null);
  const elapsedRef = React.useRef(0);
  elapsedRef.current = elapsed;
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const touchRef = React.useRef<{ x: number; y: number } | null>(null);

  usePageMeta({
    title: "Snake Game | Play Brain Games",
    description: "Guide the classic snake to eat apples across four levels. Faster rounds and cleaner paths score more — beat the clock and climb the leaderboard.",
    path: "/snake",
  });

  React.useEffect(() => {
    const saved = loadSaved();
    setHasSavedGame(Boolean(saved));
    if (query.get("resume") === "1" && saved) {
      setGame(saved); setElapsed(saved.elapsed); stateRef.current = saved.state;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the mutable game state in a ref for the tick loop.
  React.useEffect(() => {
    stateRef.current = game?.state ?? null;
    if (game?.state && canvasRef.current) drawSnake(canvasRef.current, game.state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.state]);

  React.useEffect(() => {
    if (!game || !started || isSnakeRoundOver(game.state)) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [game?.savedAt, game?.state.foodsEaten, started]);

  // Persist the live game (throttled to once per second via elapsed changes).
  React.useEffect(() => {
    if (game && !isSnakeRoundOver(game.state)) {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...game, state: serializeSnakeGame(game.state), elapsed })); setHasSavedGame(true); } catch { /* Storage is optional. */ }
    }
  }, [game, elapsed]);

  const queueDirection = (dir: SnakeDirection) => {
    setStarted(true);
    const queue = directionQueueRef.current;
    const last = queue.length ? queue[queue.length - 1] : stateRef.current?.direction;
    if (last && isOppositeCheck(last, dir)) return;
    if (queue.length < 3) queue.push(dir);
  };
  const isOppositeCheck = (a: SnakeDirection, b: SnakeDirection) =>
    (a === "up" && b === "down") || (a === "down" && b === "up")
    || (a === "left" && b === "right") || (a === "right" && b === "left");

  const tick = React.useCallback(() => {
    const current = stateRef.current;
    if (!current || paused || finishedRef.current || isSnakeRoundOver(current)) return;
    const dir = directionQueueRef.current.shift() ?? null;
    const result = stepSnake(current, dir, activeGameRef.current?.seed ?? 1);
    if (result.state === current) return;
    const nextState = result.state;
    stateRef.current = nextState;
    setGame((g) => g ? { ...g, state: nextState } : g);
    if (canvasRef.current) drawSnake(canvasRef.current, nextState);
    if (result.ate) sounds.note();
    if (result.died) { sounds.click(); finishRound(nextState); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Game loop — tick rate comes from the level speed. Waits for the first
  // player input so the snake never moves before the user is ready.
  React.useEffect(() => {
    if (!game || !started || paused || isSnakeRoundOver(game.state)) return;
    const level = SNAKE_LEVELS[game.difficulty];
    const ms = Math.max(40, Math.round(1000 / level.speed));
    const id = window.setInterval(tick, ms);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.savedAt, game?.difficulty, paused, started, game?.state.foodsEaten, game?.state.alive]);

  // Keyboard controls.
  React.useEffect(() => {
    if (!game || isSnakeRoundOver(game.state)) return;
    const map: Record<string, SnakeDirection> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const dir = map[e.key];
      if (dir) { e.preventDefault(); sounds.click(); queueDirection(dir); }
      else if (e.key === " " || e.key === "p" || e.key === "P") { e.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.savedAt, game?.state.alive, paused]);

  const finishRound = (finalState: SnakeGameState) => {
    const current = activeGameRef.current;
    if (!current || finishedRef.current) return;
    finishedRef.current = true;
    directionQueueRef.current = [];
    const won = finalState.foodsEaten >= SNAKE_LEVELS[current.difficulty].foods;
    const updated: SavedGame = { ...current, state: finalState };
    setGame(updated);
    setRunFinished(true);
    if (won) {
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3200);
    }
    recordSnakeCompletion(profileId, current.difficulty, SNAKE_LEVELS[current.difficulty].foods, finalState.foodsEaten, finalState.moves, elapsedRef.current, finalState.score, won);
    localStorage.removeItem(SAVE_KEY);
    setHasSavedGame(false);
    void completeGame(updated, finalState, elapsedRef.current);
  };

  const completeGame = async (completed: SavedGame, finalState: SnakeGameState, finalElapsed: number) => {
    if (finishedRef.current && reward) return;
    setRewardLoading(true);
    setRewardError(null);
    const won = finalState.foodsEaten >= SNAKE_LEVELS[completed.difficulty].foods;
    try {
      const pending = pendingGameRef.current;
      let gameId = completed.gameId ?? (pending?.savedAt === completed.savedAt ? await pending.promise : null);
      if (!gameId && profileId && navigator.onLine !== false) {
        const createController = new AbortController();
        const createTimeout = window.setTimeout(() => createController.abort(), 5000);
        try {
          const created = await customFetch<{ id: number }>("/api/snake-games", {
            method: "POST",
            body: JSON.stringify({
              profileId,
              difficulty: completed.difficulty,
              seed: completed.seed,
              ...(completed.dailyDate ? { dailyDate: completed.dailyDate } : {}),
            }),
            signal: createController.signal,
          });
          gameId = created.id;
          setGame((current) => current?.savedAt === completed.savedAt ? { ...current, gameId: created.id } : current);
        } finally {
          window.clearTimeout(createTimeout);
        }
      }
      if (!gameId) throw new Error("Game could not be saved");
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      let result: SnakeReward;
      try {
        result = await customFetch<SnakeReward>(`/api/snake-games/${gameId}/complete`, {
          method: "POST",
          body: JSON.stringify({
            elapsedSeconds: finalElapsed,
            foodEaten: finalState.foodsEaten,
            moves: finalState.moves,
            score: finalState.score,
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
        queryClient.invalidateQueries({ queryKey: [`/api/snake-daily-challenge/status/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: ["snake-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments/leaderboard"] });
        window.dispatchEvent(new CustomEvent(ACHIEVEMENT_COMPLETION_EVENT, { detail: { profileId } }));
      }
    } catch (error) {
      console.error("[Snake] Could not save completion rewards:", error);
      if (activeGameRef.current?.savedAt === completed.savedAt) {
        setReward({ points: 0, xpEarned: 0, gemsEarned: 0, foodEaten: finalState.foodsEaten, score: finalState.score, won, offline: true });
        setRewardError(error instanceof Error ? error.message : "Unknown API error");
      }
    } finally {
      if (activeGameRef.current?.savedAt === completed.savedAt) setRewardLoading(false);
    }
  };

  const endRunEarly = () => {
    if (!game || finishedRef.current) return;
    setEndConfirm(false);
    finishRound(game.state);
  };

  const startGame = (level: SnakeDifficulty, dailyDate?: string, seed?: number, existingGameId?: number, challengeId?: number) => {
    sounds.click();
    const savedAt = Date.now();
    const boardSeed = seed ?? Math.floor(Math.random() * 2_147_483_647) + 1;
    const nextGame: SavedGame = {
      difficulty: level, seed: boardSeed,
      state: createSnakeGame(level, boardSeed),
      elapsed: 0, savedAt,
      ...(dailyDate ? { dailyDate } : {}), ...(existingGameId ? { gameId: existingGameId } : {}), ...(challengeId ? { challengeId } : {}),
    };
    stateRef.current = nextGame.state;
    directionQueueRef.current = [];
    setGame(nextGame); setReward(null); setRewardError(null); setRewardLoading(false); setRunFinished(false); setPaused(false); setStarted(false);
    setElapsed(0); setChallengeResult(null); finishedRef.current = false;
    setLocation(dailyDate
      ? `/snake?play=1&dailyDate=${dailyDate}&difficulty=${level}&seed=${boardSeed}`
      : challengeId
        ? `/snake?play=1&challengeId=${challengeId}&gameId=${existingGameId}&difficulty=${level}&seed=${boardSeed}`
        : "/snake?play=1");
    if (existingGameId) {
      pendingGameRef.current = { savedAt, promise: Promise.resolve(existingGameId) };
      return;
    }
    const promise = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const { id } = await customFetch<{ id: number }>("/api/snake-games", {
          method: "POST",
          body: JSON.stringify({
            profileId,
            difficulty: level,
            seed: boardSeed,
            ...(dailyDate ? { dailyDate } : {}),
          }),
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
    const requestedDifficulty = query.get("difficulty") as SnakeDifficulty | null;
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

  // Challenge result polling.
  React.useEffect(() => {
    if (!game?.challengeId || !isSnakeRoundOver(game.state)) { setChallengeResult(null); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const detail = await customFetch<SnakeChallengeResult>(`/api/snake-challenges/${game.challengeId}`);
        if (cancelled) return;
        setChallengeResult(detail);
        if (detail.status !== "completed") timer = setTimeout(refresh, 5000);
      } catch { if (!cancelled) timer = setTimeout(refresh, 5000); }
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.state.foodsEaten, game?.state.alive, game?.challengeId]);

  const shareResult = async () => {
    if (!game) return;
    const url = appShareUrlForPath("/snake");
    const cfg = SNAKE_LEVELS[game.difficulty];
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const rewardLine = reward && !reward.offline
      ? `+${reward.points.toLocaleString()} pts · +${reward.xpEarned} XP · +${reward.gemsEarned} 💎`
      : null;
    const lines = [
      `🐍 ${cfg.label} Snake: ${game.state.foodsEaten} apples in ${fmt(elapsed)}!`,
      rewardLine,
      rank ? `🏅 ${rank} · Play Brain Games . Online` : "🧠 Play Brain Games . Online",
      `🔗 ${url}`,
    ].filter((line): line is string => Boolean(line));
    try {
      const result = await shareOrDownloadShareCard({
        title: "Snake result",
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: "#16a34a",
        filename: "snake-result.png",
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

  const roundOver = Boolean(game && isSnakeRoundOver(game.state));
  const finished = Boolean(game && roundOver && runFinished);

  if (finished && game) {
    const cfg = SNAKE_LEVELS[game.difficulty];
    const won = game.state.foodsEaten >= cfg.foods;
    return <main className="mx-auto w-full max-w-lg space-y-4 px-3 py-5 sm:px-6 sm:py-8">
      {showConfetti && <Confetti />}
      <section className={`relative isolate overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-center text-white shadow-xl sm:p-6 ${won ? "from-green-500 via-emerald-500 to-teal-500 shadow-green-500/20" : "from-slate-600 via-slate-700 to-slate-800 shadow-slate-500/20"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/15" />
        <div className="relative z-10 space-y-2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/20 text-3xl">{won ? "🏆" : "💥"}</div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75">{game.dailyDate ? "Daily Snake" : "Snake"} {won ? "round complete" : "game over"}</p>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">{game.state.foodsEaten} apples eaten</h1>
          <p className="text-sm text-white/85">{cfg.label} · {fmt(elapsed)} · {game.state.moves.toLocaleString()} moves · Score {game.state.score.toLocaleString()}</p>
          {game.dailyDate && <p className="text-sm font-semibold text-white/90">📅 Today&apos;s shared daily run</p>}
          {reward?.isPersonalBest && <p className="pt-1 text-sm font-bold text-amber-100">🏆 New personal best score!</p>}
          {game.challengeId && <p className="pt-1 text-sm font-bold text-white">⚔️ Challenge score submitted</p>}
          <Button variant="secondary" className="mt-2 gap-2" onClick={() => void shareResult()}><Share2 className="h-4 w-4"/> Share your result</Button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        {game.challengeId
          ? <Button className="w-full gap-2" onClick={() => setLocation("/challenges?tab=snake")}><Trophy className="h-4 w-4"/> Return to Snake challenge</Button>
          : <Button className="w-full gap-2" onClick={() => startGame(game.difficulty, game.dailyDate, game.seed, undefined, undefined)}><RotateCcw className="h-4 w-4"/> Play again · {cfg.label}</Button>}
        <div className="grid grid-cols-2 gap-2">
          {availableDifficulties.map((id) => {
            const level = SNAKE_LEVELS[id];
            const active = id === game.difficulty;
            return <button key={id} type="button" onClick={() => startGame(id)} className={`min-h-14 rounded-xl border-2 px-3 py-2 text-left transition ${active ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-border hover:border-green-300 hover:bg-green-50/60 dark:hover:bg-green-950/20"}`}>
              <span className="block text-sm font-bold">{level.label}{active ? " · Current" : ""}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{level.gridSize}×{level.gridSize} · {level.mode === "baby" ? "Kids" : "Adult"}</span>
            </button>;
          })}
        </div>
        {!game.dailyDate && !game.challengeId && <Button variant="outline" className="w-full gap-2" onClick={() => setLocation("/snake-challenge")}><Flame className="h-4 w-4"/> Try today&apos;s daily challenge</Button>}
        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setGame(null)}><LayoutGrid className="h-4 w-4"/> Game home</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/leaderboard/snake")}><Trophy className="h-4 w-4"/> Leaderboard</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/profile?tab=snake")}><LayoutGrid className="h-4 w-4"/> My stats</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/")}><Home className="h-4 w-4"/> Portal</Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Timer, label: "Time", value: fmt(elapsed) },
          { icon: Check, label: "Apples", value: `${game.state.foodsEaten}` },
          { icon: LayoutGrid, label: "Score", value: game.state.score.toLocaleString() },
          { icon: X, label: "Moves", value: game.state.moves.toLocaleString() },
        ].map(({ icon: Icon, label, value }) => <div key={label} className="space-y-1 rounded-xl border bg-card p-3 text-center sm:p-4"><Icon className="mx-auto h-4 w-4 text-green-600"/><p className="text-base font-black tabular-nums sm:text-lg">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>)}
      </div>

      <section className="rounded-2xl border-2 border-green-200/70 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-4 shadow-sm dark:border-green-800/50 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-teal-950/30">
        {rewardLoading ? <div className="py-2 text-center text-sm font-semibold text-muted-foreground">Calculating your score and rewards…</div> : reward?.offline ? <div className="py-2 text-center"><p className="font-semibold text-green-900 dark:text-green-200">Rewards could not be saved</p><p className="mt-1 text-xs text-muted-foreground">{rewardError || "The game server could not save this result."}</p></div> : reward ? <><div className="grid grid-cols-3 items-center gap-2 text-center">
          <div><p className="text-2xl font-black text-green-800 dark:text-green-200">{reward.points.toLocaleString()}</p><p className="text-xs font-semibold text-muted-foreground">Points</p></div>
          <div className="border-x border-green-300/70 px-2 dark:border-green-700/60"><p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">+{reward.xpEarned}</p><p className="text-xs font-semibold text-muted-foreground">XP</p></div>
          <div><p className="text-2xl font-black text-teal-700 dark:text-teal-300">+{reward.gemsEarned} 💎</p><p className="text-xs font-semibold text-muted-foreground">Gems</p></div>
        </div><p className="col-span-3 mt-2 text-[11px] text-muted-foreground">Points scale with apples eaten, completion time, and move efficiency.</p></> : <div className="py-2 text-center text-sm text-muted-foreground">Your rewards are being prepared.</div>}
      </section>

      {game.challengeId && <section className="rounded-xl border border-green-200 bg-card p-4 text-center dark:border-green-800" aria-live="polite">
        <h2 className="font-bold">Challenge result</h2>
        {!challengeResult || challengeResult.status !== "completed" ? <p className="mt-1 text-sm text-muted-foreground">You finished with {game.state.foodsEaten} apples. Waiting for your opponent to finish…</p> : (() => {
          const mine = challengeResult.challengerId === profileId ? challengeResult.challengerPoints : challengeResult.challengedPoints;
          const theirs = challengeResult.challengerId === profileId ? challengeResult.challengedPoints : challengeResult.challengerPoints;
          const opponent = challengeResult.challengerId === profileId ? challengeResult.challengedUsername : challengeResult.challengerUsername;
          const outcome = challengeResult.winnerId === null ? "It’s a tie!" : challengeResult.winnerId === profileId ? "You won the challenge!" : "You lost the challenge.";
          return <><p className="mt-1 text-lg font-black">{outcome}</p><p className="mt-1 text-sm text-muted-foreground">You: {mine ?? 0} points · {opponent}: {theirs ?? 0} points</p><p className="mt-1 text-xs text-muted-foreground">{challengeResult.winnerId === null ? "Both players earned 2 bonus gems." : challengeResult.winnerId === profileId ? "You earned 10 bonus gems." : `${opponent} earned 10 bonus gems.`}</p></>;
        })()}
      </section>}
    </main>;
  }

  const cfg = game ? SNAKE_LEVELS[game.difficulty] : null;
  const canvasSize = game ? Math.min(520, typeof window !== "undefined" ? window.innerWidth - 48 : 520) : 0;

  return <main className={`mx-auto w-full px-3 py-3 sm:px-6 sm:py-8 ${game ? "max-w-3xl" : "max-w-lg"}`}>
    {showConfetti && <Confetti />}
    <div className="relative isolate mb-3 flex items-center sm:mb-4 justify-between gap-3 overflow-hidden rounded-2xl border-2 border-green-200/80 bg-gradient-to-br from-green-50 via-white to-emerald-50 px-3 py-2 shadow-lg shadow-green-500/10 sm:px-4 sm:py-3 dark:border-green-800/60 dark:from-green-950/60 dark:via-card dark:to-emerald-950/60">
      <Button variant="ghost" size="sm" className="relative z-10 shrink-0 px-1" onClick={() => (game ? setGame(null) : setLocation("/"))}><ArrowLeft className="mr-1 h-4 w-4"/> {game ? "Back" : "Home"}</Button>
      <div className="relative z-10 min-w-0 text-right">
        <h1 className="font-serif text-xl font-bold leading-tight tracking-tight sm:text-3xl">Snake</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{profile?.username ? `Welcome back, ${profile.username}` : "Eat, grow, survive"}</p>
      </div>
      <Button variant="ghost" size="icon" className="relative z-10 shrink-0" aria-label={sounds.enabled ? "Mute sounds" : "Enable sounds"} onClick={sounds.toggle}>{sounds.enabled ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}</Button>
    </div>
    <div className={`grid gap-4 sm:gap-5 ${game ? "" : "grid-cols-1"}`}>
      <section className="min-w-0 space-y-3 sm:space-y-4">
        {!game ? <>
          {hasSavedGame && (() => { const saved = loadSaved(); return saved ? <button onClick={() => setLocation("/snake?resume=1")} className="flex w-full items-center gap-3 rounded-xl border-2 border-green-300/60 bg-card px-3 py-2.5 sm:px-4 sm:py-3 text-left transition hover:bg-green-50 dark:border-green-800/50 dark:hover:bg-green-950/30"><RotateCcw className="h-4 w-4 shrink-0 text-green-600"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-green-700 dark:text-green-300">Resume Snake</span><span className="block text-xs text-muted-foreground">{SNAKE_LEVELS[saved.difficulty].label} · {saved.state.foodsEaten} apples</span></span><span className="text-lg text-green-600">→</span></button> : null; })()}
          <div className="relative isolate overflow-hidden rounded-2xl border-2 border-green-200/80 bg-gradient-to-br from-white via-green-50 to-emerald-50 p-3 shadow-xl shadow-green-500/10 dark:border-green-800/50 dark:from-card dark:via-green-950/35 dark:to-emerald-950/40 sm:p-5">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-emerald-300/25 blur-2xl dark:bg-emerald-400/10" />
            <div className="relative z-10 mb-4 hidden items-center gap-3 rounded-xl border border-green-200/70 bg-white/65 px-3 py-3 dark:border-green-800/50 dark:bg-slate-950/20 sm:flex">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-green-500/15 text-2xl">🐍</span>
              <div className="min-w-0 flex-1"><h2 className="font-serif text-lg font-bold">Ready to slither?</h2><p className="text-xs leading-relaxed text-muted-foreground">Guide the snake to every apple — walls and your own tail are deadly. Faster levels demand quicker reflexes.</p></div>
              <div className="hidden grid-cols-3 gap-1 rounded-lg border border-green-200/70 bg-white/70 p-1 sm:grid dark:border-green-800/50 dark:bg-slate-950/30">
                {[0, 1, 2].map((i) => <span key={i} className="grid h-3 w-3 place-items-center"><span className="h-2.5 w-2.5 rounded-sm bg-green-400" /></span>)}
              </div>
            </div>
            <p className="relative z-10 mb-2 hidden text-xs font-semibold uppercase tracking-widest text-green-700 dark:text-green-300 sm:block">Choose Difficulty</p>
            <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-2.5">
              {(Object.keys(SNAKE_LEVELS) as SnakeDifficulty[]).filter((id) => availableDifficulties.includes(id)).map((id) => {
                const level = SNAKE_LEVELS[id];
                const meta = { easy: "🌱", medium: "🐍", hard: "🔥", expert: "🏔️" }[id];
                return <button key={id} onClick={() => startGame(id)} className="group flex min-h-[72px] sm:min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-green-200/80 bg-gradient-to-br from-green-50 to-emerald-50 p-2 text-center shadow-sm sm:p-3 transition-all hover:-translate-y-0.5 hover:border-green-400 hover:shadow-md active:scale-[0.98] dark:border-green-800/60 dark:from-green-950/45 dark:to-emerald-950/40">
                  <span className="grid h-8 w-8 place-items-center sm:h-9 sm:w-9 rounded-xl bg-green-500/10 text-xl group-hover:bg-green-500/20">{meta}</span>
                  <span className="text-sm font-bold leading-tight">{level.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{level.gridSize}×{level.gridSize} · endless apples</span>
                </button>;
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setLocation("/profile?tab=snake")} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left sm:p-3 transition hover:border-green-300 hover:bg-muted/50"><LayoutGrid className="h-5 w-5 shrink-0 text-green-600"/><span><span className="block text-sm font-semibold">My Stats</span><span className="hidden text-xs text-muted-foreground sm:block">Best scores &amp; streaks</span></span></button>
            <button onClick={() => setLocation("/leaderboard/snake")} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left sm:p-3 transition hover:border-green-300 hover:bg-muted/50"><Trophy className="h-5 w-5 shrink-0 text-green-600"/><span><span className="block text-sm font-semibold">Leaderboard</span><span className="hidden text-xs text-muted-foreground sm:block">Top scores</span></span></button>
          </div>
          <button onClick={() => setLocation("/snake-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-green-200 bg-green-50/60 px-3 py-2.5 sm:px-4 sm:py-3 text-left transition hover:bg-green-50 dark:border-green-800/40 dark:bg-green-950/20 dark:hover:bg-green-950/30">
            <span className="text-lg leading-none">🔥</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Daily Snake</span><span className="block text-xs text-muted-foreground">One shared board seed for everyone each day</span></span>
            <span className="text-green-500">→</span>
          </button>
          <div className="home-info-links flex items-center justify-center gap-4 rounded-xl border border-border bg-card px-3 py-2 sm:gap-6 sm:px-4 sm:py-2.5">
            <button onClick={() => setInfoModal("rules")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><BookOpen className="h-3.5 w-3.5" /> Rules</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("controls")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Keyboard className="h-3.5 w-3.5" /> Controls</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("backstory")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Scroll className="h-3.5 w-3.5" /> Backstory</button>
          </div>

          <MobileContentDisclosure
            id="snake-guidance"
            title="More Snake guidance"
            className="rounded-2xl border border-green-400/25 bg-card p-5 sm:p-6"
          >
            <section className="space-y-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">How to play and improve at Snake</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  The snake never stops moving — every apple makes it longer and
                  every wall or tail segment ends the run. Plan your path two or
                  three apples ahead, not just to the next one.
                </p>
              </div>
              <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                <article>
                  <h3 className="font-semibold text-foreground">Follow the edges early</h3>
                  <p className="mt-1">Long snakes survive longest near the walls where they can&apos;t be trapped. Coil in the centre only when you need room to turn.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Speed is the real difficulty</h3>
                  <p className="mt-1">Hard and Expert levels move much faster. Short, decisive turns beat long planning — commit early and correct with small adjustments.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Points reward clean runs</h3>
                  <p className="mt-1">Score scales with apples eaten, how fast you finish, and how efficiently you move. Wandering back and forth costs points.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Daily and duels are seeded</h3>
                  <p className="mt-1">The daily challenge and head-to-head duels give everyone the same food sequence — pure skill decides the winner.</p>
                </article>
              </div>
            </section>
          </MobileContentDisclosure>

          <Dialog open={infoModal === "rules"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-600" /> Rules</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>Guide the snake to eat apples for as long as you can — the run only ends when you crash.</p>
                <ul className="list-none space-y-2">
                  {[
                    "Choose a difficulty — Easy, Medium, Hard, or Expert.",
                    "The snake moves constantly; steer with arrows, WASD, swipe, or the on-screen pad.",
                    "Eat apples to grow — there is no limit, every apple is bonus score.",
                    "Hitting a wall or your own tail ends the run immediately.",
                    "The run ends only when you hit a wall or your own tail — survive longer and eat more for a bigger score.",
                  ].map((rule, index) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-500/10 text-xs font-bold text-green-700 dark:text-green-300">{index + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-1">Points, XP, and 💎 gems scale with the level, apples eaten, completion time, and move efficiency.</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={infoModal === "controls"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Keyboard className="h-5 w-5 text-green-600" /> Controls</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-2 font-semibold text-foreground">Touch / Mouse</p>
                  <div className="space-y-1.5 text-muted-foreground">
                    {[
                      ["Swipe on the board", "Steers the snake that direction"],
                      ["Arrow buttons", "Tap to turn — works on touch and desktop"],
                      ["Pause button", "Freezes the snake while you think"],
                      ["End round button", "Finishes the run and saves your score"],
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
                      ["Arrow keys / WASD", "Steer the snake"],
                      ["Space or P", "Pause / resume"],
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
                <DialogTitle className="flex items-center gap-2"><Scroll className="h-5 w-5 text-green-600" /> Backstory</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Snake began life in 1976 as a simple arcade cabinet game called
                  Blockade, and became a phenomenon in 1997 when Nokia bundled it
                  on the 6110 — the phone that introduced the world to Snake.
                </p>
                <p>
                  Its genius is minimalism: one line grows longer with every
                  pixel it eats, turning a trivial mechanic into an escalating
                  test of spatial planning. Speed, not complexity, is what makes
                  it hard — the same lesson speed-run players still chase today.
                </p>
                <p>
                  This version keeps the classic rules and adds four difficulty
                  levels from relaxed grids to expert velocity, a daily
                  challenge with a shared food sequence, head-to-head duels,
                  and persistent stats.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </> : <section className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-5">
          {/* Top controls */}
          <div className="mb-2 flex flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 px-2 py-1.5 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:px-3">
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Check className="h-3.5 w-3.5 text-green-600"/>🍎 {game.state.foodsEaten}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Clock3 className="h-3.5 w-3.5 text-green-600"/>{fmt(elapsed)}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><LayoutGrid className="h-3.5 w-3.5 text-green-600"/>{game.state.score.toLocaleString()}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><LayoutGrid className="h-3.5 w-3.5 text-green-600"/>{cfg?.label}</span>
            {paused && <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-1 font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><Pause className="h-3.5 w-3.5"/>Paused</span>}
            <Button variant="outline" size="sm" className="ml-auto h-8 shrink-0 gap-1 px-2" onClick={() => setPaused((p) => !p)}>{paused ? <Play className="h-4 w-4"/> : <Pause className="h-4 w-4"/>}<span className="hidden sm:inline">{paused ? "Resume" : "Pause"}</span></Button>
            <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1 px-2 text-red-600" onClick={() => setEndConfirm(true)}><X className="h-4 w-4"/> <span className="hidden sm:inline">End round</span></Button>
          </div>

          {/* Board */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="rounded-2xl bg-gradient-to-br from-green-700 via-emerald-700 to-teal-800 p-2 shadow-lg shadow-green-900/20 sm:p-3">
              <canvas
                ref={canvasRef}
                width={canvasSize || 480}
                height={canvasSize || 480}
                className="block w-full rounded-xl bg-slate-950/90 touch-none select-none"
                style={{ aspectRatio: "1 / 1" }}
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  touchRef.current = { x: t.clientX, y: t.clientY };
                }}
                onTouchEnd={(e) => {
                  const start = touchRef.current;
                  touchRef.current = null;
                  if (!start) return;
                  const t = e.changedTouches[0];
                  const dx = t.clientX - start.x;
                  const dy = t.clientY - start.y;
                  if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
                  sounds.click();
                  queueDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
                }}
              />
            </div>
            {!started && !isSnakeRoundOver(game.state) && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-slate-950/60 backdrop-blur-[2px]"><div className="flex flex-col items-center gap-3 px-4 text-center"><span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-800 shadow">Ready? The snake moves on your first input</span><Button size="sm" className="gap-2 bg-green-600 hover:bg-green-500" onClick={() => { sounds.click(); setStarted(true); }}><Play className="h-4 w-4"/> Start</Button></div></div>}
            {paused && started && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-slate-950/50 backdrop-blur-[2px]"><span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-800 shadow">Paused — press Space to resume</span></div>}
          </div>

          {/* D-pad */}
          <div className="mx-auto mt-3 grid w-44 grid-cols-3 place-items-center gap-1.5">
            <span />
            <button type="button" aria-label="Turn up" onClick={() => { sounds.click(); queueDirection("up"); }} className="grid h-11 w-11 place-items-center rounded-full bg-green-600 text-white shadow-md transition hover:bg-green-500 active:scale-95"><ArrowUp className="h-5 w-5"/></button>
            <span />
            <button type="button" aria-label="Turn left" onClick={() => { sounds.click(); queueDirection("left"); }} className="grid h-11 w-11 place-items-center rounded-full bg-green-600 text-white shadow-md transition hover:bg-green-500 active:scale-95"><ArrowLeft className="h-5 w-5"/></button>
            <button type="button" aria-label="Turn down" onClick={() => { sounds.click(); queueDirection("down"); }} className="grid h-11 w-11 place-items-center rounded-full bg-green-600 text-white shadow-md transition hover:bg-green-500 active:scale-95"><ArrowDown className="h-5 w-5"/></button>
            <button type="button" aria-label="Turn right" onClick={() => { sounds.click(); queueDirection("right"); }} className="grid h-11 w-11 place-items-center rounded-full bg-green-600 text-white shadow-md transition hover:bg-green-500 active:scale-95"><ArrowRight className="h-5 w-5"/></button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Arrows / WASD / swipe / pad · Space pauses</p>
        </section>}
      </section>
    </div>

    <Dialog open={endConfirm} onOpenChange={setEndConfirm}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>End this run?</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Your progress ({game?.state.foodsEaten ?? 0} apples) will be saved now.</p>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setEndConfirm(false)}>Keep playing</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={endRunEarly}>End round</Button>
        </div>
      </DialogContent>
    </Dialog>
  </main>;
}
