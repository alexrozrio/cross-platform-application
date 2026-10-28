import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const jigsawGamesTable = pgTable("jigsaw_games", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  gridSize: integer("grid_size").notNull(),
  level: integer("level").notNull().default(1),
  imageKey: integer("image_key").notNull().default(1),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
  moves: integer("moves").notNull().default(0),
  dailyDate: text("daily_date"),
  status: text("status").notNull().default("active"),
  points: integer("points"),
  xpEarned: integer("xp_earned"),
  gemsEarned: integer("gems_earned"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("jigsaw_games_status_completed_at_idx").on(table.status, table.completedAt),
  index("jigsaw_games_profile_id_idx").on(table.profileId),
  index("jigsaw_games_daily_date_idx").on(table.dailyDate),
]);

export const jigsawChallengesTable = pgTable("jigsaw_challenges", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => profilesTable.id),
  challengedId: integer("challenged_id").references(() => profilesTable.id),
  shareToken: text("share_token").notNull().unique(),
  gridSize: integer("grid_size").notNull(),
  level: integer("level").notNull().default(1),
  imageKey: integer("image_key").notNull().default(1),
  status: text("status").notNull().default("pending"),
  challengerGameId: integer("challenger_game_id").references(() => jigsawGamesTable.id),
  challengedGameId: integer("challenged_game_id").references(() => jigsawGamesTable.id),
  winnerId: integer("winner_id").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  index("jigsaw_challenges_challenger_id_idx").on(table.challengerId),
  index("jigsaw_challenges_challenged_id_idx").on(table.challengedId),
]);

export type JigsawGame = typeof jigsawGamesTable.$inferSelect;
export type JigsawChallenge = typeof jigsawChallengesTable.$inferSelect;
