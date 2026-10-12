import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";

export const guestProfileTransferCodesTable = pgTable(
  "guest_profile_transfer_codes",
  {
    id: serial("id").primaryKey(),
    profileId: integer("profile_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("guest_profile_transfer_codes_profile_id_idx").on(table.profileId)],
);

export type GuestProfileTransferCode = typeof guestProfileTransferCodesTable.$inferSelect;
