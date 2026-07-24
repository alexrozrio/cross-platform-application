import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";
import { memoryGamesTable } from "./memory-games";

export const memoryDuelsTable = pgTable("memory_duels", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => profilesTable.id),
  challengedId: integer("challenged_id").references(() => profilesTable.id),
  shareToken: text("share_token").unique(),
  gridSize: integer("grid_size").notNull().default(4),
  status: text("status").notNull().default("pending"),
  challengerGameId: integer("challenger_game_id").references(() => memoryGamesTable.id),
  challengedGameId: integer("challenged_game_id").references(() => memoryGamesTable.id),
  winnerId: integer("winner_id").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MemoryDuel = typeof memoryDuelsTable.$inferSelect;
