import { pgTable, serial, text, boolean, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  theme: text("theme").notNull().default("light"),
  imageTheme: text("image_theme").notNull().default("shapes"),
  fontTheme: text("font_theme").notNull().default("default"),
  fontSize: text("font_size").notNull().default("default"),
  backgroundEnabled: boolean("background_enabled").notNull().default(true),
  highlightErrors: boolean("highlight_errors").notNull().default(true),
  showTimer: boolean("show_timer").notNull().default(true),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  gameMode: text("game_mode").notNull().default("4all"),
  gems: integer("gems").notNull().default(0),
  clerkUserId: text("clerk_user_id").unique(),
  replitUserId: text("replit_user_id").unique(),
  deviceId: text("device_id").unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastChallengeDate: date("last_challenge_date"),
  loginStreak: integer("login_streak").notNull().default(0),
  lastLoginDate: date("last_login_date"),
  memoryStreak: integer("memory_streak").notNull().default(0),
  longestMemoryStreak: integer("longest_memory_streak").notNull().default(0),
  lastMemoryDate: date("last_memory_date"),
  xp: integer("xp").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, createdAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
