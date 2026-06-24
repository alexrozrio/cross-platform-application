export interface AchievementMeta {
  id: string;
  emoji: string;
  title: string;
  description: string;
  group: string;
}

export const ACHIEVEMENT_META: AchievementMeta[] = [
  // Volume
  { id: 'first_win',     emoji: '🎉', title: 'First Win',       description: 'Complete your first puzzle',         group: 'Milestones' },
  { id: 'dedicated',     emoji: '📚', title: 'Dedicated',        description: 'Complete 10 puzzles',                group: 'Milestones' },
  { id: 'half_century',  emoji: '🎯', title: 'Half Century',     description: 'Complete 50 puzzles',                group: 'Milestones' },
  { id: 'century',       emoji: '💯', title: 'Century',          description: 'Complete 100 puzzles',               group: 'Milestones' },
  // Difficulty
  { id: 'medium_solver', emoji: '🧩', title: 'Medium Solver',    description: 'Complete a Medium puzzle',           group: 'Difficulty' },
  { id: 'hard_solver',   emoji: '🔥', title: 'Hard Solver',      description: 'Complete a Hard puzzle',             group: 'Difficulty' },
  { id: 'expert_solver', emoji: '🏅', title: 'Expert Solver',    description: 'Complete an Expert puzzle',          group: 'Difficulty' },
  // Skill
  { id: 'perfectionist', emoji: '✨', title: 'Perfectionist',    description: 'Finish a puzzle with zero mistakes', group: 'Skill'      },
  { id: 'no_hints',      emoji: '🧠', title: 'No Hints',         description: 'Finish a puzzle without any hints',  group: 'Skill'      },
  { id: 'speed_demon',   emoji: '⚡', title: 'Speed Demon',      description: 'Finish any puzzle in under 5 min',   group: 'Skill'      },
  { id: 'lightning',     emoji: '🌩️', title: 'Lightning',        description: 'Finish any puzzle in under 2 min',   group: 'Skill'      },
  // Daily
  { id: 'daily_devotion',emoji: '📅', title: 'Daily Devotion',   description: 'Complete 7 daily challenges',        group: 'Daily'      },
  { id: 'daily_faithful',emoji: '🗓️', title: 'Daily Faithful',   description: 'Complete 30 daily challenges',       group: 'Daily'      },
];

export interface AchievementStatus {
  unlocked: boolean;
  progress: number;
  total: number;
}

export type AchievementsData = Record<string, AchievementStatus>;
