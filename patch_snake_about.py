PATH = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/pages/about.tsx"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:80]!r}"
    src = src.replace(old, new, count)

# 1. lucide import
rep('LetterText } from "lucide-react";', 'LetterText, Snake } from "lucide-react";')

# 2. SNAKE_FEATURES after JUMBLE_FEATURES
rep('''const ODD_IMAGE_FEATURES = [''',
    '''const SNAKE_FEATURES = [
  { icon: Snake, label: "Four levels, growing speed", desc: "Kids mode gets the calm 12×12 and 14×14 boards; Adult mode speeds up on 16×16 and 18×18." },
  { icon: Trophy, label: "Eat and grow", desc: "The classic Nokia snake — every piece of food makes you longer, and your own tail becomes the danger." },
  { icon: Flame, label: "Daily and friend challenges", desc: "Race the same seeded food trail each day or challenge a friend head-to-head." },
  { icon: Gem, label: "Points, XP, and gems", desc: "Points reward food eaten, fast finishes, and efficient turns." },
];

const ODD_IMAGE_FEATURES = [''')

# 3. meta title + description
rep('title: "About Play Brain Games . Online | Twelve Free Games"',
    'title: "About Play Brain Games . Online | Thirteen Free Games"')
rep('"Learn how Play Brain Games combines Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes with daily challenges, guest play, synced progress, and player support."',
    '"Learn how Play Brain Games combines Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes with daily challenges, guest play, synced progress, and player support."')

# 4. tagline + intro
rep('Twelve brain games, reimagined for everyone.', 'Thirteen brain games, reimagined for everyone.')
rep('collection of Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes.',
    'collection of Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes.')

# 5. snake paragraph after jumble paragraph
rep('''          from 5 words on Easy to 12 on Expert, with harder vocabulary as the
          level rises, and skipped words can be revisited before finishing.
          Points reward accuracy, speed, and clean attempts.
        </p>
        <p>
          In Odd Images, each grid repeats one picture theme and hides a single''',
    '''          from 5 words on Easy to 12 on Expert, with harder vocabulary as the
          level rises, and skipped words can be revisited before finishing.
          Points reward accuracy, speed, and clean attempts.
        </p>
        <p>
          In Snake, steer the classic Nokia snake across the grid to eat each
          piece of food — every meal makes it longer until you run out of
          room. Boards run from a calm 12×12 Easy to a fast 18×18 Expert, with
          Kids and Adult modes controlling which speeds are offered. Points
          reward the food you eat, fast finishes, and efficient turns.
        </p>
        <p>
          In Odd Images, each grid repeats one picture theme and hides a single''')

# 6. feature section after Jumble section
rep('''      <div className="space-y-3 bg-card rounded-2xl border border-border px-5 py-4">
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
      </div>''',
    '''      <div className="space-y-3 bg-card rounded-2xl border border-border px-5 py-4">
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
          <Snake className="w-4 h-4 text-primary" /> Snake
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SNAKE_FEATURES.map(({ icon: Icon, label, desc }) => (
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
      </div>''')

# 7. daily-practice paragraph
rep('Slide Puzzle, 2048, Jumble Words, and Odd Images each have a daily\n          board, grid, or word set,',
    'Slide Puzzle, 2048, Jumble Words, Snake, and Odd Images each have a daily\n          board, grid, or word set,')

open(PATH, "w", encoding="utf-8").write(src)
print("about.tsx patched OK")
