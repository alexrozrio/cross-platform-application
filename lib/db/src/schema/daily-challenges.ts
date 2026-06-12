import { pgTable, serial, integer, date, timestamp } from "drizzle-orm/pg-core";
import { puzzlesTable } from "./puzzles";

export const dailyChallengesTable = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  puzzleId: integer("puzzle_id").notNull().references(() => puzzlesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DailyChallenge = typeof dailyChallengesTable.$inferSelect;
