import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { profilesTable } from "./profiles";

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id),
  badgeType: text("badge_type").notNull(),
  tournamentPeriod: text("tournament_period").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  shareToken: text("share_token").notNull().unique(),
  awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badgesTable).omit({ id: true, awardedAt: true });
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type BadgeRow = typeof badgesTable.$inferSelect;
