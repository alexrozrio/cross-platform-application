import io

p = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/profile.tsx"
s = io.open(p, encoding="utf-8").read()
orig = s
NL = chr(10)

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, "NOT FOUND: " + repr(old[:90]) + " count=" + str(s.count(old))
    s = s.replace(old, new, count)

# 1. Imports
rep(
  'import { SLIDE_PUZZLE_LEVELS } from "@/lib/slide-puzzle";',
  'import { SLIDE_PUZZLE_LEVELS } from "@/lib/slide-puzzle";' + NL +
  'import { GAME_2048_LEVELS } from "@/lib/game-2048";' + NL +
  'import { getGame2048History, summarizeGame2048Stats, GAME_2048_STATS_UPDATED } from "@/lib/game-2048-stats";'
)

# 2. GameTab union (leaderboard GameTab is separate file; this is profile's)
rep(
  'type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "odd-images" | "rubiks" | QuizGameId;',
  'type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | QuizGameId;'
)

# 3. Stats panels — insert before SlidePuzzleDailyCalendar
rep(
  'function SlidePuzzleDailyCalendar({ profileId }: { profileId: number }) {',
  '''function Game2048StatsPanel({ profileId }: { profileId: number | null }) {
  const [history, setHistory] = useState(() => getGame2048History(profileId));
  useEffect(() => {
    const refresh = (event?: Event) => {
      const changedProfileId = (event as CustomEvent<number | null> | undefined)?.detail;
      if (changedProfileId === undefined || changedProfileId === (profileId ?? null)) setHistory(getGame2048History(profileId));
    };
    window.addEventListener(GAME_2048_STATS_UPDATED, refresh);
    return () => window.removeEventListener(GAME_2048_STATS_UPDATED, refresh);
  }, [profileId]);

  const stats = summarizeGame2048Stats(history);
  const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {profileId && <Game2048DailyCalendar profileId={profileId} />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-orange-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-orange-100 p-2.5 text-orange-700"><Grid3x3 className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Runs finished</p><p className="text-2xl font-bold">{stats.totalGames}</p></CardContent></Card>
        <Card className="border-orange-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-amber-100 p-2.5 text-amber-700"><Trophy className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Targets reached</p><p className="text-2xl font-bold">{stats.wins}</p></CardContent></Card>
        <Card className="border-orange-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-orange-100 p-2.5 text-orange-700"><TrendingUp className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Best score</p><p className="text-2xl font-bold">{stats.bestScore.toLocaleString()}</p></CardContent></Card>
        <Card className="border-orange-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-blue-100 p-2.5 text-blue-700"><Clock className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Average time</p><p className="text-2xl font-bold">{stats.totalGames ? format(stats.history.reduce((sum, g) => sum + g.elapsedSeconds, 0) / stats.totalGames) : "—"}</p></CardContent></Card>
        <Card className="border-orange-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-orange-100 p-2.5 text-orange-700"><Flame className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Current day streak</p><p className="text-2xl font-bold">{stats.currentStreak}</p></CardContent></Card>
        <Card className="border-orange-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-amber-100 p-2.5 text-amber-700"><Trophy className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Best day streak</p><p className="text-2xl font-bold">{stats.bestStreak}</p></CardContent></Card>
      </div>

      <Card className="overflow-hidden border-orange-200/60 dark:border-orange-800/40">
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-orange-600" />Best tile by board</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(GAME_2048_LEVELS) as (keyof typeof GAME_2048_LEVELS)[]).map((difficulty) => <div key={difficulty} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5"><span className="font-medium">{GAME_2048_LEVELS[difficulty].label} · {GAME_2048_LEVELS[difficulty].size}×{GAME_2048_LEVELS[difficulty].size}</span><span className="font-mono font-bold text-orange-700 dark:text-orange-300">{stats.bestTiles[difficulty] ?? "—"}</span></div>)}
        </CardContent>
      </Card>
    </div>
  );
}

function Game2048DailyCalendar({ profileId }: { profileId: number }) {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const [viewYear, setViewYear] = useState(utcYear);
  const [viewMonth, setViewMonth] = useState(utcMonth);
  const month = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const { data } = useQuery({
    queryKey: [`/api/game-2048-daily-challenge/history/${profileId}`, month],
    queryFn: () => customFetch<{ month: string; completedDates: string[] }>(`/api/game-2048-daily-challenge/history/${profileId}?month=${month}`),
    enabled: Boolean(profileId),
  });
  const completed = new Set(data?.completedDates ?? []);
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const startWeekday = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const today = now.toISOString().slice(0, 10);
  const previous = () => viewMonth === 0 ? (setViewYear((year) => year - 1), setViewMonth(11)) : setViewMonth((monthIndex) => monthIndex - 1);
  const next = () => viewMonth === 11 ? (setViewYear((year) => year + 1), setViewMonth(0)) : setViewMonth((monthIndex) => monthIndex + 1);
  const prevDisabled = viewYear < utcYear - 1 || (viewYear === utcYear - 1 && viewMonth <= utcMonth);
  const nextDisabled = viewYear === utcYear && viewMonth >= utcMonth;
  return <Card className="border-orange-200/60 shadow-sm dark:border-orange-800/40">
    <CardHeader className="pb-2"><div className="flex items-center justify-between gap-2"><CardTitle className="flex items-center gap-2 text-base"><Grid3x3 className="h-4 w-4 text-orange-600" /> Daily 2048</CardTitle><Link href="/game-2048-challenge" className="whitespace-nowrap text-xs text-orange-600 underline underline-offset-2">Play today →</Link></div></CardHeader>
    <CardContent className="space-y-3"><div className="flex items-center justify-between"><button onClick={previous} disabled={prevDisabled} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><p className="text-sm font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</p><button onClick={next} disabled={nextDisabled} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div>
      <div className="grid grid-cols-7 gap-1">{WEEKDAYS.map((day) => <div key={day} className="py-1 text-center text-[10px] font-semibold text-muted-foreground">{day}</div>)}{Array.from({ length: startWeekday }, (_, index) => <div key={`empty-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => { const day = index + 1; const date = `${month}-${String(day).padStart(2, "0")}`; const done = completed.has(date); const isToday = date === today; const future = date > today; return <div key={day} title={done ? `Completed ${date}` : undefined} className={`aspect-square flex items-center justify-center rounded-full text-xs font-semibold ${done ? "bg-orange-500 text-white" : isToday ? "ring-2 ring-orange-400" : future ? "text-muted-foreground/40" : "text-muted-foreground"}`}>{done ? "🔢" : day}</div>; })}</div>
      <p className="text-center text-[11px] text-muted-foreground">{completed.size} day{completed.size !== 1 ? "s" : ""} completed this month</p>
    </CardContent>
  </Card>;
}

function SlidePuzzleDailyCalendar({ profileId }: { profileId: number }) {'''
)

# 4. tabParam whitelist
rep(
  'tabParam === "minesweeper" || tabParam === "slide-puzzle" || tabParam === "odd-images"',
  'tabParam === "minesweeper" || tabParam === "slide-puzzle" || tabParam === "game-2048" || tabParam === "odd-images"'
)

# 5. tabParam else-if chain
rep(
  '    else if (tabParam === "slide-puzzle") setGameTab("slide-puzzle");',
  '    else if (tabParam === "slide-puzzle") setGameTab("slide-puzzle");' + NL + '    else if (tabParam === "game-2048") setGameTab("game-2048");'
)

# 6. Tab select entry
rep(
  '                  ["slide-puzzle", "Slide Puzzle"],' + NL + '                  ["odd-images", "Odd Images"],',
  '                  ["slide-puzzle", "Slide Puzzle"],' + NL + '                  ["game-2048", "2048"],' + NL + '                  ["odd-images", "Odd Images"],'
)

# 7. Panel render
rep(
  '''          {!statsLoading && gameTab === "slide-puzzle" && (
            <SlidePuzzleStatsPanel profileId={profileId} />
          )}''',
  '''          {!statsLoading && gameTab === "slide-puzzle" && (
            <SlidePuzzleStatsPanel profileId={profileId} />
          )}
          {!statsLoading && gameTab === "game-2048" && (
            <Game2048StatsPanel profileId={profileId} />
          )}'''
)

assert s != orig
io.open(p, "w", encoding="utf-8").write(s)
print("profile.tsx patched OK")
