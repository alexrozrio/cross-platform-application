import io

p = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/leaderboard.tsx"
s = io.open(p, encoding="utf-8").read()
orig = s
NL = chr(10)

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, "NOT FOUND: " + repr(old[:90]) + " count=" + str(s.count(old))
    s = s.replace(old, new, count)

# 1. Import GAME_2048_LEVELS next to slide-puzzle import
rep(
  'import { SLIDE_PUZZLE_LEVELS, type SlidePuzzleDifficulty } from "@/lib/slide-puzzle";',
  'import { SLIDE_PUZZLE_LEVELS, type SlidePuzzleDifficulty } from "@/lib/slide-puzzle";' + NL +
  'import { GAME_2048_LEVELS } from "@/lib/game-2048";'
)

# 2. Scoring guide + board — insert before "// ─── Page"
rep(
  '// ─── Page ' + '─' * 10,
  '''function Game2048ScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-orange-200/70 dark:border-orange-800/40">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How 2048 points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Biggest tile, speed, and move efficiency all count.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ level: "Easy · 3×3", base: 300, par: "10:00", target: 512, gems: 1 }, { level: "Medium · 4×4", base: 700, par: "25:00", target: 1024, gems: 2 }, { level: "Hard · 5×5", base: 1500, par: "45:00", target: 2048, gems: 3 }, { level: "Expert · 6×6", base: 3000, par: "75:00", target: 2048, gems: 5 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Par {item.par} · target {item.target}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP &amp; gems by level</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Level</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Target tile</span></div>
              {Object.values(GAME_2048_LEVELS).map((level, index) => (
                <div key={level.id} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                  <span className="font-semibold">{level.label} · {level.size}×{level.size}</span>
                  <span className="text-center font-semibold text-amber-600">{level.xp} XP</span>
                  <span className="text-center font-mono">{level.gems} 💎</span>
                  <span className="text-center font-mono">{level.targetTile}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × tile factor × (1 + time bonus) × move factor</p>
            <p className="mt-1 leading-relaxed">The tile factor scales with the highest tile you reach (up to 1.5× at the target). Finishing under par time adds up to +50%. Move factor scales from 70% to 100% as your move count approaches par. Minimum score: 10 points. Daily challenges use the same formula with today&apos;s shared tile sequence.</p>
          </div>
        </div>
      )}
    </div>
  );
}

type Game2048LeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

function Game2048Board({ myProfileId }: { myProfileId?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/game-2048-games/leaderboard"],
    queryFn: () => customFetch<Game2048LeaderboardEntry[]>("/api/game-2048-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-orange-200/60 dark:border-orange-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS["game-2048"]; return <Icon className="h-5 w-5 text-orange-600" />; })()} 2048 — All Board Sizes</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">2048 leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><Grid2x2 className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed 2048 games yet.</p><p className="mt-1 text-sm">Merge tiles to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            return <div key={entry.profileId} className={isMe ? "bg-orange-50/70 dark:bg-orange-950/20" : ""}>
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 px-3 py-4 sm:px-5">
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-orange-800 dark:text-orange-300" : ""}`}>{entry.username}</p>{isMe && <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""}</p></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-orange-700 dark:text-orange-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div></div>
              </div>
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <Game2048ScoringGuide />
  </div>;
}

// ─── Page ''' + '─' * 74
)

# 3. Scope links union + entry
rep(
  'active: "all" | "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";',
  'active: "all" | "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";'
)
rep(
  '    { id: "slide-puzzle", href: "/leaderboard/slide-puzzle/", label: "Slide Puzzle", icon: GAME_ICONS["slide-puzzle"] },',
  '    { id: "slide-puzzle", href: "/leaderboard/slide-puzzle/", label: "Slide Puzzle", icon: GAME_ICONS["slide-puzzle"] },' + NL +
  '    { id: "game-2048", href: "/leaderboard/game-2048/", label: "2048", icon: GAME_ICONS["game-2048"] },'
)

# 4. PLAY_LINKS
rep(
  '  "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz",' + NL +
  '  { href: string; label: string; ariaLabel: string; icon: typeof Zap; borderClass: string; iconClass: string }',
  '  "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz",' + NL +
  '  { href: string; label: string; ariaLabel: string; icon: typeof Zap; borderClass: string; iconClass: string }'
)
rep(
  '  "slide-puzzle": { href: "/slide-puzzle", label: "Slide Puzzle", ariaLabel: "Play Slide Puzzle", icon: GAME_ICONS["slide-puzzle"], borderClass: "border-sky-200 dark:border-sky-800", iconClass: "text-sky-600" },',
  '  "slide-puzzle": { href: "/slide-puzzle", label: "Slide Puzzle", ariaLabel: "Play Slide Puzzle", icon: GAME_ICONS["slide-puzzle"], borderClass: "border-sky-200 dark:border-sky-800", iconClass: "text-sky-600" },' + NL +
  '  "game-2048": { href: "/game-2048", label: "2048", ariaLabel: "Play 2048", icon: GAME_ICONS["game-2048"], borderClass: "border-orange-200 dark:border-orange-800", iconClass: "text-orange-600" },'
)

# 5. gamePage prop union + requestedTab
rep(
  '  gamePage?: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";',
  '  gamePage?: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";'
)
rep(
  'requestedTab === "slide-puzzle" || requestedTab === "odd-images"',
  'requestedTab === "slide-puzzle" || requestedTab === "game-2048" || requestedTab === "odd-images"'
)

# 6. Meta title chain — insert after slide-puzzle title branch
rep(
  '''              : gamePage === "slide-puzzle"
                ? "Slide Puzzle Leaderboard | Play Brain Games . Online"''',
  '''              : gamePage === "slide-puzzle"
                ? "Slide Puzzle Leaderboard | Play Brain Games . Online"
                : gamePage === "game-2048"
                  ? "2048 Leaderboard | Play Brain Games . Online"'''
)
rep(
  '''              : gamePage === "slide-puzzle"
                ? "Compare all-time Slide Puzzle points across every board size on Play Brain Games . Online."''',
  '''              : gamePage === "slide-puzzle"
                ? "Compare all-time Slide Puzzle points across every board size on Play Brain Games . Online."
                : gamePage === "game-2048"
                  ? "Compare all-time 2048 points across every board size on Play Brain Games . Online."'''
)
rep(
  '''            : gamePage === "slide-puzzle"
              ? "Slide Puzzle Leaderboard"''',
  '''            : gamePage === "slide-puzzle"
              ? "Slide Puzzle Leaderboard"
              : gamePage === "game-2048"
                ? "2048 Leaderboard"'''
)
rep(
  '''            : gamePage === "slide-puzzle"
              ? "All-time points across every Slide Puzzle board size."''',
  '''            : gamePage === "slide-puzzle"
              ? "All-time points across every Slide Puzzle board size."
              : gamePage === "game-2048"
                ? "All-time points across every 2048 board size."'''
)

# 7. Board render branch
rep(
  '''      ) : gamePage === "slide-puzzle" ? (
        <SlidePuzzleBoard myProfileId={myProfileId} />''',
  '''      ) : gamePage === "slide-puzzle" ? (
        <SlidePuzzleBoard myProfileId={myProfileId} />
      ) : gamePage === "game-2048" ? (
        <Game2048Board myProfileId={myProfileId} />'''
)

assert s != orig
io.open(p, "w", encoding="utf-8").write(s)
print("leaderboard.tsx patched OK")
