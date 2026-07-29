export interface AchievementMeta {
  id: string;
  emoji: string;
  title: string;
  description: string;
  group: string;
  game: 'sudoku' | 'memory';
}

export const ACHIEVEMENT_META: AchievementMeta[] = [
  // ── Sudoku: Volume ─────────────────────────────────────────────────────────
  { id: 'first_win',        game: 'sudoku', emoji: '🎉', title: 'First Win',         description: 'Complete your first Sudoku puzzle',                      group: 'Milestones' },
  { id: 'dedicated',        game: 'sudoku', emoji: '📚', title: 'Dedicated',          description: 'Complete 10 Sudoku puzzles',                              group: 'Milestones' },
  { id: 'half_century',     game: 'sudoku', emoji: '🎯', title: 'Half Century',       description: 'Complete 50 Sudoku puzzles',                              group: 'Milestones' },
  { id: 'century',          game: 'sudoku', emoji: '💯', title: 'Century',            description: 'Complete 100 Sudoku puzzles',                             group: 'Milestones' },
  { id: 'double_century',   game: 'sudoku', emoji: '🎖️', title: 'Double Century',     description: 'Complete 200 Sudoku puzzles',                             group: 'Milestones' },
  { id: 'legend',           game: 'sudoku', emoji: '🌟', title: 'Legend',             description: 'Complete 500 Sudoku puzzles',                             group: 'Milestones' },
  // ── Sudoku: Grid Explorer ──────────────────────────────────────────────────
  { id: 'baby_steps',       game: 'sudoku', emoji: '👶', title: 'Baby Steps',         description: 'Complete a 3×3 Baby puzzle',                              group: 'Grid Explorer' },
  { id: 'mini_master',      game: 'sudoku', emoji: '🎮', title: 'Mini Master',        description: 'Complete a 4×4 Mini puzzle',                              group: 'Grid Explorer' },
  { id: 'dual_master',      game: 'sudoku', emoji: '⚔️', title: 'Dual Master',        description: 'Complete a 6×6 Dual puzzle',                              group: 'Grid Explorer' },
  { id: 'classic_champ',    game: 'sudoku', emoji: '🏆', title: 'Classic Champ',      description: 'Complete a 9×9 Classic puzzle',                           group: 'Grid Explorer' },
  { id: 'pro_player',       game: 'sudoku', emoji: '👑', title: 'Pro Player',         description: 'Complete a 16×16 Pro puzzle',                             group: 'Grid Explorer' },
  { id: 'all_grids',        game: 'sudoku', emoji: '🗺️', title: 'World Explorer',     description: 'Complete all five grid sizes',                            group: 'Grid Explorer' },
  // ── Sudoku: Difficulty ─────────────────────────────────────────────────────
  { id: 'medium_solver',    game: 'sudoku', emoji: '🧩', title: 'Medium Solver',      description: 'Complete a Medium puzzle',                                group: 'Difficulty' },
  { id: 'hard_solver',      game: 'sudoku', emoji: '🔥', title: 'Hard Solver',        description: 'Complete a Hard puzzle',                                  group: 'Difficulty' },
  { id: 'expert_solver',    game: 'sudoku', emoji: '🏅', title: 'Expert Solver',      description: 'Complete an Expert puzzle',                               group: 'Difficulty' },
  { id: 'all_difficulties', game: 'sudoku', emoji: '🌈', title: 'All Rounder',        description: 'Complete at least one puzzle at every difficulty',        group: 'Difficulty' },
  { id: 'expert_5',         game: 'sudoku', emoji: '🥇', title: 'Expert Regular',     description: 'Complete 5 Expert puzzles',                               group: 'Difficulty' },
  { id: 'flawless_expert',  game: 'sudoku', emoji: '💎', title: 'Flawless Expert',    description: 'Complete an Expert puzzle with zero mistakes',            group: 'Difficulty' },
  { id: 'flawless_hard',    game: 'sudoku', emoji: '🔶', title: 'Iron Will',          description: 'Complete a Hard puzzle with zero mistakes',               group: 'Difficulty' },
  // ── Sudoku: Skill ──────────────────────────────────────────────────────────
  { id: 'perfectionist',    game: 'sudoku', emoji: '✨', title: 'Perfectionist',      description: 'Finish a Sudoku with zero mistakes',                      group: 'Skill'      },
  { id: 'perfectionist_5',  game: 'sudoku', emoji: '💫', title: 'Error Free',         description: 'Finish 5 puzzles with zero mistakes',                     group: 'Skill'      },
  { id: 'no_hints',         game: 'sudoku', emoji: '🧠', title: 'No Hints',           description: 'Finish a Sudoku without any hints',                       group: 'Skill'      },
  { id: 'no_hints_10',      game: 'sudoku', emoji: '🎓', title: 'Self Reliant',       description: 'Complete 10 puzzles without using any hints',             group: 'Skill'      },
  { id: 'hint_free_hard',   game: 'sudoku', emoji: '🧘', title: 'Pure Hard',          description: 'Complete a Hard puzzle without using any hints',          group: 'Skill'      },
  { id: 'hint_free_expert', game: 'sudoku', emoji: '🏹', title: 'Pure Expert',        description: 'Complete an Expert puzzle without using any hints',       group: 'Skill'      },
  { id: 'big_brain',        game: 'sudoku', emoji: '🧬', title: 'Big Brain',          description: 'Complete Expert 9×9 with zero mistakes and zero hints',   group: 'Skill'      },
  { id: 'comeback_kid',     game: 'sudoku', emoji: '🔄', title: 'Comeback Kid',       description: 'Finish a puzzle after making 2 mistakes',                 group: 'Skill'      },
  { id: 'speed_demon',      game: 'sudoku', emoji: '⚡', title: 'Speed Demon',        description: 'Finish any Sudoku in under 5 minutes',                    group: 'Skill'      },
  { id: 'lightning',        game: 'sudoku', emoji: '🌩️', title: 'Lightning',          description: 'Finish any Sudoku in under 2 minutes',                    group: 'Skill'      },
  { id: 'speed_4x4',        game: 'sudoku', emoji: '🐇', title: 'Mini Speedster',     description: 'Finish a 4×4 puzzle in under 60 seconds',                 group: 'Skill'      },
  { id: 'speed_expert',     game: 'sudoku', emoji: '🚀', title: 'Expert Sprinter',    description: 'Finish an Expert puzzle in under 10 minutes',             group: 'Skill'      },
  { id: 'speed_16x16',      game: 'sudoku', emoji: '🛸', title: 'Pro Speedrun',       description: 'Finish a 16×16 puzzle in under 15 minutes',               group: 'Skill'      },
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
];

export interface AchievementStatus {
  unlocked: boolean;
  progress: number;
  total: number;
}

export type AchievementsData = Record<string, AchievementStatus>;
