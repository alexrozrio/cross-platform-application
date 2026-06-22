import { pgTable, serial, integer, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const unlockedItemsTable = pgTable(
  "unlocked_items",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
    itemType: varchar("item_type", { length: 50 }).notNull(),
    itemId: varchar("item_id", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("unlocked_items_profile_type_item_idx").on(t.profileId, t.itemType, t.itemId)],
);
