import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const game2048GamesTable = pgTable("game_2048_games", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  difficulty: text("difficulty").notNull(),
  size: integer("size").notNull(),
  seed: integer("seed").notNull(),
  dailyDate: text("daily_date"),
  challengeId: integer("challenge_id"),
  status: text("status").notNull().default("active"),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
  moves: integer("moves").notNull().default(0),
  score: integer("score").notNull().default(0),
  maxTile: integer("max_tile").notNull().default(0),
  points: integer("points"),
  xpEarned: integer("xp_earned"),
  gemsEarned: integer("gems_earned"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("game_2048_games_profile_id_idx").on(table.profileId),
  index("game_2048_games_status_completed_at_idx").on(table.status, table.completedAt),
  index("game_2048_games_daily_date_idx").on(table.dailyDate),
  index("game_2048_games_challenge_id_idx").on(table.challengeId),
]);

export type Game2048Game = typeof game2048GamesTable.$inferSelect;

export const game2048ChallengesTable = pgTable("game_2048_challenges", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => profilesTable.id),
  challengedId: integer("challenged_id").notNull().references(() => profilesTable.id),
  difficulty: text("difficulty").notNull(),
  size: integer("size").notNull(),
  seed: integer("seed").notNull(),
  status: text("status").notNull().default("pending"),
  challengerGameId: integer("challenger_game_id").references(() => game2048GamesTable.id),
  challengedGameId: integer("challenged_game_id").references(() => game2048GamesTable.id),
  winnerId: integer("winner_id").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  index("game_2048_challenges_challenger_id_idx").on(table.challengerId),
  index("game_2048_challenges_challenged_id_idx").on(table.challengedId),
]);

export type Game2048Challenge = typeof game2048ChallengesTable.$inferSelect;
