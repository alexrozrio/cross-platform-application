import React from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, BookOpen, Check, Clock3, Eraser, Flame, Home, Keyboard, LayoutGrid, RotateCcw, Scroll, Share2, SkipForward, Timer, Trophy, Volume2, VolumeX, X } from "lucide-react";
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
  createJumbleRound, JUMBLE_LEVELS, normalizeJumbleAnswer,
  type JumbleDifficulty, type JumbleQuestion,
} from "@/lib/jumble-words";
import { recordJumbleCompletion } from "@/lib/jumble-stats";
import { Button } from "@/components/ui/button";

const SAVE_KEY = "brain-games-jumble-session";

type SavedGame = {
  difficulty: JumbleDifficulty;
  seed: number;
  questions: JumbleQuestion[];
  index: number;
  correct: number;
  wrongAttempts: number;
  score: number;
  answer: string;
  used: number[];
  skipped: number[];
  reviewIndex: number | null;
  elapsed: number;
  savedAt: number;
  gameId?: number;
  dailyDate?: string;
  challengeId?: number;
};

type JumbleReward = { points: number; xpEarned: number; gemsEarned: number; correct: number; score: number; won?: boolean; isPersonalBest?: boolean; offline?: boolean };
type JumbleChallengeResult = { id: number; status: string; challengerId: number; challengedId: number; winnerId: number | null; challengerUsername: string; challengedUsername: string; challengerPoints: number | null; challengedPoints: number | null; challengerScore: number | null; challengedScore: number | null; challengerCorrect: number | null; challengedCorrect: number | null; challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null };

function loadSaved(): SavedGame | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as SavedGame | null;
    if (!raw || typeof raw.difficulty !== "string" || !JUMBLE_LEVELS[raw.difficulty]) return null;
    if (!Array.isArray(raw.questions) || !raw.questions.length) return null;
    const skipped = Array.isArray(raw.skipped) ? raw.skipped.filter((n) => Number.isInteger(n) && n >= 0 && n < raw.questions.length) : [];
    return {
      ...raw,
      index: Number.isFinite(raw.index) ? Math.min(raw.index, raw.questions.length - 1) : 0,
      correct: Number.isFinite(raw.correct) ? raw.correct : 0,
      wrongAttempts: Number.isFinite(raw.wrongAttempts) ? raw.wrongAttempts : 0,
      score: Number.isFinite(raw.score) ? raw.score : 0,
      answer: typeof raw.answer === "string" ? raw.answer : "",
      used: Array.isArray(raw.used) ? raw.used.filter((n) => Number.isInteger(n)) : [],
      skipped,
      reviewIndex: Number.isInteger(raw.reviewIndex) && raw.reviewIndex! >= 0 && raw.reviewIndex! < skipped.length ? raw.reviewIndex : null,
      elapsed: Number.isFinite(raw.elapsed) ? raw.elapsed : 0,
    };
  } catch { return null; }
}

export default function JumblePage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const query = new URLSearchParams(search);
  const { profileId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId as number);
  const queryClient = useQueryClient();
  const sounds = useSound(profile?.soundEnabled);
  const gameMode = profile?.gameMode ?? "4all";
  const availableDifficulties = (Object.keys(JUMBLE_LEVELS) as JumbleDifficulty[]).filter((id) =>
    gameMode === "children" ? JUMBLE_LEVELS[id].mode === "baby" :
      gameMode === "adult" ? JUMBLE_LEVELS[id].mode === "adult" : true,
  );
  const [game, setGame] = React.useState<SavedGame | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [hasSavedGame, setHasSavedGame] = React.useState(false);
  const [shakeKey, setShakeKey] = React.useState(0);
  const [reward, setReward] = React.useState<JumbleReward | null>(null);
  const [rewardLoading, setRewardLoading] = React.useState(false);
  const [rewardError, setRewardError] = React.useState<string | null>(null);
  const [challengeResult, setChallengeResult] = React.useState<JumbleChallengeResult | null>(null);
  const [infoModal, setInfoModal] = React.useState<"rules" | "controls" | "backstory" | null>(null);
  const [endConfirm, setEndConfirm] = React.useState(false);
  const [runFinished, setRunFinished] = React.useState(false);
  const activeGameRef = React.useRef(game);
  activeGameRef.current = game;
  const pendingGameRef = React.useRef<{ savedAt: number; promise: Promise<number | null> } | null>(null);
  const directStartHandledRef = React.useRef(false);
  const finishedRef = React.useRef(false);

  usePageMeta({
    title: "Jumble Words Game | Play Brain Games",
    description: "Unscramble jumbled English words across four levels. Race the clock, beat your best accuracy, and climb the leaderboard.",
    path: "/jumble",
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
    if (!game || game.index >= game.questions.length) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [game?.index, game?.questions.length]);

  React.useEffect(() => {
    if (game && game.index < game.questions.length) {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...game, elapsed })); setHasSavedGame(true); } catch { /* Storage is optional. */ }
    }
  }, [game, elapsed]);

  const reviewing = game?.reviewIndex != null && game.skipped[game.reviewIndex] != null;
  const currentQuestion = game
    ? reviewing
      ? game.questions[game.skipped[game.reviewIndex!]]
      : game.index < game.questions.length ? game.questions[game.index] : null
    : null;

  const submitAnswer = () => {
    if (!game || !currentQuestion || finishedRef.current) return;
    const answer = normalizeJumbleAnswer(game.answer);
    if (!answer) { sounds.click(); return; }
    if (answer === currentQuestion.word) {
      sounds.note();
      const updated: SavedGame = {
        ...game,
        correct: game.correct + 1,
        score: game.score + currentQuestion.word.length,
        answer: "",
        used: [],
      };
      if (reviewing) {
        const remaining = game.skipped.filter((_, i) => i !== game.reviewIndex);
        updated.skipped = remaining;
        updated.reviewIndex = remaining.length ? Math.min(game.reviewIndex!, remaining.length - 1) : null;
        if (!remaining.length) sounds.complete();
        setGame(updated);
        if (!remaining.length && game.index >= game.questions.length) finishRun(updated, elapsed);
        return;
      }
      const nextIndex = game.index + 1;
      const done = nextIndex >= game.questions.length;
      updated.index = nextIndex;
      if (done && updated.skipped.length === 0) {
        sounds.complete();
        setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3200);
        setGame(updated);
        finishRun(updated, elapsed);
      } else {
        setGame(updated);
      }
    } else {
      sounds.click();
      setShakeKey((k) => k + 1);
      setGame({ ...game, wrongAttempts: game.wrongAttempts + 1 });
    }
  };

  const skipQuestion = () => {
    if (!game || !currentQuestion || finishedRef.current) return;
    sounds.click();
    if (reviewing) {
      const remaining = game.skipped.filter((_, i) => i !== game.reviewIndex);
      const updated: SavedGame = { ...game, skipped: remaining, reviewIndex: remaining.length ? Math.min(game.reviewIndex!, remaining.length - 1) : null, answer: "", used: [] };
      setGame(updated);
      if (!remaining.length && game.index >= game.questions.length) finishRun(updated, elapsed);
      return;
    }
    const nextIndex = game.index + 1;
    const done = nextIndex >= game.questions.length;
    if (done) {
      setGame({ ...game, index: game.questions.length, skipped: [...game.skipped, game.index], answer: "", used: [] });
    } else {
      setGame({ ...game, index: nextIndex, skipped: [...game.skipped, game.index], answer: "", used: [] });
    }
  };

  const startReview = () => {
    if (!game || !game.skipped.length || finishedRef.current) return;
    sounds.click();
    setGame({ ...game, reviewIndex: 0, answer: "", used: [] });
  };

  const exitReview = () => {
    if (!game) return;
    sounds.click();
    setGame({ ...game, reviewIndex: null, answer: "", used: [] });
  };

  const addLetter = (tileIndex: number) => {
    if (!game || !currentQuestion || game.used.includes(tileIndex)) return;
    const letter = currentQuestion.jumble[tileIndex];
    if (!letter) return;
    sounds.click();
    setGame({ ...game, answer: game.answer + letter, used: [...game.used, tileIndex] });
  };

  const removeLastLetter = () => {
    if (!game || !game.answer) return;
    sounds.click();
    setGame({ ...game, answer: game.answer.slice(0, -1), used: game.used.slice(0, -1) });
  };

  const clearAnswer = () => {
    if (!game || !game.answer) return;
    sounds.click();
    setGame({ ...game, answer: "", used: [] });
  };

  const completeGame = async (completed: SavedGame, finalElapsed: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setRewardLoading(true);
    setRewardError(null);
    const won = completed.correct * 2 >= completed.questions.length;
    try {
      const pending = pendingGameRef.current;
      let gameId = completed.gameId ?? (pending?.savedAt === completed.savedAt ? await pending.promise : null);
      if (!gameId && profileId && navigator.onLine !== false) {
        const createController = new AbortController();
        const createTimeout = window.setTimeout(() => createController.abort(), 5000);
        try {
          const created = await customFetch<{ id: number }>("/api/jumble-games", {
            method: "POST",
            body: JSON.stringify({
              profileId,
              difficulty: completed.difficulty,
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
      let result: JumbleReward;
      try {
        result = await customFetch<JumbleReward>(`/api/jumble-games/${gameId}/complete`, {
          method: "POST",
          body: JSON.stringify({
            elapsedSeconds: finalElapsed,
            correct: completed.correct,
            wrongAttempts: completed.wrongAttempts,
            score: completed.score,
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
        queryClient.invalidateQueries({ queryKey: [`/api/jumble-daily-challenge/status/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: ["jumble-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments/leaderboard"] });
        window.dispatchEvent(new CustomEvent(ACHIEVEMENT_COMPLETION_EVENT, { detail: { profileId } }));
      }
    } catch (error) {
      console.error("[Jumble] Could not save completion rewards:", error);
      if (activeGameRef.current?.savedAt === completed.savedAt) {
        setReward({ points: 0, xpEarned: 0, gemsEarned: 0, correct: completed.correct, score: completed.score, won, offline: true });
        setRewardError(error instanceof Error ? error.message : "Unknown API error");
      }
    } finally {
      if (activeGameRef.current?.savedAt === completed.savedAt) setRewardLoading(false);
    }
  };

  const finishRun = (completed: SavedGame, finalElapsed: number) => {
    setRunFinished(true);
    const won = completed.correct * 2 >= completed.questions.length;
    if (won) {
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3200);
    }
    recordJumbleCompletion(profileId, completed.difficulty, completed.questions.length, completed.correct, completed.wrongAttempts, finalElapsed, completed.score, won);
    localStorage.removeItem(SAVE_KEY);
    setHasSavedGame(false);
    void completeGame(completed, finalElapsed);
  };

  const endRunEarly = () => {
    if (!game || finishedRef.current) return;
    const updated = { ...game, index: game.questions.length };
    setGame(updated);
    finishRun(updated, elapsed);
  };

  const startGame = (level: JumbleDifficulty, dailyDate?: string, seed?: number, existingGameId?: number, challengeId?: number) => {
    sounds.click();
    const savedAt = Date.now();
    const boardSeed = seed ?? Math.floor(Math.random() * 2_147_483_647) + 1;
    const nextGame: SavedGame = {
      difficulty: level, seed: boardSeed,
      questions: createJumbleRound(level, boardSeed),
      index: 0, correct: 0, wrongAttempts: 0, score: 0,
      answer: "", used: [], skipped: [], reviewIndex: null,
      elapsed: 0, savedAt,
      ...(dailyDate ? { dailyDate } : {}), ...(existingGameId ? { gameId: existingGameId } : {}), ...(challengeId ? { challengeId } : {}),
    };
    setGame(nextGame); setReward(null); setRewardError(null); setRewardLoading(false); setRunFinished(false);
    setElapsed(0); setChallengeResult(null); finishedRef.current = false;
    setLocation(dailyDate
      ? `/jumble?play=1&dailyDate=${dailyDate}&difficulty=${level}&seed=${boardSeed}`
      : challengeId
        ? `/jumble?play=1&challengeId=${challengeId}&gameId=${existingGameId}&difficulty=${level}&seed=${boardSeed}`
        : "/jumble?play=1");
    if (existingGameId) {
      pendingGameRef.current = { savedAt, promise: Promise.resolve(existingGameId) };
      return;
    }
    const promise = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const { id } = await customFetch<{ id: number }>("/api/jumble-games", {
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
    const requestedDifficulty = query.get("difficulty") as JumbleDifficulty | null;
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

  // Keyboard controls: letters append, Backspace removes, Enter checks.
  React.useEffect(() => {
    if (!game || !currentQuestion) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        const tileIndex = currentQuestion.jumble.split("").findIndex((l, i) => l === letter && !game.used.includes(i));
        if (tileIndex >= 0) addLetter(tileIndex);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        removeLastLetter();
      } else if (e.key === "Enter") {
        e.preventDefault();
        submitAnswer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, currentQuestion]);

  React.useEffect(() => {
    if (!game || game.index < game.questions.length || !game.challengeId) { setChallengeResult(null); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const detail = await customFetch<JumbleChallengeResult>(`/api/jumble-challenges/${game.challengeId}`);
        if (cancelled) return;
        setChallengeResult(detail);
        if (detail.status !== "completed") timer = setTimeout(refresh, 5000);
      } catch { if (!cancelled) timer = setTimeout(refresh, 5000); }
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.index, game?.questions.length, game?.challengeId]);

  const shareResult = async () => {
    if (!game) return;
    const url = appShareUrlForPath("/jumble");
    const cfg = JUMBLE_LEVELS[game.difficulty];
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const rewardLine = reward && !reward.offline
      ? `+${reward.points.toLocaleString()} pts · +${reward.xpEarned} XP · +${reward.gemsEarned} 💎`
      : null;
    const lines = [
      `🔤 ${cfg.label} Jumble Words: ${game.correct}/${game.questions.length} words in ${fmt(elapsed)}!`,
      rewardLine,
      rank ? `🏅 ${rank} · Play Brain Games . Online` : "🧠 Play Brain Games . Online",
      `🔗 ${url}`,
    ].filter((line): line is string => Boolean(line));
    try {
      const result = await shareOrDownloadShareCard({
        title: "Jumble Words result",
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: "#0891b2",
        filename: "jumble-words-result.png",
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

  const roundDone = Boolean(game && game.index >= game.questions.length);
  const awaitingFinish = Boolean(game && roundDone && !runFinished && game.reviewIndex == null && game.skipped.length > 0);
  const finished = Boolean(game && roundDone && !awaitingFinish && game.reviewIndex == null);

  if (awaitingFinish && game) {
    return <main className="mx-auto w-full max-w-lg space-y-4 px-3 py-5 sm:px-6 sm:py-8">
      <section className="relative isolate overflow-hidden rounded-2xl border-2 border-cyan-200/80 bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-5 text-center shadow-xl shadow-cyan-500/10 dark:border-cyan-800/50 dark:from-cyan-950/50 dark:via-card dark:to-sky-950/40 sm:p-6">
        <div className="relative z-10 space-y-3">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cyan-500/15 text-3xl">🔤</div>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">Round complete</h1>
          <p className="text-sm text-muted-foreground">You skipped {game.skipped.length} word{game.skipped.length === 1 ? "" : "s"}. Retry them for a better score, or finish now.</p>
          <p className="text-sm font-semibold">{game.correct}/{game.questions.length} correct · Score {game.score.toLocaleString()} · {fmt(elapsed)}</p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-center">
            <Button className="gap-2 bg-cyan-600 hover:bg-cyan-700" onClick={startReview}><RotateCcw className="h-4 w-4"/> Retry skipped words</Button>
            <Button variant="outline" className="gap-2" onClick={() => finishRun(game, elapsed)}><Check className="h-4 w-4"/> Finish round</Button>
          </div>
        </div>
      </section>
    </main>;
  }

  if (finished && game) {
    const cfg = JUMBLE_LEVELS[game.difficulty];
    const won = game.correct * 2 >= game.questions.length;
    return <main className="mx-auto w-full max-w-lg space-y-4 px-3 py-5 sm:px-6 sm:py-8">
      {showConfetti && <Confetti />}
      <section className={`relative isolate overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-center text-white shadow-xl sm:p-6 ${won ? "from-cyan-500 via-sky-500 to-blue-500 shadow-cyan-500/20" : "from-slate-600 via-slate-700 to-slate-800 shadow-slate-500/20"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/15" />
        <div className="relative z-10 space-y-2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/20 text-3xl">{won ? "🏆" : "🔤"}</div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75">{game.dailyDate ? "Daily Jumble Words" : "Jumble Words"} {won ? "round complete" : "round finished"}</p>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">{game.correct}/{game.questions.length} words unscrambled</h1>
          <p className="text-sm text-white/85">{cfg.label} · {fmt(elapsed)} · {game.wrongAttempts} wrong attempt{game.wrongAttempts === 1 ? "" : "s"} · Score {game.score.toLocaleString()}</p>
          {game.dailyDate && <p className="text-sm font-semibold text-white/90">📅 Today&apos;s shared daily round</p>}
          {reward?.isPersonalBest && <p className="pt-1 text-sm font-bold text-amber-100">🏆 New personal best score!</p>}
          {game.challengeId && <p className="pt-1 text-sm font-bold text-white">⚔️ Challenge score submitted</p>}
          <Button variant="secondary" className="mt-2 gap-2" onClick={() => void shareResult()}><Share2 className="h-4 w-4"/> Share your result</Button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        {game.challengeId
          ? <Button className="w-full gap-2" onClick={() => setLocation("/challenges?tab=jumble")}><Trophy className="h-4 w-4"/> Return to Jumble challenge</Button>
          : <Button className="w-full gap-2" onClick={() => startGame(game.difficulty, game.dailyDate, game.seed, undefined, undefined)}><RotateCcw className="h-4 w-4"/> Play again · {cfg.label}</Button>}
        <div className="grid grid-cols-2 gap-2">
          {availableDifficulties.map((id) => {
            const level = JUMBLE_LEVELS[id];
            const active = id === game.difficulty;
            return <button key={id} type="button" onClick={() => startGame(id)} className={`min-h-14 rounded-xl border-2 px-3 py-2 text-left transition ${active ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30" : "border-border hover:border-cyan-300 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/20"}`}>
              <span className="block text-sm font-bold">{level.label}{active ? " · Current" : ""}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{level.questions} words · {level.mode === "baby" ? "Kids" : "Adult"}</span>
            </button>;
          })}
        </div>
        {!game.dailyDate && !game.challengeId && <Button variant="outline" className="w-full gap-2" onClick={() => setLocation("/jumble-challenge")}><Flame className="h-4 w-4"/> Try today&apos;s daily challenge</Button>}
        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setGame(null)}><LayoutGrid className="h-4 w-4"/> Game home</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/leaderboard/jumble")}><Trophy className="h-4 w-4"/> Leaderboard</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/profile?tab=jumble")}><LayoutGrid className="h-4 w-4"/> My stats</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/")}><Home className="h-4 w-4"/> Portal</Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Timer, label: "Time", value: fmt(elapsed) },
          { icon: Check, label: "Correct", value: `${game.correct}/${game.questions.length}` },
          { icon: LayoutGrid, label: "Score", value: game.score.toLocaleString() },
          { icon: X, label: "Wrong tries", value: String(game.wrongAttempts) },
        ].map(({ icon: Icon, label, value }) => <div key={label} className="space-y-1 rounded-xl border bg-card p-3 text-center sm:p-4"><Icon className="mx-auto h-4 w-4 text-cyan-600"/><p className="text-base font-black tabular-nums sm:text-lg">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>)}
      </div>

      <section className="rounded-2xl border-2 border-cyan-200/70 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 p-4 shadow-sm dark:border-cyan-800/50 dark:from-cyan-950/30 dark:via-sky-950/20 dark:to-blue-950/30">
        {rewardLoading ? <div className="py-2 text-center text-sm font-semibold text-muted-foreground">Calculating your score and rewards…</div> : reward?.offline ? <div className="py-2 text-center"><p className="font-semibold text-cyan-900 dark:text-cyan-200">Rewards could not be saved</p><p className="mt-1 text-xs text-muted-foreground">{rewardError || "The game server could not save this result."}</p></div> : reward ? <><div className="grid grid-cols-3 items-center gap-2 text-center">
          <div><p className="text-2xl font-black text-cyan-800 dark:text-cyan-200">{reward.points.toLocaleString()}</p><p className="text-xs font-semibold text-muted-foreground">Points</p></div>
          <div className="border-x border-cyan-300/70 px-2 dark:border-cyan-700/60"><p className="text-2xl font-black text-sky-700 dark:text-sky-300">+{reward.xpEarned}</p><p className="text-xs font-semibold text-muted-foreground">XP</p></div>
          <div><p className="text-2xl font-black text-blue-700 dark:text-blue-300">+{reward.gemsEarned} 💎</p><p className="text-xs font-semibold text-muted-foreground">Gems</p></div>
        </div><p className="col-span-3 mt-2 text-[11px] text-muted-foreground">Points scale with accuracy, completion time, and few wrong attempts.</p></> : <div className="py-2 text-center text-sm text-muted-foreground">Your rewards are being prepared.</div>}
      </section>

      {game.challengeId && <section className="rounded-xl border border-cyan-200 bg-card p-4 text-center dark:border-cyan-800" aria-live="polite">
        <h2 className="font-bold">Challenge result</h2>
        {!challengeResult || challengeResult.status !== "completed" ? <p className="mt-1 text-sm text-muted-foreground">You finished with {game.correct}/{game.questions.length} correct. Waiting for your opponent to finish…</p> : (() => {
          const mine = challengeResult.challengerId === profileId ? challengeResult.challengerPoints : challengeResult.challengedPoints;
          const theirs = challengeResult.challengerId === profileId ? challengeResult.challengedPoints : challengeResult.challengerPoints;
          const opponent = challengeResult.challengerId === profileId ? challengeResult.challengedUsername : challengeResult.challengerUsername;
          const outcome = challengeResult.winnerId === null ? "It’s a tie!" : challengeResult.winnerId === profileId ? "You won the challenge!" : "You lost the challenge.";
          return <><p className="mt-1 text-lg font-black">{outcome}</p><p className="mt-1 text-sm text-muted-foreground">You: {mine ?? 0} points · {opponent}: {theirs ?? 0} points</p><p className="mt-1 text-xs text-muted-foreground">{challengeResult.winnerId === null ? "Both players earned 2 bonus gems." : challengeResult.winnerId === profileId ? "You earned 10 bonus gems." : `${opponent} earned 10 bonus gems.`}</p></>;
        })()}
      </section>}
    </main>;
  }

  const cfg = game ? JUMBLE_LEVELS[game.difficulty] : null;
  const letters = currentQuestion ? currentQuestion.jumble.split("") : [];
  const answerSlots = currentQuestion ? currentQuestion.word.length : 0;

  return <main className={`mx-auto w-full px-3 py-3 sm:px-6 sm:py-8 ${game ? "max-w-3xl" : "max-w-lg"}`}>
    {showConfetti && <Confetti />}
    <div className="relative isolate mb-3 flex items-center sm:mb-4 justify-between gap-3 overflow-hidden rounded-2xl border-2 border-cyan-200/80 bg-gradient-to-br from-cyan-50 via-white to-sky-100 px-3 py-2 shadow-lg shadow-cyan-500/10 sm:px-4 sm:py-3 dark:border-cyan-800/60 dark:from-cyan-950/60 dark:via-card dark:to-sky-950/60">
      <Button variant="ghost" size="sm" className="relative z-10 shrink-0 px-1" onClick={() => (game ? setGame(null) : setLocation("/"))}><ArrowLeft className="mr-1 h-4 w-4"/> {game ? "Back" : "Home"}</Button>
      <div className="relative z-10 min-w-0 text-right">
        <h1 className="font-serif text-xl font-bold leading-tight tracking-tight sm:text-3xl">Jumble Words</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{profile?.username ? `Welcome back, ${profile.username}` : "Unscramble the letters"}</p>
      </div>
      <Button variant="ghost" size="icon" className="relative z-10 shrink-0" aria-label={sounds.enabled ? "Mute sounds" : "Enable sounds"} onClick={sounds.toggle}>{sounds.enabled ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}</Button>
    </div>
    <div className={`grid gap-4 sm:gap-5 ${game ? "" : "grid-cols-1"}`}>
      <section className="min-w-0 space-y-3 sm:space-y-4">
        {!game ? <>
          {hasSavedGame && (() => { const saved = loadSaved(); return saved ? <button onClick={() => setLocation("/jumble?resume=1")} className="flex w-full items-center gap-3 rounded-xl border-2 border-cyan-300/60 bg-card px-3 py-2.5 sm:px-4 sm:py-3 text-left transition hover:bg-cyan-50 dark:border-cyan-800/50 dark:hover:bg-cyan-950/30"><RotateCcw className="h-4 w-4 shrink-0 text-cyan-600"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-cyan-700 dark:text-cyan-300">Resume Jumble Words</span><span className="block text-xs text-muted-foreground">{JUMBLE_LEVELS[saved.difficulty].label} · {saved.correct}/{saved.questions.length} correct</span></span><span className="text-lg text-cyan-600">→</span></button> : null; })()}
          <div className="relative isolate overflow-hidden rounded-2xl border-2 border-cyan-200/80 bg-gradient-to-br from-white via-cyan-50 to-sky-50 p-3 shadow-xl shadow-cyan-500/10 dark:border-cyan-800/50 dark:from-card dark:via-cyan-950/35 dark:to-sky-950/40 sm:p-5">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-sky-300/25 blur-2xl dark:bg-sky-400/10" />
            <div className="relative z-10 mb-4 hidden items-center gap-3 rounded-xl border border-cyan-200/70 bg-white/65 px-3 py-3 dark:border-cyan-800/50 dark:bg-slate-950/20 sm:flex">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-500/15 text-2xl">🔤</span>
              <div className="min-w-0 flex-1"><h2 className="font-serif text-lg font-bold">Ready to unscramble?</h2><p className="text-xs leading-relaxed text-muted-foreground">Each round shows jumbled letters — tap the tiles to build the word, then check your answer. Faster and cleaner rounds score more.</p></div>
              <div className="hidden grid-cols-4 gap-1 rounded-lg border border-cyan-200/70 bg-white/70 p-1 sm:grid dark:border-cyan-800/50 dark:bg-slate-950/30">{["T", "C", "A", "O"].map((v) => <span key={v} className="grid h-5 w-5 place-items-center rounded bg-cyan-100 text-[10px] font-black text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200">{v}</span>)}</div>
            </div>
            <p className="relative z-10 mb-2 hidden text-xs font-semibold uppercase tracking-widest text-cyan-700 dark:text-cyan-300 sm:block">Choose Difficulty</p>
            <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-2.5">
              {(Object.keys(JUMBLE_LEVELS) as JumbleDifficulty[]).filter((id) => availableDifficulties.includes(id)).map((id) => {
                const level = JUMBLE_LEVELS[id];
                const meta = { easy: "🌱", medium: "🧩", hard: "🔥", expert: "🏔️" }[id];
                return <button key={id} onClick={() => startGame(id)} className="group flex min-h-[72px] sm:min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-cyan-200/80 bg-gradient-to-br from-cyan-50 to-sky-50 p-2 text-center shadow-sm sm:p-3 transition-all hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md active:scale-[0.98] dark:border-cyan-800/60 dark:from-cyan-950/45 dark:to-sky-950/40">
                  <span className="grid h-8 w-8 place-items-center sm:h-9 sm:w-9 rounded-xl bg-cyan-500/10 text-xl group-hover:bg-cyan-500/20">{meta}</span>
                  <span className="text-sm font-bold leading-tight">{level.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{level.questions} words</span>
                </button>;
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setLocation("/profile?tab=jumble")} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left sm:p-3 transition hover:border-cyan-300 hover:bg-muted/50"><LayoutGrid className="h-5 w-5 shrink-0 text-cyan-600"/><span><span className="block text-sm font-semibold">My Stats</span><span className="hidden text-xs text-muted-foreground sm:block">Best scores & accuracy</span></span></button>
            <button onClick={() => setLocation("/leaderboard/jumble")} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left sm:p-3 transition hover:border-cyan-300 hover:bg-muted/50"><Trophy className="h-5 w-5 shrink-0 text-cyan-600"/><span><span className="block text-sm font-semibold">Leaderboard</span><span className="hidden text-xs text-muted-foreground sm:block">Top scores</span></span></button>
          </div>
          <button onClick={() => setLocation("/jumble-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50/60 px-3 py-2.5 sm:px-4 sm:py-3 text-left transition hover:bg-cyan-50 dark:border-cyan-800/40 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/30">
            <span className="text-lg leading-none">🔥</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Daily Jumble Words</span><span className="block text-xs text-muted-foreground">One shared word set for everyone each day</span></span>
            <span className="text-cyan-500">→</span>
          </button>
          <div className="home-info-links flex items-center justify-center gap-4 rounded-xl border border-border bg-card px-3 py-2 sm:gap-6 sm:px-4 sm:py-2.5">
            <button onClick={() => setInfoModal("rules")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><BookOpen className="h-3.5 w-3.5" /> Rules</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("controls")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Keyboard className="h-3.5 w-3.5" /> Controls</button>
            <span className="text-border">·</span>
            <button onClick={() => setInfoModal("backstory")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Scroll className="h-3.5 w-3.5" /> Backstory</button>
          </div>

          <MobileContentDisclosure
            id="jumble-words-guidance"
            title="More Jumble Words guidance"
            className="rounded-2xl border border-cyan-400/25 bg-card p-5 sm:p-6"
          >
            <section className="space-y-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">How to play and improve at Jumble Words</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Each word is scrambled but every letter is used exactly once.
                  Look for common prefixes, suffixes, and double letters — and
                  don&apos;t be afraid to skip a word that won&apos;t come.
                </p>
              </div>
              <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                <article>
                  <h3 className="font-semibold text-foreground">Spot word patterns</h3>
                  <p className="mt-1">Common endings like -ING, -TION, and -ED are giveaways. Vowels are usually spread out — if you see three consonants in a row, one of them probably belongs elsewhere.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Longer words on harder levels</h3>
                  <p className="mt-1">Hard and Expert rounds use 6–15 letter words. Break them into syllables and try smaller chunks first — &quot;TION&quot; at the end often unlocks the whole word.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Speed vs accuracy</h3>
                  <p className="mt-1">Points reward correct answers, fast finishes, and few wrong attempts. A skipped word costs less than five wrong guesses — skip early when you&apos;re stuck.</p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Understand your score</h3>
                  <p className="mt-1">Points, XP, and gems scale with the level, your accuracy, completion time, and wrong attempts. Daily challenges give everyone the same word set, and head-to-head challenges compare points.</p>
                </article>
              </div>
            </section>
          </MobileContentDisclosure>

          <Dialog open={infoModal === "rules"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-cyan-600" /> Rules</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>Unscramble jumbled English words to complete the round.</p>
                <ul className="list-none space-y-2">
                  {[
                    "Choose a difficulty — Easy, Medium, Hard, or Expert.",
                    "Each round has a fixed set of words shown as jumbled letters.",
                    "Tap letter tiles (or type on a keyboard) to build the word — every letter is used exactly once.",
                    "Press Check to submit; wrong answers cost an attempt. Skip moves to the next word.",
                    "Finish all words to complete the round — your accuracy, time, and attempts set your score.",
                  ].map((rule, index) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-700 dark:text-cyan-300">{index + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-1">Points, XP, and 💎 gems scale with the level, accuracy, completion time, and few wrong attempts.</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={infoModal === "controls"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Keyboard className="h-5 w-5 text-cyan-600" /> Controls</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-2 font-semibold text-foreground">Touch / Mouse</p>
                  <div className="space-y-1.5 text-muted-foreground">
                    {[
                      ["Tap a jumbled letter tile", "Adds that letter to your answer"],
                      ["Tap an answer slot", "Removes that letter from your answer"],
                      ["Clear button", "Empties your current answer"],
                      ["Check button", "Submits the answer"],
                      ["Skip button", "Moves to the next word"],
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
                      ["A–Z keys", "Add that letter to your answer"],
                      ["Backspace", "Remove the last letter"],
                      ["Enter", "Check your answer"],
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
                <DialogTitle className="flex items-center gap-2"><Scroll className="h-5 w-5 text-cyan-600" /> Backstory</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Jumble words — anagrams — have been a newspaper puzzle staple
                  for over a century. The idea is beautifully simple: take a
                  word, scramble its letters, and challenge the reader to
                  restore it against the clock.
                </p>
                <p>
                  What looks like a party trick is actually a workout for the
                  brain: unscrambling forces you to hold candidate words in
                  working memory while testing letter patterns — the same
                  mental muscles used in spelling, vocabulary, and pattern
                  recognition.
                </p>
                <p>
                  This version adds four difficulty levels from short common
                  words to long expert vocabulary, daily challenges where
                  everyone gets the same word set, head-to-head duels, and
                  persistent stats.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </> : <section className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-5">
          {/* Top controls */}
          <div className="mb-2 flex flex-nowrap items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 px-2 py-1.5 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:px-3">
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Check className="h-3.5 w-3.5 text-cyan-600"/>{game.correct}/{game.questions.length}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><Clock3 className="h-3.5 w-3.5 text-cyan-600"/>{fmt(elapsed)}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><X className="h-3.5 w-3.5 text-cyan-600"/>{game.wrongAttempts} wrong</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-background px-2 py-1 font-bold tabular-nums sm:px-2.5"><LayoutGrid className="h-3.5 w-3.5 text-cyan-600"/>{cfg?.label}</span>
            {reviewing ? (
              <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1 px-2" onClick={exitReview}><ArrowLeft className="h-4 w-4"/> <span className="hidden sm:inline">Back to round</span></Button>
            ) : game.skipped.length > 0 ? (
              <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1 border-amber-300 px-2 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/30" onClick={startReview}><RotateCcw className="h-4 w-4"/> <span className="hidden sm:inline">Skipped ({game.skipped.length})</span><span className="sm:hidden">{game.skipped.length}</span></Button>
            ) : null}
            <Button variant="outline" size="sm" className="ml-auto h-8 shrink-0 gap-1 px-2 text-red-600" onClick={() => setEndConfirm(true)}><X className="h-4 w-4"/> <span className="hidden sm:inline">End round</span></Button>
          </div>

          {/* Progress dots */}
          <div className="mb-3 flex items-center gap-1.5 px-1" aria-label="Round progress">
            {game.questions.map((_, i) => {
              const isSkipped = game.skipped.includes(i);
              const isReviewing = reviewing && game.skipped[game.reviewIndex!] === i;
              return <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${isReviewing ? "bg-amber-400 animate-pulse" : isSkipped ? "bg-amber-300/70 dark:bg-amber-700/50" : i < game.correct ? "bg-cyan-500" : i === game.index && !roundDone ? "bg-cyan-300 animate-pulse" : "bg-muted"}`} />;
            })}
          </div>

          <div className="mx-auto w-full max-w-[560px] space-y-4 rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-300 to-blue-300 p-1.5 shadow-lg shadow-cyan-500/15 dark:from-cyan-800 dark:via-sky-800 dark:to-blue-800">
            <div className="rounded-xl border border-white/70 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-950/80 sm:p-6" key={shakeKey} style={shakeKey ? { animation: "jumble-shake .3s" } : undefined}>
              <style>{`@keyframes jumble-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
              <p className="text-center text-[10px] font-bold uppercase tracking-[.2em] text-cyan-700 dark:text-cyan-300">{reviewing ? `Skipped word ${game.reviewIndex! + 1} of ${game.skipped.length}` : `Word ${game.index + 1} of ${game.questions.length}`}</p>

              {/* Answer slots */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5" aria-label="Your answer">
                {Array.from({ length: answerSlots }).map((_, i) => {
                  const letter = game.answer[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { if (letter) removeLastLetter(); }}
                      className={`flex h-11 w-9 items-center justify-center rounded-lg border-2 text-lg font-black uppercase transition ${letter ? "border-cyan-400 bg-cyan-50 text-cyan-900 shadow-sm hover:border-cyan-500 dark:border-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-100" : "border-dashed border-cyan-300/70 bg-white/60 dark:border-slate-600 dark:bg-slate-900/50"}`}
                    >{letter ?? ""}</button>
                  );
                })}
              </div>

              {/* Jumbled letters */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5" aria-label="Jumbled letters">
                {letters.map((letter, i) => {
                  const used = game.used.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={used}
                      onClick={() => addLetter(i)}
                      className={`flex h-11 w-9 items-center justify-center rounded-lg border-2 text-lg font-black uppercase transition ${used ? "scale-95 border-transparent bg-transparent text-transparent" : "border-cyan-300/80 bg-white text-cyan-900 shadow-sm hover:-translate-y-0.5 hover:border-cyan-500 hover:bg-cyan-50 active:translate-y-0 dark:border-slate-600 dark:bg-slate-800 dark:text-cyan-100 dark:hover:bg-slate-700"}`}
                    >{letter}</button>
                  );
                })}
              </div>

              {/* Action row */}
              <div className="mt-5 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={clearAnswer} disabled={!game.answer}><Eraser className="h-4 w-4"/> Clear</Button>
                <Button size="sm" className="gap-1 bg-cyan-600 hover:bg-cyan-700" onClick={submitAnswer} disabled={!game.answer}><Check className="h-4 w-4"/> Check</Button>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={skipQuestion}><SkipForward className="h-4 w-4"/> Skip</Button>
              </div>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">Tap tiles or type letters · Backspace deletes · Enter checks</p>
            </div>
          </div>

          <div className="mt-3 hidden flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground sm:flex">
            <span>{cfg?.questions} words · accuracy, speed, and few wrong attempts score highest</span>
          </div>
        </section>}
      </section>
    </div>

    <Dialog open={endConfirm} onOpenChange={setEndConfirm}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>End this round?</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Your progress ({game?.correct ?? 0}/{game?.questions.length ?? 0} correct) will be saved now.</p>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setEndConfirm(false)}>Keep playing</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => { setEndConfirm(false); endRunEarly(); }}>End round</Button>
        </div>
      </DialogContent>
    </Dialog>
  </main>;
}
