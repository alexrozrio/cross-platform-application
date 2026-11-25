PATH = "/mnt/d/Project/Cross-Platform-Game/artifacts/sudoku-game/src/lib/achievement-utils.ts"
src = open(PATH, encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    assert src.count(old) >= count, f"anchor not found: {old[:80]!r}"
    src = src.replace(old, new, count)

# 1. game union
rep("game: 'sudoku' | 'memory' | 'jigsaw' | 'word-search' | 'minesweeper' | 'slide-puzzle' | 'game-2048' | 'jumble' | 'odd-images' | 'science-quiz' | 'maths-quiz' | 'gk-quiz';",
    "game: 'sudoku' | 'memory' | 'jigsaw' | 'word-search' | 'minesweeper' | 'slide-puzzle' | 'game-2048' | 'jumble' | 'snake' | 'odd-images' | 'science-quiz' | 'maths-quiz' | 'gk-quiz';")

# 2. metadata after jumble_daily_100 entry
rep("  { id: 'jumble_daily_100', game: 'jumble', emoji: '🏅', title: 'Daily Jumble Master', description: 'Complete 100 daily Jumble Words challenges', group: 'Jumble Words Daily' },",
    """  { id: 'jumble_daily_100', game: 'jumble', emoji: '🏅', title: 'Daily Jumble Master', description: 'Complete 100 daily Jumble Words challenges', group: 'Jumble Words Daily' },
  { id: 'snake_first', game: 'snake', emoji: '🐍', title: 'First Slither', description: 'Complete your first Snake round', group: 'Snake Milestones' },
  { id: 'snake_10', game: 'snake', emoji: '🎮', title: 'Snake Regular', description: 'Complete 10 Snake rounds', group: 'Snake Milestones' },
  { id: 'snake_50', game: 'snake', emoji: '🏆', title: 'Snake Veteran', description: 'Complete 50 Snake rounds', group: 'Snake Milestones' },
  { id: 'snake_100', game: 'snake', emoji: '🌟', title: 'Snake Legend', description: 'Complete 100 Snake rounds', group: 'Snake Milestones' },
  { id: 'snake_all_levels', game: 'snake', emoji: '🌈', title: 'Speed Explorer', description: 'Win a round on all four levels', group: 'Snake Skills' },
  { id: 'snake_clean_sweep', game: 'snake', emoji: '💯', title: 'Clean Sweep', description: 'Eat every piece of food in a round', group: 'Snake Skills' },
  { id: 'snake_speed_easy', game: 'snake', emoji: '🐇', title: 'Steady Slither', description: 'Finish an Easy round in under 3 minutes', group: 'Snake Skills' },
  { id: 'snake_speed_medium', game: 'snake', emoji: '⚡', title: 'Quick Coil', description: 'Finish a Medium round in under 5 minutes', group: 'Snake Skills' },
  { id: 'snake_speed_expert', game: 'snake', emoji: '🚀', title: 'Expert Sprinter', description: 'Finish an Expert round in under 10 minutes', group: 'Snake Skills' },
  { id: 'snake_daily_7', game: 'snake', emoji: '📅', title: 'Daily Snake', description: 'Complete 7 daily Snake challenges', group: 'Snake Daily' },
  { id: 'snake_daily_30', game: 'snake', emoji: '🗓️', title: 'Daily Serpent', description: 'Complete 30 daily Snake challenges', group: 'Snake Daily' },
  { id: 'snake_daily_100', game: 'snake', emoji: '🏅', title: 'Daily Snake Master', description: 'Complete 100 daily Snake challenges', group: 'Snake Daily' },""")

open(PATH, "w", encoding="utf-8").write(src)
print("achievement-utils.ts patched OK")
