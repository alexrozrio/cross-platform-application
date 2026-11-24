import io

p = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/guides.tsx"
s = io.open(p, encoding="utf-8").read()
orig = s
NL = chr(10)

def rep(old, new, count=1):
    global s
    assert s.count(old) >= count, "NOT FOUND: " + repr(old[:90]) + " count=" + str(s.count(old))
    s = s.replace(old, new, count)

# 1. Import LayoutGrid
rep(
  '  Images,\n  Puzzle,',
  '  Images,\n  LayoutGrid,\n  Puzzle,'
)

# 2. Theme entry — after slide-puzzle theme, before odd-images
rep(
  '''  "odd-images": {
    section: "border-teal-200/70 dark:border-teal-900/50",''',
  '''  "game-2048": {
    section: "border-orange-200/70 dark:border-orange-900/50",
    icon: "text-orange-700 dark:text-orange-300",
    card: "border-orange-200/70 bg-orange-50/60 dark:border-orange-900/50 dark:bg-orange-950/20",
    btn: "bg-orange-700 text-white hover:bg-orange-800",
  },
  "odd-images": {
    section: "border-teal-200/70 dark:border-teal-900/50",'''
)

# 3. Nav chip — after Slide Puzzle chip
rep(
  '''          <a href="#slide-puzzle-guide-title" className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-sm font-semibold text-sky-700 dark:text-sky-300">Slide Puzzle guide</a>''',
  '''          <a href="#slide-puzzle-guide-title" className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-sm font-semibold text-sky-700 dark:text-sky-300">Slide Puzzle guide</a>
          <a href="#game-2048-guide-title" className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-700 dark:text-orange-300">2048 guide</a>'''
)

# 4. GuideSection — after slide-puzzle section, before odd-images
rep(
  '''      <GuideSection
        id="odd-images"''',
  '''      <GuideSection
        id="game-2048"
        title="2048 guide"
        themeKey="game-2048"
        icon={LayoutGrid}
        intro={[
          "2048 is a merge puzzle: every move slides all tiles toward one edge, equal tiles merge into their double, and a new tile spawns after each move. Build the highest tile you can before the board fills up. Choose a board size — Easy (3×3), Medium (4×4), Hard (5×5), or Expert (6×6) — where the target tile grows with the board.",
          "Swipe on touch screens, drag with a mouse, use the arrow pad, or press the arrow keys / WASD on a keyboard. Undo is available a limited number of times per game. Reaching the level target wins the game, but you can keep playing to push your highest tile even further.",
        ]}
        cards={[
          { title: "Easy / Medium", detail: "3×3 and 4×4 boards — fewer tiles to track, ideal for learning merge patterns and corner strategy." },
          { title: "Hard", detail: "The 5×5 board is a marathon — you need a clear lane plan and patience to reach 2048." },
          { title: "Expert", detail: "6×6 gives you room to breathe but demands long-term planning; keep one corner open for your biggest tiles." },
        ]}
        details="Points reward your highest tile combined with speed and move efficiency — big merges and fast finishes earn more. Completing a game awards XP and gems scaled by the board size. Daily challenges give every player the same starting board each day, and friend challenges compare points head-to-head."
        tips="Keep your largest tiles locked in one corner and build a snake pattern along the edges. Never fill your escape lane — always leave at least one row or column open so you can shuffle tiles back into position. On bigger boards, merge small tiles in the middle rows early so they do not crowd your main line. Try the daily challenge to race the same board as other players."
        links={[
          { href: "/game-2048", label: "Play 2048", primary: true },
          { href: "/game-2048-challenge", label: "Daily challenge" },
          { href: "/leaderboard/game-2048", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="odd-images"'''
)

assert s != orig
io.open(p, "w", encoding="utf-8").write(s)
print("guides.tsx patched OK")
