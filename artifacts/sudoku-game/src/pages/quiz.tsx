import React from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, Check, Clock3, Flame, Home, Lightbulb, Play, Share2, Swords, Timer, Trophy, Users, X } from "lucide-react";
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
      <main className="mx-auto w-full max-w-lg space-y-6 px-4 pb-12 pt-5">
        <div className="space-y-2 rounded-2xl border bg-card px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Home</Link>
          <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">{subject.emoji} {subject.name}</h1>
          <p className="text-sm text-muted-foreground">Timed multiple-choice questions. Pick a level and beat the clock.</p>
        </div>

        <Card className={`border ${subject.theme.border} bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} shadow-md`}><CardContent className="space-y-4 pb-5 pt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Daily challenge</p>
              <p className="font-semibold">{subject.levels[dailyConfig.level].label} · {dailyConfig.questions} questions</p>
              <p className="text-xs text-muted-foreground">Same quiz for everyone, refreshed at 00:00 UTC</p>
            </div>
            <Button asChild className={`shrink-0 gap-2 ${subject.theme.btn}`}><Link href={dailyHref}><Flame size={16} /> Daily</Link></Button>
          </div>
        </CardContent></Card>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Choose a level</h2>
          <div className="grid gap-3">
            {levels.map((level) => {
              const cfg = subject.levels[level];
              return (
                <button key={level} type="button" onClick={() => startGame(level)} className={`group flex items-center gap-4 rounded-2xl border bg-card px-5 py-4 text-left shadow-sm transition ${subject.theme.hover}`}>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${subject.theme.soft}`}><Play size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{cfg.label} <span className="text-xs font-normal text-muted-foreground">· {cfg.detail}</span></span>
                    <span className="block text-xs text-muted-foreground">{cfg.parSeconds}s par · {cfg.basePoints} pts max · +{cfg.xp} XP · +{cfg.gems} 💎</span>
                  </span>
                </button>
              );
            })}
            {levels.length === 0 && <p className="text-sm text-muted-foreground">No levels available for your game mode.</p>}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="gap-2"><Link href={`/quiz/${subjectId}?resume=1`}><Clock3 size={16} /> {hasSavedGame ? "Resume" : "Saved game"}</Link></Button>
          <Button asChild variant="outline" className="gap-2"><Link href={`/leaderboard/${quizGameId(subjectId)}`}><Trophy size={16} /> Leaderboard</Link></Button>
          <Button asChild variant="outline" className="gap-2"><Link href={`/profile?tab=${quizGameId(subjectId)}`}><Users size={16} /> My Stats</Link></Button>
          <Button asChild variant="outline" className="gap-2"><Link href={`/challenges?tab=${quizGameId(subjectId)}`}><Swords size={16} /> Challenges</Link></Button>
        </section>

        {stats.totalGames > 0 && (
          <Card><CardContent className="grid grid-cols-3 gap-3 py-4 text-center">
            <div><p className="text-2xl font-bold">{stats.totalGames}</p><p className="text-xs text-muted-foreground">Played</p></div>
            <div><p className="text-2xl font-bold">{stats.bestAccuracy}%</p><p className="text-xs text-muted-foreground">Best accuracy</p></div>
            <div><p className="text-2xl font-bold">🔥{stats.currentStreak}</p><p className="text-xs text-muted-foreground">Day streak</p></div>
          </CardContent></Card>
        )}
      </main>
    );
  }

  // ---------- Playing screen ----------
  if (game.status === "playing") {
    const question = game.questions[game.index];
    const cfg = subject.levels[game.level];
    const answered = game.answers.filter((a) => a !== undefined && a !== -1).length;
    return (
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-lg flex-col px-4 pb-8 pt-4">
        <div className="mb-4 flex items-center gap-2">
          <Link href={`/quiz/${subjectId}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Back to quiz home"><ArrowLeft size={20} /></Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{subject.emoji} {subject.name} · {cfg.label}</p>
            <p className="text-xs text-muted-foreground">Question {game.index + 1} of {game.questions.length} · {game.correct} correct</p>
          </div>
          <span className="flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm font-mono font-bold"><Timer size={14} className={subject.theme.text} />{fmt(elapsed)}</span>
        </div>

        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all ${subject.theme.fill}`} style={{ width: `${((game.index + (picked !== null ? 1 : 0)) / game.questions.length) * 100}%` }} /></div>

        <Card className="flex-1"><CardContent className="flex flex-col gap-4 pb-6 pt-6">
          {question ? (
            <>
              <p className="text-lg font-semibold leading-snug">{question.text}</p>
              <div className="grid gap-2.5">
                {question.options.map((option, i) => {
                  const isPicked = picked === i;
                  const isCorrect = question.answer === i;
                  const showResult = picked !== null;
                  return (
                    <button key={i} type="button" onClick={() => answerQuestion(i)} disabled={picked !== null}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
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
    <main className="mx-auto w-full max-w-lg space-y-6 px-4 pb-12 pt-5">
      {showConfetti && <Confetti />}
      <Card className={`border ${subject.theme.border} bg-gradient-to-br ${subject.gradient} ${subject.gradientDark} shadow-md`}><CardContent className="space-y-5 pb-6 pt-8 text-center">
        <p className="text-5xl">{subject.emoji}</p>
        <div>
          <h1 className="font-serif text-3xl font-bold">Quiz Complete!</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subject.name} · {subject.levels[game.level].label}</p>
        </div>
        <div className="mx-auto grid max-w-xs grid-cols-3 gap-3">
          <div className="rounded-xl border bg-white/70 px-2 py-3 dark:bg-slate-950/30"><p className={`text-2xl font-bold ${subject.theme.strong}`}>{game.correct}<span className="text-base text-muted-foreground">/{game.questions.length}</span></p><p className="text-xs text-muted-foreground">Correct</p></div>
          <div className="rounded-xl border bg-white/70 px-2 py-3 dark:bg-slate-950/30"><p className="text-2xl font-bold">{accuracy}%</p><p className="text-xs text-muted-foreground">Accuracy</p></div>
          <div className="rounded-xl border bg-white/70 px-2 py-3 dark:bg-slate-950/30"><p className="text-2xl font-bold font-mono">{fmt(elapsed)}</p><p className="text-xs text-muted-foreground">Time</p></div>
        </div>
        {rewardLoading ? <p className="text-sm text-muted-foreground">Calculating rewards…</p> : reward ? (
          <div className="rounded-xl border bg-white/70 px-4 py-3 dark:bg-slate-950/30">
            <p className="text-sm font-semibold">{reward.offline ? "Saved locally — rewards unavailable offline" : `+${reward.points.toLocaleString()} pts · +${reward.xpEarned} XP · +${reward.gemsEarned} 💎`}</p>
          </div>
        ) : null}
        {game.challengeId && challengeResult && (
          <div className="rounded-xl border bg-white/70 px-4 py-3 text-sm dark:bg-slate-950/30">
            {challengeResult.status === "completed" ? (
              <p className="font-semibold">{challengeResult.winnerId === null ? "It's a tie!" : challengeResult.winnerId === profileId ? "You won the challenge!" : `${challengeResult.winnerId === challengeResult.challengerId ? challengeResult.challengerUsername : challengeResult.challengedUsername} wins!`}</p>
            ) : <p className="text-muted-foreground">Waiting for your opponent to finish…</p>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => startGame(game.level, game.dailyDate, undefined, undefined, game.challengeId)} className={`gap-2 ${subject.theme.btn}`}><Play size={16} /> Play again</Button>
          <Button variant="outline" onClick={shareResult} className="gap-2"><Share2 size={16} /> Share</Button>
          <Button asChild variant="outline" className="gap-2"><Link href={`/quiz/${subjectId}`}><Home size={16} /> Game home</Link></Button>
          <Button asChild variant="outline" className="gap-2"><Link href="/"><Trophy size={16} /> Portal</Link></Button>
        </div>
      </CardContent></Card>
    </main>
  );
}
