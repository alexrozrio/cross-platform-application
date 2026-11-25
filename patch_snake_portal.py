PATH = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/portal.tsx"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:80]!r}"
    src = src.replace(old, new, count)

# 1. lucide import: add Snake icon
rep('  LetterText,\n  type LucideIcon,\n} from "lucide-react";',
    '  LetterText,\n  Snake,\n  type LucideIcon,\n} from "lucide-react";')

# 2. lib import
rep('import { JUMBLE_LEVELS, type JumbleDifficulty } from "@/lib/jumble-words";',
    'import { JUMBLE_LEVELS, type JumbleDifficulty } from "@/lib/jumble-words";\nimport { SNAKE_LEVELS, type SnakeDifficulty } from "@/lib/snake";')

# 3. FEATURED_GAME_IDS
rep('"slide-puzzle", "game-2048", "jumble", "odd-images"',
    '"slide-puzzle", "game-2048", "jumble", "snake", "odd-images"')

# 4. PORTAL_GAMES entry after jumble
rep('''    desc: "Jumbled English letters hide a real word — rebuild it letter by letter across four levels with growing word counts and difficulty.",
    keywords: "anagram letters word",
  },
  {
    id: "odd-images"''',
    '''    desc: "Jumbled English letters hide a real word — rebuild it letter by letter across four levels with growing word counts and difficulty.",
    keywords: "anagram letters word",
  },
  {
    id: "snake", name: "Snake", href: "/snake",
    icon: GAME_ICONS.snake, color: gameIconColor("snake"), chip: "bg-green-100 dark:bg-green-950/60",
    gradient: "from-green-100 via-emerald-50 to-teal-100 dark:from-green-950/75 dark:via-emerald-950/70 dark:to-teal-950/60",
    tagline: "Eat & grow",
    desc: "Guide the classic Nokia snake to eat food and grow — four speeds and grid sizes, Kids and Adult modes, daily challenges and duels.",
    keywords: "snake eat grow classic",
  },
  {
    id: "odd-images"''')

# 5. meta descriptions
rep('"Play twelve free games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes — with daily challenges, leaderboards, guest play, and optional synced progress."',
    '"Play thirteen free games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes — with daily challenges, leaderboards, guest play, and optional synced progress."')
rep('"Play free browser-based Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes. Choose a game, join daily challenges, and play as a guest or sync progress."',
    '"Play free browser-based Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes. Choose a game, join daily challenges, and play as a guest or sync progress."')

# 6. visible levels + launch
rep('''  const launchJumble = (difficulty: JumbleDifficulty) =>
    setLocation(`/jumble?start=1&difficulty=${difficulty}`);''',
    '''  const launchJumble = (difficulty: JumbleDifficulty) =>
    setLocation(`/jumble?start=1&difficulty=${difficulty}`);
  const visibleSnakeLevels: SnakeDifficulty[] = (["easy", "medium", "hard", "expert"] as SnakeDifficulty[]).filter((level) =>
    gameMode === "children" ? SNAKE_LEVELS[level].mode === "baby" : gameMode === "adult" ? SNAKE_LEVELS[level].mode === "adult" : true,
  );
  const launchSnake = (difficulty: SnakeDifficulty) =>
    setLocation(`/snake?start=1&difficulty=${difficulty}`);''')

# 7. Mobile quick-launch section after Jumble
rep('''        {/* Odd Images quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60''',
    '''        {/* Snake quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-green-400/60 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 p-4 shadow-xl shadow-green-500/20 ring-1 ring-inset ring-white/70 dark:from-green-950/75 dark:via-emerald-950/70 dark:to-teal-950/60 dark:ring-white/10 ${matchesGame("snake") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-emerald-300/35 blur-2xl dark:bg-emerald-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-4 overflow-hidden rounded-xl border border-green-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["·", "·", "●", "·", "·", "·", "●", "·", "·", "·", "●", "·", "·", "·", "·", "·"].map((cell, index) => <span key={index} className={`flex items-center justify-center text-[10px] font-black ${cell === "●" ? "text-green-700/40 dark:text-green-200/25" : "text-emerald-700/20 dark:text-emerald-200/15"}`}>{cell}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-md"><Snake className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Snake</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-green-700 shadow-sm dark:bg-slate-950/30 dark:text-green-300">Eat &amp; grow</span></div></div><button onClick={() => setLocation("/snake")} className="rounded-full bg-green-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-green-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Guide the snake to the food before you hit a wall.</p>
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleSnakeLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleSnakeLevels.map((level) => <button key={level} onClick={() => launchSnake(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-green-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-green-700 dark:text-green-300">{SNAKE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{SNAKE_LEVELS[level].gridSize}×{SNAKE_LEVELS[level].gridSize} · {SNAKE_LEVELS[level].foods} food · {SNAKE_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</span></button>)}
          </div>
        </section>

        {/* Odd Images quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60''')

# 8. Mobile daily challenge row (px-3 py-2.5 variant)
rep('''            <button onClick={() => setLocation("/jumble-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-cyan-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40">
              <LetterText className="h-5 w-5 shrink-0 text-cyan-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Jumble Words</p><p className="text-xs text-muted-foreground">One shared word set each day</p></div><span className="shrink-0 text-sm text-cyan-500">→</span>
            </button>
            <button onClick={() => setLocation("/odd-images-challenge")}''',
    '''            <button onClick={() => setLocation("/jumble-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-cyan-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40">
              <LetterText className="h-5 w-5 shrink-0 text-cyan-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Jumble Words</p><p className="text-xs text-muted-foreground">One shared word set each day</p></div><span className="shrink-0 text-sm text-cyan-500">→</span>
            </button>
            <button onClick={() => setLocation("/snake-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-green-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-green-950/20 dark:hover:bg-green-950/40">
              <Snake className="h-5 w-5 shrink-0 text-green-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Snake</p><p className="text-xs text-muted-foreground">One shared food trail each day</p></div><span className="shrink-0 text-sm text-green-500">→</span>
            </button>
            <button onClick={() => setLocation("/odd-images-challenge")}''')

# 9. Desktop box section after jumble
rep('''            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60 bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 text-left shadow-xl shadow-teal-500/20 ring-1 ring-inset ring-white/70 transition hover:border-teal-500/80 dark:from-teal-950/75 dark:via-cyan-950/70 dark:to-sky-950/60 dark:ring-white/10 ${matchesGame("odd-images") ? "" : "hidden"}`}>''',
    '''            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-green-400/60 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 text-left shadow-xl shadow-green-500/20 ring-1 ring-inset ring-white/70 transition hover:border-green-500/80 dark:from-green-950/75 dark:via-emerald-950/70 dark:to-teal-950/60 dark:ring-white/10 ${matchesGame("snake") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-emerald-300/35 blur-2xl dark:bg-emerald-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-4 overflow-hidden rounded-xl border border-green-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["·", "·", "●", "·", "·", "·", "●", "·", "·", "·", "●", "·", "·", "·", "·", "·"].map((cell, index) => <span key={index} className={`flex items-center justify-center text-sm font-black ${cell === "●" ? "text-green-700/40 dark:text-green-200/25" : "text-emerald-700/20 dark:text-emerald-200/15"}`}>{cell}</span>)}</div>
              <button onClick={() => setLocation("/snake")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-600/10 text-green-600 ring-1 ring-green-400/20 dark:text-green-300"><Snake className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Snake</h2><p className="text-xs text-muted-foreground">Eat food, grow, don&apos;t crash</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">The classic Nokia arcade game — steer the snake to each piece of food before you hit a wall or your own tail. Four levels from a calm 12×12 up to a fast 18×18.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {visibleSnakeLevels.map((level) => <button key={level} onClick={() => launchSnake(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-green-400/20 bg-green-500/5 px-1 py-2 text-center transition-all hover:border-green-400/40 hover:bg-green-500/15"><span className="text-xs font-bold leading-none text-green-700 dark:text-green-300">{SNAKE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{SNAKE_LEVELS[level].gridSize}×{SNAKE_LEVELS[level].gridSize} · {SNAKE_LEVELS[level].foods} food · {SNAKE_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</span></button>)}
                </div>
                <button onClick={() => setLocation("/snake")} className="mt-3 text-xs font-semibold text-green-800 underline underline-offset-2 dark:text-green-200">More options</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60 bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 text-left shadow-xl shadow-teal-500/20 ring-1 ring-inset ring-white/70 transition hover:border-teal-500/80 dark:from-teal-950/75 dark:via-cyan-950/70 dark:to-sky-950/60 dark:ring-white/10 ${matchesGame("odd-images") ? "" : "hidden"}`}>''')

# 10. Desktop daily challenge row (px-4 py-3 variant)
rep('''              <button onClick={() => setLocation("/jumble-challenge")} className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40">
                <LetterText className="h-6 w-6 shrink-0 text-cyan-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Jumble Words</p><p className="text-xs text-muted-foreground">One shared word set each day</p></div><span className="shrink-0 text-sm text-cyan-500">→</span>
              </button>
              <button onClick={() => setLocation("/odd-images-challenge")}''',
    '''              <button onClick={() => setLocation("/jumble-challenge")} className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40">
                <LetterText className="h-6 w-6 shrink-0 text-cyan-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Jumble Words</p><p className="text-xs text-muted-foreground">One shared word set each day</p></div><span className="shrink-0 text-sm text-cyan-500">→</span>
              </button>
              <button onClick={() => setLocation("/snake-challenge")} className="flex items-center gap-3 rounded-xl border border-green-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-green-950/20 dark:hover:bg-green-950/40">
                <Snake className="h-6 w-6 shrink-0 text-green-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Snake</p><p className="text-xs text-muted-foreground">One shared food trail each day</p></div><span className="shrink-0 text-sm text-green-500">→</span>
              </button>
              <button onClick={() => setLocation("/odd-images-challenge")}''')

# 11. Guidance paragraph
rep('''            Play Brain Games . Online brings together twelve games that reward
            different kinds of attention.''',
    '''            Play Brain Games . Online brings together thirteen games that reward
            different kinds of attention.''')
rep('''            bigger values. Jumble Words asks you to unscramble jumbled letters
            back into real words. Odd Images asks you to find the one picture
            that does not belong in each grid. The Science, Maths, and GK
            quizzes ask you to answer timed multiple-choice questions before
            the clock runs out. All twelve can be started in a browser without
            creating an account.''',
    '''            bigger values. Jumble Words asks you to unscramble jumbled letters
            back into real words. Snake asks you to guide the classic snake to
            each piece of food before you crash. Odd Images asks you to find
            the one picture that does not belong in each grid. The Science,
            Maths, and GK quizzes ask you to answer timed multiple-choice
            questions before the clock runs out. All thirteen can be started
            in a browser without creating an account.''')

# 12. Guidance card after Jumble card
rep('''              In Jumble Words, a real English word arrives with its letters
              scrambled — rebuild it letter by letter or type it out. Rounds
              grow from 5 words on Easy to 12 on Expert, with harder vocabulary
              at every level. Stuck on one? Skip it and revisit the skipped
              words before finishing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Test yourself in the quizzes</h3>''',
    '''              In Jumble Words, a real English word arrives with its letters
              scrambled — rebuild it letter by letter or type it out. Rounds
              grow from 5 words on Easy to 12 on Expert, with harder vocabulary
              at every level. Stuck on one? Skip it and revisit the skipped
              words before finishing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Steer the classic snake</h3>
            <p className="mt-1">
              In Snake, the snake grows longer every time it eats — steer it to
              each piece of food without hitting a wall or your own tail. Easy
              and Medium suit Kids mode with slower speeds and smaller grids;
              Hard and Expert speed things up for Adult mode. Finish the food
              target quickly with few turns for the best points.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Test yourself in the quizzes</h3>''')

# 13. Link rows
rep('''          <Link href="/jumble" className="font-semibold text-primary underline-offset-2 hover:underline">
            Jumble Words setup
          </Link>
          <Link href="/quiz/science"''',
    '''          <Link href="/jumble" className="font-semibold text-primary underline-offset-2 hover:underline">
            Jumble Words setup
          </Link>
          <Link href="/snake" className="font-semibold text-primary underline-offset-2 hover:underline">
            Snake setup
          </Link>
          <Link href="/quiz/science"''')
rep('''          <Link href="/jumble-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Jumble Words challenge
          </Link>
        </div>''',
    '''          <Link href="/jumble-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Jumble Words challenge
          </Link>
          <Link href="/snake-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Snake challenge
          </Link>
        </div>''')

# 14. Mobile heading count
rep('Twelve puzzle &amp; quiz games, endlessly replayable',
    'Thirteen puzzle &amp; quiz games, endlessly replayable')

open(PATH, "w", encoding="utf-8").write(src)
print("portal.tsx patched OK")
