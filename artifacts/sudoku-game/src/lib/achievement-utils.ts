export interface AchievementMeta {
  id: string;
  emoji: string;
  title: string;
  description: string;
  group: string;
  game: 'sudoku' | 'memory' | 'jigsaw' | 'word-search' | 'minesweeper' | 'slide-puzzle' | 'science-quiz' | 'maths-quiz' | 'gk-quiz';
}

const QUIZ_SUBJECT_ACHIEVEMENTS = [
  { subject: 'science', game: 'science-quiz', label: 'Science' },
  { subject: 'maths', game: 'maths-quiz', label: 'Maths' },
  { subject: 'gk', game: 'gk-quiz', label: 'GK' },
] as const;

export const ACHIEVEMENT_META: AchievementMeta[] = [
  // ── Sudoku: Volume ─────────────────────────────────────────────────────────
  { id: 'first_win',        game: 'sudoku', emoji: '🎉', title: 'First Win',         description: 'Complete your first Sudoku puzzle',                      group: 'Milestones' },
  { id: 'dedicated',        game: 'sudoku', emoji: '📚', title: 'Dedicated',          description: 'Complete 10 Sudoku puzzles',                              group: 'Milestones' },
  { id: 'half_century',     game: 'sudoku', emoji: '🎯', title: 'Half Century',       description: 'Complete 50 Sudoku puzzles',                              group: 'Milestones' },
  { id: 'century',          game: 'sudoku', emoji: '💯', title: 'Century',            description: 'Complete 100 Sudoku puzzles',                             group: 'Milestones' },
  { id: 'double_century',   game: 'sudoku', emoji: '🎖️', title: 'Double Century',     description: 'Complete 200 Sudoku puzzles',                             group: 'Milestones' },
  { id: 'legend',           game: 'sudoku', emoji: '🌟', title: 'Legend',             description: 'Complete 500 Sudoku puzzles',                             group: 'Milestones' },
  // ── Sudoku: Grid Explorer ──────────────────────────────────────────────────
  { id: 'baby_steps',       game: 'sudoku', emoji: '👶', title: 'Baby Steps',         description: 'Complete 3 3×3 Baby puzzles',                             group: 'Grid Explorer' },
  { id: 'mini_master',      game: 'sudoku', emoji: '🎮', title: 'Mini Master',        description: 'Complete 3 4×4 Mini puzzles',                             group: 'Grid Explorer' },
  { id: 'dual_master',      game: 'sudoku', emoji: '⚔️', title: 'Dual Master',       description: 'Complete 3 6×6 Dual puzzles',                             group: 'Grid Explorer' },
  { id: 'classic_champ',    game: 'sudoku', emoji: '🏆', title: 'Classic Champ',      description: 'Complete 3 9×9 Classic puzzles',                          group: 'Grid Explorer' },
  { id: 'pro_player',       game: 'sudoku', emoji: '👑', title: 'Pro Player',         description: 'Complete 3 16×16 Pro puzzles',                            group: 'Grid Explorer' },
  { id: 'all_grids',        game: 'sudoku', emoji: '🗺️', title: 'World Explorer',    description: 'Complete 3 puzzles at each of the five grid sizes',       group: 'Grid Explorer' },
  // ── Sudoku: Difficulty ─────────────────────────────────────────────────────
  { id: 'medium_solver',    game: 'sudoku', emoji: '🧩', title: 'Medium Solver',      description: 'Complete 3 Medium puzzles',                               group: 'Difficulty' },
  { id: 'hard_solver',      game: 'sudoku', emoji: '🔥', title: 'Hard Solver',        description: 'Complete 5 Hard puzzles',                                 group: 'Difficulty' },
  { id: 'expert_solver',    game: 'sudoku', emoji: '🏅', title: 'Expert Solver',      description: 'Complete 10 Expert puzzles',                              group: 'Difficulty' },
  { id: 'all_difficulties', game: 'sudoku', emoji: '🌈', title: 'All Rounder',        description: 'Complete 3 puzzles at each difficulty',                  group: 'Difficulty' },
  { id: 'expert_5',         game: 'sudoku', emoji: '🥇', title: 'Expert Regular',     description: 'Complete 5 Expert puzzles',                               group: 'Difficulty' },
  { id: 'flawless_expert',  game: 'sudoku', emoji: '💎', title: 'Flawless Expert',    description: 'Complete 3 Expert puzzles with zero mistakes',            group: 'Difficulty' },
  { id: 'flawless_hard',    game: 'sudoku', emoji: '🔶', title: 'Iron Will',          description: 'Complete 3 Hard puzzles with zero mistakes',              group: 'Difficulty' },
  // ── Sudoku: Skill ──────────────────────────────────────────────────────────
  { id: 'perfectionist',    game: 'sudoku', emoji: '✨', title: 'Perfectionist',      description: 'Finish 3 Sudoku puzzles with zero mistakes',              group: 'Skill'      },
  { id: 'perfectionist_5',  game: 'sudoku', emoji: '💫', title: 'Error Free',         description: 'Finish 5 puzzles with zero mistakes',                     group: 'Skill'      },
  { id: 'no_hints',         game: 'sudoku', emoji: '🧠', title: 'No Hints',           description: 'Finish 5 Sudoku puzzles without using hints',             group: 'Skill'      },
  { id: 'no_hints_10',      game: 'sudoku', emoji: '🎓', title: 'Self Reliant',       description: 'Complete 10 puzzles without using any hints',             group: 'Skill'      },
  { id: 'hint_free_hard',   game: 'sudoku', emoji: '🧘', title: 'Pure Hard',          description: 'Complete 3 Hard puzzles without using hints',             group: 'Skill'      },
  { id: 'hint_free_expert', game: 'sudoku', emoji: '🏹', title: 'Pure Expert',        description: 'Complete 3 Expert puzzles without using hints',           group: 'Skill'      },
  { id: 'big_brain',        game: 'sudoku', emoji: '🧬', title: 'Big Brain',          description: 'Complete 3 Expert 9×9 puzzles with no mistakes or hints', group: 'Skill'      },
  { id: 'comeback_kid',     game: 'sudoku', emoji: '🔄', title: 'Comeback Kid',       description: 'Finish 3 puzzles after making exactly 2 mistakes',        group: 'Skill'      },
  { id: 'speed_demon',      game: 'sudoku', emoji: '⚡', title: 'Speed Demon',        description: 'Finish 3 Sudoku puzzles in under 5 minutes each',        group: 'Skill'      },
  { id: 'lightning',        game: 'sudoku', emoji: '🌩️', title: 'Lightning',         description: 'Finish 5 Sudoku puzzles in under 2 minutes each',        group: 'Skill'      },
  { id: 'speed_4x4',        game: 'sudoku', emoji: '🐇', title: 'Mini Speedster',     description: 'Finish 3 4×4 puzzles in under 60 seconds each',           group: 'Skill'      },
  { id: 'speed_expert',     game: 'sudoku', emoji: '🚀', title: 'Expert Sprinter',    description: 'Finish 3 Expert puzzles in under 10 minutes each',        group: 'Skill'      },
  { id: 'speed_16x16',      game: 'sudoku', emoji: '🛸', title: 'Pro Speedrun',       description: 'Finish 3 16×16 puzzles in under 15 minutes each',        group: 'Skill'      },
  // ── Sudoku: Daily ──────────────────────────────────────────────────────────
  { id: 'daily_devotion',   game: 'sudoku', emoji: '📅', title: 'Daily Devotion',     description: 'Complete 7 daily challenges',                             group: 'Daily'      },
  { id: 'daily_faithful',   game: 'sudoku', emoji: '🗓️', title: 'Daily Faithful',     description: 'Complete 30 daily challenges',                            group: 'Daily'      },
  { id: 'daily_century',    game: 'sudoku', emoji: '📆', title: 'Daily Centurion',    description: 'Complete 100 daily challenges',                           group: 'Daily'      },
  // ── Sudoku: Milestones extra ──────────────────────────────────────────────
  { id: 'triple_century',   game: 'sudoku', emoji: '🎗️', title: 'Triple Century',     description: 'Complete 300 Sudoku puzzles',                             group: 'Milestones' },
  // ── Sudoku: Login Streak ──────────────────────────────────────────────────
  { id: 'streak_3',         game: 'sudoku', emoji: '🔥', title: '3-Day Streak',       description: 'Log in 3 days in a row',                                  group: 'Streaks'    },
  { id: 'streak_7',         game: 'sudoku', emoji: '🌟', title: 'Week Warrior',       description: 'Log in 7 days in a row',                                  group: 'Streaks'    },
  { id: 'streak_30',        game: 'sudoku', emoji: '🏆', title: 'Monthly Master',     description: 'Log in 30 days in a row',                                 group: 'Streaks'    },

  // ── Memory Match: Volume ───────────────────────────────────────────────────
  { id: 'memory_first_win',       game: 'memory', emoji: '🃏', title: 'Card Flipper',       description: 'Complete your first Memory Match game',               group: 'Memory Milestones' },
  { id: 'memory_dedicated',       game: 'memory', emoji: '🎴', title: 'Memory Addict',      description: 'Complete 10 Memory Match games',                      group: 'Memory Milestones' },
  { id: 'memory_half_century',    game: 'memory', emoji: '🏆', title: 'Memory Champion',    description: 'Complete 50 Memory Match games',                      group: 'Memory Milestones' },
  { id: 'memory_century',         game: 'memory', emoji: '💯', title: 'Memory Century',     description: 'Complete 100 Memory Match games',                     group: 'Memory Milestones' },
  { id: 'memory_double_century',  game: 'memory', emoji: '🎖️', title: 'Memory Veteran',     description: 'Complete 200 Memory Match games',                     group: 'Memory Milestones' },
  { id: 'memory_legend',          game: 'memory', emoji: '🌟', title: 'Memory Legend',      description: 'Complete 500 Memory Match games',                     group: 'Memory Milestones' },
  // ── Memory Match: Grid Size ────────────────────────────────────────────────
  { id: 'memory_tiny',            game: 'memory', emoji: '🐣', title: 'Tiny Tiles',         description: 'Complete a 2×2 Memory Match game',                    group: 'Memory Skill'      },
  { id: 'memory_challenger',      game: 'memory', emoji: '🔲', title: 'Grid Challenger',    description: 'Complete a 6×6 Memory Match grid',                    group: 'Memory Skill'      },
  { id: 'memory_big_board',       game: 'memory', emoji: '🗺️', title: 'Big Board',          description: 'Complete an 8×8 Memory Match grid',                   group: 'Memory Skill'      },
  { id: 'memory_all_grids',       game: 'memory', emoji: '🌐', title: 'Grid Conqueror',     description: 'Complete all four Memory Match grid sizes',            group: 'Memory Skill'      },
  { id: 'memory_big_board_10',    game: 'memory', emoji: '🦁', title: 'Board Master',       description: 'Complete 10 games on the 8×8 grid',                   group: 'Memory Skill'      },
  // ── Memory Match: Speed ────────────────────────────────────────────────────
  { id: 'memory_speed_2x2',       game: 'memory', emoji: '💨', title: 'Instant Match',      description: 'Finish a 2×2 game in under 8 seconds',                group: 'Memory Skill'      },
  { id: 'memory_speed_demon',     game: 'memory', emoji: '⚡', title: 'Quick Memory',       description: 'Finish a 4×4 game in under 45 seconds',               group: 'Memory Skill'      },
  { id: 'memory_lightning',       game: 'memory', emoji: '🌩️', title: 'Memory Flash',       description: 'Finish a 4×4 game in under 25 seconds',               group: 'Memory Skill'      },
  { id: 'memory_speed_6x6',       game: 'memory', emoji: '🚀', title: 'Speed Runner',       description: 'Finish a 6×6 game in under 60 seconds',               group: 'Memory Skill'      },
  { id: 'memory_speed_8x8',       game: 'memory', emoji: '🏎️', title: 'Big Board Blitz',    description: 'Finish an 8×8 game in under 90 seconds',              group: 'Memory Skill'      },
  { id: 'memory_lightning_8x8',   game: 'memory', emoji: '☄️', title: 'Big Board Flash',    description: 'Finish an 8×8 game in under 60 seconds',              group: 'Memory Skill'      },
  // ── Memory Match: Precision ────────────────────────────────────────────────
  { id: 'memory_perfectionist',   game: 'memory', emoji: '🎯', title: 'Perfect Memory',     description: 'Complete a game with minimum possible flips',          group: 'Memory Skill'      },
  { id: 'memory_five_perfect',    game: 'memory', emoji: '🌸', title: 'Flawless Five',      description: 'Complete 5 games with minimum possible flips',         group: 'Memory Skill'      },
  // ── Memory Match: Streak ──────────────────────────────────────────────────
  { id: 'memory_streak_3',        game: 'memory', emoji: '🔥', title: 'Memory Habit',       description: 'Reach a 3-day Memory Match streak',                   group: 'Memory Daily'      },
  { id: 'memory_streak_7',        game: 'memory', emoji: '💥', title: 'Memory Streak',      description: 'Reach a 7-day Memory Match streak',                   group: 'Memory Daily'      },
  { id: 'memory_streak_30',       game: 'memory', emoji: '👑', title: 'Memory Devotee',     description: 'Reach a 30-day Memory Match streak',                  group: 'Memory Daily'      },

  // ── Jigsaw Puzzle ──────────────────────────────────────────────────────────
  { id: 'jigsaw_first_win',       game: 'jigsaw', emoji: '🧩', title: 'Piece by Piece',   description: 'Complete your first Jigsaw puzzle',                     group: 'Jigsaw Milestones' },
  { id: 'jigsaw_dedicated',       game: 'jigsaw', emoji: '🗺️', title: 'Picture Builder', description: 'Complete 10 Jigsaw puzzles',                            group: 'Jigsaw Milestones' },
  { id: 'jigsaw_quarter_century', game: 'jigsaw', emoji: '🎨', title: 'Puzzle Regular',  description: 'Complete 25 Jigsaw puzzles',                            group: 'Jigsaw Milestones' },
  { id: 'jigsaw_half_century',    game: 'jigsaw', emoji: '🏅', title: 'Gallery Keeper',  description: 'Complete 50 Jigsaw puzzles',                            group: 'Jigsaw Milestones' },
  { id: 'jigsaw_century',         game: 'jigsaw', emoji: '💯', title: 'Grand Collector', description: 'Complete 100 Jigsaw puzzles',                           group: 'Jigsaw Milestones' },
  { id: 'jigsaw_all_sizes',       game: 'jigsaw', emoji: '📐', title: 'Shape Explorer',  description: 'Complete all four Jigsaw board sizes',                  group: 'Jigsaw Skill' },
  { id: 'jigsaw_grid_veteran',    game: 'jigsaw', emoji: '🧭', title: 'Board Veteran',   description: 'Complete 10 puzzles at each Jigsaw board size',          group: 'Jigsaw Skill' },
  { id: 'jigsaw_speedster',       game: 'jigsaw', emoji: '⚡', title: 'Quick Assembly',  description: 'Finish a 2×2 Jigsaw in 30 seconds or less',             group: 'Jigsaw Skill' },
  { id: 'jigsaw_speed_3x3',       game: 'jigsaw', emoji: '💨', title: 'Swift Builder',   description: 'Finish a 3×3 Jigsaw in 60 seconds or less',             group: 'Jigsaw Skill' },
  { id: 'jigsaw_speed_4x4',       game: 'jigsaw', emoji: '🚀', title: 'Rapid Assembler', description: 'Finish a 4×4 Jigsaw in 120 seconds or less',            group: 'Jigsaw Skill' },
  { id: 'jigsaw_speed_5x5',       game: 'jigsaw', emoji: '🌠', title: 'Lightning Hands',description: 'Finish a 5×5 Jigsaw in 180 seconds or less',            group: 'Jigsaw Skill' },
  { id: 'jigsaw_advanced_10',     game: 'jigsaw', emoji: '🧠', title: 'Expert Assembler',description: 'Complete 10 level 3 Jigsaw puzzles',                    group: 'Jigsaw Skill' },
  { id: 'jigsaw_master',          game: 'jigsaw', emoji: '🏆', title: 'Puzzle Master',   description: 'Complete a level 3 puzzle on the 5×5 board',            group: 'Jigsaw Skill' },
  { id: 'jigsaw_from_memory',     game: 'jigsaw', emoji: '🧠', title: 'Picture Recall',  description: 'Complete a Jigsaw without the reference picture',       group: 'Jigsaw Skill' },
  { id: 'jigsaw_daily_7',         game: 'jigsaw', emoji: '📅', title: 'Daily Assembler', description: 'Complete 7 Jigsaw daily challenges',                     group: 'Jigsaw Daily' },
  { id: 'jigsaw_daily_30',        game: 'jigsaw', emoji: '🗓️', title: 'Daily Craft',     description: 'Complete 30 Jigsaw daily challenges',                    group: 'Jigsaw Daily' },
  { id: 'jigsaw_daily_100',       game: 'jigsaw', emoji: '🏆', title: 'Daily Master',    description: 'Complete 100 Jigsaw daily challenges',                   group: 'Jigsaw Daily' },

  // ── Word Search ───────────────────────────────────────────────────────────
  { id: 'word_search_first', game: 'word-search', emoji: '🔎', title: 'First Find', description: 'Complete your first Word Search puzzle', group: 'Word Search Milestones' },
  { id: 'word_search_10', game: 'word-search', emoji: '📚', title: 'Word Wanderer', description: 'Complete 10 Word Search puzzles', group: 'Word Search Milestones' },
  { id: 'word_search_50', game: 'word-search', emoji: '🏆', title: 'Word Search Pro', description: 'Complete 50 Word Search puzzles', group: 'Word Search Milestones' },
  { id: 'word_search_100', game: 'word-search', emoji: '🌟', title: 'Word Search Legend', description: 'Complete 100 Word Search puzzles', group: 'Word Search Milestones' },
  { id: 'word_search_all_levels', game: 'word-search', emoji: '🌈', title: 'Level Explorer', description: 'Complete a puzzle at all four difficulty levels', group: 'Word Search Skills' },
  { id: 'word_search_themes_5', game: 'word-search', emoji: '🎨', title: 'Theme Collector', description: 'Complete puzzles in 5 different themes', group: 'Word Search Skills' },
  { id: 'word_search_no_tips_10', game: 'word-search', emoji: '🧠', title: 'Sharp Eyes', description: 'Complete 10 puzzles without using a tip', group: 'Word Search Skills' },
  { id: 'word_search_speed_beginner', game: 'word-search', emoji: '🐇', title: 'Quick Finder', description: 'Finish a Beginner puzzle in under 60 seconds', group: 'Word Search Skills' },
  { id: 'word_search_speed_easy', game: 'word-search', emoji: '⚡', title: 'Fast Searcher', description: 'Finish an Easy puzzle in under 120 seconds', group: 'Word Search Skills' },
  { id: 'word_search_speed_medium', game: 'word-search', emoji: '🚀', title: 'Rapid Reader', description: 'Finish a Medium puzzle in under 300 seconds', group: 'Word Search Skills' },
  { id: 'word_search_speed_hard', game: 'word-search', emoji: '💨', title: 'Word Sprint', description: 'Finish a Hard puzzle in under 480 seconds', group: 'Word Search Skills' },
  { id: 'word_search_daily_7', game: 'word-search', emoji: '📅', title: 'Daily Finder', description: 'Complete 7 daily Word Search challenges', group: 'Word Search Daily' },
  { id: 'word_search_daily_30', game: 'word-search', emoji: '🗓️', title: 'Daily Decoder', description: 'Complete 30 daily Word Search challenges', group: 'Word Search Daily' },
  { id: 'word_search_daily_100', game: 'word-search', emoji: '🏅', title: 'Daily Word Master', description: 'Complete 100 daily Word Search challenges', group: 'Word Search Daily' },

  // ── Minesweeper ──────────────────────────────────────────────────────────
  { id: 'minesweeper_first', game: 'minesweeper', emoji: '💣', title: 'First Clear', description: 'Win your first Minesweeper game', group: 'Minesweeper Milestones' },
  { id: 'minesweeper_10', game: 'minesweeper', emoji: '🧨', title: 'Blast Radius', description: 'Win 10 Minesweeper games', group: 'Minesweeper Milestones' },
  { id: 'minesweeper_50', game: 'minesweeper', emoji: '🏆', title: 'Mine Veteran', description: 'Win 50 Minesweeper games', group: 'Minesweeper Milestones' },
  { id: 'minesweeper_100', game: 'minesweeper', emoji: '🌟', title: 'Mine Legend', description: 'Win 100 Minesweeper games', group: 'Minesweeper Milestones' },
  { id: 'minesweeper_all_levels', game: 'minesweeper', emoji: '🌈', title: 'Field Explorer', description: 'Win a game at all four board sizes', group: 'Minesweeper Skills' },
  { id: 'minesweeper_perfect_5', game: 'minesweeper', emoji: '✨', title: 'Clean Sweep', description: 'Win 5 Minesweeper games without hitting a mine', group: 'Minesweeper Skills' },
  { id: 'minesweeper_no_hints_10', game: 'minesweeper', emoji: '🧠', title: 'No Flags Needed', description: 'Win 10 Minesweeper games without using a hint', group: 'Minesweeper Skills' },
  { id: 'minesweeper_speed_beginner', game: 'minesweeper', emoji: '🐇', title: 'Quick Clear', description: 'Win a Beginner board in under 90 seconds', group: 'Minesweeper Skills' },
  { id: 'minesweeper_speed_easy', game: 'minesweeper', emoji: '⚡', title: 'Fast Sweep', description: 'Win an Easy board in under 3 minutes', group: 'Minesweeper Skills' },
  { id: 'minesweeper_speed_medium', game: 'minesweeper', emoji: '🚀', title: 'Rapid Clear', description: 'Win a Medium board in under 6 minutes', group: 'Minesweeper Skills' },
  { id: 'minesweeper_speed_hard', game: 'minesweeper', emoji: '💨', title: 'Mine Sprint', description: 'Win a Hard board in under 10 minutes', group: 'Minesweeper Skills' },
  { id: 'minesweeper_daily_7', game: 'minesweeper', emoji: '📅', title: 'Daily Sweeper', description: 'Win 7 daily Minesweeper challenges', group: 'Minesweeper Daily' },
  { id: 'minesweeper_daily_30', game: 'minesweeper', emoji: '🗓️', title: 'Daily Deminer', description: 'Win 30 daily Minesweeper challenges', group: 'Minesweeper Daily' },
  { id: 'minesweeper_daily_100', game: 'minesweeper', emoji: '🏅', title: 'Daily Mine Master', description: 'Win 100 daily Minesweeper challenges', group: 'Minesweeper Daily' },
  // ── Slide Puzzle ──────────────────────────────────────────────────────────
  { id: 'slide_puzzle_first', game: 'slide-puzzle', emoji: '🧩', title: 'First Slide', description: 'Solve your first Slide Puzzle', group: 'Slide Puzzle Milestones' },
  { id: 'slide_puzzle_10', game: 'slide-puzzle', emoji: '🔢', title: 'Sliding Regular', description: 'Solve 10 Slide Puzzles', group: 'Slide Puzzle Milestones' },
  { id: 'slide_puzzle_50', game: 'slide-puzzle', emoji: '🏆', title: 'Slide Veteran', description: 'Solve 50 Slide Puzzles', group: 'Slide Puzzle Milestones' },
  { id: 'slide_puzzle_100', game: 'slide-puzzle', emoji: '🌟', title: 'Slide Legend', description: 'Solve 100 Slide Puzzles', group: 'Slide Puzzle Milestones' },
  { id: 'slide_puzzle_all_levels', game: 'slide-puzzle', emoji: '🌈', title: 'Size Explorer', description: 'Solve a puzzle at all four board sizes', group: 'Slide Puzzle Skills' },
  { id: 'slide_puzzle_styles_3', game: 'slide-puzzle', emoji: '🎨', title: 'Style Master', description: 'Win with numbers, alphabet, and picture tiles', group: 'Slide Puzzle Skills' },
  { id: 'slide_puzzle_no_hints_10', game: 'slide-puzzle', emoji: '🧠', title: 'No Help Needed', description: 'Solve 10 Slide Puzzles without using a hint', group: 'Slide Puzzle Skills' },
  { id: 'slide_puzzle_speed_2x2', game: 'slide-puzzle', emoji: '🐇', title: 'Tiny Sprint', description: 'Solve a 2×2 puzzle in under 90 seconds', group: 'Slide Puzzle Skills' },
  { id: 'slide_puzzle_speed_3x3', game: 'slide-puzzle', emoji: '⚡', title: 'Quick Slide', description: 'Solve a 3×3 puzzle in under 5 minutes', group: 'Slide Puzzle Skills' },
  { id: 'slide_puzzle_speed_4x4', game: 'slide-puzzle', emoji: '🚀', title: 'Rapid Order', description: 'Solve a 4×4 puzzle in under 20 minutes', group: 'Slide Puzzle Skills' },
  { id: 'slide_puzzle_speed_5x5', game: 'slide-puzzle', emoji: '💨', title: 'Grand Slide', description: 'Solve a 5×5 puzzle in under 45 minutes', group: 'Slide Puzzle Skills' },
  { id: 'slide_puzzle_daily_7', game: 'slide-puzzle', emoji: '📅', title: 'Daily Slider', description: 'Solve 7 daily Slide Puzzles', group: 'Slide Puzzle Daily' },
  { id: 'slide_puzzle_daily_30', game: 'slide-puzzle', emoji: '🗓️', title: 'Daily Solver', description: 'Solve 30 daily Slide Puzzles', group: 'Slide Puzzle Daily' },
  { id: 'slide_puzzle_daily_100', game: 'slide-puzzle', emoji: '🏅', title: 'Daily Slide Master', description: 'Solve 100 daily Slide Puzzles', group: 'Slide Puzzle Daily' },

  // ── Quiz games: Science / Maths / GK each have their own set ─────────────
  ...QUIZ_SUBJECT_ACHIEVEMENTS.flatMap(({ subject, game, label }) => [
    { id: `${subject}_first`, game, emoji: '🧠', title: 'First Answer', description: `Score points in your first ${label} quiz`, group: `${label} Milestones` },
    { id: `${subject}_10`, game, emoji: '✅', title: 'Quiz Regular', description: `Score points in 10 ${label} quizzes`, group: `${label} Milestones` },
    { id: `${subject}_50`, game, emoji: '🏆', title: 'Quiz Veteran', description: `Score points in 50 ${label} quizzes`, group: `${label} Milestones` },
    { id: `${subject}_100`, game, emoji: '🌟', title: 'Quiz Legend', description: `Score points in 100 ${label} quizzes`, group: `${label} Milestones` },
    { id: `${subject}_all_levels`, game, emoji: '🌈', title: 'Level Explorer', description: `Score points at all four ${label} quiz levels`, group: `${label} Skills` },
    { id: `${subject}_perfect_5`, game, emoji: '💯', title: 'Perfect Score', description: `Answer every question correctly in 5 ${label} quizzes`, group: `${label} Skills` },
    { id: `${subject}_speed_easy`, game, emoji: '🐇', title: 'Quick Thinker', description: `Finish an Easy ${label} quiz in under 90 seconds`, group: `${label} Skills` },
    { id: `${subject}_speed_medium`, game, emoji: '⚡', title: 'Fast Facts', description: `Finish a Medium ${label} quiz in under 2.5 minutes`, group: `${label} Skills` },
    { id: `${subject}_speed_hard`, game, emoji: '🚀', title: 'Rapid Recall', description: `Finish a Hard ${label} quiz in under 3.5 minutes`, group: `${label} Skills` },
    { id: `${subject}_speed_expert`, game, emoji: '💨', title: 'Brain Sprint', description: `Finish an Expert ${label} quiz in under 4.5 minutes`, group: `${label} Skills` },
    { id: `${subject}_daily_7`, game, emoji: '📅', title: 'Daily Scholar', description: `Score points in 7 daily ${label} quizzes`, group: `${label} Daily` },
    { id: `${subject}_daily_30`, game, emoji: '🗓️', title: 'Daily Thinker', description: `Score points in 30 daily ${label} quizzes`, group: `${label} Daily` },
    { id: `${subject}_daily_100`, game, emoji: '🏅', title: 'Daily Quiz Master', description: `Score points in 100 daily ${label} quizzes`, group: `${label} Daily` },
  ] as AchievementMeta[]),
];

export interface AchievementStatus {
  unlocked: boolean;
  progress: number;
  total: number;
}

export type AchievementsData = Record<string, AchievementStatus>;
