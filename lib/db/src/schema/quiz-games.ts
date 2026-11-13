import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const quizGamesTable = pgTable("quiz_games", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  subject: text("subject").notNull().default("science"),
  level: text("level").notNull(),
  dailyDate: text("daily_date"),
  /** Seed used to pick questions; lets the server re-derive answers for validation. */
  seed: integer("seed"),
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
  index("quiz_games_profile_id_idx").on(table.profileId),
  index("quiz_games_status_completed_at_idx").on(table.status, table.completedAt),
  index("quiz_games_daily_date_idx").on(table.dailyDate),
  index("quiz_games_subject_idx").on(table.subject),
  index("quiz_games_challenge_id_idx").on(table.challengeId),
]);

export type QuizGame = typeof quizGamesTable.$inferSelect;

export const quizChallengesTable = pgTable("quiz_challenges", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => profilesTable.id),
  challengedId: integer("challenged_id").notNull().references(() => profilesTable.id),
  subject: text("subject").notNull().default("science"),
  level: text("level").notNull(),
  seed: integer("seed").notNull(),
  status: text("status").notNull().default("pending"),
  challengerGameId: integer("challenger_game_id").references(() => quizGamesTable.id),
  challengedGameId: integer("challenged_game_id").references(() => quizGamesTable.id),
  winnerId: integer("winner_id").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  index("quiz_challenges_challenger_id_idx").on(table.challengerId),
  index("quiz_challenges_challenged_id_idx").on(table.challengedId),
  index("quiz_challenges_subject_idx").on(table.subject),
]);

export type QuizChallenge = typeof quizChallengesTable.$inferSelect;
