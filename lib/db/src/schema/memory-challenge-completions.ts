import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const memoryChallengeCompletionsTable = pgTable("memory_challenge_completions", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profilesTable.id),
  type: text("type").notNull(),        // 'daily' | 'weekly'
  period: text("period").notNull(),    // '2026-06-24' for daily, '2026-W26' for weekly
  gridSize: integer("grid_size").notNull(),
  elapsedSeconds: integer("elapsed_seconds").notNull(),
  flips: integer("flips").notNull(),
  points: integer("points").notNull(),
  bonusXp: integer("bonus_xp").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("memory_challenge_unique").on(t.profileId, t.type, t.period),
]);

export type MemoryChallengeCompletion = typeof memoryChallengeCompletionsTable.$inferSelect;
