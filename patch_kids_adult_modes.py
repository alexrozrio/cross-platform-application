import io

def patch(path, pairs):
    s = io.open(path, encoding="utf-8").read()
    orig = s
    for old, new in pairs:
        assert old in s, f"{path}: NOT FOUND: {old[:90]!r}"
        s = s.replace(old, new)
    io.open(path, "w", encoding="utf-8").write(s)
    print(f"{path} patched, delta: {len(s)-len(orig)}")

MODE = 'level.mode === "baby" ? "Kids" : "Adult"'

# ── leaderboard.tsx ────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/leaderboard.tsx", [
    # combined 2048 table: add Mode column
    ("""                <span>Level</span>
                <span className="text-center">Target tile</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy · 3×3", target: 512, par: "10:00", base: 150, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium · 4×4", target: 1024, par: "25:00", base: 400, xp: 2, gems: 2, cls: "text-blue-700" },
                { label: "Hard · 5×5", target: 2048, par: "45:00", base: 900, xp: 3, gems: 3, cls: "text-yellow-700" },
                { label: "Expert · 6×6", target: 2048, par: "75:00", base: 1800, xp: 4, gems: 5, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-mono">{row.target}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}""",
     """                <span>Level</span>
                <span className="text-center">Mode</span>
                <span className="text-center">Target tile</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy · 3×3", mode: "Kids", target: 512, par: "10:00", base: 150, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium · 4×4", mode: "Kids", target: 1024, par: "25:00", base: 400, xp: 2, gems: 2, cls: "text-blue-700" },
                { label: "Hard · 5×5", mode: "Adult", target: 2048, par: "45:00", base: 900, xp: 3, gems: 3, cls: "text-yellow-700" },
                { label: "Expert · 6×6", mode: "Adult", target: 2048, par: "75:00", base: 1800, xp: 4, gems: 5, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-6 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-semibold text-muted-foreground">{row.mode}</span>
                  <span className="text-center font-mono">{row.target}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}"""),
    # header row grid-cols-5 -> 6 for 2048 table
    ("""            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Mode</span>
                <span className="text-center">Target tile</span>""",
     """            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-6 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Mode</span>
                <span className="text-center">Target tile</span>"""),
    # combined jumble table: add Mode column
    ("""                <span>Level</span>
                <span className="text-center">Words</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy", words: 5, par: "3:00", base: 300, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium", words: 8, par: "5:00", base: 650, xp: 2, gems: 2, cls: "text-blue-700" },
                { label: "Hard", words: 10, par: "7:00", base: 1300, xp: 3, gems: 3, cls: "text-yellow-700" },
                { label: "Expert", words: 12, par: "10:00", base: 2400, xp: 4, gems: 5, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-mono">{row.words}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}""",
     """                <span>Level</span>
                <span className="text-center">Mode</span>
                <span className="text-center">Words</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy", mode: "Kids", words: 5, par: "3:00", base: 300, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium", mode: "Kids", words: 8, par: "5:00", base: 650, xp: 2, gems: 2, cls: "text-blue-700" },
                { label: "Hard", mode: "Adult", words: 10, par: "7:00", base: 1300, xp: 3, gems: 3, cls: "text-yellow-700" },
                { label: "Expert", mode: "Adult", words: 12, par: "10:00", base: 2400, xp: 4, gems: 5, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-6 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-semibold text-muted-foreground">{row.mode}</span>
                  <span className="text-center font-mono">{row.words}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}"""),
    ("""            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Mode</span>
                <span className="text-center">Words</span>""",
     """            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-6 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Mode</span>
                <span className="text-center">Words</span>"""),
    # Game2048ScoringGuide level cards: add mode badge
    ("""            {[{ level: "Easy · 3×3", base: 150, par: "10:00", target: 512, gems: 1 }, { level: "Medium · 4×4", base: 400, par: "25:00", target: 1024, gems: 2 }, { level: "Hard · 5×5", base: 900, par: "45:00", target: 2048, gems: 3 }, { level: "Expert · 6×6", base: 1800, par: "75:00", target: 2048, gems: 5 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Par {item.par} · target {item.target}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}""",
     """            {[{ level: "Easy · 3×3", mode: "Kids", base: 150, par: "10:00", target: 512, gems: 1 }, { level: "Medium · 4×4", mode: "Kids", base: 400, par: "25:00", target: 1024, gems: 2 }, { level: "Hard · 5×5", mode: "Adult", base: 900, par: "45:00", target: 2048, gems: 3 }, { level: "Expert · 6×6", mode: "Adult", base: 1800, par: "75:00", target: 2048, gems: 5 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.mode} mode</p>
                <p className="mt-1 text-xs text-muted-foreground">Base {item.base.toLocaleString()} pts</p>
                <p className="text-xs text-muted-foreground">Par {item.par} · target {item.target}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}"""),
    # JumbleScoringGuide level cards: add mode badge
    ("""            {[{ level: "Easy", words: 5, par: "3:00", gems: 1 }, { level: "Medium", words: 8, par: "5:00", gems: 2 }, { level: "Hard", words: 10, par: "7:00", gems: 3 }, { level: "Expert", words: 12, par: "10:00", gems: 5 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.words} words per round</p>
                <p className="text-xs text-muted-foreground">Par {item.par}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}""",
     """            {[{ level: "Easy", mode: "Kids", words: 5, par: "3:00", gems: 1 }, { level: "Medium", mode: "Kids", words: 8, par: "5:00", gems: 2 }, { level: "Hard", mode: "Adult", words: 10, par: "7:00", gems: 3 }, { level: "Expert", mode: "Adult", words: 12, par: "10:00", gems: 5 }].map((item) => (
              <div key={item.level} className="rounded-xl border border-border bg-background p-3">
                <p className="font-bold">{item.level}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.mode} mode</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.words} words per round</p>
                <p className="text-xs text-muted-foreground">Par {item.par}</p>
                <p className="text-xs text-muted-foreground">{item.gems} 💎</p>
              </div>
            ))}"""),
])

# ── game-2048.tsx pickers ──────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/game-2048.tsx", [
    ('<span className="text-[10px] leading-tight text-muted-foreground">{level.size}×{level.size} · target {level.targetTile}</span>',
     '<span className="text-[10px] leading-tight text-muted-foreground">{level.size}×{level.size} · target {level.targetTile} · {level.mode === "baby" ? "Kids" : "Adult"}</span>'),
])

# ── jumble.tsx pickers ─────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/jumble.tsx", [
    ('<span className="mt-0.5 block text-xs text-muted-foreground">{level.questions} words</span>',
     '<span className="mt-0.5 block text-xs text-muted-foreground">{level.questions} words · {level.mode === "baby" ? "Kids" : "Adult"}</span>'),
])

# ── portal.tsx buttons (mobile + desktop) ──────────────────────
patch("artifacts/sudoku-game/src/pages/portal.tsx", [
    ('<span className="mt-1 text-[10px] leading-none text-muted-foreground">{GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · {GAME_2048_LEVELS[level].targetTile}</span>',
     '<span className="mt-1 text-[10px] leading-none text-muted-foreground">{GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · {GAME_2048_LEVELS[level].targetTile} · {GAME_2048_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</span>'),
    ('<span className="mt-1 text-[10px] leading-none text-muted-foreground">{JUMBLE_LEVELS[level].questions} words</span>',
     '<span className="mt-1 text-[10px] leading-none text-muted-foreground">{JUMBLE_LEVELS[level].questions} words · {JUMBLE_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}</span>'),
])

# ── challenges.tsx SelectItems ─────────────────────────────────
patch("artifacts/sudoku-game/src/pages/challenges.tsx", [
    ('{GAME_2048_LEVELS[level].label} · {GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · target {GAME_2048_LEVELS[level].targetTile}',
     '{GAME_2048_LEVELS[level].label} · {GAME_2048_LEVELS[level].size}×{GAME_2048_LEVELS[level].size} · target {GAME_2048_LEVELS[level].targetTile} · {GAME_2048_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}'),
    ('{JUMBLE_LEVELS[level].label} · {JUMBLE_LEVELS[level].questions} words',
     '{JUMBLE_LEVELS[level].label} · {JUMBLE_LEVELS[level].questions} words · {JUMBLE_LEVELS[level].mode === "baby" ? "Kids" : "Adult"}'),
])

# ── profile.tsx stats panels ───────────────────────────────────
patch("artifacts/sudoku-game/src/pages/profile.tsx", [
    ('<span className="font-medium">{GAME_2048_LEVELS[difficulty].label} · {GAME_2048_LEVELS[difficulty].size}×{GAME_2048_LEVELS[difficulty].size}</span>',
     '<span className="font-medium">{GAME_2048_LEVELS[difficulty].label} · {GAME_2048_LEVELS[difficulty].size}×{GAME_2048_LEVELS[difficulty].size} · {GAME_2048_LEVELS[difficulty].mode === "baby" ? "Kids" : "Adult"}</span>'),
    ('<span className="font-medium">{JUMBLE_LEVELS[difficulty].label} · {JUMBLE_LEVELS[difficulty].questions} words</span>',
     '<span className="font-medium">{JUMBLE_LEVELS[difficulty].label} · {JUMBLE_LEVELS[difficulty].questions} words · {JUMBLE_LEVELS[difficulty].mode === "baby" ? "Kids" : "Adult"}</span>'),
])

# ── guides.tsx ─────────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/guides.tsx", [
    ('{ title: "Easy / Medium", detail: "3×3 and 4×4 boards — fewer tiles to track, ideal for learning merge patterns and corner strategy." },\n          { title: "Hard", detail: "The 5×5 board is a marathon — you need a clear lane plan and patience to reach 2048." },\n          { title: "Expert", detail: "6×6 gives you room to breathe but demands long-term planning; keep one corner open for your biggest tiles." },',
     '{ title: "Easy / Medium · Kids", detail: "3×3 and 4×4 boards — fewer tiles to track, ideal for learning merge patterns and corner strategy." },\n          { title: "Hard / Expert · Adult", detail: "5×5 and 6×6 boards are a marathon — they need a clear lane plan and patience to reach the target tile." },'),
    ('{ title: "Easy / Medium", detail: "Short everyday words — great for warming up your anagram eye and building speed." },\n          { title: "Hard", detail: "Ten medium-length words with trickier letter patterns; planning a few letters ahead pays off." },\n          { title: "Expert", detail: "Twelve long vocabulary words — the toughest scramble set, best saved for a focused run." },',
     '{ title: "Easy / Medium · Kids", detail: "Short everyday words — great for warming up your anagram eye and building speed." },\n          { title: "Hard / Expert · Adult", detail: "Ten to twelve longer words with trickier letter patterns; planning a few letters ahead pays off." },'),
])

# ── about.tsx feature descs ────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/about.tsx", [
    ('{ icon: Grid3x3, label: "Four board sizes", desc: "From a quick 3×3 warm-up to the demanding 6×6 Expert board." },',
     '{ icon: Grid3x3, label: "Four board sizes", desc: "Kids mode gets the 3×3 and 4×4 boards; Adult mode unlocks the demanding 5×5 and 6×6." },'),
    ('{ icon: LetterText, label: "Four levels, growing rounds", desc: "Easy deals 5 words and Expert deals 12 — with harder vocabulary at every step." },',
     '{ icon: LetterText, label: "Four levels, growing rounds", desc: "Kids mode deals 5–8 everyday words; Adult mode steps up to 10–12 harder ones." },'),
])

print("ALL PATCHES DONE")
