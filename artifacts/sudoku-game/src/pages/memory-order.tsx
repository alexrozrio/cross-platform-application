import React from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, BookOpen, CalendarDays, Check, Clock3, Eye, Flame, Home, Keyboard, LayoutGrid, Lightbulb, MousePointerClick, RotateCcw, Scroll, Share2, Target, Timer, Trophy, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useImageTheme } from "@/hooks/use-image-theme";
import { useSound } from "@/hooks/use-sound";
import { usePageMeta } from "@/components/page-meta";
import { Confetti } from "@/components/confetti";
import { customFetch, useGetProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { appShareUrlForPath } from "@/lib/app-links";
import { shareOrDownloadShareCard } from "@/lib/share-card";
import { getLevelFromXp } from "@/lib/levels";
import { toast } from "sonner";
import { ACHIEVEMENT_COMPLETION_EVENT } from "@/lib/achievement-events";
import { MEMORY_ORDER_LEVEL_ORDER, MEMORY_ORDER_LEVELS, memoryOrderRound, type MemoryOrderLevel, type MemoryOrderQuestion } from "@/lib/memory-order";
import { getMemoryOrderHistory, recordMemoryOrderCompletion, summarizeMemoryOrderStats } from "@/lib/memory-order-stats";
import { useInterstitialAfterGame } from "@/lib/interstitial-ads";
import { useRewardedInterstitialTip } from "@/lib/rewarded-interstitial-tips";
import { getTheme, IMAGE_THEMES, type ThemeId } from "@/lib/themes";
import { ThemeIcon } from "@/components/theme-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileContentDisclosure } from "@/components/mobile-content-disclosure";

const SAVE_KEY = "brain-games-memory-order-session";

type SavedGame = {
  level: MemoryOrderLevel;
  themeId: string;
  questions: MemoryOrderQuestion[];
  answers: number[][];
  index: number;
  correct: number;
  hintsUsed: number;
  picks: number[];
  phase: "view" | "answer";
  elapsed: number;
  savedAt: number;
  status: "playing" | "done";
  seed: number;
  gameId?: number;
  dailyDate?: string;
  challengeId?: number;
};

type MemoryOrderReward = { points: number; xpEarned: number; gemsEarned: number; elapsedSeconds: number; questions: number; correct: number; isPersonalBest?: boolean; offline?: boolean };
type MemoryOrderChallengeResult = { id: number; status: string; challengerId: number; challengedId: number; winnerId: number | null; challengerUsername: string; challengedUsername: string; challengerPoints: number | null; challengedPoints: number | null; challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null };

function freeHintLimit(level: MemoryOrderLevel): number {
  return MEMORY_ORDER_LEVELS[level].mode === "baby" ? 2 : 1;
}

function isMemoryOrderQuestion(value: unknown): value is MemoryOrderQuestion {
  if (!value || typeof value !== "object") return false;
  const question = value as MemoryOrderQuestion;
  return Array.isArray(question.sequence) && question.sequence.length > 0 && question.sequence.every((item) => Number.isInteger(item)) &&
    Array.isArray(question.tiles) && question.tiles.length === question.sequence.length && question.tiles.every((item) => Number.isInteger(item));
}

function loadSaved(): SavedGame | null {
  try {
    const value = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as SavedGame | null;
    if (value && MEMORY_ORDER_LEVEL_ORDER.includes(value.level) && Array.isArray(value.questions) && value.questions.length > 0 && value.questions.every(isMemoryOrderQuestion)) {
      value.answers = Array.isArray(value.answers) ? value.answers : [];
      value.index = Number.isFinite(value.index) ? Math.min(value.questions.length - 1, Math.max(0, value.index)) : 0;
      value.correct = Number.isFinite(value.correct) ? Math.max(0, value.correct) : 0;
      value.hintsUsed = Number.isFinite(value.hintsUsed) ? Math.max(0, value.hintsUsed) : 0;
      value.picks = Array.isArray(value.picks) ? value.picks.filter((pick) => Number.isInteger(pick)) : [];
      value.status = value.status === "done" ? "done" : "playing";
      // A resumed question always restarts at the view phase so the player
      // re-memorizes the sequence instead of continuing mid-answer.
      value.phase = "view";
      value.picks = [];
      value.themeId = IMAGE_THEMES.some((theme) => theme.id === value.themeId) ? value.themeId : "shapes";
      return value;
    }
  } catch { /* Ignore an unavailable or invalid save. */ }
  return null;
}

const fmt = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function MemoryOrderPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const query = new URLSearchParams(search);
  const { profileId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId as number);
  const queryClient = useQueryClient();
  const { themeId: imageThemeId, setThemeId } = useImageTheme();
  const sounds = useSound(profile?.soundEnabled);
  const gameMode = profile?.gameMode ?? "4all";
  const levels = MEMORY_ORDER_LEVEL_ORDER.filter((level) =>
    gameMode === "children" ? MEMORY_ORDER_LEVELS[level].mode === "baby" :
    gameMode === "adult" ? MEMORY_ORDER_LEVELS[level].mode === "adult" : true,
  );
  const {
    isShowingRewardedTip,
    showAdForExtraTip,
    isEnabled: canShowRewardedTip,
  } = useRewardedInterstitialTip();

  const [game, setGame] = React.useState<SavedGame | null>(null);
  useInterstitialAfterGame(game?.status === "done", game?.status === "playing");
  const [elapsed, setElapsed] = React.useState(0);
  const [viewLeft, setViewLeft] = React.useState(0);
  const [hintTile, setHintTile] = React.useState<number | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [hasSavedGame, setHasSavedGame] = React.useState(false);
  const [reward, setReward] = React.useState<MemoryOrderReward | null>(null);
  const [rewardLoading, setRewardLoading] = React.useState(false);
  const [rewardError, setRewardError] = React.useState<string | null>(null);
  const [challengeResult, setChallengeResult] = React.useState<MemoryOrderChallengeResult | null>(null);
  const [infoModal, setInfoModal] = React.useState<"rules" | "controls" | "backstory" | null>(null);
  const activeGameRef = React.useRef(game);
  activeGameRef.current = game;
  const pendingGameRef = React.useRef<{ savedAt: number; promise: Promise<number | null> } | null>(null);
  const directStartHandledRef = React.useRef(false);
  const advanceTimerRef = React.useRef<number | null>(null);

  usePageMeta({
    title: "Memory Order Game | Play Brain Games",
    description: "Memorize the order of images, then tap them back in sequence. Play free Memory Order puzzles from Easy to Expert.",
    path: "/memory-order",
  });

  React.useEffect(() => {
    const saved = loadSaved();
    setHasSavedGame(Boolean(saved));
    if (saved && (query.get("resume") === "1" || query.get("play") === "1")) {
      setGame(saved);
      setElapsed(saved.elapsed);
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

  React.useEffect(() => () => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
  }, []);

  const question = game?.questions[game.index];
  const config = game ? MEMORY_ORDER_LEVELS[game.level] : null;

  // View-phase countdown: when it expires the answer grid appears.
  React.useEffect(() => {
    if (!game || game.status !== "playing" || game.phase !== "view" || !config) return;
    setViewLeft(config.viewSeconds);
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = config.viewSeconds - (Date.now() - started) / 1000;
      setViewLeft(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(tick);
        setGame((current) => current && current.status === "playing" && current.phase === "view"
          ? { ...current, phase: "answer", picks: [] }
          : current);
        sounds.click();
      }
    }, 100);
    return () => window.clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.status, game?.phase, game?.index, game?.savedAt, config?.viewSeconds]);

  React.useEffect(() => { setHintTile(null); }, [game?.index, game?.phase]);

  const completeGame = async (completed: SavedGame, finalElapsed: number) => {
    setRewardLoading(true);
    setReward(null);
    setRewardError(null);
    try {
      const pending = pendingGameRef.current;
      let gameId = completed.gameId ?? (pending?.savedAt === completed.savedAt ? await pending.promise : null);
      if (!gameId && profileId && navigator.onLine !== false) {
        const createController = new AbortController();
        const createTimeout = window.setTimeout(() => createController.abort(), 5000);
        try {
          const created = await customFetch<{ id: number }>("/api/memory-order-games", {
            method: "POST",
            body: JSON.stringify({ profileId, level: completed.level, theme: completed.themeId, seed: completed.seed, ...(completed.dailyDate ? { dailyDate: completed.dailyDate } : {}) }),
            signal: createController.signal,
          });
          gameId = created.id;
          const createdGameId = created.id;
          setGame((current) => current?.savedAt === completed.savedAt ? { ...current, gameId: createdGameId } : current);
        } finally {
          window.clearTimeout(createTimeout);
        }
      }
      if (!gameId) throw new Error("Game could not be saved");
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      let result: MemoryOrderReward;
      try {
        result = await customFetch<MemoryOrderReward>(`/api/memory-order-games/${gameId}/complete`, {
          method: "POST",
          body: JSON.stringify({ elapsedSeconds: finalElapsed, answers: completed.answers }),
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
        queryClient.invalidateQueries({ queryKey: [`/api/memory-order-games/daily-challenge/status/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: ["memory-order-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments/leaderboard"] });
        window.dispatchEvent(new CustomEvent(ACHIEVEMENT_COMPLETION_EVENT, { detail: { profileId } }));
      }
    } catch (error) {
      console.error("[Memory Order] Could not save completion rewards:", error);
      setRewardError(error instanceof Error ? error.message : "The game server could not save this result.");
      if (activeGameRef.current?.savedAt === completed.savedAt) {
        setReward({ points: 0, xpEarned: 0, gemsEarned: 0, elapsedSeconds: finalElapsed, questions: completed.questions.length, correct: completed.correct, offline: true });
      }
    } finally {
      if (activeGameRef.current?.savedAt === completed.savedAt) setRewardLoading(false);
    }
  };

  const finishRound = React.useCallback((completed: SavedGame, finalElapsed: number) => {
    const done: SavedGame = { ...completed, status: "done", answers: [...completed.answers] };
    setGame(done);
    setHintTile(null);
    localStorage.removeItem(SAVE_KEY);
    setHasSavedGame(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3200);
    recordMemoryOrderCompletion(profileId, done.level, finalElapsed, done.correct, done.questions.length, done.themeId);
    void completeGame(done, finalElapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const advanceQuestion = React.useCallback((current: SavedGame, finalElapsed: number) => {
    const currentQuestion = current.questions[current.index];
    if (!currentQuestion) return;
    const pickedValues = current.picks.map((tileIndex) => currentQuestion.tiles[tileIndex]);
    const wasCorrect = pickedValues.length === currentQuestion.sequence.length &&
      pickedValues.every((value, i) => value === currentQuestion.sequence[i]);
    const nextAnswers = [...current.answers, pickedValues];
    const next: SavedGame = {
      ...current,
      answers: nextAnswers,
      correct: current.correct + (wasCorrect ? 1 : 0),
      picks: [],
      phase: "view",
    };
    if (current.index + 1 >= current.questions.length) {
      sounds.complete();
      finishRound(next, finalElapsed);
    } else {
      setGame({ ...next, index: next.index + 1, phase: "view" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishRound]);

  const startGame = (level: MemoryOrderLevel, themeId: string = imageThemeId, dailyDate?: string, seed?: number, existingGameId?: number, challengeId?: number) => {
    sounds.click();
    const gameSeed = seed ?? (Math.floor(Math.random() * 2_147_483_646) + 1);
    const savedAt = Date.now();
    const nextGame: SavedGame = {
      level,
      themeId: IMAGE_THEMES.some((theme) => theme.id === themeId) ? themeId : "shapes",
      questions: memoryOrderRound(level, gameSeed),
      answers: [],
      index: 0,
      correct: 0,
      hintsUsed: 0,
      picks: [],
      phase: "view",
      elapsed: 0,
      savedAt,
      status: "playing",
      seed: gameSeed,
      ...(dailyDate ? { dailyDate } : {}),
      ...(challengeId ? { challengeId } : {}),
      ...(existingGameId ? { gameId: existingGameId } : {}),
    };
    setGame(nextGame);
    setReward(null);
    setRewardError(null);
    setChallengeResult(null);
    setHintTile(null);
    setRewardLoading(false);
    setElapsed(0);
    const params = new URLSearchParams({ play: "1", level, theme: nextGame.themeId, seed: String(gameSeed) });
    if (dailyDate) params.set("dailyDate", dailyDate);
    if (existingGameId) params.set("gameId", String(existingGameId));
    if (challengeId) params.set("challengeId", String(challengeId));
    setLocation(`/memory-order?${params.toString()}`);
    if (existingGameId) {
      pendingGameRef.current = { savedAt, promise: Promise.resolve(existingGameId) };
      return;
    }
    const promise = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const { id } = await customFetch<{ id: number }>("/api/memory-order-games", {
          method: "POST",
          body: JSON.stringify({ profileId: profileId ?? null, level, theme: nextGame.themeId, seed: gameSeed, ...(dailyDate ? { dailyDate } : {}) }),
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
    const requestedLevel = query.get("level");
    const level = MEMORY_ORDER_LEVEL_ORDER.includes(requestedLevel as MemoryOrderLevel) ? requestedLevel as MemoryOrderLevel : levels[0];
    if (!level) return;
    const requestedTheme = query.get("theme");
    const themeId = IMAGE_THEMES.some((theme) => theme.id === requestedTheme) ? requestedTheme! : imageThemeId;
    const seedValue = Number(query.get("seed"));
    const dailyDate = query.get("dailyDate");
    const existingGameId = Number(query.get("gameId"));
    const challengeId = Number(query.get("challengeId"));
    startGame(
      level,
      themeId,
      dailyDate && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate) ? dailyDate : undefined,
      Number.isInteger(seedValue) && seedValue > 0 ? seedValue : undefined,
      Number.isInteger(existingGameId) && existingGameId > 0 ? existingGameId : undefined,
      Number.isInteger(challengeId) && challengeId > 0 ? challengeId : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, profile?.gameMode, search, imageThemeId]);

  const pickTile = (tileIndex: number) => {
    if (!game || game.status !== "playing" || game.phase !== "answer" || !question) return;
    if (game.picks.includes(tileIndex) || game.picks.length >= question.sequence.length) return;
    const position = game.picks.length;
    const value = question.tiles[tileIndex];
    const isRightSpot = value === question.sequence[position];
    if (isRightSpot) sounds.place(); else sounds.error();
    const nextPicks = [...game.picks, tileIndex];
    const next: SavedGame = { ...game, picks: nextPicks };
    setGame(next);
    setHintTile(null);
    if (nextPicks.length >= question.sequence.length) {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;
        advanceQuestion(next, elapsed);
      }, 1400);
    }
  };

  const issueHint = (earnedExtraHint = false) => {
    if (!game || game.status !== "playing" || game.phase !== "answer" || !question) return;
    if (!earnedExtraHint && game.hintsUsed >= freeHintLimit(game.level)) return;
    if (game.picks.length >= question.sequence.length) return;
    const nextValue = question.sequence[game.picks.length];
    const tileIndex = question.tiles.indexOf(nextValue);
    if (tileIndex < 0) return;
    setGame({ ...game, hintsUsed: game.hintsUsed + 1 });
    setHintTile(tileIndex);
    sounds.click();
  };

  const canEarnExtraHint =
    canShowRewardedTip &&
    game?.status === "playing" &&
    game.phase === "answer" &&
    !!question &&
    game.hintsUsed >= freeHintLimit(game.level) &&
    game.picks.length < question.sequence.length &&
    !isShowingRewardedTip;

  const handleRewardedHint = () => {
    if (!canEarnExtraHint) return;
    void showAdForExtraTip(() => issueHint(true));
  };

  const exitToGameHome = () => {
    if (advanceTimerRef.current) { window.clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    setGame(null);
    setHintTile(null);
    setLocation("/memory-order");
  };

  const shareResult = async () => {
    if (!game) return;
    const url = appShareUrlForPath("/memory-order");
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const rewardLine = reward && !reward.offline
      ? `+${reward.points.toLocaleString()} pts · +${reward.xpEarned} XP · +${reward.gemsEarned} 💎`
      : null;
    const lines = [
      `🧠 Memory Order: ${game.correct}/${game.questions.length} sequences on ${MEMORY_ORDER_LEVELS[game.level].label} in ${fmt(elapsed)}!`,
      game.dailyDate ? "📅 Today's shared daily puzzle" : null,
      game.challengeId ? "⚔️ Challenge score submitted" : null,
      rewardLine,
      rank ? `🏅 ${rank} · Play Brain Games . Online` : "🧠 Play Brain Games . Online",
      `🔗 ${url}`,
    ].filter((line): line is string => Boolean(line));
    try {
      const result = await shareOrDownloadShareCard({
        title: "Memory Order result",
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: "#7c3aed",
        filename: "memory-order-result.png",
      });
      if (result === "downloaded") toast.success("Result image downloaded — attach it to your message!", { duration: 3000 });
    } catch {
      try {
        await navigator.clipboard.writeText(lines.join("\n"));
        toast.success("Sharing didn't complete. Text copied — paste it into your message.", { duration: 3500 });
      } catch { /* silent */ }
    }
  };

  const shareGame = async () => {
    const url = appShareUrlForPath("/memory-order");
    const lines = ["🧠 Memorize the order, then tap the images back in sequence!", "🧠 Play Brain Games . Online", `🔗 ${url}`];
    try {
      await navigator.share?.({ title: "Memory Order", text: lines.join("\n"), url }).catch(() => undefined);
    } catch { /* native share unavailable */ }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Invite link copied!", { duration: 2500 });
    } catch { /* silent */ }
  };

  React.useEffect(() => {
    const finished = game?.status === "done";
    if (!finished || !game?.challengeId) { setChallengeResult(null); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const detail = await customFetch<MemoryOrderChallengeResult>(`/api/memory-order-challenges/${game.challengeId}`);
        if (cancelled) return;
        setChallengeResult(detail);
        if (detail.status !== "completed") timer = setTimeout(refresh, 5000);
      } catch {
        if (!cancelled) timer = setTimeout(refresh, 8000);
      }
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [game?.status, game?.challengeId]);

  const header = (
    <div className="relative isolate mb-3 flex items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-purple-100 px-3 py-2 shadow-lg shadow-violet-500/10 sm:mb-4 sm:px-4 sm:py-3 dark:border-violet-800/60 dark:from-violet-950/60 dark:via-card dark:to-purple-950/60">
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-purple-300/30 blur-2xl dark:bg-purple-400/15" />
      <Button variant="ghost" size="sm" className="relative z-10 shrink-0 px-1" onClick={() => (game ? setGame(null) : setLocation("/"))}><ArrowLeft className="mr-1 h-4 w-4"/> {game ? "Back" : "Home"}</Button>
      <div className="relative z-10 min-w-0 text-right">
        <h1 className="font-serif text-xl font-bold leading-tight tracking-tight sm:text-3xl">Memory Order</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{profile?.username ? `Welcome back, ${profile.username}` : "Remember the order, then repeat it"}</p>
      </div>
      <Button variant="ghost" size="icon" className="relative z-10 shrink-0" aria-label={sounds.enabled ? "Mute sounds" : "Enable sounds"} onClick={sounds.toggle}>{sounds.enabled ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}</Button>
    </div>
  );

  // ---------- Result screen ----------
  if (game && game.status === "done") {
    const doneConfig = MEMORY_ORDER_LEVELS[game.level];
    const theme = getTheme(game.themeId);
    return <main className="mx-auto w-full max-w-lg space-y-4 px-3 py-5 sm:px-6 sm:py-8">
      {showConfetti && <Confetti />}
      <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-5 text-center text-white shadow-xl shadow-violet-500/20 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/15" />
        <div className="relative z-10 space-y-2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/20 text-3xl"><Eye className="h-7 w-7" /></div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75">{game.dailyDate ? "Daily Memory Order complete" : "Memory Order complete"}</p>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">You recalled {game.correct} sequence{game.correct === 1 ? "" : "s"}!</h1>
          <p className="text-sm text-white/85">{theme.name} · {doneConfig.label} · {doneConfig.detail} · {fmt(elapsed)}</p>
          {game.dailyDate && <p className="text-sm font-semibold text-white/90">📅 Today&apos;s shared daily puzzle</p>}
          {reward?.isPersonalBest && <p className="pt-1 text-sm font-bold text-amber-100">🏆 New personal best!</p>}
          {game.challengeId && <p className="pt-1 text-sm font-bold text-white">⚔️ Challenge score submitted</p>}
          <Button variant="secondary" className="mt-2 gap-2" onClick={() => void shareResult()}><Share2 className="h-4 w-4"/> Share your result</Button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        {game.challengeId
          ? <Button className="w-full gap-2" onClick={() => setLocation("/challenges?tab=memory-order")}><Trophy className="h-4 w-4"/> Return to Memory Order challenge</Button>
          : <Button className="w-full gap-2" onClick={() => startGame(game.level, game.themeId, game.dailyDate, game.seed)}><RotateCcw className="h-4 w-4"/> Play again · {doneConfig.label}</Button>}
        <div className="grid grid-cols-2 gap-2">
          {levels.map((level) => {
            const option = MEMORY_ORDER_LEVELS[level];
            const active = level === game.level;
            return <button key={level} type="button" onClick={() => startGame(level, game.themeId)} className={`min-h-14 rounded-xl border-2 px-3 py-2 text-left transition ${active ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30" : "border-border hover:border-violet-300 hover:bg-violet-50/60 dark:hover:bg-violet-950/20"}`}>
              <span className="block text-sm font-bold">{option.label}{active ? " · Current" : ""}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{option.detail}</span>
            </button>;
          })}
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Theme</span>
          <select value={game.themeId} onChange={(event) => startGame(game.level, event.target.value)} className="w-full rounded-lg border border-violet-200 bg-background px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-violet-400 dark:border-violet-800">
            {IMAGE_THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
          </select>
        </label>
        {!game.dailyDate && !game.challengeId && <Button variant="outline" className="w-full gap-2" onClick={() => setLocation("/memory-order-challenge")}><Flame className="h-4 w-4"/> Try today&apos;s daily challenge</Button>}
        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setGame(null)}><LayoutGrid className="h-4 w-4"/> Game home</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/leaderboard/memory-order")}><Trophy className="h-4 w-4"/> Leaderboard</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/profile?tab=memory-order")}><Eye className="h-4 w-4"/> My stats</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/")}><Home className="h-4 w-4"/> Portal</Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Clock3, label: "Time", value: fmt(elapsed) },
          { icon: LayoutGrid, label: "Level", value: doneConfig.label },
          { icon: Check, label: "Correct", value: `${game.correct}/${game.questions.length}` },
          { icon: MousePointerClick, label: "Rounds", value: String(game.questions.length) },
        ].map(({ icon: Icon, label, value }) => <div key={label} className="space-y-1 rounded-xl border bg-card p-3 text-center sm:p-4"><Icon className="mx-auto h-4 w-4 text-violet-600"/><p className="text-base font-black tabular-nums sm:text-lg">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>)}
      </div>

      <section className="rounded-2xl border-2 border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30">
        {rewardLoading ? <div className="py-2 text-center text-sm font-semibold text-muted-foreground">Calculating your score and rewards…</div> : reward?.offline ? <div className="py-2 text-center"><p className="font-semibold text-amber-900 dark:text-amber-200">Rewards could not be saved</p><p className="mt-1 text-xs text-muted-foreground">{rewardError || "The game server could not save this result."}</p></div> : reward ? <><div className="grid grid-cols-3 items-center gap-2 text-center">
          <div><p className="text-2xl font-black text-amber-800 dark:text-amber-200">{reward.points.toLocaleString()}</p><p className="text-xs font-semibold text-muted-foreground">Points</p></div>
          <div className="border-x border-amber-300/70 px-2 dark:border-amber-700/60"><p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">+{reward.xpEarned}</p><p className="text-xs font-semibold text-muted-foreground">XP</p></div>
          <div><p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">+{reward.gemsEarned} 💎</p><p className="text-xs font-semibold text-muted-foreground">Gems</p></div>
        </div><p className="col-span-3 mt-2 text-[11px] text-muted-foreground">Score reflects level, correct sequences, and completion time.</p></> : <div className="py-2 text-center text-sm text-muted-foreground">Your rewards are being prepared.</div>}
      </section>

      {game.challengeId && <section className="rounded-xl border border-violet-200 bg-card p-4 text-center dark:border-violet-800" aria-live="polite">
        <h2 className="font-bold">Challenge result</h2>
        {!challengeResult || challengeResult.status !== "completed" ? <p className="mt-1 text-sm text-muted-foreground">You completed in {fmt(elapsed)} and earned {reward?.points?.toLocaleString() ?? "…"} points. Waiting for your opponent to finish…</p> : (() => {
          const mine = challengeResult.challengerId === profileId ? challengeResult.challengerPoints : challengeResult.challengedPoints;
          const theirs = challengeResult.challengerId === profileId ? challengeResult.challengedPoints : challengeResult.challengerPoints;
          const opponent = challengeResult.challengerId === profileId ? challengeResult.challengedUsername : challengeResult.challengerUsername;
          const outcome = challengeResult.winnerId === null ? "It’s a tie!" : challengeResult.winnerId === profileId ? "You won the challenge!" : "You lost the challenge.";
          return <><p className="mt-1 text-lg font-black">{outcome}</p><p className="mt-1 text-sm text-muted-foreground">You: {mine ?? 0} points · {opponent}: {theirs ?? 0} points</p><p className="mt-1 text-xs text-muted-foreground">{challengeResult.winnerId === null ? "Both players earned 2 bonus gems." : challengeResult.winnerId === profileId ? "You earned 10 bonus gems." : `${opponent} earned 10 bonus gems.`}</p></>;
        })()}
      </section>}
    </main>;
  }

  // ---------- Setup / gameplay ----------
  const playing = game && game.status === "playing" && config && question;
  const seqLen = config?.sequenceLength ?? 5;
  const iconSize = seqLen <= 5 ? 56 : seqLen === 6 ? 50 : 44;
  const answerGridCols = seqLen <= 4 ? "grid-cols-2 sm:grid-cols-4" : seqLen === 5 ? "grid-cols-3 sm:grid-cols-5" : seqLen === 6 ? "grid-cols-3 sm:grid-cols-3" : "grid-cols-4 sm:grid-cols-4";

  return <main className={`mx-auto w-full px-3 py-3 sm:px-6 sm:py-8 ${game ? "max-w-5xl" : "max-w-lg"}`}>
    {showConfetti && <Confetti />}
    {header}
    <div className={`grid gap-4 sm:gap-5 ${game ? "lg:grid-cols-[minmax(0,1fr)_280px]" : "grid-cols-1"}`}>
      <section className="min-w-0 space-y-3 sm:space-y-4">
        {!game ? <>
          {hasSavedGame && <button onClick={() => setLocation("/memory-order?resume=1")} className="flex w-full items-center gap-3 rounded-xl border-2 border-violet-300/60 bg-card px-3 py-2.5 text-left transition hover:bg-violet-50 dark:border-violet-800/50 dark:hover:bg-violet-950/30 sm:px-4 sm:py-3"><RotateCcw className="h-4 w-4 shrink-0 text-violet-600"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-violet-700 dark:text-violet-300">Resume Memory Order</span><span className="block text-xs text-muted-foreground">Pick up where you left off</span></span><span className="text-lg text-violet-600">→</span></button>}
          <div className="relative isolate overflow-hidden rounded-2xl border-2 border-violet-200/80 bg-gradient-to-br from-white via-violet-50 to-purple-50 p-3 shadow-xl shadow-violet-500/10 dark:border-violet-800/50 dark:from-card dark:via-violet-950/35 dark:to-purple-950/40 sm:p-5">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-purple-300/25 blur-2xl dark:bg-purple-400/10" />
            <div className="relative z-10 mb-4 hidden items-center gap-3 rounded-xl border border-violet-200/70 bg-white/65 px-3 py-3 dark:border-violet-800/50 dark:bg-slate-950/20 sm:flex">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-2xl"><Eye className="h-6 w-6 text-violet-600" /></span>
              <div className="min-w-0 flex-1"><h2 className="font-serif text-lg font-bold">Ready to remember the order?</h2><p className="text-xs leading-relaxed text-muted-foreground">Watch the images appear in sequence, then tap them back in the same order.</p></div>
              <div className="hidden grid-cols-5 gap-1 rounded-lg border border-violet-200/70 bg-white/70 p-1 sm:grid dark:border-violet-800/50 dark:bg-slate-950/30">{[1, 2, 3, 4, 5].map((value) => <span key={value} className="grid h-5 w-5 place-items-center rounded bg-violet-500/10"><ThemeIcon themeId={getTheme(imageThemeId).id} value={value} size={14} /></span>)}</div>
            </div>
            <div className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-200/70 bg-white/65 px-3 py-2 dark:border-violet-800/50 dark:bg-slate-950/20">
              <div><p className="text-xs font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">Image set</p><p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">Applied to your next Memory Order game</p></div>
              <select value={imageThemeId} onChange={(event) => setThemeId(event.target.value as ThemeId)} aria-label="Choose image set" className="rounded-lg border border-violet-200 bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-sm outline-none focus:ring-2 focus:ring-violet-400 dark:border-violet-800 sm:text-sm">
                {IMAGE_THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
              </select>
            </div>
            <p className="relative z-10 mb-2 hidden text-xs font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300 sm:block">Choose Level</p>
            <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-2.5">
              {levels.map((level) => {
                const option = MEMORY_ORDER_LEVELS[level];
                return <button key={level} onClick={() => startGame(level)} className="group flex min-h-[72px] sm:min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-violet-200/80 bg-gradient-to-br from-violet-50 to-purple-50 p-2 text-center shadow-sm sm:p-3 transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-md active:scale-[0.98] dark:border-violet-800/60 dark:from-violet-950/45 dark:to-purple-950/40">
                  <span className="grid h-8 w-8 place-items-center sm:h-9 sm:w-9 rounded-xl bg-violet-500/10 text-violet-600 group-hover:bg-violet-500/20"><Eye className="h-5 w-5" /></span>
                  <span className="text-sm font-bold leading-tight">{option.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{option.detail}</span>
                </button>;
              })}
            </div>
          </div>
          <button onClick={() => setLocation("/memory-order-challenge")} className="flex w-full items-center gap-3 rounded-xl border-2 border-orange-300/60 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2.5 text-left transition hover:bg-orange-50 dark:border-orange-800/50 dark:from-orange-950/30 dark:to-amber-950/20 sm:px-4 sm:py-3"><Flame className="h-5 w-5 shrink-0 text-orange-500"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-orange-700 dark:text-orange-300">Daily Memory Order</span><span className="block text-xs text-muted-foreground">One shared puzzle · refreshed at 00:00 UTC</span></span><span className="text-lg text-orange-500">→</span></button>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button onClick={() => setLocation("/profile?tab=memory-order")} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left transition hover:border-violet-300 hover:bg-muted/50 sm:p-3"><Trophy className="h-5 w-5 shrink-0 text-violet-600"/><span><span className="block text-sm font-semibold">My Stats</span><span className="hidden text-xs text-muted-foreground sm:block">Best times & progress</span></span></button>
            <button onClick={() => setLocation("/leaderboard/memory-order")} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left transition hover:border-violet-300 hover:bg-muted/50 sm:p-3"><Trophy className="h-5 w-5 shrink-0 text-violet-600"/><span><span className="block text-sm font-semibold">Leaderboard</span><span className="hidden text-xs text-muted-foreground sm:block">Top memory champions</span></span></button>
            <button onClick={() => void shareGame()} className="col-span-2 flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left transition hover:border-violet-300 hover:bg-muted/50 sm:p-3"><Share2 className="h-5 w-5 shrink-0 text-violet-600"/><span><span className="block text-sm font-semibold">Share Game</span><span className="hidden text-xs text-muted-foreground sm:block">Invite someone to play</span></span></button>
          </div>
          {/* Info links */}
          <div className="home-info-links flex items-center justify-center gap-4 rounded-xl border border-border bg-card px-3 py-2 sm:gap-6 sm:px-4 sm:py-2.5">
            <button onClick={() => setInfoModal("rules")} className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground sm:gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Rules</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("controls")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Keyboard className="h-3.5 w-3.5" /> Controls</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("backstory")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Scroll className="h-3.5 w-3.5" /> Backstory</button>
          </div>

          <MobileContentDisclosure
            id="memory-order-guidance"
            title="More Memory Order guidance"
            className="rounded-2xl border border-violet-400/25 bg-card p-5 sm:p-6"
          >
            <section className="space-y-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">How to play and improve at Memory Order</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Each round shows a sequence of images for a few seconds. When
                  the grid appears, tap the images back in the exact order you
                  saw them.
                </p>
              </div>
              <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                <article>
                  <h3 className="font-semibold text-foreground">Chunk the sequence</h3>
                  <p className="mt-1">Group the images into pairs or small chunks while watching — “first two, next two” is easier to recall than one long list, especially on Hard and Expert.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Pick the right level</h3>
                  <p className="mt-1">Easy shows 4 images for 12 seconds across 3 rounds, Medium 5 images for 10 seconds across 4, Hard 6 images for 8 seconds across 5, and Expert 8 images for 7 seconds across 6.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Use the image theme</h3>
                  <p className="mt-1">The game uses your selected picture theme. Practicing with familiar icons makes the sequence easier to visualize before switching themes.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Understand your score</h3>
                  <p className="mt-1">Points, XP, and gems reflect the level, correct sequences, and completion time — faster, cleaner runs earn more. Daily challenges give everyone the same seed, and friend challenges compare points.</p>
                </article>
              </div>
            </section>
          </MobileContentDisclosure>

          {/* Rules modal */}
          <Dialog open={infoModal === "rules"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-violet-600" /> Rules</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>Memory Order is a visual memory game. Each round shows a sequence of images; you must tap them back in the same order.</p>
                <ul className="list-none space-y-2">
                  {[
                    "Choose a level — each has its own sequence length, view time, and round count.",
                    "Watch the images appear in order during the view phase.",
                    "When the grid appears, tap the images in the order you remember.",
                    "A sequence only counts as correct when every image is tapped in the exact order.",
                    "Finish every round to complete the game and earn points, XP, and gems.",
                  ].map((rule, index) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-700 dark:text-violet-300">{index + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-1">Points, XP, and 💎 gems are based on the level, correct sequences, and completion time — faster, cleaner runs earn more of each.</p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Controls modal */}
          <Dialog open={infoModal === "controls"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Keyboard className="h-5 w-5 text-violet-600" /> Controls</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-2 font-semibold text-foreground">Mouse / Touch</p>
                  <div className="space-y-1.5 text-muted-foreground">
                    {[
                      ["Watch", "Memorize the image order during the view phase"],
                      ["Click / tap an image", "Place it in your answer order"],
                      ["Hint", "Highlights the next image you should tap"],
                      ["Resume button", "Continue an unfinished Memory Order game"],
                      ["Daily Memory Order", "Play today's shared seed"],
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
                      ["Correct sequences", "Each perfect sequence adds to the score"],
                      ["Time", "Faster completions earn a bonus"],
                      ["Daily / challenge", "Shared seeds and friend duels compare points"],
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
                <DialogTitle className="flex items-center gap-2"><Scroll className="h-5 w-5 text-violet-600" /> Backstory</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Memory Order is inspired by classic sequence-recall and
                  visual memory exercises used in cognitive training. It asks
                  players to watch a short ordered series of pictures, then
                  reproduce that order from a shuffled grid.
                </p>
                <p>
                  The game starts gentle with five images and a generous viewing
                  window, then adds more images and shorter view times as you
                  move from Easy to Expert.
                </p>
                <p>
                  This version keeps the core memory challenge and adds four
                  levels, themed image sets, daily challenges, leaderboards,
                  and head-to-head friend challenges.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </> : playing ? <>
          <div className="mb-2 flex flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 px-2 py-1.5 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:px-3">
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums"><Timer className="h-3.5 w-3.5 text-violet-600" />{fmt(elapsed)}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums"><Check className="h-3.5 w-3.5 text-emerald-600" />{game.correct}/{game.questions.length}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums"><MousePointerClick className="h-3.5 w-3.5 text-sky-600" />{game.index + 1}/{game.questions.length}</span>
            {(game.dailyDate || game.challengeId) && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-semibold text-muted-foreground">
                {game.dailyDate ? <CalendarDays className="h-3.5 w-3.5 text-orange-500" /> : <Trophy className="h-3.5 w-3.5 text-violet-600" />}
                {game.dailyDate ? "Daily" : "Challenge"}
              </span>
            )}
            {!game.dailyDate && !game.challengeId && (
              <>
                <select aria-label="Memory Order level" title="Changing options starts a new puzzle" value={game.level} onChange={(event) => startGame(event.target.value as MemoryOrderLevel, game.themeId)} className="h-8 w-[5rem] shrink-0 rounded-lg border border-violet-200 bg-background px-1.5 text-[11px] font-semibold text-foreground outline-none focus:ring-2 focus:ring-violet-400 dark:border-violet-800 sm:w-auto sm:px-2">
                  {levels.map((level) => <option key={level} value={level}>{MEMORY_ORDER_LEVELS[level].label}</option>)}
                </select>
                <select aria-label="Memory Order theme" title="Changing options starts a new puzzle" value={game.themeId} onChange={(event) => startGame(game.level, event.target.value)} className="h-8 min-w-0 flex-1 rounded-lg border border-violet-200 bg-background px-1.5 text-[11px] font-semibold text-foreground outline-none focus:ring-2 focus:ring-violet-400 dark:border-violet-800 sm:flex-none sm:px-2">
                  {IMAGE_THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
                </select>
              </>
            )}
          </div>

          <Card className="border-violet-200/70 shadow-sm dark:border-violet-800/50">
            <CardContent className="p-2 sm:p-5">
              {game.phase === "view" ? (
                <div className="mx-auto w-full max-w-xl space-y-4">
                  <div className="flex items-center justify-center gap-1.5 rounded-xl border border-violet-200/70 bg-violet-50/70 px-3 py-2 text-sm font-semibold text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/30 dark:text-violet-300 sm:gap-2">
                    <Eye className="h-4 w-4 shrink-0" />
                    <span>Watch the order — {Math.ceil(viewLeft)}s</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" role="list" aria-label={`Sequence ${game.index + 1} of ${game.questions.length}`}>
                    {question.sequence.map((value, position) => (
                      <div key={position} className="flex flex-col items-center gap-1">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-violet-300 bg-white shadow-sm dark:border-violet-700 dark:bg-slate-950/60 sm:h-16 sm:w-16">
                          <ThemeIcon themeId={game.themeId} value={value} size={iconSize} />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums text-violet-500">{position + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mx-auto h-2 w-full max-w-md overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-100"
                      style={{ width: `${Math.max(0, Math.min(100, (viewLeft / config.viewSeconds) * 100))}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">Memorize the order before the grid appears.</p>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 rounded-xl border border-violet-200/70 bg-violet-50/70 px-3 py-1.5 text-sm font-semibold text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/30 dark:text-violet-300">
                      <MousePointerClick className="h-4 w-4" />
                      <span>Tap in the order you saw — {game.picks.length}/{question.sequence.length}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-950/40"
                      disabled={game.picks.length >= question.sequence.length || (game.hintsUsed >= freeHintLimit(game.level) && !canEarnExtraHint)}
                      onClick={() => (game.hintsUsed < freeHintLimit(game.level) ? issueHint() : handleRewardedHint())}
                    >
                      <Lightbulb className="h-4 w-4" />
                      {game.hintsUsed < freeHintLimit(game.level)
                        ? `Hint (${freeHintLimit(game.level) - game.hintsUsed} free)`
                        : canShowRewardedTip ? "Watch ad +1 hint" : "No hints left"}
                    </Button>
                  </div>
                  <div className={`mx-auto grid w-full max-w-lg justify-items-center gap-2 sm:gap-3 ${answerGridCols}`} role="grid" aria-label={`Memory order answer grid ${game.index + 1} of ${game.questions.length}`}>
                    {question.tiles.map((value, tileIndex) => {
                      const pickPosition = game.picks.indexOf(tileIndex);
                      const picked = pickPosition >= 0;
                      const rightSpot = picked && value === question.sequence[pickPosition];
                      const isHinted = hintTile === tileIndex && !picked;
                      return <button key={tileIndex} type="button" onClick={() => pickTile(tileIndex)} disabled={picked}
                        className={`relative flex aspect-square items-center justify-center rounded-2xl border-2 transition ${picked ? rightSpot ? "border-emerald-500 bg-emerald-50 shadow-md dark:bg-emerald-950/40" : "border-rose-500 bg-rose-50 shadow-md dark:bg-rose-950/40" : isHinted ? "border-amber-400 bg-amber-50 shadow-lg ring-4 ring-amber-300/70 animate-pulse dark:bg-amber-950/30 dark:ring-amber-500/40" : "border-border bg-white hover:border-violet-400 hover:bg-violet-50/70 dark:bg-slate-950/50 dark:hover:border-violet-600 dark:hover:bg-violet-950/30"} ${picked ? "cursor-default" : "cursor-pointer"}`}
                        aria-label={`Image option ${tileIndex + 1}`}>
                        <ThemeIcon themeId={game.themeId} value={value} size={iconSize} />
                        {picked && <span className={`absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full text-[11px] font-black text-white shadow ${rightSpot ? "bg-emerald-500" : "bg-rose-500"}`}>{pickPosition + 1}</span>}
                      </button>;
                    })}
                  </div>
                  <p className="text-center text-xs text-muted-foreground">Green numbers mark images in the right spot. Finish all {question.sequence.length} taps to move on.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </> : null}
      </section>

      {game && config && question && (
        <aside className="hidden space-y-3 lg:block">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-bold">Current puzzle</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Level</span><span className="font-semibold">{config.label}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Sequence</span><span className="font-semibold">{config.sequenceLength} images</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">View time</span><span className="font-semibold">{config.viewSeconds}s</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Rounds</span><span className="font-semibold">{game.questions.length}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Theme</span><span className="font-semibold">{getTheme(game.themeId).name}</span></div>
            </div>
          </div>
          {!game.dailyDate && !game.challengeId && (
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <h2 className="text-sm font-bold">Change options</h2>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {levels.map((level) => {
                  const option = MEMORY_ORDER_LEVELS[level];
                  const active = level === game.level;
                  return <button key={level} type="button" onClick={() => startGame(level, game.themeId)} className={`min-h-11 rounded-lg border-2 px-2 py-2 text-left text-xs font-semibold transition ${active ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-200" : "border-border hover:border-violet-300"}`}>
                    <span className="block">{option.label}{active ? " · Current" : ""}</span>
                    <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">{option.detail}</span>
                  </button>;
                })}
              </div>
              <label className="mt-3 block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Theme</span>
                <select value={game.themeId} onChange={(event) => startGame(game.level, event.target.value)} className="w-full rounded-lg border border-violet-200 bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-violet-400 dark:border-violet-800">
                  {IMAGE_THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
                </select>
              </label>
            </div>
          )}
          {game.dailyDate && <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/30 dark:text-orange-300"><CalendarDays className="h-4 w-4" /> Daily puzzle · {game.dailyDate}</div>}
          {game.challengeId && <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/30 dark:text-violet-300"><Trophy className="h-4 w-4" /> Friend challenge active</div>}
          <Button variant="outline" className="w-full gap-2" onClick={exitToGameHome}><Home className="h-4 w-4" /> Exit to levels</Button>
        </aside>
      )}
    </div>
  </main>;
}
