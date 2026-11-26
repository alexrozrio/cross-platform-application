import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const memoryOrderGamesTable = pgTable("memory_order_games", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  level: text("level").notNull(),
  theme: text("theme").notNull().default("shapes"),
  /** Seed used to regenerate the sequences; lets the server re-derive answers for validation. */
  seed: integer("seed"),
  dailyDate: text("daily_date"),
  challengeId: integer("challenge_id"),
  status: text("status").notNull().default("active"),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
  questions: integer("questions").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  points: integer("points"),
  xpEarned: integer("xp_earned"),
  gemsEarned: integer("gems_earned"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("memory_order_games_profile_id_idx").on(table.profileId),
  index("memory_order_games_status_completed_at_idx").on(table.status, table.completedAt),
  index("memory_order_games_level_idx").on(table.level),
  index("memory_order_games_daily_date_idx").on(table.dailyDate),
  index("memory_order_games_challenge_id_idx").on(table.challengeId),
]);

export type MemoryOrderGame = typeof memoryOrderGamesTable.$inferSelect;

export const memoryOrderChallengesTable = pgTable("memory_order_challenges", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => profilesTable.id),
  challengedId: integer("challenged_id").notNull().references(() => profilesTable.id),
  level: text("level").notNull(),
  theme: text("theme").notNull().default("shapes"),
  seed: integer("seed").notNull(),
  status: text("status").notNull().default("pending"),
  challengerGameId: integer("challenger_game_id").references(() => memoryOrderGamesTable.id),
  challengedGameId: integer("challenged_game_id").references(() => memoryOrderGamesTable.id),
  winnerId: integer("winner_id").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  index("memory_order_challenges_challenger_id_idx").on(table.challengerId),
  index("memory_order_challenges_challenged_id_idx").on(table.challengedId),
]);

export type MemoryOrderChallenge = typeof memoryOrderChallengesTable.$inferSelect;
