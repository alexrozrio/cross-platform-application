import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

// puzzle: "2x2" | "3x3" | "pyraminx" | "4x4"
// scramble: move sequence (e.g. "R U2 F' D") shared with challenges/resume
export const rubiksGamesTable = pgTable("rubiks_games", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  puzzle: text("puzzle").notNull(),
  scrambleSeed: integer("scramble_seed"),
  dailyDate: text("daily_date"),
  challengeId: integer("challenge_id"),
  status: text("status").notNull().default("active"),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
  moves: integer("moves").notNull().default(0),
  points: integer("points"),
  xpEarned: integer("xp_earned"),
  gemsEarned: integer("gems_earned"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("rubiks_games_profile_id_idx").on(table.profileId),
  index("rubiks_games_status_completed_at_idx").on(table.status, table.completedAt),
  index("rubiks_games_daily_date_idx").on(table.dailyDate),
  index("rubiks_games_challenge_id_idx").on(table.challengeId),
]);

export type RubiksGame = typeof rubiksGamesTable.$inferSelect;

export const rubiksChallengesTable = pgTable("rubiks_challenges", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => profilesTable.id),
  challengedId: integer("challenged_id").notNull().references(() => profilesTable.id),
  puzzle: text("puzzle").notNull(),
  scrambleSeed: integer("scramble_seed").notNull(),
  status: text("status").notNull().default("pending"),
  challengerGameId: integer("challenger_game_id").references(() => rubiksGamesTable.id),
  challengedGameId: integer("challenged_game_id").references(() => rubiksGamesTable.id),
  winnerId: integer("winner_id").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  index("rubiks_challenges_challenger_id_idx").on(table.challengerId),
  index("rubiks_challenges_challenged_id_idx").on(table.challengedId),
]);

export type RubiksChallenge = typeof rubiksChallengesTable.$inferSelect;
