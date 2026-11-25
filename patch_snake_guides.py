PATH = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/guides.tsx"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:80]!r}"
    src = src.replace(old, new, count)

# 1. lucide import
rep('  LetterText,\n  Puzzle,', '  LetterText,\n  Snake,\n  Puzzle,')

# 2. THEMES entry after jumble
rep('''  jumble: {
    section: "border-cyan-200/70 dark:border-cyan-900/50",
    icon: "text-cyan-700 dark:text-cyan-300",
    card: "border-cyan-200/70 bg-cyan-50/60 dark:border-cyan-900/50 dark:bg-cyan-950/20",
    btn: "bg-cyan-700 text-white hover:bg-cyan-800",
  },
  "odd-images": {''',
    '''  jumble: {
    section: "border-cyan-200/70 dark:border-cyan-900/50",
    icon: "text-cyan-700 dark:text-cyan-300",
    card: "border-cyan-200/70 bg-cyan-50/60 dark:border-cyan-900/50 dark:bg-cyan-950/20",
    btn: "bg-cyan-700 text-white hover:bg-cyan-800",
  },
  snake: {
    section: "border-green-200/70 dark:border-green-900/50",
    icon: "text-green-700 dark:text-green-300",
    card: "border-green-200/70 bg-green-50/60 dark:border-green-900/50 dark:bg-green-950/20",
    btn: "bg-green-700 text-white hover:bg-green-700",
  },
  "odd-images": {''')

# 3. nav chip
rep('''          <a href="#jumble-guide-title" className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">Jumble Words guide</a>
          <a href="#odd-images-guide-title"''',
    '''          <a href="#jumble-guide-title" className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">Jumble Words guide</a>
          <a href="#snake-guide-title" className="rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1.5 text-sm font-semibold text-green-700 dark:text-green-300">Snake guide</a>
          <a href="#odd-images-guide-title"''')

# 4. meta texts
rep('"Learn every game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes — with practical strategies and tips."',
    '"Learn every game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes — with practical strategies and tips."')
rep('details="Quizzes score on accuracy plus a speed bonus for beating the level\'s par time. Puzzle games like Sudoku, Memory, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, and Odd Images each have their own formula — the expandable \'How points are calculated\' guide on the leaderboard page lists every game\'s exact rules."',
    'details="Quizzes score on accuracy plus a speed bonus for beating the level\'s par time. Puzzle games like Sudoku, Memory, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, and Odd Images each have their own formula — the expandable \'How points are calculated\' guide on the leaderboard page lists every game\'s exact rules."')
rep('{ title: "Daily challenges", detail: "One shared puzzle or quiz per game per day — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and all three quizzes each have their own." },',
    '{ title: "Daily challenges", detail: "One shared puzzle or quiz per game per day — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and all three quizzes each have their own." },')

# 5. GuideSection after jumble
rep('''          { href: "/jumble", label: "Play Jumble Words", primary: true },
          { href: "/jumble-challenge", label: "Daily challenge" },
          { href: "/leaderboard/jumble", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="odd-images"''',
    '''          { href: "/jumble", label: "Play Jumble Words", primary: true },
          { href: "/jumble-challenge", label: "Daily challenge" },
          { href: "/leaderboard/jumble", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="snake"
        title="Snake guide"
        themeKey="snake"
        icon={Snake}
        intro={[
          "Snake is the classic Nokia arcade game reborn in the browser. Steer the snake across the grid to eat each piece of food — every meal makes it longer — and finish the round before you hit a wall or your own tail.",
          "Choose a level — Easy (12×12, 8 food), Medium (14×14, 12 food), Hard (16×16, 16 food), or Expert (18×18, 20 food). Easy and Medium suit Kids mode with slower speeds; Hard and Expert are the fast Adult challenges. Control it with arrow keys or WASD, swipe on touch screens, or use the on-screen pad.",
        ]}
        cards={[
          { title: "Easy / Medium · Kids", detail: "Smaller grids and gentler speeds — learn to plan turns early and leave room for the tail." },
          { title: "Hard / Expert · Adult", detail: "Bigger boards at high speed demand constant awareness; every wasted turn costs food." },
        ]}
        details="Points scale with the level base, food eaten, completion speed, and move efficiency — clean, quick runs earn the most. Completing a round awards XP and gems scaled by level. Daily challenges place the same food sequence for every player each day, and friend challenges compare points head-to-head."
        tips="Never turn into your own neck — check the direction behind you before committing. On Expert, hug open space and avoid boxing yourself in; the tail follows your exact path, so a tight corner early becomes a trap later. Plan two moves ahead at high speed. Try the daily challenge to race the same food trail as other players."
        links={[
          { href: "/snake", label: "Play Snake", primary: true },
          { href: "/snake-challenge", label: "Daily challenge" },
          { href: "/leaderboard/snake", label: "Leaderboard" },
        ]}
      />

      <GuideSection
        id="odd-images"''')

open(PATH, "w", encoding="utf-8").write(src)
print("guides.tsx patched OK")
