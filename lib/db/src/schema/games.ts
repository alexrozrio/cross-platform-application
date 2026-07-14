import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";
import { puzzlesTable } from "./puzzles";

export const gamesTable = pgTable("games", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  puzzleId: integer("puzzle_id").notNull().references(() => puzzlesTable.id),
  status: text("status").notNull().default("active"),
  currentGrid: text("current_grid").notNull(),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
  mistakeCount: integer("mistake_count").notNull().default(0),
  hintsUsed: integer("hints_used").notNull().default(0),
  points: integer("points"),
  xpEarned: integer("xp_earned"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // Leaderboard/tournament queries filter on status + completedAt range and
  // group by profileId — these indexes keep those aggregations fast as the
  // games table grows instead of forcing a full table scan.
  index("games_status_completed_at_idx").on(table.status, table.completedAt),
  index("games_profile_id_idx").on(table.profileId),
]);

export const insertGameSchema = createInsertSchema(gamesTable).omit({ id: true, createdAt: true });
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof gamesTable.$inferSelect;
