import os

ROOT = os.getcwd()

def patch(path, pairs):
    full = os.path.join(ROOT, path)
    src = open(full, encoding="utf-8").read()
    for old, new in pairs:
        n = src.count(old)
        assert n >= 1, f"{path}: anchor not found: {old[:80]!r}"
        src = src.replace(old, new)
    open(full, "w", encoding="utf-8").write(src)
    print(f"OK {path} ({len(pairs)} edits)")

# ---------- API: raise foodEaten cap for endless runs ----------
patch("../api-server/src/routes/snake-games.ts", [
    ("const safeFoodEaten = Math.min(targetFoods * 4, Math.floor(foodEaten));",
     "const safeFoodEaten = Math.min(300, Math.floor(foodEaten));"),
])

# ---------- Daily challenge page ----------
patch("src/pages/snake-challenge.tsx", [
    ("{level?.label} · {level?.gridSize}×{level?.gridSize} · {level?.foods} apples",
     "{level?.label} · {level?.gridSize}×{level?.gridSize} · endless apples"),
])

# ---------- Challenges page ----------
patch("src/pages/challenges.tsx", [
    ("{level.label} · up to {level.foods} food",
     "{level.label} · {level.gridSize}×{level.gridSize} · endless apples"),
    ("{SNAKE_LEVELS[level].label} · up to {SNAKE_LEVELS[level].foods} food · {SNAKE_LEVELS[level].mode === \"baby\" ? \"Kids\" : \"Adult\"}",
     "{SNAKE_LEVELS[level].label} · {SNAKE_LEVELS[level].gridSize}×{SNAKE_LEVELS[level].gridSize} · endless · {SNAKE_LEVELS[level].mode === \"baby\" ? \"Kids\" : \"Adult\"}"),
])

# ---------- Profile stats panel ----------
patch("src/pages/profile.tsx", [
    ("{SNAKE_LEVELS[difficulty].foods} food · {SNAKE_LEVELS[difficulty].mode",
     "endless apples · {SNAKE_LEVELS[difficulty].mode"),
    ("{bestFood} food</span>", "{bestFood} apples</span>"),
])

# ---------- Leaderboard ----------
patch("src/pages/leaderboard.tsx", [
    # combined guide table: Apples column -> Goal
    ('''<span className="text-center">Apples</span>
                <span className="text-center">Base pts</span>''',
     '''<span className="text-center">Goal</span>
                <span className="text-center">Base pts</span>'''),
    # SnakeScoringGuide level cards
    ("{item.grid} grid · {item.foods} apples", "{item.grid} grid · endless apples"),
    # XP/gems table header + cell
    ('''<span className="text-center">Gems</span><span className="text-center">Apples</span></div>''',
     '''<span className="text-center">Gems</span><span className="text-center">Goal</span></div>'''),
    ("<span className=\"text-center font-mono\">{level.foods}</span>",
     "<span className=\"text-center font-mono\">{level.foods}</span>"),  # keep value, header renamed
    # formula note: mention endless
    ("The food factor scales with apples eaten toward the level target (up to 1.0× at the target). Finishing under par time adds up to +50%.",
     "Runs are endless — the round ends only when you crash. The food factor scales with apples eaten toward the level goal (up to 1.0× at the goal). Finishing under par time adds up to +50%."),
    # combined footnote
    ("score = base × food factor (0.3 + 0.7 × apples eaten ÷ target) × (1 + time bonus up to +50%) × move-efficiency factor (70–100%) &nbsp;·&nbsp; min 10 pts.",
     "score = base × food factor (0.3 + 0.7 × apples eaten ÷ goal, capped) × (1 + time bonus up to +50%) × move-efficiency factor (70–100%) &nbsp;·&nbsp; endless run, min 10 pts."),
])

# ---------- Portal ----------
patch("src/pages/portal.tsx", [
    ("{SNAKE_LEVELS[level].gridSize}×{SNAKE_LEVELS[level].gridSize} · {SNAKE_LEVELS[level].foods} food",
     "{SNAKE_LEVELS[level].gridSize}×{SNAKE_LEVELS[level].gridSize} · endless"),
    ("steer the snake to each piece of food before you hit a wall or your own tail. Four levels from a calm 12×12 up to a fast 18×18.",
     "eat as many apples as you can before you hit a wall or your own tail — the run only ends when you crash. Four levels from a calm 12×12 up to a fast 18×18."),
    ("Snake asks you to guide the classic snake to\n            each piece of food before you crash.",
     "Snake asks you to guide the classic snake to\n            eat apples for as long as you can before you crash."),
    ("each piece of food without hitting a wall or your own tail. Easy\n              and Medium suit Kids mode with slower speeds and smaller grids;\n              Hard and Expert speed things up for Adult mode. Finish the food\n              target quickly with few turns for the best points.",
     "each apple without hitting a wall or your own tail — the run ends\n              only when you crash. Easy and Medium suit Kids mode with slower\n              speeds and smaller grids; Hard and Expert speed things up for\n              Adult mode. Survive longer and turn efficiently for the best\n              points."),
])

# ---------- Guides ----------
patch("src/pages/guides.tsx", [
    ("Steer the snake across the grid to eat each piece of food — every meal makes it longer — and finish the round before you hit a wall or your own tail.",
     "Steer the snake across the grid to eat apples for as long as you can — every meal makes it longer — and the run only ends when you hit a wall or your own tail."),
    ("Choose a level — Easy (12×12, 8 food), Medium (14×14, 12 food), Hard (16×16, 16 food), or Expert (18×18, 20 food). Easy and Medium suit Kids mode with slower speeds; Hard and Expert are the fast Adult challenges.",
     "Choose a level — Easy (12×12), Medium (14×14), Hard (16×16), or Expert (18×18). Levels differ only in grid size and speed; apples are unlimited on every level. Easy and Medium suit Kids mode with slower speeds; Hard and Expert are the fast Adult challenges."),
    ("Bigger boards at high speed demand constant awareness; every wasted turn costs food.",
     "Bigger boards at high speed demand constant awareness; every wasted turn costs score."),
    ("Start any of the twelve games immediately.", "Start any of the thirteen games immediately."),
    ("across all twelve games combined", "across all thirteen games combined"),
    ("on any of the twelve games", "on any of the thirteen games"),
])

# ---------- About ----------
patch("src/pages/about.tsx", [
    ("In Snake, steer the classic Nokia snake across the grid to eat each\n          piece of food — every meal makes it longer until you run out of\n          room. Boards run from a calm 12×12 Easy to a fast 18×18 Expert, with\n          Kids and Adult modes controlling which speeds are offered. Points\n          reward the food you eat, fast finishes, and efficient turns.",
     "In Snake, steer the classic Nokia snake across the grid to eat apples\n          for as long as you can — every meal makes it longer, and the run\n          only ends when you crash. Boards run from a calm 12×12 Easy to a\n          fast 18×18 Expert, with Kids and Adult modes controlling which\n          speeds are offered. Points reward apples eaten, fast finishes,\n          and efficient turns."),
])

# ---------- Legal / misc lists: twelve -> thirteen + add Snake ----------
GAME_LIST_OLD = "Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes"
GAME_LIST_NEW = "Sudoku, Memory Match, Jigsaw, Word Search, Minesweeper, Slide Puzzle, 2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes"

patch("src/pages/not-found.tsx", [
    ("play twelve free games — " + GAME_LIST_OLD + ".",
     "play thirteen free games — " + GAME_LIST_NEW + "."),
])
patch("src/pages/privacy-policy.tsx", [
    ("across all twelve games — " + GAME_LIST_OLD + ":",
     "across all thirteen games — " + GAME_LIST_NEW + ":"),
    ("across all twelve games — are retained", "across all thirteen games — are retained"),
])
patch("public/manifest.json", [
    ("Play twelve free games — " + GAME_LIST_OLD + " — earn achievements",
     "Play thirteen free games — " + GAME_LIST_NEW + " — earn achievements"),
])
patch("src/pages/themes.tsx", [
    ("2048, Jumble Words, Odd Images, and the quizzes.",
     "2048, Jumble Words, Snake, Odd Images, and the quizzes."),
])
patch("src/pages/terms-of-service.tsx", [
    ("2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes (\"Service\")",
     "2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes (\"Service\")"),
])

# ---------- index.html ----------
patch("index.html", [
    ("2048, Jumble Words, Odd Images, and Science, Maths & GK quizzes",
     "2048, Jumble Words, Snake, Odd Images, and Science, Maths & GK quizzes"),
])

# ---------- Prerender script ----------
patch("scripts/prerender-public.mjs", [
    ("Steer the Nokia-style snake to each piece of food before you crash — four grid sizes from 12×12 to 18×18 with Kids and Adult modes.",
     "Steer the Nokia-style snake to eat apples for as long as you can — four grid sizes from 12×12 to 18×18 with Kids and Adult modes."),
    ("Steer the classic Nokia-style snake to each piece of food across Easy, Medium, Hard, and Expert levels — with daily challenges and duels.",
     "Steer the classic Nokia-style snake to eat apples for as long as you can across Easy, Medium, Hard, and Expert levels — with daily challenges and duels."),
    ("Every piece of food makes the snake longer. Guide it across the grid without hitting a wall or your own tail.",
     "Every apple makes the snake longer. Guide it across the grid without hitting a wall or your own tail — the run only ends when you crash."),
    ("Easy runs a calm 12×12 board at 8 food, Medium a 14×14 at 12, Hard a fast 16×16 at 16, and Expert an 18×18 at 20 — your Game Mode controls which levels appear.",
     "Easy runs a calm 12×12 board, Medium a 14×14, Hard a fast 16×16, and Expert an 18×18 — apples are unlimited on every level, and your Game Mode controls which levels appear."),
    ("Points scale with the level base, food eaten, completion speed, and turn efficiency. Completing a round awards XP and gems scaled by level.",
     "Points scale with the level base, apples eaten, survival speed, and turn efficiency. Finishing a run awards XP and gems scaled by level."),
    ("Eat it all and post your score.", "Eat as many as you can and post your score."),
])

print("ALL PATCHES DONE")
