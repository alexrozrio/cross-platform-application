import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const puzzlesTable = pgTable("puzzles", {
  id: serial("id").primaryKey(),
  difficulty: text("difficulty").notNull(),
  gridSize: integer("grid_size").notNull().default(9),
  grid: text("grid").notNull(),
  solution: text("solution").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPuzzleSchema = createInsertSchema(puzzlesTable).omit({ id: true, createdAt: true });
export type InsertPuzzle = z.infer<typeof insertPuzzleSchema>;
export type Puzzle = typeof puzzlesTable.$inferSelect;
