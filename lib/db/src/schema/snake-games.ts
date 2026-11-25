import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const snakeGamesTable = pgTable("snake_games", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  difficulty: text("difficulty").notNull(),
  foods: integer("foods").notNull().default(0),
  foodEaten: integer("food_eaten").notNull().default(0),
  moves: integer("moves").notNull().default(0),
  seed: integer("seed").notNull(),
  dailyDate: text("daily_date"),
  challengeId: integer("challenge_id"),
  status: text("status").notNull().default("active"),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
  score: integer("score").notNull().default(0),
  points: integer("points"),
  xpEarned: integer("xp_earned"),
  gemsEarned: integer("gems_earned"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("snake_games_profile_id_idx").on(table.profileId),
  index("snake_games_status_completed_at_idx").on(table.status, table.completedAt),
  index("snake_games_daily_date_idx").on(table.dailyDate),
  index("snake_games_challenge_id_idx").on(table.challengeId),
]);

export type SnakeGame = typeof snakeGamesTable.$inferSelect;

export const snakeChallengesTable = pgTable("snake_challenges", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => profilesTable.id),
  challengedId: integer("challenged_id").notNull().references(() => profilesTable.id),
  difficulty: text("difficulty").notNull(),
  foods: integer("foods").notNull().default(0),
  seed: integer("seed").notNull(),
  status: text("status").notNull().default("pending"),
  challengerGameId: integer("challenger_game_id").references(() => snakeGamesTable.id),
  challengedGameId: integer("challenged_game_id").references(() => snakeGamesTable.id),
  winnerId: integer("winner_id").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  index("snake_challenges_challenger_id_idx").on(table.challengerId),
  index("snake_challenges_challenged_id_idx").on(table.challengedId),
]);

export type SnakeChallenge = typeof snakeChallengesTable.$inferSelect;
