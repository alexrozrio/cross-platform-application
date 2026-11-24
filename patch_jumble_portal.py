import io

path = "src/pages/portal.tsx"
s = io.open(path, encoding="utf-8").read()
orig = s

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, f"NOT FOUND: {old[:80]!r} (count={s.count(old)})"
    s = s.replace(old, new, count)

# 1. lucide import LetterText
rep('  Box,\n  type LucideIcon,', '  Box,\n  LetterText,\n  type LucideIcon,')

# 2. import JUMBLE_LEVELS
rep('import { GAME_2048_LEVELS, type Game2048Difficulty } from "@/lib/game-2048";',
    'import { GAME_2048_LEVELS, type Game2048Difficulty } from "@/lib/game-2048";\nimport { JUMBLE_LEVELS, type JumbleDifficulty } from "@/lib/jumble-words";')

# 3. FEATURED_GAME_IDS
rep('"slide-puzzle", "game-2048", "odd-images"', '"slide-puzzle", "game-2048", "jumble", "odd-images"')

# 4. PORTAL_GAMES entry after game-2048 entry
rep('''    tagline: "Merge & reach 2048",
    desc: "Slide and merge numbered tiles on boards from 3×3 to 6×6. Reach the target tile before you run out of moves — daily challenges and duels included.",
    keywords: "merge numbers tiles",
  },''',
    '''    tagline: "Merge & reach 2048",
    desc: "Slide and merge numbered tiles on boards from 3×3 to 6×6. Reach the target tile before you run out of moves — daily challenges and duels included.",
    keywords: "merge numbers tiles",
  },
  {
    id: "jumble", name: "Jumble Words", href: "/jumble",
    icon: GAME_ICONS.jumble, color: gameIconColor("jumble"), chip: "bg-cyan-100 dark:bg-cyan-950/60",
    gradient: "from-cyan-100 via-sky-50 to-blue-100 dark:from-cyan-950/75 dark:via-sky-950/70 dark:to-blue-950/60",
    tagline: "Unscramble the word",
    desc: "Jumbled English letters hide a real word — rebuild it letter by letter across four levels with growing word counts and difficulty.",
    keywords: "anagram letters word",
  },''')

# 5. visible levels + launch fn
rep('''  const launchGame2048 = (difficulty: Game2048Difficulty) =>
    setLocation(`/game-2048?start=1&difficulty=${difficulty}`);''',
    '''  const launchGame2048 = (difficulty: Game2048Difficulty) =>
    setLocation(`/game-2048?start=1&difficulty=${difficulty}`);
  const visibleJumbleLevels: JumbleDifficulty[] = (["easy", "medium", "hard", "expert"] as JumbleDifficulty[]).filter((level) =>
    gameMode === "children" ? JUMBLE_LEVELS[level].mode === "baby" : gameMode === "adult" ? JUMBLE_LEVELS[level].mode === "adult" : true,
  );
  const launchJumble = (difficulty: JumbleDifficulty) =>
    setLocation(`/jumble?start=1&difficulty=${difficulty}`);''')

# 6. Mobile box-view section after 2048 section
rep('''          </div>
        </section>

        {/* Odd Images quick launch */}''',
    '''          </div>
        </section>

        {/* Jumble Words quick launch */}
        <section className={`relative isolate overflow-hidden rounded-2xl border-2 border-cyan-400/60 bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100 p-4 shadow-xl shadow-cyan-500/20 ring-1 ring-inset ring-white/70 dark:from-cyan-950/75 dark:via-sky-950/70 dark:to-blue-950/60 dark:ring-white/10 ${matchesGame("jumble") ? "" : "hidden"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-400" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-sky-300/35 blur-2xl dark:bg-sky-400/15" />
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-20 w-20 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-cyan-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["T", "A", "C", "E", "P", "O", "H", "S", "R"].map((letter, index) => <span key={index} className="flex items-center justify-center border border-cyan-400/10 text-[10px] font-black text-cyan-700/30 dark:text-cyan-200/20">{letter}</span>)}</div>
          <div className="relative z-10 flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md"><LetterText className="h-6 w-6" /></div><div><span className="block text-xl font-black leading-tight text-slate-900 dark:text-white">Jumble Words</span><span className="mt-1 inline-flex w-fit rounded-full bg-white/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-700 shadow-sm dark:bg-slate-950/30 dark:text-cyan-300">Unscramble &amp; spell</span></div></div><button onClick={() => setLocation("/jumble")} className="rounded-full bg-cyan-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-cyan-700">All options</button></div>
          <p className="relative z-10 text-[11px] font-medium leading-tight text-foreground/80">Rebuild the hidden word from jumbled letters.</p>
          <div className={`relative z-10 mt-2 grid gap-1.5 ${visibleJumbleLevels.length <= 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {visibleJumbleLevels.map((level) => <button key={level} onClick={() => launchJumble(level)} className="relative z-10 flex min-h-[58px] flex-col items-center justify-center rounded-xl border-2 border-cyan-400/35 bg-white/75 px-1 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400/65 hover:bg-white active:translate-y-0 dark:bg-slate-950/35 dark:hover:bg-slate-950/55"><span className="font-black text-sm leading-tight text-cyan-700 dark:text-cyan-300">{JUMBLE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{JUMBLE_LEVELS[level].questions} words</span></button>)}
          </div>
        </section>

        {/* Odd Images quick launch */}''')

# 7. Mobile daily challenges row after 2048 row
rep('''              <LayoutGrid className="h-5 w-5 shrink-0 text-orange-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">2048</p><p className="text-xs text-muted-foreground">One shared tile sequence each day</p></div><span className="shrink-0 text-sm text-orange-500">→</span>
            </button>''',
    '''              <LayoutGrid className="h-5 w-5 shrink-0 text-orange-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">2048</p><p className="text-xs text-muted-foreground">One shared tile sequence each day</p></div><span className="shrink-0 text-sm text-orange-500">→</span>
            </button>
            <button onClick={() => setLocation("/jumble-challenge")} className="flex w-full items-center gap-3 rounded-xl border border-cyan-200 bg-white/60 px-3 py-2.5 text-left transition-all hover:bg-white/90 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40">
              <LetterText className="h-5 w-5 shrink-0 text-cyan-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Jumble Words</p><p className="text-xs text-muted-foreground">One shared word set each day</p></div><span className="shrink-0 text-sm text-cyan-500">→</span>
            </button>''')

# 8. Desktop featured section after 2048 section
rep('''            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60 bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 text-left shadow-xl shadow-teal-500/20 ring-1 ring-inset ring-white/70 transition hover:border-teal-500/80 dark:from-teal-950/75 dark:via-cyan-950/70 dark:to-sky-950/60 dark:ring-white/10 ${matchesGame("odd-images") ? "" : "hidden"}`}>''',
    '''            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-cyan-400/60 bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100 text-left shadow-xl shadow-cyan-500/20 ring-1 ring-inset ring-white/70 transition hover:border-cyan-500/80 dark:from-cyan-950/75 dark:via-sky-950/70 dark:to-blue-950/60 dark:ring-white/10 ${matchesGame("jumble") ? "" : "hidden"}`}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-400" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-sky-300/35 blur-2xl dark:bg-sky-400/15" />
              <div aria-hidden="true" className="pointer-events-none absolute right-4 top-3 grid h-24 w-24 rotate-6 grid-cols-3 overflow-hidden rounded-xl border border-cyan-400/15 bg-white/15 opacity-60 dark:bg-white/5">{["T", "A", "C", "E", "P", "O", "H", "S", "R"].map((letter, index) => <span key={index} className="flex items-center justify-center border border-cyan-400/10 text-sm font-black text-cyan-700/25 dark:text-cyan-200/20">{letter}</span>)}</div>
              <button onClick={() => setLocation("/jumble")} className="relative z-10 block w-full space-y-4 p-6 text-left transition-all duration-200 hover:bg-white/20 dark:hover:bg-slate-950/20">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-600 ring-1 ring-cyan-400/20 dark:text-cyan-300"><LetterText className="h-8 w-8" /></span><div><h2 className="font-serif text-xl font-bold">Jumble Words</h2><p className="text-xs text-muted-foreground">Unscramble jumbled letters into words</p></div></div>
                <p className="text-sm leading-relaxed text-muted-foreground">Every round hides real English words behind shuffled letters. Rebuild each word letter by letter — four levels with growing word counts and difficulty.</p>
              </button>
              <div className="relative z-10 px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {visibleJumbleLevels.map((level) => <button key={level} onClick={() => launchJumble(level)} className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-500/5 px-1 py-2 text-center transition-all hover:border-cyan-400/40 hover:bg-cyan-500/15"><span className="text-xs font-bold leading-none text-cyan-700 dark:text-cyan-300">{JUMBLE_LEVELS[level].label}</span><span className="mt-1 text-[10px] leading-none text-muted-foreground">{JUMBLE_LEVELS[level].questions} words</span></button>)}
                </div>
                <button onClick={() => setLocation("/jumble")} className="mt-3 text-xs font-semibold text-cyan-800 underline underline-offset-2 dark:text-cyan-200">More options</button>
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"
                title="Available"
              />
            </section>
            <section className={`group relative isolate overflow-hidden rounded-2xl border-2 border-teal-400/60 bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100 text-left shadow-xl shadow-teal-500/20 ring-1 ring-inset ring-white/70 transition hover:border-teal-500/80 dark:from-teal-950/75 dark:via-cyan-950/70 dark:to-sky-950/60 dark:ring-white/10 ${matchesGame("odd-images") ? "" : "hidden"}`}>''')

# 9. Desktop daily challenges row after 2048 row
rep('''                <LayoutGrid className="h-6 w-6 shrink-0 text-orange-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">2048</p><p className="text-xs text-muted-foreground">One shared tile sequence each day</p></div><span className="shrink-0 text-sm text-orange-500">→</span>
              </button>''',
    '''                <LayoutGrid className="h-6 w-6 shrink-0 text-orange-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">2048</p><p className="text-xs text-muted-foreground">One shared tile sequence each day</p></div><span className="shrink-0 text-sm text-orange-500">→</span>
              </button>
              <button onClick={() => setLocation("/jumble-challenge")} className="flex items-center gap-3 rounded-xl border border-cyan-200 bg-white/60 px-4 py-3 text-left transition-all hover:bg-white/90 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40">
                <LetterText className="h-6 w-6 shrink-0 text-cyan-600" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Jumble Words</p><p className="text-xs text-muted-foreground">One shared word set each day</p></div><span className="shrink-0 text-sm text-cyan-500">→</span>
              </button>''')

io.open(path, "w", encoding="utf-8").write(s)
print("patched OK, delta:", len(s) - len(orig))
