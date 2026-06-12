import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  theme: text("theme").notNull().default("light"),
  highlightErrors: boolean("highlight_errors").notNull().default(true),
  showTimer: boolean("show_timer").notNull().default(true),
  gems: integer("gems").notNull().default(0),
  clerkUserId: text("clerk_user_id").unique(),
  deviceId: text("device_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, createdAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
