import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";
import { puzzlesTable } from "./puzzles";
import { gamesTable } from "./games";

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  challengerId: integer("challenger_id").notNull().references(() => profilesTable.id),
  challengedId: integer("challenged_id").notNull().references(() => profilesTable.id),
  puzzleId: integer("puzzle_id").notNull().references(() => puzzlesTable.id),
  status: text("status").notNull().default("pending"),
  challengerGameId: integer("challenger_game_id").references(() => gamesTable.id),
  challengedGameId: integer("challenged_game_id").references(() => gamesTable.id),
  winnerId: integer("winner_id").references(() => profilesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertChallengeSchema = createInsertSchema(challengesTable).omit({ id: true, createdAt: true });
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challengesTable.$inferSelect;
