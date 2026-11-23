import React from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, BookOpen, Check, Clock3, Flame, Home, Keyboard, LayoutGrid, Lightbulb, RotateCcw, Scroll, Share2, Swords, Target, Timer, Trophy, Users, Volume2, VolumeX, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
import {
  dailyQuizConfig, isQuizLevel, isQuizSubject, pickQuestions, QUIZ_LEVELS, quizGameId,
  quizSubject, type QuizLevel, type QuizQuestion, type QuizSubject,
} from "@/lib/quiz";
import { recordQuizCompletion, patchLastQuizPoints, summarizeQuizStats, getQuizHistory } from "@/lib/quiz-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileContentDisclosure } from "@/components/mobile-content-disclosure";

const SAVE_KEY = "brain-games-quiz-session";

type SavedGame = {
  subject: QuizSubject;
  level: QuizLevel;
  questions: QuizQuestion[];
  /** chosen option index per answered question; -1 = skipped */
  answers: number[];
  index: number;
  correct: number;
  elapsed: number;
  savedAt: number;
  status: "playing" | "done";
  gameId?: number;
  seed?: number;
  dailyDate?: string;
  challengeId?: number;
};

type QuizReward = { points: number; xpEarned: number; gemsEarned: number; elapsedSeconds: number; questions: number; correct: number; offline?: boolean };
type QuizChallengeResult = {
  id: number; status: string; challengerId: number; challengedId: number; winnerId: number | null;
  challengerUsername: string; challengedUsername: string;
  challengerPoints: number | null; challengedPoints: number | null;
  challengerCorrect: number | null; challengerQuestions: number | null;
  challengedCorrect: number | null; challengedQuestions: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
};

function loadSaved(): SavedGame | null {
  try {
    const value = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as SavedGame | null;
    if (value && isQuizSubject(value.subject) && isQuizLevel(value.level) && Array.isArray(value.questions) && value.questions.length > 0) {
      value.answers = Array.isArray(value.answers) ? value.answers : [];
      value.index = Number.isFinite(value.index) ? value.index : 0;
      value.correct = Number.isFinite(value.correct) ? value.correct : 0;
      value.status = value.status === "done" ? "done" : "playing";
      return value;
    }
  } catch { /* Ignore an unavailable or invalid save. */ }
  return null;
}

const fmt = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function QuizPage({ params }: { params: { subject?: string } }) {
  const subject = quizSubject(params.subject);
  const subjectId = subject.id as QuizSubject;
  const [, setLocation] = useLocation();
  const search = useSearch();
  const query = new URLSearchParams(search);
  const { profileId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId as number);
  const queryClient = useQueryClient();
  const sounds = useSound(profile?.soundEnabled);
  const gameMode = profile?.gameMode ?? "4all";
  const levels = QUIZ_LEVELS.filter((level) =>
    gameMode === "children" ? subject.levels[level].mode === "baby" :
    gameMode === "adult" ? subject.levels[level].mode === "adult" : true,
  );

  const [game, setGame] = React.useState<SavedGame | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [hasSavedGame, setHasSavedGame] = React.useState(false);
  const [reward, setReward] = React.useState<QuizReward | null>(null);
  const [rewardLoading, setRewardLoading] = React.useState(false);
  const [challengeResult, setChallengeResult] = React.useState<QuizChallengeResult | null>(null);
  const [picked, setPicked] = React.useState<number | null>(null);
  const [infoModal, setInfoModal] = React.useState<"rules" | "controls" | "backstory" | null>(null);
  const activeGameRef = React.useRef(game);
  activeGameRef.current = game;
  const pendingGameRef = React.useRef<{ savedAt: number; promise: Promise<number | null> } | null>(null);
  const directStartHandledRef = React.useRef(false);
  const advanceTimerRef = React.useRef<number | null>(null);

  usePageMeta({
    title: `${subject.name} | Play Brain Games`,
    description: `Answer timed multiple-choice ${subject.name.toLowerCase()} questions across four levels. Play free quiz games.`,
    path: `/quiz/${subjectId}`,
  });

  React.useEffect(() => {
    const saved = loadSaved();
    // Only resume a saved game for this subject.
    if (saved && saved.subject !== subjectId) return;
    setHasSavedGame(Boolean(saved));
    if (query.get("resume") === "1" && saved && saved.subject === subjectId) {
      setGame(saved); setElapsed(saved.elapsed);
    }
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

  React.useEffect(() => () => { if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current); }, []);

  const finishRound = React.useCallback((completed: SavedGame, finalElapsed: number) => {
    const done: SavedGame = { ...completed, status: "done", answers: [...completed.answers] };
    setGame(done);
    setPicked(null);
    localStorage.removeItem(SAVE_KEY);
    setHasSavedGame(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3200);
    recordQuizCompletion(profileId, done.subject, done.level, done.correct, done.questions.length, 0, finalElapsed);
    void completeGame(done, finalElapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const completeGame = async (completed: SavedGame, finalElapsed: number) => {
    setRewardLoading(true);
    try {
      const pending = pendingGameRef.current;
      let gameId = completed.gameId ?? (pending?.savedAt === completed.savedAt ? await pending.promise : null);
      if (!gameId && profileId && navigator.onLine !== false) {
        const createController = new AbortController();
        const createTimeout = window.setTimeout(() => createController.abort(), 5000);
        try {
          const created = await customFetch<{ id: number }>("/api/quiz-games", {
            method: "POST",
            body: JSON.stringify({
              profileId,
              subject: completed.subject,
              level: completed.level,
              ...(completed.seed ? { seed: completed.seed } : {}),
              ...(completed.dailyDate ? { dailyDate: completed.dailyDate } : {}),
            }),
            signal: createController.signal,
          });
          gameId = created.id;
          setGame((current) => current?.savedAt === completed.savedAt ? { ...current, gameId: gameId ?? undefined } : current);
        } finally {
          window.clearTimeout(createTimeout);
        }
      }
      if (!gameId) throw new Error("Game could not be saved");
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      let result: QuizReward;
      try {
        result = await customFetch<QuizReward>(`/api/quiz-games/${gameId}/complete`, {
          method: "POST",
          body: JSON.stringify({ elapsedSeconds: finalElapsed, questions: completed.questions.length, correct: completed.correct, answers: completed.answers }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeout);
      }
      if (activeGameRef.current?.savedAt === completed.savedAt) {
        setReward(result);
        patchLastQuizPoints(profileId, completed.subject, result.points);
      }
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: [`/api/profiles/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/stats/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/achievements/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/quiz-daily-challenge/status/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: ["quiz-challenges"] });
        window.dispatchEvent(new CustomEvent(ACHIEVEMENT_COMPLETION_EVENT, { detail: { profileId } }));
      }
    } catch (error) {
      console.error("[Quiz] Could not save completion rewards:", error);
      if (activeGameRef.current?.savedAt === completed.savedAt) {
        setReward({ points: 0, xpEarned: 0, gemsEarned: 0, elapsedSeconds: finalElapsed, questions: completed.questions.length, correct: completed.correct, offline: true });
      }
    } finally {
      if (activeGameRef.current?.savedAt === completed.savedAt) setRewardLoading(false);
    }
  };

  const startGame = (level: QuizLevel, dailyDate?: string, seed?: number, existingGameId?: number, challengeId?: number) => {
    sounds.click();
    const cfg = subject.levels[level];
    // Daily rounds must use the shared config seed so client and server agree.
    const gameSeed = seed ?? (dailyDate ? dailyQuizConfig(subject, dailyDate).seed : Math.floor(Math.random() * 2_147_483_646) + 1);
    const questions = pickQuestions(subject.bank[level], cfg.questions, gameSeed);
    if (questions.length === 0) { toast.error("No questions available for this level yet."); return; }
    const savedAt = Date.now();
    const nextGame: SavedGame = {
      subject: subjectId, level, questions, answers: [], index: 0, correct: 0,
      elapsed: 0, savedAt, status: "playing", seed: gameSeed,
      ...(dailyDate ? { dailyDate } : {}), ...(existingGameId ? { gameId: existingGameId } : {}), ...(challengeId ? { challengeId } : {}),
    };
    setGame(nextGame); setReward(null); setPicked(null); setRewardLoading(false); setElapsed(0); setChallengeResult(null);
    setLocation(dailyDate
      ? `/quiz/${subjectId}?play=1&dailyDate=${dailyDate}&level=${level}&seed=${seed}`
      : challengeId
        ? `/quiz/${subjectId}?play=1&challengeId=${challengeId}&gameId=${existingGameId}&level=${level}&seed=${seed}`
        : `/quiz/${subjectId}?play=1`);
    if (existingGameId) {
      pendingGameRef.current = { savedAt, promise: Promise.resolve(existingGameId) };
      return;
    }
    const promise = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const { id } = await customFetch<{ id: number }>("/api/quiz-games", {
          method: "POST",
          body: JSON.stringify({ profileId: profileId ?? null, subject: subjectId, level, seed: gameSeed, ...(dailyDate ? { dailyDate } : {}) }),
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
    if (query.get("start") !== "1" && query.get("play") !== "1" || directStartHandledRef.current || profileLoading) return;
    directStartHandledRef.current = true;
    const requestedLevel = query.get("level");
    const level = isQuizLevel(requestedLevel) && levels.includes(requestedLevel) ? requestedLevel : levels[0];
    if (!level) return;
    const dailyDate = query.get("dailyDate");
    const seedValue = Number(query.get("seed"));
    const seed = Number.isInteger(seedValue) && seedValue > 0 ? seedValue : undefined;
    const existingGameId = Number(query.get("gameId"));
    const challengeId = Number(query.get("challengeId"));
    startGame(level,
      dailyDate && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate) ? dailyDate : undefined,
      seed,
      Number.isInteger(existingGameId) && existingGameId > 0 ? existingGameId : undefined,
      Number.isInteger(challengeId) && challengeId > 0 ? challengeId : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, profile?.gameMode, search]);

  const answerQuestion = (optionIndex: number) => {
    if (!game || game.status !== "playing" || picked !== null) return;
    const question = game.questions[game.index];
    if (!question) return;
    const correct = optionIndex === question.answer;
    sounds[correct ? "place" : "click"]();
    setPicked(optionIndex);
    const nextAnswers = [...game.answers];
    nextAnswers[game.index] = optionIndex;
    const next: SavedGame = { ...game, answers: nextAnswers, correct: game.correct + (correct ? 1 : 0) };
    setGame(next);
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(() => {
      setPicked(null);
      if (game.index + 1 >= game.questions.length) {
        sounds.complete();
        finishRound(next, elapsed);
      } else {
        setGame({ ...next, index: next.index + 1 });
      }
    }, 900);
  };

  const skipQuestion = () => {
    if (!game || game.status !== "playing" || picked !== null) return;
    sounds.click();
    const nextAnswers = [...game.answers];
    nextAnswers[game.index] = -1;
    const next: SavedGame = { ...game, answers: nextAnswers };
    setGame(next);
    if (game.index + 1 >= game.questions.length) {
      finishRound(next, elapsed);
    } else {
      setGame({ ...next, index: next.index + 1 });
    }
  };

  const exitToGameHome = () => {
    if (advanceTimerRef.current) { window.clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    setGame(null);
    setPicked(null);
    setLocation(`/quiz/${subjectId}`);
  };

  const shareResult = async () => {
    if (!game) return;
    const url = appShareUrlForPath(`/quiz/${subjectId}`);
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const rewardLine = reward && !reward.offline
      ? `+${reward.points.toLocaleString()} pts · +${reward.xpEarned} XP · +${reward.gemsEarned} 💎`
      : null;
    const lines = [
      `🧠 ${subject.name}: ${game.correct}/${game.questions.length} correct on ${subject.levels[game.level].label} in ${fmt(elapsed)}!`,
      rewardLine,
      rank ? `🏅 ${rank} · Play Brain Games . Online` : "🧠 Play Brain Games . Online",
      `🔗 ${url}`,
    ].filter((line): line is string => Boolean(line));
    try {
      const result = await shareOrDownloadShareCard({
        title: `${subject.name} result`,
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: subject.theme.hex,
        filename: "quiz-result.png",
      });
      if (result === "downloaded") toast.success("Result image downloaded — attach it to your message!", { duration: 3000 });
    } catch {
      try {
        await navigator.clipboard.writeText(lines.join("\n"));
        toast.success("Sharing didn't complete. Text copied — paste it into your message.", { duration: 3500 });
      } catch { /* silent */ }
    }
  };

  React.useEffect(() => {
    if (!game || game.status !== "done" || !game.challengeId) { setChallengeResult(null); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const detail = await customFetch<QuizChallengeResult>(`/api/quiz-challenges/${game.challengeId}`);
        if (!cancelled) setChallengeResult(detail);
        if (detail.status === "completed") return;
      } catch { /* Retry below. */ }
      if (!cancelled) timer = setTimeout(refresh, 5000);
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [game?.status, game?.challengeId]);

  // ---------- Setup screen ----------
  if (!game) {
    const stats = summarizeQuizStats(getQuizHistory(profileId, subjectId));
    const dailyConfig = dailyQuizConfig(subject, new Date().toISOString().slice(0, 10));
    const dailyHref = `/quiz-challenge?subject=${subjectId}`;
    return (
      <main className="mx-auto w-full max-w-lg space-y-3 px-3 py-3 sm:space-y-4 sm:px-6 sm:py-8">
        {/* Header banner */}
        <div className={`relative isolate flex items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 ${subject.theme.border} bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} px-3 py-2 shadow-lg sm:px-4 sm:py-3`}>
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl" style={{ backgroundColor: `${subject.theme.hex}4d` }} />
          <Button variant="ghost" size="sm" className="relative z-10 shrink-0 px-1" onClick={() => setLocation("/")}><ArrowLeft className="mr-1 h-4 w-4" /> Home</Button>
          <div className="relative z-10 min-w-0 flex-1 text-right">
            <h1 className="font-serif text-xl font-bold leading-tight tracking-tight sm:text-2xl">{subject.emoji} {subject.shortName} Quiz</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">{subject.tagline}</p>
          </div>
          <Button variant="ghost" size="icon" className="relative z-10 shrink-0" aria-label={sounds.enabled ? "Mute sounds" : "Enable sounds"} onClick={sounds.toggle}>{sounds.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</Button>
        </div>

        {hasSavedGame && (
          <button onClick={() => setLocation(`/quiz/${subjectId}?resume=1`)} className={`flex w-full items-center gap-3 rounded-xl border-2 ${subject.theme.border} bg-card px-3 py-2.5 sm:px-4 sm:py-3 text-left transition hover:bg-muted/50`}>
            <Clock3 className={`h-4 w-4 shrink-0 ${subject.theme.text}`} />
            <span className="min-w-0 flex-1"><span className={`block text-sm font-semibold ${subject.theme.strong}`}>Resume {subject.shortName} Quiz</span><span className="block text-xs text-muted-foreground">Pick up where you left off</span></span>
            <span className={`text-lg ${subject.theme.text}`}>→</span>
          </button>
        )}

        {/* Hero + level select */}
        <div className={`relative isolate overflow-hidden rounded-2xl border-2 ${subject.theme.border} bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} p-3 shadow-xl sm:p-5`}>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl" style={{ backgroundColor: `${subject.theme.hex}33` }} />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border bg-white/15 p-1.5 opacity-60 dark:bg-white/5" style={{ borderColor: `${subject.theme.hex}26` }}>{["A", "B", "C", "D", "E", "F", "G", "H"].map((letter) => <span key={letter} className="flex items-center justify-center rounded-md border text-xs font-black" style={{ borderColor: `${subject.theme.hex}1a`, color: `${subject.theme.hex}40` }}>{letter}</span>)}</div>
          <div className="relative z-10 mb-4 hidden items-center gap-3 rounded-xl border bg-white/65 px-3 py-3 dark:bg-slate-950/30 sm:flex" style={{ borderColor: `${subject.theme.hex}33` }}>
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl ${subject.theme.soft}`}>{subject.emoji}</span>
            <div className="min-w-0 flex-1"><h2 className="font-serif text-lg font-bold">Ready to quiz?</h2><p className="text-xs leading-relaxed text-muted-foreground">Timed multiple-choice questions — answer before the clock runs out. Pick a level to start.</p></div>
          </div>
          <p className="relative z-10 mb-2 hidden text-xs font-semibold uppercase tracking-widest sm:block" style={{ color: subject.theme.hex }}>Choose Level</p>
          <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-2.5">
            {levels.map((level) => {
              const cfg = subject.levels[level];
              const icons: Record<QuizLevel, string> = { easy: "🌱", medium: "🧭", hard: "🔥", expert: "⚡" };
              return (
                <button key={level} type="button" onClick={() => startGame(level)} className={`group flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-white/80 p-2 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] sm:min-h-[92px] sm:p-3 dark:bg-slate-950/40 ${subject.theme.border} ${subject.theme.hover}`}>
                  <span className={`grid h-8 w-8 place-items-center rounded-xl text-lg sm:h-9 sm:w-9 sm:text-xl ${subject.theme.soft}`}>{icons[level]}</span>
                  <span className="text-sm font-bold leading-tight">{cfg.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{cfg.detail} · {cfg.parSeconds}s</span>
                </button>
              );
            })}
            {levels.length === 0 && <p className="col-span-2 text-sm text-muted-foreground">No levels available for your game mode.</p>}
          </div>
        </div>

        {/* Daily challenge */}
        <button onClick={() => setLocation(dailyHref)} className={`flex w-full items-center gap-3 rounded-xl border-2 ${subject.theme.border} bg-card px-3 py-2.5 sm:px-4 sm:py-3 text-left transition hover:bg-muted/50`}>
          <Flame className={`h-5 w-5 shrink-0 ${subject.theme.text}`} />
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Daily {subject.shortName} Quiz</span><span className="block text-xs text-muted-foreground">{subject.levels[dailyConfig.level].label} · {dailyConfig.questions} questions — one shared quiz each day</span></span>
          <span className={subject.theme.text}>→</span>
        </button>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setLocation(`/profile?tab=${quizGameId(subjectId)}`)} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left sm:p-3 transition hover:bg-muted/50"><Users className={`h-5 w-5 shrink-0 ${subject.theme.text}`} /><span><span className="block text-sm font-semibold">My Stats</span><span className="hidden text-xs text-muted-foreground sm:block">Best scores & progress</span></span></button>
          <button onClick={() => setLocation(`/leaderboard/${quizGameId(subjectId)}`)} className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left sm:p-3 transition hover:bg-muted/50"><Trophy className={`h-5 w-5 shrink-0 ${subject.theme.text}`} /><span><span className="block text-sm font-semibold">Leaderboard</span><span className="hidden text-xs text-muted-foreground sm:block">Top quizzer</span></span></button>
        </div>
        <button onClick={() => setLocation(`/challenges?tab=${quizGameId(subjectId)}`)} className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed bg-card/60 px-3 py-2.5 sm:px-4 sm:py-3 text-left transition hover:bg-muted/50">
          <Swords className={`h-5 w-5 shrink-0 ${subject.theme.text}`} />
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Challenges</span><span className="block text-xs text-muted-foreground">Challenge a friend to beat your score</span></span>
          <span className={subject.theme.text}>→</span>
        </button>

        {stats.totalGames > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Played", value: String(stats.totalGames) },
              { label: "Best accuracy", value: `${stats.bestAccuracy}%` },
              { label: "Day streak", value: `🔥${stats.currentStreak}` },
            ].map(({ label, value }) => <div key={label} className="space-y-1 rounded-xl border bg-card p-2.5 text-center sm:p-3"><p className="text-base font-black tabular-nums sm:text-lg">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>)}
          </div>
        )}

        {/* Info links */}
        <div className="home-info-links flex items-center justify-center gap-4 rounded-xl border border-border bg-card px-3 py-2 sm:gap-6 sm:px-4 sm:py-2.5">
          <button onClick={() => setInfoModal("rules")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><BookOpen className="h-3.5 w-3.5" /> Rules</button>
          <span className="text-border">·</span>
          <button onClick={() => setInfoModal("controls")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Keyboard className="h-3.5 w-3.5" /> Controls</button>
          <span className="text-border">·</span>
          <button onClick={() => setInfoModal("backstory")} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><Scroll className="h-3.5 w-3.5" /> Backstory</button>
        </div>

        <MobileContentDisclosure
          id={`${subjectId}-quiz-guidance`}
          title={`More ${subject.shortName} Quiz guidance`}
          className={`rounded-2xl border ${subject.theme.border} bg-card p-5 sm:p-6`}
        >
          <section className="space-y-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">How to play and improve at {subject.shortName} Quiz</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Each round is a timed set of multiple-choice {subject.name.toLowerCase()} questions. Answer before the timer moves on, skip only when you are unsure, and finish every question to earn points, XP, and gems.
              </p>
            </div>
            <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
              <article>
                <h3 className="font-semibold text-foreground">Pick the right level</h3>
                <p className="mt-1">Easy is the fastest warm-up, Medium adds more questions, Hard increases the pace, and Expert asks the toughest mix. Higher levels award more points but demand quicker recall.</p>
              </article>
              <article>
                <h3 className="font-semibold text-foreground">Use skips wisely</h3>
                <p className="mt-1">Skipping keeps the round moving, but unanswered questions do not add to your correct count. Guess only when the choices give you a real chance.</p>
              </article>
              <article>
                <h3 className="font-semibold text-foreground">Track your streak</h3>
                <p className="mt-1">Daily quizzes refresh once per day and feed your streak. Regular practice also builds the accuracy shown in your stats.</p>
              </article>
              <article>
                <h3 className="font-semibold text-foreground">Challenge friends</h3>
                <p className="mt-1">Head-to-head challenges compare points and correct answers, so a fast accurate run can beat a slower perfect one.</p>
              </article>
            </div>
          </section>
        </MobileContentDisclosure>

        {/* Rules modal */}
        <Dialog open={infoModal === "rules"} onOpenChange={(open) => !open && setInfoModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><BookOpen className={`h-5 w-5 ${subject.theme.text}`} /> Rules</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>{subject.name} Quiz is a timed multiple-choice game. Answer as many questions correctly as you can before the round ends.</p>
              <ul className="list-none space-y-2">
                {[
                  "Choose a level, then answer every question in order.",
                  "Each level has its own question count and seconds-per-question pace.",
                  "Correct answers add to your score; wrong answers and skips do not.",
                  "Finish the full round to earn points, XP, and gems.",
                  "Daily quizzes use the same questions for everyone each day.",
                ].map((rule, index) => (
                  <li key={rule} className="flex gap-2">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold ${subject.theme.soft}`}>{index + 1}</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <p className="pt-1">Score reflects the level, correct answers, and completion time.</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Controls modal */}
        <Dialog open={infoModal === "controls"} onOpenChange={(open) => !open && setInfoModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Keyboard className={`h-5 w-5 ${subject.theme.text}`} /> Controls</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-2 font-semibold text-foreground">Mouse / Touch</p>
                <div className="space-y-1.5 text-muted-foreground">
                  {[
                    ["Tap / click an answer", "Submit that choice for the current question"],
                    ["Skip button", "Move to the next question without answering"],
                    ["Back button", "Return to the quiz level picker"],
                    ["Daily Quiz", "Play today's shared round"],
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
                    ["Correct answers", "Each correct answer adds to the score"],
                    ["Time", "Faster rounds earn a bonus"],
                    ["Daily / challenge", "Shared rounds and friend duels compare points"],
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
              <DialogTitle className="flex items-center gap-2"><Scroll className={`h-5 w-5 ${subject.theme.text}`} /> Backstory</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Quiz games have been a staple of puzzle books, radio shows, and
                television for decades. The multiple-choice format became famous
                through pub quizzes and TV game shows, where quick recall and
                broad knowledge decided the winner.
              </p>
              <p>
                This {subject.shortName} Quiz keeps that fast recall challenge
                and adds four levels, daily shared quizzes, leaderboards, and
                head-to-head challenges against friends.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    );
  }

  // ---------- Playing screen ----------
  if (game.status === "playing") {
    const question = game.questions[game.index];
    const cfg = subject.levels[game.level];
    const answered = game.answers.filter((a) => a !== undefined && a !== -1).length;
    return (
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-lg flex-col px-3 pb-6 pt-3 sm:px-4 sm:pb-8 sm:pt-4">
        <div className={`mb-2 flex items-center gap-2 rounded-xl border ${subject.theme.border} bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} px-2.5 py-1.5 shadow-sm sm:px-3 sm:py-2`}>
          <Button variant="ghost" size="sm" className="shrink-0 px-1" onClick={exitToGameHome} aria-label="Back to quiz home"><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{subject.emoji} {subject.name} · {cfg.label}</p>
            <p className="text-xs text-muted-foreground">Question {game.index + 1} of {game.questions.length} · {game.correct} correct</p>
          </div>
          <span className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-mono font-bold"><Timer size={14} className={subject.theme.text} />{fmt(elapsed)}</span>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all ${subject.theme.fill}`} style={{ width: `${((game.index + (picked !== null ? 1 : 0)) / game.questions.length) * 100}%` }} /></div>
          {!game.dailyDate && !game.challengeId && (
            <select value={game.level} disabled={picked !== null} onChange={(event) => startGame(event.target.value as QuizLevel)} aria-label="Change quiz level" className="h-8 max-w-[7rem] shrink-0 rounded-lg border border-border bg-card px-2 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
              {levels.map((level) => <option key={level} value={level}>{subject.levels[level].label}</option>)}
            </select>
          )}
        </div>

        <Card className="flex-1"><CardContent className="flex flex-col gap-3 pb-4 pt-4 sm:gap-4 sm:pb-6 sm:pt-6">
          {question ? (
            <>
              <p className="text-lg font-semibold leading-snug">{question.text}</p>
              <div className="grid gap-2 sm:gap-2.5">
                {question.options.map((option, i) => {
                  const isPicked = picked === i;
                  const isCorrect = question.answer === i;
                  const showResult = picked !== null;
                  return (
                    <button key={i} type="button" onClick={() => answerQuestion(i)} disabled={picked !== null}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium transition sm:px-4 sm:py-3.5 ${
                        showResult && isCorrect ? "border-green-500 bg-green-500/15 text-green-800 dark:text-green-300" :
                        showResult && isPicked ? "border-red-500 bg-red-500/15 text-red-800 dark:text-red-300" :
                        picked === null ? `border-border bg-white/60 ${subject.theme.hover} dark:bg-slate-950/30` :
                        "border-border bg-white/40 opacity-60 dark:bg-slate-950/20"}`}>
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                        showResult && isCorrect ? "bg-green-500 text-white" : showResult && isPicked ? "bg-red-500 text-white" : subject.theme.soft}`}>{String.fromCharCode(65 + i)}</span>
                      <span className="flex-1">{option}</span>
                      {showResult && isCorrect && <Check size={18} className="text-green-600" />}
                      {showResult && isPicked && !isCorrect && <X size={18} className="text-red-600" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">{answered + (picked !== null ? 1 : 0)} answered</span>
                <Button variant="ghost" size="sm" onClick={skipQuestion} disabled={picked !== null} className="text-muted-foreground"><Lightbulb size={14} className="mr-1" /> Skip</Button>
              </div>
            </>
          ) : null}
        </CardContent></Card>
      </main>
    );
  }

  // ---------- Result screen ----------
  const accuracy = game.questions.length ? Math.round((game.correct / game.questions.length) * 100) : 0;
  return (
    <main className="mx-auto w-full max-w-lg space-y-4 px-3 py-5 sm:px-6 sm:py-8">
      {showConfetti && <Confetti />}
      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-2xl p-5 text-center text-white shadow-xl sm:p-6" style={{ background: `linear-gradient(135deg, ${subject.theme.hex}, ${subject.theme.hex}dd 55%, ${subject.theme.hex}bb)` }}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/15" />
        <div className="relative z-10 space-y-2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/20 text-3xl">{subject.emoji}</div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75">{game.dailyDate ? `Daily ${subject.shortName} Quiz` : subject.name} complete</p>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">{game.correct}/{game.questions.length} correct · {accuracy}%</h1>
          <p className="text-sm text-white/85">{subject.levels[game.level].label} · finished in {fmt(elapsed)}</p>
          {game.dailyDate && <p className="text-sm font-semibold text-white/90">📅 Today&apos;s shared daily quiz</p>}
          {game.challengeId && <p className="pt-1 text-sm font-bold text-white">⚔️ Challenge score submitted</p>}
          <Button variant="secondary" className="mt-2 gap-2" onClick={() => void shareResult()}><Share2 className="h-4 w-4" /> Share your result</Button>
        </div>
      </section>

      {/* Actions */}
      <section className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        {game.challengeId
          ? <Button className="w-full gap-2" onClick={() => setLocation(`/challenges?tab=${quizGameId(subjectId)}`)}><Trophy className="h-4 w-4" /> Return to {subject.shortName} challenge</Button>
          : <Button className="w-full gap-2" onClick={() => startGame(game.level, game.dailyDate, undefined, undefined, game.challengeId)}><RotateCcw className="h-4 w-4" /> Play again · {subject.levels[game.level].label}</Button>}
        {!game.dailyDate && !game.challengeId && (
          <div className="grid grid-cols-2 gap-2">
            {levels.map((level) => {
              const cfg = subject.levels[level];
              const active = level === game.level;
              return (
                <button key={level} type="button" onClick={() => startGame(level)} className={`min-h-14 rounded-xl border-2 px-3 py-2 text-left transition ${active ? `${subject.theme.border} ${subject.theme.tint}` : "border-border hover:bg-muted/50"}`}>
                  <span className="block text-sm font-bold">{cfg.label}{active ? " · Current" : ""}</span>
                  <span className="block text-xs text-muted-foreground">{cfg.detail} · {cfg.parSeconds}s</span>
                </button>
              );
            })}
          </div>
        )}
        {!game.dailyDate && !game.challengeId && <Button variant="outline" className="w-full gap-2" onClick={() => setLocation(`/quiz-challenge?subject=${subjectId}`)}><Flame className="h-4 w-4" /> Try today&apos;s daily challenge</Button>}
        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setGame(null)}><LayoutGrid className="h-4 w-4" /> Game home</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation(`/leaderboard/${quizGameId(subjectId)}`)}><Trophy className="h-4 w-4" /> Leaderboard</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation(`/profile?tab=${quizGameId(subjectId)}`)}><Users className="h-4 w-4" /> My stats</Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLocation("/")}><Home className="h-4 w-4" /> Portal</Button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Check, label: "Correct", value: `${game.correct}/${game.questions.length}` },
          { icon: Target, label: "Accuracy", value: `${accuracy}%` },
          { icon: Timer, label: "Time", value: fmt(elapsed) },
          { icon: Trophy, label: "Level", value: subject.levels[game.level].label },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="space-y-1 rounded-xl border bg-card p-3 text-center sm:p-4"><Icon className={`mx-auto h-4 w-4 ${subject.theme.text}`} /><p className="text-base font-black tabular-nums sm:text-lg">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>
        ))}
      </div>

      {/* Rewards */}
      {rewardLoading ? (
        <section className="rounded-2xl border-2 border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30">
          <div className="py-2 text-center text-sm font-semibold text-muted-foreground">Calculating your score and rewards…</div>
        </section>
      ) : reward?.offline ? (
        <section className="rounded-2xl border-2 border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30">
          <div className="py-2 text-center"><p className="font-semibold text-amber-900 dark:text-amber-200">Rewards could not be saved</p><p className="mt-1 text-xs text-muted-foreground">The game server could not save this result.</p></div>
        </section>
      ) : reward ? (
        <section className="rounded-2xl border-2 border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30">
          <div className="grid grid-cols-3 items-center gap-2 text-center">
            <div><p className="text-2xl font-black text-amber-800 dark:text-amber-200">{reward.points.toLocaleString()}</p><p className="text-xs font-semibold text-muted-foreground">Points</p></div>
            <div className="border-x border-amber-300/70 px-2 dark:border-amber-700/60"><p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">+{reward.xpEarned}</p><p className="text-xs font-semibold text-muted-foreground">XP</p></div>
            <div><p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">+{reward.gemsEarned} 💎</p><p className="text-xs font-semibold text-muted-foreground">Gems</p></div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Score reflects level, correct answers, and completion time.</p>
        </section>
      ) : null}

      {/* Challenge result */}
      {game.challengeId && (
        <section className="rounded-xl border border-emerald-200 bg-card p-4 text-center dark:border-emerald-800" aria-live="polite">
          <h2 className="font-bold">Challenge result</h2>
          {!challengeResult || challengeResult.status !== "completed" ? (
            <p className="mt-1 text-sm text-muted-foreground">You finished in {fmt(elapsed)} and earned {reward?.points?.toLocaleString() ?? "…"} points. Waiting for your opponent to finish…</p>
          ) : (() => {
            const mine = challengeResult.challengerId === profileId ? challengeResult.challengerPoints : challengeResult.challengedPoints;
            const theirs = challengeResult.challengerId === profileId ? challengeResult.challengedPoints : challengeResult.challengerPoints;
            const opponent = challengeResult.challengerId === profileId ? challengeResult.challengedUsername : challengeResult.challengerUsername;
            const outcome = challengeResult.winnerId === null ? "It's a tie!" : challengeResult.winnerId === profileId ? "You won the challenge!" : "You lost the challenge.";
            return <><p className="mt-1 text-lg font-black">{outcome}</p><p className="mt-1 text-sm text-muted-foreground">You: {mine ?? 0} points · {opponent}: {theirs ?? 0} points</p><p className="mt-1 text-xs text-muted-foreground">Completed in {fmt(elapsed)}</p></>;
          })()}
        </section>
      )}
    </main>
  );
}
