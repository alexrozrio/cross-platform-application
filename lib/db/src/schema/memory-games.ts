import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const memoryGamesTable = pgTable("memory_games", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  gridSize: integer("grid_size").notNull().default(4),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
  flips: integer("flips").notNull().default(0),
  status: text("status").notNull().default("active"),
  points: integer("points"),
  xpEarned: integer("xp_earned"),
  gemsEarned: integer("gems_earned"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("memory_games_status_completed_at_idx").on(table.status, table.completedAt),
  index("memory_games_profile_id_idx").on(table.profileId),
]);

export type MemoryGame = typeof memoryGamesTable.$inferSelect;
