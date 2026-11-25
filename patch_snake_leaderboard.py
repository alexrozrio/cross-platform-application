import io

p = r"/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/leaderboard.tsx"
s = io.open(p, encoding="utf-8").read()
orig = s

def rep(old, new, count=1):
    global s
    assert old in s, f"NOT FOUND: {old[:80]}"
    s = s.replace(old, new, count)

# 1. import SNAKE_LEVELS
rep('import { JUMBLE_LEVELS } from "@/lib/jumble-words";',
    'import { JUMBLE_LEVELS } from "@/lib/jumble-words";\nimport { SNAKE_LEVELS } from "@/lib/snake";')

# 2. combined guide: Snake table after Jumble table block (ends before Odd Images comment)
anchor = """          {/* Odd Images base points table */}"""
snake_table = """          {/* Snake base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🐍 Snake — base points × level
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-6 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Mode</span>
                <span className="text-center">Grid</span>
                <span className="text-center">Apples</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy", mode: "Kids", grid: "12×12", foods: 8, par: "3:00", base: 300, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium", mode: "Kids", grid: "14×14", foods: 12, par: "5:00", base: 650, xp: 2, gems: 2, cls: "text-blue-700" },
                { label: "Hard", mode: "Adult", grid: "16×16", foods: 16, par: "7:00", base: 1300, xp: 3, gems: 3, cls: "text-yellow-700" },
                { label: "Expert", mode: "Adult", grid: "18×18", foods: 20, par: "10:00", base: 2400, xp: 4, gems: 5, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-6 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-semibold text-muted-foreground">{row.mode}</span>
                  <span className="text-center font-mono">{row.grid}</span>
                  <span className="text-center font-mono">{row.foods}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              score = base × food factor (0.3 + 0.7 × apples eaten ÷ target) × (1 + time bonus up to +50%) × move-efficiency factor (70–100%) &nbsp;·&nbsp; min 10 pts.
            </p>
          </div>

"""
rep(anchor, snake_table + anchor)

# 3. BreakdownData
rep("  jumble: { difficulty: string; points: number; games: number }[];",
    "  jumble: { difficulty: string; points: number; games: number }[];\n  snake: { difficulty: string; points: number; games: number }[];")

# 4. GameTab union
rep('type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | QuizGameId;',
    'type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "snake" | "odd-images" | "rubiks" | QuizGameId;')

# 5. bdTab button after jumble button
rep("""          <button onClick={() => setBdTab("jumble")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "jumble" ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🔤 Jumble
          </button>""",
    """          <button onClick={() => setBdTab("jumble")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "jumble" ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🔤 Jumble
          </button>
          <button onClick={() => setBdTab("snake")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "snake" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🐍 Snake
          </button>""")

# 6. breakdown snake panel after jumble panel
rep("""      {bdTab === "odd-images" && (""",
    """      {bdTab === "snake" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.snake ?? (["easy", "medium", "hard", "expert"] as const).map((difficulty) => ({ difficulty, points: 0, games: 0 }))).map((item) => (
            <div key={item.difficulty} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-green-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold text-foreground">{SNAKE_LEVELS[item.difficulty as keyof typeof SNAKE_LEVELS]?.label ?? item.difficulty}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-green-700 dark:text-green-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{SNAKE_LEVELS[item.difficulty as keyof typeof SNAKE_LEVELS] ? `${SNAKE_LEVELS[item.difficulty as keyof typeof SNAKE_LEVELS].gridSize}×${SNAKE_LEVELS[item.difficulty as keyof typeof SNAKE_LEVELS].gridSize} · ${SNAKE_LEVELS[item.difficulty as keyof typeof SNAKE_LEVELS].foods} apples` : ""}</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "odd-images" && (""")

# 7. GameSummaryPanel row
rep('    { id: "jumble", label: "Jumble Words", icon: GAME_ICONS.jumble, ...sum(data?.jumble) },',
    '    { id: "jumble", label: "Jumble Words", icon: GAME_ICONS.jumble, ...sum(data?.jumble) },\n    { id: "snake", label: "Snake", icon: GAME_ICONS.snake, ...sum(data?.snake) },')

# 8. empty-state game list text
rep("Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, or the quizzes",
    "Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, or the quizzes")

# 9. SnakeScoringGuide + SnakeBoard after JumbleBoard
anchor2 = """// ─── Page ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────"""
snake_components = """function SnakeScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-green-200/70 dark:border-green-800/40">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How Snake points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Apples eaten, speed, and move efficiency all count.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ level: "Easy", mode: "Kids", grid: "12×12", foods: 8, par: "3:00", gems: 1 }, { level: "Medium", mode: "Kids", grid: "14×14", foods: 12, par: "5:00", gems: 2 }, { level: "Hard", mode: "Adult", grid: "16×16", foods: 16, par: "7:00", gems: 3 }, { level: "Expert", mode: "Adult", grid: "18×18", foods: 20, par: "10:00", gems: 5 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.mode} mode</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.grid} grid · {item.foods} apples</p>
                <p className="text-xs text-muted-foreground">Par {item.par}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP &amp; gems by level</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Level</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Apples</span></div>
              {Object.values(SNAKE_LEVELS).map((level, index) => (
                <div key={level.id} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                  <span className="font-semibold">{level.label} · {level.gridSize}×{level.gridSize}</span>
                  <span className="text-center font-semibold text-amber-600">{level.xp} XP</span>
                  <span className="text-center font-mono">{level.gems} 💎</span>
                  <span className="text-center font-mono">{level.foods}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × food factor × (1 + time bonus) × move-efficiency factor</p>
            <p className="mt-1 leading-relaxed">The food factor scales with apples eaten toward the level target (up to 1.0× at the target). Finishing under par time adds up to +50%. Move efficiency scales 70–100% with fewer wasted moves. Minimum score: 10 points. Daily challenges use the same formula with today&apos;s shared board seed.</p>
          </div>
        </div>
      )}
    </div>
  );
}

type SnakeLeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

function SnakeBoard({ myProfileId }: { myProfileId?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/snake-games/leaderboard"],
    queryFn: () => customFetch<SnakeLeaderboardEntry[]>("/api/snake-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-green-200/60 dark:border-green-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS.snake; return <Icon className="h-5 w-5 text-green-600" />; })()} Snake — All Levels</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Snake leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><LayoutGrid className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed Snake runs yet.</p><p className="mt-1 text-sm">Eat apples to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            return <div key={entry.profileId} className={isMe ? "bg-green-50/70 dark:bg-green-950/20" : ""}>
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 px-3 py-4 sm:px-5">
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-green-800 dark:text-green-300" : ""}`}>{entry.username}</p>{isMe && <span className="rounded-full bg-green-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""}</p></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-green-700 dark:text-green-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div></div>
              </div>
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <SnakeScoringGuide />
  </div>;
}

"""
rep(anchor2, snake_components + anchor2)

# 10. LeaderboardScopeLinks union + link
rep('active: "all" | "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";',
    'active: "all" | "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "snake" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";')
rep('    { id: "jumble", href: "/leaderboard/jumble/", label: "Jumble Words", icon: GAME_ICONS.jumble },',
    '    { id: "jumble", href: "/leaderboard/jumble/", label: "Jumble Words", icon: GAME_ICONS.jumble },\n    { id: "snake", href: "/leaderboard/snake/", label: "Snake", icon: GAME_ICONS.snake },')

# 11. PLAY_LINKS union + entry
rep('  "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz",\n  { href: string; label: string; ariaLabel: string; icon: typeof Zap; borderClass: string; iconClass: string }',
    '  "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "snake" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz",\n  { href: string; label: string; ariaLabel: string; icon: typeof Zap; borderClass: string; iconClass: string }')
rep('  jumble: { href: "/jumble", label: "Jumble Words", ariaLabel: "Play Jumble Words", icon: GAME_ICONS.jumble, borderClass: "border-cyan-200 dark:border-cyan-800", iconClass: "text-cyan-600" },',
    '  jumble: { href: "/jumble", label: "Jumble Words", ariaLabel: "Play Jumble Words", icon: GAME_ICONS.jumble, borderClass: "border-cyan-200 dark:border-cyan-800", iconClass: "text-cyan-600" },\n  snake: { href: "/snake", label: "Snake", ariaLabel: "Play Snake", icon: GAME_ICONS.snake, borderClass: "border-green-200 dark:border-green-800", iconClass: "text-green-600" },')

# 12. Leaderboard props union
rep('  gamePage?: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";',
    '  gamePage?: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "snake" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";')

# 13. requestedTab check
rep('requestedTab === "game-2048" || requestedTab === "jumble" || requestedTab === "odd-images"',
    'requestedTab === "game-2048" || requestedTab === "jumble" || requestedTab === "snake" || requestedTab === "odd-images"')

# 14. meta title
rep('''                : gamePage === "jumble"
                  ? "Jumble Words Leaderboard | Play Brain Games . Online"''',
    '''                : gamePage === "jumble"
                  ? "Jumble Words Leaderboard | Play Brain Games . Online"
                : gamePage === "snake"
                  ? "Snake Leaderboard | Play Brain Games . Online"''')

# 15. meta description
rep('''                : gamePage === "jumble"
                  ? "Compare all-time Jumble Words points across every level on Play Brain Games . Online."''',
    '''                : gamePage === "jumble"
                  ? "Compare all-time Jumble Words points across every level on Play Brain Games . Online."
                : gamePage === "snake"
                  ? "Compare all-time Snake points across every level on Play Brain Games . Online."''')

# 16. title
rep('''              : gamePage === "jumble"
                ? "Jumble Words Leaderboard"''',
    '''              : gamePage === "jumble"
                ? "Jumble Words Leaderboard"
              : gamePage === "snake"
                ? "Snake Leaderboard"''')

# 17. subtitle
rep('''              : gamePage === "jumble"
                ? "All-time points across every Jumble Words level."''',
    '''              : gamePage === "jumble"
                ? "All-time points across every Jumble Words level."
              : gamePage === "snake"
                ? "All-time points across every Snake level."''')

# 18. board switch
rep('''      ) : gamePage === "jumble" ? (
        <JumbleBoard myProfileId={myProfileId} />''',
    '''      ) : gamePage === "jumble" ? (
        <JumbleBoard myProfileId={myProfileId} />
      ) : gamePage === "snake" ? (
        <SnakeBoard myProfileId={myProfileId} />''')

io.open(p, "w", encoding="utf-8").write(s)
print("patched", len(s) - len(orig), "bytes added")
