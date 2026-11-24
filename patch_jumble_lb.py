import io

path = "src/pages/leaderboard.tsx"
s = io.open(path, encoding="utf-8").read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, f"NOT FOUND: {old[:80]!r} (count={s.count(old)})"
    s = s.replace(old, new, count)

# 1. import JUMBLE_LEVELS
rep('import { GAME_2048_LEVELS } from "@/lib/game-2048";',
    'import { GAME_2048_LEVELS } from "@/lib/game-2048";\nimport { JUMBLE_LEVELS } from "@/lib/jumble-words";')

# 2. BreakdownData field
rep('  game2048: { difficulty: string; points: number; games: number }[];',
    '  game2048: { difficulty: string; points: number; games: number }[];\n  jumble: { difficulty: string; points: number; games: number }[];')

# 3. GameTab union
rep('type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | QuizGameId;',
    'type GameTab = "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | QuizGameId;')

# 4. bdTab button after 2048 button
rep('''          <button onClick={() => setBdTab("game-2048")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "game-2048" ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🔢 2048
          </button>''',
    '''          <button onClick={() => setBdTab("game-2048")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "game-2048" ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🔢 2048
          </button>
          <button onClick={() => setBdTab("jumble")} className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${bdTab === "jumble" ? "bg-cyan-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            🔤 Jumble
          </button>''')

# 5. bdTab panel after game-2048 panel (ends before odd-images panel)
rep('''      {bdTab === "odd-images" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.oddImages ?? ODD_IMAGE_LEVEL_ORDER.map((level) => ({ level, points: 0, games: 0 }))).map((item) => (''',
    '''      {bdTab === "jumble" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.jumble ?? (["easy", "medium", "hard", "expert"] as const).map((difficulty) => ({ difficulty, points: 0, games: 0 }))).map((item) => (
            <div key={item.difficulty} className={`rounded-xl border p-2.5 text-center transition-colors ${item.games > 0 ? "border-cyan-300 bg-background" : "border-border bg-muted/30 opacity-50"}`}>
              <p className="text-xs font-bold text-foreground">{JUMBLE_LEVELS[item.difficulty as keyof typeof JUMBLE_LEVELS]?.label ?? item.difficulty}</p>
              <p className="mt-0.5 text-lg font-black tabular-nums leading-tight text-cyan-700 dark:text-cyan-300">{item.points > 0 ? item.points.toLocaleString() : "—"}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.games > 0 ? `${item.games} game${item.games !== 1 ? "s" : ""}` : "no games"}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground/80">{JUMBLE_LEVELS[item.difficulty as keyof typeof JUMBLE_LEVELS] ? `${JUMBLE_LEVELS[item.difficulty as keyof typeof JUMBLE_LEVELS].questions} words` : ""}</p>
            </div>
          ))}
        </div>
      )}
      {bdTab === "odd-images" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(data?.oddImages ?? ODD_IMAGE_LEVEL_ORDER.map((level) => ({ level, points: 0, games: 0 }))).map((item) => (''')

# 6. GameSummaryPanel row
rep('    { id: "game-2048", label: "2048", icon: GAME_ICONS["game-2048"], ...sum(data?.game2048) },',
    '    { id: "game-2048", label: "2048", icon: GAME_ICONS["game-2048"], ...sum(data?.game2048) },\n    { id: "jumble", label: "Jumble Words", icon: GAME_ICONS.jumble, ...sum(data?.jumble) },')

# 7. Scoring guide + board before LeaderboardScopeLinks comment
rep('''// ─── Page ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────''',
    '''function JumbleScoringGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-200/70 dark:border-cyan-800/40">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-semibold">How Jumble Words points &amp; XP are calculated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Accuracy, speed, and word difficulty all count.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border bg-muted px-5 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ level: "Easy", words: 5, par: "5:00", gems: 1 }, { level: "Medium", words: 8, par: "8:00", gems: 2 }, { level: "Hard", words: 10, par: "12:00", gems: 3 }, { level: "Expert", words: 12, par: "18:00", gems: 5 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.words} words per round</p>
                <p className="text-xs text-muted-foreground">Par {item.par}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">XP &amp; gems by level</p>
            <div className="overflow-hidden rounded-xl border border-border text-xs">
              <div className="grid grid-cols-4 bg-muted-foreground/15 px-3 py-2 text-[10px] font-semibold text-muted-foreground"><span>Level</span><span className="text-center">XP</span><span className="text-center">Gems</span><span className="text-center">Words</span></div>
              {Object.values(JUMBLE_LEVELS).map((level, index) => (
                <div key={level.id} className={`grid grid-cols-4 px-3 py-2 ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                  <span className="font-semibold">{level.label}</span>
                  <span className="text-center font-semibold text-amber-600">{level.xp} XP</span>
                  <span className="text-center font-mono">{level.gems} 💎</span>
                  <span className="text-center font-mono">{level.questions}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Score formula</p>
            <p className="mt-1 font-mono leading-relaxed">base × accuracy factor × speed factor × attempt factor</p>
            <p className="mt-1 leading-relaxed">Accuracy factor scales with the share of words solved. Finishing under par time adds up to +50%. Fewer wrong attempts keep more of the score (down to 70%). Minimum score: 10 points. Daily challenges use the same formula with today&apos;s shared word set.</p>
          </div>
        </div>
      )}
    </div>
  );
}

type JumbleLeaderboardEntry = { rank: number; profileId: number; username: string; avatar: string | null; xp: number; totalPoints: number; gamesPlayed: number };

function JumbleBoard({ myProfileId }: { myProfileId?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/jumble-games/leaderboard"],
    queryFn: () => customFetch<JumbleLeaderboardEntry[]>("/api/jumble-games/leaderboard"),
    refetchInterval: 60_000,
  });
  return <div className="space-y-5">
    <Card className="shadow-md border-cyan-200/60 dark:border-cyan-800/40">
      <CardHeader className="border-b bg-card pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const Icon = GAME_ICONS.jumble; return <Icon className="h-5 w-5 text-cyan-600" />; })()} Jumble Words — All Levels</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <div className="space-y-4 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          : isError ? <div className="p-10 text-center text-sm text-muted-foreground">Jumble Words leaderboard could not be loaded. Please try again.</div>
          : !data?.length ? <div className="p-12 text-center text-muted-foreground"><LayoutGrid className="mx-auto mb-3 h-10 w-10 opacity-20" /><p className="font-medium">No completed Jumble rounds yet.</p><p className="mt-1 text-sm">Unscramble words to claim the top spot.</p></div>
          : <div className="divide-y">{data.map((entry) => {
            const isMe = myProfileId !== undefined && entry.profileId === myProfileId;
            return <div key={entry.profileId} className={isMe ? "bg-cyan-50/70 dark:bg-cyan-950/20" : ""}>
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 px-3 py-4 sm:px-5">
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><p title={entry.username} className={`min-w-0 flex-1 truncate font-semibold ${isMe ? "text-cyan-800 dark:text-cyan-300" : ""}`}>{entry.username}</p>{isMe && <span className="rounded-full bg-cyan-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">You</span>}</div><p className="mt-0.5 text-xs text-muted-foreground">{entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? "s" : ""}</p></div>
                <div className="flex shrink-0 items-center gap-2"><div className="text-right"><p className="whitespace-nowrap text-lg font-black tabular-nums text-cyan-700 dark:text-cyan-300 sm:text-xl">{entry.totalPoints.toLocaleString()}</p><p className="mt-0.5 text-xs text-muted-foreground">pts</p></div></div>
              </div>
            </div>;
          })}</div>}
      </CardContent>
    </Card>
    <JumbleScoringGuide />
  </div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────''')

# 8. LeaderboardScopeLinks active union
rep('active: "all" | "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";',
    'active: "all" | "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";')

# 9. links array entry
rep('    { id: "game-2048", href: "/leaderboard/game-2048/", label: "2048", icon: GAME_ICONS["game-2048"] },',
    '    { id: "game-2048", href: "/leaderboard/game-2048/", label: "2048", icon: GAME_ICONS["game-2048"] },\n    { id: "jumble", href: "/leaderboard/jumble/", label: "Jumble Words", icon: GAME_ICONS.jumble },')

# 10. PLAY_LINKS key union
rep('''const PLAY_LINKS: Record<
  "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz",''',
    '''const PLAY_LINKS: Record<
  "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz",''')

# 11. PLAY_LINKS entry
rep('  "game-2048": { href: "/game-2048", label: "2048", ariaLabel: "Play 2048", icon: GAME_ICONS["game-2048"], borderClass: "border-orange-200 dark:border-orange-800", iconClass: "text-orange-600" },',
    '  "game-2048": { href: "/game-2048", label: "2048", ariaLabel: "Play 2048", icon: GAME_ICONS["game-2048"], borderClass: "border-orange-200 dark:border-orange-800", iconClass: "text-orange-600" },\n  jumble: { href: "/jumble", label: "Jumble Words", ariaLabel: "Play Jumble Words", icon: GAME_ICONS.jumble, borderClass: "border-cyan-200 dark:border-cyan-800", iconClass: "text-cyan-600" },')

# 12. gamePage prop union
rep('gamePage?: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";',
    'gamePage?: "sudoku" | "memory" | "jigsaw" | "word-search" | "minesweeper" | "slide-puzzle" | "game-2048" | "jumble" | "odd-images" | "rubiks" | "science-quiz" | "maths-quiz" | "gk-quiz";')

# 13. requestedTab check
rep('requestedTab === "slide-puzzle" || requestedTab === "game-2048" || requestedTab === "odd-images"',
    'requestedTab === "slide-puzzle" || requestedTab === "game-2048" || requestedTab === "jumble" || requestedTab === "odd-images"')

# 14. meta title chain
rep('''                : gamePage === "game-2048"
                  ? "2048 Leaderboard | Play Brain Games . Online"''',
    '''                : gamePage === "game-2048"
                  ? "2048 Leaderboard | Play Brain Games . Online"
                : gamePage === "jumble"
                  ? "Jumble Words Leaderboard | Play Brain Games . Online"''')

# 15. meta description chain
rep('''                : gamePage === "game-2048"
                  ? "Compare all-time 2048 points across every board size on Play Brain Games . Online."''',
    '''                : gamePage === "game-2048"
                  ? "Compare all-time 2048 points across every board size on Play Brain Games . Online."
                : gamePage === "jumble"
                  ? "Compare all-time Jumble Words points across every level on Play Brain Games . Online."''')

# 16. title chain
rep('''              : gamePage === "game-2048"
                ? "2048 Leaderboard"''',
    '''              : gamePage === "game-2048"
                ? "2048 Leaderboard"
              : gamePage === "jumble"
                ? "Jumble Words Leaderboard"''')

# 17. subtitle chain
rep('''              : gamePage === "game-2048"
                ? "All-time points across every 2048 board size."''',
    '''              : gamePage === "game-2048"
                ? "All-time points across every 2048 board size."
              : gamePage === "jumble"
                ? "All-time points across every Jumble Words level."''')

# 18. render board
rep('''      ) : gamePage === "game-2048" ? (
        <Game2048Board myProfileId={myProfileId} />''',
    '''      ) : gamePage === "game-2048" ? (
        <Game2048Board myProfileId={myProfileId} />
      ) : gamePage === "jumble" ? (
        <JumbleBoard myProfileId={myProfileId} />''')

io.open(path, "w", encoding="utf-8").write(s)
print("patched OK, delta:", len(s) - len(orig))
