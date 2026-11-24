import io

p = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/portal.tsx"
s = io.open(p, encoding="utf-8").read()
orig = s
NL = chr(10)

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, "NOT FOUND: " + repr(old[:90]) + " count=" + str(s.count(old))
    s = s.replace(old, new, count)

# 1. Import
rep(
  'import { SLIDE_PUZZLE_LEVELS, type SlidePuzzleDifficulty } from "@/lib/slide-puzzle";',
  'import { SLIDE_PUZZLE_LEVELS, type SlidePuzzleDifficulty } from "@/lib/slide-puzzle";' + NL +
  'import { GAME_2048_LEVELS, type Game2048Difficulty } from "@/lib/game-2048";'
)

# 2. FEATURED_GAME_IDS
rep(
  '"minesweeper", "slide-puzzle", "odd-images"',
  '"minesweeper", "slide-puzzle", "game-2048", "odd-images"'
)

# 3. PORTAL_GAMES entry — after slide-puzzle entry, before odd-images
rep(
  '''  {
    id: "odd-images", name: "Odd Images", href: "/odd-images",''',
  '''  {
    id: "game-2048", name: "2048", href: "/game-2048",
    icon: GAME_ICONS["game-2048"], color: gameIconColor("game-2048"), chip: "bg-orange-100 dark:bg-orange-950/60",
    gradient: "from-orange-100 via-amber-50 to-yellow-100 dark:from-orange-950/75 dark:via-amber-950/70 dark:to-yellow-950/60",
    tagline: "Merge & reach 2048",
    desc: "Slide and merge numbered tiles on boards from 3×3 to 6×6. Reach the target tile before you run out of moves — daily challenges and duels included.",
    keywords: "merge numbers tiles",
  },
  {
    id: "odd-images", name: "Odd Images", href: "/odd-images",'''
)

# 4. Level filter + launcher
rep(
  '''  const launchSlidePuzzle = (difficulty: SlidePuzzleDifficulty) =>
    setLocation(`/slide-puzzle?start=1&difficulty=${difficulty}`);''',
  '''  const launchSlidePuzzle = (difficulty: SlidePuzzleDifficulty) =>
    setLocation(`/slide-puzzle?start=1&difficulty=${difficulty}`);
  const visibleGame2048Levels: Game2048Difficulty[] = (["3x3", "4x4", "5x5", "6x6"] as Game2048Difficulty[]).filter((level) =>
    gameMode === "children" ? GAME_2048_LEVELS[level].mode === "baby" : gameMode === "adult" ? GAME_2048_LEVELS[level].mode === "adult" : true,
  );
  const launchGame2048 = (difficulty: Game2048Difficulty) =>
    setLocation(`/game-2048?start=1&difficulty=${difficulty}`);'''
)

# 5. Mobile featured section — insert before Odd Images quick launch
rep(
  '        {/* Odd Images quick launch */}',
  '''        {/* 2048 quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-orange-400/60 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 p-4 shadow-xl shadow-orange-500/20 ring-1 ring-inset ring-white/70 dark:from-orange-950/75 dark:via-amber-950/70 dark:to-yellow-950/60 dark:ring-white/10 ${matchesGame("game-2048") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl dark:bg-amber-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-orange-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["2", "4", "8", "16", "32", "64", "128", "256", "512"].map((tile, index) => <span key={index} className="flex items-center justify-center border border-orange-400/10 text-[10px] font-black text-orange-700/30 dark:text-orange-200/20">{tile}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md"><LayoutGrid className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">2048</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 shadow-sm dark:bg-slate-950/30 dark:text-orange-300">Merge &amp; reach</span></div></div><button onClick={() => setLocation("/game-2048")} className="rounded-full bg-orange-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-orange-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Slide tiles to merge matching numbers.</p>
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleGame2048Levels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleGame2048Levels.map((level) => <button key={level} onClick={() => launchGame2048(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-orange-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-orange-700 dark:text-orange-300">{GAME_2048_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · {GAME_2048_LEVELS[level].targetTile}</span></button>)}
          </div>
        </section>

        {/* Odd Images quick launch */}'''
)

# 6. Desktop featured section — insert before odd-images desktop section
rep(
  '            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60 bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 text-left shadow-xl shadow-teal-500/20 ring-1 ring-inset ring-white/70 transition hover:border-teal-500/80 dark:from-teal-950/75 dark:via-cyan-950/70 dark:to-sky-950/60 dark:ring-white/10 ${matchesGame("odd-images") ? "" : "hidden"}`}>',
  '''            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-orange-400/60 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 text-left shadow-xl shadow-orange-500/20 ring-1 ring-inset ring-white/70 transition hover:border-orange-500/80 dark:from-orange-950/75 dark:via-amber-950/70 dark:to-yellow-950/60 dark:ring-white/10 ${matchesGame("game-2048") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl dark:bg-amber-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-orange-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["2", "4", "8", "16", "32", "64", "128", "256", "512"].map((tile, index) => <span key={index} className="flex items-center justify-center border border-orange-400/10 text-sm font-black text-orange-700/25 dark:text-orange-200/20">{tile}</span>)}</div>
              <button onClick={() => setLocation("/game-2048")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-600/10 text-orange-600 ring-1 ring-orange-400/20 dark:text-orange-300"><LayoutGrid className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">2048</h2><p className="text-xs text-muted-foreground">Merge tiles, reach the target</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Slide every tile to merge matching numbers across four board sizes — 3×3 up to 6×6. Reach the target tile before you run out of moves.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {visibleGame2048Levels.map((level) => <button key={level} onClick={() => launchGame2048(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-orange-400/20 bg-orange-500/5 px-1 py-2 text-center transition-all hover:border-orange-400/40 hover:bg-orange-500/15"><span className="text-xs font-bold leading-none text-orange-700 dark:text-orange-300">{GAME_2048_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · {GAME_2048_LEVELS[level].targetTile}</span></button>)}
                </div>
                <button onClick={() => setLocation("/game-2048")} className="mt-3 text-xs font-semibold text-orange-800 underline underline-offset-2 dark:text-orange-200">More options</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60 bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 text-left shadow-xl shadow-teal-500/20 ring-1 ring-inset ring-white/70 transition hover:border-teal-500/80 dark:from-teal-950/75 dark:via-cyan-950/70 dark:to-sky-950/60 dark:ring-white/10 ${matchesGame("odd-images") ? "" : "hidden"}`}>'''
)

# 7. Mobile daily row — after slide-puzzle daily row
rep(
  '''            <button onClick={() => setLocation("/slide-puzzle-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-sky-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-sky-950/20 dark:hover:bg-sky-950/40">
              <Grid3x3 className="h-5 w-5 shrink-0 text-sky-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Slide Puzzle</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-sky-500">→</span>
            </button>''',
  '''            <button onClick={() => setLocation("/slide-puzzle-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-sky-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-sky-950/20 dark:hover:bg-sky-950/40">
              <Grid3x3 className="h-5 w-5 shrink-0 text-sky-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Slide Puzzle</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-sky-500">→</span>
            </button>
            <button onClick={() => setLocation("/game-2048-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-orange-950/20 dark:hover:bg-orange-950/40">
              <LayoutGrid className="h-5 w-5 shrink-0 text-orange-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">2048</p><p className="text-xs text-muted-foreground">One shared tile sequence each day</p></div><span className="shrink-0 text-sm text-orange-500">→</span>
            </button>'''
)

# 8. Desktop daily row — after slide-puzzle daily row
rep(
  '''              <button onClick={() => setLocation("/slide-puzzle-challenge")} className="flex items-center gap-3 rounded-xl border border-sky-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-sky-950/20 dark:hover:bg-sky-950/40">
                <Grid3x3 className="h-6 w-6 shrink-0 text-sky-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Slide Puzzle</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-sky-500">→</span>
              </button>''',
  '''              <button onClick={() => setLocation("/slide-puzzle-challenge")} className="flex items-center gap-3 rounded-xl border border-sky-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-sky-950/20 dark:hover:bg-sky-950/40">
                <Grid3x3 className="h-6 w-6 shrink-0 text-sky-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Slide Puzzle</p><p className="text-xs text-muted-foreground">One shared scramble each day</p></div><span className="shrink-0 text-sm text-sky-500">→</span>
              </button>
              <button onClick={() => setLocation("/game-2048-challenge")} className="flex items-center gap-3 rounded-xl border border-orange-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-orange-950/20 dark:hover:bg-orange-950/40">
                <LayoutGrid className="h-6 w-6 shrink-0 text-orange-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">2048</p><p className="text-xs text-muted-foreground">One shared tile sequence each day</p></div><span className="shrink-0 text-sm text-orange-500">→</span>
              </button>'''
)

assert s != orig
io.open(p, "w", encoding="utf-8").write(s)
print("portal.tsx patched OK")
