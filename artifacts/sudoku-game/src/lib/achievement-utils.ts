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
  { id: 'first_win',        game: 'sudoku', emoji: '🎉', title: 'First Win',         description: 'Complete your first Sudoku puzzle',          group: 'Milestones' },
  { id: 'dedicated',        game: 'sudoku', emoji: '📚', title: 'Dedicated',          description: 'Complete 10 Sudoku puzzles',                  group: 'Milestones' },
  { id: 'half_century',     game: 'sudoku', emoji: '🎯', title: 'Half Century',       description: 'Complete 50 Sudoku puzzles',                  group: 'Milestones' },
  { id: 'century',          game: 'sudoku', emoji: '💯', title: 'Century',            description: 'Complete 100 Sudoku puzzles',                 group: 'Milestones' },
  // ── Sudoku: Difficulty ─────────────────────────────────────────────────────
  { id: 'medium_solver',    game: 'sudoku', emoji: '🧩', title: 'Medium Solver',      description: 'Complete a Medium puzzle',                    group: 'Difficulty' },
  { id: 'hard_solver',      game: 'sudoku', emoji: '🔥', title: 'Hard Solver',        description: 'Complete a Hard puzzle',                      group: 'Difficulty' },
  { id: 'expert_solver',    game: 'sudoku', emoji: '🏅', title: 'Expert Solver',      description: 'Complete an Expert puzzle',                   group: 'Difficulty' },
  // ── Sudoku: Skill ──────────────────────────────────────────────────────────
  { id: 'perfectionist',    game: 'sudoku', emoji: '✨', title: 'Perfectionist',      description: 'Finish a Sudoku with zero mistakes',          group: 'Skill'      },
  { id: 'no_hints',         game: 'sudoku', emoji: '🧠', title: 'No Hints',           description: 'Finish a Sudoku without any hints',           group: 'Skill'      },
  { id: 'speed_demon',      game: 'sudoku', emoji: '⚡', title: 'Speed Demon',        description: 'Finish any Sudoku in under 5 minutes',        group: 'Skill'      },
  { id: 'lightning',        game: 'sudoku', emoji: '🌩️', title: 'Lightning',          description: 'Finish any Sudoku in under 2 minutes',        group: 'Skill'      },
  // ── Sudoku: Daily ──────────────────────────────────────────────────────────
  { id: 'daily_devotion',   game: 'sudoku', emoji: '📅', title: 'Daily Devotion',     description: 'Complete 7 daily challenges',                 group: 'Daily'      },
  { id: 'daily_faithful',   game: 'sudoku', emoji: '🗓️', title: 'Daily Faithful',     description: 'Complete 30 daily challenges',                group: 'Daily'      },

  // ── Memory Match: Volume ───────────────────────────────────────────────────
  { id: 'memory_first_win',     game: 'memory', emoji: '🃏', title: 'Card Flipper',       description: 'Complete your first Memory Match game',       group: 'Memory Milestones' },
  { id: 'memory_dedicated',     game: 'memory', emoji: '🎴', title: 'Memory Addict',      description: 'Complete 10 Memory Match games',              group: 'Memory Milestones' },
  { id: 'memory_half_century',  game: 'memory', emoji: '🏆', title: 'Memory Champion',    description: 'Complete 50 Memory Match games',              group: 'Memory Milestones' },
  // ── Memory Match: Grid Size ────────────────────────────────────────────────
  { id: 'memory_challenger',    game: 'memory', emoji: '🔲', title: 'Grid Challenger',    description: 'Complete a 6×6 Memory Match grid',            group: 'Memory Skill'      },
  { id: 'memory_big_board',     game: 'memory', emoji: '🗺️', title: 'Big Board',          description: 'Complete an 8×8 Memory Match grid',           group: 'Memory Skill'      },
  // ── Memory Match: Speed ────────────────────────────────────────────────────
  { id: 'memory_speed_demon',   game: 'memory', emoji: '⚡', title: 'Quick Memory',       description: 'Finish a 4×4 game in under 45 seconds',       group: 'Memory Skill'      },
  { id: 'memory_lightning',     game: 'memory', emoji: '🌩️', title: 'Memory Flash',       description: 'Finish a 4×4 game in under 25 seconds',       group: 'Memory Skill'      },
  // ── Memory Match: Precision ────────────────────────────────────────────────
  { id: 'memory_perfectionist', game: 'memory', emoji: '🎯', title: 'Perfect Memory',     description: 'Complete a game with minimum possible flips',  group: 'Memory Skill'      },
  // ── Memory Match: Streak ──────────────────────────────────────────────────
  { id: 'memory_streak_7',      game: 'memory', emoji: '🔥', title: 'Memory Streak',      description: 'Reach a 7-day Memory Match streak',           group: 'Memory Daily'      },
];

export interface AchievementStatus {
  unlocked: boolean;
  progress: number;
  total: number;
}

export type AchievementsData = Record<string, AchievementStatus>;
