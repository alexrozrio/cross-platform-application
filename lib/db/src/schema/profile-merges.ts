import { pgTable, serial, integer, text, timestamp, unique, index } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const profileMergesTable = pgTable("profile_merges", {
  id: serial("id").primaryKey(),
  sourceProfileId: integer("source_profile_id").notNull().references(() => profilesTable.id),
  targetProfileId: integer("target_profile_id").notNull().references(() => profilesTable.id),
  replitUserId: text("replit_user_id").notNull(),
  xpTransferred: integer("xp_transferred").notNull().default(0),
  gemsTransferred: integer("gems_transferred").notNull().default(0),
  gamesTransferred: integer("games_transferred").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("profile_merges_source_profile_id_unique").on(table.sourceProfileId),
  unique("profile_merges_replit_user_id_unique").on(table.replitUserId),
  index("profile_merges_target_profile_id_idx").on(table.targetProfileId),
]);

export type ProfileMerge = typeof profileMergesTable.$inferSelect;
