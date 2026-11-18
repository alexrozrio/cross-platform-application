import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/components/page-meta";
import { RubiksScene } from "@/components/rubiks-scene";
import { RUBIKS_LEVELS, isRubiksPuzzle, puzzleForDifficulty, type RubiksPuzzle } from "@/lib/rubiks";
import { getActiveRubiksGame, getRubiksHistory, recordRubiksCompletion, saveActiveRubiksGame, summarizeRubiksStats } from "@/lib/rubiks-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Clock, Gem, RotateCcw, Trophy, Zap } from "lucide-react";

interface CompleteResult {
  points: number; xpEarned: number; gemsEarned: number;
  elapsedSeconds: number; moves: number; won: boolean; isPersonalBest?: boolean;
}
interface ChallengeDetail {
  id: number; puzzle: RubiksPuzzle; scrambleSeed: number; status: string;
  challengerId: number; challengedId: number;
  challengerGameId: number | null; challengedGameId: number | null;
  challengerUsername: string; challengedUsername: string;
  challengerPoints: number | null; challengedPoints: number | null;
  challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null;
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RubiksPage() {
  usePageMeta({
    title: "Play Rubik's Cube Online — 2×2, 3×3, Pyraminx & 4×4 | Play Brain Games",
    description: "Solve the Rubik's Cube, Pyraminx, Pocket Cube and Rubik's Revenge online. Timed solves, daily challenges and duels.",
    path: "/rubiks",
  });
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const { profileId, isSignedIn } = useAuth();

  const [game, setGame] = useState<{ id: number; puzzle: RubiksPuzzle; scrambleSeed: number } | null>(null);
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [dailyInfo, setDailyInfo] = useState<{ date: string; puzzle: RubiksPuzzle; scrambleSeed: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<"select" | "loading" | "playing" | "done">("select");
  const [result, setResult] = useState<CompleteResult | null>(null);
  const startRef = useRef<number>(0);
  const completedRef = useRef(false);
  const [activeGame, setActiveGame] = useState(() => getActiveRubiksGame(profileId));
  const stats = useMemo(() => summarizeRubiksStats(getRubiksHistory(profileId)), [profileId]);

  // ── boot: resolve what to play ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const gameIdParam = params.get("gameId");
    const challengeIdParam = params.get("challengeId");
    const puzzleParam = params.get("puzzle");
    const dailyParam = params.get("daily");

    async function boot() {
      setStatus("loading");
      try {
        if (challengeIdParam) {
          const ch = await customFetch<ChallengeDetail>(`/api/rubiks-challenges/${challengeIdParam}`);
          if (cancelled) return;
          const myGameId = ch.challengerId === profileId ? ch.challengerGameId : ch.challengedId === profileId ? ch.challengedGameId : null;
          if (!myGameId) { toast.error("This challenge isn't for your account."); setStatus("select"); return; }
          setChallenge(ch);
          setGame({ id: myGameId, puzzle: ch.puzzle, scrambleSeed: ch.scrambleSeed });
          setStatus("playing");
          return;
        }
        if (dailyParam === "1") {
          const cfg = await customFetch<{ date: string; puzzle: RubiksPuzzle; scrambleSeed: number }>("/api/rubiks-daily-challenge");
          if (cancelled) return;
          const created = await customFetch<{ id: number; scrambleSeed: number }>("/api/rubiks-games", {
            method: "POST",
            body: JSON.stringify({ profileId: profileId ?? undefined, puzzle: cfg.puzzle, scrambleSeed: cfg.scrambleSeed, dailyDate: cfg.date }),
          });
          if (cancelled) return;
          setDailyInfo(cfg);
          setGame({ id: created.id, puzzle: cfg.puzzle, scrambleSeed: created.scrambleSeed });
          setStatus("playing");
          return;
        }
        if (gameIdParam) {
          // resume an existing server game by id — fetch not exposed; rely on local active record
          const active = getActiveRubiksGame(profileId);
          if (active && String(active.gameId) === gameIdParam) {
            setGame({ id: active.gameId, puzzle: active.puzzle, scrambleSeed: active.scrambleSeed });
            setStatus("playing");
            return;
          }
        }
        const resume = params.get("resume");
        if (resume === "1" && activeGame) {
          setGame({ id: activeGame.gameId, puzzle: activeGame.puzzle, scrambleSeed: activeGame.scrambleSeed });
          setStatus("playing");
          return;
        }
        if (isRubiksPuzzle(puzzleParam)) {
          const created = await customFetch<{ id: number; scrambleSeed: number }>("/api/rubiks-games", {
            method: "POST",
            body: JSON.stringify({ profileId: profileId ?? undefined, puzzle: puzzleParam }),
          });
          if (cancelled) return;
          setGame({ id: created.id, puzzle: puzzleParam, scrambleSeed: created.scrambleSeed });
          setStatus("playing");
          return;
        }
        setStatus("select");
      } catch {
        if (!cancelled) { toast.error("Could not start the puzzle."); setStatus("select"); }
      }
    }
    void boot();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // timer
  useEffect(() => {
    if (status !== "playing") return;
    startRef.current = Date.now();
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => window.clearInterval(t);
  }, [status, game?.id]);

  const startPuzzle = useCallback(async (puzzle: RubiksPuzzle) => {
    setStatus("loading");
    try {
      const created = await customFetch<{ id: number; scrambleSeed: number }>("/api/rubiks-games", {
        method: "POST",
        body: JSON.stringify({ profileId: profileId ?? undefined, puzzle }),
      });
      setMoves(0);
      setResult(null);
      completedRef.current = false;
      setGame({ id: created.id, puzzle, scrambleSeed: created.scrambleSeed });
      saveActiveRubiksGame({ gameId: created.id, puzzle, scrambleSeed: created.scrambleSeed, startedAt: Date.now() }, profileId);
      setActiveGame(getActiveRubiksGame(profileId));
      setStatus("playing");
    } catch {
      toast.error("Could not start the puzzle.");
      setStatus("select");
    }
  }, [profileId]);

  const handleSolved = useCallback(async () => {
    if (!game || completedRef.current) return;
    completedRef.current = true;
    const secs = Math.max(1, Math.floor((Date.now() - startRef.current) / 1000));
    setElapsed(secs);
    setStatus("done");
    saveActiveRubiksGame(null, profileId);
    setActiveGame(null);
    try {
      const res = await customFetch<CompleteResult>(`/api/rubiks-games/${game.id}/complete`, {
        method: "POST",
        body: JSON.stringify({ elapsedSeconds: secs, moves, won: true }),
      });
      setResult(res);
      recordRubiksCompletion(profileId, game.puzzle, secs, moves, res.points);
    } catch {
      recordRubiksCompletion(profileId, game.puzzle, secs, moves, 0);
      toast.error("Solved! But saving your score failed — check your connection.");
    }
  }, [game, moves, profileId]);

  const level = game ? RUBIKS_LEVELS.find((l) => l.puzzle === game.puzzle) ?? null : null;

  // ── select screen ────────────────────────────────────────────────────────
  if (status === "select" || status === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-3xl font-black tracking-tight">Rubik's Cube</h1>
        <p className="mb-6 text-muted-foreground">Twist, turn and solve — beat the clock.</p>
        {activeGame && (
          <button
            onClick={() => setLocation(`/rubiks?resume=1`)}
            className="mb-4 flex w-full items-center gap-3 rounded-xl border-2 border-amber-400/60 bg-card px-4 py-3 text-left transition hover:bg-amber-50 dark:hover:bg-amber-950/30"
          >
            <RotateCcw className="h-5 w-5 shrink-0 text-amber-600" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Resume {RUBIKS_LEVELS.find((l) => l.puzzle === activeGame.puzzle)?.name ?? activeGame.puzzle}</span>
              <span className="block text-xs text-muted-foreground">Pick up where you left off</span>
            </span>
            <span className="text-lg text-amber-600">→</span>
          </button>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {RUBIKS_LEVELS.map((l) => {
            const best = stats.bestTimes[l.puzzle];
            return (
              <Card key={l.id} className="transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{l.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{l.label}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{l.tagline}</p>
                  {best !== undefined && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> Best: {fmtTime(best)}</p>
                  )}
                  <Button className="w-full" onClick={() => void startPuzzle(l.puzzle)} disabled={status === "loading"}>
                    {status === "loading" ? "Loading…" : "Play"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Daily Challenge</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">One puzzle a day for everyone — climb the daily leaderboard.</p>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/rubiks?daily=1")}>Play today's puzzle</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Your stats</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.totalGames === 0
                  ? "No solves yet — pick a puzzle above."
                  : `${stats.totalGames} solves · best streak ${stats.bestStreak} day${stats.bestStreak === 1 ? "" : "s"}`}
              </p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setLocation(`/profile?tab=rubiks`)}>View stats →</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!game || !level) return null;

  // ── game screen ──────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-3 py-4">
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setLocation("/rubiks")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Puzzles
        </button>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="rounded-full bg-muted px-3 py-1">{level.name}</span>
          <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-amber-500" />{moves} moves</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-sky-500" />{status === "done" ? fmtTime(elapsed) : fmtTime(elapsed)}</span>
        </div>
      </div>

      {challenge && (
        <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/30">
          <Trophy className="mr-1 inline h-4 w-4 text-amber-600" />
          Duel vs <b>{challenge.challengerId === profileId ? challenge.challengedUsername : challenge.challengerUsername}</b>
          {challenge.challengerPoints != null && challenge.challengedPoints != null && (
            <span className="ml-2 text-muted-foreground">— them {challenge.challengerPoints} pts · you {challenge.challengedPoints ?? "…"} pts</span>
          )}
        </div>
      )}
      {dailyInfo && (
        <div className="rounded-xl border border-orange-300/60 bg-orange-50 px-4 py-2 text-sm dark:border-orange-800 dark:bg-orange-950/30">
          <Trophy className="mr-1 inline h-4 w-4 text-orange-600" /> Today's daily challenge
        </div>
      )}

      <div className="relative h-[62vh] min-h-[380px] w-full overflow-hidden rounded-2xl border bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
        {status === "playing" || status === "done" ? (
          <RubiksScene
            key={`${game.id}:${game.scrambleSeed}`}
            puzzle={game.puzzle}
            seed={game.scrambleSeed}
            interactive={status === "playing"}
            onUserMove={() => setMoves((m) => m + 1)}
            onSolved={() => void handleSolved()}
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center"><Skeleton className="h-full w-full" /></div>
        )}
        {status === "done" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Card className="mx-4 w-full max-w-sm text-center">
              <CardHeader><CardTitle className="text-2xl">Solved! 🎉</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-center gap-6 text-sm">
                  <span><Clock className="mr-1 inline h-4 w-4" />{fmtTime(elapsed)}</span>
                  <span><Zap className="mr-1 inline h-4 w-4" />{moves} moves</span>
                </div>
                {result && (
                  <div className="space-y-1 rounded-lg bg-muted p-3 text-sm">
                    <p className="font-bold text-primary">+{result.points} pts{result.isPersonalBest ? " · Personal best!" : ""}</p>
                    <p className="flex items-center justify-center gap-1 text-muted-foreground"><Gem className="h-3.5 w-3.5 text-cyan-500" />+{result.gemsEarned} gems · +{result.xpEarned} XP</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setLocation("/rubiks")}>Back</Button>
                  <Button className="flex-1" onClick={() => { setGame(null); setStatus("select"); setLocation("/rubiks"); }}>Play again</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">Drag on a face to twist it · use the arrows to rotate the view · tap a face for a quick turn · pinch or scroll to zoom</p>
    </div>
  );
}
