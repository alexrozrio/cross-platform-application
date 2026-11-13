import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const minesweeperGamesTable = pgTable("minesweeper_games", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  difficulty: text("difficulty").notNull(),
  dailyDate: text("daily_date"),
  challengeId: integer("challenge_id"),
  status: text("status").notNull().default("active"),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
  mistakes: integer("mistakes").notNull().default(0),
  hintsUsed: integer("hints_used").notNull().default(0),
  points: integer("points"),
  xpEarned: integer("xp_earned"),
  gemsEarned: integer("gems_earned"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("minesweeper_games_profile_id_idx").on(table.profileId),
  index("minesweeper_games_status_completed_at_idx").on(table.status, table.completedAt),
  index("minesweeper_games_daily_date_idx").on(table.dailyDate),
  index("minesweeper_games_challenge_id_idx").on(table.challengeId),
]);

export type MinesweeperGame = typeof minesweeperGamesTable.$inferSelect;

export const minesweeperChallengesTable = pgTable("minesweeper_challenges", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => profilesTable.id),
  challengedId: integer("challenged_id").notNull().references(() => profilesTable.id),
  difficulty: text("difficulty").notNull(),
  seed: integer("seed").notNull(),
  status: text("status").notNull().default("pending"),
  challengerGameId: integer("challenger_game_id").references(() => minesweeperGamesTable.id),
  challengedGameId: integer("challenged_game_id").references(() => minesweeperGamesTable.id),
  winnerId: integer("winner_id").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  index("minesweeper_challenges_challenger_id_idx").on(table.challengerId),
  index("minesweeper_challenges_challenged_id_idx").on(table.challengedId),
]);

export type MinesweeperChallenge = typeof minesweeperChallengesTable.$inferSelect;
