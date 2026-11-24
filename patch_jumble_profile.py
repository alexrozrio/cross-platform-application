import io

path = "src/pages/profile.tsx"
s = io.open(path, encoding="utf-8").read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, f"NOT FOUND: {old[:90]!r} (count={s.count(old)})"
    s = s.replace(old, new, count)

# 1. lucide import LetterText
rep('  Grid3x3,\n  Images,', '  Grid3x3,\n  Images,\n  LetterText,')

# 2. imports
rep('import { getGame2048History, summarizeGame2048Stats, GAME_2048_STATS_UPDATED } from "@/lib/game-2048-stats";',
    'import { getGame2048History, summarizeGame2048Stats, GAME_2048_STATS_UPDATED } from "@/lib/game-2048-stats";\nimport { JUMBLE_LEVELS } from "@/lib/jumble-words";\nimport { getJumbleHistory, summarizeJumbleStats, JUMBLE_STATS_UPDATED } from "@/lib/jumble-stats";')

# 3. GameTab union
rep('type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | QuizGameId;',
    'type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | QuizGameId;')

# 4. Stats panels after Game2048DailyCalendar (before SlidePuzzleDailyCalendar)
rep('''function SlidePuzzleDailyCalendar({ profileId }: { profileId: number }) {''',
    '''function JumbleStatsPanel({ profileId }: { profileId: number | null }) {
  const [history, setHistory] = useState(() => getJumbleHistory(profileId));
  useEffect(() => {
    const refresh = (event?: Event) => {
      const changedProfileId = (event as CustomEvent<number | null> | undefined)?.detail;
      if (changedProfileId === undefined || changedProfileId === (profileId ?? null)) setHistory(getJumbleHistory(profileId));
    };
    window.addEventListener(JUMBLE_STATS_UPDATED, refresh);
    return () => window.removeEventListener(JUMBLE_STATS_UPDATED, refresh);
  }, [profileId]);

  const stats = summarizeJumbleStats(history);
  const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const avgAccuracy = stats.totalGames ? Math.round(history.reduce((sum, g) => sum + (g.questions > 0 ? g.correct / g.questions : 0), 0) / stats.totalGames * 100) : 0;
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {profileId && <JumbleDailyCalendar profileId={profileId} />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-cyan-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-cyan-100 p-2.5 text-cyan-700"><LetterText className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Rounds finished</p><p className="text-2xl font-bold">{stats.totalGames}</p></CardContent></Card>
        <Card className="border-cyan-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-amber-100 p-2.5 text-amber-700"><Trophy className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Rounds won</p><p className="text-2xl font-bold">{stats.wins}</p></CardContent></Card>
        <Card className="border-cyan-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-cyan-100 p-2.5 text-cyan-700"><TrendingUp className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Best score</p><p className="text-2xl font-bold">{stats.bestScore.toLocaleString()}</p></CardContent></Card>
        <Card className="border-cyan-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-cyan-100 p-2.5 text-cyan-700"><Check className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Avg accuracy</p><p className="text-2xl font-bold">{stats.totalGames ? `${avgAccuracy}%` : "—"}</p></CardContent></Card>
        <Card className="border-cyan-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-cyan-100 p-2.5 text-cyan-700"><Clock className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Average time</p><p className="text-2xl font-bold">{stats.totalGames ? format(stats.history.reduce((sum, g) => sum + g.elapsedSeconds, 0) / stats.totalGames) : "—"}</p></CardContent></Card>
        <Card className="border-cyan-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-amber-100 p-2.5 text-amber-700"><Flame className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Day streak</p><p className="text-2xl font-bold">{stats.currentStreak}/{stats.bestStreak}</p></CardContent></Card>
      </div>

      <Card className="overflow-hidden border-cyan-200/60 dark:border-cyan-800/40">
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-cyan-600" />Best by level</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(JUMBLE_LEVELS) as (keyof typeof JUMBLE_LEVELS)[]).map((difficulty) => {
            const bestTime = stats.bestTimes[difficulty];
            const bestAcc = stats.bestAccuracy[difficulty];
            return <div key={difficulty} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5"><span className="font-medium">{JUMBLE_LEVELS[difficulty].label} · {JUMBLE_LEVELS[difficulty].questions} words</span><span className="font-mono text-sm font-bold text-cyan-700 dark:text-cyan-300">{bestTime != null ? format(bestTime) : "—"}{bestAcc != null ? <span className="ml-2 text-xs font-semibold text-muted-foreground">{Math.round(bestAcc * 100)}%</span> : null}</span></div>;
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function JumbleDailyCalendar({ profileId }: { profileId: number }) {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const [viewYear, setViewYear] = useState(utcYear);
  const [viewMonth, setViewMonth] = useState(utcMonth);
  const month = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const { data } = useQuery({
    queryKey: [`/api/jumble-daily-challenge/history/${profileId}`, month],
    queryFn: () => customFetch<{ month: string; completedDates: string[] }>(`/api/jumble-daily-challenge/history/${profileId}?month=${month}`),
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
  return <Card className="border-cyan-200/60 shadow-sm dark:border-cyan-800/40">
    <CardHeader className="pb-2"><div className="flex items-center justify-between gap-2"><CardTitle className="flex items-center gap-2 text-base"><LetterText className="h-4 w-4 text-cyan-600" /> Daily Jumble Words</CardTitle><Link href="/jumble-challenge" className="whitespace-nowrap text-xs text-cyan-600 underline underline-offset-2">Play today →</Link></div></CardHeader>
    <CardContent className="space-y-3"><div className="flex items-center justify-between"><button onClick={previous} disabled={prevDisabled} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><p className="text-sm font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</p><button onClick={next} disabled={nextDisabled} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div>
      <div className="grid grid-cols-7 gap-1">{WEEKDAYS.map((day) => <div key={day} className="py-1 text-center text-[10px] font-semibold text-muted-foreground">{day}</div>)}{Array.from({ length: startWeekday }, (_, index) => <div key={`empty-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => { const day = index + 1; const date = `${month}-${String(day).padStart(2, "0")}`; const done = completed.has(date); const isToday = date === today; const future = date > today; return <div key={day} title={done ? `Completed ${date}` : undefined} className={`aspect-square flex items-center justify-center rounded-full text-xs font-semibold ${done ? "bg-cyan-500 text-white" : isToday ? "ring-2 ring-cyan-400" : future ? "text-muted-foreground/40" : "text-muted-foreground"}`}>{done ? "🔤" : day}</div>; })}</div>
      <p className="text-center text-[11px] text-muted-foreground">{completed.size} day{completed.size !== 1 ? "s" : ""} completed this month</p>
    </CardContent>
  </Card>;
}

function SlidePuzzleDailyCalendar({ profileId }: { profileId: number }) {''')

# 5. tabGameId union + else-if
rep('tabParam === "slide-puzzle" || tabParam === "game-2048" || tabParam === "odd-images"',
    'tabParam === "slide-puzzle" || tabParam === "game-2048" || tabParam === "jumble" || tabParam === "odd-images"')
rep('    else if (tabParam === "game-2048") setGameTab("game-2048");',
    '    else if (tabParam === "game-2048") setGameTab("game-2048");\n    else if (tabParam === "jumble") setGameTab("jumble");')

# 6. Select entries
rep('                  ["game-2048", "2048"],\n                  ["odd-images", "Odd Images"],',
    '                  ["game-2048", "2048"],\n                  ["jumble", "Jumble Words"],\n                  ["odd-images", "Odd Images"],')

# 7. render gate
rep('''          {!statsLoading && gameTab === "game-2048" && (
            <Game2048StatsPanel profileId={profileId} />
          )}''',
    '''          {!statsLoading && gameTab === "game-2048" && (
            <Game2048StatsPanel profileId={profileId} />
          )}
          {!statsLoading && gameTab === "jumble" && (
            <JumbleStatsPanel profileId={profileId} />
          )}''')

io.open(path, "w", encoding="utf-8").write(s)
print("patched OK, delta:", len(s) - len(orig))
