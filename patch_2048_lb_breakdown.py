import io

p = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/leaderboard.tsx"
s = io.open(p, encoding="utf-8").read()
orig = s
NL = chr(10)

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, "NOT FOUND: " + repr(old[:90]) + " count=" + str(s.count(old))
    s = s.replace(old, new, count)

# 1. BreakdownData field
rep(
  '  slidePuzzle: { difficulty: string; points: number; games: number }[];\n  oddImages:',
  '  slidePuzzle: { difficulty: string; points: number; games: number }[];\n  game2048: { difficulty: string; points: number; games: number }[];\n  oddImages:'
)

# 2. GameTab union (breakdown panel)
rep(
  'type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "odd-images" | "rubiks" | QuizGameId;',
  'type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | QuizGameId;'
)

# 3. bdTab button — after slide-puzzle button
rep(
  '''          <button onClick={() => setBdTab("slide-puzzle")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "slide-puzzle" ? "bg-sky-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🧩 Slide Puzzle
          </button>''',
  '''          <button onClick={() => setBdTab("slide-puzzle")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "slide-puzzle" ? "bg-sky-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🧩 Slide Puzzle
          </button>
          <button onClick={() => setBdTab("game-2048")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "game-2048" ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🔢 2048
          </button>'''
)

# 4. Breakdown panel block — after slide-puzzle block, before odd-images
rep(
  '''      {bdTab === "odd-images" && (''',
  '''      {bdTab === "game-2048" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.game2048 ?? (["3x3", "4x4", "5x5", "6x6"] as const).map((difficulty) => ({ difficulty, points: 0, games: 0 }))).map((item) => (
            <div key={item.difficulty} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-orange-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold text-foreground">{GAME_2048_LEVELS[item.difficulty as keyof typeof GAME_2048_LEVELS]?.label ?? item.difficulty} · {item.difficulty.replace("x", "×")}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-orange-700 dark:text-orange-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{item.difficulty.replace("x", "×")} board</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "odd-images" && ('''
)

# 5. GameSummaryPanel row — after slide-puzzle row
rep(
  '    { id: "slide-puzzle", label: "Slide Puzzle", icon: GAME_ICONS["slide-puzzle"], ...sum(data?.slidePuzzle) },',
  '    { id: "slide-puzzle", label: "Slide Puzzle", icon: GAME_ICONS["slide-puzzle"], ...sum(data?.slidePuzzle) },\n    { id: "game-2048", label: "2048", icon: GAME_ICONS["game-2048"], ...sum(data?.game2048) },'
)

assert s != orig
io.open(p, "w", encoding="utf-8").write(s)
print("leaderboard.tsx breakdown patched OK")
