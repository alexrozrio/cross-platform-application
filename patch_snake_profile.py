PATH = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/profile.tsx"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:80]!r}"
    src = src.replace(old, new, count)

# 1. lucide import
rep('  LetterText,\n} from "lucide-react";',
    '  LetterText,\n  Snake,\n} from "lucide-react";')

# 2. lib imports
rep('import { JUMBLE_LEVELS } from "@/lib/jumble-words";\nimport { getJumbleHistory, summarizeJumbleStats, JUMBLE_STATS_UPDATED } from "@/lib/jumble-stats";',
    'import { JUMBLE_LEVELS } from "@/lib/jumble-words";\nimport { getJumbleHistory, summarizeJumbleStats, JUMBLE_STATS_UPDATED } from "@/lib/jumble-stats";\nimport { SNAKE_LEVELS } from "@/lib/snake";\nimport { getSnakeHistory, summarizeSnakeStats, SNAKE_STATS_UPDATED } from "@/lib/snake-stats";')

# 3. AchievementsCard union + flag
rep('game: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "science-quiz" | "maths-quiz" | "gk-quiz" }',
    'game: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "snake" | "odd-images" | "science-quiz" | "maths-quiz" | "gk-quiz" }')
rep('  const isJumble = game === "jumble";\n  const isOddImages = game === "odd-images";',
    '  const isJumble = game === "jumble";\n  const isSnake = game === "snake";\n  const isOddImages = game === "odd-images";')

# 4. theme branches (5 spots, all share the same isJumble chain pattern)
rep('isJumble ? "border-cyan-200/60 dark:border-cyan-800/40" : isOddImages',
    'isJumble ? "border-cyan-200/60 dark:border-cyan-800/40" : isSnake ? "border-green-200/60 dark:border-green-800/40" : isOddImages')
rep('isJumble ? "text-cyan-600" : isOddImages ? "text-teal-600"',
    'isJumble ? "text-cyan-600" : isSnake ? "text-green-600" : isOddImages ? "text-teal-600"')
rep('isJumble ? "text-cyan-700 dark:text-cyan-300" : isOddImages ? "text-teal-700 dark:text-teal-300"',
    'isJumble ? "text-cyan-700 dark:text-cyan-300" : isSnake ? "text-green-700 dark:text-green-300" : isOddImages ? "text-teal-700 dark:text-teal-300"')
rep('''                                  : isJumble
                                    ? "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200/60 shadow-sm"
                                    : isOddImages''',
    '''                                  : isJumble
                                    ? "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200/60 shadow-sm"
                                    : isSnake
                                      ? "bg-green-50 dark:bg-green-950/20 border-green-200/60 shadow-sm"
                                    : isOddImages''')
rep('isJumble ? "bg-cyan-500/60" : isOddImages ? "bg-teal-500/60"',
    'isJumble ? "bg-cyan-500/60" : isSnake ? "bg-green-500/60" : isOddImages ? "bg-teal-500/60"')

# 5. GameTab union
rep('type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | QuizGameId;',
    'type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "snake" | "odd-images" | "rubiks" | QuizGameId;')

# 6. SnakeStatsPanel + SnakeDailyCalendar after JumbleDailyCalendar
rep('''function SlidePuzzleDailyCalendar({ profileId }: { profileId: number }) {''',
    '''function SnakeStatsPanel({ profileId }: { profileId: number | null }) {
  const [history, setHistory] = useState(() => getSnakeHistory(profileId));
  useEffect(() => {
    const refresh = (event?: Event) => {
      const changedProfileId = (event as CustomEvent<number | null> | undefined)?.detail;
      if (changedProfileId === undefined || changedProfileId === (profileId ?? null)) setHistory(getSnakeHistory(profileId));
    };
    window.addEventListener(SNAKE_STATS_UPDATED, refresh);
    return () => window.removeEventListener(SNAKE_STATS_UPDATED, refresh);
  }, [profileId]);

  const stats = summarizeSnakeStats(history);
  const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {profileId && <SnakeDailyCalendar profileId={profileId} />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-green-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-green-100 p-2.5 text-green-700"><Snake className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Rounds finished</p><p className="text-2xl font-bold">{stats.totalGames}</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-amber-100 p-2.5 text-amber-700"><Trophy className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Rounds won</p><p className="text-2xl font-bold">{stats.wins}</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-green-100 p-2.5 text-green-700"><TrendingUp className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Best score</p><p className="text-2xl font-bold">{stats.bestScore.toLocaleString()}</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-green-100 p-2.5 text-green-700"><Check className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Best food</p><p className="text-2xl font-bold">{stats.totalGames ? Math.max(...Object.values(stats.bestFoods).filter((v): v is number => v != null)) || "—" : "—"}</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-green-100 p-2.5 text-green-700"><Clock className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Fastest win</p><p className="text-2xl font-bold">{Object.keys(stats.bestTimes).length ? format(Math.min(...Object.values(stats.bestTimes).filter((v): v is number => v != null))) : "—"}</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="flex flex-col items-center gap-2 p-4 text-center"><div className="rounded-full bg-amber-100 p-2.5 text-amber-700"><Flame className="h-5 w-5" /></div><p className="text-xs text-muted-foreground">Day streak</p><p className="text-2xl font-bold">{stats.currentStreak}/{stats.bestStreak}</p></CardContent></Card>
      </div>

      <Card className="overflow-hidden border-green-200/60 dark:border-green-800/40">
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-green-600" />Best by level</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(SNAKE_LEVELS) as (keyof typeof SNAKE_LEVELS)[]).map((difficulty) => {
            const bestTime = stats.bestTimes[difficulty];
            const bestFood = stats.bestFoods[difficulty];
            return <div key={difficulty} className="flex items-center justify-between rounded-lg border bg-background px-3 py-2.5"><span className="font-medium">{SNAKE_LEVELS[difficulty].label} · {SNAKE_LEVELS[difficulty].gridSize}×{SNAKE_LEVELS[difficulty].gridSize} · {SNAKE_LEVELS[difficulty].foods} food · {SNAKE_LEVELS[difficulty].mode === "baby" ? "Kids" : "Adult"}</span><span className="font-mono text-sm font-bold text-green-700 dark:text-green-300">{bestTime != null ? format(bestTime) : "—"}{bestFood != null ? <span className="ml-2 text-xs font-semibold text-muted-foreground">{bestFood} food</span> : null}</span></div>;
          })}
        </CardContent>
      </Card>

      {profileId && <AchievementsCard profileId={profileId} game="snake" />}
    </div>
  );
}

function SnakeDailyCalendar({ profileId }: { profileId: number }) {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const [viewYear, setViewYear] = useState(utcYear);
  const [viewMonth, setViewMonth] = useState(utcMonth);
  const month = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const { data } = useQuery({
    queryKey: [`/api/snake-daily-challenge/history/${profileId}`, month],
    queryFn: () => customFetch<{ month: string; completedDates: string[] }>(`/api/snake-daily-challenge/history/${profileId}?month=${month}`),
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
  return <Card className="border-green-200/60 shadow-sm dark:border-green-800/40">
    <CardHeader className="pb-2"><div className="flex items-center justify-between gap-2"><CardTitle className="flex items-center gap-2 text-base"><Snake className="h-4 w-4 text-green-600" /> Daily Snake</CardTitle><Link href="/snake-challenge" className="whitespace-nowrap text-xs text-green-600 underline underline-offset-2">Play today →</Link></div></CardHeader>
    <CardContent className="space-y-3"><div className="flex items-center justify-between"><button onClick={previous} disabled={prevDisabled} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><p className="text-sm font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</p><button onClick={next} disabled={nextDisabled} className="rounded p-1 hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div>
      <div className="grid grid-cols-7 gap-1">{WEEKDAYS.map((day) => <div key={day} className="py-1 text-center text-[10px] font-semibold text-muted-foreground">{day}</div>)}{Array.from({ length: startWeekday }, (_, index) => <div key={`empty-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => { const day = index + 1; const date = `${month}-${String(day).padStart(2, "0")}`; const done = completed.has(date); const isToday = date === today; const future = date > today; return <div key={day} title={done ? `Completed ${date}` : undefined} className={`aspect-square flex items-center justify-center rounded-full text-xs font-semibold ${done ? "bg-green-500 text-white" : isToday ? "ring-2 ring-green-400" : future ? "text-muted-foreground/40" : "text-muted-foreground"}`}>{done ? "🐍" : day}</div>; })}</div>
      <p className="text-center text-[11px] text-muted-foreground">{completed.size} day{completed.size !== 1 ? "s" : ""} completed this month</p>
    </CardContent>
  </Card>;
}

function SlidePuzzleDailyCalendar({ profileId }: { profileId: number }) {''')

# 7. tab list entry
rep('                  ["jumble", "Jumble Words"],\n                  ["odd-images", "Odd Images"],',
    '                  ["jumble", "Jumble Words"],\n                  ["snake", "Snake"],\n                  ["odd-images", "Odd Images"],')

# 8. tabParam validation + setGameTab
rep('|| tabParam === "jumble" || tabParam === "odd-images"', '|| tabParam === "jumble" || tabParam === "snake" || tabParam === "odd-images"')
rep('    else if (tabParam === "jumble") setGameTab("jumble");',
    '    else if (tabParam === "jumble") setGameTab("jumble");\n    else if (tabParam === "snake") setGameTab("snake");')

# 9. render block
rep('''          {!statsLoading && gameTab === "jumble" && (
            <JumbleStatsPanel profileId={profileId} />
          )}
          {!statsLoading && gameTab === "odd-images" && (''',
    '''          {!statsLoading && gameTab === "jumble" && (
            <JumbleStatsPanel profileId={profileId} />
          )}
          {!statsLoading && gameTab === "snake" && (
            <SnakeStatsPanel profileId={profileId} />
          )}
          {!statsLoading && gameTab === "odd-images" && (''')

# 10. meta text
rep('"Review your progress, personal bests, achievements, and game preferences across all twelve games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and the quizzes."',
    '"Review your progress, personal bests, achievements, and game preferences across all thirteen games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and the quizzes."')

open(PATH, "w", encoding="utf-8").write(src)
print("profile.tsx patched OK")
