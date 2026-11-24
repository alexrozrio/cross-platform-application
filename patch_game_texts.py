import io, re

def patch(path, pairs):
    s = io.open(path, encoding="utf-8").read()
    orig = s
    for item in pairs:
        old, new = item[0], item[1]
        count = item[2] if len(item) > 2 else 1
        assert old in s, f"{path}: NOT FOUND: {old[:90]!r}"
        s = s.replace(old, new, count)
    io.open(path, "w", encoding="utf-8").write(s)
    print(f"{path} patched, delta: {len(s)-len(orig)}")

GAME_LIST_NEW = "Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes"
GAME_LIST_NEW_NO_OI = "Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, and Odd Images"

# ── portal.tsx ─────────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/portal.tsx", [
    ('"Play ten free games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and Science, Maths & GK quizzes — with daily challenges, leaderboards, guest play, and optional synced progress."',
     f'"Play twelve free games — {GAME_LIST_NEW} — with daily challenges, leaderboards, guest play, and optional synced progress."'),
    ('"Play free browser-based Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and Science, Maths & GK quizzes. Choose a game, join daily challenges, and play as a guest or sync progress."',
     f'"Play free browser-based {GAME_LIST_NEW}. Choose a game, join daily challenges, and play as a guest or sync progress."'),
    ("Ten puzzle &amp; quiz games, endlessly replayable",
     "Twelve puzzle &amp; quiz games, endlessly replayable"),
    ("""            Play Brain Games . Online brings together ten games that reward
            different kinds of attention. Sudoku asks you to compare rows,
            columns, and boxes before placing a symbol. Memory Match asks you to
            remember where cards appeared. Jigsaw asks you to rebuild a picture
            piece by piece. Word Search asks you to spot hidden words inside a
            letter grid. Minesweeper asks you to clear every safe cell without
            touching a mine. Slide Puzzle asks you to slide every tile back
            into order. Odd Images asks you to find the one picture that does
            not belong in each grid. The Science, Maths, and GK quizzes ask you
            to answer timed multiple-choice questions before the clock runs out.
            All ten can be started in a browser without creating an account.""",
     """            Play Brain Games . Online brings together twelve games that reward
            different kinds of attention. Sudoku asks you to compare rows,
            columns, and boxes before placing a symbol. Memory Match asks you to
            remember where cards appeared. Jigsaw asks you to rebuild a picture
            piece by piece. Word Search asks you to spot hidden words inside a
            letter grid. Minesweeper asks you to clear every safe cell without
            touching a mine. Slide Puzzle asks you to slide every tile back
            into order. 2048 asks you to merge numbered tiles into bigger and
            bigger values. Jumble Words asks you to unscramble jumbled letters
            back into real words. Odd Images asks you to find the one picture
            that does not belong in each grid. The Science, Maths, and GK
            quizzes ask you to answer timed multiple-choice questions before
            the clock runs out. All twelve can be started in a browser without
            creating an account."""),
    # add 2048 + Jumble guidance cards after the Slide Puzzle card
    ("""          <div>
            <h3 className="font-semibold text-foreground">Test yourself in the quizzes</h3>""",
     """          <div>
            <h3 className="font-semibold text-foreground">Merge tiles in 2048</h3>
            <p className="mt-1">
              In 2048, slide numbered tiles across the grid to merge matching
              values — every merge builds a bigger number. Boards come in 3×3,
              4×4, 5×5, and 6×6, and each board has its own target tile to
              reach. Finish quickly with efficient moves for the best score.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Unscramble words in Jumble</h3>
            <p className="mt-1">
              In Jumble Words, a real English word arrives with its letters
              scrambled — rebuild it letter by letter or type it out. Rounds
              grow from 5 words on Easy to 12 on Expert, with harder vocabulary
              at every level. Stuck on one? Skip it and revisit the skipped
              words before finishing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Test yourself in the quizzes</h3>"""),
    # setup links
    ("""          <Link href="/slide-puzzle" className="font-semibold text-primary underline-offset-2 hover:underline">
            Slide Puzzle setup
          </Link>""",
     """          <Link href="/slide-puzzle" className="font-semibold text-primary underline-offset-2 hover:underline">
            Slide Puzzle setup
          </Link>
          <Link href="/game-2048" className="font-semibold text-primary underline-offset-2 hover:underline">
            2048 setup
          </Link>
          <Link href="/jumble" className="font-semibold text-primary underline-offset-2 hover:underline">
            Jumble Words setup
          </Link>"""),
    # daily challenge links
    ("""          <Link href="/slide-puzzle-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Slide Puzzle challenge
          </Link>""",
     """          <Link href="/slide-puzzle-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Slide Puzzle challenge
          </Link>
          <Link href="/game-2048-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s 2048 challenge
          </Link>
          <Link href="/jumble-challenge" className="font-semibold text-primary underline-offset-2 hover:underline">
            Try today’s Jumble Words challenge
          </Link>"""),
])

# ── about.tsx ──────────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/about.tsx", [
    ('import { ArrowLeft, Hash, Type, Palette, Trophy, Flame, BarChart2, Gem, Grid3x3, Brain, Puzzle, Search, Sparkles, Bomb, Grid2x2, Images, FlaskConical, Timer, Swords } from "lucide-react";',
     'import { ArrowLeft, Hash, Type, Palette, Trophy, Flame, BarChart2, Gem, Grid3x3, Brain, Puzzle, Search, Sparkles, Bomb, Grid2x2, Images, FlaskConical, Timer, Swords, LetterText } from "lucide-react";'),
    ("""const ODD_IMAGE_FEATURES = [""",
     """const GAME_2048_FEATURES = [
  { icon: Grid3x3, label: "Four board sizes", desc: "From a quick 3×3 warm-up to the demanding 6×6 Expert board." },
  { icon: Trophy, label: "Chase the target tile", desc: "Reach 512 on 3×3 up to 2048 on the larger boards — then keep merging for a higher max tile." },
  { icon: Flame, label: "Daily challenge", desc: "One shared seed each day — every player gets the same opening tiles." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Points reward your max tile, fast finishes, and efficient moves." },
];

const JUMBLE_FEATURES = [
  { icon: LetterText, label: "Four levels, growing rounds", desc: "Easy deals 5 words and Expert deals 12 — with harder vocabulary at every step." },
  { icon: Type, label: "Unscramble the letters", desc: "Jumbled letters hide a real English word — rebuild it letter by letter or type it out." },
  { icon: Flame, label: "Daily and friend challenges", desc: "Solve the same shared word set each day or challenge a friend head-to-head." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Points reward accuracy, speed, and fewer wrong attempts." },
];

const ODD_IMAGE_FEATURES = ["""),
    ('title: "About Play Brain Games . Online | Ten Free Games"',
     'title: "About Play Brain Games . Online | Twelve Free Games"'),
    ('"Learn how Play Brain Games combines Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and Science, Maths & GK quizzes with daily challenges, guest play, synced progress, and player support."',
     f'"Learn how Play Brain Games combines {GAME_LIST_NEW} with daily challenges, guest play, synced progress, and player support."'),
    ("Ten brain games, reimagined for everyone.",
     "Twelve brain games, reimagined for everyone."),
    ("Play Brain Games . Online is a general-audience, family-friendly collection of Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and Science, Maths & GK quiz games.",
     f"Play Brain Games . Online is a general-audience, family-friendly collection of {GAME_LIST_NEW}."),
    # paragraphs for 2048 + Jumble after Slide Puzzle paragraph
    ("""          solves against each board&apos;s par target.
        </p>
        <p>
          In Odd Images,""",
     """          solves against each board&apos;s par target.
        </p>
        <p>
          In 2048, slide numbered tiles across the grid to merge matching
          values — every merge builds a bigger number. Boards run from a quick
          3×3 Easy to a demanding 6×6 Expert, and each board has its own target
          tile to reach. Points reward the highest tile you achieve, fast
          finishes, and efficient moves.
        </p>
        <p>
          In Jumble Words, a real English word arrives with its letters
          scrambled — rearrange them back into the hidden word. Rounds grow
          from 5 words on Easy to 12 on Expert, with harder vocabulary as the
          level rises, and skipped words can be revisited before finishing.
          Points reward accuracy, speed, and clean attempts.
        </p>
        <p>
          In Odd Images,"""),
    # feature sections after Slide Puzzle section, before Odd Images section
    ("""      <div className="space-y-3 bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Images className="w-4 h-4 text-primary" /> Odd Images
        </h2>""",
     """      <div className="space-y-3 bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 text-primary" /> 2048
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {GAME_2048_FEATURES.map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="border-border/60">
              <CardContent className="pt-4 pb-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3 bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <LetterText className="w-4 h-4 text-primary" /> Jumble Words
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {JUMBLE_FEATURES.map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="border-border/60">
              <CardContent className="pt-4 pb-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3 bg-card rounded-2xl border border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Images className="w-4 h-4 text-primary" /> Odd Images
        </h2>"""),
    # daily practice paragraph
    ("""          Search share a daily puzzle plus friend challenges, Minesweeper,
          Slide Puzzle, and Odd Images each have a daily board or grid, and the
          Science, Maths &amp; GK quizzes each post a shared daily quiz.""",
     """          Search share a daily puzzle plus friend challenges, Minesweeper,
          Slide Puzzle, 2048, Jumble Words, and Odd Images each have a daily
          board, grid, or word set, and the Science, Maths &amp; GK quizzes
          each post a shared daily quiz."""),
])

# ── challenges.tsx ──────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/challenges.tsx", [
    ('"Create and join challenges for any of the ten games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and the Science, Maths & GK quizzes — compare scores, and compete with friends."',
     f'"Create and join challenges for any of the twelve games — {GAME_LIST_NEW} — compare scores, and compete with friends."'),
    ("Challenge another player in any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, or the Science, Maths & GK quizzes. Winner takes 10 gems!",
     "Challenge another player in any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, or the Science, Maths & GK quizzes. Winner takes 10 gems!"),
    ("select any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, or a quiz — to challenge another player on the same puzzle or questions.",
     "select any game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, or a quiz — to challenge another player on the same puzzle or questions."),
])

# ── guides.tsx ─────────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/guides.tsx", [
    ('"Learn every game — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and the Science, Maths & GK quizzes — with practical strategies and tips."',
     f'"Learn every game — {GAME_LIST_NEW} — with practical strategies and tips."'),
    ('"Start any of the ten games immediately. Progress is kept in the browser until you sign in."',
     '"Start any of the twelve games immediately. Progress is kept in the browser until you sign in."'),
    ('"Adult & 4 All", detail: "Adult mode offers the larger boards and harder levels; the default 4 All mode shows every size and level for every game."',
     '"Adult & 4 All", detail: "Adult mode offers the larger boards and harder levels; the default 4 All mode shows every size and level for every game."'),
    ('Puzzle games like Sudoku, Memory, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and Odd Images each have their own formula',
     'Puzzle games like Sudoku, Memory, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, and Odd Images each have their own formula'),
    ('Leaderboards rank players on weekly, monthly, and all-time boards — per game and across all ten games combined.',
     'Leaderboards rank players on weekly, monthly, and all-time boards — per game and across all twelve games combined.'),
    ('One shared puzzle or quiz per game per day — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and all three quizzes each have their own.',
     'One shared puzzle or quiz per game per day — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and all three quizzes each have their own.'),
    ('Challenge another player to the same round on any of the ten games — the higher score wins bonus gems.',
     'Challenge another player to the same round on any of the twelve games — the higher score wins bonus gems.'),
])

# ── leaderboard.tsx ────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/leaderboard.tsx", [
    ("Complete games in any title — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, or the quizzes — to earn points and climb the rankings!",
     "Complete games in any title — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, or the quizzes — to earn points and climb the rankings!"),
    # insert 2048 + Jumble base-point tables between Slide Puzzle and Odd Images blocks
    ("""          {/* Odd Images base points table */}""",
     """          {/* 2048 base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🔢 2048 — base points × board size
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Target tile</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy · 3×3", target: 512, par: "10:00", base: 300, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium · 4×4", target: 1024, par: "25:00", base: 700, xp: 2, gems: 2, cls: "text-blue-700" },
                { label: "Hard · 5×5", target: 2048, par: "45:00", base: 1500, xp: 3, gems: 3, cls: "text-yellow-700" },
                { label: "Expert · 6×6", target: 2048, par: "75:00", base: 3000, xp: 4, gems: 5, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-mono">{row.target}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              score = base × tile factor (log-scaled to the target tile, up to 1.5×) × (1 + time bonus up to +50%) × move factor &nbsp;·&nbsp; move factor scales 70–100% toward the par move count, min 10 pts. Higher max tiles always score more.
            </p>
          </div>

          {/* Jumble Words base points table */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              🔤 Jumble Words — base points × level
            </p>
            <div className="rounded-xl border overflow-hidden text-xs">
              <div className="grid grid-cols-5 bg-muted-foreground/15 text-[10px] font-semibold text-muted-foreground px-3 py-2">
                <span>Level</span>
                <span className="text-center">Words</span>
                <span className="text-center">Par time</span>
                <span className="text-center">Base pts</span>
                <span className="text-center">XP · Gems</span>
              </div>
              {[
                { label: "Easy", words: 5, par: "3:00", base: 150, xp: 1, gems: 1, cls: "text-green-700" },
                { label: "Medium", words: 8, par: "5:00", base: 400, xp: 2, gems: 2, cls: "text-blue-700" },
                { label: "Hard", words: 10, par: "7:00", base: 800, xp: 3, gems: 3, cls: "text-yellow-700" },
                { label: "Expert", words: 12, par: "10:00", base: 1600, xp: 4, gems: 5, cls: "text-orange-700" },
              ].map((row, i) => (
                <div key={row.label} className={`grid grid-cols-5 px-3 py-2 text-xs ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                  <span className={`font-semibold ${row.cls}`}>{row.label}</span>
                  <span className="text-center font-mono">{row.words}</span>
                  <span className="text-center font-mono">{row.par}</span>
                  <span className="text-center font-mono">{row.base.toLocaleString()}</span>
                  <span className="text-center font-mono">{row.xp} XP · {row.gems}💎</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              score = base × accuracy factor (0.3 + 0.7 × correct ÷ questions) × (1 + time bonus up to +50%) × attempt factor &nbsp;·&nbsp; attempt factor scales 70–100% with fewer wrong guesses, min 10 pts.
            </p>
          </div>

          {/* Odd Images base points table */}"""),
])

# ── not-found.tsx ──────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/not-found.tsx", [
    ("Return to Play Brain Games . Online to play ten free games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and Science, Maths & GK quizzes.",
     f"Return to Play Brain Games . Online to play twelve free games — {GAME_LIST_NEW}."),
])

# ── privacy-policy.tsx ─────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/privacy-policy.tsx", [
    ("We also store game-related data you create across all ten games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and the Science, Maths & GK quizzes:",
     f"We also store game-related data you create across all twelve games — {GAME_LIST_NEW}:"),
    ("Your profile and game history — including activity across all ten games — are retained while your account is active.",
     "Your profile and game history — including activity across all twelve games — are retained while your account is active."),
])

# ── profile.tsx ────────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/profile.tsx", [
    ('"Review your progress, personal bests, achievements, and game preferences across all ten games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and the quizzes."',
     '"Review your progress, personal bests, achievements, and game preferences across all twelve games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and the quizzes."'),
])

# ── terms-of-service.tsx ───────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/terms-of-service.tsx", [
    ("By accessing or using Play Brain Games . Online, including the Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, Odd Images, and Science, Maths & GK quiz games (\"Service\"), you agree to be bound by these Terms.",
     f"By accessing or using Play Brain Games . Online, including the {GAME_LIST_NEW} (\"Service\"), you agree to be bound by these Terms."),
])

# ── themes.tsx ─────────────────────────────────────────────────
patch("artifacts/sudoku-game/src/pages/themes.tsx", [
    ("Personalise your games with curated colour palettes, system-provided backgrounds, fonts, and image-symbol sets used across Sudoku, Memory Match, Jigsaw, Word Search, Slide Puzzle, Odd Images, and the quizzes.",
     "Personalise your games with curated colour palettes, system-provided backgrounds, fonts, and image-symbol sets used across Sudoku, Memory Match, Jigsaw, Word Search, Slide Puzzle, 2048, Jumble Words, Odd Images, and the quizzes."),
])

# ── index.html ─────────────────────────────────────────────────
patch("artifacts/sudoku-game/index.html", [
    ("free Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and Science, Maths & GK quizzes",
     f"free {GAME_LIST_NEW}", 3),
    ("collection of Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and Science, Maths & GK quiz games",
     "collection of Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quiz games"),
])

# ── manifest.json ──────────────────────────────────────────────
patch("artifacts/sudoku-game/public/manifest.json", [
    ('"description": "Play nine free games — Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, and Science, Maths & GK quizzes — earn achievements, and compete on the leaderboard."',
     f'"description": "Play twelve free games — {GAME_LIST_NEW} — earn achievements, and compete on the leaderboard."'),
])

print("ALL PATCHES DONE")
