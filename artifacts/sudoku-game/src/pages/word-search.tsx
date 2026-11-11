import React from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, BookOpen, Clock3, Keyboard, Lightbulb, RotateCcw, Scroll, Search, Share2, Trophy, Volume2, VolumeX } from "lucide-react";
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
import { createWordSearch, getLineCells, isWordSearchTheme, WORD_SEARCH_LEVELS, WORD_SEARCH_THEMES, wordSearchThemeForIconSet, type WordSearchDifficulty, type WordSearchPuzzle, type WordSearchTheme } from "@/lib/word-search";
import { recordWordSearchCompletion } from "@/lib/word-search-stats";
import { Button } from "@/components/ui/button";

const SAVE_KEY = "brain-games-word-search-session";
const MAX_TIPS = 2;
const DIFFICULTIES: { id: WordSearchDifficulty; detail: string }[] = [
  { id: "beginner", detail: "6 × 6 · 6 words" },
  { id: "easy", detail: "8 × 8 · 8 words" },
  { id: "medium", detail: "12 × 12 · 10 words" },
  { id: "hard", detail: "14 × 14 · 12 words" },
];
const WORD_COLORS = [
  "bg-rose-200 text-rose-950 dark:bg-rose-500/45 dark:text-rose-50",
  "bg-orange-200 text-orange-950 dark:bg-orange-500/45 dark:text-orange-50",
  "bg-amber-200 text-amber-950 dark:bg-amber-500/45 dark:text-amber-50",
  "bg-lime-200 text-lime-950 dark:bg-lime-500/45 dark:text-lime-50",
  "bg-green-200 text-green-950 dark:bg-green-500/45 dark:text-green-50",
  "bg-emerald-200 text-emerald-950 dark:bg-emerald-500/45 dark:text-emerald-50",
  "bg-teal-200 text-teal-950 dark:bg-teal-500/45 dark:text-teal-50",
  "bg-cyan-200 text-cyan-950 dark:bg-cyan-500/45 dark:text-cyan-50",
  "bg-sky-200 text-sky-950 dark:bg-sky-500/45 dark:text-sky-50",
  "bg-blue-200 text-blue-950 dark:bg-blue-500/45 dark:text-blue-50",
  "bg-indigo-200 text-indigo-950 dark:bg-indigo-500/45 dark:text-indigo-50",
  "bg-violet-200 text-violet-950 dark:bg-violet-500/45 dark:text-violet-50",
];
type SavedGame = { difficulty: WordSearchDifficulty; theme: WordSearchTheme; puzzle: WordSearchPuzzle; found: string[]; elapsed: number; savedAt: number; tries: number; tipsUsed: number; gameId?: number; dailyDate?: string; seed?: number; challengeId?: number };
type WordSearchReward = { points: number; xpEarned: number; gemsEarned: number; isPersonalBest?: boolean; offline?: boolean };
type WordSearchChallengeResult = { id: number; status: string; challengerId: number; challengedId: number; winnerId: number | null; challengerUsername: string; challengedUsername: string; challengerPoints: number | null; challengedPoints: number | null; challengerElapsedSeconds: number | null; challengedElapsedSeconds: number | null };

function loadSaved(): SavedGame | null {
  try {
    const value = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as SavedGame | null;
    if (value && ["beginner", "easy", "medium", "hard"].includes(value.difficulty) && value.puzzle?.grid?.length) {
      if (!WORD_SEARCH_THEMES.some((theme) => theme.id === value.theme)) value.theme = "animals";
      value.tries = Number.isFinite(value.tries) ? value.tries : 0;
      value.tipsUsed = Number.isFinite(value.tipsUsed) ? Math.min(MAX_TIPS, value.tipsUsed) : 0;
      return value;
    }
  } catch { /* Ignore an unavailable or invalid save. */ }
  return null;
}

export default function WordSearchPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const query = new URLSearchParams(search);
  const { profileId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useGetProfile(profileId as number);
  const queryClient = useQueryClient();
  const { themeId: iconSetId } = useImageTheme();
  const sounds = useSound(profile?.soundEnabled);
  const gameMode = profile?.gameMode ?? "4all";
  const availableDifficulties = DIFFICULTIES.filter(({ id }) =>
    gameMode === "children" ? WORD_SEARCH_LEVELS[id].mode === "baby" :
      gameMode === "adult" ? WORD_SEARCH_LEVELS[id].mode === "adult" : true,
  );
  const [game, setGame] = React.useState<SavedGame | null>(null);
  const [selectedTheme, setSelectedTheme] = React.useState<WordSearchTheme>(() => wordSearchThemeForIconSet(iconSetId) ?? "animals");
  const [selected, setSelected] = React.useState<number[]>([]);
  const [dragStart, setDragStart] = React.useState<number | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [hintWord, setHintWord] = React.useState<string | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [hasSavedGame, setHasSavedGame] = React.useState(false);
  const [reward, setReward] = React.useState<WordSearchReward | null>(null);
  const [rewardLoading, setRewardLoading] = React.useState(false);
  const [rewardError, setRewardError] = React.useState<string | null>(null);
  const [challengeResult, setChallengeResult] = React.useState<WordSearchChallengeResult | null>(null);
  const [infoModal, setInfoModal] = React.useState<"rules" | "controls" | "backstory" | null>(null);
  const activeGameRef = React.useRef(game);
  activeGameRef.current = game;
  const pendingGameRef = React.useRef<{ savedAt: number; promise: Promise<number | null> } | null>(null);
  const userSelectedThemeRef = React.useRef(false);
  const directStartHandledRef = React.useRef(false);
  const dragCellRef = React.useRef<number | null>(null);
  const finishSelectionRef = React.useRef<(end: number) => void>(() => {});
  const gridSizeRef = React.useRef(10);

  usePageMeta({
    title: "Word Search Game | Play Brain Games",
    description: "Find theme-based hidden words in four levels from Beginner to Hard. Play free Word Search puzzles.",
    path: "/word-search",
  });

  React.useEffect(() => {
    const saved = loadSaved();
    setHasSavedGame(Boolean(saved));
    if (query.get("resume") === "1" && saved) {
      setGame(saved); setSelectedTheme(saved.theme); setElapsed(saved.elapsed);
    }
    // The mount reads the browser's local save once; location state is encoded in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (game || userSelectedThemeRef.current) return;
    setSelectedTheme(wordSearchThemeForIconSet(iconSetId) ?? "animals");
  }, [iconSetId, game]);

  React.useEffect(() => {
    if (!game || game.found.length === game.puzzle.words.length) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [game]);

  React.useEffect(() => {
    if (game && game.found.length < game.puzzle.words.length) {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...game, elapsed })); setHasSavedGame(true); } catch { /* Storage is optional. */ }
    }
  }, [game, elapsed]);

  const startGame = (level: WordSearchDifficulty, theme: WordSearchTheme = selectedTheme, dailyDate?: string, seed?: number, existingGameId?: number, challengeId?: number) => {
    sounds.click();
    const savedAt = Date.now();
    const nextGame: SavedGame = { difficulty: level, theme, puzzle: createWordSearch(level, theme, seed), found: [], elapsed: 0, savedAt, tries: 0, tipsUsed: 0, dailyDate, seed, challengeId, ...(existingGameId ? { gameId: existingGameId } : {}) };
    setSelectedTheme(theme); setGame(nextGame); setReward(null); setRewardError(null); setRewardLoading(false);
    setElapsed(0); setSelected([]); setHintWord(null); setLocation(dailyDate ? `/word-search?play=1&dailyDate=${dailyDate}&difficulty=${level}&theme=${encodeURIComponent(theme)}&seed=${seed ?? Number(dailyDate.replaceAll("-", ""))}` : challengeId ? `/word-search?play=1&challengeId=${challengeId}&gameId=${existingGameId}&difficulty=${level}&theme=${encodeURIComponent(theme)}&seed=${seed}` : "/word-search?play=1");
    if (existingGameId) {
      pendingGameRef.current = { savedAt, promise: Promise.resolve(existingGameId) };
      return;
    }
    const promise = (async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const { id } = await customFetch<{ id: number }>("/api/word-search-games", {
          method: "POST",
          body: JSON.stringify({ profileId: profileId ?? null, difficulty: level, theme, ...(dailyDate ? { dailyDate } : {}) }),
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
    const requestedDifficulty = query.get("difficulty") as WordSearchDifficulty | null;
    const level = availableDifficulties.find(({ id }) => id === requestedDifficulty)?.id ?? availableDifficulties[0]?.id;
    if (!level) return;
    const requestedTheme = query.get("theme");
    const theme = requestedTheme && isWordSearchTheme(requestedTheme)
      ? requestedTheme
      : wordSearchThemeForIconSet(iconSetId) ?? "animals";
    const dailyDate = query.get("dailyDate");
    const seedValue = Number(query.get("seed"));
    const existingGameId = Number(query.get("gameId"));
    const challengeId = Number(query.get("challengeId"));
    startGame(level, theme, dailyDate && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate) ? dailyDate : undefined, Number.isInteger(seedValue) && seedValue > 0 ? seedValue : undefined,
      Number.isInteger(existingGameId) && existingGameId > 0 ? existingGameId : undefined,
      Number.isInteger(challengeId) && challengeId > 0 ? challengeId : undefined);
  }, [profileLoading, profile?.gameMode, search, iconSetId]);

  const completeGame = async (completed: SavedGame, finalElapsed: number) => {
    setRewardLoading(true);
    setRewardError(null);
    try {
      const pending = pendingGameRef.current;
      let gameId = completed.gameId ?? (pending?.savedAt === completed.savedAt ? await pending.promise : null);
      // Like Memory Match, recover if the game-create request failed or the
      // player finished before it returned. This lets a completed game still
      // use the server's normal points, XP, and gems calculation.
      if (!gameId && profileId && navigator.onLine !== false) {
        const createController = new AbortController();
        const createTimeout = window.setTimeout(() => createController.abort(), 5000);
        try {
          const created = await customFetch<{ id: number }>("/api/word-search-games", {
            method: "POST",
            body: JSON.stringify({
              profileId,
              difficulty: completed.difficulty,
              theme: completed.theme,
              ...(completed.dailyDate ? { dailyDate: completed.dailyDate } : {}),
            }),
            signal: createController.signal,
          });
          gameId = created.id;
        } finally {
          window.clearTimeout(createTimeout);
        }
      }
      if (!gameId) throw new Error("Game could not be saved");
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      let result: WordSearchReward;
      try {
        result = await customFetch<WordSearchReward>(`/api/word-search-games/${gameId}/complete`, {
          method: "POST",
          body: JSON.stringify({ elapsedSeconds: finalElapsed, tries: completed.tries, tipsUsed: completed.tipsUsed }),
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
        queryClient.invalidateQueries({ queryKey: [`/api/word-search-daily-challenge/status/${profileId}`] });
        queryClient.invalidateQueries({ queryKey: ["word-search-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments/leaderboard"] });
        window.dispatchEvent(new CustomEvent(ACHIEVEMENT_COMPLETION_EVENT, { detail: { profileId } }));
      }
    } catch (error) {
      console.error("[Word Search] Could not save completion rewards:", error);
      if (activeGameRef.current?.savedAt === completed.savedAt) {
        setReward({ points: 0, xpEarned: 0, gemsEarned: 0, offline: true });
        setRewardError(error instanceof Error ? error.message : "Unknown API error");
      }
    } finally {
      if (activeGameRef.current?.savedAt === completed.savedAt) setRewardLoading(false);
    }
  };

  const finishSelection = React.useCallback((end: number) => {
    if (dragStart === null || !game) return;
    const tries = game.tries + 1;
    const line = getLineCells(dragStart, end, game.puzzle.grid.length);
    const word = line.map((index) => game.puzzle.grid[Math.floor(index / game.puzzle.grid.length)][index % game.puzzle.grid.length]).join("");
    const reverse = [...word].reverse().join("");
    const babyLevel = WORD_SEARCH_LEVELS[game.difficulty].mode === "baby";
    const foundWord = game.puzzle.words.find((item) => {
      if (game.found.includes(item)) return false;
      if (!babyLevel) return item === word || item === reverse;
      const placement = game.puzzle.placements[item];
      return item === word && placement?.length === line.length && placement.every((cell, index) => cell === line[index]);
    });
    if (foundWord) {
      const next = { ...game, tries, found: [...game.found, foundWord] };
      setGame(next); setSelected(game.puzzle.placements[foundWord]); setHintWord(null); sounds.complete();
      if (next.found.length === next.puzzle.words.length) {
        setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3200);
        recordWordSearchCompletion(profileId, next.difficulty, elapsed, next.theme);
        localStorage.removeItem(SAVE_KEY);
        setHasSavedGame(false);
        void completeGame(next, elapsed);
      }
    } else {
      setGame({ ...game, tries }); setSelected(line); sounds.error(); window.setTimeout(() => setSelected([]), 260);
    }
    setDragStart(null);
  }, [dragStart, game, sounds, profileId, elapsed, completeGame]);

  const finished = Boolean(game && game.found.length === game.puzzle.words.length);
  const size = game?.puzzle.grid.length ?? 10;
  gridSizeRef.current = size;
  finishSelectionRef.current = finishSelection;

  // Track the drag on window (not React synthetic events): touch pointers get
  // implicit pointer capture on the first cell, so per-element move/up handlers
  // never see the finger leaving that cell. Listeners mount once and read the
  // latest values through refs so they can never go stale; elementFromPoint
  // hit-tests the real cell under the pointer regardless of capture.
  React.useEffect(() => {
    const cellAt = (event: PointerEvent) =>
      document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-cell]");
    const onMove = (event: PointerEvent) => {
      const start = dragCellRef.current;
      if (start === null) return;
      const cell = cellAt(event);
      if (cell) setSelected(getLineCells(start, Number(cell.dataset.cell), gridSizeRef.current));
    };
    const onUp = (event: PointerEvent) => {
      const start = dragCellRef.current;
      if (start === null) return;
      dragCellRef.current = null;
      const cell = cellAt(event);
      if (cell) finishSelectionRef.current(Number(cell.dataset.cell));
      else setSelected([]);
      setDragStart(null);
    };
    const onCancel = () => { dragCellRef.current = null; setDragStart(null); setSelected([]); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, []);

  React.useEffect(() => {
    const onUp = () => { setDragStart((start) => { if (start !== null) setSelected([]); return null; }); };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  const issueHint = () => {
    if (!game || game.tipsUsed >= MAX_TIPS) return;
    const next = game.puzzle.words.find((word) => !game.found.includes(word));
    if (next) { setGame({ ...game, tipsUsed: game.tipsUsed + 1 }); setHintWord(next); setSelected(game.puzzle.placements[next]); sounds.click(); }
  };
  const shareCardFallback = async (lines: string[]) => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Sharing didn't complete. Text copied — paste it into your message.", { duration: 3500 });
    } catch {
      // user cancelled or clipboard blocked — silent
    }
  };
  const share = async () => {
    const url = appShareUrlForPath("/word-search");
    const lines = [
      "🔎 Can you find all the hidden words?",
      "🧠 Play Brain Games . Online",
      `🔗 ${url}`,
    ];
    try {
      const result = await shareOrDownloadShareCard({
        title: "Word Search",
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: "#8b5cf6",
        filename: "word-search-invite.png",
      });
      if (result === "downloaded") toast.success("Share image downloaded — attach it to your message!", { duration: 3000 });
    } catch {
      await shareCardFallback(lines);
    }
  };
  const shareResult = async () => {
    if (!game) return;
    const url = appShareUrlForPath("/word-search");
    const themeLabel = WORD_SEARCH_THEMES.find((theme) => theme.id === game.theme)?.label.toLowerCase() ?? "themed";
    const rank = profile ? getLevelFromXp(profile.xp ?? 0).name : null;
    const rewardLine = reward && !reward.offline
      ? `+${reward.points.toLocaleString()} pts · +${reward.xpEarned} XP · +${reward.gemsEarned} 💎`
      : null;
    const lines = [
      `🎉 Found all ${game.puzzle.words.length} ${themeLabel} words in ${fmt(elapsed)}!`,
      `📐 ${WORD_SEARCH_LEVELS[game.difficulty].label} · ${game.tries} tries · ${game.tipsUsed} tips`,
      rewardLine,
      rank ? `🏅 ${rank} · Play Brain Games . Online` : "🧠 Play Brain Games . Online",
      `🔗 ${url}`,
    ].filter((line): line is string => Boolean(line));
    try {
      const result = await shareOrDownloadShareCard({
        title: "Word Search complete",
        lines,
        shareText: lines.join("\n"),
        shareUrl: url,
        accent: "#8b5cf6",
        filename: "word-search-result.png",
      });
      if (result === "downloaded") toast.success("Result image downloaded — attach it to your message!", { duration: 3000 });
    } catch {
      await shareCardFallback(lines);
    }
  };
  const fmt = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  React.useEffect(() => {
    if (!finished || !game?.challengeId) { setChallengeResult(null); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const detail = await customFetch<WordSearchChallengeResult>(`/api/word-search-challenges/${game.challengeId}`);
        if (cancelled) return;
        setChallengeResult(detail);
        if (detail.status !== "completed") timer = setTimeout(refresh, 5000);
      } catch { if (!cancelled) timer = setTimeout(refresh, 5000); }
    };
    void refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [finished, game?.challengeId]);

  if (game && finished) {
    const theme = WORD_SEARCH_THEMES.find((item) => item.id === game.theme)!;
    return <main className="mx-auto w-full max-w-lg space-y-4 px-3 py-5 sm:px-6 sm:py-8">
      {showConfetti && <Confetti />}
      <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-5 text-center text-white shadow-xl shadow-violet-500/20 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full border border-white/15" />
        <div className="relative z-10 space-y-2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/20 text-3xl">🎉</div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75">{game.dailyDate ? "Daily Word Search complete" : "Word Search complete"}</p>
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">You found every word!</h1>
          <p className="text-sm text-white/85">{theme.emoji} {theme.label} · {WORD_SEARCH_LEVELS[game.difficulty].label} · {game.puzzle.words.length} words · {game.tries} tries · {game.tipsUsed} tips</p>
          {game.dailyDate && <p className="text-sm font-semibold text-white/90">📅 Today&apos;s shared daily puzzle</p>}
          {reward?.isPersonalBest && <p className="pt-1 text-sm font-bold text-amber-100">🏆 New personal best!</p>}
          {game.challengeId && <p className="pt-1 text-sm font-bold text-white">⚔️ Challenge score submitted</p>}
          <Button variant="secondary" className="mt-2 gap-2" onClick={() => void shareResult()}><Share2 className="h-4 w-4"/> Share your result</Button>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        {game.challengeId ? <Button className="w-full gap-2" onClick={() => setLocation("/challenges?tab=word-search")}><Trophy className="h-4 w-4"/> Return to Word Search challenge</Button> : <Button className="w-full gap-2" onClick={() => startGame(game.difficulty, game.theme, game.dailyDate, game.seed)}><RotateCcw className="h-4 w-4"/> Play again · {WORD_SEARCH_LEVELS[game.difficulty].label}</Button>}
        <div className="space-y-4 rounded-xl border border-border bg-background p-3 sm:p-4">
          <div>
            <h2 className="text-center text-sm font-bold">Choose your next Word Search</h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">Changing the theme starts a new game at this level.</p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Theme</span>
            <select value={game.theme} onChange={(event) => startGame(game.difficulty, event.target.value as WordSearchTheme)} className="w-full rounded-lg border border-violet-200 bg-background px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-violet-400 dark:border-violet-800">
              {WORD_SEARCH_THEMES.map((option) => <option key={option.id} value={option.id}>{option.emoji} {option.label}</option>)}
            </select>
          </label>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Difficulty</legend>
            <div className="grid grid-cols-2 gap-2">
              {availableDifficulties.map(({ id, detail }) => {
                const level = WORD_SEARCH_LEVELS[id];
                const active = id === game.difficulty;
                return <button key={id} type="button" onClick={() => startGame(id, game.theme)} aria-pressed={active} className={`min-h-16 rounded-xl border-2 px-3 py-2 text-left transition ${active ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30" : "border-border hover:border-violet-300 hover:bg-violet-50/60 dark:hover:bg-violet-950/20"}`}>
                  <span className="block text-sm font-bold">{level.label}{active ? " · Current" : ""}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
                </button>;
              })}
            </div>
          </fieldset>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="ghost" className="gap-2" onClick={() => setLocation("/profile?tab=word-search")}><Trophy className="h-4 w-4"/> My stats</Button>
          <Button variant="ghost" className="gap-2" onClick={() => setLocation("/")}><ArrowLeft className="h-4 w-4"/> Home</Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-center text-sm font-bold">Words you found</h2>
        <div className="flex flex-wrap justify-center gap-2">{game.puzzle.words.map((word) => <span key={word} className={`rounded-full px-3 py-1.5 text-xs font-bold ${WORD_COLORS[game.puzzle.words.indexOf(word) % WORD_COLORS.length]}`}>✓ {word}</span>)}</div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Clock3, label: "Time", value: fmt(elapsed) },
          { icon: Search, label: "Level", value: WORD_SEARCH_LEVELS[game.difficulty].label },
          { icon: Search, label: "Tries", value: String(game.tries) },
          { icon: Lightbulb, label: "Tips used", value: String(game.tipsUsed) },
        ].map(({ icon: Icon, label, value }) => <div key={label} className="space-y-1 rounded-xl border bg-card p-3 text-center sm:p-4"><Icon className="mx-auto h-4 w-4 text-violet-600"/><p className="text-base font-black tabular-nums sm:text-lg">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>)}
      </div>

      <section className="rounded-2xl border-2 border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30">
        {rewardLoading ? <div className="py-2 text-center text-sm font-semibold text-muted-foreground">Calculating your score and rewards…</div> : reward?.offline ? <div className="py-2 text-center"><p className="font-semibold text-amber-900 dark:text-amber-200">Rewards could not be saved</p><p className="mt-1 text-xs text-muted-foreground">{rewardError || "The game server could not save this result."} If the API reports 404, deploy the latest API server and try another game.</p></div> : reward ? <><div className="grid grid-cols-3 items-center gap-2 text-center">
          <div><p className="text-2xl font-black text-amber-800 dark:text-amber-200">{reward.points.toLocaleString()}</p><p className="text-xs font-semibold text-muted-foreground">Points</p></div>
          <div className="border-x border-amber-300/70 px-2 dark:border-amber-700/60"><p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">+{reward.xpEarned}</p><p className="text-xs font-semibold text-muted-foreground">XP</p></div>
          <div><p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">+{reward.gemsEarned} 💎</p><p className="text-xs font-semibold text-muted-foreground">Gems</p></div>
        </div><p className="col-span-3 mt-2 text-[11px] text-muted-foreground">Score reflects level, completion time, tries, and hints used.</p></> : <div className="py-2 text-center text-sm text-muted-foreground">Your rewards are being prepared.</div>}
      </section>

      {game.challengeId && <section className="rounded-xl border border-violet-200 bg-card p-4 text-center dark:border-violet-800" aria-live="polite">
        <h2 className="font-bold">Challenge result</h2>
        {!challengeResult || challengeResult.status !== "completed" ? <p className="mt-1 text-sm text-muted-foreground">You completed in {fmt(elapsed)} and earned {reward?.points?.toLocaleString() ?? "…"} points. Waiting for your opponent to finish…</p> : (() => {
          const mine = challengeResult.challengerId === profileId ? challengeResult.challengerPoints : challengeResult.challengedPoints;
          const theirs = challengeResult.challengerId === profileId ? challengeResult.challengedPoints : challengeResult.challengerPoints;
          const opponent = challengeResult.challengerId === profileId ? challengeResult.challengedUsername : challengeResult.challengerUsername;
          const outcome = challengeResult.winnerId === null ? "It’s a tie!" : challengeResult.winnerId === profileId ? "You won the challenge!" : "You lost the challenge.";
          return <><p className="mt-1 text-lg font-black">{outcome}</p><p className="mt-1 text-sm text-muted-foreground">You: {mine ?? 0} points · {opponent}: {theirs ?? 0} points</p><p className="mt-1 text-xs text-muted-foreground">Completed in {fmt(elapsed)} · {challengeResult.winnerId === null ? "Both players earned 2 bonus gems." : challengeResult.winnerId === profileId ? "You earned 10 bonus gems." : `${opponent} earned 10 bonus gems.`}</p></>;
        })()}
      </section>}




    </main>;
  }

  return <main className={`mx-auto w-full px-3 py-5 sm:px-6 sm:py-8 ${game ? "max-w-5xl" : "max-w-lg"}`}>
    {showConfetti && <Confetti />}
    <div className="relative isolate mb-4 flex items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-100 px-4 py-3 shadow-lg shadow-violet-500/10 dark:border-violet-800/60 dark:from-violet-950/60 dark:via-card dark:to-fuchsia-950/60">
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-fuchsia-300/30 blur-2xl dark:bg-fuchsia-400/15" />
      <Button variant="ghost" size="sm" className="relative z-10 shrink-0 px-1" onClick={() => setLocation("/")}><ArrowLeft className="mr-1 h-4 w-4"/> Home</Button>
      <div className="relative z-10 min-w-0 text-right">
        <h1 className="font-serif text-xl font-bold leading-tight tracking-tight sm:text-3xl">Word Search</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{profile?.username ? `Welcome back, ${profile.username}` : "Find every hidden word"}</p>
      </div>
      <Button variant="ghost" size="icon" className="relative z-10 shrink-0" aria-label={sounds.enabled ? "Mute sounds" : "Enable sounds"} onClick={sounds.toggle}>{sounds.enabled ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}</Button>
    </div>
    <div className={`grid gap-5 ${game ? "lg:grid-cols-[minmax(0,1fr)_280px]" : "grid-cols-1"}`}>
      <section className="min-w-0 space-y-4">
        {!game ? <>
          {hasSavedGame && <button onClick={() => setLocation("/word-search?resume=1")} className="flex w-full items-center gap-3 rounded-xl border-2 border-violet-300/60 bg-card px-4 py-3 text-left transition hover:bg-violet-50 dark:border-violet-800/50 dark:hover:bg-violet-950/30"><RotateCcw className="h-4 w-4 shrink-0 text-violet-600"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-violet-700 dark:text-violet-300">Resume Word Search</span><span className="block text-xs text-muted-foreground">Pick up where you left off</span></span><span className="text-lg text-violet-600">→</span></button>}
          <div className="relative isolate overflow-hidden rounded-2xl border-2 border-violet-200/80 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50 p-4 shadow-xl shadow-violet-500/10 dark:border-violet-800/50 dark:from-card dark:via-violet-950/35 dark:to-fuchsia-950/40 sm:p-5">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-fuchsia-300/25 blur-2xl dark:bg-fuchsia-400/10" />
            <div className="relative z-10 mb-4 flex items-center gap-3 rounded-xl border border-violet-200/70 bg-white/65 px-3 py-3 dark:border-violet-800/50 dark:bg-slate-950/20">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-2xl">🔎</span>
              <div className="min-w-0 flex-1"><h2 className="font-serif text-lg font-bold">Ready for a word hunt?</h2><p className="text-xs leading-relaxed text-muted-foreground">Beginner and Easy use forward horizontal and vertical words. Medium and Hard add diagonals and backwards words.</p></div>
              <div className="hidden grid-cols-3 gap-1 rounded-lg border border-violet-200/70 bg-white/70 p-1 sm:grid dark:border-violet-800/50 dark:bg-slate-950/30">{["W", "O", "R", "D", "S", "E", "A", "R", "C"].map((letter, i) => <span key={i} className="grid h-5 w-5 place-items-center rounded bg-violet-500/10 text-[9px] font-black text-violet-700 dark:text-violet-300">{letter}</span>)}</div>
            </div>
            <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-200/70 bg-white/65 px-3 py-2.5 dark:border-violet-800/50 dark:bg-slate-950/20">
              <div><label htmlFor="word-search-home-theme" className="block text-xs font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">Word theme</label><p className="mt-0.5 text-[11px] text-muted-foreground">Each theme has its own word list</p></div>
              <select id="word-search-home-theme" value={selectedTheme} onChange={(event) => { userSelectedThemeRef.current = true; setSelectedTheme(event.target.value as WordSearchTheme); }} className="rounded-lg border border-violet-200 bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm outline-none focus:ring-2 focus:ring-violet-400 dark:border-violet-800">
                {WORD_SEARCH_THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.emoji} {theme.label}</option>)}
              </select>
            </div>
            <p className="relative z-10 mb-2.5 text-xs font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">Choose Difficulty</p>
            <div className="relative z-10 grid grid-cols-2 gap-2.5">
              {availableDifficulties.map((item) => {
                const meta = { beginner: "🧸", easy: "🌱", medium: "🧭", hard: "🔥" }[item.id];
                const level = WORD_SEARCH_LEVELS[item.id];
                return <button key={item.id} onClick={() => startGame(item.id)} className="group flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-violet-200/80 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-md active:scale-[0.98] dark:border-violet-800/60 dark:from-violet-950/45 dark:to-fuchsia-950/40">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/10 text-xl group-hover:bg-violet-500/20">{meta}</span>
                  <span className="text-sm font-bold leading-tight">{level.label}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{item.detail}</span>
                </button>;
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setLocation("/profile?tab=word-search")} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition hover:border-violet-300 hover:bg-muted/50"><Search className="h-5 w-5 shrink-0 text-violet-600"/><span><span className="block text-sm font-semibold">My Stats</span><span className="hidden text-xs text-muted-foreground sm:block">Best times & progress</span></span></button>
            <button onClick={share} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition hover:border-violet-300 hover:bg-muted/50"><Share2 className="h-5 w-5 shrink-0 text-violet-600"/><span><span className="block text-sm font-semibold">Share Game</span><span className="hidden text-xs text-muted-foreground sm:block">Invite someone to play</span></span></button>
          </div>
          {/* Info links */}
          <div className="home-info-links flex items-center justify-center gap-6 rounded-xl border border-border bg-card px-4 py-2.5">
            <button
              onClick={() => setInfoModal("rules")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <BookOpen className="h-3.5 w-3.5" /> Rules
            </button>
            <span className="text-border">·</span>
            <button
              onClick={() => setInfoModal("controls")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Keyboard className="h-3.5 w-3.5" /> Controls
            </button>
            <span className="text-border">·</span>
            <button
              onClick={() => setInfoModal("backstory")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Scroll className="h-3.5 w-3.5" /> Backstory
            </button>
          </div>

          <MobileContentDisclosure
            id="word-search-guidance"
            title="More Word Search guidance"
            className="rounded-2xl border border-violet-400/25 bg-card p-5 sm:p-6"
          >
            <section className="space-y-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  How to play and improve at Word Search
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Words are hidden inside a letter grid in straight lines —
                  across, down, and on some levels diagonally, including
                  backwards. Press on the first letter of a word and drag to
                  its last letter to reveal it.
                </p>
              </div>
              <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                <article>
                  <h3 className="font-semibold text-foreground">Pick a level that fits</h3>
                  <p className="mt-1">
                    Beginner (6×6, 6 words) and Easy (8×8, 8 words) hide words
                    only left-to-right and top-to-bottom. Medium (12×12) adds
                    diagonals, and Hard (14×14) also includes backwards words.
                  </p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Use the word list</h3>
                  <p className="mt-1">
                    The side panel lists every word you need to find. Cross off
                    words as you reveal them, and use a Hint (up to 2 per game)
                    if you get stuck on a tricky one.
                  </p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Choose a theme</h3>
                  <p className="mt-1">
                    Each theme has its own word list — animals, food, space, and
                    more — themed to match your icon set. Changing the theme
                    starts a fresh puzzle at the same level.
                  </p>
                </article>
                <article>
                  <h3 className="font-semibold text-foreground">Understand your score</h3>
                  <p className="mt-1">
                    Points reflect the level, your completion time, how many
                    tries it took, and hints used. Finishing earns XP and 💎
                    gems, and daily challenges give everyone the same puzzle.
                  </p>
                </article>
              </div>
            </section>
          </MobileContentDisclosure>

          {/* Rules modal */}
          <Dialog open={infoModal === "rules"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-violet-600" /> Rules
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>Word Search hides themed words inside a letter grid. Find them all to complete the puzzle.</p>
                <ul className="list-none space-y-2">
                  {[
                    "Choose a difficulty and a word theme, then start the puzzle.",
                    "Words run in straight lines: across, down, and on Medium/Hard also diagonally — Hard includes backwards words too.",
                    "Press on a word's first letter and drag to its last letter, then release to reveal it.",
                    "Found words are coloured in and crossed off the word list.",
                    "Finish when every word on the list has been found.",
                  ].map((rule, index) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-700 dark:text-violet-300">{index + 1}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-1">Points are based on the level, completion time, tries, and hints used. Finishing awards XP and 💎 gems.</p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Controls modal */}
          <Dialog open={infoModal === "controls"} onOpenChange={(open) => !open && setInfoModal(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-violet-600" /> Controls
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-2 font-semibold text-foreground">Mouse / Touch</p>
                  <div className="space-y-1.5 text-muted-foreground">
                    {[
                      ["Press on a letter", "Start selecting a line of cells"],
                      ["Drag across letters", "Extend the selection in a straight line"],
                      ["Release on the last letter", "Submit the selection"],
                      ["Hint button", "Highlight one unfound word (2 per game)"],
                      ["Theme selector", "Switch word list and start a new puzzle"],
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
                      ["Time", "Faster completion earns a bonus"],
                      ["Tries", "Fewer wrong selections = better score"],
                      ["Tips", "Each hint reduces the score"],
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
                <DialogTitle className="flex items-center gap-2">
                  <Scroll className="h-5 w-5 text-violet-600" /> Backstory
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Word search puzzles are a mid-20th-century invention. They are
                  commonly credited to Norman E. Gibat, who created them for a
                  puzzle book published in 1968, and they quickly became a
                  newspaper and magazine staple.
                </p>
                <p>
                  The appeal is simple: a grid of random letters hides a list of
                  themed words, and the solver scans for patterns — double
                  letters, uncommon combinations, and the shapes words make
                  across the grid.
                </p>
                <p>
                  This Word Search keeps that classic format and adds themed
                  word lists, four difficulty levels, daily challenges, and
                  head-to-head challenges against friends.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </> : <section className="rounded-3xl border border-border bg-card p-3 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold">{WORD_SEARCH_LEVELS[game.difficulty].label} puzzle</h2><div className="mt-1 flex flex-wrap items-center gap-2"><label htmlFor="word-search-game-theme" className="text-xs text-muted-foreground">Word theme</label><select id="word-search-game-theme" value={game.theme} onChange={(event) => startGame(game.difficulty, event.target.value as WordSearchTheme)} className="rounded-lg border border-violet-200 bg-background px-2 py-1 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-violet-400 dark:border-violet-800">{WORD_SEARCH_THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.emoji} {theme.label}</option>)}</select><span className="text-[10px] text-muted-foreground">Changing theme starts a new puzzle</span></div></div><div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm font-semibold"><Clock3 className="h-4 w-4"/>{fmt(elapsed)}</div></div>
          <div className="mx-auto w-full max-w-[560px] rounded-2xl bg-gradient-to-br from-rose-300 via-violet-300 to-cyan-300 p-1.5 shadow-lg shadow-violet-500/15 dark:from-rose-800 dark:via-violet-800 dark:to-cyan-800">
            <div
              className="select-none touch-none overflow-hidden rounded-xl border border-white/70 bg-white/70 dark:border-slate-700 dark:bg-slate-950/70"
              style={{ display: "grid", gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {game.puzzle.grid.flatMap((row, r) => row.map((letter, c) => {
                const index = r * size + c;
                const foundWord = game.found.find((word) => game.puzzle.placements[word]?.includes(index));
                const foundColor = foundWord ? WORD_COLORS[game.puzzle.words.indexOf(foundWord) % WORD_COLORS.length] : null;
                const isPicked = selected.includes(index);
                const baseClass = foundColor ?? (isPicked
                  ? hintWord
                    ? "bg-amber-300 text-amber-950 ring-2 ring-inset ring-amber-600 dark:bg-amber-400/80 dark:text-amber-950 dark:ring-amber-200"
                    : "bg-blue-500 text-white ring-2 ring-inset ring-blue-800 shadow-inner dark:bg-blue-400 dark:text-blue-950 dark:ring-blue-100"
                  : "bg-violet-50 text-slate-800 hover:bg-violet-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800");
                return <button key={index} data-cell={index} aria-label={`Row ${r + 1}, column ${c + 1}, ${letter}${foundWord ? `, part of ${foundWord}` : ""}`} onPointerDown={(e) => { e.preventDefault(); setHintWord(null); dragCellRef.current = index; setDragStart(index); setSelected([index]); sounds.click(); }} className={`aspect-square min-w-0 border-[0.5px] border-violet-200/70 text-[clamp(10px,2.4vw,18px)] font-bold transition-colors dark:border-violet-800/60 sm:text-lg ${baseClass}`}>{letter}</button>;
              }))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{game.found.length} of {game.puzzle.words.length} found · {game.tries} tries · {game.tipsUsed}/{MAX_TIPS} tips</span><div className="flex gap-2"><Button variant="outline" size="sm" onClick={issueHint} disabled={game.tipsUsed >= MAX_TIPS}><Lightbulb className="mr-1.5 h-4 w-4"/> Hint</Button><Button variant="outline" size="sm" onClick={share}><Share2 className="mr-1.5 h-4 w-4"/> Share</Button></div></div>
        </section>}
      </section>
      {game && <aside className="rounded-3xl border border-violet-200/70 bg-gradient-to-br from-card via-violet-50/50 to-fuchsia-50/60 p-4 shadow-sm dark:border-violet-800/50 dark:from-card dark:via-violet-950/15 dark:to-fuchsia-950/20"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Words to find</h2><span className="rounded-full bg-violet-500/10 px-2 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">{game.found.length}/{game.puzzle.words.length}</span></div>{hintWord && <p className="mb-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">Hint: look for <strong>{hintWord}</strong></p>}<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">{game.puzzle.words.map((word) => { const foundIndex = game.found.indexOf(word); const color = foundIndex >= 0 ? WORD_COLORS[game.puzzle.words.indexOf(word) % WORD_COLORS.length] : "border border-violet-100 bg-white/80 text-foreground dark:border-violet-900/60 dark:bg-slate-950/40"; return <div key={word} className={`rounded-xl px-3 py-2 text-sm font-semibold tracking-wide transition-colors ${color} ${foundIndex >= 0 ? "line-through" : ""}`}>{foundIndex >= 0 ? "✓ " : ""}{word}</div>; })}</div><Button variant="ghost" className="mt-4 w-full" onClick={() => { setGame(null); setSelected([]); setLocation("/word-search"); }}><RotateCcw className="mr-2 h-4 w-4"/> New puzzle</Button></aside>}
    </div>
  </main>;
}
